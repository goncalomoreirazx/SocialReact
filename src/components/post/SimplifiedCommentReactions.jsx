import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';

// Common emoji reactions
const COMMON_REACTIONS = [
  { emoji: '👍', name: 'thumbs_up' },
  { emoji: '❤️', name: 'heart' },
  { emoji: '😂', name: 'laugh' },
  { emoji: '😮', name: 'wow' },
  { emoji: '😢', name: 'sad' },
  { emoji: '😡', name: 'angry' }
];

const SimplifiedCommentReactions = ({ commentId, showPicker, onClose }) => {
  const [reactions, setReactions] = useState([]);
  const [userReaction, setUserReaction] = useState(null);
  const { token, user } = useAuth();
  const pickerRef = useRef(null);
  const isAuthenticated = !!token && !!user;

  // Fetch reactions for this comment
  useEffect(() => {
    const fetchReactions = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/comment-reactions/${commentId}`);
        if (response.ok) {
          const data = await response.json();
          setReactions(data.reactionCounts || []);
        }
      } catch (error) {
        console.error('Error fetching reactions:', error);
      }
    };

    fetchReactions();
  }, [commentId]);

  // Get the user's reaction if they're authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const fetchUserReaction = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/comment-reactions/${commentId}/user`, {
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
  }, [commentId, token, isAuthenticated]);

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
        const response = await fetch(`http://localhost:5000/api/comment-reactions/${commentId}`, {
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
        const response = await fetch(`http://localhost:5000/api/comment-reactions/${commentId}`, {
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
        <div className="flex flex-wrap gap-1 mt-2">
          {reactions.map((reaction) => (
            <button
              key={reaction.reaction_type}
              className={`inline-flex items-center py-0.5 px-2 rounded-full text-xs font-medium transition-all 
                ${userReaction === reaction.reaction_type
                  ? 'bg-blue-100 text-blue-700 shadow-sm hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => handleAddReaction({ name: reaction.reaction_type, emoji: getEmojiFromType(reaction.reaction_type) })}
              disabled={!isAuthenticated}
            >
              <span className="mr-1 text-base">{getEmojiFromType(reaction.reaction_type)}</span>
              <span>{reaction.count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Reaction Picker */}
      {showPicker && isAuthenticated && (
        <div 
          ref={pickerRef}
          className="absolute z-10 bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex mt-1 top-6 animate-fade-scale origin-top"
        >
          {COMMON_REACTIONS.map((reaction) => (
            <button
              key={reaction.name}
              className={`w-9 h-9 flex items-center justify-center text-xl hover:bg-gray-100 rounded-full transition-all duration-200 
                hover:scale-110 hover:shadow-sm
                ${userReaction === reaction.name ? 'bg-blue-100 text-blue-600' : 'text-gray-700'}`}
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

export default SimplifiedCommentReactions;