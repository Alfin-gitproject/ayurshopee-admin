'use client'
import axios from 'axios';

// Fetch order details by ID
export async function fetchOrderDetails(orderId) {
  try {
    console.log('Fetching order with ID:', orderId);
    const { data } = await axios.get(`/api/orders/${orderId}`, {
      withCredentials: true, 
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Order data received:', data);
    return data.data;
  } catch (error) {
    console.error('Order fetch error:', error);
    return null;
  }
}
