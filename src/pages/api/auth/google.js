import User from '@/models/User';
import dbConnect from '@/utils/dbConnect';
import jwt from 'jsonwebtoken';
import { sanitizeInput } from '@/utils/validation';

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
    
    // Extract Google user data
    const {
      name,
      email,
      phone,
      firebaseUid,
      profilePicture,
      emailVerified,
      provider
    } = req.body;

    // Validate required fields
    if (!name || !email || !firebaseUid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, and firebaseUid are required for Google authentication' 
      });
    }

    // Sanitize input
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPhone = phone && phone.trim() ? sanitizeInput(phone) : null;

    // Check if user already exists by Firebase UID or email
    let user = await User.findOne({ 
      $or: [
        { firebaseUid: firebaseUid },
        { email: sanitizedEmail }
      ]
    });

    if (user) {
      // Update existing user's last login and sync any new data
      user.lastLogin = new Date();
      if (!user.firebaseUid) user.firebaseUid = firebaseUid;
      if (!user.profilePicture && profilePicture) user.profilePicture = profilePicture;
      if (!user.phone && sanitizedPhone) user.phone = sanitizedPhone;
      if (emailVerified !== undefined) user.emailVerified = emailVerified;
      if (!user.provider) user.provider = 'google';
      
      await user.save();
    } else {
      // Create new user for Google authentication
      const userData = {
        name: sanitizedName,
        email: sanitizedEmail,
        firebaseUid: firebaseUid,
        profilePicture: profilePicture || '',
        emailVerified: emailVerified || false,
        provider: provider || 'google',
        password: 'google_auth_' + Date.now(), // Dummy password for Google users
        lastLogin: new Date()
      };

      // Only add phone if it's not empty
      if (sanitizedPhone) {
        userData.phone = sanitizedPhone;
      }

      user = await User.create(userData);
    }

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

    res.status(200).json({ 
      success: true, 
      message: user.lastLogin.getTime() === user.createdAt?.getTime() 
        ? 'User registered successfully with Google' 
        : 'Logged in successfully with Google',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        firebaseUid: user.firebaseUid,
        profilePicture: user.profilePicture,
        emailVerified: user.emailVerified,
        provider: user.provider,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      },
      isNewUser: user.lastLogin.getTime() === user.createdAt?.getTime()
    });

  } catch (error) {
    console.error('Google authentication error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Google authentication failed'
    });
  }
}
