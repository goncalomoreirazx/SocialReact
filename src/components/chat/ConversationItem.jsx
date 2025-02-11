import { formatDistanceToNow } from 'date-fns';

function ConversationItem({ chat }) {
  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
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
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {chat.username}
            </h3>
            {chat.last_message_time && (
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(chat.last_message_time), { addSuffix: true })}
              </span>
            )}
          </div>
          
          <p className="text-sm text-gray-500 truncate">
            {chat.last_message || 'No messages yet'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ConversationItem;