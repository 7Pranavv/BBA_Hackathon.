/*
  # Learning Management System Schema

  ## Overview
  Complete database schema for a free tech education platform with pattern-based learning,
  progress tracking, community discussions, and optional paid mentorship features.

  ## New Tables

  ### Core Learning Structure
  - `learning_paths` - Main learning tracks (DSA, System Design, LLD, OS, Networks, DBMS, AI/ML)
    - id, title, description, icon, estimated_hours, display_order, created_at
  
  - `modules` - Organized sections within each learning path
    - id, learning_path_id, title, description, display_order, created_at
  
  - `topics` - Individual learning units with content
    - id, module_id, title, concept, thought_process, common_mistakes, estimated_minutes, display_order, created_at
  
  - `practice_problems` - Coding/theory problems linked to topics
    - id, topic_id, title, description, difficulty, pattern_tags, hints, optimal_solution, created_at

  ### User Progress & Analytics
  - `user_profiles` - Extended user information beyond auth.users
    - id (references auth.users), display_name, avatar_url, current_streak, longest_streak, 
      last_activity_date, total_learning_minutes, created_at, updated_at
  
  - `user_progress` - Topic completion and mastery tracking
    - id, user_id, topic_id, status, mastery_score, time_spent_minutes, completed_at, last_reviewed_at
  
  - `user_problem_attempts` - All problem-solving attempts with solutions
    - id, user_id, problem_id, solution_text, is_correct, time_taken_minutes, attempted_at
  
  - `weak_areas` - Auto-identified topics needing attention
    - id, user_id, topic_id, weakness_score, identified_at, resolved_at
  
  - `revision_schedule` - Spaced repetition scheduling
    - id, user_id, topic_id, next_review_date, review_count, created_at

  ### Community Features
  - `discussion_threads` - Topic-based Q&A threads
    - id, topic_id, user_id, title, content, is_anonymous, upvotes, created_at, updated_at
  
  - `discussion_replies` - Nested replies to threads
    - id, thread_id, user_id, content, is_anonymous, upvotes, created_at, updated_at

  ### Optional Paid Features
  - `mentor_profiles` - Available mentors for 1:1 sessions
    - id, user_id, expertise_areas, hourly_rate, bio, availability, created_at
  
  - `mentor_bookings` - Scheduled mentorship sessions
    - id, mentor_id, student_id, session_type, scheduled_at, duration_minutes, status, created_at

  ## Security
  - Enable RLS on all tables
  - Policies ensure users can only access their own data or public content
  - Anonymous discussion posts hide user identity
  - Mentor profiles are publicly viewable
*/

-- User Profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_activity_date date,
  total_learning_minutes integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Learning Paths
CREATE TABLE IF NOT EXISTS learning_paths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  icon text,
  estimated_hours integer DEFAULT 0,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view learning paths"
  ON learning_paths FOR SELECT
  TO authenticated
  USING (true);

-- Modules
CREATE TABLE IF NOT EXISTS modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  learning_path_id uuid REFERENCES learning_paths(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view modules"
  ON modules FOR SELECT
  TO authenticated
  USING (true);

-- Topics
CREATE TABLE IF NOT EXISTS topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid REFERENCES modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  concept text,
  thought_process text,
  common_mistakes text,
  estimated_minutes integer DEFAULT 30,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view topics"
  ON topics FOR SELECT
  TO authenticated
  USING (true);

-- Practice Problems
CREATE TABLE IF NOT EXISTS practice_problems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid REFERENCES topics(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  difficulty text CHECK (difficulty IN ('easy', 'medium', 'hard')),
  pattern_tags text[] DEFAULT '{}',
  hints text[] DEFAULT '{}',
  optimal_solution text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE practice_problems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view problems"
  ON practice_problems FOR SELECT
  TO authenticated
  USING (true);

-- User Progress
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id uuid REFERENCES topics(id) ON DELETE CASCADE,
  status text CHECK (status IN ('not_started', 'in_progress', 'completed', 'mastered')) DEFAULT 'not_started',
  mastery_score integer DEFAULT 0 CHECK (mastery_score >= 0 AND mastery_score <= 100),
  time_spent_minutes integer DEFAULT 0,
  completed_at timestamptz,
  last_reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, topic_id)
);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User Problem Attempts
CREATE TABLE IF NOT EXISTS user_problem_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id uuid REFERENCES practice_problems(id) ON DELETE CASCADE,
  solution_text text,
  is_correct boolean DEFAULT false,
  time_taken_minutes integer DEFAULT 0,
  attempted_at timestamptz DEFAULT now()
);

