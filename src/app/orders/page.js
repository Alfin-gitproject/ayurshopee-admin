'use client'
import OrderTable from "@/components/OrderTable";
import { useState, useEffect } from "react";
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Loading from "@/components/Loading";

export default function Page() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 10
  });
  const router = useRouter();

  // Form state for adding new order
  const [newOrder, setNewOrder] = useState({
    shippingInfo: {
      fullName: '',
      address: '',
      city: '',
      phoneNo: '',
      zipCode: '',
      country: 'USA'
    },
    orderItems: [{
      name: '',
      quantity: 1,
      price: '',
      product: ''
    }],
    paymentMethod: 'COD',
    itemsPrice: 0,
    taxAmount: 0,
    shippingAmount: 5.99,
    totalAmount: 0
  });

  const getOrders = async (page = 1) => {
    setError('');
    setLoading(true);

    try {
      const response = await axios.get(`/api/orders?page=${page}&limit=${pagination.itemsPerPage}`);
      if (response.data.success) {
        setOrders(response.data.data);
        setPagination(response.data.pagination);
      } else {
        setError('Failed to fetch orders.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'An error occurred. Please try again.'
      );
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrders();
  }, []);

  const handlePageChange = (page) => {
    getOrders(page);
  };

  const handleInputChange = (e, section, index, field) => {
    const value = e.target.value;
    if (section === 'shippingInfo') {
      setNewOrder(prev => ({
        ...prev,
        shippingInfo: {
          ...prev.shippingInfo,
          [field]: value
        }
      }));
    } else if (section === 'orderItems') {
      setNewOrder(prev => ({
        ...prev,
        orderItems: prev.orderItems.map((item, i) => 
          i === index ? { ...item, [field]: value } : item
        )
      }));
    } else {
      setNewOrder(prev => ({ ...prev, [field]: value }));
    }
    
    // Recalculate total when price or quantity changes
    if (field === 'price' || field === 'quantity') {
      calculateTotal();
    }
  };

  const addOrderItem = () => {
    setNewOrder(prev => ({
      ...prev,
      orderItems: [...prev.orderItems, { name: '', quantity: 1, price: '', product: '' }]
    }));
  };

  const removeOrderItem = (index) => {
    setNewOrder(prev => ({
      ...prev,
      orderItems: prev.orderItems.filter((_, i) => i !== index)
    }));
    calculateTotal();
  };

  const calculateTotal = () => {
    setTimeout(() => {
      setNewOrder(prev => {
        const itemsPrice = prev.orderItems.reduce((total, item) => {
          return total + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 0);
        }, 0);
        const taxAmount = itemsPrice * 0.08; // 8% tax
        const totalAmount = itemsPrice + taxAmount + prev.shippingAmount;
        
        return {
          ...prev,
          itemsPrice: parseFloat(itemsPrice.toFixed(2)),
          taxAmount: parseFloat(taxAmount.toFixed(2)),
          totalAmount: parseFloat(totalAmount.toFixed(2))
        };
      });
    }, 100);
  };

  const handleAddOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/orders', newOrder, {
        withCredentials: true
      });

      if (response.data.success) {
        setShowAddForm(false);
        setNewOrder({
          shippingInfo: {
            fullName: '',
            address: '',
            city: '',
            phoneNo: '',
            zipCode: '',
            country: 'USA'
          },
          orderItems: [{
            name: '',
            quantity: 1,
            price: '',
            product: ''
          }],
          paymentMethod: 'COD',
          itemsPrice: 0,
          taxAmount: 0,
          shippingAmount: 5.99,
          totalAmount: 0
        });
        getOrders(); // Refresh orders list
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    {loading && !showAddForm ? (
      <div className="w-full h-full flex justify-center items-center mt-10">
        <Loading/>
      </div>
    ) : (
      <div className="max-w-6xl mx-auto mt-12 px-4">
        {/* Header with Add Order button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders Management</h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {showAddForm ? 'Cancel' : 'Add New Order'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Add Order Form */}
        {showAddForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Add New Order</h2>
            <form onSubmit={handleAddOrder} className="space-y-6">
              {/* Shipping Information */}
              <div>
                <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">Shipping Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={newOrder.shippingInfo.fullName}
                    onChange={(e) => handleInputChange(e, 'shippingInfo', null, 'fullName')}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 w-full dark:bg-gray-700 dark:text-white"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Phone Number"
                    value={newOrder.shippingInfo.phoneNo}
                    onChange={(e) => handleInputChange(e, 'shippingInfo', null, 'phoneNo')}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 w-full dark:bg-gray-700 dark:text-white"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Address"
                    value={newOrder.shippingInfo.address}
                    onChange={(e) => handleInputChange(e, 'shippingInfo', null, 'address')}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 w-full md:col-span-2 dark:bg-gray-700 dark:text-white"
                    required
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={newOrder.shippingInfo.city}
                    onChange={(e) => handleInputChange(e, 'shippingInfo', null, 'city')}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 w-full dark:bg-gray-700 dark:text-white"
                    required
                  />
                  <input
                    type="text"
                    placeholder="ZIP Code"
                    value={newOrder.shippingInfo.zipCode}
                    onChange={(e) => handleInputChange(e, 'shippingInfo', null, 'zipCode')}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 w-full dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
              </div>

              {/* Order Items */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Order Items</h3>
                  <button
                    type="button"
                    onClick={addOrderItem}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm"
                  >
                    Add Item
                  </button>
                </div>
                {newOrder.orderItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <input
                      type="text"
                      placeholder="Product Name"
                      value={item.name}
                      onChange={(e) => handleInputChange(e, 'orderItems', index, 'name')}
                      className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-white"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Product ID"
                      value={item.product}
                      onChange={(e) => handleInputChange(e, 'orderItems', index, 'product')}
                      className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-white"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Quantity"
                      value={item.quantity}
                      onChange={(e) => handleInputChange(e, 'orderItems', index, 'quantity')}
                      className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-white"
                      min="1"
                      required
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Price"
                      value={item.price}
                      onChange={(e) => handleInputChange(e, 'orderItems', index, 'price')}
                      className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-white"
                      min="0"
                      required
                    />
                    {newOrder.orderItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeOrderItem(index)}
                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Payment and Totals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Payment Method</label>
                  <select
                    value={newOrder.paymentMethod}
                    onChange={(e) => handleInputChange(e, null, null, 'paymentMethod')}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 w-full dark:bg-gray-700 dark:text-white"
                  >
                    <option value="COD">Cash on Delivery</option>
                    <option value="Online">Online Payment</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-900 dark:text-white">Items Price:</span>
                    <span className="text-gray-900 dark:text-white">${newOrder.itemsPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-900 dark:text-white">Tax (8%):</span>
                    <span className="text-gray-900 dark:text-white">${newOrder.taxAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-900 dark:text-white">Shipping:</span>
                    <span className="text-gray-900 dark:text-white">${newOrder.shippingAmount}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-2">
                    <span className="text-gray-900 dark:text-white">Total:</span>
                    <span className="text-gray-900 dark:text-white">${newOrder.totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } transition-colors`}
              >
                {loading ? 'Creating Order...' : 'Create Order'}
              </button>
            </form>
          </div>
        )}

        {/* Orders Table */}
        <div className="relative flex flex-col w-full h-full overflow-auto text-gray-700 dark:bg-slate-600 bg-slate-300 shadow-md rounded-lg bg-clip-border">
          <OrderTable orders={orders} onOrderDeleted={getOrders} />
          
          <div className="flex justify-between items-center px-4 py-3">
            <div className="text-sm dark:text-slate-400 text-slate-600">
              Showing <b>{(pagination.currentPage - 1) * pagination.itemsPerPage + 1}-{Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}</b> of {pagination.totalItems}
            </div>
            
            <div className="flex space-x-1">
              <button 
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className={`px-3 py-1 min-w-9 min-h-9 text-sm font-normal text-slate-500 bg-white border border-slate-200 rounded hover:bg-slate-50 hover:border-slate-400 transition duration-200 ease ${pagination.currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Prev
              </button>

              {[...Array(pagination.totalPages)].map((_, index) => (
                <button 
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  className={`px-3 py-1 min-w-9 min-h-9 text-sm font-normal ${
                    pagination.currentPage === index + 1 
                    ? 'text-white bg-slate-800 border border-slate-800' 
                    : 'text-slate-500 bg-white border border-slate-200'
                  } rounded hover:bg-slate-50 hover:border-slate-400 transition duration-200 ease`}
                >
                  {index + 1}
                </button>
              ))}

              <button 
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className={`px-3 py-1 min-w-9 min-h-9 text-sm font-normal text-slate-500 bg-white border border-slate-200 rounded hover:bg-slate-50 hover:border-slate-400 transition duration-200 ease ${pagination.currentPage === pagination.totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}