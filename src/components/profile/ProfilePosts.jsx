import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Post from "../Post"; // Import the Post component

const ProfilePosts = ({ userId }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/users/${userId}/posts`);
        
        // Format posts to match the structure expected by the Post component
        const formattedPosts = response.data.map(post => ({
          ...post,
          username: post.username || "User", // Ensure username exists
          profile_picture: post.profile_picture || null,
          image: post.image_url, // Rename image_url to image for Post component
          likes: post.likes || 0,
          comments: post.comments || 0
        }));
        
        setPosts(formattedPosts);
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
          <Post key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default ProfilePosts;