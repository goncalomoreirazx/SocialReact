// controllers/likesController.js
import db from '../db/connection.js';

// Toggle like (add or remove)
export const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    // Check if the post exists
    const [post] = await db.promise().query(
      'SELECT * FROM posts WHERE id = ?',
      [postId]
    );

    if (post.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user already liked the post
    const [existingLike] = await db.promise().query(
      'SELECT * FROM likes WHERE post_id = ? AND user_id = ?',
      [postId, userId]
    );

    if (existingLike.length > 0) {
      // Unlike: Remove like if it exists
      await db.promise().query(
        'DELETE FROM likes WHERE post_id = ? AND user_id = ?',
        [postId, userId]
      );

      // Get updated likes count
      const [likesCount] = await db.promise().query(
        'SELECT COUNT(*) as count FROM likes WHERE post_id = ?',
        [postId]
      );

      return res.json({
        message: 'Post unliked successfully',
        liked: false,
        likesCount: likesCount[0].count
      });
    } else {
      // Like: Add like if it doesn't exist
      await db.promise().query(
        'INSERT INTO likes (post_id, user_id) VALUES (?, ?)',
        [postId, userId]
      );

      // Get updated likes count
      const [likesCount] = await db.promise().query(
        'SELECT COUNT(*) as count FROM likes WHERE post_id = ?',
        [postId]
      );

      return res.json({
        message: 'Post liked successfully',
        liked: true,
        likesCount: likesCount[0].count
      });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ 
      message: 'Error processing like action', 
      error: error.message 
    });
  }
};

// Check if the user has liked a post
export const checkLikeStatus = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    const [existingLike] = await db.promise().query(
      'SELECT * FROM likes WHERE post_id = ? AND user_id = ?',
      [postId, userId]
    );

    const [likesCount] = await db.promise().query(
      'SELECT COUNT(*) as count FROM likes WHERE post_id = ?',
      [postId]
    );

    res.json({
      liked: existingLike.length > 0,
      likesCount: likesCount[0].count
    });
  } catch (error) {
    console.error('Error checking like status:', error);
    res.status(500).json({ 
      message: 'Error checking like status', 
      error: error.message 
    });
  }
};

// Get all users who liked a post (for implementing "X, Y, and 10 others liked this")
export const getLikedUsers = async (req, res) => {
  try {
    const { postId } = req.params;
    
    const [users] = await db.promise().query(`
      SELECT u.id, u.username, u.profile_picture
      FROM likes l
      JOIN users u ON l.user_id = u.id
      WHERE l.post_id = ?
      ORDER BY l.created_at DESC
      LIMIT 10
    `, [postId]);

    // Get total count
    const [count] = await db.promise().query(
      'SELECT COUNT(*) as total FROM likes WHERE post_id = ?',
      [postId]
    );

    res.json({
      users,
      total: count[0].total
    });
  } catch (error) {
    console.error('Error fetching liked users:', error);
    res.status(500).json({ 
      message: 'Error fetching liked users', 
      error: error.message 
    });
  }
};