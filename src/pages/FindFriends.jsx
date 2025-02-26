import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import ConfirmationDialog from '../dialogs/ConfirmationDialog';
import { Link } from 'react-router-dom';
import { UserIcon, MagnifyingGlassIcon, UserPlusIcon, UserMinusIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '../contexts/NotificationContext';
import { useSocket } from '../contexts/SocketContext';

const FindFriends = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const { clearFriendRequests } = useNotifications();
  const socket = useSocket();
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (token) {
      fetchRequests();
      fetchFriends();
      clearFriendRequests(); // Clear the notification count when viewing the page
    }
  }, [token, clearFriendRequests]);

  useEffect(() => {
    if (socket) {
      // Listen for new friend requests in real-time
      socket.on('new_friend_request', () => {
        console.log('Received new friend request notification');
        fetchRequests(); // Refresh the requests list
      });

      return () => {
        socket.off('new_friend_request');
      };
    }
  }, [socket]);

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
      setActiveTab('search');
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

  const handleRemoveFriend = async (friendId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/friends/remove/${friendId}`,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setFriends(friends.filter(friend => friend.id !== friendId));
      setUsers(users.map(user => 
        user.id === friendId 
          ? { ...user, isFriend: false, requestSent: false }
          : user
      ));
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };
   
  const handleDecline = async (requestId) => {
    try {
      await axios.post(
        'http://localhost:5000/api/friends/decline',
        { requestId },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Remove the declined request from the local state
      setRequests(requests.filter(request => request.id !== requestId));
      
    } catch (error) {
      console.error('Error declining request:', error);
    }
  };

  const openRemoveDialog = (friend) => {
    setSelectedFriend(friend);
    setShowConfirmDialog(true);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchUsers();
    }
  };

  // Function to render user/friend card
  const renderUserCard = (user, type) => {
    return (
      <div 
        key={user.id} 
        className="border rounded-xl p-4 flex flex-col sm:flex-row items-center sm:justify-between bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
      >
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mb-3 sm:mb-0">
          <img
            src={user.profile_picture ? `http://localhost:5000/uploads/${user.profile_picture}` : '/default-avatar.png'}
            alt={user.username}
            className="w-16 h-16 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-gray-200"
          />
          <div className="text-center sm:text-left">
            <h3 className="font-semibold">{user.username}</h3>
            {user.bio && (
              <p className="text-sm text-gray-600 line-clamp-2 max-w-xs">{user.bio}</p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap justify-center sm:justify-end gap-2 w-full sm:w-auto">
          <Link
            to={`/profile/${type === 'request' ? user.user_id : user.id}`}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors flex items-center gap-1 text-sm"
          >
            <UserIcon className="h-4 w-4" />
            <span>Profile</span>
          </Link>
          
          {type === 'request' && (
            <>
              <button
                onClick={() => handleAccept(user.id)}
                className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors flex items-center gap-1 text-sm"
              >
                <CheckIcon className="h-4 w-4" />
                <span>Accept</span>
              </button>
              <button
                onClick={() => handleDecline(user.id)}
                className="px-3 py-1.5 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors flex items-center gap-1 text-sm"
              >
                <XMarkIcon className="h-4 w-4" />
                <span>Decline</span>
              </button>
            </>
          )}
          
          {type === 'friend' && (
            <button
              className="px-3 py-1.5 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors flex items-center gap-1 text-sm"
              onClick={() => openRemoveDialog(user)}
            >
              <UserMinusIcon className="h-4 w-4" />
              <span>Remove</span>
            </button>
          )}
          
          {type === 'search' && (
            <>
              {!user.isFriend && !user.requestSent ? (
                <button
                  onClick={() => handleAddFriend(user.id)}
                  className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors flex items-center gap-1 text-sm"
                >
                  <UserPlusIcon className="h-4 w-4" />
                  <span>Add Friend</span>
                </button>
              ) : user.requestSent ? (
                <span className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-full text-sm flex items-center gap-1">
                  <CheckIcon className="h-4 w-4" />
                  <span>Request Sent</span>
                </span>
              ) : (
                <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-1">
                  <CheckIcon className="h-4 w-4" />
                  <span>Friends</span>
                </span>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 pb-20">
      {/* Header with Title and Search */}
      <div className="bg-white shadow-md rounded-xl p-4 mb-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          Find Friends
        </h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search users..."
              className="w-full p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <button
            onClick={searchUsers}
            disabled={loading || !searchTerm.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors duration-200 sm:w-auto"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Mobile Tabs Navigation */}
      <div className="sm:hidden bg-white shadow-md rounded-xl mb-6 overflow-hidden">
        <div className="flex border-b">
          <button
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              activeTab === 'all' 
                ? 'text-blue-500 border-b-2 border-blue-500 bg-blue-50' 
                : 'text-gray-500 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('all')}
          >
            All
          </button>
          <button
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              activeTab === 'requests' 
                ? 'text-blue-500 border-b-2 border-blue-500 bg-blue-50' 
                : 'text-gray-500 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('requests')}
          >
            Requests 
            {requests.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                {requests.length}
              </span>
            )}
          </button>
          <button
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              activeTab === 'friends' 
                ? 'text-blue-500 border-b-2 border-blue-500 bg-blue-50' 
                : 'text-gray-500 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('friends')}
          >
            Friends
          </button>
          {searchTerm && (
            <button
              className={`flex-1 py-3 text-center font-medium transition-colors ${
                activeTab === 'search' 
                  ? 'text-blue-500 border-b-2 border-blue-500 bg-blue-50' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('search')}
            >
              Results
            </button>
          )}
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-8">
        {/* Friend Requests Section */}
        {(requests.length > 0 && (activeTab === 'all' || activeTab === 'requests')) && (
          <div className="bg-white shadow-md rounded-xl p-4 sm:p-6 animate-fade-in">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              Friend Requests
              <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                {requests.length}
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requests.map((request) => renderUserCard(request, 'request'))}
            </div>
          </div>
        )}

        {/* Friends List Section */}
        {(friends.length > 0 && (activeTab === 'all' || activeTab === 'friends')) && (
          <div className="bg-white shadow-md rounded-xl p-4 sm:p-6 animate-fade-in">
            <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
              <span>My Friends</span>
              <span className="text-sm text-gray-500 font-normal">
                {friends.length} {friends.length === 1 ? 'friend' : 'friends'}
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {friends.map((friend) => renderUserCard(friend, 'friend'))}
            </div>
          </div>
        )}

        {/* Search Results Section */}
        {(searchTerm && users.length > 0 && (activeTab === 'all' || activeTab === 'search')) && (
          <div className="bg-white shadow-md rounded-xl p-4 sm:p-6 animate-fade-in">
            <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
              <span>Search Results</span>
              <span className="text-sm text-gray-500 font-normal">
                {users.length} {users.length === 1 ? 'user' : 'users'} found
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {users.map((user) => renderUserCard(user, 'search'))}
            </div>
          </div>
        )}

        {/* No Results Message */}
        {users.length === 0 && searchTerm && !loading && activeTab === 'search' && (
          <div className="bg-white shadow-md rounded-xl p-8 text-center">
            <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
              <MagnifyingGlassIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No users found</h3>
            <p className="text-gray-500 mb-4">
              We couldn't find any users matching "{searchTerm}"
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="text-blue-500 font-medium hover:underline"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Empty State - No Friends or Requests */}
        {friends.length === 0 && requests.length === 0 && activeTab !== 'search' && (
          <div className="bg-white shadow-md rounded-xl p-8 text-center">
            <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
              <UserPlusIcon className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Start connecting</h3>
            <p className="text-gray-500 mb-4">
              Search for users to connect with and build your network
            </p>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={() => {
          if (selectedFriend) {
            handleRemoveFriend(selectedFriend.id);
            setShowConfirmDialog(false);
          }
        }}
        title="Remove Friend"
        message={`Are you sure you want to remove ${selectedFriend?.username} from your friends list?`}
      />
    </div>
  );
};

export default FindFriends;