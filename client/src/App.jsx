import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CompounderDashboard from './components/CompounderDashboard';
import AdminDashboard from './components/AdminDashboard';
import Sidebar from './components/Sidebar';
import RoleToggle from './components/RoleToggle';
import Chatbot from './components/Chatbot';
import { useDarkMode } from './hooks/useDarkMode';
import DualLogin from './components/DualLogin';

function App() {
  const [role, setRole] = useState('compounder');
  const [isDarkMode, toggleDarkMode] = useDarkMode();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(null);
  const [wasteData, setWasteData] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    
    console.log('Checking authentication on mount:', { token: !!token, userData: !!userData });
    
    if (token && userData) {
      try {
        const decoded = JSON.parse(atob(userData));
        console.log('User data decoded:', decoded);
        setCurrentUser(decoded);
        setIsAuthenticated(true);
        setRole(decoded.role);
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
      }
    }
  }, []);

  // Fetch waste data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchWasteData();
    }
  }, [isAuthenticated, currentUser]);

  const fetchWasteData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/waste', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWasteData(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching waste data:', error);
    }
  };

  const handleLogin = async (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userData', btoa(JSON.stringify(userData)));
    setCurrentUser(userData);
    setIsAuthenticated(true);
    setRole(userData.role);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setRole('compounder');
    setWasteData([]);
  };

  const handleRoleChange = (newRole) => {
    if (currentUser && currentUser.role === 'admin') {
      setRole(newRole);
    }
  };

  // Show loading screen while checking auth
  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`w-full max-w-md p-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg`}
        >
          <h1 className={`text-2xl font-bold text-center mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Medical Waste Management
          </h1>
          <p className={`text-center mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Please login to access system
          </p>
          <DualLogin onLogin={handleLogin} isDarkMode={isDarkMode} />
        </motion.div>
      </div>
    );
  }

  // Show dashboard if authenticated
  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar role={role} isDarkMode={isDarkMode} onTabChange={setActiveTab} activeTab={activeTab} />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header with Role Toggle and Logout */}
          <header className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4`}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Medical Waste Management System
                </h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  AI-Powered Waste Detection & Management
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* User Info */}
                {currentUser && (
                  <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {currentUser.name} ({currentUser.role})
                    </span>
                  </div>
                )}
                
                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} transition-colors`}
                >
                  {isDarkMode ? '🌙' : '☀️'}
                </button>
                
                {/* Role Toggle (Admin Only) - REMOVED */}
                {/* {currentUser && currentUser.role === 'admin' && (
                  <RoleToggle role={role} setRole={handleRoleChange} />
                )} */}
                
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isDarkMode 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                >
                  Logout
                </button>
              </div>
            </div>
          </header>
          
          {/* Dashboard Content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
            <motion.div
              key={role}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {role === 'compounder' ? (
                <CompounderDashboard 
                  isDarkMode={isDarkMode} 
                  activeTab={activeTab} 
                  setActiveTab={setActiveTab}
                  wasteData={wasteData}
                  setWasteData={setWasteData}
                />
              ) : (
                <AdminDashboard 
                  isDarkMode={isDarkMode} 
                  activeTab={activeTab} 
                  setActiveTab={setActiveTab}
                  wasteData={wasteData}
                  setWasteData={setWasteData}
                />
              )}
            </motion.div>
          </main>
        </div>
      </div>
      
      {/* Chatbot */}
      <Chatbot isDarkMode={isDarkMode} />
    </div>
  );
}

export default App;
