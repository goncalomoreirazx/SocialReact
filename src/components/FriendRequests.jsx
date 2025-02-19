// src/components/FriendRequests.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const FriendRequests = () => {
  const [requests, setRequests] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    fetchRequests();
  }, []);

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
      // Remove the accepted request from the list
      setRequests(requests.filter(request => request.id !== requestId));
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };
  const handleRemoveFriend = async (friendId, token) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/friends/remove/${friendId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      // After successful removal, you might want to refresh the friends list
      // This could be handled by the parent component
      return true;
    } catch (error) {
      console.error('Error removing friend:', error);
      return false;
    }
  };
  return (
    <div className="max-w-md mx-auto mt-4">
      <h2 className="text-xl font-bold mb-4">Friend Requests</h2>
      {requests.length === 0 ? (
        <p className="text-gray-500">No pending friend requests</p>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
              <div className="flex items-center space-x-3">
                <img
                  src={request.profile_picture ? `/uploads/${request.profile_picture}` : '/default-avatar.png'}
                  alt={request.username}
                  className="w-10 h-10 rounded-full"
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
      )}
    </div>
  );
};

export default FriendRequests;