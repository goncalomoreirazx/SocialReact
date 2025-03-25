import React, { useState, useEffect, useRef } from "react";
import Post from "../components/Post";
import Posts from "../components/Posts";

function Feed() {
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const loaderRef = useRef(null);

  // Initial post loading
  useEffect(() => {
    fetchPosts();
  }, []);

  // Infinite scroll implementation
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMorePosts();
        }
      },
      { threshold: 0.5 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [hasMore, loading]);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    
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
        setHasMore(data.posts.length >= 10); // Assuming backend returns 10 posts per page
      } else {
        throw new Error('Failed to fetch posts');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const loadMorePosts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const nextPage = page + 1;
      const response = await fetch(`http://localhost:5000/api/posts?page=${nextPage}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.posts.length > 0) {
          setAllPosts(prevPosts => [...prevPosts, ...data.posts]);
          setPage(nextPage);
          setHasMore(data.posts.length >= 10);
        } else {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setLoading(false);
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

  const renderContent = () => {
    if (error) {
      return (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center my-8">
          <p>{error}</p>
          <button 
            onClick={fetchPosts}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (allPosts.length === 0 && !loading) {
      return (
        <div className="bg-white shadow-md rounded-lg p-8 text-center my-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No posts yet</h3>
          <p className="text-gray-600 mb-4">Be the first to share something with the community!</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {allPosts.map(post => (
          <Post key={post.id} post={post} />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-xl sm:max-w-2xl mx-auto py-4 sm:py-8 px-4">
      <div className="sticky top-16 z-10 pt-1 mb-6 bg-gradient-to-b from-gray-100 to-transparent pb-4">
        <Posts onPostCreated={handlePostCreated} />
      </div>
      
      {renderContent()}
      
      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center items-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Invisible loader element for intersection observer */}
      {hasMore && !loading && (
        <div ref={loaderRef} className="h-10 mt-6"></div>
      )}
      
      {/* End of feed indicator */}
      {!hasMore && allPosts.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          <span>You've reached the end of your feed</span>
        </div>
      )}
    </div>
  );
}

export default Feed;