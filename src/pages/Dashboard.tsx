import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  Flame,
  Clock,
  Target,
  AlertTriangle,
  BookOpen,
  TrendingUp,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  Zap,
  Calendar,
  Award,
  BarChart3
} from 'lucide-react';

interface DashboardStats {
  currentStreak: number;
  longestStreak: number;
  totalMinutes: number;
  topicsCompleted: number;
  totalTopics: number;
  weakAreasCount: number;
  revisionDueCount: number;
  problemsSolved: number;
  totalProblems: number;
}

interface LearningPathProgress {
  id: string;
  title: string;
  icon: string | null;
  completed: number;
  total: number;
  percentage: number;
}

interface WeakArea {
  id: string;
  topic_id: string;
  weakness_score: number;
  topic: {
    id: string;
    title: string;
  } | null;
}

interface RevisionItem {
  id: string;
  topic_id: string;
  next_review_date: string;
  review_count: number;
  topic: {
    id: string;
    title: string;
  } | null;
}

interface RecentTopic {
  id: string;
  title: string;
  status: string;
}

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    currentStreak: 0,
    longestStreak: 0,
    totalMinutes: 0,
    topicsCompleted: 0,
    totalTopics: 0,
    weakAreasCount: 0,
    revisionDueCount: 0,
    problemsSolved: 0,
    totalProblems: 0,
  });
  const [pathProgress, setPathProgress] = useState<LearningPathProgress[]>([]);
  const [weakAreas, setWeakAreas] = useState<WeakArea[]>([]);
  const [revisionDue, setRevisionDue] = useState<RevisionItem[]>([]);
  const [recentTopic, setRecentTopic] = useState<RecentTopic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    const { data: allTopics } = await supabase
      .from('topics')
      .select('id');

    const { data: allProblems } = await supabase
      .from('practice_problems')
      .select('id');

    const { data: paths } = await supabase
      .from('learning_paths')
      .select(`
        id,
        title,
        icon,
        modules (
          id,
          topics (
            id
          )
        )
      `)
      .order('display_order');

    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('current_streak, longest_streak, total_learning_minutes')
      .eq('id', user.id)
      .maybeSingle();

    const { data: progressData } = await supabase
      .from('user_progress')
      .select('status, topic_id')
      .eq('user_id', user.id);

    const { data: weakAreasData } = await supabase
      .from('weak_areas')
      .select('id, topic_id, weakness_score')
      .eq('user_id', user.id)
      .is('resolved_at', null)
      .order('weakness_score', { ascending: false })
      .limit(5);

    if (weakAreasData) {
      const weakAreasWithTopics = await Promise.all(
        weakAreasData.map(async (wa) => {
          const { data: topic } = await supabase
            .from('topics')
            .select('id, title')
            .eq('id', wa.topic_id)
            .maybeSingle();
          return { ...wa, topic };
        })
      );
      setWeakAreas(weakAreasWithTopics);
    }

    const today = new Date().toISOString().split('T')[0];
    const { data: revisionDueData } = await supabase
      .from('revision_schedule')
      .select('id, topic_id, next_review_date, review_count')
      .eq('user_id', user.id)
      .lte('next_review_date', today)
      .order('next_review_date')
      .limit(5);

    if (revisionDueData) {
      const revisionWithTopics = await Promise.all(
        revisionDueData.map(async (r) => {
          const { data: topic } = await supabase
            .from('topics')
            .select('id, title')
            .eq('id', r.topic_id)
            .maybeSingle();
          return { ...r, topic };
        })
      );
      setRevisionDue(revisionWithTopics);
    }

    const { data: problemAttempts } = await supabase
      .from('user_problem_attempts')
      .select('problem_id, is_correct')
      .eq('user_id', user.id);

    const solvedProblems = new Set(
      problemAttempts?.filter(a => a.is_correct).map(a => a.problem_id) || []
    );

    const { data: recentProgress } = await supabase
      .from('user_progress')
      .select('topic_id, status')
      .eq('user_id', user.id)
      .eq('status', 'in_progress')
      .limit(1);

    if (recentProgress && recentProgress.length > 0) {
      const { data: topicData } = await supabase
        .from('topics')
        .select('id, title')
        .eq('id', recentProgress[0].topic_id)
        .maybeSingle();
      if (topicData) {
        setRecentTopic({
          id: topicData.id,
          title: topicData.title,
          status: recentProgress[0].status
        });
      }
    }

    const topicsCompleted = progressData?.filter(
      p => p.status === 'completed' || p.status === 'mastered'
    ).length || 0;

    setStats({
      currentStreak: profileData?.current_streak || 0,
      longestStreak: profileData?.longest_streak || 0,
      totalMinutes: profileData?.total_learning_minutes || 0,
      topicsCompleted,
      totalTopics: allTopics?.length || 0,
      weakAreasCount: weakAreasData?.length || 0,
      revisionDueCount: revisionDueData?.length || 0,
      problemsSolved: solvedProblems.size,
      totalProblems: allProblems?.length || 0
    });

    if (paths) {
      const pathProgressData: LearningPathProgress[] = paths.map(path => {
        const allPathTopicIds: string[] = [];
        if (path.modules && Array.isArray(path.modules)) {
          path.modules.forEach((module: { id: string; topics: { id: string }[] }) => {
            if (module.topics && Array.isArray(module.topics)) {
              module.topics.forEach((topic: { id: string }) => {
                allPathTopicIds.push(topic.id);
              });
            }
          });
        }

        const completedInPath = progressData?.filter(p =>
          allPathTopicIds.includes(p.topic_id) &&
          (p.status === 'completed' || p.status === 'mastered')
        ).length || 0;

        const total = allPathTopicIds.length;
        const percentage = total > 0 ? Math.round((completedInPath / total) * 100) : 0;

        return {
          id: path.id,
          title: path.title,
          icon: path.icon,
          completed: completedInPath,
          total,
          percentage,
        };
      });

      setPathProgress(pathProgressData);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const hours = Math.floor(stats.totalMinutes / 60);
  const minutes = stats.totalMinutes % 60;
  const overallProgress = stats.totalTopics > 0
    ? Math.round((stats.topicsCompleted / stats.totalTopics) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Track your progress and stay consistent</p>
        </div>
        {stats.currentStreak > 0 && (
          <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 px-4 py-2 rounded-xl">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="text-orange-400 font-bold">{stats.currentStreak} day streak!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-orange-900/30 to-amber-900/30 border border-orange-800/30 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <span className="text-gray-400 text-sm">Current Streak</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.currentStreak}</p>
          <p className="text-xs text-gray-500 mt-1">Best: {stats.longestStreak} days</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-gray-400 text-sm">Time Invested</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {hours}<span className="text-lg text-gray-400">h</span> {minutes}<span className="text-lg text-gray-400">m</span>
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Target className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="text-gray-400 text-sm">Topics Mastered</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {stats.topicsCompleted}<span className="text-lg text-gray-400">/{stats.totalTopics}</span>
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-fuchsia-500/10 rounded-lg">
              <BarChart3 className="w-5 h-5 text-fuchsia-500" />
            </div>
            <span className="text-gray-400 text-sm">Problems Solved</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {stats.problemsSolved}<span className="text-lg text-gray-400">/{stats.totalProblems}</span>
          </p>
        </div>
      </div>

      {recentTopic && (
        <Link
          to={`/topics/${recentTopic.id}`}
          className="block bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border border-emerald-800/30 rounded-xl p-6 hover:border-emerald-700/50 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <Zap className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Continue Learning</p>
                <h3 className="text-xl font-semibold text-white group-hover:text-emerald-400 transition-colors">
                  {recentTopic.title}
                </h3>
              </div>
            </div>
            <ArrowRight className="w-6 h-6 text-gray-500 group-hover:text-emerald-400 transition-colors" />
          </div>
        </Link>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {weakAreas.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <h2 className="text-lg font-semibold text-white">Weak Areas</h2>
              </div>
              <span className="text-gray-500 text-sm">{stats.weakAreasCount} areas</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Topics where you've struggled. Practice makes perfect!
            </p>
            <div className="space-y-3">
              {weakAreas.map(area => (
                <Link
                  key={area.id}
                  to={`/topics/${area.topic_id}`}
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-white group-hover:text-emerald-400 transition-colors">
                      {area.topic?.title || 'Unknown Topic'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-700 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-red-500 h-full rounded-full"
                        style={{ width: `${area.weakness_score}%` }}
                      ></div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
            <Link
              to="/problems?filter=mistakes"
              className="block text-center text-emerald-400 hover:text-emerald-300 text-sm font-medium mt-4 py-2"
            >
              Practice weak area problems
            </Link>
          </div>
        )}

        {revisionDue.length > 0 && (
          <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-800/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <RefreshCw className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">Revision Due</h2>
              </div>
              <span className="text-blue-400 text-sm font-medium">{stats.revisionDueCount} topics</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Spaced repetition helps you remember. Review these topics today!
            </p>
            <div className="space-y-3">
              {revisionDue.map(item => (
                <Link
                  key={item.id}
                  to={`/topics/${item.topic_id}`}
                  className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg hover:bg-gray-900 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span className="text-white group-hover:text-blue-400 transition-colors">
                      {item.topic?.title || 'Unknown Topic'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      Review #{item.review_count + 1}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Learning Paths Progress</h2>
              <p className="text-gray-500 text-sm">{overallProgress}% overall completion</p>
            </div>
          </div>
          <Link
            to="/paths"
            className="text-emerald-400 hover:text-emerald-300 text-sm font-medium"
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pathProgress.map(path => (
            <Link
              key={path.id}
              to={`/paths/${path.id}`}
              className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors group"
            >
              <div className="p-2 bg-gray-700 rounded-lg group-hover:bg-gray-600 transition-colors">
                <BookOpen className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white group-hover:text-emerald-400 transition-colors truncate">
                  {path.title}
                </h3>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex-1 bg-gray-700 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all"
                      style={{ width: `${path.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {path.completed}/{path.total}
                  </span>
                </div>
              </div>
              {path.percentage === 100 && (
                <Award className="w-5 h-5 text-amber-500" />
              )}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/paths"
          className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors group"
        >
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors">
              Learning Paths
            </h3>
          </div>
          <p className="text-gray-500 text-sm">Structured content for deep learning</p>
        </Link>

        <Link
          to="/problems"
          className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors group"
        >
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-medium text-white group-hover:text-emerald-400 transition-colors">
              Practice Problems
            </h3>
          </div>
          <p className="text-gray-500 text-sm">Pattern-based problem solving</p>
        </Link>

        <Link
          to="/discussions"
          className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors group"
        >
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-orange-400" />
            <h3 className="font-medium text-white group-hover:text-orange-400 transition-colors">
              Discussions
            </h3>
          </div>
          <p className="text-gray-500 text-sm">Learn from the community</p>
        </Link>
      </div>
    </div>
  );
}
