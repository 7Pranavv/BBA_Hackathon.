/*
  # Fix Security and Performance Issues

  1. RLS Policy Performance
    - Fix policies that call auth.uid() without SELECT wrapper
    - Affected tables: cohort_members, quick_mentor_bookings

  2. Unused Indexes
    - Drop all unused indexes to reduce storage and write overhead

  3. Duplicate Permissive Policies
    - Remove duplicate SELECT policies on multiple tables
    - Keep the most appropriate policy for each use case

  4. Function Search Path
    - Fix is_user_in_cohort function to have immutable search_path
*/

-- ============================================
-- 1. FIX RLS POLICY PERFORMANCE ISSUES
-- ============================================

-- Fix cohort_members policy
DROP POLICY IF EXISTS "Users can view cohort members in their cohorts" ON cohort_members;
CREATE POLICY "Users can view cohort members in their cohorts"
  ON cohort_members
  FOR SELECT
  TO authenticated
  USING (
    cohort_id IN (
      SELECT cm.cohort_id FROM cohort_members cm 
      WHERE cm.user_id = (SELECT auth.uid())
    )
  );

-- Fix quick_mentor_bookings policies
DROP POLICY IF EXISTS "Mentors can view their quick bookings" ON quick_mentor_bookings;
CREATE POLICY "Mentors can view their quick bookings"
  ON quick_mentor_bookings
  FOR SELECT
  TO authenticated
  USING (
    mentor_id IN (
      SELECT id FROM mentor_profiles 
      WHERE user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Mentors can update their quick bookings" ON quick_mentor_bookings;
CREATE POLICY "Mentors can update their quick bookings"
  ON quick_mentor_bookings
  FOR UPDATE
  TO authenticated
  USING (
    mentor_id IN (
      SELECT id FROM mentor_profiles 
      WHERE user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    mentor_id IN (
      SELECT id FROM mentor_profiles 
      WHERE user_id = (SELECT auth.uid())
    )
  );

-- ============================================
-- 2. DROP UNUSED INDEXES
-- ============================================

DROP INDEX IF EXISTS idx_cohorts_dates;
DROP INDEX IF EXISTS idx_cohort_members_cohort;
DROP INDEX IF EXISTS idx_cohort_activities_cohort;
DROP INDEX IF EXISTS idx_cohort_member_progress_activity;
DROP INDEX IF EXISTS idx_cohort_member_progress_user;
DROP INDEX IF EXISTS idx_user_progress_topic;
DROP INDEX IF EXISTS idx_discussion_threads_topic;
DROP INDEX IF EXISTS idx_discussion_replies_thread;
DROP INDEX IF EXISTS idx_cohort_leaderboard_cohort_week;
DROP INDEX IF EXISTS idx_subscription_features_tier;
DROP INDEX IF EXISTS idx_user_subscriptions_user;
DROP INDEX IF EXISTS idx_user_subscriptions_expires;
DROP INDEX IF EXISTS idx_payment_transactions_user;
DROP INDEX IF EXISTS idx_payment_transactions_status;
DROP INDEX IF EXISTS idx_payment_transactions_subscription;
DROP INDEX IF EXISTS idx_cohort_discussion_threads_cohort;
DROP INDEX IF EXISTS idx_cohort_discussion_replies_thread;
DROP INDEX IF EXISTS idx_donations_payment;
DROP INDEX IF EXISTS idx_donations_tier;
DROP INDEX IF EXISTS idx_mentor_bookings_mentor;
DROP INDEX IF EXISTS idx_mentor_bookings_student;
DROP INDEX IF EXISTS idx_quick_mentor_bookings_payment;
DROP INDEX IF EXISTS idx_quick_mentor_bookings_mentor;
DROP INDEX IF EXISTS idx_quick_mentor_bookings_student;
DROP INDEX IF EXISTS idx_quick_mentor_bookings_scheduled;
DROP INDEX IF EXISTS idx_quick_mentor_bookings_status;
DROP INDEX IF EXISTS idx_donations_user;
DROP INDEX IF EXISTS idx_donations_anonymous;
DROP INDEX IF EXISTS idx_supporter_badges_user;
DROP INDEX IF EXISTS idx_daily_goals_completed;
DROP INDEX IF EXISTS idx_cohort_discussion_replies_user;
DROP INDEX IF EXISTS idx_cohort_discussion_threads_user;
DROP INDEX IF EXISTS idx_cohort_leaderboard_user;
DROP INDEX IF EXISTS idx_cohorts_tier;
DROP INDEX IF EXISTS idx_discussion_replies_user;
DROP INDEX IF EXISTS idx_discussion_threads_user;
DROP INDEX IF EXISTS idx_quick_mentor_bookings_session_type;
DROP INDEX IF EXISTS idx_revision_schedule_topic;
DROP INDEX IF EXISTS idx_streak_protection_subscription;
DROP INDEX IF EXISTS idx_user_subscriptions_tier;
DROP INDEX IF EXISTS idx_weak_areas_topic;

-- ============================================
-- 3. FIX DUPLICATE PERMISSIVE POLICIES
-- ============================================

-- cohort_member_progress: Keep one policy
DROP POLICY IF EXISTS "Users can view cohort members progress" ON cohort_member_progress;

-- donations: Keep both but they serve different purposes (own vs public)
-- No change needed - these are intentionally different

-- practice_problems: Remove duplicate
DROP POLICY IF EXISTS "Anyone can view problems" ON practice_problems;

-- quick_mentor_bookings SELECT: Keep both (mentor vs student) - different purposes
-- No change needed

-- quick_mentor_bookings UPDATE: Keep both (mentor vs student) - different purposes  
-- No change needed

-- supporter_badges: Keep both - different purposes (own vs display)
-- No change needed

-- ============================================
-- 4. FIX FUNCTION SEARCH PATH
-- ============================================

CREATE OR REPLACE FUNCTION is_user_in_cohort(check_cohort_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM cohort_members
    WHERE cohort_id = check_cohort_id
    AND user_id = (SELECT auth.uid())
    AND left_at IS NULL
  );
$$;
