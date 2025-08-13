'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function Home() {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    loginType: 'email' // 'email' or 'phone'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleLoginTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      loginType: type,
      // Clear the opposite field when switching
      email: type === 'phone' ? '' : prev.email,
      phone: type === 'email' ? '' : prev.phone
    }));
    setError('');
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (formData.loginType === 'email' && !formData.email) {
        throw new Error('Email is required');
      }
      if (formData.loginType === 'phone' && !formData.phone) {
        throw new Error('Phone number is required');
      }
      if (!formData.password) {
        throw new Error('Password is required');
      }

      // Prepare admin login data
      const loginData = {
        password: formData.password
      };

      if (formData.loginType === 'email') {
        loginData.email = formData.email;
      } else {
        loginData.phone = formData.phone;
      }

      const response = await axios.post('/api/auth/adminLogin', loginData, {
        withCredentials: true
      });

      if (response.data.success) {
        router.push('/orders');
      } else {
        setError(response.data.message || 'Admin login failed');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 
        err.message ||
        'Admin login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true); // Start loading
      try {
        const response = await axios.get('/api/auth/getAdmin', {
          withCredentials: true 
        });
        setUser(response.data.data);
        console.log(user);
        
        if (response.data.data) {
          router.push('/orders'); // Navigate to orders if user is authenticated
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Something went wrong');
      } finally {
        setLoading(false); // End loading
      }
    };
    fetchUser();
  }, []); 

  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            {/* Admin Header */}
            <div className="text-center mb-6">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                Admin Login
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Access restricted to administrators only
              </p>
            </div>
            
            {error && (
              <div className="text-red-500 text-sm mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                {error}
              </div>
            )}

            <form 
              className="space-y-4 md:space-y-6" 
              onSubmit={handleAdminLogin}
            >
              {/* Login Type Toggle */}
              <div>
                <div className="flex justify-center mb-4">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-1 flex">
                    <button
                      type="button"
                      onClick={() => handleLoginTypeChange('email')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        formData.loginType === 'email'
                          ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' 
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      Email
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLoginTypeChange('phone')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        formData.loginType === 'phone'
                          ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' 
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      Phone
                    </button>
                  </div>
                </div>
              </div>

              {/* Email field - only show if email login type */}
              {formData.loginType === 'email' && (
                <div>
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Admin Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="admin@company.com"
                    required
                  />
                </div>
              )}

              {/* Phone field - only show if phone login type */}
              {formData.loginType === 'phone' && (
                <div>
                  <label
                    htmlFor="phone"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Admin Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="+1234567890"
                    required
                  />
                </div>
              )}

              {/* Password field */}
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required
                  minLength="6"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full text-white ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 transition-colors`}
              >
                {loading ? 'Signing In...' : 'Sign In as Admin'}
              </button>
            </form>

            {/* Helper text */}
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Only users with admin role can access this system
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
