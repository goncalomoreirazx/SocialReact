import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;

//images
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// CORS Configuration
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.options('*', cors());

// Middlewares
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/posts', postsRouter);
app.use('/api/friends', friendRouter);
app.use('/api/messages', messagesRouter);

// Socket.IO connection handling
// Socket.IO connection handling
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User connects with their ID
  socket.on('user_connected', (userId) => {
    console.log('User registered:', userId);
    connectedUsers.set(userId, socket.id);
    
    // Broadcast user's online status to others
    socket.broadcast.emit('user_status', {
      userId: userId,
      status: 'online'
    });
  });

  // Handle new messages
  socket.on('send_message', async (data) => {
    try {
      const { senderId, receiverId, content } = data;
      const receiverSocketId = connectedUsers.get(receiverId);

      // Store message in database
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

      // Send to receiver if they're online
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receive_message', newMessage[0]);
      }

      // Send back to sender for confirmation
      socket.emit('message_sent', newMessage[0]);
      
    } catch (error) {
      console.error('Error handling message:', error);
      socket.emit('message_error', { error: 'Failed to send message' });
    }
  });

  // Handle typing status
  socket.on('typing_start', ({ senderId, receiverId }) => {
    const receiverSocketId = connectedUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('typing_status', {
        userId: senderId,
        isTyping: true
      });
    }
  });

  socket.on('typing_stop', ({ senderId, receiverId }) => {
    const receiverSocketId = connectedUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('typing_status', {
        userId: senderId,
        isTyping: false
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const userId = [...connectedUsers.entries()]
      .find(([_, socketId]) => socketId === socket.id)?.[0];
    
    if (userId) {
      connectedUsers.delete(userId);
      // Broadcast user's offline status
      socket.broadcast.emit('user_status', {
        userId: userId,
        status: 'offline'
      });
    }
  });
});

// Only use httpServer.listen(), remove app.listen()
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});