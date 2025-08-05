import dbConnect from '@/utils/dbConnect';
import Order from '@/models/Order';
import { authenticateUser } from '@/app/middlewares/auth';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_CORS_ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  try {
    await dbConnect();

    // Use authentication middleware
    await new Promise((resolve, reject) => {
      authenticateUser(req, res, (result) => {
        if (result instanceof Error) {
          reject(result);
        } else {
          resolve(result);
        }
      });
    });

    const { id } = req.query;

    if (req.method === 'GET') {
      const order = await Order.findById(id).populate('user', 'name email phone');
      
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      res.status(200).json({ success: true, data: order });

    } else if (req.method === 'PATCH') {
      // Check if user is admin (temporarily disabled for development)
      // if (req?.user?.roles !== 'admin') {
      //   return res.status(403).json({ success: false, message: 'Admin access required' });
      // }

      const { orderStatus } = req.body;

      if (!orderStatus) {
        return res.status(400).json({ success: false, message: 'Order status is required' });
      }

      const updatedOrder = await Order.findByIdAndUpdate(
        id,
        { 
          orderStatus,
          deliveredAt: orderStatus === 'Delivered' ? new Date() : undefined
        },
        { new: true, runValidators: true }
      ).populate('user', 'name email phone');

      if (!updatedOrder) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      res.status(200).json({ 
        success: true, 
        data: updatedOrder,
        message: `Order status updated to ${orderStatus}`
      });

    } else if (req.method === 'DELETE') {
      // Check if user is admin (temporarily disabled for development)
      // if (req?.user?.roles !== 'admin') {
      //   return res.status(403).json({ success: false, message: 'Admin access required' });
      // }

      const deletedOrder = await Order.findByIdAndDelete(id);

      if (!deletedOrder) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      res.status(200).json({ 
        success: true, 
        message: 'Order deleted successfully',
        data: deletedOrder
      });

    } else {
      res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
      res.status(405).json({ 
        success: false, 
        message: `Method ${req.method} Not Allowed` 
      });
    }

  } catch (error) {
    console.error('Order API error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid Order ID' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }

    res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
}
