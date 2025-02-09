// routes/friendRouter.js
import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { 
  sendFriendRequest, 
  acceptFriendRequest, 
  getPendingRequests,
  getFriendsList 
} from '../controllers/friendController.js';

const router = express.Router();

router.post('/request', verifyToken, sendFriendRequest);
router.post('/accept', verifyToken, acceptFriendRequest);
router.get('/pending', verifyToken, getPendingRequests);
router.get('/list', verifyToken, getFriendsList);

export default router;