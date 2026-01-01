/*
  # Seed Learning Content Data

  ## Overview
  Seeds the database with initial learning paths, modules, topics, and practice problems
  for a fully functional learning platform.

  ## Content Structure

  ### Learning Paths (7 total)
  1. Data Structures & Algorithms (120h)
  2. System Design (80h)
  3. Low Level Design (60h)
  4. Operating Systems (70h)
  5. Computer Networks (50h)
  6. Database Management (60h)
  7. AI & Machine Learning (100h)

  Each path contains modules and topics with detailed educational content.

  ## Security
  - Content is publicly readable via existing RLS policies
  - Only authenticated users can view content
*/

-- Insert Learning Paths (these already exist, so we skip with ON CONFLICT)
INSERT INTO learning_paths (id, title, description, icon, estimated_hours, display_order)
VALUES
  ('704f3e29-1784-4b3c-90ab-9c19394b1b02', 'Data Structures & Algorithms', 'Master DSA through pattern recognition. Learn the fundamental patterns that solve 90% of coding problems.', 'code', 120, 1),
  ('f3e055aa-f693-4d2b-a52b-80db4ee29bb6', 'System Design', 'From basics to advanced distributed systems. Learn to design scalable, reliable systems.', 'network', 80, 2),
  ('e39e41c4-5248-4f13-b9d4-f2315e4a834f', 'Low Level Design', 'Object-oriented design patterns and SOLID principles. Design clean, maintainable code.', 'boxes', 60, 3),
  ('74891abb-0ebb-464b-885a-be1dacc2751d', 'Operating Systems', 'Understand how operating systems work. Processes, threads, memory management, and more.', 'cpu', 70, 4),
  ('29fd0583-d2a2-4bf7-9dd5-85f63fbd71cb', 'Computer Networks', 'Learn networking fundamentals, protocols, and how the internet works.', 'globe', 50, 5),
  ('ebae0cb3-070c-4837-aa84-32003ea4390e', 'Database Management', 'Relational databases, SQL, transactions, indexing, and optimization.', 'database', 60, 6),
  ('d7c14297-a3c5-4f46-9dd3-9a6186527fa2', 'AI & Machine Learning', 'Practical introduction to ML algorithms, neural networks, and real-world applications.', 'brain', 100, 7)
ON CONFLICT (id) DO NOTHING;

-- Insert Modules for DSA
INSERT INTO modules (id, learning_path_id, title, description, display_order)
VALUES
  ('a1b2c3d4-1111-1111-1111-000000000001', '704f3e29-1784-4b3c-90ab-9c19394b1b02', 'Arrays & Hashing', 'Master array manipulation and hash table patterns', 1),
  ('a1b2c3d4-1111-1111-1111-000000000002', '704f3e29-1784-4b3c-90ab-9c19394b1b02', 'Two Pointers & Sliding Window', 'Learn efficient traversal techniques', 2),
  ('a1b2c3d4-1111-1111-1111-000000000003', '704f3e29-1784-4b3c-90ab-9c19394b1b02', 'Trees & Graphs', 'Navigate hierarchical and connected data structures', 3)
ON CONFLICT (id) DO NOTHING;

-- Insert Topics for Arrays & Hashing module
INSERT INTO topics (id, module_id, title, concept, thought_process, common_mistakes, estimated_minutes, display_order)
VALUES
  ('b1c2d3e4-2222-2222-2222-000000000001', 'a1b2c3d4-1111-1111-1111-000000000001', 'Two Sum Pattern',
   'Use a hash map to find pairs that sum to a target value in O(n) time.',
   'As you iterate, store each number and check if target - current exists in the map.',
   'Forgetting to check for duplicates or using the same element twice.',
   45, 1),

  ('b1c2d3e4-2222-2222-2222-000000000002', 'a1b2c3d4-1111-1111-1111-000000000001', 'Valid Anagram',
   'Compare character frequencies using hash maps or sorting.',
   'Count characters in both strings and compare the frequency maps.',
   'Not handling unicode characters or case sensitivity properly.',
   30, 2),

  ('b1c2d3e4-2222-2222-2222-000000000003', 'a1b2c3d4-1111-1111-1111-000000000001', 'Group Anagrams',
   'Group strings by their sorted character representation.',
   'Use sorted string as key in a hash map to group anagrams together.',
   'Inefficient sorting or memory usage with large inputs.',
   50, 3)
