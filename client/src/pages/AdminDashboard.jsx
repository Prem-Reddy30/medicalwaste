import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import OverviewCards from '../components/OverviewCards';
import AnalyticsCharts from '../components/AnalyticsCharts';
import ActivityTable from '../components/ActivityTable';

const AdminDashboard = ({ isDarkMode }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Mock data for demonstration
  const [wasteData] = useState([
    { id: 1, wasteType: 'Syringe', quantity: 15, detectionType: 'camera', timestamp: '2024-01-15T10:30:00', compounder: 'John Doe' },
    { id: 2, wasteType: 'Mask', quantity: 25, detectionType: 'upload', timestamp: '2024-01-15T11:45:00', compounder: 'Jane Smith' },
    { id: 3, wasteType: 'Gloves', quantity: 30, detectionType: 'manual', timestamp: '2024-01-15T14:20:00', compounder: 'Mike Johnson' },
    { id: 4, wasteType: 'Medicine bottle', quantity: 8, detectionType: 'camera', timestamp: '2024-01-15T15:10:00', compounder: 'Sarah Wilson' },
    { id: 5, wasteType: 'Syringe', quantity: 20, detectionType: 'upload', timestamp: '2024-01-15T16:30:00', compounder: 'John Doe' },
  ]);

  const [compounders] = useState([
    { id: 1, name: 'John Doe', email: 'john@hospital.com', status: 'active', lastActive: '2024-01-15T16:45:00', totalEntries: 45 },
    { id: 2, name: 'Jane Smith', email: 'jane@hospital.com', status: 'active', lastActive: '2024-01-15T15:30:00', totalEntries: 38 },
    { id: 3, name: 'Mike Johnson', email: 'mike@hospital.com', status: 'inactive', lastActive: '2024-01-14T09:20:00', totalEntries: 22 },
    { id: 4, name: 'Sarah Wilson', email: 'sarah@hospital.com', status: 'active', lastActive: '2024-01-15T14:15:00', totalEntries: 51 },
  ]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'compounders', label: 'Compounders', icon: '👥' },
    { id: 'logs', label: 'Waste Logs', icon: '📋' },
  ];

  const analyticsData = useMemo(() => {
    // Calculate daily waste data for the past week
    const dailyData = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayWaste = wasteData.filter(item => 
        item.timestamp.startsWith(dateStr)
      ).reduce((sum, item) => sum + item.quantity, 0);
      
      dailyData.push({
        date: date.toLocaleDateString('en', { weekday: 'short' }),
        amount: dayWaste || Math.floor(Math.random() * 50) + 10 // Mock data for demo
      });
    }

    // Calculate waste type distribution
    const wasteByType = {};
    wasteData.forEach(item => {
      wasteByType[item.wasteType] = (wasteByType[item.wasteType] || 0) + item.quantity;
    });

    const distributionData = Object.entries(wasteByType).map(([type, amount]) => ({
      name: type,
      value: amount,
      color: type === 'Syringe' ? '#3b82f6' : 
             type === 'Mask' ? '#10b981' :
             type === 'Gloves' ? '#f59e0b' : '#ef4444'
    }));

    // Calculate monthly trends
    const monthlyData = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    months.forEach((month, index) => {
      monthlyData.push({
        month,
        waste: Math.floor(Math.random() * 200) + 100,
        detections: Math.floor(Math.random() * 50) + 20
      });
    });

    return {
      dailyData,
      distributionData,
      monthlyData
    };
  }, [wasteData]);

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
        {activeTab === 'overview' && (
          <OverviewCards
            isDarkMode={isDarkMode}
            wasteData={wasteData}
            compounders={compounders}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsCharts
            isDarkMode={isDarkMode}
            data={analyticsData}
          />
        )}

        {activeTab === 'compounders' && (
          <ActivityTable
            isDarkMode={isDarkMode}
            title="Compounder Activity"
            data={compounders}
            type="compounders"
          />
        )}

        {activeTab === 'logs' && (
          <ActivityTable
            isDarkMode={isDarkMode}
            title="Hospital Waste Logs"
            data={wasteData}
            type="waste"
          />
        )}
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
