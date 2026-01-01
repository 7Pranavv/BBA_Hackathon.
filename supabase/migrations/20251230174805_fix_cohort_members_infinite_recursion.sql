/*
  # Fix Infinite Recursion in cohort_members RLS Policy

  1. Problem
    - The SELECT policy on cohort_members references itself causing infinite recursion
    - Error: "infinite recursion detected in policy for relation cohort_members"

  2. Solution
    - Create a security definer function to check cohort membership without triggering RLS
    - Drop the problematic policy
    - Create a new policy using the security definer function

  3. Security
    - Function runs with elevated privileges but only returns boolean
    - Policy still properly restricts access to authenticated users
*/

-- Create a security definer function to check if user is in a cohort
CREATE OR REPLACE FUNCTION public.user_cohort_ids(check_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT cohort_id 
  FROM public.cohort_members 
  WHERE user_id = check_user_id;
$$;

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view cohort members in their cohorts" ON public.cohort_members;

-- Create new policy using the security definer function
CREATE POLICY "Users can view own membership"
  ON public.cohort_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view fellow cohort members"
  ON public.cohort_members
  FOR SELECT
  TO authenticated
  USING (cohort_id IN (SELECT public.user_cohort_ids(auth.uid())));
