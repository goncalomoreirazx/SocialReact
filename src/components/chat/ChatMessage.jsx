import { formatDistanceToNow } from 'date-fns';

function ChatMessage({ message }) {
  const isSentByUser = message.sender === 'You';
  
  return (
    <div className={`flex ${isSentByUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`message-bubble ${isSentByUser ? 'message-bubble-sent' : 'message-bubble-received'}`}>
        <p>{message.content}</p>
        <p className={`text-xs mt-1 ${isSentByUser ? 'text-blue-100' : 'text-gray-500'}`}>
          {formatDistanceToNow(message.timestamp, { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}

export default ChatMessage;