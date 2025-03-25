import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { CheckIcon, XMarkIcon, UserIcon } from '@heroicons/react/24/outline';

const FriendRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchRequests();
  }, [token]);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        'http://localhost:5000/api/friends/pending',
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setError('Failed to load friend requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      await axios.post(
        'http://localhost:5000/api/friends/accept',
        { requestId },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      // Remove the accepted request from the list
      setRequests(requests.filter(request => request.id !== requestId));
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };
  
  const handleDecline = async (requestId) => {
    try {
      await axios.post(
        'http://localhost:5000/api/friends/decline',
        { requestId },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      // Remove the declined request from the list
      setRequests(requests.filter(request => request.id !== requestId));
    } catch (error) {
      console.error('Error declining request:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto mt-4 p-4">
        <h2 className="text-xl font-bold mb-4">Friend Requests</h2>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-4 p-4">
        <h2 className="text-xl font-bold mb-4">Friend Requests</h2>
        <div className="p-4 bg-red-50 text-red-500 rounded-lg text-center">
          <p>{error}</p>
          <button 
            onClick={fetchRequests}
            className="mt-2 text-blue-500 hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-4 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Friend Requests</h2>
        {requests.length > 0 && (
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {requests.length}
          </span>
        )}
      </div>
      
      {requests.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-lg shadow">
          <div className="inline-block p-3 bg-gray-100 rounded-full mb-3">
            <UserIcon className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-gray-500">No pending friend requests</p>
          <p className="text-sm text-gray-400 mt-1">Friend requests will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <div 
              key={request.id} 
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center mb-3 sm:mb-0">
                <img
                  src={request.profile_picture ? `http://localhost:5000/uploads/${request.profile_picture}` : '/default-avatar.png'}
                  alt={request.username}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/default-avatar.png';
                  }}
                />
                <div className="ml-3">
                  <p className="font-medium text-gray-800">{request.username}</p>
                  <p className="text-sm text-gray-500">Wants to be your friend</p>
                </div>
              </div>
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={() => handleDecline(request.id)}
                  className="flex items-center justify-center p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors w-10 h-10"
                  aria-label="Decline friend request"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleAccept(request.id)}
                  className="flex items-center justify-center p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors w-10 h-10"
                  aria-label="Accept friend request"
                >
                  <CheckIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendRequests;