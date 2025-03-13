// src/components/post/CommentItem.jsx
import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { TrashIcon, ArrowUturnLeftIcon, FaceSmileIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import CommentReplyForm from './CommentReplyForm';
import CommentRepliesList from './CommentRepliesList';
import SimplifiedCommentReactions from './SimplifiedCommentReactions';

const CommentItem = ({ comment, onDelete }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replyCount, setReplyCount] = useState(comment.replies_count || 0);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const { user, token } = useAuth();

  // Fetch actual reply count when the component mounts
  useEffect(() => {
    const fetchReplyCount = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/comment-replies/${comment.id}/count`);
        if (response.ok) {
          const data = await response.json();
          setReplyCount(data.count || 0);
          
          // If there are replies, automatically show them
          if (data.count > 0) {
            setShowReplies(true);
          }
        }
      } catch (error) {
        console.error('Error fetching reply count:', error);
      }
    };

    fetchReplyCount();
  }, [comment.id]);

  const formatTimeAgo = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return 'some time ago';
    }
  };

  const handleReplyAdded = () => {
    setReplyCount(prevCount => prevCount + 1);
    setShowReplies(true); // Show replies when a new one is added
    setShowReplyForm(false); // Hide the reply form after submitting
  };

  const toggleReplies = () => {
    setShowReplies(prevState => !prevState);
  };

  return (
    <div className="flex space-x-3 animate-fade-in">
      {/* User avatar */}
      <div className="flex-shrink-0">
        <div className="avatar w-8 h-8">
          <div className="avatar-inner">
            <img 
              src={comment.profile_picture ? `http://localhost:5000/uploads/${comment.profile_picture}` : '/default-avatar.png'} 
              alt={comment.username}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/default-avatar.png';
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Comment content */}
      <div className="flex-1 min-w-0">
        <div className="bg-gray-100 rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-200 relative group">
          <div className="flex justify-between items-start">
            <p className="font-medium text-gray-900 text-sm hover:text-blue-600 cursor-pointer transition-colors">{comment.username}</p>
            
            {/* Delete button (visible only to comment author) */}
            {user && (user.id === comment.user_id) && (
              <button 
                onClick={() => onDelete(comment.id)}
                className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-50"
                aria-label="Delete comment"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <p className="text-gray-800 mt-1 text-sm whitespace-pre-line break-words">{comment.content}</p>
          
          {/* Comment reactions - with controlled visibility */}
          <SimplifiedCommentReactions 
            commentId={comment.id} 
            showPicker={showReactionPicker} 
            onClose={() => setShowReactionPicker(false)} 
          />
          
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-500">{formatTimeAgo(comment.created_at)}</p>
            
            <div className="flex space-x-2">
              {/* Reply button */}
              <button 
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-xs text-gray-500 hover:text-blue-500 flex items-center gap-1 transition-colors px-2 py-1 rounded-full hover:bg-blue-50"
              >
                <ArrowUturnLeftIcon className="h-3 w-3" />
                Reply
              </button>
              
              {/* React button */}
              <button 
                onClick={() => setShowReactionPicker(!showReactionPicker)}
                className="text-xs text-gray-500 hover:text-blue-500 flex items-center gap-1 transition-colors px-2 py-1 rounded-full hover:bg-blue-50"
              >
                <FaceSmileIcon className="h-3 w-3" />
                React
              </button>
            </div>
          </div>
        </div>
        
        {/* Reply count and toggle */}
        {replyCount > 0 && (
          <div className="ml-2 mt-1.5">
            <button 
              onClick={toggleReplies}
              className="text-xs text-blue-500 hover:text-blue-700 transition-colors flex items-center gap-1"
            >
              <span className="w-4 h-0.5 bg-gray-200 rounded-full"></span>
              {showReplies ? 'Hide' : 'View'} {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
            </button>
          </div>
        )}
        
        {/* Reply form */}
        {showReplyForm && (
          <div className="mt-2 ml-2 animate-fade-scale origin-top">
            <CommentReplyForm 
              commentId={comment.id} 
              onReplyAdded={handleReplyAdded}
              onCancel={() => setShowReplyForm(false)}
            />
          </div>
        )}
        
        {/* Replies list */}
        {showReplies && (
          <div className="mt-2 ml-6 animate-fade-in">
            <CommentRepliesList commentId={comment.id} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;