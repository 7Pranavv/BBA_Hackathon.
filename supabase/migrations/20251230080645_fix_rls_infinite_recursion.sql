/*
  # Fix RLS Infinite Recursion

  ## Issue
  Some RLS policies that reference the same table cause infinite recursion
  when using (select auth.uid()). These policies need to use auth.uid()
  directly instead.

  ## Fix
  Revert policies that query the same table back to using auth.uid()
  to prevent infinite recursion while keeping optimization for other policies.
*/

-- Fix cohort_members policy that references cohort_members
DROP POLICY IF EXISTS "Users can view cohort members in their cohorts" ON cohort_members;

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

-- Revert quick_mentor_bookings policies that reference quick_mentor_bookings (indirectly via mentor_profiles)
DROP POLICY IF EXISTS "Mentors can view their quick bookings" ON quick_mentor_bookings;

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

DROP POLICY IF EXISTS "Mentors can update their quick bookings" ON quick_mentor_bookings;

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
