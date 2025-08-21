import jwt from 'jsonwebtoken';
import User from '@/models/User';
import dbConnect from '@/utils/dbConnect';

export const authenticateUser = async (req, res, next) => {
  await dbConnect();

  // Check for token in cookies or Authorization header
  let token = req.cookies?.token;
  
  // If no cookie, check Authorization header
  if (!token && req.headers.authorization) {
    token = req.headers.authorization.split(' ')[1]; // Bearer token
  }
  
  // Parse cookies manually if needed
  if (!token && req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});
    token = cookies.token;
  }
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized to access. Please sign in with valid credentials' 
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user and attach to request
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized to access. Please sign in with valid credentials' 
    });
  }
};
