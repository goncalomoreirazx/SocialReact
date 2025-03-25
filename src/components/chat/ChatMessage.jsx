import React, { useState } from 'react';
import { ReplyIcon, ExternalLink, Download } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function ChatMessage({ message, onReply }) {
  const { content, sent_at, isSentByUser, replyTo, image_url } = message;
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const getImageUrl = (url) => {
    if (!url) return null;
    return url.startsWith('http') ? url : `http://localhost:5000${url}`;
  };
  
  const handleImageClick = () => {
    if (image_url && !imageError) {
      window.open(getImageUrl(image_url), '_blank');
    }
  };

  const downloadImage = (e) => {
    e.stopPropagation();
    
    if (image_url && !imageError) {
      const link = document.createElement('a');
      link.href = getImageUrl(image_url);
      link.download = `image-${new Date().getTime()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  return (
    <div className={`flex ${isSentByUser ? 'justify-end' : 'justify-start'} mb-3 sm:mb-4 animate-fade-in px-1`}>
      <div className="relative group max-w-[85%] sm:max-w-[75%] lg:max-w-[65%]">
        {/* Reply button */}
        <button 
          onClick={() => onReply(message)}
          className={`absolute ${
            isSentByUser ? '-left-6 sm:-left-8' : '-right-6 sm:-right-8'
          } top-2 opacity-0 group-hover:opacity-100 p-1 bg-white rounded-full shadow-sm border border-gray-200 transition-all duration-200 hover:bg-gray-100`}
          aria-label="Reply to message"
        >
          <ReplyIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 hover:text-blue-500" />
        </button>
        
        {/* Message container */}
        <div 
          className={`rounded-lg px-3 sm:px-4 py-2 shadow-sm ${
            isSentByUser 
              ? 'bg-blue-500 text-white rounded-br-none' 
              : 'bg-gray-100 text-gray-900 rounded-bl-none'
          }`}
        >
          {/* Reply reference */}
          {replyTo && (
            <div 
              className={`text-sm mb-2 pb-2 border-b ${
                isSentByUser ? 'border-blue-400' : 'border-gray-300'
              }`}
            >
              <div className={`text-xs flex items-center ${
                isSentByUser ? 'text-blue-100' : 'text-gray-500'
              }`}>
                <ReplyIcon className="h-3 w-3 mr-1 inline" />
                Replying to {replyTo.sender_name}:
              </div>
              <div className="truncate text-xs sm:text-sm opacity-75">{replyTo.content}</div>
            </div>
          )}
          
          {/* Message content */}
          {content && (
            <div className="mb-2 text-sm sm:text-base break-words whitespace-pre-line">
              {content}
            </div>
          )}
          
          {/* Image attachment */}
          {image_url && !imageError && (
            <div className="mb-2 relative group/image rounded-md overflow-hidden bg-gray-50">
              {!imageLoaded && (
                <div className="w-full h-32 flex items-center justify-center bg-gray-100">
                  <div className="animate-pulse w-5 h-5 rounded-full bg-gray-300"></div>
                </div>
              )}
              <img
                src={getImageUrl(image_url)}
                alt="Message attachment"
                className={`max-w-full rounded-md max-h-48 sm:max-h-64 object-contain cursor-pointer transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0 h-0'}`}
                onClick={handleImageClick}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
              
              {/* Image hover controls */}
              <div className="absolute bottom-0 right-0 p-2 opacity-0 group-hover/image:opacity-100 flex space-x-1 transition-opacity duration-200">
                <button 
                  onClick={handleImageClick}
                  className="p-1 rounded-full bg-black bg-opacity-70 text-white hover:bg-opacity-90 transition-colors"
                  aria-label="Open image in new tab"
                >
                  <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
                <button 
                  onClick={downloadImage}
                  className="p-1 rounded-full bg-black bg-opacity-70 text-white hover:bg-opacity-90 transition-colors"
                  aria-label="Download image"
                >
                  <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              </div>
            </div>
          )}
          
          {/* Image error message */}
          {image_url && imageError && (
            <div className="mb-2 p-2 bg-gray-200 text-gray-700 text-xs rounded text-center">
              ⚠️ Image could not be loaded
            </div>
          )}
          
          {/* Timestamp */}
          <p className={`text-xs ${
            isSentByUser ? 'text-blue-100' : 'text-gray-500'
          } text-right`}>
            {formatDistanceToNow(new Date(sent_at), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;