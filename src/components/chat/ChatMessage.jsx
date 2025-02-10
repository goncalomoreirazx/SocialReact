// ChatMessage.jsx
import { formatDistanceToNow } from 'date-fns';

function ChatMessage({ message }) {
  const { content, sent_at, isSentByUser } = message;
  
  return (
    <div className={`flex ${isSentByUser ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-[70%] rounded-lg px-4 py-2 ${
          isSentByUser 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        <p>{content}</p>
        <p className={`text-xs mt-1 ${
          isSentByUser ? 'text-blue-100' : 'text-gray-500'
        }`}>
          {formatDistanceToNow(new Date(sent_at), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}

export default ChatMessage;