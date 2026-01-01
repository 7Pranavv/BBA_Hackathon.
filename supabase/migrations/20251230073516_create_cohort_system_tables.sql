/*
  # Cohort System for Peer Accountability

  ## Overview
  Creates a cohort-based learning system where subscribers can join batches
  for peer support, shared challenges, and competitive motivation.

  ## New Tables

  ### Cohorts
  - `cohorts` - Learning batches with defined periods
    - id, batch_number, name, description, start_date, end_date, max_members,
      current_members, subscription_tier_required, status, created_at

  ### Cohort Members
  - `cohort_members` - Tracks member enrollment and participation
    - id, cohort_id, user_id, role, joined_at, left_at, completion_status

  ### Cohort Activities
  - `cohort_activities` - Shared challenges and milestones
    - id, cohort_id, title, description, activity_type, target_value,
      start_date, end_date, created_at

  ### Cohort Member Progress
  - `cohort_member_progress` - Tracks individual progress on activities
    - id, activity_id, user_id, current_value, completed_at, created_at

  ### Cohort Leaderboard
  - `cohort_leaderboard` - Weekly rankings for competitive motivation
    - id, cohort_id, user_id, week_start, points, rank, created_at

  ### Cohort Discussion Threads
  - `cohort_discussion_threads` - Peer support discussions within cohorts
    - id, cohort_id, user_id, title, content, is_pinned, created_at, updated_at

  ### Cohort Discussion Replies
  - `cohort_discussion_replies` - Replies to cohort discussions
    - id, thread_id, user_id, content, created_at, updated_at

  ## Security
  - RLS enabled on all tables
  - Members can only access their own cohort data
  - Cohort info is viewable by potential members for enrollment
*/

-- Cohorts
CREATE TABLE IF NOT EXISTS cohorts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_number integer NOT NULL,
  name text NOT NULL,
  description text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  max_members integer DEFAULT 50,
  current_members integer DEFAULT 0,
  subscription_tier_required uuid REFERENCES subscription_tiers(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cohorts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view cohorts"
  ON cohorts FOR SELECT
  TO authenticated
  USING (true);

-- Cohort Members
CREATE TABLE IF NOT EXISTS cohort_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id uuid REFERENCES cohorts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'mentor', 'admin')),
  joined_at timestamptz DEFAULT now(),
  left_at timestamptz,
  completion_status text DEFAULT 'active' CHECK (completion_status IN ('active', 'completed', 'dropped')),
  UNIQUE(cohort_id, user_id)
);

ALTER TABLE cohort_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view cohort members in their cohorts"
  ON cohort_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cohort_members cm
      WHERE cm.cohort_id = cohort_members.cohort_id
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own membership"
  ON cohort_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own membership"
  ON cohort_members FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Cohort Activities
CREATE TABLE IF NOT EXISTS cohort_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id uuid REFERENCES cohorts(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  activity_type text NOT NULL CHECK (activity_type IN ('challenge', 'milestone', 'weekly_goal', 'group_task')),
  target_value integer DEFAULT 1,
  points_reward integer DEFAULT 10,
  start_date date,
  end_date date,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cohort_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view cohort activities"
  ON cohort_activities FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cohort_members cm
      WHERE cm.cohort_id = cohort_activities.cohort_id
      AND cm.user_id = auth.uid()
    )
  );

-- Cohort Member Progress on Activities
CREATE TABLE IF NOT EXISTS cohort_member_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid REFERENCES cohort_activities(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  current_value integer DEFAULT 0,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(activity_id, user_id)
);

ALTER TABLE cohort_member_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON cohort_member_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view cohort members progress"
  ON cohort_member_progress FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cohort_activities ca
      JOIN cohort_members cm ON cm.cohort_id = ca.cohort_id
      WHERE ca.id = cohort_member_progress.activity_id
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own progress"
  ON cohort_member_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON cohort_member_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Cohort Leaderboard
CREATE TABLE IF NOT EXISTS cohort_leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id uuid REFERENCES cohorts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  points integer DEFAULT 0,
  topics_completed integer DEFAULT 0,
  problems_solved integer DEFAULT 0,
  rank integer,
  created_at timestamptz DEFAULT now(),
  UNIQUE(cohort_id, user_id, week_start)
);

ALTER TABLE cohort_leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view cohort leaderboard"
  ON cohort_leaderboard FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cohort_members cm
      WHERE cm.cohort_id = cohort_leaderboard.cohort_id
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own leaderboard entry"
  ON cohort_leaderboard FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leaderboard entry"
  ON cohort_leaderboard FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Cohort Discussion Threads
CREATE TABLE IF NOT EXISTS cohort_discussion_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id uuid REFERENCES cohorts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  is_pinned boolean DEFAULT false,
  reply_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cohort_discussion_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view cohort threads"
  ON cohort_discussion_threads FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cohort_members cm
      WHERE cm.cohort_id = cohort_discussion_threads.cohort_id
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can insert threads in their cohort"
  ON cohort_discussion_threads FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cohort_members cm
      WHERE cm.cohort_id = cohort_discussion_threads.cohort_id
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own threads"
  ON cohort_discussion_threads FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own threads"
  ON cohort_discussion_threads FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Cohort Discussion Replies
CREATE TABLE IF NOT EXISTS cohort_discussion_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid REFERENCES cohort_discussion_threads(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cohort_discussion_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view cohort replies"
  ON cohort_discussion_replies FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cohort_discussion_threads ct
      JOIN cohort_members cm ON cm.cohort_id = ct.cohort_id
      WHERE ct.id = cohort_discussion_replies.thread_id
      AND cm.user_id = auth.uid()
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
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own replies"
  ON cohort_discussion_replies FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own replies"
  ON cohort_discussion_replies FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_cohorts_status ON cohorts(status);
CREATE INDEX IF NOT EXISTS idx_cohorts_dates ON cohorts(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_cohort_members_cohort ON cohort_members(cohort_id);
CREATE INDEX IF NOT EXISTS idx_cohort_members_user ON cohort_members(user_id);
CREATE INDEX IF NOT EXISTS idx_cohort_activities_cohort ON cohort_activities(cohort_id);
CREATE INDEX IF NOT EXISTS idx_cohort_member_progress_activity ON cohort_member_progress(activity_id);
CREATE INDEX IF NOT EXISTS idx_cohort_member_progress_user ON cohort_member_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_cohort_leaderboard_cohort_week ON cohort_leaderboard(cohort_id, week_start);
CREATE INDEX IF NOT EXISTS idx_cohort_discussion_threads_cohort ON cohort_discussion_threads(cohort_id);
CREATE INDEX IF NOT EXISTS idx_cohort_discussion_replies_thread ON cohort_discussion_replies(thread_id);
