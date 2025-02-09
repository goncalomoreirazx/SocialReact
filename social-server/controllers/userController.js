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


export const searchUsers = async (req, res) => {
  try {
    const { searchTerm } = req.query;
    const userId = req.user.userId; // This is correct

    const [users] = await db.promise().query(
      `SELECT id, username, profile_picture, bio 
       FROM users 
       WHERE username LIKE ? 
       AND id != ?
       LIMIT 20`,
      [`%${searchTerm}%`, userId]
    );

    // Get friendship status for each user
    const usersWithFriendStatus = await Promise.all(users.map(async (user) => {
      const [friendStatus] = await db.promise().query(
        'SELECT * FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)',
        [userId, user.id, user.id, userId]
      );

      return {
        ...user,
        isFriend: friendStatus.length > 0
      };
    }));

    res.json(usersWithFriendStatus);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ 
      message: 'Error searching users',
      error: error.message 
    });
  }
};

// src/pages/FindFriends.jsx
const handleAddFriend = async (userId, e) => {
  e.stopPropagation(); // Prevent navigation when clicking the button
  
  try {
    console.log('Sending friend request with:', {
      friendId: userId,
      token: token
    });

    const response = await axios.post(
      'http://localhost:5000/api/users/add-friend',
      { friendId: userId },
      { 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data) {
      // Update the local state to reflect the new friendship
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isFriend: true } : user
      ));
    }
  } catch (error) {
    console.error('Error adding friend:', error.response?.data || error.message);
    // You might want to show this error to the user
  }
};

// controllers/userController.js
export const addFriend = async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.user?.userId;

    console.log('Add friend request:', {
      friendId,
      userId,
      user: req.user,
      headers: req.headers
    });

    // Validate inputs
    if (!userId) {
      return res.status(400).json({ 
        message: 'User ID is missing from token',
        debug: { user: req.user }
      });
    }

    if (!friendId) {
      return res.status(400).json({ 
        message: 'Friend ID is required in request body' 
      });
    }

    // Verify both users exist
    const [users] = await db.promise().query(
      'SELECT id FROM users WHERE id IN (?, ?)',
      [userId, friendId]
    );

    if (users.length !== 2) {
      return res.status(404).json({ 
        message: 'One or both users not found' 
      });
    }

    // Check if friendship already exists
    const [existingFriendship] = await db.promise().query(
      'SELECT * FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)',
      [userId, friendId, friendId, userId]
    );

    if (existingFriendship.length > 0) {
      return res.status(400).json({ 
        message: 'Friendship already exists' 
      });
    }

    // Add friendship
    const [result] = await db.promise().query(
      'INSERT INTO friends (user_id, friend_id) VALUES (?, ?)',
      [userId, friendId]
    );

    console.log('Friendship created:', result);

    res.status(201).json({ 
      message: 'Friend added successfully',
      friendshipId: result.insertId
    });
  } catch (error) {
    console.error('Add friend error:', error);
    res.status(500).json({ 
      message: 'Error adding friend',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};