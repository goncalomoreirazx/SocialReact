// controllers/commentsController.js
import db from '../db/connection.js';

// Add a new comment to a post
export const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    // Check if the post exists
    const [post] = await db.promise().query(
      'SELECT * FROM posts WHERE id = ?',
      [postId]
    );

    if (post.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Add the comment
    const [result] = await db.promise().query(
      'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
      [postId, userId, content.trim()]
    );

    // Get the complete comment data with user information
    const [newComment] = await db.promise().query(`
      SELECT 
        c.id, 
        c.content, 
        c.created_at, 
        c.user_id,
        u.username,
        u.profile_picture
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [result.insertId]);

    res.status(201).json({
      message: 'Comment added successfully',
      comment: newComment[0]
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ 
      message: 'Error adding comment', 
      error: error.message 
    });
  }
};

// Get all comments for a post
export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Check if the post exists
    const [post] = await db.promise().query(
      'SELECT * FROM posts WHERE id = ?',
      [postId]
    );

    if (post.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Get comments with user information
    const [comments] = await db.promise().query(`
      SELECT 
        c.id, 
        c.content, 
        c.created_at, 
        c.user_id,
        u.username,
        u.profile_picture
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
    `, [postId, limit, offset]);

    // Get total comment count
    const [countResult] = await db.promise().query(
      'SELECT COUNT(*) as total FROM comments WHERE post_id = ?',
      [postId]
    );

    const totalComments = countResult[0].total;
    const totalPages = Math.ceil(totalComments / limit);

    res.json({
      comments,
      pagination: {
        total: totalComments,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ 
      message: 'Error fetching comments', 
      error: error.message 
    });
  }
};

// Delete a comment (only the comment owner or post owner should be able to delete)
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId;

    // Get the comment with post information to check ownership
    const [comment] = await db.promise().query(`
      SELECT c.*, p.user_id as post_owner_id
      FROM comments c
      JOIN posts p ON c.post_id = p.id
      WHERE c.id = ?
    `, [commentId]);

    if (comment.length === 0) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is the comment owner or post owner
    if (comment[0].user_id !== userId && comment[0].post_owner_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    // Delete the comment
    await db.promise().query('DELETE FROM comments WHERE id = ?', [commentId]);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ 
      message: 'Error deleting comment', 
      error: error.message 
    });
  }
};