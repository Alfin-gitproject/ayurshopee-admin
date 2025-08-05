'use client'

import { useState } from "react";
import axios from "axios";

export default function UpdateOrder({ orderId, orderData }) {
  const [status, setStatus] = useState(orderData.orderStatus||"");

  const updateOrderHandler = async (id) => {
    try {
      const response = await axios.patch(`/api/orders/${id}`, { orderStatus: status });
      if (response.data.success) {
        alert("Order status updated successfully");
      } else {
        alert("Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("An error occurred while updating the order status");
    }
  };

  return (
    <>
      <div className="mb-3">
        <select
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          name="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
        </select>
      </div>

      <button
        className="btn bg-emerald-500 text-white w-full p-2 rounded-sm"
        onClick={() => updateOrderHandler(orderId)}
      >
        Update Status
      </button>
    </>
  );
}
