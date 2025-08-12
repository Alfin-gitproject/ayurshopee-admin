'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function Home() {
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and register
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loginData = {};
      if (formData.email) loginData.email = formData.email;
      if (formData.phone) loginData.phone = formData.phone;
      loginData.password = formData.password;

      const response = await axios.post('/api/auth/login', loginData, {
        withCredentials: true
      });

      router.push('/orders');
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate that either email or phone is provided
    if (!formData.email && !formData.phone) {
      setError('Please provide either email or phone number');
      setLoading(false);
      return;
    }

    try {
      const registerData = {
        name: formData.name,
        password: formData.password
      };
      if (formData.email) registerData.email = formData.email;
      if (formData.phone) registerData.phone = formData.phone;

      const response = await axios.post('/api/auth/register', registerData, {
        withCredentials: true
      });

      // Auto-login after successful registration
      router.push('/orders');
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Registration failed. Please try again.'
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
            {/* Toggle between Login and Register */}
            <div className="flex justify-center mb-6">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-1 flex">
                <button
                  onClick={() => {
                    setIsLogin(true);
                    setError('');
                    setFormData({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    isLogin 
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setIsLogin(false);
                    setError('');
                    setFormData({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    !isLogin 
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Register
                </button>
              </div>
            </div>

            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white text-center">
              {isLogin ? 'Sign in to your account' : 'Create your account'}
            </h1>
            
            {error && (
              <div className="text-red-500 text-sm mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                {error}
              </div>
            )}

            <form 
              className="space-y-4 md:space-y-6" 
              onSubmit={isLogin ? handleLogin : handleRegister}
            >
              {/* Name field - only for registration */}
              {!isLogin && (
                <div>
                  <label
                    htmlFor="name"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="John Doe"
                    required={!isLogin}
                  />
                </div>
              )}

              {/* Email field */}
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Email {isLogin ? '(or use phone below)' : '(optional if phone provided)'}
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="name@company.com"
                  required={isLogin && !formData.phone}
                />
              </div>

              {/* Phone field */}
              <div>
                <label
                  htmlFor="phone"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Phone Number {isLogin ? '(or use email above)' : '(optional if email provided)'}
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="+1234567890"
                  required={isLogin && !formData.email}
                />
              </div>

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

              {/* Confirm Password field - only for registration */}
              {!isLogin && (
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    required={!isLogin}
                    minLength="6"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full text-white ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 transition-colors`}
              >
                {loading 
                  ? (isLogin ? 'Signing In...' : 'Creating Account...') 
                  : (isLogin ? 'Sign In' : 'Create Account')
                }
              </button>
            </form>

            {/* Helper text */}
            <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
              {isLogin 
                ? "Don't have an account? Click Register above" 
                : "Already have an account? Click Login above"
              }
            </div>
            
            {!isLogin && (
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                * Required fields. Provide either email or phone number.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
