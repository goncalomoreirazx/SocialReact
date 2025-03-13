import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import CommentItem from './CommentItem';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

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
      console.log("Fetched comments:", data);
      
      if (page === 1) {
        setComments(data.comments || []);
      } else {
        setComments(prevComments => [...prevComments, ...(data.comments || [])]);
      }
      
      setHasMore(data.pagination?.hasMore || false);
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

  if (loading && comments.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-gray-500 text-sm">Loading comments...</p>
      </div>
    );
  }

  if (error && comments.length === 0) {
    return (
      <div className="p-4 text-center text-red-500 bg-red-50 rounded-lg my-4">
        <p>{error}</p>
        <button 
          onClick={fetchComments}
          className="mt-2 text-blue-500 hover:underline bg-white px-3 py-1 rounded-full shadow-sm text-sm"
        >
          Try again
        </button>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="p-6 text-center bg-gray-50 rounded-lg shadow-sm mt-2">
        <ChatBubbleLeftIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600 font-medium">No comments yet</p>
        <p className="text-gray-500 text-sm mt-1">Be the first to comment!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2">
      {comments.map(comment => (
        <CommentItem 
          key={comment.id} 
          comment={comment} 
          onDelete={handleDeleteComment} 
        />
      ))}
      
      {/* Load more button */}
      {hasMore && (
        <div className="text-center pt-2 pb-2">
          <button 
            onClick={handleLoadMore}
            disabled={loading}
            className="text-blue-500 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-full text-sm font-medium disabled:text-gray-400 disabled:bg-gray-100 transition-colors shadow-sm hover:shadow"
          >
            {loading ? (
              <span className="flex items-center justify-center space-x-2">
                <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                <span>Loading...</span>
              </span>
            ) : (
              'Load more comments'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default CommentsList;