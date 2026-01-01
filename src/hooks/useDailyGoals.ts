import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type DailyGoal = Database['public']['Tables']['daily_goals']['Row'];

interface DailyGoalsState {
  goals: DailyGoal[];
  completedCount: number;
  totalCount: number;
  streakProtected: boolean;
  loading: boolean;
}

export function useDailyGoals() {
  const { user } = useAuth();
  const [state, setState] = useState<DailyGoalsState>({
    goals: [],
    completedCount: 0,
    totalCount: 0,
    streakProtected: false,
    loading: true,
  });

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (user) {
      loadDailyGoals();
    }
  }, [user]);

  const loadDailyGoals = async () => {
    if (!user) return;

    const { data: goals } = await supabase
      .from('daily_goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('goal_date', today)
      .order('created_at');

    const { data: protection } = await supabase
      .from('streak_protection_log')
      .select('id')
      .eq('user_id', user.id)
      .eq('protected_date', today)
      .maybeSingle();

    const goalsArray = goals || [];
    setState({
      goals: goalsArray,
      completedCount: goalsArray.filter(g => g.is_completed).length,
      totalCount: goalsArray.length,
      streakProtected: !!protection,
      loading: false,
    });
  };

  const generateDailyGoals = async () => {
    if (!user) return;

    const { data: weakAreas } = await supabase
      .from('weak_areas')
      .select('topic_id')
      .eq('user_id', user.id)
      .is('resolved_at', null)
      .limit(1);

    const { data: revisionDue } = await supabase
      .from('revision_schedule')
      .select('topic_id')
      .eq('user_id', user.id)
      .lte('next_review_date', today)
      .limit(1);

    const goalsToCreate: Partial<DailyGoal>[] = [
      {
        user_id: user.id,
        goal_date: today,
        goal_type: 'learning_minutes',
        target_value: 30,
        points_earned: 10,
      },
      {
        user_id: user.id,
        goal_date: today,
        goal_type: 'solve_problems',
        target_value: 2,
        points_earned: 15,
      },
    ];

    if (weakAreas && weakAreas.length > 0) {
      goalsToCreate.push({
        user_id: user.id,
        goal_date: today,
        goal_type: 'practice_weak_area',
        target_id: weakAreas[0].topic_id,
        target_value: 1,
        points_earned: 20,
      });
    }

    if (revisionDue && revisionDue.length > 0) {
      goalsToCreate.push({
        user_id: user.id,
        goal_date: today,
        goal_type: 'review_topic',
        target_id: revisionDue[0].topic_id,
        target_value: 1,
        points_earned: 15,
      });
    }

    for (const goal of goalsToCreate) {
      await supabase
        .from('daily_goals')
        .upsert(goal, { onConflict: 'user_id,goal_date,goal_type,target_id' });
    }

    await loadDailyGoals();
  };

  const updateGoalProgress = async (goalId: string, newValue: number) => {
    if (!user) return;

    const goal = state.goals.find(g => g.id === goalId);
    if (!goal) return;

    const isCompleted = newValue >= goal.target_value;

    await supabase
      .from('daily_goals')
      .update({
        current_value: newValue,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
      })
      .eq('id', goalId);

    await loadDailyGoals();
  };

  const completeGoal = async (goalId: string) => {
    if (!user) return;

    const goal = state.goals.find(g => g.id === goalId);
    if (!goal) return;

    await supabase
      .from('daily_goals')
      .update({
        current_value: goal.target_value,
        is_completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq('id', goalId);

    await loadDailyGoals();
  };

  const useStreakProtection = async (subscriptionId: string) => {
    if (!user) return { success: false };

    const { error } = await supabase
      .from('streak_protection_log')
      .insert({
        user_id: user.id,
        protected_date: today,
        subscription_id: subscriptionId,
      });

    if (!error) {
      setState(prev => ({ ...prev, streakProtected: true }));
      return { success: true };
    }

    return { success: false };
  };

  return {
    ...state,
    generateDailyGoals,
    updateGoalProgress,
    completeGoal,
    useStreakProtection,
    refresh: loadDailyGoals,
  };
}
