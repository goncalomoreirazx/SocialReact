import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';

function FriendsList() {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const fetchFriends = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/friends/list', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch friends');
      const data = await response.json();
      setFriends(data);
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchFriends();
      // Refresh friend list every 30 seconds
      const interval = setInterval(fetchFriends, 30000);
      return () => clearInterval(interval);
    }
  }, [token]);

  if (loading) {
    return <div className="bg-white rounded-lg shadow-md p-4">Loading friends...</div>;
  }

  const onlineFriends = friends.filter(friend => friend.status === 'online');
  const offlineFriends = friends.filter(friend => friend.status === 'offline');

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-4">Friends</h3>
      
      {/* Online Friends */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-500 mb-3">Online - {onlineFriends.length}</h4>
        <div className="space-y-3">
          {onlineFriends.map(friend => (
            <div key={friend.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="avatar">
                    {friend.profile_picture ? (
                      <img 
                        src={`http://localhost:5000/uploads/${friend.profile_picture}`}
                        alt={friend.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-300"></div>
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <span className="font-medium text-gray-900">{friend.username}</span>
              </div>
              <span className="text-sm text-green-500">Active now</span>
            </div>
          ))}
        </div>
      </div>

      {/* Offline Friends */}
      <div>
        <h4 className="text-sm font-medium text-gray-500 mb-3">Offline - {offlineFriends.length}</h4>
        <div className="space-y-3">
          {offlineFriends.map(friend => (
            <div key={friend.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="avatar opacity-75">
                    {friend.profile_picture ? (
                      <img 
                        src={`http://localhost:5000/uploads/${friend.profile_picture}`}
                        alt={friend.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-300"></div>
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-gray-400 rounded-full border-2 border-white"></div>
                </div>
                <span className="font-medium text-gray-600">{friend.username}</span>
              </div>
              <span className="text-sm text-gray-500">
                {friend.lastSeen ? formatDistanceToNow(new Date(friend.lastSeen), { addSuffix: true }) : 'Never'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FriendsList;