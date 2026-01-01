import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  Code2,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Search
} from 'lucide-react';

interface Problem {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  pattern_tags: string[];
  attemptCount: number;
  solved: boolean;
  lastAttemptCorrect: boolean | null;
  hasIncorrectAttempts: boolean;
}

interface Stats {
  total: number;
  solved: number;
  easy: { total: number; solved: number };
  medium: { total: number; solved: number };
  hard: { total: number; solved: number };
}

export function PracticeProblems() {
  const { user } = useAuth();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [filteredProblems, setFilteredProblems] = useState<Problem[]>([]);
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [patternFilter, setPatternFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [allPatterns, setAllPatterns] = useState<string[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    solved: 0,
    easy: { total: 0, solved: 0 },
    medium: { total: 0, solved: 0 },
    hard: { total: 0, solved: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProblems();
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [problems, difficultyFilter, patternFilter, statusFilter, searchQuery]);

  const loadProblems = async () => {
    const { data: problemsData, error } = await supabase
      .from('practice_problems')
      .select('id, title, difficulty, pattern_tags')
      .order('title');

    if (error) {
      console.error('Error loading problems:', error);
      setLoading(false);
      return;
    }

    if (problemsData) {
      let attempts: { problem_id: string; is_correct: boolean; attempted_at: string }[] | null = null;

      if (user) {
        const { data: userAttempts } = await supabase
          .from('user_problem_attempts')
          .select('problem_id, is_correct, attempted_at')
          .eq('user_id', user.id)
          .order('attempted_at', { ascending: false });
        attempts = userAttempts;
      }

      const patterns = new Set<string>();
      const problemsWithAttempts: Problem[] = problemsData.map(problem => {
        problem.pattern_tags?.forEach(tag => patterns.add(tag));

        const problemAttempts = attempts?.filter(a => a.problem_id === problem.id) || [];
        const solved = problemAttempts.some(a => a.is_correct);
        const lastAttempt = problemAttempts[0];
        const hasIncorrectAttempts = problemAttempts.some(a => !a.is_correct);

        return {
          id: problem.id,
          title: problem.title,
          difficulty: problem.difficulty,
          pattern_tags: problem.pattern_tags || [],
          attemptCount: problemAttempts.length,
          solved,
          lastAttemptCorrect: lastAttempt?.is_correct ?? null,
          hasIncorrectAttempts
        };
      });

      setProblems(problemsWithAttempts);
      setAllPatterns(Array.from(patterns).sort());

      const newStats: Stats = {
        total: problemsWithAttempts.length,
        solved: problemsWithAttempts.filter(p => p.solved).length,
        easy: {
          total: problemsWithAttempts.filter(p => p.difficulty === 'easy').length,
          solved: problemsWithAttempts.filter(p => p.difficulty === 'easy' && p.solved).length
        },
        medium: {
          total: problemsWithAttempts.filter(p => p.difficulty === 'medium').length,
          solved: problemsWithAttempts.filter(p => p.difficulty === 'medium' && p.solved).length
        },
        hard: {
          total: problemsWithAttempts.filter(p => p.difficulty === 'hard').length,
          solved: problemsWithAttempts.filter(p => p.difficulty === 'hard' && p.solved).length
        }
      };
      setStats(newStats);
    }

    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...problems];

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.pattern_tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(p => p.difficulty === difficultyFilter);
    }

    if (patternFilter !== 'all') {
      filtered = filtered.filter(p => p.pattern_tags.includes(patternFilter));
    }

    if (statusFilter === 'solved') {
      filtered = filtered.filter(p => p.solved);
    } else if (statusFilter === 'unsolved') {
      filtered = filtered.filter(p => !p.solved);
    } else if (statusFilter === 'attempted') {
      filtered = filtered.filter(p => p.attemptCount > 0 && !p.solved);
    } else if (statusFilter === 'mistakes') {
      filtered = filtered.filter(p => p.hasIncorrectAttempts);
    }

    setFilteredProblems(filtered);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const difficultyColors = {
    easy: 'text-green-500 bg-green-500/10 border-green-500/30',
    medium: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30',
    hard: 'text-red-500 bg-red-500/10 border-red-500/30',
  };

  const completionPercentage = stats.total > 0 ? Math.round((stats.solved / stats.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Practice Problems</h1>
        <p className="text-gray-400">
          Pattern-based problems to strengthen your understanding. Track your progress and learn from mistakes.
        </p>
      </div>

      {user && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border border-emerald-800/30 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-gray-400 text-sm">Overall Progress</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-white">{completionPercentage}%</span>
              <span className="text-gray-500 text-sm mb-1">{stats.solved}/{stats.total}</span>
            </div>
            <div className="mt-3 w-full bg-gray-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-400 text-sm">Easy</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-white">{stats.easy.solved}</span>
              <span className="text-gray-500 text-sm mb-0.5">/ {stats.easy.total}</span>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-400 text-sm">Medium</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-white">{stats.medium.solved}</span>
              <span className="text-gray-500 text-sm mb-0.5">/ {stats.medium.total}</span>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-400 text-sm">Hard</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-white">{stats.hard.solved}</span>
              <span className="text-gray-500 text-sm mb-0.5">/ {stats.hard.total}</span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <h3 className="font-medium text-white">Filters</h3>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search problems or patterns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Difficulty</label>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Levels</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Pattern</label>
              <select
                value={patternFilter}
                onChange={(e) => setPatternFilter(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Patterns</option>
                {allPatterns.map(pattern => (
                  <option key={pattern} value={pattern}>{pattern}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Problems</option>
                <option value="solved">Solved</option>
                <option value="unsolved">Unsolved</option>
                <option value="attempted">Attempted (Not Solved)</option>
                <option value="mistakes">Previous Mistakes</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setDifficultyFilter('all');
                  setPatternFilter('all');
                  setStatusFilter('all');
                  setSearchQuery('');
                }}
                className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg px-3 py-2.5 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-gray-400 text-sm">
          Showing {filteredProblems.length} of {problems.length} problems
        </p>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-gray-500" />
          <span className="text-gray-500 text-sm">
            {problems.filter(p => p.hasIncorrectAttempts && !p.solved).length} problems need revision
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filteredProblems.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
            <Code2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 mb-2">No problems found</p>
            <p className="text-gray-500 text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          filteredProblems.map(problem => (
            <Link
              key={problem.id}
              to={`/problems/${problem.id}`}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-white group-hover:text-emerald-400 transition-colors font-medium text-lg">
                      {problem.title}
                    </h3>
                    {problem.solved && (
                      <div className="flex items-center gap-1 text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                        <CheckCircle className="w-3 h-3" />
                        Solved
                      </div>
                    )}
                    {problem.hasIncorrectAttempts && !problem.solved && (
                      <div className="flex items-center gap-1 text-xs px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full border border-orange-500/30">
                        <AlertTriangle className="w-3 h-3" />
                        Needs Review
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {problem.pattern_tags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-xs px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {problem.attemptCount > 0 && (
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{problem.attemptCount} attempt{problem.attemptCount !== 1 ? 's' : ''}</span>
                      {problem.lastAttemptCorrect !== null && (
                        <span className="flex items-center gap-1">
                          {problem.lastAttemptCorrect ? (
                            <>
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              Last attempt correct
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-red-500" />
                              Last attempt incorrect
                            </>
                          )}
                        </span>
                      )}
                    </div>
                  )}

                  {problem.hasIncorrectAttempts && !problem.solved && (
                    <p className="text-orange-400 text-xs mt-2">
                      You solved this with a suboptimal approach earlier. Try optimizing!
                    </p>
                  )}
                </div>

                <span
                  className={`text-xs font-medium px-4 py-1.5 rounded-full border whitespace-nowrap ${
                    difficultyColors[problem.difficulty]
                  }`}
                >
                  {problem.difficulty}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
