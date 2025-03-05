// controllers/commentReactionsController.js
import db from '../db/connection.js';

// Add or update a reaction to a comment
export const addOrUpdateReaction = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { reactionType } = req.body;
    const userId = req.user.userId;

    if (!reactionType) {
      return res.status(400).json({ message: 'Reaction type is required' });
    }

    // Check if the comment exists
    const [comment] = await db.promise().query(
      'SELECT * FROM comments WHERE id = ?',
      [commentId]
    );

    if (comment.length === 0) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user already reacted to this comment
    const [existingReaction] = await db.promise().query(
      'SELECT * FROM comment_reactions WHERE comment_id = ? AND user_id = ?',
      [commentId, userId]
    );

    let result;
    let message;
    let action;

    if (existingReaction.length > 0) {
      // Update existing reaction
      result = await db.promise().query(
        'UPDATE comment_reactions SET reaction_type = ? WHERE comment_id = ? AND user_id = ?',
        [reactionType, commentId, userId]
      );
      message = 'Reaction updated successfully';
      action = 'updated';
    } else {
      // Add new reaction
      result = await db.promise().query(
        'INSERT INTO comment_reactions (comment_id, user_id, reaction_type) VALUES (?, ?, ?)',
        [commentId, userId, reactionType]
      );
      message = 'Reaction added successfully';
      action = 'added';
    }

    // Get all reactions for this comment
    const [reactions] = await db.promise().query(`
      SELECT reaction_type, COUNT(*) as count
      FROM comment_reactions
      WHERE comment_id = ?
      GROUP BY reaction_type
    `, [commentId]);

    res.status(200).json({
      message,
      action,
      commentId,
      reactionType,
      reactionCounts: reactions
    });
  } catch (error) {
    console.error('Error adding/updating reaction:', error);
    res.status(500).json({ 
      message: 'Error processing reaction', 
      error: error.message 
    });
  }
};

// Remove a reaction from a comment
export const removeReaction = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId;

    // Check if the comment exists
    const [comment] = await db.promise().query(
      'SELECT * FROM comments WHERE id = ?',
      [commentId]
    );

    if (comment.length === 0) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Delete the reaction
    await db.promise().query(
      'DELETE FROM comment_reactions WHERE comment_id = ? AND user_id = ?',
      [commentId, userId]
    );

    // Get updated reaction counts
    const [reactions] = await db.promise().query(`
      SELECT reaction_type, COUNT(*) as count
      FROM comment_reactions
      WHERE comment_id = ?
      GROUP BY reaction_type
    `, [commentId]);

    res.json({
      message: 'Reaction removed successfully',
      commentId,
      reactionCounts: reactions
    });
  } catch (error) {
    console.error('Error removing reaction:', error);
    res.status(500).json({ 
      message: 'Error removing reaction', 
      error: error.message 
    });
  }
};

// Get all reactions for a comment
export const getReactions = async (req, res) => {
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

    // Get all reactions with user information
    const [reactions] = await db.promise().query(`
      SELECT 
        cr.id,
        cr.reaction_type,
        cr.user_id,
        u.username,
        u.profile_picture
      FROM comment_reactions cr
      JOIN users u ON cr.user_id = u.id
      WHERE cr.comment_id = ?
    `, [commentId]);

    // Get aggregated reaction counts
    const [reactionCounts] = await db.promise().query(`
      SELECT reaction_type, COUNT(*) as count
      FROM comment_reactions
      WHERE comment_id = ?
      GROUP BY reaction_type
    `, [commentId]);

    res.json({
      reactions,
      reactionCounts
    });
  } catch (error) {
    console.error('Error fetching reactions:', error);
    res.status(500).json({ 
      message: 'Error fetching reactions', 
      error: error.message 
    });
  }
};

// Get user's reaction to a comment
export const getUserReaction = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId;

    const [reaction] = await db.promise().query(
      'SELECT * FROM comment_reactions WHERE comment_id = ? AND user_id = ?',
      [commentId, userId]
    );

    res.json({
      hasReacted: reaction.length > 0,
      reaction: reaction.length > 0 ? reaction[0].reaction_type : null
    });
  } catch (error) {
    console.error('Error fetching user reaction:', error);
    res.status(500).json({ 
      message: 'Error fetching user reaction', 
      error: error.message 
    });
  }
};