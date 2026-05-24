import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const RoleBasedLogin = ({ onLogin, isDarkMode }) => {
  const [activeRole, setActiveRole] = useState('compounder');
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
      // Demo login - accept any email/password with role selection
      const mockUser = {
        id: 'demo-user-' + Date.now(),
        name: formData.email.split('@')[0],
        email: formData.email,
        role: activeRole,
        status: 'active'
      };

      const mockToken = 'demo-token-' + Date.now();

      onLogin(mockUser, mockToken);
      toast.success(`${activeRole === 'admin' ? 'Admin' : 'Compounder'} login successful!`);
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
          Medical Waste Management
        </h1>
        <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Select your role and login to access the system
        </p>
      </div>

      {/* Role Selection */}
      <div className="mb-6">
        <div className="flex rounded-lg overflow-hidden border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}">
          <button
            onClick={() => setActiveRole('compounder')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeRole === 'compounder'
                ? 'bg-blue-600 text-white'
                : isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🏥 Compounder
          </button>
          <button
            onClick={() => setActiveRole('admin')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeRole === 'admin'
                ? 'bg-red-600 text-white'
                : isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            👨‍💼 Admin
          </button>
        </div>
      </div>

      {/* Role Description */}
      <motion.div
        key={activeRole}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}
      >
        <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {activeRole === 'admin' ? 'Administrator Access' : 'Compounder Access'}
        </h3>
        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {activeRole === 'admin' 
            ? 'Manage users, view analytics, generate reports, and oversee all waste management operations.'
            : 'Add waste data, use AI detection, upload images, and manage daily waste entries.'
          }
        </p>
      </motion.div>

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
            placeholder={`Enter your ${activeRole} email`}
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
          className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            activeRole === 'admin'
              ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-r-2 border-t-2 border-l-2 border-white mr-2"></div>
              Signing in as {activeRole}...
            </div>
          ) : (
            `Sign in as ${activeRole === 'admin' ? 'Administrator' : 'Compounder'}`
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

export default RoleBasedLogin;
