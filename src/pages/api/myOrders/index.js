import { createRouter } from 'next-connect';
import Order from '@/models/Order';
import dbConnect from '@/utils/dbConnect';
import { authenticateUser } from '@/app/middlewares/auth';

const handler = createRouter();

handler.get(authenticateUser, async (req, res) => {
  try {
    await dbConnect();
    const userId = req.user._id;
    
    // Find orders directly by user ID without pagination
    const orders = await Order.find({ user: userId });

    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default handler.handler();