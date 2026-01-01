import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ChevronRight, CheckCircle, Circle, Clock } from 'lucide-react';

interface Module {
  id: string;
  title: string;
  description: string | null;
  topics: Topic[];
}

interface Topic {
  id: string;
  title: string;
  estimated_minutes: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'mastered';
}

interface PathData {
  id: string;
  title: string;
  description: string | null;
  estimated_hours: number;
}

export function PathDetail() {
  const { pathId } = useParams();
  const { user } = useAuth();
  const [path, setPath] = useState<PathData | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPathDetail();
  }, [pathId, user]);

  const loadPathDetail = async () => {
    if (!pathId) return;

    const { data: pathData } = await supabase
      .from('learning_paths')
      .select('id, title, description, estimated_hours')
      .eq('id', pathId)
      .maybeSingle();

    if (!pathData) {
      setLoading(false);
      return;
    }

    setPath(pathData);

    const { data: modulesData } = await supabase
      .from('modules')
      .select(`
        id,
        title,
        description,
        topics (
          id,
          title,
          estimated_minutes,
          display_order
        )
      `)
      .eq('learning_path_id', pathId)
      .order('display_order');

    if (modulesData && user) {
      const allTopicIds = modulesData.flatMap(m =>
        (m.topics as any[])?.map(t => t.id) || []
      );

      const { data: progress } = await supabase
        .from('user_progress')
        .select('topic_id, status')
        .eq('user_id', user.id)
        .in('topic_id', allTopicIds);

      const modulesWithProgress: Module[] = modulesData.map(module => {
        const topics: Topic[] = ((module.topics as any[]) || [])
          .sort((a, b) => a.display_order - b.display_order)
          .map(topic => {
            const topicProgress = progress?.find(p => p.topic_id === topic.id);
            return {
              id: topic.id,
              title: topic.title,
              estimated_minutes: topic.estimated_minutes,
              status: topicProgress?.status || 'not_started',
            };
          });

        return {
          id: module.id,
          title: module.title,
          description: module.description,
          topics,
        };
      });

      setModules(modulesWithProgress);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!path) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Learning path not found</p>
      </div>
    );
  }

  const totalTopics = modules.reduce((sum, m) => sum + m.topics.length, 0);
  const completedTopics = modules.reduce(
    (sum, m) => sum + m.topics.filter(t => t.status === 'completed' || t.status === 'mastered').length,
    0
  );
  const progress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-900/20 to-blue-800/20 border border-blue-800/50 rounded-lg p-6">
        <h1 className="text-3xl font-bold text-white mb-2">{path.title}</h1>
        <p className="text-gray-300 mb-4">{path.description}</p>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-gray-400">
            <Clock className="w-4 h-4" />
            <span>{path.estimated_hours} hours</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <CheckCircle className="w-4 h-4" />
            <span>{totalTopics} topics</span>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-300">Your Progress</span>
            <span className="text-white font-medium">{progress}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {modules.map((module, moduleIndex) => (
          <div key={module.id} className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            <div className="p-5 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white mb-1">
                Module {moduleIndex + 1}: {module.title}
              </h2>
              {module.description && (
                <p className="text-gray-400 text-sm">{module.description}</p>
              )}
            </div>
            <div className="divide-y divide-gray-800">
              {module.topics.map((topic, topicIndex) => (
                <Link
                  key={topic.id}
                  to={`/topics/${topic.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-gray-800/50 transition-colors group"
                >
                  <div className="flex-shrink-0">
                    {topic.status === 'completed' || topic.status === 'mastered' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : topic.status === 'in_progress' ? (
                      <div className="w-5 h-5 border-2 border-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    ) : (
                      <Circle className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white group-hover:text-blue-400 transition-colors">
                      {topicIndex + 1}. {topic.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {topic.estimated_minutes} minutes
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gray-400 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
