import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  UserIcon, 
  UserPlusIcon, 
  UserMinusIcon, 
  CheckIcon, 
  XMarkIcon, 
  MagnifyingGlassIcon,
  UsersIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import ConfirmationDialog from '../dialogs/ConfirmationDialog';

const FindFriends = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const { token } = useAuth();
  const { clearFriendRequests } = useNotifications();

  useEffect(() => {
    if (token) {
      fetchFriends();
      fetchPendingRequests();
      clearFriendRequests(); // Clear notification count when viewing this page
    }
  }, [token]);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        'http://localhost:5000/api/friends/list',
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setFriends(response.data);
    } catch (error) {
      console.error('Error fetching friends:', error);
      setError('Failed to load friends. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await axios.get(
        'http://localhost:5000/api/friends/pending',
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/users/search?searchTerm=${searchTerm}`,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setSearchResults(response.data);
      setActiveTab('search');
    } catch (error) {
      console.error('Error searching users:', error);
      setError('Failed to search users. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleAddFriend = async (userId) => {
    try {
      await axios.post(
        'http://localhost:5000/api/friends/request',
        { friendId: userId },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Update search results to show pending status
      setSearchResults(prevResults => 
        prevResults.map(user => 
          user.id === userId ? { ...user, requestSent: true } : user
        )
      );
    } catch (error) {
      console.error('Error sending friend request:', error);
      alert('Failed to send friend request. Please try again.');
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await axios.post(
        'http://localhost:5000/api/friends/accept',
        { requestId },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Remove from requests and refresh friends list
      setRequests(requests.filter(request => request.id !== requestId));
      fetchFriends();
    } catch (error) {
      console.error('Error accepting friend request:', error);
      alert('Failed to accept friend request. Please try again.');
    }
  };

  const handleDeclineRequest = async (requestId) => {
    try {
      await axios.post(
        'http://localhost:5000/api/friends/decline',
        { requestId },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Remove from requests
      setRequests(requests.filter(request => request.id !== requestId));
    } catch (error) {
      console.error('Error declining friend request:', error);
      alert('Failed to decline friend request. Please try again.');
    }
  };

  const handleRemoveFriend = async (friendId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/friends/remove/${friendId}`,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Remove from friends list
      setFriends(friends.filter(friend => friend.id !== friendId));
      setShowConfirmDialog(false);
      setSelectedFriend(null);
    } catch (error) {
      console.error('Error removing friend:', error);
      alert('Failed to remove friend. Please try again.');
    }
  };

  const openRemoveDialog = (friend) => {
    setSelectedFriend(friend);
    setShowConfirmDialog(true);
  };

  // Render user card (used for both friends and search results)
  const renderUserCard = (user, type) => {
    return (
      <div 
        key={user.id} 
        className="border rounded-xl p-4 flex flex-col sm:flex-row items-center sm:justify-between bg-white shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-3 sm:mb-0">
          {/* Profile picture */}
          <div className="w-16 h-16 sm:w-12 sm:h-12 rounded-full bg-gray-200 overflow-hidden border-2 border-gray-100">
            {user.profile_picture ? (
              <img
                src={`http://localhost:5000/uploads/${user.profile_picture}`}
                alt={user.username}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/default-avatar.png';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <UserIcon className="h-6 w-6 text-gray-400" />
              </div>
            )}
          </div>
          
          {/* User info */}
          <div className="text-center sm:text-left">
            <h3 className="font-semibold">{user.username}</h3>
            {user.bio && (
              <p className="text-sm text-gray-600 line-clamp-2 max-w-xs">{user.bio}</p>
            )}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex flex-wrap justify-center sm:justify-end gap-2 w-full sm:w-auto">
          {/* Profile button (always shown) */}
          <Link
            to={`/profile/${type === 'request' ? user.user_id : user.id}`}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors flex items-center gap-1 text-sm"
          >
            <UserIcon className="h-4 w-4" />
            <span>Profile</span>
          </Link>
          
          {/* Message button (for friends) */}
          {type === 'friend' && (
            <Link
              to={`/chat/${user.id}`}
              className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors flex items-center gap-1 text-sm"
            >
              <ChatBubbleLeftIcon className="h-4 w-4" />
              <span>Message</span>
            </Link>
          )}
          
          {/* Accept/Decline buttons (for requests) */}
          {type === 'request' && (
            <>
              <button
                onClick={() => handleAcceptRequest(user.id)}
                className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors flex items-center gap-1 text-sm"
              >
                <CheckIcon className="h-4 w-4" />
                <span>Accept</span>
              </button>
              <button
                onClick={() => handleDeclineRequest(user.id)}
                className="px-3 py-1.5 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors flex items-center gap-1 text-sm"
              >
                <XMarkIcon className="h-4 w-4" />
                <span>Decline</span>
              </button>
            </>
          )}
          
          {/* Remove button (for friends) */}
          {type === 'friend' && (
            <button
              onClick={() => openRemoveDialog(user)}
              className="px-3 py-1.5 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors flex items-center gap-1 text-sm"
            >
              <UserMinusIcon className="h-4 w-4" />
              <span>Remove</span>
            </button>
          )}
          
          {/* Add Friend button (for search results) */}
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
      {/* Header with search */}
      <div className="bg-white shadow-md rounded-xl p-4 mb-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">My Friends</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Find new friends..."
              className="w-full p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchTerm.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors duration-200 sm:w-auto"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="bg-white shadow-md rounded-xl mb-6 overflow-hidden">
        <div className="flex border-b">
          <button
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              activeTab === 'all' 
                ? 'text-blue-500 border-b-2 border-blue-500 bg-blue-50' 
                : 'text-gray-500 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('all')}
          >
            All Friends
            <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded-full">
              {friends.length}
            </span>
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
          {searchResults.length > 0 && (
            <button
              className={`flex-1 py-3 text-center font-medium transition-colors ${
                activeTab === 'search' 
                  ? 'text-blue-500 border-b-2 border-blue-500 bg-blue-50' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('search')}
            >
              Search Results
              <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                {searchResults.length}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Loading state */}
      {loading && activeTab === 'all' && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      )}

      {/* Content based on active tab */}
      {activeTab === 'all' && !loading && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <UsersIcon className="h-5 w-5 mr-2" />
            My Friends
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({friends.length})
            </span>
          </h2>
          
          {/* Empty state */}
          {friends.length === 0 && (
            <div className="bg-white shadow-md rounded-xl p-8 text-center">
              <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
                <UsersIcon className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No friends yet</h3>
              <p className="text-gray-500 mb-4">
                Search for people you know and send them a friend request
              </p>
            </div>
          )}
          
          {/* Friends list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {friends.map((friend) => renderUserCard(friend, 'friend'))}
          </div>
        </div>
      )}
      
      {/* Friend Requests Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Friend Requests</h2>
          
          {/* Empty state */}
          {requests.length === 0 && (
            <div className="bg-white shadow-md rounded-xl p-8 text-center">
              <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
                <UserIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No pending requests</h3>
              <p className="text-gray-500">
                Friend requests will appear here
              </p>
            </div>
          )}
          
          {/* Requests list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map((request) => renderUserCard(request, 'request'))}
          </div>
        </div>
      )}
      
      {/* Search Results Tab */}
      {activeTab === 'search' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center justify-between">
            <span>Search Results</span>
            <span className="text-sm font-normal text-gray-500">
              {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} for "{searchTerm}"
            </span>
          </h2>
          
          {/* Empty search results */}
          {searchResults.length === 0 && !isSearching && (
            <div className="bg-white shadow-md rounded-xl p-8 text-center">
              <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
                <MagnifyingGlassIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No results found</h3>
              <p className="text-gray-500 mb-4">
                Try different keywords or check the spelling
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="text-blue-500 font-medium hover:underline"
              >
                Clear search
              </button>
            </div>
          )}
          
          {/* Search results list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchResults.map((user) => renderUserCard(user, 'search'))}
          </div>
        </div>
      )}
      
      {/* Confirmation Dialog for removing friends */}
      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={() => {
          if (selectedFriend) handleRemoveFriend(selectedFriend.id);
        }}
        title="Remove Friend"
        message={`Are you sure you want to remove ${selectedFriend?.username} from your friends list?`}
      />
    </div>
  );
};

export default FindFriends;