import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useSocket } from '../../contexts/SocketContext';
import { MessageCircle, Clock } from 'lucide-react';

function FriendsList({ friends }) {
  const socket = useSocket();
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [expandOffline, setExpandOffline] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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
    
    return () => {
      if (socket) {
        socket.off('user_status');
      }
    };
  }, [socket]);

  // Filter friends based on search query
  const filteredFriends = searchQuery 
    ? friends.filter(friend => 
        friend.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : friends;

  const onlineFriends = filteredFriends.filter(friend => onlineUsers.has(friend.id));
  const offlineFriends = filteredFriends.filter(friend => !onlineUsers.has(friend.id));

  // Format the last seen time more user-friendly
  const formatLastSeen = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.abs(now - date) / 36e5; // hours difference
    
    if (diffHours < 24) {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      return `Last seen at ${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
    } else {
      return `Last seen ${formatDistanceToNow(date, { addSuffix: true })}`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Friends</h3>
        <div className="text-xs sm:text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
          {friends.length} total
        </div>
      </div>
      
      {/* Search input */}
      <div className="mb-4 relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search friends..."
          className="w-full bg-gray-50 border border-gray-200 rounded-full py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      {/* No results state */}
      {filteredFriends.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-gray-500 text-sm">No friends match your search</p>
        </div>
      )}
      
      {/* Online Friends */}
      {onlineFriends.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs sm:text-sm font-medium text-gray-500 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
              Online ({onlineFriends.length})
            </h4>
          </div>
          <div className="space-y-1 sm:space-y-2">
            {onlineFriends.map(friend => (
              <Link 
                to={`/chat/${friend.id}`} 
                key={friend.id}
                className="block transition-colors duration-150"
              >
                <div className="flex items-center justify-between hover:bg-blue-50 p-2 rounded-lg group">
                  <div className="flex items-center space-x-2 sm:space-x-3 overflow-hidden">
                    <div className="relative flex-shrink-0">
                      {friend.profile_picture ? (
                        <img 
                          src={`http://localhost:5000/uploads/${friend.profile_picture}`}
                          alt={friend.username}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/default-avatar.png';
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white">
                          <span className="text-sm sm:text-base font-medium">
                            {friend.username[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="overflow-hidden flex-1 min-w-0">
                      <span className="font-medium text-sm sm:text-base text-gray-900 block truncate">
                        {friend.username}
                      </span>
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-blue-100 text-blue-600 rounded-full">
                    <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Offline Friends */}
      {offlineFriends.length > 0 && (
        <div>
          <div 
            className="flex items-center justify-between mb-2 cursor-pointer"
            onClick={() => setExpandOffline(!expandOffline)}
          >
            <h4 className="text-xs sm:text-sm font-medium text-gray-500 flex items-center">
              <span className="w-2 h-2 bg-gray-400 rounded-full mr-1.5"></span>
              Offline ({offlineFriends.length})
            </h4>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-4 w-4 text-gray-400 transition-transform ${expandOffline ? 'rotate-180' : ''}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          {expandOffline && (
            <div className="space-y-1 sm:space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent pr-1">
              {offlineFriends.map(friend => (
                <Link 
                  to={`/chat/${friend.id}`} 
                  key={friend.id}
                  className="block transition-colors duration-150"
                >
                  <div className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg group">
                    <div className="flex items-center space-x-2 sm:space-x-3 overflow-hidden">
                      <div className="relative flex-shrink-0">
                        {friend.profile_picture ? (
                          <img 
                            src={`http://localhost:5000/uploads/${friend.profile_picture}`}
                            alt={friend.username}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover opacity-75 grayscale-[30%]"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/default-avatar.png';
                            }}
                          />
                        ) : (
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 flex items-center justify-center opacity-75">
                            <span className="text-sm sm:text-base text-gray-500 font-medium">
                              {friend.username[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-gray-400 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="overflow-hidden flex-1 min-w-0">
                        <span className="font-medium text-sm sm:text-base text-gray-600 block truncate">
                          {friend.username}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center">
                          <Clock className="inline w-3 h-3 mr-1" />
                          {friend.last_seen ? formatLastSeen(friend.last_seen) : 'Unavailable'}
                        </span>
                      </div>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-gray-100 text-gray-600 rounded-full">
                      <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {friends.length === 0 && (
        <div className="py-10 text-center">
          <div className="mx-auto bg-gray-100 rounded-full w-14 h-14 flex items-center justify-center mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">No friends found</p>
          <p className="text-gray-400 text-xs mt-1">Try adding some new friends</p>
          <button className="mt-4 bg-blue-500 text-white text-sm px-4 py-1.5 rounded-full hover:bg-blue-600 transition-colors">
            Find Friends
          </button>
        </div>
      )}
    </div>
  );
}

export default FriendsList;