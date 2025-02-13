import db from '../db/connection.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for message image uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/messages/'));
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'message-' + uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

export const sendMessage = async (req, res) => {
  try {
    const { userId } = req.user;
    const { receiverId, content } = req.body;
    const imageUrl = req.file ? `/uploads/messages/${req.file.filename}` : null;

    // Insert the message
    const [result] = await db.promise().query(
      'INSERT INTO messages (sender_id, receiver_id, content, image_url) VALUES (?, ?, ?, ?)',
      [userId, receiverId, content || '', imageUrl]
    );

    // Fetch the complete message
    const [message] = await db.promise().query(
      `SELECT m.*, 
        u.username as sender_name, 
        u.profile_picture as sender_profile_picture
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.id = ?`,
      [result.insertId]
    );

    res.status(201).json(message[0]);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { userId } = req.user;
    const { friendId } = req.params;
    
    const [messages] = await db.promise().query(`
      SELECT 
        m.*,
        u.username as sender_name,
        u.profile_picture as sender_profile_picture
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE (sender_id = ? AND receiver_id = ?)
      OR (sender_id = ? AND receiver_id = ?)
      ORDER BY sent_at ASC
    `, [userId, friendId, friendId, userId]);

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
};

export const getConversations = async (req, res) => {
  try {
    const userId = req.user.userId;
    const [conversations] = await db.promise().query(`
      SELECT DISTINCT 
        u.id, 
        u.username, 
        u.profile_picture,
        (SELECT content FROM messages 
         WHERE (sender_id = ? AND receiver_id = u.id) 
         OR (sender_id = u.id AND receiver_id = ?)
         ORDER BY sent_at DESC LIMIT 1) as last_message,
        (SELECT sent_at FROM messages 
         WHERE (sender_id = ? AND receiver_id = u.id) 
         OR (sender_id = u.id AND receiver_id = ?)
         ORDER BY sent_at DESC LIMIT 1) as last_message_time,
        (SELECT COUNT(*) FROM messages 
         WHERE sender_id = u.id 
         AND receiver_id = ? 
         AND is_read = FALSE) as unread_count
      FROM messages m
      JOIN users u ON (m.sender_id = u.id OR m.receiver_id = u.id)
      WHERE ? IN (sender_id, receiver_id) AND u.id != ?
      GROUP BY u.id
      ORDER BY last_message_time DESC
    `, [userId, userId, userId, userId, userId, userId, userId]);

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Error fetching conversations' });
  }
};

export const markMessagesAsRead = async (req, res) => {
  try {
    const { userId } = req.user;
    const { senderId } = req.params;

    await db.promise().query(
      'UPDATE messages SET is_read = TRUE WHERE sender_id = ? AND receiver_id = ? AND is_read = FALSE',
      [senderId, userId]
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Error marking messages as read' });
  }
};