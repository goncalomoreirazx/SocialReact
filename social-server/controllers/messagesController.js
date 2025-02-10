import db from '../db/connection.js';

export const getConversations = async (req, res) => {
  try {
    const userId = req.user.userId;
    const [conversations] = await db.promise().query(`
      SELECT DISTINCT 
        u.id, u.username, u.profile_picture,
        (SELECT content FROM messages 
         WHERE (sender_id = ? AND receiver_id = u.id) 
         OR (sender_id = u.id AND receiver_id = ?)
         ORDER BY sent_at DESC LIMIT 1) as last_message,
        (SELECT sent_at FROM messages 
         WHERE (sender_id = ? AND receiver_id = u.id) 
         OR (sender_id = u.id AND receiver_id = ?)
         ORDER BY sent_at DESC LIMIT 1) as last_message_time
      FROM messages m
      JOIN users u ON (m.sender_id = u.id OR m.receiver_id = u.id)
      WHERE ? IN (sender_id, receiver_id) AND u.id != ?
      GROUP BY u.id
      ORDER BY last_message_time DESC
    `, [userId, userId, userId, userId, userId, userId]);

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Error fetching conversations' });
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

export const sendMessage = async (req, res) => {
  try {
    const { userId } = req.user;
    const { receiverId, content } = req.body;

    const [result] = await db.promise().query(
      'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
      [userId, receiverId, content]
    );

    const [message] = await db.promise().query(
      'SELECT m.*, u.username as sender_name, u.profile_picture as sender_profile_picture FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.id = ?',
      [result.insertId]
    );

    res.status(201).json(message[0]);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
};