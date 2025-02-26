// routes/friendRouter.js
import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { 
  sendFriendRequest, 
  acceptFriendRequest, 
  declineFriendRequest,
  getPendingRequests,
  getFriendsList,
  removeFriend // Add this new import
} from '../controllers/friendController.js';

const router = express.Router();

router.post('/request', verifyToken, sendFriendRequest);
router.post('/accept', verifyToken, acceptFriendRequest);
router.post('/decline', verifyToken, declineFriendRequest);
router.get('/pending', verifyToken, getPendingRequests);
router.get('/list', verifyToken, getFriendsList);
router.delete('/remove/:friendId', verifyToken, removeFriend); // Add new route

export default router;
