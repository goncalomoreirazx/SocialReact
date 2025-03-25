import express from 'express';
import { getConversations, getMessages, sendMessage, markMessagesAsRead, getUnreadCount} from '../controllers/messagesController.js';
import { verifyToken } from '../middleware/auth.js';
import { upload } from '../controllers/messagesController.js';
const router = express.Router();

router.get('/conversations', verifyToken, getConversations);
router.get('/:friendId', verifyToken, getMessages);
router.post('/', verifyToken, upload.single('image'), sendMessage);
router.post('/:senderId/read', verifyToken, markMessagesAsRead);
router.get('/unread', verifyToken, getUnreadCount);

export default router;