import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type SubscriptionTier = Database['public']['Tables']['subscription_tiers']['Row'];
type UserSubscription = Database['public']['Tables']['user_subscriptions']['Row'];

interface SubscriptionState {
  tiers: SubscriptionTier[];
  currentSubscription: (UserSubscription & { tier: SubscriptionTier }) | null;
  isSubscribed: boolean;
  tierName: string | null;
  loading: boolean;
  error: string | null;
}

export function useSubscription() {
  const { user } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    tiers: [],
    currentSubscription: null,
    isSubscribed: false,
    tierName: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (user) {
      loadSubscriptionData();
    } else {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [user]);

  const loadSubscriptionData = async () => {
    if (!user) return;

    try {
      const { data: tiers } = await supabase
        .from('subscription_tiers')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('*, tier:subscription_tiers(*)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setState({
        tiers: tiers || [],
        currentSubscription: subscription as any,
        isSubscribed: !!subscription,
        tierName: subscription?.tier?.name || null,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load subscription data',
      }));
    }
  };

  const subscribe = async (tierId: string) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const tier = state.tiers.find(t => t.id === tierId);
      if (!tier) return { success: false, error: 'Invalid tier' };

      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      const { data: transaction, error: txError } = await supabase
        .from('payment_transactions')
        .insert({
          user_id: user.id,
          amount_inr: tier.price_inr,
          payment_type: 'subscription',
          status: 'completed',
          metadata: { tier_id: tierId, tier_name: tier.name },
        })
        .select()
        .single();

      if (txError) throw txError;

      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          tier_id: tierId,
          status: 'active',
          expires_at: expiresAt.toISOString(),
          auto_renew: true,
        })
        .select('*, tier:subscription_tiers(*)')
        .single();

      if (subError) throw subError;

      await supabase
        .from('payment_transactions')
        .update({ subscription_id: subscription.id })
        .eq('id', transaction.id);

      setState(prev => ({
        ...prev,
        currentSubscription: subscription as any,
        isSubscribed: true,
        tierName: tier.name,
      }));

      return { success: true, subscription };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const cancelSubscription = async () => {
    if (!user || !state.currentSubscription) {
      return { success: false, error: 'No active subscription' };
    }

    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          auto_renew: false,
        })
        .eq('id', state.currentSubscription.id);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        currentSubscription: prev.currentSubscription
          ? { ...prev.currentSubscription, status: 'cancelled', auto_renew: false }
          : null,
      }));

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const hasFeature = (featureKey: string): boolean => {
    if (!state.isSubscribed || !state.tierName) return false;

    const basicFeatures = ['daily_goals', 'streak_protection_basic'];
    const proFeatures = [...basicFeatures, 'cohort_access', 'priority_support', 'streak_protection_full'];

    if (state.tierName === 'Pro') {
      return proFeatures.includes(featureKey);
    }
    if (state.tierName === 'Basic') {
      return basicFeatures.includes(featureKey);
    }
    return false;
  };

  return {
    ...state,
    subscribe,
    cancelSubscription,
    hasFeature,
    refresh: loadSubscriptionData,
  };
}
