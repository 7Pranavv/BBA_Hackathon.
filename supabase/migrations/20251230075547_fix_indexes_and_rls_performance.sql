/*
  # Performance Optimizations for Indexes and RLS Policies

  ## Overview
  This migration addresses two categories of performance issues:
  1. Missing indexes on foreign key columns
  2. RLS policies that re-evaluate auth.uid() for each row

  ## Changes

  ### 1. Missing Foreign Key Indexes
  Adding indexes on foreign key columns that were missing coverage:
  - cohort_discussion_replies.user_id
  - cohort_discussion_threads.user_id
  - cohort_leaderboard.user_id
  - cohorts.subscription_tier_required
  - discussion_replies.user_id
  - discussion_threads.user_id
  - donations.payment_transaction_id
  - donations.tier_id
  - mentor_bookings.mentor_id
  - mentor_bookings.student_id
  - quick_mentor_bookings.payment_transaction_id
  - quick_mentor_bookings.session_type_id
  - revision_schedule.topic_id
  - streak_protection_log.subscription_id
  - user_subscriptions.tier_id
  - weak_areas.topic_id

  ### 2. RLS Policy Optimization
  Replacing `auth.uid()` with `(select auth.uid())` in all RLS policies.
  This prevents the auth function from being re-evaluated for each row,
  significantly improving query performance at scale.

  ## Security
  No security changes - this is purely performance optimization.
*/

-- =====================================================
-- PART 1: ADD MISSING INDEXES ON FOREIGN KEY COLUMNS
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_cohort_discussion_replies_user ON cohort_discussion_replies(user_id);
CREATE INDEX IF NOT EXISTS idx_cohort_discussion_threads_user ON cohort_discussion_threads(user_id);
CREATE INDEX IF NOT EXISTS idx_cohort_leaderboard_user ON cohort_leaderboard(user_id);
CREATE INDEX IF NOT EXISTS idx_cohorts_tier ON cohorts(subscription_tier_required);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_user ON discussion_replies(user_id);
CREATE INDEX IF NOT EXISTS idx_discussion_threads_user ON discussion_threads(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_payment ON donations(payment_transaction_id);
CREATE INDEX IF NOT EXISTS idx_donations_tier ON donations(tier_id);
CREATE INDEX IF NOT EXISTS idx_mentor_bookings_mentor ON mentor_bookings(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_bookings_student ON mentor_bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_quick_mentor_bookings_payment ON quick_mentor_bookings(payment_transaction_id);
CREATE INDEX IF NOT EXISTS idx_quick_mentor_bookings_session_type ON quick_mentor_bookings(session_type_id);
CREATE INDEX IF NOT EXISTS idx_revision_schedule_topic ON revision_schedule(topic_id);
CREATE INDEX IF NOT EXISTS idx_streak_protection_subscription ON streak_protection_log(subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_tier ON user_subscriptions(tier_id);
CREATE INDEX IF NOT EXISTS idx_weak_areas_topic ON weak_areas(topic_id);

-- =====================================================
-- PART 2: OPTIMIZE RLS POLICIES
-- Replace auth.uid() with (select auth.uid()) for performance
-- =====================================================

-- user_profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- user_progress policies
DROP POLICY IF EXISTS "Users can view own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;

CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- user_problem_attempts policies
DROP POLICY IF EXISTS "Users can view own attempts" ON user_problem_attempts;
DROP POLICY IF EXISTS "Users can insert own attempts" ON user_problem_attempts;

CREATE POLICY "Users can view own attempts"
  ON user_problem_attempts FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own attempts"
  ON user_problem_attempts FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- weak_areas policies
DROP POLICY IF EXISTS "Users can view own weak areas" ON weak_areas;
DROP POLICY IF EXISTS "Users can insert own weak areas" ON weak_areas;
DROP POLICY IF EXISTS "Users can update own weak areas" ON weak_areas;

CREATE POLICY "Users can view own weak areas"
  ON weak_areas FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own weak areas"
  ON weak_areas FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own weak areas"
  ON weak_areas FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- revision_schedule policies
DROP POLICY IF EXISTS "Users can view own revision schedule" ON revision_schedule;
DROP POLICY IF EXISTS "Users can insert own revision schedule" ON revision_schedule;
DROP POLICY IF EXISTS "Users can update own revision schedule" ON revision_schedule;

CREATE POLICY "Users can view own revision schedule"
  ON revision_schedule FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own revision schedule"
  ON revision_schedule FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own revision schedule"
  ON revision_schedule FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- discussion_threads policies
DROP POLICY IF EXISTS "Users can insert threads" ON discussion_threads;
DROP POLICY IF EXISTS "Users can update own threads" ON discussion_threads;
DROP POLICY IF EXISTS "Users can delete own threads" ON discussion_threads;

CREATE POLICY "Users can insert threads"
  ON discussion_threads FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own threads"
  ON discussion_threads FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own threads"
  ON discussion_threads FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- discussion_replies policies
DROP POLICY IF EXISTS "Users can insert replies" ON discussion_replies;
DROP POLICY IF EXISTS "Users can update own replies" ON discussion_replies;
DROP POLICY IF EXISTS "Users can delete own replies" ON discussion_replies;

CREATE POLICY "Users can insert replies"
  ON discussion_replies FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own replies"
  ON discussion_replies FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own replies"
  ON discussion_replies FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- mentor_profiles policies
DROP POLICY IF EXISTS "Mentors can update own profile" ON mentor_profiles;

CREATE POLICY "Mentors can update own profile"
  ON mentor_profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- mentor_bookings policies
DROP POLICY IF EXISTS "Students can view own bookings" ON mentor_bookings;
DROP POLICY IF EXISTS "Students can insert bookings" ON mentor_bookings;
DROP POLICY IF EXISTS "Students can update own bookings" ON mentor_bookings;

CREATE POLICY "Students can view own bookings"
  ON mentor_bookings FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = student_id);

CREATE POLICY "Students can insert bookings"
  ON mentor_bookings FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = student_id);

CREATE POLICY "Students can update own bookings"
  ON mentor_bookings FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = student_id)
  WITH CHECK ((select auth.uid()) = student_id);

