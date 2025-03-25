// src/components/post/ReplyReactions.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';

// Common emoji reactions (same as in SimplifiedCommentReactions)
const COMMON_REACTIONS = [
  { emoji: '👍', name: 'thumbs_up' },
  { emoji: '❤️', name: 'heart' },
  { emoji: '😂', name: 'laugh' },
  { emoji: '😮', name: 'wow' },
  { emoji: '😢', name: 'sad' },
  { emoji: '😡', name: 'angry' }
];

const ReplyReactions = ({ replyId, showPicker, onClose }) => {
  const [reactions, setReactions] = useState([]);
  const [userReaction, setUserReaction] = useState(null);
  const { token, user } = useAuth();
  const pickerRef = useRef(null);
  const isAuthenticated = !!token && !!user;

  // Fetch reactions for this reply
  useEffect(() => {
    const fetchReactions = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/reply-reactions/${replyId}`);
        if (response.ok) {
          const data = await response.json();
          setReactions(data.reactionCounts || []);
        }
      } catch (error) {
        console.error('Error fetching reactions:', error);
      }
    };

    fetchReactions();
  }, [replyId]);

  // Get the user's reaction if they're authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const fetchUserReaction = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/reply-reactions/${replyId}/user`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setUserReaction(data.reaction);
          }
        } catch (error) {
          console.error('Error fetching user reaction:', error);
        }
      };

      fetchUserReaction();
    }
  }, [replyId, token, isAuthenticated]);

  // Close reaction picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        if (onClose) onClose();
      }
    };
    
    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPicker, onClose]);
  
  const handleAddReaction = async (reaction) => {
    if (!isAuthenticated) return;
    
    try {
      // Check if this is the same as user's current reaction
      const isRemovingReaction = userReaction === reaction.name;
      
      if (isRemovingReaction) {
        // Remove reaction
        const response = await fetch(`http://localhost:5000/api/reply-reactions/${replyId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setReactions(data.reactionCounts || []);
          setUserReaction(null);
        }
      } else {
        // Add or update reaction
        const response = await fetch(`http://localhost:5000/api/reply-reactions/${replyId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ reactionType: reaction.name })
        });
        
        if (response.ok) {
          const data = await response.json();
          setReactions(data.reactionCounts || []);
          setUserReaction(reaction.name);
        }
      }
    } catch (error) {
      console.error('Error managing reaction:', error);
    } finally {
      if (onClose) onClose();
    }
  };

  // Get emoji from reaction type
  const getEmojiFromType = (type) => {
    const found = COMMON_REACTIONS.find(r => r.name === type);
    return found ? found.emoji : '👍';
  };

  return (
    <div className="relative">
      {/* Reactions display */}
      {reactions.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {reactions.map((reaction) => (
            <button
              key={reaction.reaction_type}
              className={`inline-flex items-center gap-px px-1 py-0.5 rounded-full text-xs transition-all 
                ${userReaction === reaction.reaction_type
                  ? 'bg-blue-100 text-blue-600 shadow-sm' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              onClick={() => handleAddReaction({ name: reaction.reaction_type, emoji: getEmojiFromType(reaction.reaction_type) })}
              disabled={!isAuthenticated}
            >
              <span className="mr-0.5 text-sm">{getEmojiFromType(reaction.reaction_type)}</span>
              <span className="text-[8px] font-semibold">{reaction.count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Reaction Picker */}
      {showPicker && isAuthenticated && (
        <div 
          ref={pickerRef}
          className="absolute z-10 bg-white rounded-lg shadow-lg border border-gray-200 p-1.5 flex mt-1 top-6 gap-0.5 animate-fade-scale origin-top"
        >
          {COMMON_REACTIONS.map((reaction) => (
            <button
              key={reaction.name}
              className={`w-6 h-6 flex items-center justify-center text-lg hover:bg-gray-100 rounded-full transition-all 
                hover:scale-110 hover:shadow-sm
                ${userReaction === reaction.name ? 'bg-blue-100' : ''}`}
              onClick={() => handleAddReaction(reaction)}
            >
              {reaction.emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReplyReactions;