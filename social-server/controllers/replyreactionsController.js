// controllers/replyreactionsController.js
import db from '../db/connection.js';

// Add or update a reaction to a reply
export const addOrUpdateReaction = async (req, res) => {
  try {
    const { replyId } = req.params;
    const { reactionType } = req.body;
    const userId = req.user.userId;

    if (!reactionType) {
      return res.status(400).json({ message: 'Reaction type is required' });
    }

    // Check if the reply exists
    const [reply] = await db.promise().query(
      'SELECT * FROM comment_replies WHERE id = ?',
      [replyId]
    );

    if (reply.length === 0) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    // Check if user already reacted to this reply
    const [existingReaction] = await db.promise().query(
      'SELECT * FROM reply_reactions WHERE reply_id = ? AND user_id = ?',
      [replyId, userId]
    );

    let result;
    let message;
    let action;

    if (existingReaction.length > 0) {
      // Update existing reaction
      result = await db.promise().query(
        'UPDATE reply_reactions SET reaction_type = ? WHERE reply_id = ? AND user_id = ?',
        [reactionType, replyId, userId]
      );
      message = 'Reaction updated successfully';
      action = 'updated';
    } else {
      // Add new reaction
      result = await db.promise().query(
        'INSERT INTO reply_reactions (reply_id, user_id, reaction_type) VALUES (?, ?, ?)',
        [replyId, userId, reactionType]
      );
      message = 'Reaction added successfully';
      action = 'added';
    }

    // Get all reactions for this reply
    const [reactions] = await db.promise().query(`
      SELECT reaction_type, COUNT(*) as count
      FROM reply_reactions
      WHERE reply_id = ?
      GROUP BY reaction_type
    `, [replyId]);

    res.status(200).json({
      message,
      action,
      replyId,
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

// Remove a reaction from a reply
export const removeReaction = async (req, res) => {
  try {
    const { replyId } = req.params;
    const userId = req.user.userId;

    // Check if the reply exists
    const [reply] = await db.promise().query(
      'SELECT * FROM comment_replies WHERE id = ?',
      [replyId]
    );

    if (reply.length === 0) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    // Delete the reaction
    await db.promise().query(
      'DELETE FROM reply_reactions WHERE reply_id = ? AND user_id = ?',
      [replyId, userId]
    );

    // Get updated reaction counts
    const [reactions] = await db.promise().query(`
      SELECT reaction_type, COUNT(*) as count
      FROM reply_reactions
      WHERE reply_id = ?
      GROUP BY reaction_type
    `, [replyId]);

    res.json({
      message: 'Reaction removed successfully',
      replyId,
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

// Get all reactions for a reply
export const getReactions = async (req, res) => {
  try {
    const { replyId } = req.params;
    
    // Check if the reply exists
    const [reply] = await db.promise().query(
      'SELECT * FROM comment_replies WHERE id = ?',
      [replyId]
    );

    if (reply.length === 0) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    // Get all reactions with user information
    const [reactions] = await db.promise().query(`
      SELECT 
        rr.id,
        rr.reaction_type,
        rr.user_id,
        u.username,
        u.profile_picture
      FROM reply_reactions rr
      JOIN users u ON rr.user_id = u.id
      WHERE rr.reply_id = ?
    `, [replyId]);

    // Get aggregated reaction counts
    const [reactionCounts] = await db.promise().query(`
      SELECT reaction_type, COUNT(*) as count
      FROM reply_reactions
      WHERE reply_id = ?
      GROUP BY reaction_type
    `, [replyId]);

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

// Get user's reaction to a reply
export const getUserReaction = async (req, res) => {
  try {
    const { replyId } = req.params;
    const userId = req.user.userId;

    const [reaction] = await db.promise().query(
      'SELECT * FROM reply_reactions WHERE reply_id = ? AND user_id = ?',
      [replyId, userId]
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