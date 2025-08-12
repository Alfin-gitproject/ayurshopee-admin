'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import UpdateOrder from '@/components/updateOrder';
import { fetchOrderDetails } from '@/utils/orderApi'; // Assuming this function is defined to fetch order details
import DeleteOrder from '@/components/DeleteOrder';
import Loading from '@/components/Loading';
import Link from 'next/link';

export default function OrderDetailsPage() {
  const pathname = usePathname();
  const id = pathname.split('/').pop();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch order details when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching order with ID:', id);
        const orderData = await fetchOrderDetails(id);
        console.log('Received order data:', orderData);
        if (orderData) {
          setOrder(orderData);
        } else {
          setError('Order not found');
        }
      } catch (error) {
        setError('Failed to fetch order details');
        console.error('Order fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    } else {
      setError('No order ID provided');
      setLoading(false);
    }
  }, [id]);

  // Display loading state or error message while fetching data
  if (loading) {
    return (
    <div
    className='w-full h-full flex items-center justify-center mt-10'
    >
      <Loading/>
    </div>
    )
  }

  if (error) {
    return <div className='w-full h-full flex items-center justify-center'>{error}</div>;
  }

  // Handle case when order is not found
  if (!order) {
    return <div>Order not found.</div>;
  }

  return (
    <div className="max-w-screen-xl mx-auto p-4">
      <div className="shadow-md rounded-lg p-6">
        <div className='flex justify-between'>
          <Link href={'/orders'} className='btn bg-gray-400 dark:bg-gray-700 rounded-full p-3'>
          <svg
              className="w-6 h-6 text-gray-800 dark:text-white"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 12h14M5 12l4-4m-4 4 4 4"
              />
          </svg>
          </Link>
        </div>
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold mb-4">Order Details</h1>
          {order && order._id && <DeleteOrder id={order._id}/>}
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Order Information */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Order Information</h2>
            <p>Order ID: {order._id}</p>
            <p>Status: {order.orderStatus}</p>
            <p>Price : ₹{order.totalAmount?.toFixed(2)}</p>
          </div>

          {/* Shipping Details */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Shipping Details</h2>
            <p><strong>Name:</strong> {order.shippingInfo?.fullName}</p>
            <p><strong>Address:</strong> {order.shippingInfo?.address}</p>
            <p><strong>Location:</strong> {order.shippingInfo?.city}, {order.shippingInfo?.zipCode}</p>
            <p><strong>Country:</strong> {order?.shippingInfo?.country}</p>
            <p><strong>Phone:</strong> {order.shippingInfo?.phoneNo}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Actions</h2>
            <UpdateOrder orderId={order._id} orderData={order} />
          </div>
        </div>

        {/* Order Items */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Order Items</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-500">
                <th className="border p-2 text-left">Product</th>
                <th className="border p-2">Quantity</th>
                <th className="border p-2">Price</th>
                <th className="border p-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.orderItems?.map((item) => (
                <tr key={item._id}>
                  <td className="border p-2">{item.name}</td>
                  <td className="border p-2 text-center">{item.quantity}</td>
                  <td className="border p-2 text-right">₹{parseFloat(item.price)?.toFixed(2)}</td>
                  <td className="border p-2 text-right">
                    ₹{(parseFloat(item.price) * item.quantity)?.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
