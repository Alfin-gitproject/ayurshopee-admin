import Order from '@/models/Order';
import dbConnect from '@/utils/dbConnect';
import { authenticateUser } from '@/app/middlewares/auth';
import { getPaginatedResults } from '@/utils/pagination';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_CORS_ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  try {
    await dbConnect();

    if (req.method === 'GET') {
      // Use authentication middleware for GET requests
      await new Promise((resolve, reject) => {
        authenticateUser(req, res, (result) => {
          if (result instanceof Error) {
            reject(result);
          } else {
            resolve(result);
          }
        });
      });

      const { results: orders, pagination } = await getPaginatedResults(Order, {}, req);

      // Populate user information in orders
      const populatedOrders = await Order.populate(orders, { 
        path: 'user', 
        select: 'name email phone' 
      });

      res.status(200).json({ 
        success: true, 
        data: populatedOrders,
        pagination
      });

    } else if (req.method === 'POST') {
      // Use authentication middleware for POST requests
      await new Promise((resolve, reject) => {
        authenticateUser(req, res, (result) => {
          if (result instanceof Error) {
            reject(result);
          } else {
            resolve(result);
          }
        });
      });

      // Create a new order
      const orderData = req.body;
      
      // Validate required fields
      if (!orderData.shippingInfo || !orderData.orderItems || !orderData.totalAmount) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing required fields: shippingInfo, orderItems, totalAmount' 
        });
      }
      
      // Associate the authenticated user with the order
      orderData.user = req.user._id;

      const order = await Order.create(orderData);
      const populatedOrder = await Order.findById(order._id).populate('user', 'name email phone');

      res.status(201).json({ 
        success: true, 
        data: populatedOrder,
        message: 'Order created successfully'
      });

    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ 
        success: false, 
        message: `Method ${req.method} Not Allowed` 
      });
    }

  } catch (error) {
    console.error('Orders API error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error'
    });
  }
}
