/*
  # Fix Public Read Access Policies

  1. Changes
    - Ensure all content tables have proper public read access
    - Drop any conflicting policies and recreate them

  2. Tables Affected
    - learning_paths, modules, topics, practice_problems
*/

-- Drop all existing SELECT policies first to avoid conflicts
DO $$
BEGIN
  -- Learning Paths
  DROP POLICY IF EXISTS "Authenticated users can view learning paths" ON learning_paths;
  DROP POLICY IF EXISTS "Anyone can view learning paths" ON learning_paths;
  DROP POLICY IF EXISTS "Public can view learning paths" ON learning_paths;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$
BEGIN
  -- Modules
  DROP POLICY IF EXISTS "Authenticated users can view modules" ON modules;
  DROP POLICY IF EXISTS "Anyone can view modules" ON modules;
  DROP POLICY IF EXISTS "Public can view modules" ON modules;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$
BEGIN
  -- Topics
  DROP POLICY IF EXISTS "Authenticated users can view topics" ON topics;
  DROP POLICY IF EXISTS "Anyone can view topics" ON topics;
  DROP POLICY IF EXISTS "Public can view topics" ON topics;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$
BEGIN
  -- Practice Problems
  DROP POLICY IF EXISTS "Authenticated users can view practice problems" ON practice_problems;
  DROP POLICY IF EXISTS "Anyone can view practice problems" ON practice_problems;
  DROP POLICY IF EXISTS "Public can view practice problems" ON practice_problems;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- Create new public read policies
CREATE POLICY "Public can view learning paths"
  ON learning_paths
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can view modules"
  ON modules
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can view topics"
  ON topics
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can view practice problems"
  ON practice_problems
  FOR SELECT
  TO public
  USING (true);