ON CONFLICT (id) DO NOTHING;

-- Insert Topics for Two Pointers module
INSERT INTO topics (id, module_id, title, concept, thought_process, common_mistakes, estimated_minutes, display_order)
VALUES
  ('b1c2d3e4-2222-2222-2222-000000000004', 'a1b2c3d4-1111-1111-1111-000000000002', 'Two Sum II - Sorted Array',
   'Use two pointers from both ends on a sorted array.',
   'Start with left at 0, right at end. Move pointers based on sum comparison.',
   'Not leveraging the sorted property or moving pointers incorrectly.',
   35, 1),

  ('b1c2d3e4-2222-2222-2222-000000000005', 'a1b2c3d4-1111-1111-1111-000000000002', 'Container With Most Water',
   'Find maximum area by moving pointers from extremes.',
   'Always move the pointer with shorter height to potentially find larger area.',
   'Moving the wrong pointer or not understanding the greedy choice.',
   45, 2)
ON CONFLICT (id) DO NOTHING;

-- Insert Topics for Trees module
INSERT INTO topics (id, module_id, title, concept, thought_process, common_mistakes, estimated_minutes, display_order)
VALUES
  ('b1c2d3e4-2222-2222-2222-000000000006', 'a1b2c3d4-1111-1111-1111-000000000003', 'Binary Tree Inorder Traversal',
   'Traverse left subtree, process root, then right subtree.',
   'Use recursion or iterative stack approach. Remember: left -> root -> right.',
   'Confusing order of operations or stack management.',
   40, 1),

  ('b1c2d3e4-2222-2222-2222-000000000007', 'a1b2c3d4-1111-1111-1111-000000000003', 'Maximum Depth of Binary Tree',
   'Calculate depth recursively as 1 + max of left and right subtree depths.',
   'Base case: null node has depth 0. Recursive case: 1 + max(left, right).',
   'Off-by-one errors or not handling null nodes.',
   35, 2)
ON CONFLICT (id) DO NOTHING;

-- Insert Modules for System Design
INSERT INTO modules (id, learning_path_id, title, description, display_order)
VALUES
  ('a1b2c3d4-1111-1111-1111-000000000011', 'f3e055aa-f693-4d2b-a52b-80db4ee29bb6', 'Fundamentals', 'Core concepts and building blocks', 1),
  ('a1b2c3d4-1111-1111-1111-000000000012', 'f3e055aa-f693-4d2b-a52b-80db4ee29bb6', 'Scalability Patterns', 'Learn to scale systems horizontally and vertically', 2),
  ('a1b2c3d4-1111-1111-1111-000000000013', 'f3e055aa-f693-4d2b-a52b-80db4ee29bb6', 'Case Studies', 'Real-world system designs', 3)
ON CONFLICT (id) DO NOTHING;

-- Insert Topics for System Design Fundamentals
INSERT INTO topics (id, module_id, title, concept, thought_process, common_mistakes, estimated_minutes, display_order)
VALUES
  ('b1c2d3e4-2222-2222-2222-000000000011', 'a1b2c3d4-1111-1111-1111-000000000011', 'CAP Theorem',
   'In distributed systems, you can only guarantee 2 of 3: Consistency, Availability, Partition tolerance.',
   'Network partitions will happen. Choose between consistency (CP) or availability (AP) based on needs.',
   'Thinking you can achieve all three or not understanding trade-offs.',
   60, 1),

  ('b1c2d3e4-2222-2222-2222-000000000012', 'a1b2c3d4-1111-1111-1111-000000000011', 'Load Balancing',
   'Distribute incoming requests across multiple servers to prevent overload.',
   'Use algorithms like round-robin, least connections, or consistent hashing.',
   'Not considering session affinity or server health checks.',
   50, 2)
