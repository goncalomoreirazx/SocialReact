// routes/likesRouter.js
import express from 'express';
import { toggleLike, checkLikeStatus, getLikedUsers } from '../controllers/likesController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Toggle like (add or remove)
router.post('/:postId', verifyToken, toggleLike);

// Check if user has liked a post
router.get('/:postId/status', verifyToken, checkLikeStatus);

// Get users who liked a post
router.get('/:postId/users', getLikedUsers);

export default router;