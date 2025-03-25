import React, { useState, useEffect } from 'react';
import { HeartIcon, ChatBubbleLeftIcon, ShareIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { formatDistanceToNow } from 'date-fns';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../contexts/AuthContext';
import CommentsList from './post/CommentsList';
import CommentForm from './post/CommentForm';

const Post = ({ post }) => {
  const [liked, setLiked] = useState(post.liked_by_user || post.liked || false);
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState(null);
  const [commentsCount, setCommentsCount] = useState(post.comments || 0);
  const { token, user } = useAuth();

  // Initialize like status from API
  useEffect(() => {
    if (token && user) {
      checkLikeStatus();
    }
  }, [post.id, token]);

  // Function to get the full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return imagePath.startsWith('http') 
      ? imagePath 
      : `http://localhost:5000${imagePath}`;
  };

  const checkLikeStatus = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/likes/${post.id}/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLiked(data.liked);
        setLikesCount(data.likesCount);
      }
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const handleLike = async () => {
    if (!token || !user) {
      // User must be logged in to like
      alert('Please log in to like posts');
      return;
    }

    try {
      // Optimistic update
      setLiked(!liked);
      setLikesCount(prevCount => liked ? prevCount - 1 : prevCount + 1);

      const response = await fetch(`http://localhost:5000/api/likes/${post.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to toggle like');
      }

      const data = await response.json();
      // Update with actual data from server
      setLiked(data.liked);
      setLikesCount(data.likesCount);
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update on error
      setLiked(!liked);
      setLikesCount(prevCount => liked ? prevCount + 1 : prevCount - 1);
    }
  };

  const handleCommentToggle = () => {
    setShowComments(!showComments);
  };

  const handleCommentAdded = (comment) => {
    setNewComment(comment);
    setCommentsCount(prevCount => prevCount + 1);
  };

  const formatTimestamp = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return 'recently';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
      {/* Post Header */}
      <div className="p-4 sm:p-5 flex items-center">
        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center border border-gray-100 dark:border-gray-600">
          {post.profile_picture ? (
            <img
              src={getImageUrl(post.profile_picture)}
              alt={post.username}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/default-avatar.png';
              }}
            />
          ) : (
            <UserCircleIcon className="w-full h-full text-gray-400 dark:text-gray-500" />
          )}
        </div>
        <div className="ml-3 flex-1 min-w-0">
          <p className="font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors truncate">
            {post.username || 'Anonymous User'}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {formatTimestamp(post.created_at || post.timestamp)}
          </p>
        </div>
      </div>
      
      {/* Post Content */}
      <div className="px-4 sm:px-5 pb-3">
        <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-sm sm:text-base whitespace-pre-line">
          {post.content}
        </p>
      </div>
      
      {/* Post Image */}
      {post.image && (
        <div className="relative mb-2">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
              <div className="animate-pulse w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600"></div>
            </div>
          )}
          <img
            src={getImageUrl(post.image)}
            alt="Post content"
            className={`w-full h-auto max-h-[500px] object-contain bg-gray-50 dark:bg-gray-900 transition-all duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/placeholder-image.jpg';
              setImageError(true);
              setImageLoaded(true);
            }}
          />
        </div>
      )}
      
      {/* Post Actions */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-4 sm:space-x-6">
          <button 
            onClick={handleLike}
            className={`flex items-center space-x-1 sm:space-x-2 ${
              liked ? 'text-pink-500 dark:text-pink-400' : 'text-gray-500 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400'
            } transition-colors group`}
            aria-label={liked ? "Unlike post" : "Like post"}
          >
            {liked ? (
              <HeartIconSolid className="h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-110 transition-transform" />
            ) : (
              <HeartIcon className="h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-110 transition-transform" />
            )}
            <span className="font-medium text-sm sm:text-base">{likesCount}</span>
          </button>
          <button 
            onClick={handleCommentToggle}
            className={`flex items-center space-x-1 sm:space-x-2 ${
              showComments ? 'text-blue-500 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400'
            } transition-colors group`}
            aria-label="Toggle comments"
          >
            <ChatBubbleLeftIcon className="h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-sm sm:text-base">{commentsCount}</span>
          </button>
        </div>
        <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <ShareIcon className="h-5 w-5" />
        </button>
      </div>
      
      {/* Comments Section */}
      {showComments && (
        <div className="px-4 sm:px-5 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          {/* Comments List */}
          <CommentsList 
            postId={post.id} 
            newComment={newComment}
          />
          
          {/* Comment Form */}
          <CommentForm 
            postId={post.id} 
            onCommentAdded={handleCommentAdded}
          />
        </div>
      )}
    </div>
  );
};

export default Post;