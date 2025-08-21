import User from '@/models/User';
import dbConnect from '@/utils/dbConnect';

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

    const { email, phone, adminKey } = req.body;

    // Simple admin key protection (you should use a strong secret key)
    const ADMIN_CREATION_KEY = process.env.ADMIN_CREATION_KEY || 'create-admin-2025';
    
    if (adminKey !== ADMIN_CREATION_KEY) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid admin creation key' 
      });
    }

    if (!email && !phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Either email or phone is required' 
      });
    }

    // Find user by email or phone
    let user;
    if (email) {
      user = await User.findOne({ email });
    } else if (phone) {
      user = await User.findOne({ phone });
    }

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check if user is already admin
    if (user.roles === 'admin') {
      return res.status(200).json({ 
        success: true, 
        message: 'User is already an admin',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          roles: user.roles
        }
      });
    }

    // Note: The schema has immutable: true for roles, so we need to use updateOne directly
    await User.updateOne(
      { _id: user._id },
      { $set: { roles: 'admin' } }
    );

    // Fetch the updated user
    const updatedUser = await User.findById(user._id);

    res.status(200).json({ 
      success: true, 
      message: 'User successfully upgraded to admin',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        roles: updatedUser.roles
      }
    });

  } catch (error) {
    console.error('Upgrade to admin error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to upgrade user to admin' 
    });
  }
}
