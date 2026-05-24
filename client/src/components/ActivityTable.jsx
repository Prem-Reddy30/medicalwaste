import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download, Eye, Mail, Calendar } from 'lucide-react';

const ActivityTable = ({ isDarkMode, title, data, type }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredData = data.filter(item => {
    const matchesSearch = type === 'compounders' 
      ? item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase())
      : item.wasteType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.compounder?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    
    return matchesSearch && (type !== 'compounders' || matchesStatus);
  });

  const exportData = () => {
    const csvContent = type === 'compounders' ? [
      ['Name', 'Email', 'Status', 'Last Active', 'Total Entries'].join(','),
      ...filteredData.map(item => [
        item.name,
        item.email,
        item.status,
        new Date(item.lastActive).toLocaleString(),
        item.totalEntries
      ].join(','))
    ].join('\n') : [
      ['Waste Type', 'Quantity', 'Detection Type', 'Compounder', 'Timestamp'].join(','),
      ...filteredData.map(item => [
        item.wasteType,
        item.quantity,
        item.detectionType,
        item.compounder || 'N/A',
        new Date(item.timestamp).toLocaleString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-activity-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDetectionColor = (type) => {
    switch (type) {
      case 'camera':
        return 'bg-blue-100 text-blue-800';
      case 'upload':
        return 'bg-green-100 text-green-800';
      case 'manual':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <h2 className="text-2xl font-bold">{title}</h2>
          
          <div className="flex-1 flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={`Search ${type}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
              />
            </div>

            {/* Filter for compounders */}
            {type === 'compounders' && (
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            )}

            {/* Export Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportData}
              className="btn-primary flex items-center"
            >
              <Download className="mr-2" size={20} />
              Export
            </motion.button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                {type === 'compounders' ? (
                  <>
                    <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Name
                    </th>
                    <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Email
                    </th>
                    <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Status
                    </th>
                    <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Last Active
                    </th>
                    <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Total Entries
                    </th>
                  </>
                ) : (
                  <>
                    <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Waste Type
                    </th>
                    <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Quantity
                    </th>
                    <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Detection Type
                    </th>
                    <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Compounder
                    </th>
                    <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Timestamp
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} hover:${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                  } transition-colors`}
                >
                  {type === 'compounders' ? (
                    <>
                      <td className={`py-3 px-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-primary-600 font-medium text-sm">
                              {item.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <span className="font-medium">{item.name}</span>
                        </div>
                      </td>
                      <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <div className="flex items-center">
                          <Mail size={16} className="mr-2 opacity-50" />
                          {item.email}
                        </div>
                      </td>
                      <td className={`py-3 px-4`}>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <div className="flex items-center">
                          <Calendar size={16} className="mr-2 opacity-50" />
                          {new Date(item.lastActive).toLocaleDateString()}
                        </div>
                      </td>
                      <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <span className="font-medium">{item.totalEntries}</span>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className={`py-3 px-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        <span className="font-medium capitalize">{item.wasteType}</span>
                      </td>
                      <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {item.quantity}
                      </td>
                      <td className={`py-3 px-4`}>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getDetectionColor(item.detectionType)}`}>
                          {item.detectionType}
                        </span>
                      </td>
                      <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {item.compounder || 'N/A'}
                      </td>
                      <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {new Date(item.timestamp).toLocaleString()}
                      </td>
                    </>
                  )}
                </motion.tr>
              ))}
            </tbody>
          </table>

          {filteredData.length === 0 && (
            <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <Filter size={48} className="mx-auto mb-3 opacity-50" />
              <p>No {type} found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityTable;
