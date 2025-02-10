// ChatList.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ConversationItem from '../components/chat/ConversationItem';
import FriendsList from '../components/chat/FriendsList';

function ChatList() {
  const [conversations, setConversations] = useState([]);
  const [friends, setFriends] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        console.log('Fetching friends with token:', token); // Debug log
        const response = await fetch('http://localhost:5000/api/friends/list', { // Changed endpoint
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fetched friends:', data);
        setFriends(data);
      } catch (error) {
        console.error('Error fetching friends:', error);
      }
    };

    if (token) { // Only fetch if we have a token
      fetchFriends();
    }
  }, [token]);

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Messages</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-2">
          {conversations.map((chat) => (
            <ConversationItem key={chat.id} chat={chat} />
          ))}
        </div>

        <div className="md:col-span-1">
          <FriendsList friends={friends} />
        </div>
      </div>
    </div>
  );
}

export default ChatList;