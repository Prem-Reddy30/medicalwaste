import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const DualLogin = ({ onLogin, isDarkMode }) => {
  const [activeLogin, setActiveLogin] = useState('compounder');
  const [compounderData, setCompounderData] = useState({
    email: '',
    password: ''
  });
  const [adminData, setAdminData] = useState({
    email: 'admin@medical.com',
    password: 'admin123'
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleCompounderChange = (e) => {
    const { name, value } = e.target;
    setCompounderData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAdminChange = (e) => {
    const { name, value } = e.target;
    setAdminData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCompounderSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Try real login first
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: compounderData.email, password: compounderData.password })
      });

      if (response.ok) {
        const data = await response.json();
        onLogin(data.user, data.token);
        toast.success('Login successful!');
      } else {
        // Auto-register if not found, so demo works easily
        const regResponse = await fetch('http://localhost:5000/api/users/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: compounderData.email.split('@')[0],
            email: compounderData.email,
            password: compounderData.password,
            role: 'compounder'
          })
        });

        if (regResponse.ok) {
          const data = await regResponse.json();
          onLogin(data.user, data.token);
          toast.success('Account created and logged in!');
        } else {
          const err = await regResponse.json();
          toast.error(err.error || 'Login failed');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Cannot connect to server. Is it running?');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminData.email, password: adminData.password })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user.role !== 'admin') {
          toast.error('This account does not have admin access');
          return;
        }
        onLogin(data.user, data.token);
        toast.success('Admin login successful!');
      } else {
        toast.error('Invalid admin credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Cannot connect to server. Is it running?');
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
          Choose your login type
        </p>
      </div>

      {/* Login Type Selection */}
      <div className="mb-6">
        <div className="flex rounded-lg overflow-hidden border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}">
          <button
            onClick={() => setActiveLogin('compounder')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeLogin === 'compounder'
                ? 'bg-blue-600 text-white'
                : isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🏥 Compounder
          </button>
          <button
            onClick={() => setActiveLogin('admin')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeLogin === 'admin'
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

      {/* Login Forms */}
      <motion.div
        key={activeLogin}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${
          activeLogin === 'admin' 
            ? isDarkMode ? 'border-red-700' : 'border-red-200'
            : isDarkMode ? 'border-blue-700' : 'border-blue-200'
        }`}
      >
        {activeLogin === 'compounder' ? (
          <div>
            <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              🏥 Compounder Login
            </h3>
            <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Add waste data, use AI detection, upload images, and manage daily waste entries.
            </p>
            <form onSubmit={handleCompounderSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={compounderData.email}
                  onChange={handleCompounderChange}
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
                  value={compounderData.password}
                  onChange={handleCompounderChange}
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
                  '🏥 Sign in as Compounder'
                )}
              </motion.button>
            </form>
          </div>
        ) : (
          <div>
            <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              👨‍💼 Admin Login
            </h3>
            <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Manage users, view analytics, generate reports, and oversee all waste management operations.
            </p>
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Admin Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={adminData.email}
                  onChange={handleAdminChange}
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
                  value={adminData.password}
                  onChange={handleAdminChange}
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
                  '👨‍💼 Sign in as Admin'
                )}
              </motion.button>
              <div className="text-center mt-2">
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Default: admin@medical.com / admin123
                </p>
              </div>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DualLogin;
