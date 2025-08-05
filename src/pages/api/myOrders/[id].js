import { createRouter } from 'next-connect';
import dbConnect from '@/utils/dbConnect';
import Order from '@/models/Order';
import { authenticateUser } from '@/app/middlewares/auth';

import cors from 'cors';

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    if (origin === process.env.NEXT_PUBLIC_CORS_ALLOWED_ORIGIN || origin === 'http://localhost:3000') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true, // Allow cookies to be sent with requests
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204, // Handle legacy browsers
};

const handler = createRouter();
handler.use(cors(corsOptions));
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

handler.all((req, res) => {
    const allowedOrigins = [process.env.NEXT_PUBLIC_CORS_ALLOWED_ORIGIN, 'http://localhost:3001'];
    const origin = req.headers.origin;
  
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin); 
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
  
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true'); 
    res.status(204).end(); 
});

export default handler.handler();