import React, { useState } from 'react';
import { HeartIcon, ChatBubbleLeftIcon, ShareIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { formatDistanceToNow } from 'date-fns';
import { UserCircleIcon } from '@heroicons/react/24/solid';

const Post = ({ post }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Function to get the full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return imagePath.startsWith('http') 
      ? imagePath 
      : `http://localhost:5000${imagePath}`;
  };

  const handleLike = () => {
    if (liked) {
      setLikesCount(prev => prev - 1);
    } else {
      setLikesCount(prev => prev + 1);
    }
    setLiked(!liked);
  };

  const formatTimestamp = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return 'recently';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
      {/* Post Header */}
      <div className="p-4 sm:p-5 flex items-center">
        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center border border-gray-100">
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
            <UserCircleIcon className="w-full h-full text-gray-400" />
          )}
        </div>
        <div className="ml-3 flex-1 min-w-0">
          <p className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors truncate">
            {post.username || 'Anonymous User'}
          </p>
          <p className="text-xs sm:text-sm text-gray-500">
            {formatTimestamp(post.created_at || post.timestamp)}
          </p>
        </div>
      </div>
      
      {/* Post Content */}
      <div className="px-4 sm:px-5 pb-3">
        <p className="text-gray-800 leading-relaxed text-sm sm:text-base whitespace-pre-line">
          {post.content}
        </p>
      </div>
      
      {/* Post Image */}
      {post.image && (
        <div className="relative mb-2">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="animate-pulse w-8 h-8 rounded-full bg-gray-200"></div>
            </div>
          )}
          <img
            src={getImageUrl(post.image)}
            alt="Post content"
            className={`w-full h-auto max-h-[500px] object-contain bg-gray-50 transition-all duration-300 ${
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
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-t border-gray-100">
        <div className="flex items-center space-x-4 sm:space-x-6">
          <button 
            onClick={handleLike}
            className={`flex items-center space-x-1 sm:space-x-2 ${
              liked ? 'text-pink-500' : 'text-gray-500 hover:text-pink-500'
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
          <button className="flex items-center space-x-1 sm:space-x-2 text-gray-500 hover:text-blue-500 transition-colors group">
            <ChatBubbleLeftIcon className="h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-sm sm:text-base">{post.comments || 0}</span>
          </button>
        </div>
        <button className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100">
          <ShareIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default Post;