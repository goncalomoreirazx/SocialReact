import React from 'react';
import { HeartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { UserCircleIcon } from '@heroicons/react/24/solid';

const Post = ({ post }) => {
  // Function to get the full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return imagePath.startsWith('http') 
      ? imagePath 
      : `http://localhost:5000${imagePath}`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 animate-fade-in">
      <div className="flex items-center mb-4">
        <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
          {post.profile_picture ? (
            <img
              src={getImageUrl(post.profile_picture)}
              alt={post.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <UserCircleIcon className="w-12 h-12 text-gray-400" />
          )}
        </div>
        <div className="ml-3">
          <p className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors">
            {post.username || 'Anonymous User'}
          </p>
          <p className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(post.created_at || post.timestamp), { addSuffix: true })}
          </p>
        </div>
      </div>
      
      <p className="mb-4 text-gray-800 leading-relaxed">{post.content}</p>
      
      {post.image && (
        <div className="mb-6 rounded-lg overflow-hidden">
          <img
            src={getImageUrl(post.image)}
            alt="Post content"
            className="w-full h-auto object-cover hover:scale-[1.02] transition-transform cursor-pointer"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/placeholder-image.jpg'; // You can add a placeholder image
            }}
          />
        </div>
      )}
      
      <div className="flex items-center space-x-6 text-gray-500 border-t pt-4">
        <button className="flex items-center space-x-2 hover:text-pink-500 transition-colors group">
          <HeartIcon className="h-6 w-6 group-hover:scale-110 transition-transform" />
          <span className="font-medium">{post.likes || 0}</span>
        </button>
        <button className="flex items-center space-x-2 hover:text-blue-500 transition-colors group">
          <ChatBubbleLeftIcon className="h-6 w-6 group-hover:scale-110 transition-transform" />
          <span className="font-medium">{post.comments || 0}</span>
        </button>
      </div>
    </div>
  );
};

export default Post;