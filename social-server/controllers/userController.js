import db from '../db/connection.js';

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Get user info
    const [user] = await db.promise().query(`
      SELECT id, username, email, profile_picture, birth_date, bio 
      FROM users 
      WHERE id = ?
    `, [userId]);

    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get follower count
    const [followers] = await db.promise().query(`
      SELECT COUNT(*) as count 
      FROM friends 
      WHERE friend_id = ?
    `, [userId]);

    // Get following count
    const [following] = await db.promise().query(`
      SELECT COUNT(*) as count 
      FROM friends 
      WHERE user_id = ?
    `, [userId]);

    const userProfile = {
      ...user[0],
      followers: followers[0].count,
      following: following[0].count
    };

    res.json(userProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const [posts] = await db.promise().query(
      'SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC',
      [req.params.userId]
    );
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserPhotos = async (req, res) => {
  try {
    const [photos] = await db.promise().query(
      'SELECT * FROM posts WHERE user_id = ? AND image_url IS NOT NULL ORDER BY created_at DESC',
      [req.params.userId]
    );
    res.json(photos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { bio } = req.body;
    const profilePicture = req.file;
    let updateQuery = 'UPDATE users SET bio = ?';
    let queryParams = [bio];

    if (profilePicture) {
      updateQuery += ', profile_picture = ?';
      queryParams.push(profilePicture.filename);
    }
    updateQuery += ' WHERE id = ?';
    queryParams.push(req.params.userId);

    await db.promise().query(updateQuery, queryParams);

    const [updatedUser] = await db.promise().query(
      'SELECT * FROM users WHERE id = ?',
      [req.params.userId]
    );

    res.json(updatedUser[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};