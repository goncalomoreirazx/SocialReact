// MessageInput.jsx
import { useState } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

function MessageInput({ onSubmit }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSubmit(message);
    setMessage('');
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t">
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
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