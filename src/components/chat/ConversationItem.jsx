// ConversationItem.jsx
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

function ConversationItem({ chat }) {
  const lastMessageTime = chat.last_message_time 
    ? formatDistanceToNow(new Date(chat.last_message_time), { addSuffix: true })
    : '';

  return (
    <Link to={`/chat/${chat.id}`} className="block">
      <div className="card hover:bg-gray-50 transition-colors cursor-pointer p-4 bg-white rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              {chat.profile_picture ? (
                <img 
                  src={`http://localhost:5000/uploads/${chat.profile_picture}`}
                  alt={chat.username}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-xl text-gray-500">{chat.username[0].toUpperCase()}</span>
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{chat.username}</h3>
              <p className="text-gray-600 text-sm line-clamp-1">{chat.last_message}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">{lastMessageTime}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ConversationItem;