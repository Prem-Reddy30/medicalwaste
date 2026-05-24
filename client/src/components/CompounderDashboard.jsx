import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import CameraDetection from './CameraDetection';
import ImageUpload from './ImageUpload';
import WasteEntry from './WasteEntry';
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

const CompounderDashboard = ({ isDarkMode, activeTab, setActiveTab, wasteData, setWasteData }) => {
  const handleDetectionComplete = async (data) => {
    try {
      const response = await fetch('http://localhost:5000/api/waste', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...data,
          compounder: JSON.parse(localStorage.getItem('userData'))?.name || 'Unknown'
        })
      });

      if (response.ok) {
        const result = await response.json();
        setWasteData(prev => [...prev, result.data]);
        toast.success('Waste detected and logged successfully!');
      } else {
        throw new Error('Failed to save waste data');
      }
    } catch (error) {
      console.error('Error saving waste data:', error);
      // Fallback to local state
      setWasteData(prev => [...prev, { ...data, timestamp: new Date() }]);
      toast.success('Waste detected and logged locally!');
    }
  };

  const handleWasteAdded = async (data) => {
    try {
      const response = await fetch('http://localhost:5000/api/waste', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...data,
          compounder: JSON.parse(localStorage.getItem('userData'))?.name || 'Unknown'
        })
      });

      if (response.ok) {
        const result = await response.json();
        setWasteData(prev => [...prev, result.data]);
        toast.success('Waste entry added successfully!');
      } else {
        throw new Error('Failed to save waste data');
      }
    } catch (error) {
      console.error('Error saving waste data:', error);
      // Fallback to local state
      setWasteData(prev => [...prev, data]);
      toast.success('Waste entry added locally!');
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'camera', label: 'Camera Detection', icon: '📷' },
    { id: 'upload', label: 'Upload Image', icon: '📤' },
    { id: 'entry', label: 'Waste Entry', icon: '📝' },
    { id: 'logs', label: 'Waste Logs', icon: '📋' },
  ];

  const handleTabClick = (tabId) => {
    console.log('Tab clicked:', tabId);
    console.log('Previous activeTab:', activeTab);
    setActiveTab(tabId);
    console.log('Setting activeTab to:', tabId);
    toast.success(`Switched to ${tabId} tab`);
  };

  return (
    <div className="space-y-6">
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
          <CameraDetection 
            isDarkMode={isDarkMode} 
            onDetectionComplete={handleDetectionComplete}
          />
        )}

        {activeTab === 'upload' && (
          <ImageUpload 
            isDarkMode={isDarkMode} 
            onDetectionComplete={handleDetectionComplete}
          />
        )}

        {activeTab === 'entry' && (
          <WasteEntry 
            isDarkMode={isDarkMode} 
            onWasteAdded={handleWasteAdded}
          />
        )}

        {activeTab === 'logs' && (
          <WasteLogs 
            isDarkMode={isDarkMode} 
            wasteData={wasteData}
            setWasteData={setWasteData}
          />
        )}
      </motion.div>
    </div>
  );
};

export default CompounderDashboard;
