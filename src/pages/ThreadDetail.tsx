import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ChevronLeft, ThumbsUp, User, Send } from 'lucide-react';

interface ThreadData {
  id: string;
  title: string;
  content: string;
  is_anonymous: boolean;
  upvotes: number;
  created_at: string;
  topic: {
    id: string;
    title: string;
  };
}

interface Reply {
  id: string;
  content: string;
  is_anonymous: boolean;
  upvotes: number;
  created_at: string;
}

export function ThreadDetail() {
  const { threadId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [thread, setThread] = useState<ThreadData | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [newReply, setNewReply] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadThread();
  }, [threadId]);

  const loadThread = async () => {
    if (!threadId) return;

    const { data: threadData } = await supabase
      .from('discussion_threads')
      .select(`
        id,
        title,
        content,
        is_anonymous,
        upvotes,
        created_at,
        topic:topics (
          id,
          title
        )
      `)
      .eq('id', threadId)
      .maybeSingle();

    if (!threadData) {
      setLoading(false);
      return;
    }

    setThread(threadData);

    const { data: repliesData } = await supabase
      .from('discussion_replies')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at');

    setReplies(repliesData || []);
    setLoading(false);
  };

  const submitReply = async () => {
    if (!user || !threadId || !newReply.trim()) return;

    setSubmitting(true);

    await supabase.from('discussion_replies').insert({
      thread_id: threadId,
      user_id: user.id,
      content: newReply.trim(),
      is_anonymous: isAnonymous,
    });

    setNewReply('');
    setIsAnonymous(false);
    await loadThread();
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Thread not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
        <span>Back to Discussions</span>
      </button>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center gap-1">
            <button className="p-2 hover:bg-gray-800 rounded transition-colors">
              <ThumbsUp className="w-5 h-5 text-gray-400" />
            </button>
            <span className="text-sm text-gray-400">{thread.upvotes}</span>
          </div>
          <div className="flex-1">
            <div className="mb-2">
              <span className="text-xs px-2 py-1 bg-blue-600/10 text-blue-400 rounded border border-blue-600/30">
                {thread.topic.title}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">{thread.title}</h1>
            <p className="text-gray-300 whitespace-pre-wrap mb-4">{thread.content}</p>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{thread.is_anonymous ? 'Anonymous' : 'User'}</span>
              </div>
              <span>{new Date(thread.created_at).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
        </h2>

        <div className="space-y-4 mb-6">
          {replies.map(reply => (
            <div key={reply.id} className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <button className="p-1 hover:bg-gray-700 rounded transition-colors">
                  <ThumbsUp className="w-4 h-4 text-gray-400" />
                </button>
                <div className="flex-1">
                  <p className="text-gray-300 whitespace-pre-wrap mb-2">{reply.content}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{reply.is_anonymous ? 'Anonymous' : 'User'}</span>
                    </div>
                    <span>{new Date(reply.created_at).toLocaleString()}</span>
                    <span>{reply.upvotes} upvotes</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-4">
          <h3 className="text-sm font-medium text-white mb-3">Add Your Reply</h3>
          <textarea
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
            placeholder="Share your thoughts or answer..."
            rows={4}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="reply-anonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 bg-gray-800 border-gray-700 rounded"
              />
              <label htmlFor="reply-anonymous" className="text-sm text-gray-400">
                Reply anonymously
              </label>
            </div>
            <button
              onClick={submitReply}
              disabled={submitting || !newReply.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Posting...' : 'Post Reply'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
