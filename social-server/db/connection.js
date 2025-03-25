import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'socialreact',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4' // Add this line
});

// Test the connection using the pool
db.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to database:', err.message);
      process.exit(1);
    }
    console.log('Successfully connected to database.');
    connection.release(); // Always release the connection when done
  });
  
  export default db;