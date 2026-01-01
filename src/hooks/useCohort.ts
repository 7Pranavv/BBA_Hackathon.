import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Cohort = Database['public']['Tables']['cohorts']['Row'];
type CohortMember = Database['public']['Tables']['cohort_members']['Row'];
type CohortActivity = Database['public']['Tables']['cohort_activities']['Row'];
type LeaderboardEntry = Database['public']['Tables']['cohort_leaderboard']['Row'];

interface CohortWithTier extends Cohort {
  tier?: { name: string } | null;
}

interface CohortState {
  availableCohorts: CohortWithTier[];
  myCohort: CohortWithTier | null;
  myMembership: CohortMember | null;
  members: (CohortMember & { profile?: { display_name: string; avatar_url: string } })[];
  activities: CohortActivity[];
  leaderboard: (LeaderboardEntry & { profile?: { display_name: string; avatar_url: string } })[];
  loading: boolean;
}

export function useCohort() {
  const { user } = useAuth();
  const [state, setState] = useState<CohortState>({
    availableCohorts: [],
    myCohort: null,
    myMembership: null,
    members: [],
    activities: [],
    leaderboard: [],
    loading: true,
  });

  useEffect(() => {
    if (user) {
      loadCohortData();
    }
  }, [user]);

  const loadCohortData = async () => {
    if (!user) return;

    const { data: membership } = await supabase
      .from('cohort_members')
      .select('*')
      .eq('user_id', user.id)
      .eq('completion_status', 'active')
      .maybeSingle();

    let myCohort: CohortWithTier | null = null;
    let members: any[] = [];
    let activities: CohortActivity[] = [];
    let leaderboard: any[] = [];

    if (membership) {
      const { data: cohort } = await supabase
        .from('cohorts')
        .select('*, tier:subscription_tiers(name)')
        .eq('id', membership.cohort_id)
        .maybeSingle();

      myCohort = cohort as CohortWithTier;

      const { data: cohortMembers } = await supabase
        .from('cohort_members')
        .select('*, profile:user_profiles(display_name, avatar_url)')
        .eq('cohort_id', membership.cohort_id)
        .eq('completion_status', 'active');

      members = cohortMembers || [];

      const { data: cohortActivities } = await supabase
        .from('cohort_activities')
        .select('*')
        .eq('cohort_id', membership.cohort_id)
        .order('created_at', { ascending: false });

      activities = cohortActivities || [];

      const weekStart = getWeekStart();
      const { data: weekLeaderboard } = await supabase
        .from('cohort_leaderboard')
        .select('*, profile:user_profiles(display_name, avatar_url)')
        .eq('cohort_id', membership.cohort_id)
        .eq('week_start', weekStart)
        .order('points', { ascending: false })
        .limit(10);

      leaderboard = weekLeaderboard || [];
    }

    const { data: availableCohorts } = await supabase
      .from('cohorts')
      .select('*, tier:subscription_tiers(name)')
      .in('status', ['upcoming', 'active'])
      .order('start_date');

    setState({
      availableCohorts: (availableCohorts as CohortWithTier[]) || [],
      myCohort,
      myMembership: membership,
      members,
      activities,
      leaderboard,
      loading: false,
    });
  };

  const joinCohort = async (cohortId: string) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const cohort = state.availableCohorts.find(c => c.id === cohortId);
      if (!cohort) return { success: false, error: 'Cohort not found' };

      if (cohort.current_members >= cohort.max_members) {
        return { success: false, error: 'Cohort is full' };
      }

      const { error } = await supabase
        .from('cohort_members')
        .insert({
          cohort_id: cohortId,
          user_id: user.id,
          role: 'member',
        });

      if (error) throw error;

      await supabase
        .from('cohorts')
        .update({ current_members: cohort.current_members + 1 })
        .eq('id', cohortId);

      await loadCohortData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const leaveCohort = async () => {
    if (!user || !state.myMembership) {
      return { success: false, error: 'Not in a cohort' };
    }

    try {
      const { error } = await supabase
        .from('cohort_members')
        .update({
          completion_status: 'dropped',
          left_at: new Date().toISOString(),
        })
        .eq('id', state.myMembership.id);

      if (error) throw error;

      if (state.myCohort) {
        await supabase
          .from('cohorts')
          .update({ current_members: Math.max(0, state.myCohort.current_members - 1) })
          .eq('id', state.myCohort.id);
      }

      await loadCohortData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return {
    ...state,
    joinCohort,
    leaveCohort,
    refresh: loadCohortData,
    isInCohort: !!state.myMembership,
  };
}

function getWeekStart(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
}
