import React, { useState, useEffect } from "react";
import Post from "../components/Post";
import Posts from "../components/Posts";

function Feed() {
  const [allPosts, setAllPosts] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/posts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAllPosts(data.posts);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handlePostCreated = (newPost) => {
    const formattedPost = {
      ...newPost,
      user: newPost.username,
      timestamp: new Date(newPost.created_at),
      // Convert server image path to full URL if it exists
      image: newPost.image ? `http://localhost:5000${newPost.image}` : null
    };
    
    setAllPosts(prevPosts => [formattedPost, ...prevPosts]);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-8">
        <Posts onPostCreated={handlePostCreated} />
      </div>
      
      <div className="space-y-6">
        {allPosts.map(post => (
          <Post key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}

export default Feed;