import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserIcon, UserPlusIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

const ProfileFriends = ({ userId }) => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchFriends = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:5000/api/friends/user/${userId}`,
          { headers: { Authorization: `Bearer ${token}` }}
        );
        setFriends(response.data.friends || []);
        setError(null);
      } catch (error) {
        console.error('Error fetching friends:', error);
        setError('Failed to load friends list. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (token && userId) {
      fetchFriends();
    }
  }, [userId, token]);

  const handleAddFriend = async (friendId) => {
    try {
      await axios.post(
        'http://localhost:5000/api/friends/request',
        { friendId },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Update the friend in the list to show pending request
      setFriends(prevFriends => 
        prevFriends.map(friend => 
          friend.id === friendId ? { ...friend, requestSent: true } : friend
        )
      );
    } catch (error) {
      console.error('Error sending friend request:', error);
      alert('Failed to send friend request. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-500">Loading friends...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-600 text-center">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 text-blue-500 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="bg-white shadow-md rounded-lg p-8 text-center">
        <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
          <UserIcon className="h-8 w-8 text-blue-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">No friends yet</h3>
        <p className="text-gray-500 mb-4">
          {userId === parseInt(localStorage.getItem('userId')) 
            ? "You haven't added any friends yet" 
            : "This user hasn't added any friends yet"}
        </p>
      </div>
    );
  }

  // Render a grid of friend cards
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {friends.map(friend => (
        <div 
          key={friend.id} 
          className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-100"
        >
          <div className="p-4">
            <div className="flex flex-col items-center">
              {/* Profile picture */}
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 mb-3 border-2 border-gray-100">
                {friend.profile_picture ? (
                  <img
                    src={`http://localhost:5000/uploads/${friend.profile_picture}`}
                    alt={friend.username}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <UserIcon className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* Username */}
              <h3 className="font-semibold text-gray-900 mb-1 text-center">
                {friend.username}
              </h3>
              
              {/* Status indicator */}
              <div className="flex items-center mb-3">
                <span className={`w-2 h-2 rounded-full mr-1 ${
                  friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                }`}></span>
                <span className="text-xs text-gray-500">
                  {friend.status === 'online' ? 'Online' : 'Offline'}
                </span>
              </div>
              
              {/* Bio (truncated) */}
              {friend.bio && (
                <p className="text-sm text-gray-600 text-center line-clamp-2 mb-4 px-2">
                  {friend.bio}
                </p>
              )}
              
              {/* Action buttons */}
              <div className="flex space-x-2 mt-auto w-full">
                <Link
                  to={`/profile/${friend.id}`}
                  className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center text-sm"
                >
                  Profile
                </Link>
                
                {friend.is_friend_with_requester ? (
                  <Link
                    to={`/chat/${friend.id}`}
                    className="flex-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center text-sm"
                  >
                    <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                    Message
                  </Link>
                ) : (
                  <button
                    onClick={() => handleAddFriend(friend.id)}
                    disabled={friend.requestSent}
                    className={`flex-1 px-3 py-1.5 rounded-lg flex items-center justify-center text-sm
                      ${friend.requestSent 
                        ? 'bg-gray-100 text-gray-500' 
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                  >
                    <UserPlusIcon className="h-4 w-4 mr-1" />
                    {friend.requestSent ? 'Requested' : 'Add Friend'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProfileFriends;