import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const CompounderLogin = ({ onLogin, isDarkMode }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
      // Demo compounder login - accept any email/password
      const compounderUser = {
        id: 'compounder-user-' + Date.now(),
        name: formData.email.split('@')[0],
        email: formData.email,
        role: 'compounder',
        status: 'active'
      };

      const compounderToken = 'compounder-token-' + Date.now();

      onLogin(compounderUser, compounderToken);
      toast.success('Compounder login successful!');
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
          Compounder Access
        </h1>
        <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Medical Waste Management System
        </p>
      </div>

      <div className="mb-6">
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200'} border`}>
          <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>
            🏥 Compounder Login
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
            Access your compounder dashboard to add waste data, use AI detection, and manage daily waste entries.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
            placeholder="Enter your password"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-r-2 border-t-2 border-l-2 border-white mr-2"></div>
              Signing in...
            </div>
          ) : (
            '🏥 Access Compounder Dashboard'
          )}
        </motion.button>

        <div className="text-center">
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Demo: Use any email and password to login
          </p>
        </div>
      </form>
    </div>
  );
};

export default CompounderLogin;
