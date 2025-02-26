import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import ConversationItem from '../components/chat/ConversationItem';
import FriendsList from '../components/chat/FriendsList';
import { useSocket } from '../contexts/SocketContext';
import { useMessageNotifications } from '../contexts/MessageNotificationContext';
import { ChatBubbleLeftRightIcon, UsersIcon } from '@heroicons/react/24/outline';

function ChatList() {
  const [conversations, setConversations] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('conversations');
  const { token } = useAuth();
  const socket = useSocket();
  const { clearUnreadCount } = useMessageNotifications();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([fetchConversations(), fetchFriends()]);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load messages. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
      clearUnreadCount();
    }
  }, [token, clearUnreadCount]);

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
      return data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
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
      return data;
    } catch (error) {
      console.error('Error fetching friends:', error);
      throw error;
    }
  };

  // Socket event listeners for real-time updates
  useEffect(() => {
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
  }, [socket]);

  // Count online friends
  const onlineFriendsCount = friends.filter(friend => friend.status === 'online').length;

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-4 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-500">Loading conversations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-4">
        <div className="bg-red-50 text-red-600 p-6 rounded-lg text-center">
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => {
              setLoading(true);
              Promise.all([fetchConversations(), fetchFriends()])
                .finally(() => setLoading(false));
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 pb-16">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Messages</h2>
      
      {/* Mobile Tab Navigation */}
      <div className="block md:hidden mb-4">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="flex divide-x divide-gray-200">
            <button
              onClick={() => setActiveTab('conversations')}
              className={`flex-1 py-3 flex items-center justify-center space-x-2 transition-colors ${
                activeTab === 'conversations' 
                  ? 'bg-blue-50 text-blue-600 font-medium' 
                  : 'text-gray-600'
              }`}
            >
              <ChatBubbleLeftRightIcon className="h-5 w-5" />
              <span>Chats</span>
              {conversations.length > 0 && (
                <span className="bg-blue-100 text-blue-600 text-xs font-medium px-2 py-0.5 rounded-full">
                  {conversations.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('friends')}
              className={`flex-1 py-3 flex items-center justify-center space-x-2 transition-colors ${
                activeTab === 'friends' 
                  ? 'bg-blue-50 text-blue-600 font-medium' 
                  : 'text-gray-600'
              }`}
            >
              <UsersIcon className="h-5 w-5" />
              <span>Friends</span>
              {onlineFriendsCount > 0 && (
                <span className="bg-green-100 text-green-600 text-xs font-medium px-2 py-0.5 rounded-full">
                  {onlineFriendsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Desktop Layout / Mobile Tabbed Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Conversations List */}
        <div className={`md:col-span-2 ${activeTab !== 'conversations' && 'hidden md:block'}`}>
          <div className="bg-white rounded-lg shadow h-full">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Recent Conversations</h3>
              <span className="text-sm text-gray-500">{conversations.length} total</span>
            </div>
            
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-300 mb-3" />
                <p className="font-medium text-gray-600">No conversations yet</p>
                <p className="text-sm mt-1">Start chatting with your friends!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 overflow-y-auto max-h-[70vh]">
                {conversations.map((chat) => (
                  <Link 
                    key={chat.id} 
                    to={`/chat/${chat.id}`}
                    className="block hover:bg-blue-50 transition-colors focus:outline-none focus:bg-blue-50"
                  >
                    <ConversationItem chat={chat} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Friends List */}
        <div className={`md:col-span-1 ${activeTab !== 'friends' && 'hidden md:block'}`}>
          <FriendsList friends={friends} />
        </div>
      </div>
    </div>
  );
}

export default ChatList;