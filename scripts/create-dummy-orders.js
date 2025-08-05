// Script to create dummy orders for testing
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env.local') });

import dbConnect from '../src/utils/dbConnect.js';
import Order from '../src/models/Order.js';
import User from '../src/models/User.js';
import mongoose from 'mongoose';

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
  },
  {
    shippingInfo: {
      fullName: "David Brown",
      address: "654 Maple Drive",
      city: "Seattle",
      phoneNo: "+1888999000",
      zipCode: "98101",
      country: "USA"
    },
    orderItems: [
      {
        name: "Gaming Chair",
        quantity: 1,
        image: "https://example.com/gaming-chair.jpg",
        price: "249.99",
        product: "PROD008"
      }
    ],
    paymentMethod: "COD",
    paymentInfo: {
      id: "",
      status: "pending"
    },
    itemsPrice: 249.99,
    taxAmount: 20.00,
    shippingAmount: 15.99,
    totalAmount: 285.98,
    orderStatus: "Processing"
  }
];

async function createDummyOrders() {
  try {
    await dbConnect();
    console.log('Connected to MongoDB');

    // Find a user to assign orders to (or create one if none exists)
    let user = await User.findOne();
    
    if (!user) {
      console.log('No users found, creating a dummy user...');
      user = await User.create({
        name: 'Demo User',
        email: 'demo@example.com',
        password: 'password123',
        roles: 'user'
      });
      console.log('Created demo user:', user.email);
    }

    // Clear existing orders
    await Order.deleteMany({});
    console.log('Cleared existing orders');

    // Create orders with the user ID
    const ordersWithUser = dummyOrders.map(order => ({
      ...order,
      user: user._id
    }));

    const createdOrders = await Order.insertMany(ordersWithUser);
    console.log(`Created ${createdOrders.length} dummy orders`);

    createdOrders.forEach((order, index) => {
      console.log(`Order ${index + 1}: ${order._id} - ${order.orderStatus} - $${order.totalAmount}`);
    });

    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error creating dummy orders:', error);
    mongoose.connection.close();
  }
}

createDummyOrders();
