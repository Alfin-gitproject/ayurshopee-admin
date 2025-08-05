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
    const phone = sanitizeInput(req.body.phone);
    const password = req.body.password;

    // Validate input
    const validation = validateUserLogin({ email, phone, password });
    if (!validation.isValid) {
      return res.status(400).json({ 
        success: false, 
        message: validation.errors.join(', ')
      });
    }

    // Find user by email or phone and select password
    let user;
    if (email) {
      user = await User.findOne({ email }).select('+password');
    } else if (phone) {
      user = await User.findOne({ phone }).select('+password');
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
      message: 'Logged in successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Login failed'
    });
  }
}