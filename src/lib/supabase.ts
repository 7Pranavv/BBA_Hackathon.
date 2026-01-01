const STORAGE_KEYS = {
  USER: 'lms_user',
  PROFILES: 'lms_profiles',
  PROGRESS: 'lms_progress',
  ATTEMPTS: 'lms_attempts',
  WEAK_AREAS: 'lms_weak_areas',
  REVISION: 'lms_revision',
  THREADS: 'lms_threads',
  REPLIES: 'lms_replies',
};

interface MockUser {
  id: string;
  email: string;
}

interface StoredData {
  [key: string]: unknown[];
}

const storage: StoredData = {};

function getStorage<T>(key: string): T[] {
  if (!storage[key]) {
    const stored = localStorage.getItem(key);
    storage[key] = stored ? JSON.parse(stored) : [];
  }
  return storage[key] as T[];
}

function setStorage<T>(key: string, data: T[]): void {
  storage[key] = data;
  localStorage.setItem(key, JSON.stringify(data));
}

const learningPaths = [
  {
    id: '704f3e29-1784-4b3c-90ab-9c19394b1b02',
    title: 'Data Structures & Algorithms',
    description: 'Master DSA through pattern recognition. Learn the fundamental patterns that solve 90% of coding problems.',
    icon: 'code',
    estimated_hours: 120,
    display_order: 1,
  },
  {
    id: 'f3e055aa-f693-4d2b-a52b-80db4ee29bb6',
    title: 'System Design',
    description: 'From basics to advanced distributed systems. Learn to design scalable, reliable systems.',
    icon: 'network',
    estimated_hours: 80,
    display_order: 2,
  },
  {
    id: 'e39e41c4-5248-4f13-b9d4-f2315e4a834f',
    title: 'Low Level Design',
    description: 'Object-oriented design patterns and SOLID principles. Design clean, maintainable code.',
    icon: 'box',
    estimated_hours: 60,
    display_order: 3,
  },
  {
    id: '74891abb-0ebb-464b-885a-be1dacc2751d',
    title: 'Operating Systems',
    description: 'Understand how operating systems work. Processes, threads, memory management, and more.',
    icon: 'cpu',
    estimated_hours: 70,
    display_order: 4,
  },
  {
    id: '29fd0583-d2a2-4bf7-9dd5-85f63fbd71cb',
    title: 'Computer Networks',
    description: 'Learn networking fundamentals, protocols, and how the internet works.',
    icon: 'wifi',
    estimated_hours: 50,
    display_order: 5,
  },
  {
    id: 'ebae0cb3-070c-4837-aa84-32003ea4390e',
    title: 'Database Management',
    description: 'Relational databases, SQL, transactions, indexing, and optimization.',
    icon: 'database',
    estimated_hours: 60,
    display_order: 6,
  },
  {
    id: 'd7c14297-a3c5-4f46-9dd3-9a6186527fa2',
    title: 'AI & Machine Learning',
    description: 'Practical introduction to ML algorithms, neural networks, and real-world applications.',
    icon: 'brain',
    estimated_hours: 100,
    display_order: 7,
  },
];

const modules = [
  { id: 'm1', learning_path_id: '704f3e29-1784-4b3c-90ab-9c19394b1b02', title: 'Arrays & Hashing', display_order: 1 },
  { id: 'm2', learning_path_id: '704f3e29-1784-4b3c-90ab-9c19394b1b02', title: 'Two Pointers & Sliding Window', display_order: 2 },
  { id: 'm3', learning_path_id: '704f3e29-1784-4b3c-90ab-9c19394b1b02', title: 'Trees & Graphs', display_order: 3 },
  { id: 'm4', learning_path_id: '704f3e29-1784-4b3c-90ab-9c19394b1b02', title: 'Dynamic Programming', display_order: 4 },
  { id: 'm5', learning_path_id: 'f3e055aa-f693-4d2b-a52b-80db4ee29bb6', title: 'System Design Fundamentals', display_order: 1 },
  { id: 'm6', learning_path_id: 'f3e055aa-f693-4d2b-a52b-80db4ee29bb6', title: 'Scalability Patterns', display_order: 2 },
  { id: 'm7', learning_path_id: 'e39e41c4-5248-4f13-b9d4-f2315e4a834f', title: 'SOLID Principles', display_order: 1 },
  { id: 'm8', learning_path_id: 'e39e41c4-5248-4f13-b9d4-f2315e4a834f', title: 'Design Patterns', display_order: 2 },
  { id: 'm9', learning_path_id: '74891abb-0ebb-464b-885a-be1dacc2751d', title: 'Process Management', display_order: 1 },
  { id: 'm10', learning_path_id: '29fd0583-d2a2-4bf7-9dd5-85f63fbd71cb', title: 'Network Layers', display_order: 1 },
  { id: 'm11', learning_path_id: 'ebae0cb3-070c-4837-aa84-32003ea4390e', title: 'SQL Fundamentals', display_order: 1 },
  { id: 'm12', learning_path_id: 'd7c14297-a3c5-4f46-9dd3-9a6186527fa2', title: 'ML Basics', display_order: 1 },
];

