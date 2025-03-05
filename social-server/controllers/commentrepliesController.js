// controllers/commentRepliesController.js
import db from '../db/connection.js';

// Add a new reply to a comment
export const addReply = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Reply content is required' });
    }

    // Check if the parent comment exists
    const [comment] = await db.promise().query(
      'SELECT * FROM comments WHERE id = ?',
      [commentId]
    );

    if (comment.length === 0) {
      return res.status(404).json({ message: 'Parent comment not found' });
    }

    // Add the reply
    const [result] = await db.promise().query(
      'INSERT INTO comment_replies (comment_id, user_id, content) VALUES (?, ?, ?)',
      [commentId, userId, content.trim()]
    );

    // Get the complete reply data with user information
    const [newReply] = await db.promise().query(`
      SELECT 
        cr.id, 
        cr.comment_id,
        cr.content, 
        cr.created_at, 
        cr.user_id,
        u.username,
        u.profile_picture
      FROM comment_replies cr
      JOIN users u ON cr.user_id = u.id
      WHERE cr.id = ?
    `, [result.insertId]);

    res.status(201).json({
      message: 'Reply added successfully',
      reply: newReply[0]
    });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ 
      message: 'Error adding reply', 
      error: error.message 
    });
  }
};

// Get all replies for a comment
export const getReplies = async (req, res) => {
    try {
      const { commentId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
  
      // Check if the comment exists
      const [comment] = await db.promise().query(
        'SELECT * FROM comments WHERE id = ?',
        [commentId]
      );
  
      if (comment.length === 0) {
        return res.status(404).json({ message: 'Comment not found' });
      }
  
      // Get replies with user information and parent reply info
      const [replies] = await db.promise().query(`
        SELECT 
          cr.id, 
          cr.comment_id,
          cr.content, 
          cr.created_at, 
          cr.user_id,
          cr.parent_reply_id,
          u.username,
          u.profile_picture,
          pu.username as parent_username
        FROM comment_replies cr
        JOIN users u ON cr.user_id = u.id
        LEFT JOIN comment_replies pr ON cr.parent_reply_id = pr.id
        LEFT JOIN users pu ON pr.user_id = pu.id
        WHERE cr.comment_id = ?
        ORDER BY cr.created_at ASC
        LIMIT ? OFFSET ?
      `, [commentId, limit, offset]);
  
      // Get total reply count
      const [countResult] = await db.promise().query(
        'SELECT COUNT(*) as total FROM comment_replies WHERE comment_id = ?',
        [commentId]
      );
  
      const totalReplies = countResult[0].total;
      const totalPages = Math.ceil(totalReplies / limit);
  
      res.json({
        replies,
        pagination: {
          total: totalReplies,
          page,
          limit,
          totalPages,
          hasMore: page < totalPages
        }
      });
    } catch (error) {
      console.error('Error fetching replies:', error);
      res.status(500).json({ 
        message: 'Error fetching replies', 
        error: error.message 
      });
    }
  };
  
// Get reply count for a comment
export const getReplyCount = async (req, res) => {
  try {
    const { commentId } = req.params;

    // Check if the comment exists
    const [comment] = await db.promise().query(
      'SELECT * FROM comments WHERE id = ?',
      [commentId]
    );

    if (comment.length === 0) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Get total reply count
    const [countResult] = await db.promise().query(
      'SELECT COUNT(*) as count FROM comment_replies WHERE comment_id = ?',
      [commentId]
    );

    res.json({
      count: countResult[0].count
    });
  } catch (error) {
    console.error('Error fetching reply count:', error);
    res.status(500).json({ 
      message: 'Error fetching reply count', 
      error: error.message 
    });
  }
};

// Delete a reply (only the reply owner should be able to delete)
export const deleteReply = async (req, res) => {
  try {
    const { replyId } = req.params;
    const userId = req.user.userId;

    // Get the reply to check ownership
    const [reply] = await db.promise().query(
      'SELECT * FROM comment_replies WHERE id = ?',
      [replyId]
    );

    if (reply.length === 0) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    // Check if user is the reply owner
    if (reply[0].user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this reply' });
    }

    // Delete the reply
    await db.promise().query('DELETE FROM comment_replies WHERE id = ?', [replyId]);

    res.json({ message: 'Reply deleted successfully' });
  } catch (error) {
    console.error('Error deleting reply:', error);
    res.status(500).json({ 
      message: 'Error deleting reply', 
      error: error.message 
    });
  }
};


// Add a nested reply (reply to a reply)
export const addNestedReply = async (req, res) => {
    try {
      const { commentId } = req.params;
      const { content, parentReplyId } = req.body;
      const userId = req.user.userId;
  
      if (!content || !content.trim()) {
        return res.status(400).json({ message: 'Reply content is required' });
      }
  
      if (!parentReplyId) {
        return res.status(400).json({ message: 'Parent reply ID is required' });
      }
  
      // Check if the parent comment exists
      const [comment] = await db.promise().query(
        'SELECT * FROM comments WHERE id = ?',
        [commentId]
      );
  
      if (comment.length === 0) {
        return res.status(404).json({ message: 'Parent comment not found' });
      }
  
      // Check if the parent reply exists
      const [parentReply] = await db.promise().query(
        'SELECT r.*, u.username as parent_username FROM comment_replies r JOIN users u ON r.user_id = u.id WHERE r.id = ?',
        [parentReplyId]
      );
  
      if (parentReply.length === 0) {
        return res.status(404).json({ message: 'Parent reply not found' });
      }
  
      // Add the nested reply
      const [result] = await db.promise().query(
        'INSERT INTO comment_replies (comment_id, user_id, content, parent_reply_id) VALUES (?, ?, ?, ?)',
        [commentId, userId, content.trim(), parentReplyId]
      );
       // Get the complete reply data with user information
    const [newReply] = await db.promise().query(`
        SELECT 
          cr.id, 
          cr.comment_id,
          cr.content, 
          cr.created_at, 
          cr.user_id,
          cr.parent_reply_id,
          u.username,
          u.profile_picture,
          pu.username as parent_username
        FROM comment_replies cr
        JOIN users u ON cr.user_id = u.id
        LEFT JOIN comment_replies pr ON cr.parent_reply_id = pr.id
        LEFT JOIN users pu ON pr.user_id = pu.id
        WHERE cr.id = ?
      `, [result.insertId]);
  
      res.status(201).json({
        message: 'Reply added successfully',
        reply: newReply[0]
      });
    } catch (error) {
      console.error('Error adding nested reply:', error);
      res.status(500).json({ 
        message: 'Error adding nested reply', 
        error: error.message 
      });
    }
  };