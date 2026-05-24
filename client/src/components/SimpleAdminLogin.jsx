import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const SimpleAdminLogin = ({ onLogin, isDarkMode }) => {
  const [formData, setFormData] = useState({
    email: 'admin@medical.com',
    password: 'admin123'
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Fixed admin credentials
      if (formData.email === 'admin@medical.com' && formData.password === 'admin123') {
        const adminUser = {
          id: 'admin-user',
          name: 'System Administrator',
          email: 'admin@medical.com',
          role: 'admin',
          status: 'active'
        };

        const adminToken = 'admin-token-' + Date.now();

        onLogin(adminUser, adminToken);
        toast.success('Admin login successful!');
      } else {
        toast.error('Invalid admin credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Admin Access
        </h1>
        <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Medical Waste Management System
        </p>
      </div>

      <div className="mb-6">
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-red-900 border-red-700' : 'bg-red-50 border-red-200'} border`}>
          <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-red-300' : 'text-red-900'}`}>
            🔒 Administrator Login
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>
            Access restricted to system administrators only. Use your admin credentials to manage the entire system.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Admin Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
            placeholder="Enter admin email"
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Admin Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
            placeholder="Enter admin password"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-r-2 border-t-2 border-l-2 border-white mr-2"></div>
              Authenticating...
            </div>
          ) : (
            '🔐 Access Admin Dashboard'
          )}
        </motion.button>

        <div className="text-center">
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Default: admin@medical.com / admin123
          </p>
        </div>
      </form>
    </div>
  );
};

export default SimpleAdminLogin;
