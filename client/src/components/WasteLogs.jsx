import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const WasteLogs = ({ isDarkMode, wasteData, setWasteData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSource, setFilterSource] = useState('all');

  // Fetch from localStorage if backend fails
  useEffect(() => {
    if (wasteData.length === 0) {
      const localEntries = JSON.parse(localStorage.getItem('wasteEntries') || '[]');
      if (localEntries.length > 0) {
        setWasteData(localEntries);
      }
    }
  }, [wasteData, setWasteData]);

  const filteredWaste = useMemo(() => {
    return wasteData.filter(item => {
      const matchesSearch = item.wasteType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (item.compounder && item.compounder.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = filterType === 'all' || item.wasteType === filterType;
      const matchesSource = filterSource === 'all' || item.detectionType === filterSource;
      
      return matchesSearch && matchesType && matchesSource;
    });
  }, [wasteData, searchTerm, filterType, filterSource]);

  const wasteTypes = useMemo(() => {
    const types = [...new Set(wasteData.map(item => item.wasteType))];
    return types.filter(Boolean);
  }, [wasteData]);

  const deleteEntry = (id) => {
    setWasteData(prev => prev.filter(item => (item._id !== id && item.id !== id)));
    
    // Also remove from localStorage if it exists there
    const localEntries = JSON.parse(localStorage.getItem('wasteEntries') || '[]');
    const updatedLocal = localEntries.filter(item => (item._id !== id && item.id !== id));
    localStorage.setItem('wasteEntries', JSON.stringify(updatedLocal));
    
    toast.success('Entry deleted successfully');
  };

  const exportData = () => {
    const csvContent = [
      ['Waste Type', 'Quantity', 'Detection Source', 'Timestamp', 'Notes'].join(','),
      ...filteredWaste.map(item => [
        item.wasteType,
        item.quantity,
        item.detectionType,
        new Date(item.timestamp).toLocaleString(),
        item.notes || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waste-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Data exported successfully');
  };

  const getTotalQuantity = () => {
    return filteredWaste.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Entries</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {filteredWaste.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              📊
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Quantity</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {getTotalQuantity()}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              📦
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Waste Types</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {wasteTypes.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              🏷️
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search waste logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
            >
              <option value="all">All Types</option>
              {wasteTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
            >
              <option value="all">All Sources</option>
              <option value="camera">Camera</option>
              <option value="upload">Upload</option>
              <option value="manual">Manual</option>
            </select>

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
                <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Waste Type
                </th>
                <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Quantity
                </th>
                <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Source
                </th>
                <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Timestamp
                </th>
                <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Notes
                </th>
                <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredWaste.map((item, index) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                >
                  <td className={`py-3 px-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <span className="font-medium capitalize">{item.wasteType}</span>
                  </td>
                  <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {item.quantity}
                  </td>
                  <td className={`py-3 px-4`}>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      item.detectionType === 'camera' ? 'bg-blue-100 text-blue-800' :
                      item.detectionType === 'upload' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.detectionType}
                    </span>
                  </td>
                  <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {new Date(item.timestamp).toLocaleString()}
                  </td>
                  <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {item.notes ? (
                      <span className="truncate max-w-xs block">{item.notes}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className={`py-3 px-4`}>
                    <div className="flex gap-2">
                      {item.imageUrl && (
                        <button
                          onClick={() => window.open(item.imageUrl, '_blank')}
                          className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                          title="View image"
                        >
                          <Eye size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteEntry(item.id)}
                        className="p-1 rounded text-red-500 hover:bg-red-50"
                        title="Delete entry"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {filteredWaste.length === 0 && (
            <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <Filter size={48} className="mx-auto mb-3 opacity-50" />
              <p>No waste logs found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WasteLogs;
