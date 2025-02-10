// FriendsList.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useSocket } from '../../contexts/SocketContext';

function FriendsList({ friends }) {
  const socket = useSocket();
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    if (socket) {
      socket.on('user_status', ({ userId, status }) => {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          if (status === 'online') {
            newSet.add(userId);
          } else {
            newSet.delete(userId);
          }
          return newSet;
        });
      });
    }
  }, [socket]);

  const onlineFriends = friends.filter(friend => onlineUsers.has(friend.id));
  const offlineFriends = friends.filter(friend => !onlineUsers.has(friend.id));

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-4">Friends</h3>
      
      {/* Online Friends */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-500 mb-3">
          Online - {onlineFriends.length}
        </h4>
        <div className="space-y-3">
          {onlineFriends.map(friend => (
            <Link to={`/chat/${friend.id}`} key={friend.id}>
              <div className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {friend.profile_picture ? (
                      <img 
                        src={`http://localhost:5000/uploads/${friend.profile_picture}`}
                        alt={friend.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-lg text-gray-500">
                          {friend.username[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <span className="font-medium text-gray-900">{friend.username}</span>
                </div>
                <span className="text-sm text-green-500">Active now</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Offline Friends */}
      <div>
        <h4 className="text-sm font-medium text-gray-500 mb-3">
          Offline - {offlineFriends.length}
        </h4>
        <div className="space-y-3">
          {offlineFriends.map(friend => (
            <Link to={`/chat/${friend.id}`} key={friend.id}>
              <div className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {friend.profile_picture ? (
                      <img 
                        src={`http://localhost:5000/uploads/${friend.profile_picture}`}
                        alt={friend.username}
                        className="w-10 h-10 rounded-full object-cover opacity-75"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center opacity-75">
                        <span className="text-lg text-gray-500">
                          {friend.username[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-gray-400 rounded-full border-2 border-white"></div>
                  </div>
                  <span className="font-medium text-gray-600">{friend.username}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {friend.last_seen && formatDistanceToNow(new Date(friend.last_seen), { addSuffix: true })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FriendsList;