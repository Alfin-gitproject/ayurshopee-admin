import { createRouter } from 'next-connect';
import dbConnect from '@/utils/dbConnect';
import Order from '@/models/Order';
import { authenticateUser } from '@/app/middlewares/auth';

const handler = createRouter();
handler.get(authenticateUser, async (req, res) => {
  try {
    await dbConnect();

    const order = await Order.findOne({ 
      _id: req.query.id, 
      user: req.user._id 
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid Order ID' });
    }

    res.status(500).json({ success: false, message: error.message });
  }
});

export default handler.handler();