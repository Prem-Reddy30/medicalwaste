import React from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Camera, 
  Upload, 
  FileText, 
  BarChart3, 
  Users, 
  Settings,
  Home,
  Package
} from 'lucide-react';

const Sidebar = ({ role, isDarkMode, onTabChange, activeTab }) => {
  const compounderMenuItems = [
    { icon: Home, label: 'Dashboard', id: 'dashboard' },
    { icon: Camera, label: 'Camera Detection', id: 'camera' },
    { icon: Upload, label: 'Upload Image', id: 'upload' },
    { icon: FileText, label: 'Waste Entry', id: 'entry' },
    { icon: Package, label: 'Waste Logs', id: 'logs' },
  ];

  const adminMenuItems = [
    { icon: Home, label: 'Dashboard', id: 'dashboard' },
    { icon: Package, label: 'Waste Logs', id: 'logs' },
    { icon: Users, label: 'User Management', id: 'users' },
    { icon: BarChart3, label: 'Reports', id: 'reports' },
    { icon: Settings, label: 'Settings', id: 'settings' },
  ];

  const menuItems = role === 'compounder' ? compounderMenuItems : adminMenuItems;

  return (
    <motion.div
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
      className={`w-64 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r flex flex-col`}
    >
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <Activity className="text-white" size={24} />
          </div>
          <div>
            <h1 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              MedWaste AI
            </h1>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {role === 'compounder' ? 'Compounder Portal' : 'Admin Portal'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  activeTab === item.id
                    ? isDarkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-50 text-blue-600 border border-blue-200'
                    : isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-300 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            </motion.li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <p>Version 1.0.0</p>
          <p>© 2024 MedWaste AI</p>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
