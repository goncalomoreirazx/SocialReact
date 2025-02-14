// ChatMessage.jsx - Update the component to show reply information
import { ReplyIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function ChatMessage({ message, onReply }) {
  const { content, sent_at, isSentByUser, replyTo, image_url } = message;
  
  const getImageUrl = (url) => {
    if (!url) return null;
    return url.startsWith('http') ? url : `http://localhost:5000${url}`;
  };
  
  return (
    <div className={`flex ${isSentByUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className="relative group">
        <button 
          onClick={() => onReply(message)}
          className={`absolute ${isSentByUser ? '-left-8' : '-right-8'} top-2 opacity-0 group-hover:opacity-100 transition-opacity`}
        >
          <ReplyIcon className="h-4 w-4 text-gray-500 hover:text-blue-500" />
        </button>
        
        <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isSentByUser 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-100 text-gray-900'
        }`}>
          {replyTo && (
            <div className={`text-sm mb-2 pb-2 border-b ${
              isSentByUser ? 'border-blue-400' : 'border-gray-300'
            }`}>
              <div className={`text-xs ${
                isSentByUser ? 'text-blue-100' : 'text-gray-500'
              }`}>
                Replying to {replyTo.sender_name}:
              </div>
              <div className="truncate">{replyTo.content}</div>
            </div>
          )}
          
          {content && <p className="mb-2">{content}</p>}
          
          {image_url && (
            <div className="mb-2">
              <img
                src={getImageUrl(image_url)}
                alt="Message attachment"
                className="max-w-full rounded-lg max-h-64 object-contain"
                onClick={() => window.open(getImageUrl(image_url), '_blank')}
                style={{ cursor: 'pointer' }}
              />
            </div>
          )}
          
          <p className={`text-xs ${
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