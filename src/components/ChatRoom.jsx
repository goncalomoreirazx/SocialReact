import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../hooks/useChat';
import ChatHeader from './chat/ChatHeader';
import ChatMessage from './chat/ChatMessage';
import MessageInput from './chat/MessageInput';
import { useSocket } from '../contexts/SocketContext';
import { ReplyIcon, X } from 'lucide-react';

function ChatRoom() {
  const { id: friendId } = useParams();
  const { token, user } = useAuth();
  const { sendMessage } = useChat();
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [friend, setFriend] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch previous messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/messages/${friendId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    const fetchFriend = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/users/${friendId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setFriend(data);
      } catch (error) {
        console.error('Error fetching friend details:', error);
      }
    };

    if (token && friendId) {
      fetchMessages();
      fetchFriend();
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
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    };

    if (friendId && token) {
      markAsRead();
    }
  }, [friendId, token]);

  // Handle real-time messages
  useEffect(() => {
    if (socket) {
      socket.on('receive_message', (message) => {
        // Check if the message belongs to this chat
        if (message.sender_id === parseInt(friendId) || 
            message.receiver_id === parseInt(friendId)) {
          setMessages(prev => {
            // Check if message already exists
            const messageExists = prev.some(m => m.id === message.id);
            if (messageExists) return prev;
            
            return [...prev, {
              ...message,
              isSentByUser: message.sender_id === user.id
            }];
          });
          scrollToBottom();
        }
      });

      return () => {
        socket.off('receive_message');
      };
    }
  }, [socket, friendId, user.id]);


  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleReply = (message) => {
    setReplyingTo(message);
  };

  const handleSendMessage = async (messageData) => {
    try {
      if (messageData.id) {
        // This is from an HTTP upload with image
        setMessages(prev => [...prev, {
          ...messageData,
          isSentByUser: messageData.sender_id === user.id
        }]);
        
        // Also emit through socket so receiver gets it immediately
        socket.emit('send_message', {
          ...messageData,
          senderId: user.id,
          receiverId: parseInt(friendId)
        });
      } else {
        // It's a text message to be sent via socket
        socket.emit('send_message', {
          senderId: user.id,
          receiverId: parseInt(friendId),
          content: messageData.content,
          replyToId: messageData.replyToId
        });
      }
      
      setReplyingTo(null);
      scrollToBottom();
    } catch (error) {
      console.error('Error handling message:', error);
    }
  };

  // Loading state
  if (!friend) {
    return (
      <div className="max-w-2xl mx-auto h-[calc(100vh-12rem)] flex items-center justify-center">
        <div className="text-gray-500">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-12rem)]">
      <div className="flex flex-col h-full bg-white rounded-lg shadow-md">
        <ChatHeader 
          user={friend}
          isTyping={isTyping} 
        />
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <ChatMessage 
              key={message.id} 
              message={{
                ...message,
                isSentByUser: message.sender_id === user.id
              }}
              onReply={handleReply}
            />
          ))}
          {isTyping && (
            <div className="flex justify-start">
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
          <div className="px-4 py-2 bg-gray-50 border-t flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <ReplyIcon className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Replying to: {replyingTo.content.substring(0, 50)}
                {replyingTo.content.length > 50 ? '...' : ''}
              </span>
            </div>
            <button 
              onClick={() => setReplyingTo(null)}
              className="text-gray-500 hover:text-gray-700"
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