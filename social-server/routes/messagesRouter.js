import express from 'express';
import { getConversations, getMessages, sendMessage } from '../controllers/messagesController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/conversations', verifyToken, getConversations);
router.get('/:friendId', verifyToken, getMessages);
router.post('/', verifyToken, sendMessage);

export default router;