import React from 'react';
import { motion } from 'framer-motion';
import { Package, Users, Activity, TrendingUp } from 'lucide-react';

const OverviewCards = ({ isDarkMode, wasteData, compounders }) => {
  const getTotalWaste = () => wasteData.reduce((sum, item) => sum + item.quantity, 0);
  const getActiveCompounders = () => compounders.filter(c => c.status === 'active').length;
  const getTodayWaste = () => {
    const today = new Date().toDateString();
    return wasteData
      .filter(item => new Date(item.timestamp).toDateString() === today)
      .reduce((sum, item) => sum + item.quantity, 0);
  };
  const getWeeklyGrowth = () => '+15%'; // Mock data

  const cards = [
    {
      title: 'Total Waste Collected',
      value: getTotalWaste(),
      icon: Package,
      color: 'blue',
      subtitle: 'Items this month',
      trend: '+12%'
    },
    {
      title: 'Active Compounders',
      value: getActiveCompounders(),
      icon: Users,
      color: 'green',
      subtitle: 'Currently active',
      trend: '+2 new'
    },
    {
      title: "Today's Collection",
      value: getTodayWaste(),
      icon: Activity,
      color: 'purple',
      subtitle: 'Items today',
      trend: '+8%'
    },
    {
      title: 'Weekly Growth',
      value: getWeeklyGrowth(),
      icon: TrendingUp,
      color: 'orange',
      subtitle: 'vs last week',
      trend: '+15%'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50',
        text: 'text-blue-600',
        icon: 'bg-blue-500',
        border: 'border-blue-200'
      },
      green: {
        bg: isDarkMode ? 'bg-green-900/20' : 'bg-green-50',
        text: 'text-green-600',
        icon: 'bg-green-500',
        border: 'border-green-200'
      },
      purple: {
        bg: isDarkMode ? 'bg-purple-900/20' : 'bg-purple-50',
        text: 'text-purple-600',
        icon: 'bg-purple-500',
        border: 'border-purple-200'
      },
      orange: {
        bg: isDarkMode ? 'bg-orange-900/20' : 'bg-orange-50',
        text: 'text-orange-600',
        icon: 'bg-orange-500',
        border: 'border-orange-200'
      }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const colorClasses = getColorClasses(card.color);
          const Icon = card.icon;
          
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 rounded-xl shadow-lg ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              } ${colorClasses.bg} border ${colorClasses.border}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${colorClasses.icon} rounded-lg flex items-center justify-center`}>
                  <Icon className="text-white" size={24} />
                </div>
                <div className={`text-sm font-medium text-green-600`}>
                  {card.trend}
                </div>
              </div>
              
              <div>
                <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {card.value}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                  {card.title}
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                  {card.subtitle}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Activity Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Waste Entries */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
        >
          <h3 className="text-lg font-semibold mb-4">Recent Waste Entries</h3>
          <div className="space-y-3">
            {wasteData.slice(0, 5).map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium capitalize">{item.wasteType}</p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.compounder} • {item.detectionType}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Qty: {item.quantity}</p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {new Date(item.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Top Compounders */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
        >
          <h3 className="text-lg font-semibold mb-4">Top Compounders</h3>
          <div className="space-y-3">
            {compounders
              .sort((a, b) => b.totalEntries - a.totalEntries)
              .slice(0, 5)
              .map((compounder, index) => (
                <motion.div
                  key={compounder.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{compounder.name}</p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {compounder.totalEntries} entries
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        compounder.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {compounder.status}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OverviewCards;
