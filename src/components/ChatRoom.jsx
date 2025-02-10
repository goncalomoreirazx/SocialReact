// ChatRoom.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import ChatHeader from './chat/ChatHeader';
import ChatMessage from './chat/ChatMessage';
import MessageInput from './chat/MessageInput';

function ChatRoom() {
  const { id: friendId } = useParams();
  const { token, user } = useAuth();
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [friend, setFriend] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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

    fetchMessages();
    fetchFriend();
  }, [friendId, token]);

  useEffect(() => {
    if (socket) {
      socket.on('receive_message', (message) => {
        if (message.sender_id === parseInt(friendId) || message.receiver_id === parseInt(friendId)) {
          setMessages(prev => [...prev, message]);
        }
      });
    }
    return () => {
      if (socket) {
        socket.off('receive_message');
      }
    };
  }, [socket, friendId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content) => {
    try {
      const response = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: friendId,
          content
        })
      });

      const newMessage = await response.json();
      setMessages(prev => [...prev, newMessage]);

      if (socket) {
        socket.emit('send_message', {
          ...newMessage,
          receiverId: friendId
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-12rem)]">
      <div className="flex flex-col h-full bg-white rounded-lg shadow-md">
        <ChatHeader user={friend?.username} />
        
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
          <div ref={messagesEndRef} />
        </div>

        <MessageInput onSubmit={handleSendMessage} />
      </div>
    </div>
  );
}

export default ChatRoom;