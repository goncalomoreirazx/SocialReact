import React from 'react';
import { ArrowLeft, MoreVertical, Phone, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function ChatHeader({ user, isTyping }) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10 transition-colors duration-200">
      <div className="flex items-center">
        <button 
          onClick={() => navigate('/messages')}
          className="p-1 mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300 transition-colors duration-200 md:hidden"
          aria-label="Back to messages"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        
        <div className="relative flex-shrink-0">
          {user.profile_picture ? (
            <img 
              src={`http://localhost:5000/uploads/${user.profile_picture}`}
              alt={user.username}
              className="h-10 w-10 rounded-full object-cover border border-gray-200 dark:border-gray-600"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/default-avatar.png';
              }}
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white">
              <span className="text-lg font-medium">
                {user.username[0].toUpperCase()}
              </span>
            </div>
          )}
          
          <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${isTyping ? 'bg-green-500 animate-pulse' : 'bg-green-500'}`}></span>
        </div>
        
        <div className="ml-3 overflow-hidden">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{user.username}</h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center">
            {isTyping ? (
              <span className="flex items-center">
                Typing
                <span className="inline-flex ml-1">
                  <span className="animate-bounce mx-px h-1 w-1 rounded-full bg-gray-500 dark:bg-gray-400"></span>
                  <span className="animate-bounce mx-px h-1 w-1 rounded-full bg-gray-500 dark:bg-gray-400" style={{ animationDelay: '0.2s' }}></span>
                  <span className="animate-bounce mx-px h-1 w-1 rounded-full bg-gray-500 dark:bg-gray-400" style={{ animationDelay: '0.4s' }}></span>
                </span>
              </span>
            ) : (
              <>
                <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-1.5"></span>
                Online
              </>
            )}
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-1 sm:space-x-2">
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors duration-200 hidden sm:block">
          <Phone className="h-5 w-5" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors duration-200 hidden sm:block">
          <Video className="h-5 w-5" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors duration-200">
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

export default ChatHeader;