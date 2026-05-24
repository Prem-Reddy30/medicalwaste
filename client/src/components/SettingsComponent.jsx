import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, Shield, Database, Palette, Globe, Save, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

const SettingsComponent = ({ isDarkMode }) => {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      browser: true,
      alerts: true
    },
    security: {
      twoFactor: false,
      sessionTimeout: '30',
      passwordExpiry: '90'
    },
    system: {
      backupFrequency: 'daily',
      dataRetention: '365',
      logLevel: 'info'
    },
    appearance: {
      theme: isDarkMode ? 'dark' : 'light',
      language: 'en',
      timezone: 'UTC'
    }
  });

  const [activeSection, setActiveSection] = useState('notifications');
  const [hasChanges, setHasChanges] = useState(false);

  const handleSettingChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const saveSettings = () => {
    // Simulate saving settings
    setTimeout(() => {
      setHasChanges(false);
      toast.success('Settings saved successfully');
    }, 1000);
  };

  const resetSettings = () => {
    setSettings({
      notifications: {
        email: true,
        browser: true,
        alerts: true
      },
      security: {
        twoFactor: false,
        sessionTimeout: '30',
        passwordExpiry: '90'
      },
      system: {
        backupFrequency: 'daily',
        dataRetention: '365',
        logLevel: 'info'
      },
      appearance: {
        theme: isDarkMode ? 'dark' : 'light',
        language: 'en',
        timezone: 'UTC'
      }
    });
    setHasChanges(true);
    toast.info('Settings reset to defaults');
  };

  const sections = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'system', label: 'System', icon: Database },
    { id: 'appearance', label: 'Appearance', icon: Palette }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          System Settings
        </h2>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetSettings}
            className={`flex items-center px-4 py-2 rounded-lg ${
              isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <RotateCcw className="mr-2" size={16} />
            Reset
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={saveSettings}
            disabled={!hasChanges}
            className={`flex items-center px-4 py-2 rounded-lg ${
              hasChanges
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Save className="mr-2" size={16} />
            Save Changes
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <h3 className={`text-sm font-semibold mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Settings Categories
            </h3>
            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    activeSection === section.id
                      ? isDarkMode
                        ? 'bg-purple-600 text-white'
                        : 'bg-purple-50 text-purple-600 border border-purple-200'
                      : isDarkMode
                      ? 'hover:bg-gray-700 text-gray-300'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <section.icon size={18} />
                  <span className="font-medium">{section.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
          >
            {/* Notifications Settings */}
            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Notification Preferences
                </h3>
                
                <div className="space-y-4">
                  {[
                    { key: 'email', label: 'Email Notifications', desc: 'Receive email alerts for important events' },
                    { key: 'browser', label: 'Browser Notifications', desc: 'Show desktop notifications in browser' },
                    { key: 'alerts', label: 'System Alerts', desc: 'Critical system and security alerts' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <div>
                        <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {item.label}
                        </h4>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {item.desc}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications[item.key]}
                          onChange={(e) => handleSettingChange('notifications', item.key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600`}></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeSection === 'security' && (
              <div className="space-y-6">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Security Configuration
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Two-Factor Authentication
                      </h4>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Add an extra layer of security
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.security.twoFactor}
                        onChange={(e) => handleSettingChange('security', 'twoFactor', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600`}></div>
                    </label>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Session Timeout (minutes)
                    </label>
                    <select
                      value={settings.security.sessionTimeout}
                      onChange={(e) => handleSettingChange('security', 'sessionTimeout', e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="120">2 hours</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Password Expiry (days)
                    </label>
                    <select
                      value={settings.security.passwordExpiry}
                      onChange={(e) => handleSettingChange('security', 'passwordExpiry', e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    >
                      <option value="30">30 days</option>
                      <option value="60">60 days</option>
                      <option value="90">90 days</option>
                      <option value="180">180 days</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* System Settings */}
            {activeSection === 'system' && (
              <div className="space-y-6">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  System Configuration
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Backup Frequency
                    </label>
                    <select
                      value={settings.system.backupFrequency}
                      onChange={(e) => handleSettingChange('system', 'backupFrequency', e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    >
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Data Retention (days)
                    </label>
                    <select
                      value={settings.system.dataRetention}
                      onChange={(e) => handleSettingChange('system', 'dataRetention', e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    >
                      <option value="30">30 days</option>
                      <option value="90">90 days</option>
                      <option value="365">1 year</option>
                      <option value="1095">3 years</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Log Level
                    </label>
                    <select
                      value={settings.system.logLevel}
                      onChange={(e) => handleSettingChange('system', 'logLevel', e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    >
                      <option value="error">Error</option>
                      <option value="warn">Warning</option>
                      <option value="info">Info</option>
                      <option value="debug">Debug</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeSection === 'appearance' && (
              <div className="space-y-6">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Appearance Preferences
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Theme
                    </label>
                    <select
                      value={settings.appearance.theme}
                      onChange={(e) => handleSettingChange('appearance', 'theme', e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto (System)</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Language
                    </label>
                    <select
                      value={settings.appearance.language}
                      onChange={(e) => handleSettingChange('appearance', 'language', e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Timezone
                    </label>
                    <select
                      value={settings.appearance.timezone}
                      onChange={(e) => handleSettingChange('appearance', 'timezone', e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    >
                      <option value="UTC">UTC</option>
                      <option value="EST">Eastern Time</option>
                      <option value="PST">Pacific Time</option>
                      <option value="CST">Central Time</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SettingsComponent;
