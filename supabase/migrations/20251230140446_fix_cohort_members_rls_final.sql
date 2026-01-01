/*
  # Final Fix for Cohort Members RLS Recursion

  ## Problem
  The cohort_members policies still cause infinite recursion because
  checking if a user can view members queries cohort_members itself.

  ## Solution
  Use a security definer function to safely check cohort membership
  without causing recursion. This function runs with elevated privileges
  and doesn't trigger RLS checks.

  ## Security
  - Users can view their own membership records
  - Users can view other members only if they're in the same cohort
  - Function is security definer but safe as it only checks membership
*/

-- Drop all existing SELECT policies on cohort_members
DROP POLICY IF EXISTS "Users can view own cohort memberships" ON cohort_members;
DROP POLICY IF EXISTS "Users can view members in same cohorts" ON cohort_members;
DROP POLICY IF EXISTS "Users can view cohort members in their cohorts" ON cohort_members;

-- Create a security definer function to check cohort membership
-- This runs without RLS checks, avoiding recursion
CREATE OR REPLACE FUNCTION is_user_in_cohort(check_cohort_id uuid, check_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM cohort_members 
    WHERE cohort_id = check_cohort_id 
    AND user_id = check_user_id
    AND completion_status = 'active'
  );
$$;

-- Create a single, non-recursive policy using the function
CREATE POLICY "Users can view cohort members in their cohorts"
  ON cohort_members FOR SELECT
  TO authenticated
  USING (
    -- Allow viewing own membership
    auth.uid() = user_id
    OR
    -- Allow viewing other members if user is in the same cohort
    is_user_in_cohort(cohort_id, auth.uid())
  );
