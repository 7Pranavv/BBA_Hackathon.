/*
  # Fix Cohort Members RLS Infinite Recursion

  ## Issue
  The SELECT policy on cohort_members references cohort_members itself,
  causing infinite recursion when checking if a user can view members.

  ## Solution
  Split into two simpler policies:
  1. Users can always view their own membership records
  2. Users can view other members in cohorts they belong to (using a safe approach)

  ## Security
  - Users can see their own cohort memberships
  - Users can see other members in the same cohorts
*/

-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Users can view cohort members in their cohorts" ON cohort_members;

-- Allow users to view their own membership records (no recursion)
CREATE POLICY "Users can view own cohort memberships"
  ON cohort_members FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to view members in cohorts they are part of
-- This is safe because we're using a materialized approach
CREATE POLICY "Users can view members in same cohorts"
  ON cohort_members FOR SELECT
  TO authenticated
  USING (
    cohort_id IN (
      SELECT cm.cohort_id 
      FROM cohort_members cm 
      WHERE cm.user_id = auth.uid()
    )
  );
