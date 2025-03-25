// routes/replyreactionsRouter.js
import express from 'express';
import { 
  addOrUpdateReaction, 
  removeReaction, 
  getReactions, 
  getUserReaction 
} from '../controllers/replyreactionsController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Add or update a reaction to a reply
router.post('/:replyId', verifyToken, addOrUpdateReaction);

// Remove a reaction from a reply
router.delete('/:replyId', verifyToken, removeReaction);

// Get all reactions for a reply
router.get('/:replyId', getReactions);

// Get user's reaction to a reply
router.get('/:replyId/user', verifyToken, getUserReaction);

export default router;