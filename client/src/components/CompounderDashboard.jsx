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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          compounder: JSON.parse(atob(localStorage.getItem('userData') || btoa('{}'))).name || 'Unknown'
        })
      });

      if (response.ok) {
        const result = await response.json();
        setWasteData(prev => [result.data, ...prev]);
        toast.success('Waste detected and logged successfully!');
      } else {
        throw new Error('Failed to save waste data');
      }
    } catch (error) {
      console.error('Error saving waste data:', error);
      setWasteData(prev => [{ ...data, timestamp: new Date() }, ...prev]);
      toast.success('Waste detected and logged locally!');
    }
  };

  const handleWasteAdded = (data) => {
    setWasteData(prev => [data, ...prev]);
  };

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
