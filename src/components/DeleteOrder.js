import React from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function DeleteOrder({ id }) {
  console.log('DeleteOrder component received ID:', id);

  const handleDelete = async () => {
    console.log('handleDelete called with ID:', id);
    
    if (!id) {
      console.error('No ID provided to DeleteOrder component');
      Swal.fire('Error!', 'Order ID is missing. Cannot delete order.', 'error');
      return;
    }

    try {
      console.log('Deleting order with ID:', id);
      const response = await axios.delete(`/api/orders/${id}`);
      if (response.status === 200) {
        Swal.fire('Deleted!', 'Order deleted successfully.', 'success').then(() => {
          window.location.href = '/orders'; 
        });
      }
    } catch (error) {
      console.error('Delete error:', error);
      if (error.response) {
        Swal.fire('Error!', error.response.data.message, 'error');
      } else {
        Swal.fire('Error!', 'An error occurred. Please try again.', 'error');
      }
    }
  };

  const confirmDelete = () => {
    console.log('confirmDelete called with ID:', id);
    
    if (!id) {
      console.error('No ID provided to DeleteOrder component in confirmDelete');
      Swal.fire('Error!', 'Order ID is missing. Cannot delete order.', 'error');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to delete this order?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        handleDelete();
      }
    });
  };

  // Don't render the button if no ID is provided
  if (!id) {
    console.warn('DeleteOrder component: No ID provided, not rendering delete button');
    return null;
  }

  return (
    <>
      <button
        type="button"
        className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
        onClick={confirmDelete}
      >
        Delete Order
      </button>
    </>
  );
}