-- user_subscriptions policies
DROP POLICY IF EXISTS "Users can view own subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON user_subscriptions;

CREATE POLICY "Users can view own subscriptions"
  ON user_subscriptions FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON user_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON user_subscriptions FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- payment_transactions policies
DROP POLICY IF EXISTS "Users can view own transactions" ON payment_transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON payment_transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON payment_transactions;

CREATE POLICY "Users can view own transactions"
  ON payment_transactions FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own transactions"
  ON payment_transactions FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own transactions"
  ON payment_transactions FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- cohort_members policies
DROP POLICY IF EXISTS "Users can view cohort members in their cohorts" ON cohort_members;
DROP POLICY IF EXISTS "Users can insert own membership" ON cohort_members;
DROP POLICY IF EXISTS "Users can update own membership" ON cohort_members;

CREATE POLICY "Users can view cohort members in their cohorts"
  ON cohort_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cohort_members cm
      WHERE cm.cohort_id = cohort_members.cohort_id
      AND cm.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert own membership"
  ON cohort_members FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own membership"
  ON cohort_members FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- cohort_activities policies
DROP POLICY IF EXISTS "Members can view cohort activities" ON cohort_activities;

CREATE POLICY "Members can view cohort activities"
  ON cohort_activities FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cohort_members cm
      WHERE cm.cohort_id = cohort_activities.cohort_id
      AND cm.user_id = (select auth.uid())
    )
  );

-- cohort_member_progress policies
DROP POLICY IF EXISTS "Users can view own progress" ON cohort_member_progress;
DROP POLICY IF EXISTS "Users can view cohort members progress" ON cohort_member_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON cohort_member_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON cohort_member_progress;

CREATE POLICY "Users can view own cohort progress"
  ON cohort_member_progress FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can view cohort members progress"
  ON cohort_member_progress FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cohort_activities ca
      JOIN cohort_members cm ON cm.cohort_id = ca.cohort_id
      WHERE ca.id = cohort_member_progress.activity_id
      AND cm.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert own cohort progress"
  ON cohort_member_progress FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own cohort progress"
  ON cohort_member_progress FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- cohort_leaderboard policies
DROP POLICY IF EXISTS "Members can view cohort leaderboard" ON cohort_leaderboard;
DROP POLICY IF EXISTS "Users can insert own leaderboard entry" ON cohort_leaderboard;
DROP POLICY IF EXISTS "Users can update own leaderboard entry" ON cohort_leaderboard;

CREATE POLICY "Members can view cohort leaderboard"
  ON cohort_leaderboard FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cohort_members cm
      WHERE cm.cohort_id = cohort_leaderboard.cohort_id
      AND cm.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert own leaderboard entry"
  ON cohort_leaderboard FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own leaderboard entry"
  ON cohort_leaderboard FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- cohort_discussion_threads policies
