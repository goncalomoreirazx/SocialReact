import db from '../db/connection.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to validate uploaded image
const fileFilter = (req, file, cb) => {
  // Accept common image file types
  const allowedMimeTypes = [
    'image/jpeg', 
    'image/jpg', 
    'image/png', 
    'image/gif',
    'image/bmp',
    'image/webp',
    'image/jfif' 
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Export multer instance
export const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Update the getUserProfile function in userController.js

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Get user info
    const [user] = await db.promise().query(`
      SELECT id, username, email, profile_picture, cover_photo, birth_date, bio 
      FROM users 
      WHERE id = ?
    `, [userId]);

    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get friend count (both directions - either as requester or recipient)
    const [friendsCount] = await db.promise().query(`
      SELECT COUNT(*) as count 
      FROM friends 
      WHERE (user_id = ? OR friend_id = ?) AND status = 'accepted'
    `, [userId, userId]);

    // Get posts count
    const [postsCount] = await db.promise().query(`
      SELECT COUNT(*) as count 
      FROM posts 
      WHERE user_id = ?
    `, [userId]);

    // If the requesting user is logged in, check if they are friends
    let isFriend = false;
    if (req.user && req.user.userId !== parseInt(userId)) {
      const [friendship] = await db.promise().query(
        `SELECT * FROM friends 
         WHERE ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?))
         AND status = 'accepted'`,
        [req.user.userId, userId, userId, req.user.userId]
      );
      isFriend = friendship.length > 0;
    }

    // Check if there's a pending friend request (in either direction)
    let pendingRequest = null;
    if (req.user && req.user.userId !== parseInt(userId)) {
      const [outgoingRequest] = await db.promise().query(
        `SELECT id FROM friends 
         WHERE user_id = ? AND friend_id = ? AND status = 'pending'`,
        [req.user.userId, userId]
      );
      
      const [incomingRequest] = await db.promise().query(
        `SELECT id FROM friends 
         WHERE user_id = ? AND friend_id = ? AND status = 'pending'`,
        [userId, req.user.userId]
      );
      
      if (outgoingRequest.length > 0) {
        pendingRequest = 'outgoing';
      } else if (incomingRequest.length > 0) {
        pendingRequest = 'incoming';
      }
    }

    const userProfile = {
      ...user[0],
      friends_count: friendsCount[0].count,
      posts_count: postsCount[0].count,
      is_friend: isFriend,
      pending_request: pendingRequest
    };

    res.json(userProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
};

//TESTE AMIGOS NOVOS
export const getUserFriends = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Get all friends (either direction) with accepted status
    const [friends] = await db.promise().query(`
      SELECT 
        u.id, 
        u.username, 
        u.profile_picture, 
        u.bio,
        f.created_at as friendship_date,
        CASE 
          WHEN u.last_active >= NOW() - INTERVAL 1 MINUTE THEN 'online'
          ELSE 'offline'
        END as status
      FROM friends f
      JOIN users u ON (
        CASE 
          WHEN f.user_id = ? THEN f.friend_id
          WHEN f.friend_id = ? THEN f.user_id 
        END
      ) = u.id
      WHERE (f.user_id = ? OR f.friend_id = ?) 
        AND f.status = 'accepted'
        AND u.id != ?
      ORDER BY u.username
    `, [userId, userId, userId, userId, userId]);
    
    res.json(friends);
  } catch (error) {
    console.error('Error fetching user friends:', error);
    res.status(500).json({ message: 'Error fetching user friends' });
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

// Updated updateUser function to handle multiple file uploads
export const updateUser = async (req, res) => {
  try {
    const { bio } = req.body;
    const userId = req.params.userId;
    
    console.log("Request files: ", req.files);
    console.log("Request body: ", req.body);
    
    // Get files from the request
    const profilePicture = req.files && req.files.profilePhoto ? req.files.profilePhoto[0] : null;
    const coverPhoto = req.files && req.files.coverPhoto ? req.files.coverPhoto[0] : null;
    
    // Verify user exists
    const [existingUser] = await db.promise().query(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );

    if (existingUser.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Build update query dynamically
    let updateQuery = 'UPDATE users SET';
    const queryParams = [];
    let hasUpdates = false;
    
    // Add bio to update if provided
    if (bio !== undefined) {
      updateQuery += ' bio = ?';
      queryParams.push(bio);
      hasUpdates = true;
    }
    
    // Add profile picture to update if provided
    if (profilePicture) {
      if (hasUpdates) {
        updateQuery += ',';
      }
      updateQuery += ' profile_picture = ?';
      queryParams.push(profilePicture.filename);
      hasUpdates = true;
    }
    
    // Add cover photo to update if provided
    if (coverPhoto) {
      if (hasUpdates) {
        updateQuery += ',';
      }
      updateQuery += ' cover_photo = ?';
      queryParams.push(coverPhoto.filename);
      hasUpdates = true;
    }
    
    // Only proceed if there's something to update
    if (!hasUpdates) {
      return res.status(400).json({ message: 'No updates provided' });
    }
    
    // Complete the query
    updateQuery += ' WHERE id = ?';
    queryParams.push(userId);

    // Execute the update
    const [result] = await db.promise().query(updateQuery, queryParams);
    
    if (result.affectedRows === 0) {
      return res.status(500).json({ message: 'Failed to update user profile' });
    }

    // Fetch updated user data
    const [updatedUser] = await db.promise().query(
      'SELECT id, username, email, profile_picture, cover_photo, bio FROM users WHERE id = ?',
      [userId]
    );

    res.json(updatedUser[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ 
      message: 'Error updating user profile', 
      error: error.message 
    });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { searchTerm } = req.query;
    const userId = req.user.userId;

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

    // Get access to io and connectedUsers from app object
    const io = req.app.get('io');
    const connectedUsers = req.app.get('connectedUsers');
    
    // Send real-time notification if the recipient is online
    const receiverSocketId = connectedUsers.get(parseInt(friendId));
    
    if (receiverSocketId) {
      console.log(`Sending friend request notification to socket: ${receiverSocketId}`);
      io.to(receiverSocketId).emit('new_friend_request', {
        senderId: userId,
        receiverId: friendId
      });
    }

    res.status(201).json({ 
      message: 'Friend request sent successfully',
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