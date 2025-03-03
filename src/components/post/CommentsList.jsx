import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const CommentsList = ({ postId, newComment }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { user, token } = useAuth();

  useEffect(() => {
    if (newComment) {
      // Add the new comment to the top of the list
      setComments(prevComments => [newComment, ...prevComments]);
    }
  }, [newComment]);

  useEffect(() => {
    fetchComments();
  }, [postId, page]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:5000/api/comments/${postId}?page=${page}&limit=5`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      
      const data = await response.json();
      
      if (page === 1) {
        setComments(data.comments);
      } else {
        setComments(prevComments => [...prevComments, ...data.comments]);
      }
      
      setHasMore(data.pagination.hasMore);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }
      
      // Remove the deleted comment from the state
      setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    }
  };

  const formatTimeAgo = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return 'some time ago';
    }
  };

  if (loading && comments.length === 0) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-gray-500 text-sm mt-2">Loading comments...</p>
      </div>
    );
  }

  if (error && comments.length === 0) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>{error}</p>
        <button 
          onClick={fetchComments}
          className="text-blue-500 hover:underline text-sm mt-2"
        >
          Try again
        </button>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No comments yet. Be the first to comment!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map(comment => (
        <div key={comment.id} className="flex space-x-3 animate-fade-in">
          {/* User avatar */}
          <div className="flex-shrink-0">
            <img 
              src={comment.profile_picture ? `http://localhost:5000/uploads/${comment.profile_picture}` : '/default-avatar.png'} 
              alt={comment.username}
              className="w-8 h-8 rounded-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/default-avatar.png';
              }}
            />
          </div>
          
          {/* Comment content */}
          <div className="flex-1 min-w-0">
            <div className="bg-gray-100 rounded-lg p-3 relative">
              <div className="flex justify-between items-start">
                <p className="font-medium text-gray-900 text-sm">{comment.username}</p>
                
                {/* Delete button (visible only to comment author or post owner) */}
                {user && (user.id === comment.user_id) && (
                  <button 
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full"
                    aria-label="Delete comment"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              <p className="text-gray-800 mt-1 text-sm whitespace-pre-line break-words">{comment.content}</p>
              
              <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(comment.created_at)}</p>
            </div>
          </div>
        </div>
      ))}
      
      {/* Load more button */}
      {hasMore && (
        <div className="text-center pt-2">
          <button 
            onClick={handleLoadMore}
            disabled={loading}
            className="text-blue-500 hover:text-blue-700 text-sm font-medium disabled:text-gray-400"
          >
            {loading ? 'Loading...' : 'Load more comments'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CommentsList;