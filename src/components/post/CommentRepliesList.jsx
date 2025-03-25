// src/components/post/CommentRepliesList.jsx
import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { TrashIcon, ArrowUturnLeftIcon, FaceSmileIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import NestedReplyForm from './NestedReplyForm';
import ReplyReactions from './ReplyReactions';

const CommentRepliesList = ({ commentId }) => {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const { user, token } = useAuth();
  const [replyingTo, setReplyingTo] = useState(null);
  const [showReactionPicker, setShowReactionPicker] = useState({});

  useEffect(() => {
    fetchReplies();
  }, [commentId, page]);

  const fetchReplies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:5000/api/comment-replies/${commentId}?page=${page}&limit=5`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch replies');
      }
      
      const data = await response.json();
      
      if (page === 1) {
        setReplies(data.replies);
      } else {
        setReplies(prevReplies => [...prevReplies, ...data.replies]);
      }
      
      setHasMore(data.pagination.hasMore);
    } catch (error) {
      console.error('Error fetching replies:', error);
      setError('Failed to load replies');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReply = async (replyId) => {
    if (!token) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/comment-replies/${replyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete reply');
      }
      
      // Remove the deleted reply from the state
      setReplies(prevReplies => prevReplies.filter(reply => reply.id !== replyId));
    } catch (error) {
      console.error('Error deleting reply:', error);
      alert('Failed to delete reply');
    }
  };

  const handleReplyAdded = (newReply) => {
    // Add the new reply to the list
    setReplies(prevReplies => [newReply, ...prevReplies]);
    // Clear reply form
    setReplyingTo(null);
  };

  const toggleReactionPicker = (replyId) => {
    setShowReactionPicker(prev => ({
      ...prev,
      [replyId]: !prev[replyId]
    }));
  };

  const formatTimeAgo = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return 'some time ago';
    }
  };

  if (loading && replies.length === 0) {
    return (
      <div className="py-3 text-center">
        <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-gray-500 text-xs mt-1">Loading replies...</p>
      </div>
    );
  }

  if (error && replies.length === 0) {
    return (
      <div className="py-2 text-center text-red-500 text-xs bg-red-50 rounded-lg p-2">
        {error}
      </div>
    );
  }

  if (replies.length === 0) {
    return (
      <div className="py-2 text-center text-gray-500 text-xs bg-gray-50 rounded-lg p-2">
        No replies yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {replies.map((reply) => (
        <div key={reply.id} className="space-y-2 animate-fade-in">
          <div className="flex space-x-2">
            {/* User avatar */}
            <div className="flex-shrink-0">
              <div className="avatar w-6 h-6">
                <div className="avatar-inner">
                  <img 
                    src={reply.profile_picture ? `http://localhost:5000/uploads/${reply.profile_picture}` : '/default-avatar.png'} 
                    alt={reply.username}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                </div>
              </div>
            </div>
            
            {/* Reply content */}
            <div className="flex-1 min-w-0">
              <div className="bg-gray-100 rounded-lg p-2 relative group hover:shadow-sm transition-all duration-200">
                <div className="flex justify-between items-start">
                  <p className="font-medium text-gray-900 text-xs hover:text-blue-600 transition-colors">{reply.username}</p>
                  
                  {/* Delete button (visible only to reply author) */}
                  {user && (user.id === reply.user_id) && (
                    <button 
                      onClick={() => handleDeleteReply(reply.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-50"
                      aria-label="Delete reply"
                    >
                      <TrashIcon className="h-3 w-3" />
                    </button>
                  )}
                </div>
                
                {/* If this is a reply to another reply, show who they're replying to */}
                {reply.parent_reply_id && (
                  <div className="text-gray-500 text-xs mb-1 bg-gray-200 bg-opacity-50 px-1.5 py-0.5 rounded inline-block">
                    Replying to @{reply.parent_username || "someone"}
                  </div>
                )}
                
                <p className="text-gray-800 text-xs whitespace-pre-line break-words">{reply.content}</p>
                
                {/* Reply reactions component */}
                <ReplyReactions 
                  replyId={reply.id}
                  showPicker={showReactionPicker[reply.id] || false}
                  onClose={() => setShowReactionPicker(prev => ({...prev, [reply.id]: false}))}
                />
                
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[10px] text-gray-500">{formatTimeAgo(reply.created_at)}</p>
                  
                  <div className="flex space-x-2">
                    {/* Reply button */}
                    <button 
                      onClick={() => setReplyingTo(reply.id === replyingTo ? null : reply.id)}
                      className="text-[10px] text-gray-500 hover:text-blue-500 flex items-center gap-0.5 transition-colors px-1.5 py-0.5 rounded-full hover:bg-blue-50"
                    >
                      <ArrowUturnLeftIcon className="h-2.5 w-2.5" />
                      Reply
                    </button>
                    
                    {/* React button */}
                    <button 
                      onClick={() => toggleReactionPicker(reply.id)}
                      className="text-[10px] text-gray-500 hover:text-blue-500 flex items-center gap-0.5 transition-colors px-1.5 py-0.5 rounded-full hover:bg-blue-50"
                    >
                      <FaceSmileIcon className="h-2.5 w-2.5" />
                      React
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Nested reply form */}
          {replyingTo === reply.id && (
            <div className="ml-8 animate-fade-scale origin-top">
              <NestedReplyForm 
                replyId={reply.id}
                parentCommentId={commentId}
                onReplyAdded={handleReplyAdded}
                onCancel={() => setReplyingTo(null)}
              />
            </div>
          )}
        </div>
      ))}
      
      {/* Load more button */}
      {hasMore && (
        <div className="text-center mt-2">
          <button 
            onClick={() => setPage(prevPage => prevPage + 1)}
            disabled={loading}
            className="text-blue-500 hover:text-blue-700 text-xs font-medium disabled:text-gray-400 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full transition-colors"
          >
            {loading ? 'Loading...' : 'Load more replies'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CommentRepliesList;