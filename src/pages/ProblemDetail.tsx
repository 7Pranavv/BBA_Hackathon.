import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  ChevronLeft,
  Lightbulb,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  Eye,
  EyeOff,
  History,
  Sparkles
} from 'lucide-react';

interface ProblemData {
  id: string;
  title: string;
  description: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  pattern_tags: string[];
  hints: string[];
  optimal_solution: string | null;
  topic_id: string | null;
}

interface Attempt {
  id: string;
  solution_text: string | null;
  is_correct: boolean;
  time_taken_minutes: number;
  attempted_at: string;
}

export function ProblemDetail() {
  const { problemId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [problem, setProblem] = useState<ProblemData | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [solution, setSolution] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    loadProblemDetail();
  }, [problemId, user]);

  const loadProblemDetail = async () => {
    if (!problemId) return;

    const { data: problemData } = await supabase
      .from('practice_problems')
      .select('*')
      .eq('id', problemId)
      .maybeSingle();

    if (!problemData) {
      setLoading(false);
      return;
    }

    setProblem(problemData);

    if (user) {
      const { data: attemptsData } = await supabase
        .from('user_problem_attempts')
        .select('*')
        .eq('user_id', user.id)
        .eq('problem_id', problemId)
        .order('attempted_at', { ascending: false });

      setAttempts(attemptsData || []);
    }

    setLoading(false);
  };

  const handleSubmit = async (isCorrect: boolean) => {
    if (!user || !problemId || !solution.trim()) return;

    setSubmitting(true);
    const timeTaken = Math.round((Date.now() - startTime) / 60000);

    await supabase.from('user_problem_attempts').insert({
      user_id: user.id,
      problem_id: problemId,
      solution_text: solution,
      is_correct: isCorrect,
      time_taken_minutes: timeTaken
    });

    if (!isCorrect && problem?.topic_id) {
      const { data: existingWeakArea } = await supabase
        .from('weak_areas')
        .select('id, weakness_score')
        .eq('user_id', user.id)
        .eq('topic_id', problem.topic_id)
        .is('resolved_at', null)
        .maybeSingle();

      if (existingWeakArea) {
        await supabase
          .from('weak_areas')
          .update({ weakness_score: Math.min(100, (existingWeakArea.weakness_score || 0) + 10) })
          .eq('id', existingWeakArea.id);
      } else {
        await supabase.from('weak_areas').insert({
          user_id: user.id,
          topic_id: problem.topic_id,
          weakness_score: 20
        });
      }
    }

    await loadProblemDetail();
    setSolution('');
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Problem not found</p>
      </div>
    );
  }

  const difficultyColors = {
    easy: 'text-green-500 bg-green-500/10 border-green-500/30',
    medium: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30',
    hard: 'text-red-500 bg-red-500/10 border-red-500/30',
  };

  const solved = attempts.some(a => a.is_correct);
  const hasIncorrectAttempts = attempts.some(a => !a.is_correct);
  const incorrectAttempts = attempts.filter(a => !a.is_correct);
  const correctAttempt = attempts.find(a => a.is_correct);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
        <span>Back to Problems</span>
      </button>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-3">{problem.title}</h1>
            <div className="flex flex-wrap gap-2">
              {problem.pattern_tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-sm px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <span
            className={`text-sm font-medium px-4 py-1.5 rounded-full border whitespace-nowrap ${
              difficultyColors[problem.difficulty]
            }`}
          >
            {problem.difficulty}
          </span>
        </div>

        <div className="flex items-center gap-4 mb-4">
          {solved && (
            <div className="flex items-center gap-2 text-green-500 bg-green-500/10 px-3 py-1.5 rounded-lg">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Solved</span>
            </div>
          )}
          {hasIncorrectAttempts && !solved && (
            <div className="flex items-center gap-2 text-orange-400 bg-orange-500/10 px-3 py-1.5 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Needs Optimization</span>
            </div>
          )}
          {attempts.length > 0 && (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Clock className="w-4 h-4" />
              <span>{attempts.length} attempt{attempts.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {problem.description && (
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
              {problem.description}
            </p>
          </div>
        )}
      </div>

      {hasIncorrectAttempts && !solved && (
        <div className="bg-gradient-to-br from-orange-900/20 to-amber-900/20 border border-orange-800/30 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Sparkles className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Try a Different Approach</h3>
              <p className="text-gray-300 text-sm mb-3">
                You've attempted this problem {incorrectAttempts.length} time{incorrectAttempts.length !== 1 ? 's' : ''} without success.
                Consider these optimization strategies:
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-orange-400 mt-0.5" />
                  <span>Review the pattern tags - they hint at the optimal approach</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-orange-400 mt-0.5" />
                  <span>Check the hints below for guided thinking</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-orange-400 mt-0.5" />
                  <span>Compare your previous solutions with the optimal approach</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Your Solution</h2>
        <textarea
          value={solution}
          onChange={(e) => setSolution(e.target.value)}
          placeholder="Write your approach, pseudocode, or actual code here..."
          rows={12}
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
        />
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={() => handleSubmit(true)}
            disabled={submitting || !solution.trim()}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            {submitting ? 'Submitting...' : 'Mark as Correct'}
          </button>
          <button
            onClick={() => handleSubmit(false)}
            disabled={submitting || !solution.trim()}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <XCircle className="w-5 h-5" />
            Save as Attempt
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-3 text-center">
          Be honest with yourself - mark as correct only if your solution is optimal
        </p>
      </div>

      {problem.hints.length > 0 && (
        <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-800/30 rounded-2xl p-6">
          <button
            onClick={() => setShowHints(!showHints)}
            className="flex items-center gap-3 w-full text-left"
          >
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Lightbulb className="w-5 h-5 text-blue-400" />
            </div>
            <span className="font-semibold text-white flex-1">
              Hints ({problem.hints.length})
            </span>
            {showHints ? (
              <EyeOff className="w-5 h-5 text-gray-400" />
            ) : (
              <Eye className="w-5 h-5 text-gray-400" />
            )}
          </button>
          {showHints && (
            <div className="mt-4 space-y-3">
              {problem.hints.map((hint, i) => (
                <div key={i} className="bg-gray-900/50 rounded-xl p-4">
                  <p className="text-sm text-gray-300">
                    <span className="font-semibold text-blue-400">Hint {i + 1}:</span> {hint}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {problem.optimal_solution && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <button
            onClick={() => setShowSolution(!showSolution)}
            className="flex items-center gap-3 w-full text-left"
          >
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="font-semibold text-white flex-1">Optimal Solution</span>
            {showSolution ? (
              <EyeOff className="w-5 h-5 text-gray-400" />
            ) : (
              <Eye className="w-5 h-5 text-gray-400" />
            )}
          </button>
          {showSolution && (
            <div className="mt-4">
              <pre className="bg-gray-800 rounded-xl p-4 overflow-x-auto">
                <code className="text-sm text-gray-300 whitespace-pre-wrap">{problem.optimal_solution}</code>
              </pre>
            </div>
          )}
        </div>
      )}

      {attempts.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-3 w-full text-left"
          >
            <div className="p-2 bg-gray-700 rounded-lg">
              <History className="w-5 h-5 text-gray-400" />
            </div>
            <span className="font-semibold text-white flex-1">
              Your Attempts ({attempts.length})
            </span>
            {showHistory ? (
              <EyeOff className="w-5 h-5 text-gray-400" />
            ) : (
              <Eye className="w-5 h-5 text-gray-400" />
            )}
          </button>
          {showHistory && (
            <div className="mt-4 space-y-4">
              {correctAttempt && (
                <div className="border-l-4 border-green-500 pl-4">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-green-400 text-sm font-medium">Correct Solution</span>
                    <span className="text-gray-500 text-xs">
                      {new Date(correctAttempt.attempted_at).toLocaleDateString()}
                    </span>
                  </div>
                  {correctAttempt.solution_text && (
                    <pre className="text-sm text-gray-300 bg-gray-800 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
                      {correctAttempt.solution_text}
                    </pre>
                  )}
                </div>
              )}

              {incorrectAttempts.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-400">Previous Attempts</h4>
                  {incorrectAttempts.slice(0, 3).map(attempt => (
                    <div key={attempt.id} className="border-l-4 border-orange-500 pl-4">
                      <div className="flex items-center gap-3 mb-2">
                        <XCircle className="w-4 h-4 text-orange-500" />
                        <span className="text-orange-400 text-sm">Suboptimal</span>
                        <span className="text-gray-500 text-xs">
                          {new Date(attempt.attempted_at).toLocaleDateString()}
                        </span>
                        {attempt.time_taken_minutes > 0 && (
                          <span className="text-gray-500 text-xs">
                            {attempt.time_taken_minutes} min
                          </span>
                        )}
                      </div>
                      {attempt.solution_text && (
                        <pre className="text-sm text-gray-400 bg-gray-800 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
                          {attempt.solution_text}
                        </pre>
                      )}
                    </div>
                  ))}
                  {incorrectAttempts.length > 3 && (
                    <p className="text-gray-500 text-sm">
                      + {incorrectAttempts.length - 3} more attempts
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {problem.topic_id && (
        <Link
          to={`/topics/${problem.topic_id}`}
          className="block bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Related Topic</p>
              <p className="text-white font-medium group-hover:text-emerald-400 transition-colors">
                Review the concept and thought process
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-emerald-400 transition-colors" />
          </div>
        </Link>
      )}
    </div>
  );
}
