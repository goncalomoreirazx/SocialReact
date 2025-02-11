import express from 'express';
import { 
    getUserProfile, 
    getUserPhotos, 
    getUserPosts, 
    updateUser,
    searchUsers,
    addFriend 
} from '../controllers/userController.js';
import multer from 'multer';
import path from 'path';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Put specific routes BEFORE parameter routes
router.get('/search', verifyToken, searchUsers);
router.post('/add-friend', verifyToken, addFriend);

// Parameter routes come after
router.get('/:userId', getUserProfile);
router.get('/:userId/photos', getUserPhotos);
router.get('/:userId/posts', getUserPosts);
// userRouter.js
router.put('/:userId/update', verifyToken, upload.single('photo'), updateUser);

export default router;