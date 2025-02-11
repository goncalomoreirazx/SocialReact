import { ReplyIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function ChatMessage({ message, onReply }) {
  const { content, sent_at, isSentByUser, replyTo } = message;
  
  return (
    <div className={`flex ${isSentByUser ? 'justify-end' : 'justify-start'}`}>
      <div className="relative group">
        {/* Reply button that appears on hover */}
        <button 
          onClick={() => onReply(message)}
          className={`absolute ${isSentByUser ? '-left-8' : '-right-8'} top-2 opacity-0 group-hover:opacity-100 transition-opacity`}
        >
          <ReplyIcon className="h-4 w-4 text-gray-500 hover:text-blue-500" />
        </button>
        
        <div className={`max-w-[70%] rounded-lg px-4 py-2 ${
          isSentByUser 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-100 text-gray-900'
        }`}>
          {/* Reply preview if this message is a reply */}
          {replyTo && (
            <div className={`text-sm mb-1 pb-1 border-b ${
              isSentByUser ? 'border-blue-400' : 'border-gray-300'
            }`}>
              <div className={`text-xs ${
                isSentByUser ? 'text-blue-100' : 'text-gray-500'
              }`}>
                Replying to:
              </div>
              <div className="truncate">{replyTo.content}</div>
            </div>
          )}
          
          <p>{content}</p>
          <p className={`text-xs mt-1 ${
            isSentByUser ? 'text-blue-100' : 'text-gray-500'
          }`}>
            {formatDistanceToNow(new Date(sent_at), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;