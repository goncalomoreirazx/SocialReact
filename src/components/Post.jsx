import { HeartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

export function Post({ post }) {
  return (
    <div className="card animate-fade-in">
      <div className="flex items-center mb-4">
        <div className="avatar">
          <div className="h-12 w-12 avatar-inner"></div>
        </div>
        <div className="ml-3">
          <p className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors">
            {post.user}
          </p>
          <p className="text-sm text-gray-500">
            {formatDistanceToNow(post.timestamp, { addSuffix: true })}
          </p>
        </div>
      </div>
      
      <p className="mb-4 text-gray-800 leading-relaxed">{post.content}</p>
      
      {post.image && (
        <div className="mb-6 rounded-lg overflow-hidden">
          <img 
            src={post.image} 
            alt="Post content" 
            className="w-full h-auto object-cover hover:scale-[1.02] transition-transform cursor-pointer"
          />
        </div>
      )}
      
      <div className="flex items-center space-x-6 text-gray-500 border-t pt-4">
        <button className="flex items-center space-x-2 hover:text-pink-500 transition-colors group">
          <HeartIcon className="h-6 w-6 group-hover:scale-110 transition-transform" />
          <span className="font-medium">{post.likes}</span>
        </button>
        <button className="flex items-center space-x-2 hover:text-blue-500 transition-colors group">
          <ChatBubbleLeftIcon className="h-6 w-6 group-hover:scale-110 transition-transform" />
          <span className="font-medium">{post.comments}</span>
        </button>
      </div>
    </div>
  );
}