import express from 'express';
import { register, login, updateActivity } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';  // Add this import for path.extname

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

// Define routes - only one register route with multer middleware
router.post('/register', upload.single('profilePicture'), register);
router.post('/login', login);
router.post('/update-activity', verifyToken, updateActivity);

export default router;