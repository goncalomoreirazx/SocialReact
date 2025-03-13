import React, { useState, useRef } from 'react';
import { PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../contexts/AuthContext';

const CommentReplyForm = ({ commentId, onReplyAdded, onCancel }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token, user } = useAuth();
  const textareaRef = useRef(null);

  // Auto-focus the textarea when the component mounts
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Auto-resize textarea as content changes
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [content]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim() || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`http://localhost:5000/api/comment-replies/${commentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: content.trim() })
      });
      
      if (!response.ok) {
        throw new Error('Failed to add reply');
      }
      
      const result = await response.json();
      
      // Reset form
      setContent('');
      
      // Notify parent component
      if (onReplyAdded) {
        onReplyAdded(result.reply);
      }
    } catch (error) {
      console.error('Error adding reply:', error);
      alert('Failed to add reply. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || !token) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-start space-x-2 bg-gray-50 p-2 rounded-lg shadow-sm">
      {/* User avatar */}
      <div className="flex-shrink-0">
        <div className="avatar w-6 h-6">
          <div className="avatar-inner">
            <img 
              src={user.profile_picture ? `http://localhost:5000/uploads/${user.profile_picture}` : '/default-avatar.png'} 
              alt={user.username}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/default-avatar.png';
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Reply input */}
      <div className="flex-1 min-w-0 relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a reply..."
          className="w-full p-2 bg-white rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-blue-400 transition-all duration-200 text-sm min-h-[32px] border border-gray-200 shadow-sm"
          rows="1"
        />
      </div>
      
      {/* Button group */}
      <div className="flex flex-col space-y-1">
        {/* Cancel button */}
        <button
          type="button"
          onClick={onCancel}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
          aria-label="Cancel reply"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
        
        {/* Submit button */}
        <button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className="p-1 text-blue-500 hover:text-blue-700 disabled:text-gray-400 transition-colors rounded-full hover:bg-blue-50 disabled:hover:bg-transparent"
          aria-label="Send reply"
        >
          {isSubmitting ? (
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          ) : (
            <PaperAirplaneIcon className="h-5 w-5" />
          )}
        </button>
      </div>
    </form>
  );
};

export default CommentReplyForm;