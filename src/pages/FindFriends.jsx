import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const FindFriends = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      fetchRequests();
      fetchFriends();
    }
  }, [token]);

  const fetchFriends = async () => {
    try {
      const response = await axios.get(
        'http://localhost:5000/api/friends/list',
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setFriends(response.data);
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await axios.get(
        'http://localhost:5000/api/friends/pending',
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      await axios.post(
        'http://localhost:5000/api/friends/accept',
        { requestId },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setRequests(requests.filter(request => request.id !== requestId));
      fetchFriends();
      if (searchTerm) {
        searchUsers();
      }
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const searchUsers = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/users/search?searchTerm=${searchTerm}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setUsers(response.data);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (userId) => {
    try {
      await axios.post(
        'http://localhost:5000/api/friends/request',
        { friendId: userId },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, requestSent: true } : user
      ));
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Find Friends</h1>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
            placeholder="Search users..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={searchUsers}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Friend Requests Section */}
      {requests.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Friend Requests</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map((request) => (
              <div key={request.id} 
                className="border rounded-lg p-4 flex items-center justify-between bg-white shadow"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={request.profile_picture ? `/uploads/${request.profile_picture}` : '/default-avatar.png'}
                    alt={request.username}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                  />
                  <span className="font-medium">{request.username}</span>
                </div>
                <button
                  onClick={() => handleAccept(request.id)}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Accept
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends List Section */}
      {friends.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">My Friends</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {friends.map((friend) => (
              <div key={friend.id} 
                className="border rounded-lg p-4 flex items-center justify-between bg-white shadow"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={friend.profile_picture ? `/uploads/${friend.profile_picture}` : '/default-avatar.png'}
                    alt={friend.username}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                  />
                  <div>
                    <h3 className="font-semibold">{friend.username}</h3>
                  </div>
                </div>
                <button
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  onClick={() => {/* TODO: Add remove friend functionality */}}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Results Section */}
      {searchTerm && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Search Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.map((user) => (
              <div 
                key={user.id} 
                className="border rounded-lg p-4 flex items-center justify-between bg-white shadow"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={user.profile_picture ? `/uploads/${user.profile_picture}` : '/default-avatar.png'}
                    alt={user.username}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                  />
                  <div>
                    <h3 className="font-semibold">{user.username}</h3>
                    {user.bio && (
                      <p className="text-sm text-gray-600 line-clamp-2">{user.bio}</p>
                    )}
                  </div>
                </div>
                
                {!user.isFriend && !user.requestSent ? (
                  <button
                    onClick={() => handleAddFriend(user.id)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Add Friend
                  </button>
                ) : user.requestSent ? (
                  <span className="px-3 py-1 text-gray-500 font-medium">
                    Request Sent
                  </span>
                ) : (
                  <span className="px-3 py-1 text-green-500 font-medium">
                    Friends
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {users.length === 0 && searchTerm && !loading && (
        <div className="text-center text-gray-500 mt-4">
          No users found matching "{searchTerm}"
        </div>
      )}
    </div>
  );
};

export default FindFriends;