const topics = [
  {
    id: 't1', module_id: 'm1', title: 'Hash Tables', display_order: 1, estimated_minutes: 30,
    concept: 'A hash table is a data structure that maps keys to values using a hash function. The hash function converts the key into an array index where the value is stored.\n\nTime Complexity:\n- Insert: O(1) average\n- Search: O(1) average\n- Delete: O(1) average\n\nSpace Complexity: O(n)',
    thought_process: 'When you see problems involving:\n1. Finding duplicates\n2. Counting frequencies\n3. Finding pairs with a target sum\n4. Grouping anagrams\n\nThink hash table first! The key insight is that hash tables give you O(1) lookup, which can often turn an O(n^2) brute force into O(n).',
    common_mistakes: '1. Not handling collisions properly\n2. Using mutable objects as keys\n3. Forgetting that hash tables use extra space\n4. Not considering the hash function quality'
  },
  {
    id: 't2', module_id: 'm1', title: 'Array Manipulation', display_order: 2, estimated_minutes: 25,
    concept: 'Arrays are contiguous memory blocks storing elements of the same type. Key operations include traversal, insertion, deletion, and searching.\n\nKey Patterns:\n- In-place modification\n- Prefix sums\n- Kadane\'s algorithm for max subarray',
    thought_process: 'For array problems, ask yourself:\n1. Can I sort and gain something?\n2. Can prefix sums help?\n3. Is there a pattern in indices?\n4. Can two pointers reduce complexity?',
    common_mistakes: '1. Off-by-one errors in indices\n2. Modifying array while iterating\n3. Not considering empty array edge case\n4. Integer overflow in sum calculations'
  },
  {
    id: 't3', module_id: 'm2', title: 'Two Pointers Technique', display_order: 1, estimated_minutes: 35,
    concept: 'Two pointers is a technique where two pointers iterate through the data structure in tandem until one or both hit a termination condition.\n\nVariations:\n- Same direction (fast/slow)\n- Opposite directions (start/end)\n- Different arrays',
    thought_process: 'Use two pointers when:\n1. Array is sorted or can be sorted\n2. Looking for pairs with certain property\n3. Need to compare elements at different positions\n4. Detecting cycles (fast/slow pointers)',
    common_mistakes: '1. Not handling equal pointers case\n2. Infinite loops from wrong pointer movement\n3. Forgetting to handle duplicates\n4. Not verifying array is sorted first'
  },
  {
    id: 't4', module_id: 'm2', title: 'Sliding Window', display_order: 2, estimated_minutes: 40,
    concept: 'Sliding window maintains a subset of data in a "window" that slides through the array. Used for problems involving contiguous sequences.\n\nTypes:\n- Fixed size window\n- Variable size window',
    thought_process: 'Sliding window when you see:\n1. "Contiguous subarray/substring"\n2. "Maximum/minimum of all subarrays of size k"\n3. "Longest substring with property X"\n4. Need to track running state',
    common_mistakes: '1. Not updating window state correctly when shrinking\n2. Off-by-one in window size\n3. Forgetting to handle empty input\n4. Not resetting state when needed'
  },
  {
    id: 't5', module_id: 'm3', title: 'Binary Trees', display_order: 1, estimated_minutes: 45,
    concept: 'A binary tree is a hierarchical structure where each node has at most two children. Traversals: Inorder (left-root-right), Preorder (root-left-right), Postorder (left-right-root).\n\nKey properties:\n- Height: longest path from root to leaf\n- Depth: distance from root to node',
    thought_process: 'For tree problems:\n1. What traversal order makes sense?\n2. Can I use recursion with return values?\n3. Do I need parent pointers?\n4. Is it a BST? Can I use BST properties?',
    common_mistakes: '1. Not handling null nodes\n2. Confusing height vs depth\n3. Forgetting base cases in recursion\n4. Not considering single-node trees'
  },
  {
    id: 't6', module_id: 'm3', title: 'Graph Traversals', display_order: 2, estimated_minutes: 50,
    concept: 'BFS explores neighbors level by level using a queue. DFS explores as deep as possible using recursion or a stack.\n\nBFS: Shortest path in unweighted graphs\nDFS: Detecting cycles, topological sort, connected components',
    thought_process: 'Choose BFS when:\n- Finding shortest path\n- Level-order processing needed\n\nChoose DFS when:\n- Exploring all paths\n- Detecting cycles\n- Topological sorting',
    common_mistakes: '1. Not marking nodes as visited\n2. Using wrong data structure (queue vs stack)\n3. Not handling disconnected components\n4. Infinite loops in cyclic graphs'
  },
  {
    id: 't7', module_id: 'm4', title: 'DP Fundamentals', display_order: 1, estimated_minutes: 60,
    concept: 'Dynamic Programming breaks problems into overlapping subproblems and stores their solutions. Two approaches:\n\n1. Top-down (Memoization): Recursive with caching\n2. Bottom-up (Tabulation): Iterative, builds table',
    thought_process: '1. Can I identify overlapping subproblems?\n2. What is the recurrence relation?\n3. What are the base cases?\n4. What is the state? (parameters that change)\n5. Can I optimize space?',
    common_mistakes: '1. Wrong base cases\n2. Incorrect state transitions\n3. Not considering all previous states\n4. Index out of bounds in table'
  },
  {
    id: 't8', module_id: 'm5', title: 'Scalability Basics', display_order: 1, estimated_minutes: 45,
    concept: 'Scalability is the ability of a system to handle growing amounts of work. Horizontal scaling adds more machines. Vertical scaling adds more power to existing machines.\n\nKey metrics: Throughput, Latency, Availability',
    thought_process: 'When designing for scale:\n1. Identify bottlenecks\n2. Consider read vs write patterns\n3. Think about data partitioning\n4. Plan for failures',
    common_mistakes: '1. Premature optimization\n2. Ignoring network latency\n3. Single points of failure\n4. Not considering data consistency'
  },
  {
    id: 't9', module_id: 'm6', title: 'Load Balancing', display_order: 1, estimated_minutes: 35,
    concept: 'Load balancers distribute incoming traffic across multiple servers. Algorithms: Round Robin, Least Connections, IP Hash, Weighted.\n\nTypes: L4 (transport) vs L7 (application) load balancers.',
    thought_process: 'Consider:\n1. Stateful vs stateless applications\n2. Health checks and failover\n3. SSL termination point\n4. Geographic distribution needs',
    common_mistakes: '1. Session affinity issues\n2. Uneven load distribution\n3. Not handling server failures\n4. Bottleneck at load balancer itself'
  },
  {
    id: 't10', module_id: 'm7', title: 'Single Responsibility', display_order: 1, estimated_minutes: 25,
    concept: 'A class should have only one reason to change. Each class/module should do one thing well.\n\nBenefits: Easier testing, better maintainability, reduced coupling.',
    thought_process: 'Ask yourself:\n1. Can I describe this class in one sentence without "and"?\n2. Who might request changes to this class?\n3. Are there multiple reasons this class might change?',
    common_mistakes: '1. God classes that do everything\n2. Over-separation (too many tiny classes)\n3. Confusing responsibility with functionality\n4. Not considering cohesion'
  },
];

