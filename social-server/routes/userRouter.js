import express from 'express';
import { 
    getUserProfile, 
    getUserPhotos, 
    getUserPosts, 
    updateUser,
    searchUsers,
    addFriend,
    upload // Import multer instance
} from '../controllers/userController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Put specific routes BEFORE parameter routes
router.get('/search', verifyToken, searchUsers);
router.post('/add-friend', verifyToken, addFriend);

// Parameter routes come after
router.get('/:userId', getUserProfile);
router.get('/:userId/photos', getUserPhotos);
router.get('/:userId/posts', getUserPosts);

// Configure for multiple file uploads - important: match field names with frontend
router.put('/:userId/update', verifyToken, upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'coverPhoto', maxCount: 1 }
]), updateUser);

export default router;