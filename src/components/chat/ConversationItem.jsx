import { formatDistanceToNow } from 'date-fns';

function ConversationItem({ chat }) {
  const hasUnreadMessages = chat.unread_count > 0;

  return (
    <div className={`p-4 transition-colors ${hasUnreadMessages ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'}`}>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <img
            src={chat.profile_picture 
              ? `http://localhost:5000/uploads/${chat.profile_picture}`
              : '/default-avatar.png'
            }
            alt={chat.username}
            className="w-12 h-12 rounded-full object-cover"
          />
          {chat.status === 'online' && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-medium truncate ${hasUnreadMessages ? 'text-blue-600' : 'text-gray-900'}`}>
              {chat.username}
            </h3>
            <div className="flex items-center space-x-2">
              {hasUnreadMessages && (
                <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {chat.unread_count}
                </span>
              )}
              {chat.last_message_time && (
                <span className={`text-xs ${hasUnreadMessages ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                  {formatDistanceToNow(new Date(chat.last_message_time), { addSuffix: true })}
                </span>
              )}
            </div>
          </div>
          
          <p className={`text-sm truncate ${hasUnreadMessages ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
            {chat.last_message || 'No messages yet'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ConversationItem;