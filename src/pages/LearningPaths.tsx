import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  Code2,
  Network,
  Box,
  Cpu,
  Wifi,
  Database,
  Brain,
  Clock,
  BookOpen,
  TrendingUp,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface LearningPath {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  estimated_hours: number;
  topicCount: number;
  completedCount: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const pathStyles: Record<string, { gradient: string; iconBg: string; accent: string }> = {
  'Data Structures & Algorithms': {
    gradient: 'from-blue-600/20 to-cyan-600/20',
    iconBg: 'bg-blue-500/20',
    accent: 'text-blue-400'
  },
  'System Design': {
    gradient: 'from-emerald-600/20 to-teal-600/20',
    iconBg: 'bg-emerald-500/20',
    accent: 'text-emerald-400'
  },
  'Low Level Design': {
    gradient: 'from-orange-600/20 to-amber-600/20',
    iconBg: 'bg-orange-500/20',
    accent: 'text-orange-400'
  },
  'Operating Systems': {
    gradient: 'from-rose-600/20 to-pink-600/20',
    iconBg: 'bg-rose-500/20',
    accent: 'text-rose-400'
  },
  'Computer Networks': {
    gradient: 'from-sky-600/20 to-blue-600/20',
    iconBg: 'bg-sky-500/20',
    accent: 'text-sky-400'
  },
  'Database Management': {
    gradient: 'from-green-600/20 to-emerald-600/20',
    iconBg: 'bg-green-500/20',
    accent: 'text-green-400'
  },
  'AI & Machine Learning': {
    gradient: 'from-fuchsia-600/20 to-pink-600/20',
    iconBg: 'bg-fuchsia-500/20',
    accent: 'text-fuchsia-400'
  }
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  code: Code2,
  network: Network,
  box: Box,
  cpu: Cpu,
  wifi: Wifi,
  database: Database,
  brain: Brain
};

export function LearningPaths() {
  const { user } = useAuth();
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaths();
  }, [user]);

  const loadPaths = async () => {
    const { data: pathsData, error } = await supabase
      .from('learning_paths')
      .select(`
        id,
        title,
        description,
        icon,
        estimated_hours,
        modules (
          id,
          topics (
            id
          )
        )
      `)
      .order('display_order');

    if (error) {
      console.error('Error loading learning paths:', error);
      setLoading(false);
      return;
    }

    if (pathsData) {
      let progress: { topic_id: string; status: string }[] | null = null;

      if (user) {
        const { data: userProgress } = await supabase
          .from('user_progress')
          .select('topic_id, status')
          .eq('user_id', user.id);
        progress = userProgress;
      }

      const pathsWithProgress = pathsData.map(path => {
        const allTopicIds: string[] = [];
        if (path.modules && Array.isArray(path.modules)) {
          path.modules.forEach((module: { id: string; topics: { id: string }[] }) => {
            if (module.topics && Array.isArray(module.topics)) {
              module.topics.forEach((topic: { id: string }) => {
                allTopicIds.push(topic.id);
              });
            }
          });
        }

        const completedCount = progress?.filter(p =>
          allTopicIds.includes(p.topic_id) &&
          (p.status === 'completed' || p.status === 'mastered')
        ).length || 0;

        return {
          id: path.id,
          title: path.title,
          description: path.description,
          icon: path.icon,
          estimated_hours: path.estimated_hours,
          topicCount: allTopicIds.length,
          completedCount,
          difficulty: getDifficulty(path.title)
        };
      });

      setPaths(pathsWithProgress);
    }

    setLoading(false);
  };

  const getDifficulty = (title: string): 'beginner' | 'intermediate' | 'advanced' => {
    if (title.includes('AI') || title.includes('System Design')) return 'advanced';
    if (title.includes('Low Level') || title.includes('Operating')) return 'intermediate';
    return 'beginner';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" />
          All content is free forever
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Learning Paths</h1>
        <p className="text-gray-400 text-lg">
          Structured, pattern-based learning designed for engineering students.
          Focus on thinking, not just watching.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {paths.map(path => {
          const progress = path.topicCount > 0 ? Math.round((path.completedCount / path.topicCount) * 100) : 0;
          const styles = pathStyles[path.title] || pathStyles['Data Structures & Algorithms'];
          const IconComponent = iconMap[path.icon || 'code'] || Code2;

          return (
            <Link
              key={path.id}
              to={`/paths/${path.id}`}
              className={`group relative bg-gradient-to-br ${styles.gradient} border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all duration-300 overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gray-900/80"></div>
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 ${styles.iconBg} rounded-xl`}>
                    <IconComponent className={`w-7 h-7 ${styles.accent}`} />
                  </div>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full border ${
                    path.difficulty === 'beginner'
                      ? 'bg-green-500/10 text-green-400 border-green-500/30'
                      : path.difficulty === 'intermediate'
                      ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                      : 'bg-red-500/10 text-red-400 border-red-500/30'
                  }`}>
                    {path.difficulty.charAt(0).toUpperCase() + path.difficulty.slice(1)}
                  </span>
                </div>

                <h3 className={`text-xl font-bold text-white mb-2 group-hover:${styles.accent} transition-colors`}>
                  {path.title}
                </h3>
                <p className="text-gray-400 text-sm mb-6 line-clamp-2">
                  {path.description}
                </p>

                <div className="flex items-center gap-6 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <BookOpen className="w-4 h-4" />
                    <span>{path.topicCount} topics</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{path.estimated_hours}h</span>
                  </div>
                </div>

                {user && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Your Progress</span>
                      <span className={`font-semibold ${styles.accent}`}>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          progress > 0 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : ''
                        }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    {progress > 0 && (
                      <p className="text-xs text-gray-500">
                        {path.completedCount} of {path.topicCount} topics completed
                      </p>
                    )}
                  </div>
                )}

                {!user && (
                  <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium group-hover:gap-3 transition-all">
                    <span>Start Learning</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 mt-8">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-3">Our Learning Philosophy</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-400">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2"></div>
                <p>Pattern-based learning that teaches you to think, not memorize</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2"></div>
                <p>Short, crisp concepts followed by hands-on practice problems</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2"></div>
                <p>Community discussions to learn from peers and share insights</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2"></div>
                <p>Spaced repetition to ensure long-term retention</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
