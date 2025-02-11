import db from '../db/connection.js';
import { updateLastActive } from './authController.js';

export const sendFriendRequest = async (req, res) => {
    try {
      const { friendId } = req.body;
      const userId = req.user.userId;
  
      if (!userId || !friendId) {
        return res.status(400).json({ message: 'User ID and Friend ID are required' });
      }
  
      // Check if a friend request already exists
      const [existingRequest] = await db.promise().query(
        'SELECT * FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)',
        [userId, friendId, friendId, userId]
      );
  
      if (existingRequest.length > 0) {
        return res.status(400).json({ message: 'Friend request already exists' });
      }
  
      // Send friend request
      await db.promise().query(
        'INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, "pending")',
        [userId, friendId]
      );
  
      res.status(201).json({ message: 'Friend request sent successfully' });
    } catch (error) {
      console.error('Send friend request error:', error);
      res.status(500).json({ message: 'Error sending friend request' });
    }
  };
  
  export const acceptFriendRequest = async (req, res) => {
    try {
      const { requestId } = req.body;
      const userId = req.user.userId;
  
      // Verify the request exists and is pending
      const [request] = await db.promise().query(
        'SELECT * FROM friends WHERE id = ? AND friend_id = ? AND status = "pending"',
        [requestId, userId]
      );
  
      if (request.length === 0) {
        return res.status(404).json({ message: 'Friend request not found' });
      }
  
      // Accept the request
      await db.promise().query(
        'UPDATE friends SET status = "accepted" WHERE id = ?',
        [requestId]
      );
  
      res.json({ message: 'Friend request accepted' });
    } catch (error) {
      console.error('Accept friend request error:', error);
      res.status(500).json({ message: 'Error accepting friend request' });
    }
  };
  
  export const getPendingRequests = async (req, res) => {
    try {
      const userId = req.user.userId;
  
      const [requests] = await db.promise().query(
        `SELECT f.id, f.user_id, f.created_at, u.username, u.profile_picture 
         FROM friends f 
         JOIN users u ON f.user_id = u.id 
         WHERE f.friend_id = ? AND f.status = "pending"`,
        [userId]
      );
  
      res.json(requests);
    } catch (error) {
      console.error('Get pending requests error:', error);
      res.status(500).json({ message: 'Error getting pending requests' });
    }
  };
  
  export const getFriendsList = async (req, res) => {
    try {
      const userId = req.user.userId;
      
      // Update last_active when user fetches friends list
      await updateLastActive(userId);
  
      const [friends] = await db.promise().query(
        `SELECT 
          u.id, 
          u.username,
          u.profile_picture,
          u.last_active as lastSeen,
          CASE 
            WHEN u.last_active >= NOW() - INTERVAL 1 MINUTE THEN 'online'
            ELSE 'offline'
          END as status
        FROM friends f
        JOIN users u ON (f.friend_id = u.id OR f.user_id = u.id)
        WHERE (f.user_id = ? OR f.friend_id = ?)
          AND f.status = "accepted"
          AND u.id != ?`,
        [userId, userId, userId]
      );
  
      res.json(friends);
    } catch (error) {
      console.error('Get friends list error:', error);
      res.status(500).json({ message: 'Error getting friends list' });
    }
  };