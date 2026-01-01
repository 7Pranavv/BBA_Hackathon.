import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  AlertTriangle,
  Code2,
  MessageSquare,
  CheckCircle,
  BookOpen,
  Clock,
  Zap,
  ArrowRight,
  Send,
  ThumbsUp
} from 'lucide-react';

interface TopicData {
  id: string;
  title: string;
  concept: string | null;
  thought_process: string | null;
  common_mistakes: string | null;
  estimated_minutes: number;
  module_id: string;
}

interface Problem {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  pattern_tags: string[];
}

interface NavigationTopic {
  id: string;
  title: string;
}

interface Discussion {
  id: string;
  title: string;
  content: string;
  upvotes: number;
  created_at: string;
  user_id: string;
  profile?: {
    display_name: string | null;
  };
}

export function TopicDetail() {
  const { topicId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [topic, setTopic] = useState<TopicData | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [status, setStatus] = useState<'not_started' | 'in_progress' | 'completed' | 'mastered'>('not_started');
  const [prevTopic, setPrevTopic] = useState<NavigationTopic | null>(null);
  const [nextTopic, setNextTopic] = useState<NavigationTopic | null>(null);
  const [loading, setLoading] = useState(true);
  const [newDiscussion, setNewDiscussion] = useState({ title: '', content: '' });
  const [showDiscussionForm, setShowDiscussionForm] = useState(false);

  const loadTopicDetail = useCallback(async () => {
    if (!topicId) return;

    const { data: topicData } = await supabase
      .from('topics')
      .select('id, title, concept, thought_process, common_mistakes, estimated_minutes, module_id')
      .eq('id', topicId)
      .maybeSingle();

    if (!topicData) {
      setLoading(false);
      return;
    }

    setTopic(topicData);

    const { data: problemsData } = await supabase
      .from('practice_problems')
      .select('id, title, difficulty, pattern_tags')
      .eq('topic_id', topicId)
      .limit(5);

    setProblems(problemsData || []);

    const { data: discussionsData } = await supabase
      .from('discussion_threads')
      .select(`
        id,
        title,
        content,
        upvotes,
        created_at,
        user_id
      `)
      .eq('topic_id', topicId)
      .order('upvotes', { ascending: false })
      .limit(5);

    if (discussionsData) {
      const discussionsWithProfiles = await Promise.all(
        discussionsData.map(async (d) => {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('display_name')
            .eq('id', d.user_id)
            .maybeSingle();
          return { ...d, profile };
        })
      );
      setDiscussions(discussionsWithProfiles);
    }

    if (user) {
      const { data: progress } = await supabase
        .from('user_progress')
        .select('status')
        .eq('user_id', user.id)
        .eq('topic_id', topicId)
        .maybeSingle();

      setStatus(progress?.status || 'not_started');

      if (!progress) {
        await supabase
          .from('user_progress')
          .insert({
            user_id: user.id,
            topic_id: topicId,
            status: 'in_progress',
          });
        setStatus('in_progress');
      }
    }

    const { data: allTopicsInModule } = await supabase
      .from('topics')
      .select('id, title, display_order')
      .eq('module_id', topicData.module_id)
      .order('display_order');

    if (allTopicsInModule) {
      const currentIndex = allTopicsInModule.findIndex(t => t.id === topicId);
      if (currentIndex > 0) {
        setPrevTopic(allTopicsInModule[currentIndex - 1]);
      } else {
        setPrevTopic(null);
      }
      if (currentIndex < allTopicsInModule.length - 1) {
        setNextTopic(allTopicsInModule[currentIndex + 1]);
      } else {
        setNextTopic(null);
      }
    }

    setLoading(false);
  }, [topicId, user]);

  useEffect(() => {
    loadTopicDetail();
  }, [loadTopicDetail]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && prevTopic) {
        navigate(`/topics/${prevTopic.id}`);
      } else if (e.key === 'ArrowRight' && nextTopic) {
        navigate(`/topics/${nextTopic.id}`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevTopic, nextTopic, navigate]);

  const markAsCompleted = async () => {
    if (!user || !topicId) return;

    await supabase
      .from('user_progress')
      .upsert({
        user_id: user.id,
        topic_id: topicId,
        status: 'completed',
        completed_at: new Date().toISOString(),
      });

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + 1);
    await supabase
      .from('revision_schedule')
      .upsert({
        user_id: user.id,
        topic_id: topicId,
        next_review_date: nextReviewDate.toISOString().split('T')[0],
        review_count: 0,
      });

    setStatus('completed');
  };

  const submitDiscussion = async () => {
    if (!user || !topicId || !newDiscussion.title.trim() || !newDiscussion.content.trim()) return;

    await supabase.from('discussion_threads').insert({
      topic_id: topicId,
      user_id: user.id,
      title: newDiscussion.title,
      content: newDiscussion.content,
    });

    setNewDiscussion({ title: '', content: '' });
    setShowDiscussionForm(false);
    loadTopicDetail();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Topic not found</p>
      </div>
    );
  }

  const difficultyColors = {
    easy: 'text-green-500 bg-green-500/10 border-green-500/30',
    medium: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30',
    hard: 'text-red-500 bg-red-500/10 border-red-500/30',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Clock className="w-4 h-4" />
            <span>{topic.estimated_minutes} min</span>
          </div>
          {status === 'completed' || status === 'mastered' ? (
            <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-4 py-2 rounded-lg">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Completed</span>
            </div>
          ) : (
            <button
              onClick={markAsCompleted}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Mark Complete
            </button>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border border-emerald-800/30 rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-6 h-6 text-emerald-400" />
          <span className="text-emerald-400 text-sm font-medium uppercase tracking-wide">Topic</span>
        </div>
        <h1 className="text-3xl font-bold text-white">{topic.title}</h1>
      </div>

      {topic.concept && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Zap className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Concept</h2>
            <span className="text-xs text-gray-500 ml-auto">Short & Crisp</span>
          </div>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-base">
              {topic.concept}
            </p>
          </div>
        </div>
      )}

      {topic.thought_process && (
        <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-800/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Lightbulb className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Thought Process</h2>
            <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full ml-auto">
              Thinking &gt; Watching
            </span>
          </div>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-base">
              {topic.thought_process}
            </p>
          </div>
        </div>
      )}

      {topic.common_mistakes && (
        <div className="bg-gradient-to-br from-orange-900/20 to-amber-900/20 border border-orange-800/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Common Mistakes</h2>
            <span className="text-xs bg-orange-500/10 text-orange-400 px-2 py-1 rounded-full ml-auto">
              Avoid These
            </span>
          </div>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-base">
              {topic.common_mistakes}
            </p>
          </div>
        </div>
      )}

      {problems.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Code2 className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">Practice Problems</h2>
            </div>
            <span className="text-sm text-gray-400">{problems.length} problems</span>
          </div>
          <div className="space-y-3">
            {problems.map(problem => (
              <Link
                key={problem.id}
                to={`/problems/${problem.id}`}
                className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors group"
              >
                <div className="flex-1">
                  <h3 className="text-white group-hover:text-emerald-400 transition-colors mb-2 font-medium">
                    {problem.title}
                  </h3>
                  {problem.pattern_tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {problem.pattern_tags.map((tag, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-medium px-3 py-1 rounded-full border ${
                      difficultyColors[problem.difficulty]
                    }`}
                  >
                    {problem.difficulty}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500/10 rounded-lg">
              <MessageSquare className="w-5 h-5 text-sky-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Discussion</h2>
          </div>
          {user && (
            <button
              onClick={() => setShowDiscussionForm(!showDiscussionForm)}
              className="text-sm text-emerald-400 hover:text-emerald-300 font-medium"
            >
              {showDiscussionForm ? 'Cancel' : 'Start Discussion'}
            </button>
          )}
        </div>

        {showDiscussionForm && user && (
          <div className="mb-6 p-4 bg-gray-800/50 rounded-xl space-y-3">
            <input
              type="text"
              placeholder="Discussion title..."
              value={newDiscussion.title}
              onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <textarea
              placeholder="Share your thoughts, questions, or insights..."
              value={newDiscussion.content}
              onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={submitDiscussion}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Post Discussion
            </button>
          </div>
        )}

        {discussions.length > 0 ? (
          <div className="space-y-3">
            {discussions.map(discussion => (
              <Link
                key={discussion.id}
                to={`/discussions/${discussion.id}`}
                className="block p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors"
              >
                <h3 className="text-white font-medium mb-1">{discussion.title}</h3>
                <p className="text-gray-400 text-sm line-clamp-2 mb-2">{discussion.content}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{discussion.profile?.display_name || 'Anonymous'}</span>
                  <span>{new Date(discussion.created_at).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" />
                    {discussion.upvotes}
                  </span>
                </div>
              </Link>
            ))}
            <Link
              to={`/discussions?topic=${topicId}`}
              className="block text-center text-emerald-400 hover:text-emerald-300 text-sm font-medium py-3"
            >
              View all discussions
            </Link>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <p>No discussions yet. Be the first to start one!</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-gray-800">
        {prevTopic ? (
          <Link
            to={`/topics/${prevTopic.id}`}
            className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
          >
            <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-gray-700 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-xs text-gray-500 mb-1">Previous Topic</p>
              <p className="text-sm font-medium">{prevTopic.title}</p>
            </div>
          </Link>
        ) : (
          <div />
        )}
        {nextTopic ? (
          <Link
            to={`/topics/${nextTopic.id}`}
            className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
          >
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">Next Topic</p>
              <p className="text-sm font-medium">{nextTopic.title}</p>
            </div>
            <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-gray-700 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </div>
          </Link>
        ) : (
          <div />
        )}
      </div>

      <div className="text-center text-gray-500 text-xs">
        <p>Use arrow keys to navigate between topics</p>
      </div>
    </div>
  );
}
