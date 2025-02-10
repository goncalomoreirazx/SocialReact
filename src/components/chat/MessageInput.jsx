// MessageInput.jsx
import { useState, useEffect, useCallback } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { useChat } from '../../hooks/useChat';

function MessageInput({ onSubmit, friendId }) {
  const [message, setMessage] = useState('');
  const { startTyping, stopTyping } = useChat();
  const [typingTimeout, setTypingTimeout] = useState(null);

  const handleTyping = useCallback(() => {
    startTyping(friendId);
    
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Set new timeout
    const timeout = setTimeout(() => {
      stopTyping(friendId);
    }, 1000);
    
    setTypingTimeout(timeout);
  }, [friendId, startTyping, stopTyping, typingTimeout]);

  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    onSubmit(message);
    setMessage('');
    
    // Stop typing indicator when message is sent
    stopTyping(friendId);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t">
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping();
          }}
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={!message.trim()}
          className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PaperAirplaneIcon className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
}

export default MessageInput;