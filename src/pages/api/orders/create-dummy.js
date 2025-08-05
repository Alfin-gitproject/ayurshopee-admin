import Order from '@/models/Order';
import User from '@/models/User';
import dbConnect from '@/utils/dbConnect';

const dummyOrders = [
  {
    shippingInfo: {
      fullName: "John Doe",
      address: "123 Main Street, Apartment 4B",
      city: "New York",
      phoneNo: "+1234567890",
      zipCode: "10001",
      country: "USA"
    },
    orderItems: [
      {
        name: "Wireless Bluetooth Headphones",
        quantity: 1,
        image: "https://example.com/headphones.jpg",
        price: "79.99",
        product: "PROD001"
      },
      {
        name: "Smartphone Case",
        quantity: 2,
        image: "https://example.com/case.jpg",
        price: "19.99",
        product: "PROD002"
      }
    ],
    paymentMethod: "Online",
    paymentInfo: {
      id: "pay_123456789",
      status: "completed"
    },
    itemsPrice: 119.97,
    taxAmount: 9.60,
    shippingAmount: 5.99,
    totalAmount: 135.56,
    orderStatus: "Processing"
  },
  {
    shippingInfo: {
      fullName: "Jane Smith",
      address: "456 Oak Avenue",
      city: "Los Angeles",
      phoneNo: "+1987654321",
      zipCode: "90210",
      country: "USA"
    },
    orderItems: [
      {
        name: "Laptop Stand",
        quantity: 1,
        image: "https://example.com/laptop-stand.jpg",
        price: "49.99",
        product: "PROD003"
      }
    ],
    paymentMethod: "COD",
    paymentInfo: {
      id: "",
      status: "pending"
    },
    itemsPrice: 49.99,
    taxAmount: 4.00,
    shippingAmount: 7.99,
    totalAmount: 61.98,
    orderStatus: "Shipped"
  },
  {
    shippingInfo: {
      fullName: "Mike Johnson",
      address: "789 Pine Street, Suite 301",
      city: "Chicago",
      phoneNo: "+1122334455",
      zipCode: "60601",
      country: "USA"
    },
    orderItems: [
      {
        name: "Wireless Mouse",
        quantity: 1,
        image: "https://example.com/mouse.jpg",
        price: "29.99",
        product: "PROD004"
      },
      {
        name: "Keyboard",
        quantity: 1,
        image: "https://example.com/keyboard.jpg",
        price: "69.99",
        product: "PROD005"
      },
      {
        name: "Monitor",
        quantity: 1,
        image: "https://example.com/monitor.jpg",
        price: "199.99",
        product: "PROD006"
      }
    ],
    paymentMethod: "Online",
    paymentInfo: {
      id: "pay_987654321",
      status: "completed"
    },
    itemsPrice: 299.97,
    taxAmount: 24.00,
    shippingAmount: 12.99,
    totalAmount: 336.96,
    orderStatus: "Delivered",
    deliveredAt: new Date('2025-01-20')
  },
  {
    shippingInfo: {
      fullName: "Sarah Wilson",
      address: "321 Elm Street",
      city: "Miami",
      phoneNo: "+1555666777",
      zipCode: "33101",
      country: "USA"
    },
    orderItems: [
      {
        name: "Coffee Maker",
        quantity: 1,
        image: "https://example.com/coffee-maker.jpg",
        price: "89.99",
        product: "PROD007"
      }
    ],
    paymentMethod: "Online",
    paymentInfo: {
      id: "pay_111222333",
      status: "completed"
    },
    itemsPrice: 89.99,
    taxAmount: 7.20,
    shippingAmount: 8.99,
    totalAmount: 106.18,
    orderStatus: "Processing"
  }
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    
    // Find any user to assign orders to
    let user = await User.findOne();
    
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'No users found. Please register a user first.' 
      });
    }

    // Clear existing orders (optional)
    await Order.deleteMany({});

    // Create orders with the user ID
    const ordersWithUser = dummyOrders.map(order => ({
      ...order,
      user: user._id
    }));

    const createdOrders = await Order.insertMany(ordersWithUser);
    
    res.status(201).json({ 
      success: true, 
      message: `Created ${createdOrders.length} dummy orders`,
      data: createdOrders
    });

  } catch (error) {
    console.error('Error creating dummy orders:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to create dummy orders'
    });
  }
}
