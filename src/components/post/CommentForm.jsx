import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { FaceSmileIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import EmojiPicker from 'emoji-picker-react';

const CommentForm = ({ postId, onCommentAdded }) => {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { token, user } = useAuth();
  const textareaRef = useRef(null);
  const emojiPickerRef = useRef(null);

  // Adjust textarea height on input
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
    }
  }, [comment]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current && 
        !emojiPickerRef.current.contains(event.target) &&
        !event.target.closest('button[data-emoji-button="true"]')
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!comment.trim() || loading) return;
    
    try {
      setLoading(true);
      
      const response = await fetch(`http://localhost:5000/api/comments/${postId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: comment.trim() })
      });
      
      if (!response.ok) {
        throw new Error('Failed to add comment');
      }
      
      const result = await response.json();
      
      // Reset form
      setComment('');
      
      // Notify parent component
      if (onCommentAdded) {
        onCommentAdded(result.comment);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setLoading(false);
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  // Handle emoji selection
  const onEmojiClick = (emojiObject) => {
    // Insert emoji at cursor position or at the end
    const cursorPosition = textareaRef.current?.selectionStart || comment.length;
    const textBeforeCursor = comment.slice(0, cursorPosition);
    const textAfterCursor = comment.slice(cursorPosition);
    
    setComment(textBeforeCursor + emojiObject.emoji + textAfterCursor);
    setShowEmojiPicker(false);
    
    // Focus back on textarea and place cursor after inserted emoji
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursorPosition = cursorPosition + emojiObject.emoji.length;
        textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
        
        // Update textarea height
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
      }
    }, 0);
  };

  if (!user || !token) {
    return (
      <div className="text-center py-3 text-gray-500 text-sm border-t mt-4 rounded-lg bg-gray-50 p-4">
        Please log in to add a comment
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 pt-3 border-t">
      <div className="flex items-start space-x-3">
        {/* User avatar */}
        <div className="flex-shrink-0">
          <div className="avatar w-9 h-9">
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
        
        {/* Comment input */}
        <div className="flex-1 min-w-0 relative">
          <textarea
            ref={textareaRef}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full p-2.5 bg-gray-100 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all duration-200 pr-10 min-h-[40px] text-sm shadow-sm hover:shadow-md border border-gray-200"
            rows="1"
          />
          
          {/* Emoji button */}
          <button
            type="button"
            data-emoji-button="true"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="absolute right-2 bottom-2 text-gray-500 hover:text-blue-500 transition-colors p-1.5 rounded-full hover:bg-blue-50"
            aria-label="Add emoji"
          >
            <FaceSmileIcon className="h-5 w-5" />
          </button>
          
          {/* Emoji picker */}
          {showEmojiPicker && (
            <div
              ref={emojiPickerRef}
              className="absolute bottom-full right-0 mb-2 z-50 shadow-lg rounded-lg overflow-hidden"
            >
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                searchDisabled={false}
                skinTonesDisabled={true}
                width={300}
                height={400}
                previewConfig={{ showPreview: false }}
                lazyLoadEmojis={true}
              />
            </div>
          )}
        </div>
        
        {/* Submit button - Moved outside the input area */}
        <button
          type="submit"
          disabled={!comment.trim() || loading}
          className="flex-shrink-0 mt-1 p-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-500 disabled:text-gray-400 transition-colors disabled:bg-gray-100"
          aria-label="Send comment"
        >
          {loading ? (
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          ) : (
            <PaperAirplaneIcon className="h-5 w-5" />
          )}
        </button>
      </div>
    </form>
  );
};

export default CommentForm;