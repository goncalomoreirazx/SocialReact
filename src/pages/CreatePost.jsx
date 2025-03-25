import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CreatePost() {
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('New post:', content);
    navigate('/');
  };

  return (
    <div className="card max-w-2xl mx-auto animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Create Post</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          className="w-full p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[150px] transition-all duration-200"
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        ></textarea>
        <div className="flex justify-end">
          <button 
            type="submit" 
            className="btn-primary flex items-center gap-2"
            disabled={!content.trim()}
          >
            Post
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreatePost;