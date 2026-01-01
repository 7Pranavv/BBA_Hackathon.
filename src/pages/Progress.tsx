import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { TrendingUp, AlertCircle, Calendar, Target } from 'lucide-react';

interface WeakArea {
  id: string;
  topic: {
    id: string;
    title: string;
  };
  weakness_score: number;
}

interface RevisionItem {
  id: string;
  topic: {
    id: string;
    title: string;
  };
  next_review_date: string;
  review_count: number;
}

interface TopicProgress {
  topic: {
    id: string;
    title: string;
  };
  status: string;
  mastery_score: number;
  time_spent_minutes: number;
}

export function Progress() {
  const { user } = useAuth();
  const [weakAreas, setWeakAreas] = useState<WeakArea[]>([]);
  const [revisionDue, setRevisionDue] = useState<RevisionItem[]>([]);
  const [recentProgress, setRecentProgress] = useState<TopicProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgressData();
  }, [user]);

  const loadProgressData = async () => {
    if (!user) return;

    const { data: weakAreasData } = await supabase
      .from('weak_areas')
      .select(`
        id,
        weakness_score,
        topic:topics (
          id,
          title
        )
      `)
      .eq('user_id', user.id)
      .is('resolved_at', null)
      .order('weakness_score', { ascending: false })
      .limit(10);

    const today = new Date().toISOString().split('T')[0];
    const { data: revisionData } = await supabase
      .from('revision_schedule')
      .select(`
        id,
        next_review_date,
        review_count,
        topic:topics (
          id,
          title
        )
      `)
      .eq('user_id', user.id)
      .lte('next_review_date', today)
      .order('next_review_date')
      .limit(10);

    const { data: progressData } = await supabase
      .from('user_progress')
      .select(`
        status,
        mastery_score,
        time_spent_minutes,
        topic:topics (
          id,
          title
        )
      `)
      .eq('user_id', user.id)
      .in('status', ['in_progress', 'completed', 'mastered'])
      .order('last_reviewed_at', { ascending: false })
      .limit(10);

    setWeakAreas(weakAreasData || []);
    setRevisionDue(revisionData || []);
    setRecentProgress(progressData || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Your Progress</h1>
        <p className="text-gray-400">
          Track your learning journey and identify areas for improvement
        </p>
      </div>

      {revisionDue.length > 0 && (
        <div className="bg-gradient-to-r from-blue-900/20 to-blue-800/20 border border-blue-800/50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white">
              Revision Due Today ({revisionDue.length})
            </h2>
          </div>
          <div className="space-y-2">
            {revisionDue.map(item => (
              <Link
                key={item.id}
                to={`/topics/${item.topic.id}`}
                className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg hover:bg-gray-800/50 transition-colors group"
              >
                <span className="text-white group-hover:text-blue-400 transition-colors">
                  {item.topic.title}
                </span>
                <span className="text-sm text-gray-400">
                  Review #{item.review_count + 1}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {weakAreas.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-600/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-500" />
            </div>
            <h2 className="text-xl font-semibold text-white">Weak Areas</h2>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Topics that need more attention based on your attempts and time spent
          </p>
          <div className="space-y-2">
            {weakAreas.map(area => (
              <Link
                key={area.id}
                to={`/topics/${area.topic.id}`}
                className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors group"
              >
                <span className="text-white group-hover:text-blue-400 transition-colors">
                  {area.topic.title}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: `${area.weakness_score}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-orange-400 w-8 text-right">
                    {area.weakness_score}%
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-600/20 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
        </div>
        {recentProgress.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            No activity yet. Start learning to see your progress here!
          </p>
        ) : (
          <div className="space-y-2">
            {recentProgress.map((item, index) => (
              <Link
                key={index}
                to={`/topics/${item.topic.id}`}
                className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors group"
              >
                <div className="flex-1">
                  <span className="text-white group-hover:text-blue-400 transition-colors block">
                    {item.topic.title}
                  </span>
                  <span className="text-xs text-gray-500">
                    {item.time_spent_minutes} minutes spent
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Mastery</div>
                    <div className="text-white font-medium">{item.mastery_score}%</div>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      item.status === 'mastered'
                        ? 'bg-green-500/20 text-green-400'
                        : item.status === 'completed'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {item.status.replace('_', ' ')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="bg-blue-900/10 border border-blue-800/30 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-600/20 rounded-lg">
            <Target className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Spaced Repetition
            </h3>
            <p className="text-gray-300 text-sm">
              Our revision system uses spaced repetition to help you retain knowledge long-term.
              Topics are scheduled for review at optimal intervals based on your mastery level.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
