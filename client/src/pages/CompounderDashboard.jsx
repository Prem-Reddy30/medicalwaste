import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import CameraDetection from '../components/CameraDetection';
import ImageUpload from '../components/ImageUpload';
import WasteEntry from '../components/WasteEntry';
import WasteLogs from '../components/WasteLogs';
import StatsCards from '../components/StatsCards';

const CompounderDashboard = ({ isDarkMode }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [wasteData, setWasteData] = useState([]);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'camera', label: 'Camera Detection', icon: '📷' },
    { id: 'upload', label: 'Upload Image', icon: '📤' },
    { id: 'entry', label: 'Waste Entry', icon: '📝' },
    { id: 'logs', label: 'Waste Logs', icon: '📋' },
  ];

  const handleWasteAdded = (newWaste) => {
    setWasteData(prev => [newWaste, ...prev]);
    toast.success('Waste entry added successfully!');
  };

  const handleDetectionComplete = (detection) => {
    const wasteEntry = {
      id: Date.now(),
      wasteType: detection.label,
      quantity: 1,
      detectionType: detection.source,
      timestamp: new Date().toISOString(),
      confidence: detection.confidence,
      imageUrl: detection.imageUrl
    };
    handleWasteAdded(wasteEntry);
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-primary-600 text-white shadow-lg transform scale-105'
                : isDarkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
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
          <div className="space-y-6">
            <StatsCards isDarkMode={isDarkMode} wasteData={wasteData} />
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {wasteData.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{item.wasteType}</p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {item.detectionType} • {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Qty: {item.quantity}</p>
                        {item.confidence && (
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {Math.round(item.confidence * 100)}% confidence
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {wasteData.length === 0 && (
                  <p className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No waste entries yet. Start by detecting or entering waste data.
                  </p>
                )}
              </div>
            </div>
          </div>
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
