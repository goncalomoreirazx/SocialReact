import mysql from 'mysql2';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db/connection.js';

export const register = async (req, res) => {
  try {
    const { email, username, password, birthDate } = req.body;
    const profilePictureFilename = req.file ? req.file.filename : null;

    const [existingUsers] = await db.promise().query(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email or username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.promise().query(
      'INSERT INTO users (email, username, password, birth_date, profile_picture) VALUES (?, ?, ?, ?, ?)',
      [email, username, hashedPassword, birthDate, profilePictureFilename]
    );

    res.status(201).json({ 
      message: 'User registered successfully',
      userId: result.insertId 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { userInput, password } = req.body;

    const [users] = await db.promise().query(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [userInput, userInput]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email
       },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        profilePicture: user.profile_picture
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login' });
  }
};

export const updateLastActive = async (userId) => {
  try {
    await db.promise().query(
      'UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = ?',
      [userId]
    );
  } catch (error) {
    console.error('Error updating last_active:', error);
  }
};

// Add this function
export const updateActivity = async (req, res) => {
  try {
    const userId = req.user.userId;
    await updateLastActive(userId);
    res.json({ message: 'Activity updated' });
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({ message: 'Error updating activity' });
  }
};