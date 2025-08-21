import Link from "next/link";
import DeleteOrder from "./DeleteOrder";

export default function OrderTable({ orders, onOrderDeleted }) {
  // Log the orders prop when the component renders
  console.log('Orders:', orders);
  
  return (
    <div className="relative overflow-x-auto shadow-md">
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">ID</th>
            <th scope="col" className="px-6 py-3">Customer</th>
            <th scope="col" className="px-6 py-3">Date</th>
            <th scope="col" className="px-6 py-3">Payment Status</th>
            <th scope="col" className="px-6 py-3">Order Status</th>
            <th scope="col" className="px-6 py-3">Total</th>
            <th scope="col" className="px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            // Calculate total amount dynamically from order items
            const calculatedTotal = order.orderItems?.reduce((total, item) => {
              return total + (parseFloat(item.price) * item.quantity);
            }, 0) || 0;

            return (
              <tr 
                key={order._id} 
                className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700"
              >
                <td className="px-6 py-4">
                  {order._id.slice(-6)}
                </td>
                <td className="px-6 py-4">
                  {order.user ? order.user.name : 'N/A'}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.paymentStatus === 'Paid' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                  }`}>
                    {order.paymentStatus || order.paymentMethod}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.orderStatus === 'Delivered' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : order.orderStatus === 'Processing'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                  }`}>
                    {order.orderStatus}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium">
                  ₹{calculatedTotal.toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <Link
                      href={`/orders/${order._id}`}
                      className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                    >
                      View
                    </Link>
                    <DeleteOrder orderId={order._id} onOrderDeleted={onOrderDeleted} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}