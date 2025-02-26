import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { CheckCheck } from 'lucide-react';

function ConversationItem({ chat }) {
  const hasUnreadMessages = chat.unread_count > 0;

  // Format time in a more readable way
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = new Date(now.setDate(now.getDate() - 1)).toDateString() === date.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (isYesterday) {
      return 'Yesterday';
    } else {
      // For older messages, use date-fns but with shorter format
      return formatDistanceToNow(date, { addSuffix: false });
    }
  };

  return (
    <div className={`p-3 sm:p-4 transition-colors duration-200 ${
      hasUnreadMessages 
        ? 'bg-blue-50 hover:bg-blue-100' 
        : 'hover:bg-gray-50'
    } border-b border-gray-100`}>
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden ${
            hasUnreadMessages ? 'ring-2 ring-blue-300' : ''
          }`}>
            <img
              src={chat.profile_picture 
                ? `http://localhost:5000/uploads/${chat.profile_picture}`
                : '/default-avatar.png'
              }
              alt={chat.username}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/default-avatar.png';
              }}
            />
          </div>
          
          {/* Online indicator */}
          {chat.status === 'online' && (
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0 py-0.5">
          <div className="flex items-center justify-between">
            <h3 className={`text-sm sm:text-base font-medium truncate ${
              hasUnreadMessages ? 'text-blue-700' : 'text-gray-900'
            }`}>
              {chat.username}
            </h3>
            
            {/* Time & notification */}
            <div className="flex items-center space-x-1 sm:space-x-2 ml-2 flex-shrink-0">
              {hasUnreadMessages ? (
                <span className="bg-blue-500 text-white text-xs rounded-full min-w-5 h-5 px-1 flex items-center justify-center">
                  {chat.unread_count}
                </span>
              ) : (
                chat.last_message && <CheckCheck className="h-4 w-4 text-gray-400" />
              )}
              
              {chat.last_message_time && (
                <span className={`text-xs whitespace-nowrap ${
                  hasUnreadMessages ? 'text-blue-600 font-medium' : 'text-gray-500'
                }`}>
                  {formatMessageTime(chat.last_message_time)}
                </span>
              )}
            </div>
          </div>
          
          {/* Preview message */}
          <div className="flex items-center mt-0.5">
            <p className={`text-xs sm:text-sm truncate ${
              hasUnreadMessages ? 'text-blue-600 font-medium' : 'text-gray-500'
            }`}>
              {chat.last_message || 'No messages yet'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConversationItem;