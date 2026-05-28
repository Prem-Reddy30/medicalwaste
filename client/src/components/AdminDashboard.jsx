import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AdminAnalytics from './AdminAnalytics';
import UserManagement from './UserManagement';
import Reports from './Reports';
import SettingsComponent from './SettingsComponent';
import WasteLogs from './WasteLogs';

// Simple test components first
const TestComponent = ({ title, isDarkMode }) => (
  <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
    <h2 className="text-xl font-bold mb-4">{title}</h2>
    <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
      This is a test component for {title}. If you can see this, the navigation is working!
    </p>
  </div>
);

const AdminDashboard = ({ isDarkMode, activeTab, setActiveTab, wasteData, setWasteData }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'logs', label: 'Waste Logs', icon: '📝' },
    { id: 'users', label: 'User Management', icon: '👥' },
    { id: 'reports', label: 'Reports', icon: '📊' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={isDarkMode ? 'text-white' : 'text-gray-900'}
      >
        {activeTab === 'dashboard' && (
          <AdminAnalytics isDarkMode={isDarkMode} wasteData={wasteData} />
        )}

        {activeTab === 'analytics' && (
          <AdminAnalytics isDarkMode={isDarkMode} wasteData={wasteData} />
        )}

        {activeTab === 'logs' && (
          <WasteLogs 
            isDarkMode={isDarkMode} 
            wasteData={wasteData}
            setWasteData={setWasteData}
          />
        )}

        {activeTab === 'compounders' && (
          <UserManagement isDarkMode={isDarkMode} />
        )}

        {activeTab === 'users' && (
          <UserManagement isDarkMode={isDarkMode} />
        )}

        {activeTab === 'reports' && (
          <Reports isDarkMode={isDarkMode} wasteData={wasteData} />
        )}

        {activeTab === 'settings' && (
          <SettingsComponent isDarkMode={isDarkMode} />
        )}
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
