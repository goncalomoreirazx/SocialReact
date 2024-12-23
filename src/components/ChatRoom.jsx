import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { mockMessages } from '../data/mockData';
import ChatHeader from './chat/ChatHeader';
import ChatMessage from './chat/ChatMessage';
import MessageInput from './chat/MessageInput';

function ChatRoom() {
  const { id } = useParams();
  const [newMessage, setNewMessage] = useState('');
  const messages = mockMessages[id] || [];

  const handleSendMessage = (message) => {
    console.log('Sending message:', message);
    setNewMessage('');
  };

  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-12rem)]">
      <div className="flex flex-col h-full bg-white rounded-lg shadow-md">
        <ChatHeader user="Sarah Wilson" />
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </div>

        <MessageInput
          value={newMessage}
          onChange={setNewMessage}
          onSubmit={handleSendMessage}
        />
      </div>
    </div>
  );
}

export default ChatRoom;