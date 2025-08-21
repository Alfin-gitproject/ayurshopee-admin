import crypto from 'crypto';
import Order from '@/models/Order';
import dbConnect from '@/utils/dbConnect';

export default async function handler(req, res) {

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification data'
      });
    }

    // Create signature to verify
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET_KEY)
      .update(body.toString())
      .digest('hex');

    // Verify signature
    if (expectedSignature === razorpaySignature) {
      // Payment verified successfully - update order in database
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        {
          paymentMethod: 'Online',
          paymentInfo: {
            id: razorpayPaymentId,
            status: 'completed'
          },
          orderStatus: 'Processing'
        },
        { new: true }
      );

      if (!updatedOrder) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        order: updatedOrder
      });
    } else {
      // Payment verification failed
      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
}
