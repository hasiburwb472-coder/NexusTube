
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface CommentSectionProps {
  targetId: string;
  targetType: 'video' | 'post';
}

const CommentSection: React.FC<CommentSectionProps> = ({ targetId, targetType }) => {
  const { user, getComments, addComment, toggleLike, isLiked } = useApp();
  const [newComment, setNewComment] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const comments = getComments(targetId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addComment(targetId, targetType, newComment);
      setNewComment('');
      setIsFocused(false);
    }
  };

  return (
    <div className="w-full mt-6">
      <h3 className="text-xl font-bold mb-6">{comments.length} Comments</h3>

      {/* Input Section */}
      <div className="flex gap-4 mb-8">
        <img src={user.avatar} className="w-10 h-10 rounded-full" alt="User" />
        <div className="flex-1">
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder="Add a comment..."
              className="w-full bg-transparent border-b border-[#3f3f3f] focus:border-white outline-none pb-2 transition-colors text-sm"
            />
            {isFocused && (
              <div className="flex justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsFocused(false);
                    setNewComment('');
                  }}
                  className="px-4 py-2 text-sm font-medium hover:bg-[#3f3f3f] rounded-full transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="px-4 py-2 bg-blue-600 text-sm font-medium rounded-full hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Comment
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Comments List */}
      <div className="flex flex-col gap-6">
        {comments.map((comment) => {
          const hasLiked = isLiked(comment.id);
          return (
            <div key={comment.id} className="flex gap-4">
              <img src={comment.authorAvatar} className="w-10 h-10 rounded-full" alt={comment.authorName} />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{comment.authorName}</span>
                  <span className="text-xs text-gray-500">{comment.timestamp}</span>
                </div>
                <p className="text-sm text-gray-200 mb-2">{comment.content}</p>
                <div className="flex items-center gap-4 text-gray-400">
                  <button 
                    onClick={() => toggleLike(comment.id, 'comment')}
                    className={`flex items-center gap-2 hover:text-white transition-colors ${hasLiked ? 'text-blue-500' : ''}`}
                  >
                    <ThumbsUp size={14} className={hasLiked ? 'fill-blue-500' : ''} />
                    <span className="text-xs">{comment.likes > 0 ? comment.likes : ''}</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-white transition-colors">
                    <ThumbsDown size={14} />
                  </button>
                  <button className="text-xs font-semibold hover:text-white transition-colors">
                    Reply
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {comments.length === 0 && (
            <div className="text-center text-gray-500 text-sm py-4">
                Be the first to comment!
            </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
