import User from '@/models/User';
import dbConnect from '@/utils/dbConnect';
import jwt from 'jsonwebtoken';
import { validateUserLogin, sanitizeInput } from '@/utils/validation';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_CORS_ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  // Only allow POST method
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ 
      success: false, 
      message: `Method ${req.method} Not Allowed` 
    });
  }

  try {
    await dbConnect();
    
    // Sanitize input
    const email = sanitizeInput(req.body.email);
    const password = req.body.password;

    // Validate input - only email is required for admin login
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required for admin login' 
      });
    }

    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid email address' 
      });
    }

    // Find user by email only and select password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check if user has admin role
    if (user.roles !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin privileges required.' 
      });
    }

    // Create token
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    // Set cookie with proper settings
    const cookieSettings = process.env.NODE_ENV === 'production' 
      ? `token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=None; Secure`
      : `token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict`;
    
    res.setHeader('Set-Cookie', cookieSettings);

    res.status(200).json({ 
      success: true, 
      message: 'Admin login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.roles
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Admin login failed'
    });
  }
}
