import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import db from './db/connection.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRouter from './routes/authRouter.js';
import userRouter from './routes/userRouter.js';
import postsRouter from './routes/postsRouter.js';
import friendRouter from './routes/friendRouter.js';
import messagesRouter from './routes/messagesRouter.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Initialize Socket.IO with CORS
const io = new Server(httpServer, {
  cors: corsOptions,
  allowEIO3: true
});

// Configure __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/posts', postsRouter);
app.use('/api/friends', friendRouter);
app.use('/api/messages', messagesRouter);

// Socket authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    
    if (!token) {
      return next(new Error('No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    const [users] = await db.promise().query(
      'SELECT id, email, username FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return next(new Error('User not found'));
    }

    socket.user = decoded;
    next();
  } catch (error) {
    console.error('Socket auth error:', error);
    next(new Error('Invalid token'));
  }
});

// Connected users map
const connectedUsers = new Map();

// Socket connection handler
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('user_connected', async (userId) => {
    try {
      if (userId !== socket.user.userId) {
        throw new Error('User ID mismatch');
      }

      await db.promise().query(
        'UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = ?',
        [userId]
      );

      connectedUsers.set(userId, socket.id);
      
      socket.broadcast.emit('user_status', {
        userId: userId,
        status: 'online'
      });

      socket.emit('online_users', Array.from(connectedUsers.keys()));
      console.log('User registered:', userId);
    } catch (error) {
      console.error('Error in user_connected:', error);
      socket.emit('error', { message: 'Failed to register user connection' });
    }
  });

  socket.on('send_message', async (data) => {
    try {
      const { senderId, receiverId, content } = data;
      
      if (senderId !== socket.user.userId) {
        throw new Error('Unauthorized message sender');
      }

      const [result] = await db.promise().query(
        'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
        [senderId, receiverId, content]
      );

      const [newMessage] = await db.promise().query(
        `SELECT m.*, 
          u.username as sender_name, 
          u.profile_picture as sender_profile_picture
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.id = ?`,
        [result.insertId]
      );

      const receiverSocketId = connectedUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receive_message', newMessage[0]);
      }

      socket.emit('message_sent', newMessage[0]);
      
    } catch (error) {
      console.error('Error handling message:', error);
      socket.emit('message_error', { error: 'Failed to send message' });
    }
  });

  socket.on('typing_start', ({ receiverId }) => {
    const receiverSocketId = connectedUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('typing_status', {
        userId: socket.user.userId,
        isTyping: true
      });
    }
  });

  socket.on('typing_stop', ({ receiverId }) => {
    const receiverSocketId = connectedUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('typing_status', {
        userId: socket.user.userId,
        isTyping: false
      });
    }
  });

  socket.on('disconnect', async () => {
    try {
      const userId = socket.user?.userId;
      
      if (userId) {
        await db.promise().query(
          'UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = ?',
          [userId]
        );

        connectedUsers.delete(userId);
        
        socket.broadcast.emit('user_status', {
          userId: userId,
          status: 'offline'
        });
        
        console.log('User disconnected:', userId);
      }
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});