ALTER TABLE user_problem_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own attempts"
  ON user_problem_attempts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attempts"
  ON user_problem_attempts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Weak Areas
CREATE TABLE IF NOT EXISTS weak_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id uuid REFERENCES topics(id) ON DELETE CASCADE,
  weakness_score integer DEFAULT 0 CHECK (weakness_score >= 0 AND weakness_score <= 100),
  identified_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  UNIQUE(user_id, topic_id)
);

ALTER TABLE weak_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own weak areas"
  ON weak_areas FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weak areas"
  ON weak_areas FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weak areas"
  ON weak_areas FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Revision Schedule
CREATE TABLE IF NOT EXISTS revision_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id uuid REFERENCES topics(id) ON DELETE CASCADE,
  next_review_date date NOT NULL,
  review_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, topic_id)
);

ALTER TABLE revision_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own revision schedule"
  ON revision_schedule FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own revision schedule"
  ON revision_schedule FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own revision schedule"
  ON revision_schedule FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Discussion Threads
CREATE TABLE IF NOT EXISTS discussion_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid REFERENCES topics(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  is_anonymous boolean DEFAULT false,
  upvotes integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE discussion_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view threads"
  ON discussion_threads FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert threads"
  ON discussion_threads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own threads"
  ON discussion_threads FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own threads"
  ON discussion_threads FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Discussion Replies
CREATE TABLE IF NOT EXISTS discussion_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid REFERENCES discussion_threads(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_anonymous boolean DEFAULT false,
  upvotes integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE discussion_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view replies"
  ON discussion_replies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert replies"
  ON discussion_replies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own replies"
  ON discussion_replies FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own replies"
  ON discussion_replies FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Mentor Profiles
CREATE TABLE IF NOT EXISTS mentor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  expertise_areas text[] DEFAULT '{}',
  hourly_rate integer DEFAULT 0,
  bio text,
  availability text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE mentor_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view mentor profiles"
  ON mentor_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Mentors can update own profile"
  ON mentor_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Mentor Bookings
CREATE TABLE IF NOT EXISTS mentor_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid REFERENCES mentor_profiles(id) ON DELETE CASCADE,
  student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type text CHECK (session_type IN ('one_on_one', 'group_doubt', 'resume_review', 'mock_interview')),
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer DEFAULT 60,
  status text CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')) DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE mentor_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own bookings"
  ON mentor_bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert bookings"
  ON mentor_bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update own bookings"
  ON mentor_bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_modules_learning_path ON modules(learning_path_id);
CREATE INDEX IF NOT EXISTS idx_topics_module ON topics(module_id);
CREATE INDEX IF NOT EXISTS idx_problems_topic ON practice_problems(topic_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_topic ON user_progress(topic_id);
CREATE INDEX IF NOT EXISTS idx_problem_attempts_user ON user_problem_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_problem_attempts_problem ON user_problem_attempts(problem_id);
CREATE INDEX IF NOT EXISTS idx_revision_schedule_user_date ON revision_schedule(user_id, next_review_date);
CREATE INDEX IF NOT EXISTS idx_discussion_threads_topic ON discussion_threads(topic_id);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_thread ON discussion_replies(thread_id);