DROP POLICY IF EXISTS "Members can view cohort threads" ON cohort_discussion_threads;
DROP POLICY IF EXISTS "Members can insert threads in their cohort" ON cohort_discussion_threads;
DROP POLICY IF EXISTS "Users can update own threads" ON cohort_discussion_threads;
DROP POLICY IF EXISTS "Users can delete own threads" ON cohort_discussion_threads;

CREATE POLICY "Members can view cohort threads"
  ON cohort_discussion_threads FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cohort_members cm
      WHERE cm.cohort_id = cohort_discussion_threads.cohort_id
      AND cm.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Members can insert threads in their cohort"
  ON cohort_discussion_threads FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cohort_members cm
      WHERE cm.cohort_id = cohort_discussion_threads.cohort_id
      AND cm.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update own cohort threads"
  ON cohort_discussion_threads FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own cohort threads"
  ON cohort_discussion_threads FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- cohort_discussion_replies policies
DROP POLICY IF EXISTS "Members can view cohort replies" ON cohort_discussion_replies;
DROP POLICY IF EXISTS "Members can insert replies in their cohort" ON cohort_discussion_replies;
DROP POLICY IF EXISTS "Users can update own replies" ON cohort_discussion_replies;
DROP POLICY IF EXISTS "Users can delete own replies" ON cohort_discussion_replies;

CREATE POLICY "Members can view cohort replies"
  ON cohort_discussion_replies FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cohort_discussion_threads ct
      JOIN cohort_members cm ON cm.cohort_id = ct.cohort_id
      WHERE ct.id = cohort_discussion_replies.thread_id
      AND cm.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Members can insert replies in their cohort"
  ON cohort_discussion_replies FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cohort_discussion_threads ct
      JOIN cohort_members cm ON cm.cohort_id = ct.cohort_id
      WHERE ct.id = cohort_discussion_replies.thread_id
      AND cm.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update own cohort replies"
  ON cohort_discussion_replies FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own cohort replies"
  ON cohort_discussion_replies FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- quick_mentor_bookings policies
DROP POLICY IF EXISTS "Students can view own quick bookings" ON quick_mentor_bookings;
DROP POLICY IF EXISTS "Mentors can view their quick bookings" ON quick_mentor_bookings;
DROP POLICY IF EXISTS "Students can insert quick bookings" ON quick_mentor_bookings;
DROP POLICY IF EXISTS "Students can update own quick bookings" ON quick_mentor_bookings;
DROP POLICY IF EXISTS "Mentors can update their quick bookings" ON quick_mentor_bookings;

CREATE POLICY "Students can view own quick bookings"
  ON quick_mentor_bookings FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = student_id);

CREATE POLICY "Mentors can view their quick bookings"
  ON quick_mentor_bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM mentor_profiles mp
      WHERE mp.id = quick_mentor_bookings.mentor_id
      AND mp.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Students can insert quick bookings"
  ON quick_mentor_bookings FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = student_id);

CREATE POLICY "Students can update own quick bookings"
  ON quick_mentor_bookings FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = student_id)
  WITH CHECK ((select auth.uid()) = student_id);

CREATE POLICY "Mentors can update their quick bookings"
  ON quick_mentor_bookings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM mentor_profiles mp
      WHERE mp.id = quick_mentor_bookings.mentor_id
      AND mp.user_id = (select auth.uid())
    )
  );

-- donations policies
DROP POLICY IF EXISTS "Users can view own donations" ON donations;
DROP POLICY IF EXISTS "Users can insert own donations" ON donations;

CREATE POLICY "Users can view own donations"
  ON donations FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own donations"
  ON donations FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- supporter_badges policies
DROP POLICY IF EXISTS "Users can view own badges" ON supporter_badges;
DROP POLICY IF EXISTS "System can insert badges" ON supporter_badges;

CREATE POLICY "Users can view own badges"
  ON supporter_badges FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "System can insert badges"
  ON supporter_badges FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- daily_goals policies
DROP POLICY IF EXISTS "Users can view own goals" ON daily_goals;
DROP POLICY IF EXISTS "Users can insert own goals" ON daily_goals;
DROP POLICY IF EXISTS "Users can update own goals" ON daily_goals;

CREATE POLICY "Users can view own goals"
  ON daily_goals FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own goals"
  ON daily_goals FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own goals"
  ON daily_goals FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- streak_protection_log policies
DROP POLICY IF EXISTS "Users can view own streak protection" ON streak_protection_log;
DROP POLICY IF EXISTS "Users can insert own streak protection" ON streak_protection_log;

CREATE POLICY "Users can view own streak protection"
  ON streak_protection_log FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own streak protection"
  ON streak_protection_log FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);
