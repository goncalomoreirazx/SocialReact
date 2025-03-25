import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }

    // Check if the header starts with 'Bearer '
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Invalid token format. Token must be Bearer token.' });
    }

    // Extract the token
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authentication required. Token is missing.' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      req.user = decoded; // Contains { userId: xxx, email: xxx }
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token has expired. Please log in again.' });
      }
      return res.status(401).json({ message: 'Invalid token. Please log in again.' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Internal server error during authentication.' });
  }
};

// Export token verification function for socket.io
export const verifySocketToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
  } catch (error) {
    throw new Error('Invalid token');
  }
};