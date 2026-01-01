/*
  # Quick Mentor Sessions and Donation System

  ## Overview
  Creates infrastructure for affordable micro-mentorship sessions (15-30 mins)
  and a donation system for supporters who want to contribute.

  ## New Tables

  ### Mentor Session Types
  - `mentor_session_types` - Defines quick session offerings
    - id, name, description, duration_minutes, price_inr, is_active, created_at
    - Quick Doubt (Rs 50/15min), Code Review (Rs 75/20min), Career Chat (Rs 100/30min)

  ### Quick Mentor Bookings
  - `quick_mentor_bookings` - Short session reservations
    - id, mentor_id, student_id, session_type_id, scheduled_at, duration_minutes,
      status, prep_notes, meeting_link, rating, feedback, created_at

  ### Donation Tiers
  - `donation_tiers` - Preset donation amounts with benefits
    - id, name, amount_inr, description, benefits, badge_icon, display_order, created_at
    - Supporter (Rs 100), Champion (Rs 500), Hero (Rs 1000)

  ### Donations
  - `donations` - Individual donation records
    - id, user_id, tier_id, amount_inr, is_recurring, message, is_anonymous,
      payment_transaction_id, created_at

  ### Supporter Benefits
  - `supporter_badges` - Recognition badges earned by donors
    - id, user_id, badge_type, earned_at, expires_at

  ### Daily Goals System
  - `daily_goals` - Auto-generated daily learning goals
    - id, user_id, goal_date, goal_type, target_id, target_value, current_value,
      is_completed, completed_at, created_at

  ## Security
  - RLS enabled on all tables
  - Users can only access their own booking and donation data
  - Public donation wall shows non-anonymous donors only
*/

-- Mentor Session Types
CREATE TABLE IF NOT EXISTS mentor_session_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  duration_minutes integer NOT NULL,
  price_inr integer NOT NULL,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE mentor_session_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active session types"
  ON mentor_session_types FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Insert default session types
INSERT INTO mentor_session_types (name, description, duration_minutes, price_inr, display_order) VALUES
  ('Quick Doubt', 'Get your coding doubts cleared in a quick 15-minute session', 15, 50, 1),
  ('Code Review', 'Expert review of your code with improvement suggestions', 20, 75, 2),
  ('Career Chat', 'Discuss career paths, job prep, and get personalized advice', 30, 100, 3)
ON CONFLICT DO NOTHING;

-- Quick Mentor Bookings
CREATE TABLE IF NOT EXISTS quick_mentor_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid REFERENCES mentor_profiles(id) ON DELETE CASCADE,
  student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type_id uuid REFERENCES mentor_session_types(id) ON DELETE RESTRICT,
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  prep_notes text,
  meeting_link text,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  feedback text,
  payment_transaction_id uuid REFERENCES payment_transactions(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE quick_mentor_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own quick bookings"
  ON quick_mentor_bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Mentors can view their quick bookings"
  ON quick_mentor_bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM mentor_profiles mp
      WHERE mp.id = quick_mentor_bookings.mentor_id
      AND mp.user_id = auth.uid()
    )
  );

CREATE POLICY "Students can insert quick bookings"
  ON quick_mentor_bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update own quick bookings"
  ON quick_mentor_bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Mentors can update their quick bookings"
  ON quick_mentor_bookings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM mentor_profiles mp
      WHERE mp.id = quick_mentor_bookings.mentor_id
      AND mp.user_id = auth.uid()
    )
  );

-- Donation Tiers
CREATE TABLE IF NOT EXISTS donation_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  amount_inr integer NOT NULL,
  description text,
  benefits text[] DEFAULT '{}',
  badge_icon text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE donation_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view donation tiers"
  ON donation_tiers FOR SELECT
  TO authenticated
  USING (true);

-- Insert default donation tiers
INSERT INTO donation_tiers (name, amount_inr, description, benefits, badge_icon, display_order) VALUES
  ('Supporter', 100, 'Help keep education free for everyone', ARRAY['Supporter badge on profile', 'Name on supporters wall'], 'heart', 1),
  ('Champion', 500, 'Champion the cause of free education', ARRAY['Champion badge on profile', 'Name on supporters wall', 'Early access to new features'], 'trophy', 2),
  ('Hero', 1000, 'Be a hero for aspiring developers', ARRAY['Hero badge on profile', 'Featured on supporters wall', 'Early access to new features', 'Direct line to founders'], 'star', 3)
ON CONFLICT DO NOTHING;

-- Donations
CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  tier_id uuid REFERENCES donation_tiers(id) ON DELETE SET NULL,
  amount_inr integer NOT NULL,
  is_recurring boolean DEFAULT false,
  recurring_frequency text CHECK (recurring_frequency IN ('monthly', 'yearly') OR recurring_frequency IS NULL),
  message text,
  is_anonymous boolean DEFAULT false,
  payment_transaction_id uuid REFERENCES payment_transactions(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own donations"
  ON donations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public donations for supporter wall"
  ON donations FOR SELECT
  TO authenticated
  USING (is_anonymous = false);

CREATE POLICY "Users can insert own donations"
  ON donations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Supporter Badges
CREATE TABLE IF NOT EXISTS supporter_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type text NOT NULL CHECK (badge_type IN ('supporter', 'champion', 'hero', 'founding_member', 'top_donor')),
  earned_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  UNIQUE(user_id, badge_type)
);

ALTER TABLE supporter_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badges"
  ON supporter_badges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view badges for display"
  ON supporter_badges FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert badges"
  ON supporter_badges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Daily Goals System
CREATE TABLE IF NOT EXISTS daily_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_date date NOT NULL,
  goal_type text NOT NULL CHECK (goal_type IN ('complete_topic', 'solve_problems', 'review_topic', 'learning_minutes', 'practice_weak_area')),
  target_id uuid,
  target_value integer DEFAULT 1,
  current_value integer DEFAULT 0,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  points_earned integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, goal_date, goal_type, target_id)
);

ALTER TABLE daily_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals"
  ON daily_goals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON daily_goals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON daily_goals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Streak Protection Log
CREATE TABLE IF NOT EXISTS streak_protection_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  protected_date date NOT NULL,
  subscription_id uuid REFERENCES user_subscriptions(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, protected_date)
);

ALTER TABLE streak_protection_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streak protection"
  ON streak_protection_log FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streak protection"
  ON streak_protection_log FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Add quick session support to mentor_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'mentor_profiles' AND column_name = 'accepts_quick_sessions'
  ) THEN
    ALTER TABLE mentor_profiles ADD COLUMN accepts_quick_sessions boolean DEFAULT true;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'mentor_profiles' AND column_name = 'quick_session_availability'
  ) THEN
    ALTER TABLE mentor_profiles ADD COLUMN quick_session_availability jsonb DEFAULT '{}';
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_quick_mentor_bookings_mentor ON quick_mentor_bookings(mentor_id);
CREATE INDEX IF NOT EXISTS idx_quick_mentor_bookings_student ON quick_mentor_bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_quick_mentor_bookings_scheduled ON quick_mentor_bookings(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_quick_mentor_bookings_status ON quick_mentor_bookings(status);
CREATE INDEX IF NOT EXISTS idx_donations_user ON donations(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_anonymous ON donations(is_anonymous);
CREATE INDEX IF NOT EXISTS idx_supporter_badges_user ON supporter_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_goals_user_date ON daily_goals(user_id, goal_date);
CREATE INDEX IF NOT EXISTS idx_daily_goals_completed ON daily_goals(is_completed);
CREATE INDEX IF NOT EXISTS idx_streak_protection_user_date ON streak_protection_log(user_id, protected_date);
