import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function useUserProfile() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const createProfileIfNotExists = async () => {
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (!existingProfile) {
        await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            display_name: user.email?.split('@')[0] || 'User',
            last_activity_date: new Date().toISOString().split('T')[0],
          });
      } else {
        await supabase
          .from('user_profiles')
          .update({
            last_activity_date: new Date().toISOString().split('T')[0],
          })
          .eq('id', user.id);
      }
    };

    createProfileIfNotExists();
  }, [user]);
}
