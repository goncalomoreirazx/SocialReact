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
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('user_connected', (userId) => {
    connectedUsers.set(userId, socket.id);
  });

  socket.on('send_message', async (data) => {
    const receiverSocketId = connectedUsers.get(data.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receive_message', data);
    }
  });

  socket.on('disconnect', () => {
    const userId = [...connectedUsers.entries()]
      .find(([_, socketId]) => socketId === socket.id)?.[0];
    if (userId) {
      connectedUsers.delete(userId);
    }
  });
});

// Only use httpServer.listen(), remove app.listen()
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});