import React from 'react';
import { motion } from 'framer-motion';

const StatsCards = ({ isDarkMode, wasteData }) => {
  const getTotalWaste = () => wasteData.reduce((sum, item) => sum + item.quantity, 0);
  const getTodayWaste = () => {
    const today = new Date().toDateString();
    return wasteData
      .filter(item => new Date(item.timestamp).toDateString() === today)
      .reduce((sum, item) => sum + item.quantity, 0);
  };
  const getCameraDetections = () => wasteData.filter(item => item.detectionType === 'camera').length;
  const getUploadDetections = () => wasteData.filter(item => item.detectionType === 'upload').length;

  const stats = [
    {
      title: 'Total Waste Items',
      value: getTotalWaste(),
      icon: '📦',
      color: 'blue',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: "Today's Collection",
      value: getTodayWaste(),
      icon: '📅',
      color: 'green',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Camera Detections',
      value: getCameraDetections(),
      icon: '📷',
      color: 'purple',
      change: '+15%',
      changeType: 'positive'
    },
    {
      title: 'Upload Detections',
      value: getUploadDetections(),
      icon: '📤',
      color: 'orange',
      change: '+5%',
      changeType: 'positive'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50',
        text: 'text-blue-600',
        icon: 'bg-blue-100'
      },
      green: {
        bg: isDarkMode ? 'bg-green-900/20' : 'bg-green-50',
        text: 'text-green-600',
        icon: 'bg-green-100'
      },
      purple: {
        bg: isDarkMode ? 'bg-purple-900/20' : 'bg-purple-50',
        text: 'text-purple-600',
        icon: 'bg-purple-100'
      },
      orange: {
        bg: isDarkMode ? 'bg-orange-900/20' : 'bg-orange-50',
        text: 'text-orange-600',
        icon: 'bg-orange-100'
      }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const colorClasses = getColorClasses(stat.color);
        
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-6 rounded-xl shadow-lg ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } ${colorClasses.bg} border border-gray-100`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${colorClasses.icon} rounded-lg flex items-center justify-center text-2xl`}>
                {stat.icon}
              </div>
              <div className={`text-sm font-medium ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change}
              </div>
            </div>
            
            <div>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stat.value}
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                {stat.title}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-1">
                <motion.div
                  className={`h-1 rounded-full ${colorClasses.text.replace('text', 'bg')}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(stat.value * 10, 100)}%` }}
                  transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default StatsCards;
