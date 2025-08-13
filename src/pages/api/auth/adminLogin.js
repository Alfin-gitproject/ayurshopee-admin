import User from '@/models/User';
import dbConnect from '@/utils/dbConnect';
import jwt from 'jsonwebtoken';
import { validateUserLogin, sanitizeInput } from '@/utils/validation';

export default async function handler(req, res) {
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
    const phone = sanitizeInput(req.body.phone);
    const password = req.body.password;

    // Validate input - either email or phone is required
    if (!password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password is required for admin login' 
      });
    }

    if (!email && !phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Either email or phone number is required for admin login' 
      });
    }

    if (email && !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid email address' 
      });
    }

    // Find user by email or phone and select password and roles
    let user;
    if (email) {
      user = await User.findOne({ email }).select('+password +roles');
    } else if (phone) {
      user = await User.findOne({ phone }).select('+password +roles');
    }

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

    // Create token with admin info
    const token = jwt.sign(
      { 
        id: user._id,
        role: user.roles,
        isAdmin: true 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '8h' } // Shorter expiry for admin sessions
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
