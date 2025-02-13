import { useState, useEffect, useCallback, useRef } from 'react';
import { PaperAirplaneIcon, FaceSmileIcon } from '@heroicons/react/24/solid';
import { Image, X } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../contexts/AuthContext';
import EmojiPicker from 'emoji-picker-react';

function MessageInput({ onSubmit, friendId }) {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const { startTyping, stopTyping } = useChat();
  const { token } = useAuth();
  const [typingTimeout, setTypingTimeout] = useState(null);
  const emojiPickerRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

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

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() && !selectedImage) return;
    
    try {
      const formData = new FormData();
      formData.append('receiverId', friendId);
      
      if (message.trim()) {
        formData.append('content', message.trim());
      } else {
        formData.append('content', ''); // Send empty string if no text
      }
      
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const response = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const newMessage = await response.json();
      
      // Call onSubmit with the new message
      onSubmit && onSubmit(newMessage);
      
      // Clear the form
      setMessage('');
      removeImage();
      stopTyping(friendId);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const onEmojiClick = (emojiObject) => {
    setMessage(prevMessage => prevMessage + emojiObject.emoji);
    handleTyping();
  };

  // Rest of your component remains the same...
  // (Keep the useEffect and return JSX as they were)

  return (
    <div className="p-4 border-t">
      {imagePreview && (
        <div className="mb-2 relative inline-block">
          <img 
            src={imagePreview} 
            alt="Selected" 
            className="max-h-32 rounded-lg"
          />
          <button
            onClick={removeImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
          ref={fileInputRef}
        />

        <div className="flex-1 relative flex items-center bg-white border rounded-full">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
              adjustTextareaHeight();
            }}
            placeholder="Type a message..."
            className="flex-1 p-2 pl-4 pr-4 rounded-full focus:outline-none resize-none overflow-y-auto min-h-[40px] max-h-32"
            rows="1"
            style={{ lineHeight: '20px' }}
          />
          
          <div className="flex items-center pr-2">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <FaceSmileIcon className="h-5 w-5" />
            </button>
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <Image className="h-5 w-5" />
            </button>
          </div>

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
          disabled={!message.trim() && !selectedImage}
          className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PaperAirplaneIcon className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}

export default MessageInput;