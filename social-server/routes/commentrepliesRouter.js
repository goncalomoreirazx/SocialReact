// routes/commentrepliesRouter.js
import express from 'express';
import { 
  addReply, 
  getReplies, 
  deleteReply, 
  getReplyCount,
  addNestedReply
} from '../controllers/commentrepliesController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Add a reply to a comment
router.post('/:commentId', verifyToken, addReply);

// Add a nested reply to a comment (reply to a reply)
router.post('/:commentId/nested', verifyToken, addNestedReply);

// Get all replies for a comment
router.get('/:commentId', getReplies);

// Get reply count for a comment
router.get('/:commentId/count', getReplyCount);

// Delete a reply
router.delete('/:replyId', verifyToken, deleteReply);

export default router;