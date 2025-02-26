import React, { useState, useRef } from 'react';
import { PhotoIcon, XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

const Posts = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [charCount, setCharCount] = useState(0);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const maxCharCount = 500; // Set maximum character limit

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size exceeds 5MB limit');
        return;
      }
      
      setError(null);
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.onerror = () => {
        setError('Failed to read image file');
        setImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    if (newContent.length <= maxCharCount) {
      setContent(newContent);
      setCharCount(newContent.length);
    }
    
    // Auto-resize the textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !image) return;

    setIsSubmitting(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('content', content);
      if (image) {
        formData.append('image', image);
      }

      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create post');
      }

      const newPost = await response.json();
      onPostCreated(newPost.post);
      
      // Reset form
      setContent('');
      setCharCount(0);
      setImage(null);
      setImagePreview(null);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 transition-all duration-300 hover:shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg">
            {error}
            <button 
              type="button" 
              className="ml-2 text-red-700 hover:underline" 
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
          </div>
        )}
        
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            placeholder="What's on your mind?"
            className="w-full p-3 sm:p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
            rows="2"
            maxLength={maxCharCount}
          />
          <div className={`text-xs text-right mt-1 ${charCount > maxCharCount * 0.8 ? 'text-orange-500' : 'text-gray-400'}`}>
            {charCount}/{maxCharCount}
          </div>
        </div>
        
        {imagePreview ? (
          <div className="relative bg-gray-50 p-2 rounded-lg border border-gray-100">
            <img
              src={imagePreview}
              alt="Preview"
              className="max-h-80 w-full object-contain rounded-lg"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-4 right-4 bg-gray-800 bg-opacity-50 text-white p-1.5 rounded-full hover:bg-opacity-70 transition-colors"
              aria-label="Remove image"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        ) : null}

        <div className="flex items-center justify-between border-t pt-3">
          <div className="flex gap-4">
            <label className="flex items-center space-x-1 text-gray-600 hover:text-blue-500 cursor-pointer transition-colors p-2 rounded-full hover:bg-blue-50">
              <PhotoIcon className="h-5 w-5" />
              <span className="text-sm hidden sm:inline">Photo</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || (!content.trim() && !image)}
            className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span className="hidden sm:inline">Posting...</span>
              </>
            ) : (
              <>
                <PaperAirplaneIcon className="h-4 w-4" />
                <span>Post</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Posts;