const practiceProblems = [
  { id: 'p1', topic_id: 't1', title: 'Two Sum', difficulty: 'easy', pattern_tags: ['Hash Table', 'Array'], hints: ['Use a hash map to store complements', 'One pass is enough'], optimal_solution: 'def twoSum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i', description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.' },
  { id: 'p2', topic_id: 't1', title: 'Contains Duplicate', difficulty: 'easy', pattern_tags: ['Hash Table', 'Array'], hints: ['A set can help detect duplicates', 'Compare set size with array length'], optimal_solution: 'def containsDuplicate(nums):\n    return len(nums) != len(set(nums))', description: 'Given an integer array nums, return true if any value appears at least twice in the array.' },
  { id: 'p3', topic_id: 't2', title: 'Maximum Subarray', difficulty: 'medium', pattern_tags: ['Array', 'Dynamic Programming', 'Kadane'], hints: ['Track current sum and max sum', 'Reset current sum when it goes negative'], optimal_solution: 'def maxSubArray(nums):\n    max_sum = current = nums[0]\n    for num in nums[1:]:\n        current = max(num, current + num)\n        max_sum = max(max_sum, current)\n    return max_sum', description: 'Find the contiguous subarray which has the largest sum and return its sum.' },
  { id: 'p4', topic_id: 't3', title: 'Valid Palindrome', difficulty: 'easy', pattern_tags: ['Two Pointers', 'String'], hints: ['Use two pointers from both ends', 'Skip non-alphanumeric characters'], optimal_solution: 'def isPalindrome(s):\n    left, right = 0, len(s) - 1\n    while left < right:\n        while left < right and not s[left].isalnum():\n            left += 1\n        while left < right and not s[right].isalnum():\n            right -= 1\n        if s[left].lower() != s[right].lower():\n            return False\n        left, right = left + 1, right - 1\n    return True', description: 'Given a string s, return true if it is a palindrome considering only alphanumeric characters.' },
  { id: 'p5', topic_id: 't3', title: '3Sum', difficulty: 'medium', pattern_tags: ['Two Pointers', 'Array', 'Sorting'], hints: ['Sort the array first', 'Fix one element and use two pointers for the rest', 'Skip duplicates'], optimal_solution: 'def threeSum(nums):\n    nums.sort()\n    result = []\n    for i in range(len(nums) - 2):\n        if i > 0 and nums[i] == nums[i-1]:\n            continue\n        left, right = i + 1, len(nums) - 1\n        while left < right:\n            total = nums[i] + nums[left] + nums[right]\n            if total < 0:\n                left += 1\n            elif total > 0:\n                right -= 1\n            else:\n                result.append([nums[i], nums[left], nums[right]])\n                while left < right and nums[left] == nums[left+1]:\n                    left += 1\n                left, right = left + 1, right - 1\n    return result', description: 'Find all unique triplets in the array which gives the sum of zero.' },
  { id: 'p6', topic_id: 't4', title: 'Longest Substring Without Repeating', difficulty: 'medium', pattern_tags: ['Sliding Window', 'Hash Table', 'String'], hints: ['Use a set to track characters in current window', 'Shrink window when duplicate found'], optimal_solution: 'def lengthOfLongestSubstring(s):\n    char_set = set()\n    left = max_length = 0\n    for right in range(len(s)):\n        while s[right] in char_set:\n            char_set.remove(s[left])\n            left += 1\n        char_set.add(s[right])\n        max_length = max(max_length, right - left + 1)\n    return max_length', description: 'Find the length of the longest substring without repeating characters.' },
  { id: 'p7', topic_id: 't5', title: 'Invert Binary Tree', difficulty: 'easy', pattern_tags: ['Tree', 'Recursion', 'BFS'], hints: ['Swap left and right children', 'Recursively invert subtrees'], optimal_solution: 'def invertTree(root):\n    if not root:\n        return None\n    root.left, root.right = root.right, root.left\n    invertTree(root.left)\n    invertTree(root.right)\n    return root', description: 'Invert a binary tree (mirror it).' },
  { id: 'p8', topic_id: 't5', title: 'Maximum Depth of Binary Tree', difficulty: 'easy', pattern_tags: ['Tree', 'Recursion', 'DFS'], hints: ['Base case: null node has depth 0', 'Max depth is 1 + max of children depths'], optimal_solution: 'def maxDepth(root):\n    if not root:\n        return 0\n    return 1 + max(maxDepth(root.left), maxDepth(root.right))', description: 'Find the maximum depth of a binary tree.' },
  { id: 'p9', topic_id: 't6', title: 'Number of Islands', difficulty: 'medium', pattern_tags: ['Graph', 'DFS', 'BFS', 'Matrix'], hints: ['Treat grid as a graph', 'DFS/BFS from each unvisited land cell', 'Mark visited cells'], optimal_solution: 'def numIslands(grid):\n    if not grid:\n        return 0\n    count = 0\n    for i in range(len(grid)):\n        for j in range(len(grid[0])):\n            if grid[i][j] == "1":\n                dfs(grid, i, j)\n                count += 1\n    return count\n\ndef dfs(grid, i, j):\n    if i < 0 or j < 0 or i >= len(grid) or j >= len(grid[0]) or grid[i][j] != "1":\n        return\n    grid[i][j] = "#"\n    dfs(grid, i+1, j)\n    dfs(grid, i-1, j)\n    dfs(grid, i, j+1)\n    dfs(grid, i, j-1)', description: 'Given a 2D grid map of 1s (land) and 0s (water), count the number of islands.' },
  { id: 'p10', topic_id: 't7', title: 'Climbing Stairs', difficulty: 'easy', pattern_tags: ['Dynamic Programming', 'Fibonacci'], hints: ['Ways to reach step n = ways to reach n-1 + ways to reach n-2', 'Base cases: 1 way to reach step 1, 2 ways to reach step 2'], optimal_solution: 'def climbStairs(n):\n    if n <= 2:\n        return n\n    prev, curr = 1, 2\n    for _ in range(3, n + 1):\n        prev, curr = curr, prev + curr\n    return curr', description: 'You can climb 1 or 2 steps at a time. In how many distinct ways can you climb to the top?' },
];

type QueryBuilder<T> = {
  data: T[] | null;
  error: Error | null;
  _filters: Array<{ type: string; column?: string; value?: unknown; ascending?: boolean; count?: number }>;
  _table: string;
  select: (columns?: string) => QueryBuilder<T>;
  eq: (column: string, value: unknown) => QueryBuilder<T>;
  is: (column: string, value: unknown) => QueryBuilder<T>;
  lte: (column: string, value: unknown) => QueryBuilder<T>;
  order: (column: string, options?: { ascending?: boolean }) => QueryBuilder<T>;
  limit: (count: number) => QueryBuilder<T>;
  maybeSingle: () => Promise<{ data: T | null; error: Error | null }>;
  then: (resolve: (result: { data: T[] | null; error: Error | null }) => void) => void;
};

function createQueryBuilder<T>(table: string, initialData: T[]): QueryBuilder<T> {
  const builder: QueryBuilder<T> = {
    data: [...initialData],
    error: null,
    _filters: [],
    _table: table,

    select() {
      return this;
    },

    eq(column: string, value: unknown) {
      this._filters.push({ type: 'eq', column, value });
      return this;
    },

    is(column: string, value: unknown) {
      this._filters.push({ type: 'is', column, value });
      return this;
    },

    lte(column: string, value: unknown) {
      this._filters.push({ type: 'lte', column, value });
      return this;
    },

    order(column: string, options?: { ascending?: boolean }) {
      this._filters.push({ type: 'order', column, ascending: options?.ascending ?? true });
      return this;
    },

    limit(count: number) {
      this._filters.push({ type: 'limit', count });
      return this;
    },

    async maybeSingle() {
      const result = applyFilters(this.data as T[], this._filters);
      return { data: result[0] || null, error: null };
    },

    then(resolve) {
      const result = applyFilters(this.data as T[], this._filters);
      resolve({ data: result, error: null });
    },
  };

  return builder;
}

function applyFilters<T>(data: T[], filters: QueryBuilder<T>['_filters']): T[] {
  let result = [...data];

  for (const filter of filters) {
    switch (filter.type) {
      case 'eq':
        result = result.filter((item) => (item as Record<string, unknown>)[filter.column!] === filter.value);
        break;
      case 'is':
        result = result.filter((item) => (item as Record<string, unknown>)[filter.column!] === filter.value);
        break;
      case 'lte':
        result = result.filter((item) => (item as Record<string, unknown>)[filter.column!] <= (filter.value as number | string));
        break;
      case 'order':
        result.sort((a, b) => {
          const aVal = (a as Record<string, unknown>)[filter.column!];
          const bVal = (b as Record<string, unknown>)[filter.column!];
          if (aVal < bVal) return filter.ascending ? -1 : 1;
          if (aVal > bVal) return filter.ascending ? 1 : -1;
          return 0;
        });
        break;
      case 'limit':
        result = result.slice(0, filter.count);
        break;
    }
  }

  return result;
}

function getTableData(table: string): unknown[] {
  switch (table) {
    case 'learning_paths':
      return learningPaths;
    case 'modules':
      return modules;
    case 'topics':
      return topics;
    case 'practice_problems':
      return practiceProblems;
    case 'user_profiles':
      return getStorage(STORAGE_KEYS.PROFILES);
    case 'user_progress':
      return getStorage(STORAGE_KEYS.PROGRESS);
    case 'user_problem_attempts':
      return getStorage(STORAGE_KEYS.ATTEMPTS);
    case 'weak_areas':
      return getStorage(STORAGE_KEYS.WEAK_AREAS);
    case 'revision_schedule':
      return getStorage(STORAGE_KEYS.REVISION);
    case 'discussion_threads':
      return getStorage(STORAGE_KEYS.THREADS);
    case 'discussion_replies':
      return getStorage(STORAGE_KEYS.REPLIES);
    default:
      return [];
  }
}

const mockAuth = {
  getSession: async () => {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    const user = userStr ? JSON.parse(userStr) : null;
    return { data: { session: user ? { user } : null } };
  },

  getUser: async () => {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    const user = userStr ? JSON.parse(userStr) : null;
    return { data: { user } };
  },

  onAuthStateChange: (callback: (event: string, session: { user: MockUser } | null) => void) => {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    const user = userStr ? JSON.parse(userStr) : null;
    setTimeout(() => callback('INITIAL', user ? { user } : null), 0);
    return { data: { subscription: { unsubscribe: () => {} } } };
  },

  signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
    const profiles = getStorage<{ id: string; email?: string; display_name?: string }>(STORAGE_KEYS.PROFILES);
    const existing = profiles.find((p) => p.email === email);

    if (existing && password) {
      const user = { id: existing.id, email };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      return { error: null };
    }
    return { error: new Error('Invalid credentials') };
  },

  signUp: async ({ email, password }: { email: string; password: string }) => {
    if (!email || !password) {
      return { error: new Error('Email and password required') };
    }

    const profiles = getStorage<{ id: string; email?: string; display_name?: string }>(STORAGE_KEYS.PROFILES);
    const existing = profiles.find((p) => p.email === email);

    if (existing) {
      return { error: new Error('User already exists') };
    }

    const id = 'user_' + Date.now();
    const user = { id, email };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

    profiles.push({
      id,
      email,
      display_name: email.split('@')[0],
    });
    setStorage(STORAGE_KEYS.PROFILES, profiles);

    return { error: null };
  },

  signOut: async () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
  },
};

