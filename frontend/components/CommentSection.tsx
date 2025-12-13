'use client';

import { useState } from 'react';
import { MessageCircle, ThumbsUp, Reply, Send } from 'lucide-react';
import { useAccount } from 'wagmi';

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: number;
  likes: number;
  replies: Comment[];
  hasLiked?: boolean;
}

interface CommentSectionProps {
  marketAddress: string;
}

export function CommentSection({ marketAddress }: CommentSectionProps) {
  const { address, isConnected } = useAccount();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');

  const handleSubmitComment = () => {
    if (!newComment.trim() || !isConnected) return;

    const comment: Comment = {
      id: `comment_${Date.now()}`,
      author: address!,
      content: newComment,
      timestamp: Date.now(),
      likes: 0,
      replies: [],
    };

    setComments([comment, ...comments]);
    setNewComment('');
  };

  const handleLike = (commentId: string) => {
    setComments(comments.map((c) =>
      c.id === commentId ? { ...c, likes: c.likes + (c.hasLiked ? -1 : 1), hasLiked: !c.hasLiked } : c
    ));
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === 'popular') return b.likes - a.likes;
    return b.timestamp - a.timestamp;
  });

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-6 h-6 text-emerald-400" />
          <h3 className="text-lg font-bold text-white">
            Discussion ({comments.length})
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSortBy('recent')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              sortBy === 'recent'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-slate-700/50 text-slate-400 hover:text-white'
            }`}
          >
            Recent
          </button>
          <button
            onClick={() => setSortBy('popular')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              sortBy === 'popular'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-slate-700/50 text-slate-400 hover:text-white'
            }`}
          >
            Popular
          </button>
        </div>
      </div>

      {/* Comment Input */}
      {isConnected ? (
        <div className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700/60 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all resize-none"
            rows={3}
          />
          <div className="flex items-center justify-end gap-2 mt-2">
            <button
              onClick={handleSubmitComment}
              disabled={!newComment.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-500 rounded-lg text-white font-semibold transition-all"
            >
              <Send className="w-4 h-4" />
              Comment
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-slate-900/60 border border-slate-700/60 rounded-lg text-center">
          <p className="text-slate-400 text-sm">Connect your wallet to join the discussion</p>
        </div>
      )}

      {/* Comments List */}
      {sortedComments.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedComments.map((comment) => (
            <div key={comment.id} className="bg-slate-900/40 rounded-lg p-4 border border-slate-700/40">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {comment.author.slice(2, 4).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-white">
                      {comment.author.slice(0, 6)}...{comment.author.slice(-4)}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatTimestamp(comment.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 mb-3">{comment.content}</p>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLike(comment.id)}
                      className={`flex items-center gap-1 text-xs ${
                        comment.hasLiked ? 'text-emerald-400' : 'text-slate-400 hover:text-white'
                      } transition-colors`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{comment.likes}</span>
                    </button>
                    <button
                      onClick={() => setReplyTo(comment.id)}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      <Reply className="w-3.5 h-3.5" />
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

