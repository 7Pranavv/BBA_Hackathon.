import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, ThumbsUp, Plus, User } from 'lucide-react';

interface Thread {
  id: string;
  title: string;
  content: string;
  is_anonymous: boolean;
  upvotes: number;
  created_at: string;
  user_id: string;
  topic: {
    id: string;
    title: string;
  };
  replyCount: number;
}

export function Discussions() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const topicFilter = searchParams.get('topic');

  const [threads, setThreads] = useState<Thread[]>([]);
  const [showNewThread, setShowNewThread] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadContent, setNewThreadContent] = useState('');
  const [newThreadTopicId, setNewThreadTopicId] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [topics, setTopics] = useState<Array<{ id: string; title: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadThreads();
    loadTopics();
  }, [topicFilter]);

  const loadThreads = async () => {
    let query = supabase
      .from('discussion_threads')
      .select(`
        id,
        title,
        content,
        is_anonymous,
        upvotes,
        created_at,
        user_id,
        topic:topics (
          id,
          title
        )
      `)
      .order('created_at', { ascending: false });

    if (topicFilter) {
      query = query.eq('topic_id', topicFilter);
    }

    const { data: threadsData } = await query;

    if (threadsData) {
      const { data: allReplies } = await supabase
        .from('discussion_replies')
        .select('thread_id');

      const threadsWithCounts = threadsData.map(thread => ({
        ...thread,
        replyCount: allReplies?.filter(r => r.thread_id === thread.id).length || 0,
      }));

      setThreads(threadsWithCounts);
    }

    setLoading(false);
  };

  const loadTopics = async () => {
    const { data } = await supabase
      .from('topics')
      .select('id, title')
      .order('title')
      .limit(100);

    setTopics(data || []);
  };

  const createThread = async () => {
    if (!user || !newThreadTitle.trim() || !newThreadContent.trim() || !newThreadTopicId) return;

    await supabase.from('discussion_threads').insert({
      topic_id: newThreadTopicId,
      user_id: user.id,
      title: newThreadTitle.trim(),
      content: newThreadContent.trim(),
      is_anonymous: isAnonymous,
    });

    setNewThreadTitle('');
    setNewThreadContent('');
    setNewThreadTopicId('');
    setIsAnonymous(false);
    setShowNewThread(false);
    await loadThreads();
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Discussions</h1>
          <p className="text-gray-400">
            Ask questions, share insights, and learn from the community
          </p>
        </div>
        <button
          onClick={() => setShowNewThread(!showNewThread)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Thread</span>
        </button>
      </div>

      {showNewThread && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Create New Thread</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Topic</label>
              <select
                value={newThreadTopicId}
                onChange={(e) => setNewThreadTopicId(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a topic</option>
                {topics.map(topic => (
                  <option key={topic.id} value={topic.id}>{topic.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Title</label>
              <input
                type="text"
                value={newThreadTitle}
                onChange={(e) => setNewThreadTitle(e.target.value)}
                placeholder="What's your question?"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Description</label>
              <textarea
                value={newThreadContent}
                onChange={(e) => setNewThreadContent(e.target.value)}
                placeholder="Provide more details..."
                rows={5}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="anonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 bg-gray-800 border-gray-700 rounded"
              />
              <label htmlFor="anonymous" className="text-sm text-gray-400">
                Post anonymously
              </label>
            </div>
            <div className="flex gap-3">
              <button
                onClick={createThread}
                disabled={!newThreadTitle.trim() || !newThreadContent.trim() || !newThreadTopicId}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                Post Thread
              </button>
              <button
                onClick={() => setShowNewThread(false)}
                className="bg-gray-800 hover:bg-gray-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {threads.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No discussions yet. Start a conversation!</p>
          </div>
        ) : (
          threads.map(thread => (
            <Link
              key={thread.id}
              to={`/discussions/${thread.id}`}
              className="bg-gray-900 border border-gray-800 rounded-lg p-5 hover:border-gray-700 transition-all block group"
            >
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center gap-1">
                  <button className="p-2 hover:bg-gray-800 rounded transition-colors">
                    <ThumbsUp className="w-4 h-4 text-gray-400" />
                  </button>
                  <span className="text-sm text-gray-400">{thread.upvotes}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white group-hover:text-blue-400 transition-colors font-medium mb-1">
                    {thread.title}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-2 mb-2">
                    {thread.content}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="px-2 py-1 bg-gray-800 rounded">
                      {thread.topic.title}
                    </span>
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{thread.is_anonymous ? 'Anonymous' : 'User'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      <span>{thread.replyCount} replies</span>
                    </div>
                    <span>{new Date(thread.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
