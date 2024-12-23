import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

function ConversationItem({ chat }) {
  return (
    <Link to={`/chat/${chat.id}`} className="block">
      <div className="card hover:bg-gray-50 transition-colors cursor-pointer">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="avatar">
              <div className="h-12 w-12 avatar-inner"></div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{chat.user}</h3>
              <p className="text-gray-600 text-sm line-clamp-1">{chat.lastMessage}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">
              {formatDistanceToNow(chat.timestamp, { addSuffix: true })}
            </p>
            {chat.unread > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-500 text-white text-xs font-medium rounded-full">
                {chat.unread}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ConversationItem;