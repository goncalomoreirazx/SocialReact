import { useState, useEffect, useCallback, useRef } from 'react';
import { PaperAirplaneIcon, FaceSmileIcon } from '@heroicons/react/24/solid';
import { Image, X, Paperclip, Mic, Send } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import EmojiPicker from 'emoji-picker-react';

function MessageInput({ onSubmit, friendId, replyingTo }) {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const { startTyping, stopTyping } = useChat();
  const { token, user } = useAuth();
  const [typingTimeout, setTypingTimeout] = useState(null);
  const emojiPickerRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const formRef = useRef(null);
  const socket = useSocket();

  // Adjust textarea height automatically
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(Math.max(textarea.scrollHeight, 40), 150)}px`;
    }
  };

  // Handle typing status
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

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current && 
        !emojiPickerRef.current.contains(event.target) &&
        !event.target.closest('button[data-emoji-button="true"]')
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Reset textarea height when message is sent
  useEffect(() => {
    if (message === '' && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [message]);

  // Handle file selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit');
        return;
      }
      
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected image
  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!message.trim() && !selectedImage) || isUploading) return;
    
    try {
      setIsUploading(true);
      
      if (selectedImage) {
        // Handle image upload with HTTP
        const formData = new FormData();
        if (message.trim()) {
          formData.append('content', message.trim());
        }
        formData.append('receiverId', friendId);
        formData.append('image', selectedImage);
        
        if (replyingTo) {
          formData.append('replyToId', replyingTo.id);
        }
  
        console.log('Sending message with image via HTTP');
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
        console.log('Message with image sent successfully:', newMessage);
        
        // Submit the message to parent component
        onSubmit(newMessage);
        
        // Also emit via socket for better real-time consistency
        if (socket && socket.connected) {
          socket.emit('send_message', newMessage);
        }
      } else {
        // Text-only message via socket
        console.log('Sending text message via socket');
        const messageData = {
          content: message.trim(),
          receiverId: friendId,
          replyToId: replyingTo?.id,
          senderId: user.id // Ensure sender ID is included
        };
        
        // Submit to parent component
        onSubmit(messageData);
      }
      
      // Clear form
      setMessage('');
      setSelectedImage(null);
      setImagePreview(null);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      
      // Focus back on textarea
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
      
    } catch (error) {
      console.error('Error sending message:', error);
      // Show a more user-friendly error message
      alert('Failed to send message. Please check your connection and try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent default to avoid new line
      handleSubmit(e);
    }
  };

  // Handle emoji selection
  const onEmojiClick = (emojiObject) => {
    setMessage(prevMessage => {
      const cursorPosition = textareaRef.current?.selectionStart || prevMessage.length;
      const textBeforeCursor = prevMessage.slice(0, cursorPosition);
      const textAfterCursor = prevMessage.slice(cursorPosition);
      
      return textBeforeCursor + emojiObject.emoji + textAfterCursor;
    });
    
    setShowEmojiPicker(false);
    handleTyping();
    
    // Re-focus and adjust height after emoji insertion
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        adjustTextareaHeight();
      }
    }, 0);
  };

  return (
    <div className="p-2 sm:p-4 border-t border-gray-200 dark:border-gray-700">
      {/* Preview of selected image */}
      {imagePreview && (
        <div className="mb-3 relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 inline-flex bg-gray-50 dark:bg-gray-800">
          <img 
            src={imagePreview} 
            alt="Selected" 
            className="max-h-32 max-w-full object-contain"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-1 right-1 bg-gray-900 bg-opacity-70 text-white rounded-full p-1 hover:bg-opacity-90 transition-colors"
            aria-label="Remove image"
          >
            <X className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>
        </div>
      )}
      
      <form ref={formRef} onSubmit={handleSubmit} className="flex items-center space-x-1 sm:space-x-2">
        {/* Hidden file input */}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
          ref={fileInputRef}
          tabIndex="-1"
        />

        {/* Message input area */}
        <div className="flex-1 relative flex items-center bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full shadow-sm">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
              adjustTextareaHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 py-2 px-3 sm:py-2.5 sm:px-4 rounded-full focus:outline-none resize-none overflow-y-auto min-h-[40px] max-h-32 text-sm sm:text-base bg-transparent text-gray-900 dark:text-gray-100"
            rows="1"
            style={{ lineHeight: '1.4' }}
          />
          
          {/* Input actions */}
          <div className="flex items-center pr-1 sm:pr-2 space-x-0.5 sm:space-x-1">
            {/* Emoji picker */}
            <button
              type="button"
              data-emoji-button="true"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1.5 sm:p-2 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              aria-label="Add emoji"
            >
              <FaceSmileIcon className="h-5 w-5" />
            </button>
            
            {/* Image upload */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 sm:p-2 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              aria-label="Upload image"
            >
              <Image className="h-5 w-5" />
            </button>
          </div>

          {/* Emoji picker */}
          {showEmojiPicker && (
            <div
              ref={emojiPickerRef}
              className="absolute bottom-full right-0 mb-2 z-50 shadow-lg rounded-lg overflow-hidden"
            >
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                autoFocusSearch={false}
                width={300}
                height={400}
                searchDisabled={window.innerWidth < 640}
                skinTonesDisabled={window.innerWidth < 640}
                lazyLoadEmojis={true}
                theme="auto" // This will automatically use light/dark based on system settings
              />
            </div>
          )}
        </div>

        {/* Send button */}
        <button
          type="submit"
          disabled={(!message.trim() && !selectedImage) || isUploading}
          className="p-2 sm:p-3 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:bg-blue-300 dark:disabled:bg-blue-800 disabled:cursor-not-allowed flex items-center justify-center"
          aria-label="Send message"
        >
          {isUploading ? (
            <div className="h-5 w-5 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
          ) : (
            <PaperAirplaneIcon className="h-5 w-5" />
          )}
        </button>
      </form>
    </div>
  );
}

export default MessageInput;