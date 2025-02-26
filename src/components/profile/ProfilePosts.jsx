import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { HeartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

const ProfilePosts = ({ userId }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/users/${userId}/posts`);
        setPosts(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError('Failed to load posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [userId]);

  // Function to get the full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return imagePath.startsWith('http') 
      ? imagePath 
      : `http://localhost:5000${imagePath}`;
  };

  if (loading) {
    return (
      <div className="mt-6 space-y-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="bg-white rounded-lg shadow animate-pulse p-4">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 bg-red-50 p-4 rounded-lg text-red-600 text-center">
        {error}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="mt-6 bg-gray-50 p-6 rounded-lg text-center">
        <p className="text-gray-500">No posts yet</p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      <h2 className="text-xl font-bold text-gray-900 px-2 sm:px-0">Posts</h2>
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200">
            <div className="p-4">
              <div className="mb-3">
                <p className="text-sm text-gray-500">
                  {post.created_at && formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </p>
              </div>
              
              <p className="text-gray-800 whitespace-pre-line mb-4">{post.content}</p>
              
              {post.image_url && (
                <div className="mb-4 rounded-lg overflow-hidden">
                  <img
                    src={getImageUrl(post.image_url)}
                    alt="Post content"
                    className="w-full h-auto object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-image.jpg';
                    }}
                  />
                </div>
              )}
              
              <div className="flex items-center space-x-6 text-gray-500 pt-2 border-t">
                <button className="flex items-center space-x-2 hover:text-pink-500 transition-colors">
                  <HeartIcon className="h-5 w-5" />
                  <span>{post.likes || 0}</span>
                </button>
                <button className="flex items-center space-x-2 hover:text-blue-500 transition-colors">
                  <ChatBubbleLeftIcon className="h-5 w-5" />
                  <span>{post.comments || 0}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfilePosts;