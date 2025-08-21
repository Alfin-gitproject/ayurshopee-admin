import { authenticateUser } from '@/app/middlewares/auth';
import User from '@/models/User';
import dbConnect from '@/utils/dbConnect';

export default async function handler(req, res) {
  try {
    await dbConnect();

    await authenticateUser(req, res, async () => {
      console.log(req?.user);
      if (req?.user?.isAdmin()) {
        res.status(200).json({ success: true, data: req.user });
      } else {
        res.status(403).json({
          success: false,
          message: 'Forbidden: Admins only',
        });
      }
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error - Database connection failed',
    });
  }
}