export const supabase = {
  auth: mockAuth,

  from: (table: string) => {
    const data = getTableData(table);

    if (table === 'learning_paths') {
      const pathsWithModules = learningPaths.map((path) => ({
        ...path,
        modules: modules
          .filter((m) => m.learning_path_id === path.id)
          .map((m) => ({
            ...m,
            topics: topics.filter((t) => t.module_id === m.id),
          })),
      }));
      return createQueryBuilder(table, pathsWithModules);
    }

    return {
      ...createQueryBuilder(table, data as Record<string, unknown>[]),

      insert: async (record: Record<string, unknown> | Record<string, unknown>[]) => {
        const records = Array.isArray(record) ? record : [record];
        const existing = getStorage<Record<string, unknown>>(getStorageKey(table));

        for (const r of records) {
          if (!r.id) {
            r.id = table.slice(0, 2) + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
          }
          r.created_at = new Date().toISOString();
          existing.push(r);
        }

        setStorage(getStorageKey(table), existing);
        return { error: null };
      },

      update: (record: Record<string, unknown>) => {
        let targetId: unknown = null;

        return {
          eq: (column: string, value: unknown) => {
            if (column === 'id') targetId = value;
            return {
              then: (resolve: (result: { error: Error | null }) => void) => {
                const existing = getStorage<Record<string, unknown>>(getStorageKey(table));
                const index = existing.findIndex((item) => item.id === targetId);
                if (index !== -1) {
                  existing[index] = { ...existing[index], ...record };
                  setStorage(getStorageKey(table), existing);
                }
                resolve({ error: null });
              },
            };
          },
        };
      },

      upsert: async (record: Record<string, unknown>) => {
        const existing = getStorage<Record<string, unknown>>(getStorageKey(table));
        const index = existing.findIndex(
          (item) => item.user_id === record.user_id && item.topic_id === record.topic_id
        );

        if (index !== -1) {
          existing[index] = { ...existing[index], ...record };
        } else {
          if (!record.id) {
            record.id = table.slice(0, 2) + '_' + Date.now();
          }
          existing.push(record);
        }

        setStorage(getStorageKey(table), existing);
        return { error: null };
      },
    };
  },
};

function getStorageKey(table: string): string {
  const mapping: Record<string, string> = {
    user_profiles: STORAGE_KEYS.PROFILES,
    user_progress: STORAGE_KEYS.PROGRESS,
    user_problem_attempts: STORAGE_KEYS.ATTEMPTS,
    weak_areas: STORAGE_KEYS.WEAK_AREAS,
    revision_schedule: STORAGE_KEYS.REVISION,
    discussion_threads: STORAGE_KEYS.THREADS,
    discussion_replies: STORAGE_KEYS.REPLIES,
  };
  return mapping[table] || table;
}
