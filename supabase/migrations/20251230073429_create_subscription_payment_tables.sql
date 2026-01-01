/*
  # Subscription and Payment System

  ## Overview
  Creates the foundation for a monetization system with subscription tiers,
  payment tracking, and user subscription management.

  ## New Tables

  ### Subscription Tiers
  - `subscription_tiers` - Defines available subscription plans
    - id, name, price_inr, description, display_order, is_active, created_at
    - Basic tier at Rs 50/month, Pro tier at Rs 100/month

  ### Subscription Features
  - `subscription_features` - Features included in each tier
    - id, tier_id, feature_key, feature_name, feature_description, created_at
    - Tracks what each tier includes (daily goals, cohort access, streak protection, etc.)

  ### User Subscriptions
  - `user_subscriptions` - Active subscriptions per user
    - id, user_id, tier_id, status, started_at, expires_at, auto_renew, created_at, updated_at
    - Tracks subscription lifecycle and renewal preferences

  ### Payment Transactions
  - `payment_transactions` - Complete payment history
    - id, user_id, subscription_id, amount_inr, payment_gateway, gateway_transaction_id,
      status, payment_type, metadata, created_at, updated_at
    - Supports multiple payment types (subscription, donation, mentor session)

  ## Security
  - RLS enabled on all tables
  - Users can only view and manage their own subscriptions and payments
  - Subscription tiers and features are publicly viewable
*/

-- Subscription Tiers
CREATE TABLE IF NOT EXISTS subscription_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price_inr integer NOT NULL DEFAULT 0,
  billing_period text NOT NULL DEFAULT 'monthly' CHECK (billing_period IN ('monthly', 'yearly')),
  description text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active subscription tiers"
  ON subscription_tiers FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Insert default subscription tiers
INSERT INTO subscription_tiers (name, price_inr, billing_period, description, display_order) VALUES
  ('Basic', 50, 'monthly', 'Essential accountability features to stay on track', 1),
  ('Pro', 100, 'monthly', 'Full access to community and advanced features', 2)
ON CONFLICT DO NOTHING;

-- Subscription Features
CREATE TABLE IF NOT EXISTS subscription_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_id uuid REFERENCES subscription_tiers(id) ON DELETE CASCADE,
  feature_key text NOT NULL,
  feature_name text NOT NULL,
  feature_description text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(tier_id, feature_key)
);

ALTER TABLE subscription_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view subscription features"
  ON subscription_features FOR SELECT
  TO authenticated
  USING (true);

-- User Subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  tier_id uuid REFERENCES subscription_tiers(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'paused')),
  started_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  cancelled_at timestamptz,
  auto_renew boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON user_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON user_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON user_subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Payment Transactions
CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES user_subscriptions(id) ON DELETE SET NULL,
  amount_inr integer NOT NULL,
  payment_gateway text DEFAULT 'razorpay',
  gateway_transaction_id text,
  gateway_order_id text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  payment_type text NOT NULL CHECK (payment_type IN ('subscription', 'donation', 'mentor_session', 'quick_session')),
  failure_reason text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON payment_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON payment_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON payment_transactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add subscription-related columns to user_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'streak_protection_used_at'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN streak_protection_used_at date;
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_subscription_features_tier ON subscription_features(tier_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_expires ON user_subscriptions(expires_at);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_subscription ON payment_transactions(subscription_id);
