import { createRouter } from 'next-connect';
import Order from '@/models/Order';
import dbConnect from '@/utils/dbConnect';
import { authenticateUser } from '@/app/middlewares/auth';
import cors from 'cors';

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    if (origin === process.env.NEXT_PUBLIC_CORS_ALLOWED_ORIGIN || origin === 'http://localhost:3001') {
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

handler.all((req, res) => {
  const allowedOrigins = [process.env.NEXT_PUBLIC_CORS_ALLOWED_ORIGIN, 'http://localhost:3001'];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin); // Set the allowed origin dynamically
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*'); // You can set a fallback if necessary
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true'); // Allow credentials (cookies)
  res.status(204).end(); // Respond with 204 for OPTIONS requests
});

export default handler.handler();