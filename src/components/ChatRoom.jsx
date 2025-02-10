// ChatRoom.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../hooks/useChat';
import ChatHeader from './chat/ChatHeader';
import ChatMessage from './chat/ChatMessage';
import MessageInput from './chat/MessageInput';
import { useSocket } from '../contexts/SocketContext';

function ChatRoom() {
  const { id: friendId } = useParams();
  const { token, user } = useAuth();
  const { sendMessage } = useChat();
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [friend, setFriend] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
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

  // Handle real-time messages
  useEffect(() => {
    if (socket) {
      socket.on('receive_message', (message) => {
        if (message.sender_id === parseInt(friendId) || message.receiver_id === parseInt(friendId)) {
          setMessages(prev => [...prev, message]);
        }
      });

      socket.on('typing_status', ({ userId, isTyping: typing }) => {
        if (userId === parseInt(friendId)) {
          setIsTyping(typing);
        }
      });

      return () => {
        socket.off('receive_message');
        socket.off('typing_status');
      };
    }
  }, [socket, friendId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content) => {
    if (!content.trim()) return;

    try {
      const newMessage = await sendMessage(parseInt(friendId), content);
      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Optionally show an error toast/notification
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

        <MessageInput onSubmit={handleSendMessage} friendId={parseInt(friendId)} />
      </div>
    </div>
  );
}

export default ChatRoom;