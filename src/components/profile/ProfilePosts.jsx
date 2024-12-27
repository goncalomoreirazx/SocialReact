import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProfilePosts = ({ userId }) => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/users/${userId}/posts`);
        setPosts(response.data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };
    fetchPosts();
  }, [userId]);

  return (
    <div className="space-y-4">
      {posts?.map((post) => (
        <div key={post.id} className="bg-white rounded-lg shadow p-4">
          {post.content}
        </div>
      ))}
    </div>
  );
};

export default ProfilePosts;