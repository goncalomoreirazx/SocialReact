import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../hooks/useChat';
import ChatHeader from './chat/ChatHeader';
import ChatMessage from './chat/ChatMessage';
import MessageInput from './chat/MessageInput';
import { useSocket } from '../contexts/SocketContext';
import { ReplyIcon, X } from 'lucide-react';
import { useMessageNotifications } from '../contexts/MessageNotificationContext';

function ChatRoom() {
  const { id: friendId } = useParams();
  const { token, user } = useAuth();
  const { sendMessage } = useChat();
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [friend, setFriend] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const { clearUnreadCount } = useMessageNotifications();

  const scrollToBottom = (behavior = 'auto') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  };

  // Use useLayoutEffect to scroll before browser paint
  useLayoutEffect(() => {
    if (!isLoading && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isLoading]);

  // Fetch previous messages
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch messages
        const messagesResponse = await fetch(
          `http://localhost:5000/api/messages/${friendId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        const messagesData = await messagesResponse.json();
        
        // Fetch friend details
        const friendResponse = await fetch(
          `http://localhost:5000/api/users/${friendId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        const friendData = await friendResponse.json();

        setMessages(messagesData);
        setFriend(friendData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (token && friendId) {
      fetchData();
    }
  }, [friendId, token]);

  // Mark messages as read when opening chat
  useEffect(() => {
    const markAsRead = async () => {
      try {
        await fetch(`http://localhost:5000/api/messages/${friendId}/read`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Only clear unread count for this specific chat
        clearUnreadCount();
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    };

    if (friendId && token && !isLoading) {
      markAsRead();
    }
  }, [friendId, token, isLoading, clearUnreadCount]);

   
  // Handle real-time messages
  useEffect(() => {
    if (socket) {
      const handleNewMessage = (message) => {
        console.log('Received message in chat room:', message);
        // Check if this message belongs to this chat
        if (message.sender_id === parseInt(friendId) || 
            message.receiver_id === parseInt(friendId)) {
          setMessages(prev => {
            // Check if message already exists by ID to avoid duplicates
            const messageExists = prev.some(m => m.id === message.id);
            if (messageExists) return prev;
            
            console.log('Adding new message to chat:', message);
            // Add the new message
            return [...prev, {
              ...message,
              isSentByUser: message.sender_id === user.id
            }];
          });
          
          // Mark as read immediately if this is from the friend
          if (message.sender_id === parseInt(friendId)) {
            fetch(`http://localhost:5000/api/messages/${friendId}/read`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }).catch(err => console.error('Error marking message as read:', err));
          }
        }
      };

      const handleTypingStatus = ({ userId, isTyping }) => {
        if (parseInt(userId) === parseInt(friendId)) {
          setIsTyping(isTyping);
        }
      };

      // Add event listeners
      socket.on('receive_message', handleNewMessage);
      socket.on('typing_status', handleTypingStatus);

      return () => {
        // Clean up event listeners
        socket.off('receive_message', handleNewMessage);
        socket.off('typing_status', handleTypingStatus);
      };
    }
  }, [socket, friendId, user.id, token]);
  
  //Reply
  const handleReply = (message) => {
    setReplyingTo(message);
  };

  const handleSendMessage = async (messageData) => {
    try {
      if (messageData.id) {
        // This is an already created message (likely from image upload)
        console.log('Handling pre-created message with ID:', messageData.id);
        
        // Add to local state first for immediate UI update
        setMessages(prev => {
          // Check for duplicates
          const messageExists = prev.some(m => m.id === messageData.id);
          if (messageExists) return prev;
          
          return [...prev, {
            ...messageData,
            isSentByUser: messageData.sender_id === user.id
          }];
        });
        
        // Broadcast via socket to ensure real-time updates for all clients
        if (socket && socket.connected) {
          socket.emit('send_message', {
            ...messageData,
            senderId: user.id,
            receiverId: parseInt(friendId)
          });
        } else {
          console.warn('Socket not connected, message may not be delivered in real-time');
        }
      } else {
        // This is a new text message
        console.log('Handling new text message');
        
        // For text messages, we just emit via socket - server will handle storage
        if (socket && socket.connected) {
          socket.emit('send_message', {
            senderId: user.id,
            receiverId: parseInt(friendId),
            content: messageData.content,
            replyToId: messageData.replyToId
          });
        } else {
          throw new Error('Socket not connected. Cannot send message.');
        }
      }
      
      // Clear reply state regardless of success/failure
      setReplyingTo(null);
    } catch (error) {
      console.error('Error handling message:', error);
      // Provide user feedback on error
      alert('Failed to send message. Please check your connection and try again.');
    }
  };
  
  if (isLoading || !friend) {
    return (
      <div className="w-full max-w-2xl mx-auto h-[calc(100vh-12rem)] sm:h-[calc(100vh-14rem)] lg:h-[calc(100vh-16rem)] flex items-center justify-center px-4">
        <div className="text-gray-500 animate-pulse flex flex-col items-center">
          <div className="w-8 h-8 border-t-2 border-b-2 border-gray-300 rounded-full animate-spin mb-2"></div>
          <span>Loading chat...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto h-[calc(100vh-12rem)] sm:h-[calc(100vh-14rem)] lg:h-[calc(100vh-16rem)] px-2 sm:px-4">
      <div className="flex flex-col h-full bg-white rounded-lg shadow-md">
        <ChatHeader 
          user={friend}
          isTyping={isTyping} 
        />
        
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 scroll-smooth"
        >
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <p className="mb-2">No messages yet</p>
                <p className="text-sm">Start a conversation with {friend.username}</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage 
                key={message.id} 
                message={{
                  ...message,
                  isSentByUser: message.sender_id === user.id
                }}
                onReply={handleReply}
              />
            ))
          )}
          
          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {replyingTo && (
          <div className="px-3 sm:px-4 py-2 bg-gray-50 border-t flex justify-between items-center text-xs sm:text-sm">
            <div className="flex items-center space-x-2 overflow-hidden">
              <ReplyIcon className="h-4 w-4 flex-shrink-0 text-gray-500" />
              <span className="text-gray-600 truncate">
                Replying to: {replyingTo.content.substring(0, 50)}
                {replyingTo.content.length > 50 ? '...' : ''}
              </span>
            </div>
            <button 
              onClick={() => setReplyingTo(null)}
              className="text-gray-500 hover:text-gray-700 ml-2 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <MessageInput 
          onSubmit={handleSendMessage}
          friendId={parseInt(friendId)}
          replyingTo={replyingTo}
        />
      </div>
    </div>
  );
}

export default ChatRoom;