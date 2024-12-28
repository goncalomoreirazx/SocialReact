// controllers/postsController.js
import db from '../db/connection.js';

export const createPost = async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user.userId;
    const imageUrl = req.file ? `/uploads/posts/${req.file.filename}` : null;

    // Insert the post
    const [result] = await db.promise().query(
      'INSERT INTO posts (user_id, content, image_url) VALUES (?, ?, ?)',
      [userId, content, imageUrl]
    );

    // Fetch the complete post data with user information
    const [newPost] = await db.promise().query(`
      SELECT 
        p.*,
        u.username,
        u.profile_picture,
        0 as likes,
        0 as comments
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `, [result.insertId]);

    // Format the response
    const post = {
      ...newPost[0],
      image: newPost[0].image_url,
      profile_picture: `/uploads/${newPost[0].profile_picture}`,
      created_at: new Date()
    };

    res.status(201).json({
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Error creating post', error: error.message });
  }
};

export const getPosts = async (req, res) => {
  try {
    const [posts] = await db.promise().query(`
      SELECT 
        p.id,
        p.content,
        p.image_url,
        p.created_at,
        p.user_id,
        u.username,
        u.profile_picture,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `);

    // Format the posts to include proper image URLs
    const formattedPosts = posts.map(post => ({
      ...post,
      image: post.image_url,
      // Add /uploads/ prefix to profile pictures
      profile_picture: post.profile_picture ? `/uploads/${post.profile_picture}` : null,
      created_at: post.created_at,
      username: post.username || 'Anonymous User'
    }));

    res.json({ posts: formattedPosts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
};