ON CONFLICT (id) DO NOTHING;

-- Insert Modules for Low Level Design
INSERT INTO modules (id, learning_path_id, title, description, display_order)
VALUES
  ('a1b2c3d4-1111-1111-1111-000000000021', 'e39e41c4-5248-4f13-b9d4-f2315e4a834f', 'SOLID Principles', 'Foundation of object-oriented design', 1)
ON CONFLICT (id) DO NOTHING;

-- Insert Topics for SOLID Principles
INSERT INTO topics (id, module_id, title, concept, thought_process, common_mistakes, estimated_minutes, display_order)
VALUES
  ('b1c2d3e4-2222-2222-2222-000000000021', 'a1b2c3d4-1111-1111-1111-000000000021', 'Single Responsibility Principle',
   'A class should have only one reason to change - one responsibility.',
   'Identify distinct responsibilities and separate them into different classes.',
   'Creating God classes that do everything or over-fragmenting into tiny classes.',
   45, 1)
ON CONFLICT (id) DO NOTHING;

-- Insert Practice Problems
INSERT INTO practice_problems (id, topic_id, title, description, difficulty, pattern_tags, hints)
VALUES
  ('c1d2e3f4-3333-3333-3333-000000000001', 'b1c2d3e4-2222-2222-2222-000000000001', 'Two Sum',
   'Given an array of integers nums and an integer target, return indices of the two numbers that add up to target.',
   'easy',
   ARRAY['hash-map', 'array'],
   ARRAY['Use a hash map to store numbers you''ve seen', 'For each number, check if target - num exists in map']),

  ('c1d2e3f4-3333-3333-3333-000000000002', 'b1c2d3e4-2222-2222-2222-000000000002', 'Valid Anagram',
   'Given two strings s and t, return true if t is an anagram of s, and false otherwise.',
   'easy',
   ARRAY['hash-map', 'string'],
   ARRAY['Count character frequencies', 'Compare the frequency maps']),

  ('c1d2e3f4-3333-3333-3333-000000000003', 'b1c2d3e4-2222-2222-2222-000000000003', 'Group Anagrams',
   'Given an array of strings, group the anagrams together.',
   'medium',
   ARRAY['hash-map', 'string', 'sorting'],
   ARRAY['Use sorted string as hash key', 'Store lists of anagrams for each key']),

  ('c1d2e3f4-3333-3333-3333-000000000004', 'b1c2d3e4-2222-2222-2222-000000000004', 'Two Sum II - Input Array Is Sorted',
   'Given a sorted array, find two numbers that add up to a target.',
   'easy',
   ARRAY['two-pointers', 'array'],
   ARRAY['Use two pointers from both ends', 'Move left pointer right if sum too small, right pointer left if sum too large']),

  ('c1d2e3f4-3333-3333-3333-000000000005', 'b1c2d3e4-2222-2222-2222-000000000005', 'Container With Most Water',
   'Find two lines that together with the x-axis form a container with the most water.',
   'medium',
   ARRAY['two-pointers', 'greedy'],
   ARRAY['Start with widest container', 'Move the pointer with shorter height']),

  ('c1d2e3f4-3333-3333-3333-000000000006', 'b1c2d3e4-2222-2222-2222-000000000006', 'Binary Tree Inorder Traversal',
   'Given the root of a binary tree, return the inorder traversal of its nodes.',
   'easy',
   ARRAY['tree', 'recursion', 'stack'],
   ARRAY['Recursive: left -> root -> right', 'Iterative: use stack to simulate recursion']),

  ('c1d2e3f4-3333-3333-3333-000000000007', 'b1c2d3e4-2222-2222-2222-000000000007', 'Maximum Depth of Binary Tree',
   'Find the maximum depth of a binary tree.',
   'easy',
   ARRAY['tree', 'recursion', 'dfs'],
   ARRAY['Base case: null node has depth 0', 'Recursive: 1 + max(left_depth, right_depth)'])
ON CONFLICT (id) DO NOTHING;
