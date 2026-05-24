import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

// Simple test components first
const TestComponent = ({ title, isDarkMode }) => (
  <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
    <h2 className="text-xl font-bold mb-4">{title}</h2>
    <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
      This is a test component for {title}. If you can see this, the navigation is working!
    </p>
  </div>
);

const CompounderDashboard = ({ isDarkMode }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [wasteData, setWasteData] = useState([]);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'Dashboard' },
    { id: 'camera', label: 'Camera Detection', icon: 'Camera' },
    { id: 'upload', label: 'Upload Image', icon: 'Upload' },
    { id: 'entry', label: 'Waste Entry', icon: 'Entry' },
    { id: 'logs', label: 'Waste Logs', icon: 'Logs' },
  ];

  const handleTabClick = (tabId) => {
    console.log('Tab clicked:', tabId);
    setActiveTab(tabId);
    toast.success(`Switched to ${tabId} tab`);
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                : isDarkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Current Tab Display */}
      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
        <p className={isDarkMode ? 'text-white' : 'text-blue-900'}>
          <strong>Current Active Tab:</strong> {activeTab}
        </p>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={isDarkMode ? 'text-white' : 'text-gray-900'}
      >
        {activeTab === 'dashboard' && (
          <TestComponent title="Dashboard" isDarkMode={isDarkMode} />
        )}

        {activeTab === 'camera' && (
          <TestComponent title="Camera Detection" isDarkMode={isDarkMode} />
        )}

        {activeTab === 'upload' && (
          <TestComponent title="Upload Image" isDarkMode={isDarkMode} />
        )}

        {activeTab === 'entry' && (
          <TestComponent title="Waste Entry" isDarkMode={isDarkMode} />
        )}

        {activeTab === 'logs' && (
          <TestComponent title="Waste Logs" isDarkMode={isDarkMode} />
        )}
      </motion.div>
    </div>
  );
};

export default CompounderDashboard;
