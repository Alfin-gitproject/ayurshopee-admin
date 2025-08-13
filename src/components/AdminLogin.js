'use client'
import { useState } from 'react';

const AdminLogin = ({ closeModal }) => {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    loginType: 'email' // 'email' or 'phone'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user starts typing
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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

      // Prepare login data
      const loginData = {
        password: formData.password,
        isAdmin: true // Flag to indicate this is admin login
      };

      if (formData.loginType === 'email') {
        loginData.email = formData.email;
      } else {
        loginData.phone = formData.phone;
      }

      const response = await fetch('/api/auth/adminLogin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.success) {
        // Success! Redirect to admin dashboard
        window.location.href = '/admin/dashboard';
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-12">
          <div className="text-center mb-4">
            <h2 className="h4 mb-2">Admin Login</h2>
            <p className="text-muted small">Access restricted to administrators only</p>
          </div>

          {error && (
            <div className="alert alert-danger py-2 mb-3">
              <small>{error}</small>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Login Type Toggle */}
            <div className="mb-3">
              <div className="btn-group w-100" role="group">
                <button
                  type="button"
                  className={`btn ${formData.loginType === 'email' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => handleLoginTypeChange('email')}
                >
                  Email
                </button>
                <button
                  type="button"
                  className={`btn ${formData.loginType === 'phone' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => handleLoginTypeChange('phone')}
                >
                  Phone
                </button>
              </div>
            </div>

            {/* Email Input */}
            {formData.loginType === 'email' && (
              <div className="mb-3">
                <label htmlFor="adminEmail" className="form-label">
                  Admin Email *
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="adminEmail"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="admin@company.com"
                  required
                />
              </div>
            )}

            {/* Phone Input */}
            {formData.loginType === 'phone' && (
              <div className="mb-3">
                <label htmlFor="adminPhone" className="form-label">
                  Admin Phone Number *
                </label>
                <input
                  type="tel"
                  className="form-control"
                  id="adminPhone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1234567890"
                  required
                />
              </div>
            )}

            {/* Password Input */}
            <div className="mb-3">
              <label htmlFor="adminPassword" className="form-label">
                Password *
              </label>
              <input
                type="password"
                className="form-control"
                id="adminPassword"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Signing In...
                </>
              ) : (
                'Sign In as Admin'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
