// ChatList.jsx
// ChatList.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import ConversationItem from '../components/chat/ConversationItem';
import FriendsList from '../components/chat/FriendsList';
import { useSocket } from '../contexts/SocketContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useMessageNotifications } from '../contexts/MessageNotificationContext';

function ChatList() {
  const [conversations, setConversations] = useState([]);
  const [friends, setFriends] = useState([]);
  const { token } = useAuth();
  const socket = useSocket();
  const { clearMessageNotifications } = useNotifications();
  const { clearUnreadCount } = useMessageNotifications();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/messages/conversations', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setConversations(data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    const fetchFriends = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/friends/list', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setFriends(data);
      } catch (error) {
        console.error('Error fetching friends:', error);
      }
    };

    if (token) {
      fetchConversations();
      fetchFriends();
      clearMessageNotifications(); // Clear notification count from old system
      clearUnreadCount(); // Clear notification count from new system
    }

    // Socket event listeners for real-time updates
    if (socket) {
      socket.on('receive_message', (message) => {
        // Update conversations when new message is received
        fetchConversations();
      });

      socket.on('user_status', ({ userId, status }) => {
        // Update friends list when user status changes
        fetchFriends();
      });

      return () => {
        socket.off('receive_message');
        socket.off('user_status');
      };
    }
  }, [token, socket, clearMessageNotifications, clearUnreadCount]);

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Messages</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>No conversations yet</p>
                <p className="text-sm mt-2">Start chatting with your friends!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {conversations.map((chat) => (
                  <Link 
                    key={chat.id} 
                    to={`/chat/${chat.id}`}
                    className="block hover:bg-gray-50 transition-colors"
                  >
                    <ConversationItem chat={chat} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-1">
          <FriendsList friends={friends} />
        </div>
      </div>
    </div>
  );
}

export default ChatList;