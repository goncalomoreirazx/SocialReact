// routes/commentsRouter.js
import express from 'express';
import { addComment, getComments, deleteComment } from '../controllers/commentsController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Add a comment to a post
router.post('/:postId', verifyToken, addComment);

// Get all comments for a post
router.get('/:postId', getComments);

// Delete a comment
router.delete('/:commentId', verifyToken, deleteComment);

export default router;