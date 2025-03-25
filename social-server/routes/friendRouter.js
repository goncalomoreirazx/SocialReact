// routes/friendRouter.js
import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { 
  sendFriendRequest, 
  acceptFriendRequest, 
  declineFriendRequest,
  getPendingRequests,
  getFriendsList,
  removeFriend,
  getUserFriends // Add new function import
} from '../controllers/friendController.js';

const router = express.Router();

// Friend request management
router.post('/request', verifyToken, sendFriendRequest);
router.post('/accept', verifyToken, acceptFriendRequest);
router.post('/decline', verifyToken, declineFriendRequest);
router.get('/pending', verifyToken, getPendingRequests);

// Friends lists
router.get('/list', verifyToken, getFriendsList);
router.get('/user/:userId', verifyToken, getUserFriends); // New endpoint for getting a specific user's friends

// Remove friend
router.delete('/remove/:friendId', verifyToken, removeFriend);

export default router;