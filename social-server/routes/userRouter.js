import express from 'express';
import { getUserProfile, getUserPhotos, getUserPosts, updateUser } from '../controllers/userController.js';
import multer from 'multer';
import path from 'path';

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

router.get('/:userId', getUserProfile);
router.get('/:userId/photos', getUserPhotos);
router.get('/:userId/posts', getUserPosts);
router.put('/:userId/update', upload.single('photo'), updateUser);


export default router;