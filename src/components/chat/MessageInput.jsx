import { useState, useEffect, useCallback, useRef } from 'react';
import { PaperAirplaneIcon, FaceSmileIcon } from '@heroicons/react/24/solid';
import { useChat } from '../../hooks/useChat';
import EmojiPicker from 'emoji-picker-react';

function MessageInput({ onSubmit, friendId }) {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { startTyping, stopTyping } = useChat();
  const [typingTimeout, setTypingTimeout] = useState(null);
  const emojiPickerRef = useRef(null);
  const textareaRef = useRef(null);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  const handleTyping = useCallback(() => {
    startTyping(friendId);
    
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    const timeout = setTimeout(() => {
      stopTyping(friendId);
    }, 1000);
    
    setTypingTimeout(timeout);
  }, [friendId, startTyping, stopTyping, typingTimeout]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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
    stopTyping(friendId);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const onEmojiClick = (emojiObject) => {
    setMessage(prevMessage => prevMessage + emojiObject.emoji);
    handleTyping();
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t">
      <div className="flex items-center space-x-2">
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
              adjustTextareaHeight();
            }}
            placeholder="Type a message..."
            className="w-full p-2 pl-4 pr-4 border rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none overflow-y-auto min-h-[40px]"
            rows="1"
            style={{ lineHeight: '20px' }}
          />
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <FaceSmileIcon className="h-5 w-5" />
          </button>
          {showEmojiPicker && (
            <div
              ref={emojiPickerRef}
              className="absolute bottom-12 right-0 z-50"
            >
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                autoFocusSearch={false}
                width={300}
                height={400}
              />
            </div>
          )}
        </div>

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