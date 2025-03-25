// routes/commentReactionsRouter.js
import express from 'express';
import { 
  addOrUpdateReaction, 
  removeReaction, 
  getReactions, 
  getUserReaction 
} from '../controllers/commentreactionsController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Add or update a reaction to a comment
router.post('/:commentId', verifyToken, addOrUpdateReaction);

// Remove a reaction from a comment
router.delete('/:commentId', verifyToken, removeReaction);

// Get all reactions for a comment
router.get('/:commentId', getReactions);

// Get user's reaction to a comment
router.get('/:commentId/user', verifyToken, getUserReaction);

export default router;