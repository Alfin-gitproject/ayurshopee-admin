'use client'
import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2';
import Link from 'next/link';

export default function Header() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'GET',
        credentials: 'include', // Include cookies in the request
      });
      
      if (response.ok) {
        const data = await response.json();
        Swal.fire('Logged out!', data.message, 'success').then(() => {
          router.push('/'); // Redirect to home page where login form is
        });
      } else {
        const errorData = await response.json();
        Swal.fire('Error!', errorData.message || 'Logout failed', 'error');
      }
    } catch (error) {
      console.error('Logout error:', error);
      Swal.fire('Error!', 'An error occurred during logout. Please try again.', 'error');
    }
  };

  return (
    <>
      <nav className="bg-white border-gray-200 dark:bg-gray-900">
        <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl p-4">
           <Link
            href="/orders"
            className="flex items-center space-x-3 rtl:space-x-reverse"
          >
            <Image
              width={160}
              height={200}
              src="/logo2.png" // Correct path
              className="h-12"
              alt=""
            />
          </Link> 
          <div className="flex items-center space-x-6 rtl:space-x-reverse">
           <button
  onClick={handleLogout}
  className="font-medium text-white dark:text-gray-100 hover:text-gray-200 dark:hover:text-gray-300 transition-colors"
>
  Log out
</button>
          </div>
        </div>
      </nav>
    </>
  );
}
