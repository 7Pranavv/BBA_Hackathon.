/*
  # Add Foreign Key Indexes and Fix Remaining Issues

  1. Foreign Key Indexes
    - Add covering indexes for all foreign keys to improve JOIN performance
    - Prevents full table scans when referential integrity is checked

  2. Function Search Path
    - Re-apply immutable search_path fix for is_user_in_cohort function

  3. Multiple Permissive Policies
    - Consolidate duplicate policies where appropriate
*/

-- ============================================
-- 1. ADD FOREIGN KEY INDEXES
-- ============================================

-- cohort_activities
CREATE INDEX IF NOT EXISTS idx_cohort_activities_cohort_id 
  ON cohort_activities(cohort_id);

-- cohort_discussion_replies
CREATE INDEX IF NOT EXISTS idx_cohort_discussion_replies_thread_id 
  ON cohort_discussion_replies(thread_id);
CREATE INDEX IF NOT EXISTS idx_cohort_discussion_replies_user_id 
  ON cohort_discussion_replies(user_id);

-- cohort_discussion_threads
CREATE INDEX IF NOT EXISTS idx_cohort_discussion_threads_cohort_id 
  ON cohort_discussion_threads(cohort_id);
CREATE INDEX IF NOT EXISTS idx_cohort_discussion_threads_user_id 
  ON cohort_discussion_threads(user_id);

-- cohort_leaderboard
CREATE INDEX IF NOT EXISTS idx_cohort_leaderboard_user_id 
  ON cohort_leaderboard(user_id);

-- cohort_member_progress
CREATE INDEX IF NOT EXISTS idx_cohort_member_progress_user_id 
  ON cohort_member_progress(user_id);

-- cohorts
CREATE INDEX IF NOT EXISTS idx_cohorts_subscription_tier_required 
  ON cohorts(subscription_tier_required);

-- discussion_replies
CREATE INDEX IF NOT EXISTS idx_discussion_replies_thread_id 
  ON discussion_replies(thread_id);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_user_id 
  ON discussion_replies(user_id);

-- discussion_threads
CREATE INDEX IF NOT EXISTS idx_discussion_threads_topic_id 
  ON discussion_threads(topic_id);
CREATE INDEX IF NOT EXISTS idx_discussion_threads_user_id 
  ON discussion_threads(user_id);

-- donations
CREATE INDEX IF NOT EXISTS idx_donations_payment_transaction_id 
  ON donations(payment_transaction_id);
CREATE INDEX IF NOT EXISTS idx_donations_tier_id 
  ON donations(tier_id);
CREATE INDEX IF NOT EXISTS idx_donations_user_id 
  ON donations(user_id);

-- mentor_bookings
CREATE INDEX IF NOT EXISTS idx_mentor_bookings_mentor_id 
  ON mentor_bookings(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_bookings_student_id 
  ON mentor_bookings(student_id);

-- payment_transactions
CREATE INDEX IF NOT EXISTS idx_payment_transactions_subscription_id 
  ON payment_transactions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id 
  ON payment_transactions(user_id);

-- quick_mentor_bookings
CREATE INDEX IF NOT EXISTS idx_quick_mentor_bookings_mentor_id 
  ON quick_mentor_bookings(mentor_id);
CREATE INDEX IF NOT EXISTS idx_quick_mentor_bookings_payment_transaction_id 
  ON quick_mentor_bookings(payment_transaction_id);
CREATE INDEX IF NOT EXISTS idx_quick_mentor_bookings_session_type_id 
  ON quick_mentor_bookings(session_type_id);
CREATE INDEX IF NOT EXISTS idx_quick_mentor_bookings_student_id 
  ON quick_mentor_bookings(student_id);

-- revision_schedule
CREATE INDEX IF NOT EXISTS idx_revision_schedule_topic_id 
  ON revision_schedule(topic_id);

-- streak_protection_log
CREATE INDEX IF NOT EXISTS idx_streak_protection_log_subscription_id 
  ON streak_protection_log(subscription_id);

-- user_progress
CREATE INDEX IF NOT EXISTS idx_user_progress_topic_id 
  ON user_progress(topic_id);

-- user_subscriptions
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_tier_id 
  ON user_subscriptions(tier_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id 
  ON user_subscriptions(user_id);

-- weak_areas
CREATE INDEX IF NOT EXISTS idx_weak_areas_topic_id 
  ON weak_areas(topic_id);

-- ============================================
-- 2. FIX FUNCTION SEARCH PATH
-- ============================================

DROP FUNCTION IF EXISTS is_user_in_cohort(uuid);

CREATE FUNCTION is_user_in_cohort(check_cohort_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.cohort_members
    WHERE cohort_id = check_cohort_id
    AND user_id = (SELECT auth.uid())
    AND left_at IS NULL
  );
$$;

-- ============================================
-- 3. CONSOLIDATE MULTIPLE PERMISSIVE POLICIES
-- ============================================

-- donations: Consolidate into single policy
DROP POLICY IF EXISTS "Users can view own donations" ON donations;
DROP POLICY IF EXISTS "Users can view public donations for supporter wall" ON donations;
CREATE POLICY "Users can view donations"
  ON donations
  FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid()) 
    OR is_anonymous = false
  );

-- quick_mentor_bookings SELECT: Consolidate into single policy
DROP POLICY IF EXISTS "Mentors can view their quick bookings" ON quick_mentor_bookings;
DROP POLICY IF EXISTS "Students can view own quick bookings" ON quick_mentor_bookings;
CREATE POLICY "Users can view their quick bookings"
  ON quick_mentor_bookings
  FOR SELECT
  TO authenticated
  USING (
    student_id = (SELECT auth.uid())
    OR mentor_id IN (
      SELECT id FROM public.mentor_profiles 
      WHERE user_id = (SELECT auth.uid())
    )
  );

-- quick_mentor_bookings UPDATE: Consolidate into single policy
DROP POLICY IF EXISTS "Mentors can update their quick bookings" ON quick_mentor_bookings;
DROP POLICY IF EXISTS "Students can update own quick bookings" ON quick_mentor_bookings;
CREATE POLICY "Users can update their quick bookings"
  ON quick_mentor_bookings
  FOR UPDATE
  TO authenticated
  USING (
    student_id = (SELECT auth.uid())
    OR mentor_id IN (
      SELECT id FROM public.mentor_profiles 
      WHERE user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    student_id = (SELECT auth.uid())
    OR mentor_id IN (
      SELECT id FROM public.mentor_profiles 
      WHERE user_id = (SELECT auth.uid())
    )
  );

-- supporter_badges: Consolidate into single policy (badges are public for display)
DROP POLICY IF EXISTS "Anyone can view badges for display" ON supporter_badges;
DROP POLICY IF EXISTS "Users can view own badges" ON supporter_badges;
CREATE POLICY "Users can view badges"
  ON supporter_badges
  FOR SELECT
  TO authenticated
  USING (true);
