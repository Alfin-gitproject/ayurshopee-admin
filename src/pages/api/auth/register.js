import User from '@/models/User';
import dbConnect from '@/utils/dbConnect';
import jwt from 'jsonwebtoken';
import { validateUserRegistration, sanitizeInput } from '@/utils/validation';

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
    const name = sanitizeInput(req.body.name);
    const email = sanitizeInput(req.body.email);
    const phone = sanitizeInput(req.body.phone);
    const password = req.body.password;

    // Validate input
    const validation = validateUserRegistration({ name, email, phone, password });
    if (!validation.isValid) {
      return res.status(400).json({ 
        success: false, 
        message: validation.errors.join(', ')
      });
    }

    // Check if user already exists
    let existingUser;
    if (email) {
      existingUser = await User.findOne({ email });
    } else if (phone) {
      existingUser = await User.findOne({ phone });
    }

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists' 
      });
    }

    // Create user data object
    const userData = { name, password };
    if (email) userData.email = email;
    if (phone) userData.phone = phone;

    // Create new user
    const user = await User.create(userData);

    // Generate JWT token
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

    res.status(201).json({ 
      success: true, 
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Registration failed'
    });
  }
}