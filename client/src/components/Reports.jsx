import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Calendar, Filter, Search, Package, TrendingUp, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

const Reports = ({ isDarkMode, wasteData }) => {
  const [dateRange, setDateRange] = useState('week');
  const [reportType, setReportType] = useState('summary');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    const now = new Date();
    let startDate = new Date();

    switch (dateRange) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    return wasteData.filter(item => {
      const itemDate = new Date(item.timestamp);
      return itemDate >= startDate && itemDate <= now;
    });
  }, [wasteData, dateRange]);

  const wasteByType = useMemo(() => {
    const typeCount = {};
    filteredData.forEach(item => {
      typeCount[item.wasteType] = (typeCount[item.wasteType] || 0) + item.quantity;
    });
    return typeCount;
  }, [filteredData]);

  const wasteBySource = useMemo(() => {
    const sourceCount = { camera: 0, upload: 0, manual: 0 };
    filteredData.forEach(item => {
      sourceCount[item.detectionType] = (sourceCount[item.detectionType] || 0) + 1;
    });
    return sourceCount;
  }, [filteredData]);

  const generateReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      dateRange,
      reportType,
      summary: {
        totalEntries: filteredData.length,
        totalQuantity: filteredData.reduce((sum, item) => sum + item.quantity, 0),
        averagePerDay: Math.round(filteredData.reduce((sum, item) => sum + item.quantity, 0) / 7),
        topWasteType: Object.entries(wasteByType).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
      },
      wasteByType,
      wasteBySource,
      detailedData: filteredData
    };

    const csvContent = [
      ['Medical Waste Management Report', '', ''],
      [`Generated: ${new Date(reportData.generatedAt).toLocaleString()}`, '', ''],
      [`Date Range: ${dateRange}`, '', ''],
      ['', '', ''],
      ['SUMMARY', '', ''],
      ['Total Entries:', reportData.summary.totalEntries, ''],
      ['Total Quantity:', reportData.summary.totalQuantity, ''],
      ['Average Per Day:', reportData.summary.averagePerDay, ''],
      ['Top Waste Type:', reportData.summary.topWasteType, ''],
      ['', '', ''],
      ['WASTE BY TYPE', '', ''],
      ...Object.entries(wasteByType).map(([type, qty]) => [type, qty, '']),
      ['', '', ''],
      ['WASTE BY SOURCE', '', ''],
      ...Object.entries(wasteBySource).map(([source, count]) => [source, count, '']),
      ['', '', ''],
      ['DETAILED LOGS', '', ''],
      ['Waste Type', 'Quantity', 'Source', 'Timestamp', 'Notes'],
      ...filteredData.map(item => [
        item.wasteType,
        item.quantity,
        item.detectionType,
        new Date(item.timestamp).toLocaleString(),
        item.notes || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waste-report-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Report generated and downloaded successfully');
  };

  const getStats = () => {
    return {
      totalEntries: filteredData.length,
      totalQuantity: filteredData.reduce((sum, item) => sum + item.quantity, 0),
      topType: Object.entries(wasteByType).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A',
      topSource: Object.entries(wasteBySource).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
    };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
            >
              <option value="summary">Summary Report</option>
              <option value="detailed">Detailed Report</option>
              <option value="analytics">Analytics Report</option>
            </select>
          </div>

          <div className="flex-1">
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
            >
              <option value="day">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last Year</option>
            </select>
          </div>

          <div className="flex items-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={generateReport}
              className="btn-primary flex items-center"
            >
              <Download className="mr-2" size={20} />
              Generate Report
            </motion.button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Entries', value: stats.totalEntries, icon: '📊', color: 'blue' },
          { label: 'Total Quantity', value: stats.totalQuantity, icon: '📦', color: 'green' },
          { label: 'Top Waste Type', value: stats.topType, icon: '🏷️', color: 'purple' },
          { label: 'Top Source', value: stats.topSource, icon: '📷', color: 'orange' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {stat.label}
                </p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stat.value}
                </p>
              </div>
              <div className="text-2xl">{stat.icon}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Waste by Type Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Waste Distribution by Type
          </h3>
          <div className="space-y-3">
            {Object.entries(wasteByType).map(([type, quantity], index) => (
              <div key={type} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {type}
                  </span>
                  <span className={`text-sm font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {quantity}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(quantity / stats.totalQuantity) * 100}%` }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Waste by Source Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Detection Sources
          </h3>
          <div className="space-y-3">
            {Object.entries(wasteBySource).map(([source, count], index) => (
              <div key={source} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium capitalize ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {source}
                  </span>
                  <span className={`text-sm font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {count}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / stats.totalEntries) * 100}%` }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
      >
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Recent Activity ({dateRange})
        </h3>
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
              </tr>
            </thead>
            <tbody>
              {filteredData.slice(0, 10).map((item, index) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.05 }}
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
                </motion.tr>
              ))}
            </tbody>
          </table>

          {filteredData.length === 0 && (
            <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <FileText size={48} className="mx-auto mb-3 opacity-50" />
              <p>No data available for the selected period</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Reports;
