import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './db/connection.js';
import authRouter from './routes/authRouter.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});