import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const WasteEntry = ({ isDarkMode, onWasteAdded }) => {
  const [formData, setFormData] = useState({
    wasteType: '',
    quantity: '',
    notes: ''
  });

  const wasteTypes = [
    'Syringe',
    'Mask',
    'Gloves',
    'Medicine bottle',
    'Cotton',
    'Bandage',
    'IV bag',
    'Other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.wasteType || !formData.quantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Get current user info
      const userData = JSON.parse(localStorage.getItem('userData'));
      
      const wasteEntry = {
        wasteType: formData.wasteType,
        quantity: parseInt(formData.quantity),
        detectionType: 'manual',
        timestamp: new Date().toISOString(),
        notes: formData.notes,
        compounder: userData?.name || 'Unknown',
        compounderEmail: userData?.email || 'unknown@example.com'
      };

      console.log('Sending waste entry:', wasteEntry);

      // Send to backend
      const response = await fetch('http://localhost:5000/api/waste', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(wasteEntry)
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('Success response:', result);
        onWasteAdded(result.data);
        
        // Reset form
        setFormData({
          wasteType: '',
          quantity: '',
          notes: ''
        });
        
        toast.success('Waste entry added successfully!');
      } else {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        throw new Error(`Failed to save waste entry: ${response.status} ${errorText}`);
      }
    } catch (error) {
      console.error('Error saving waste entry:', error);
      
      // Fallback: Save to localStorage and show success
      const fallbackEntry = {
        ...wasteEntry,
        id: Date.now(),
        _id: Date.now().toString()
      };
      
      // Add to local storage as fallback
      const existingEntries = JSON.parse(localStorage.getItem('wasteEntries') || '[]');
      existingEntries.push(fallbackEntry);
      localStorage.setItem('wasteEntries', JSON.stringify(existingEntries));
      
      // Notify parent component
      onWasteAdded(fallbackEntry);
      
      // Reset form
      setFormData({
        wasteType: '',
        quantity: '',
        notes: ''
      });
      
      toast.success('Waste entry saved locally!');
    }
  };

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <Plus className="mr-3" />
          Manual Waste Entry
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Waste Type */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Waste Type *
              </label>
              <select
                name="wasteType"
                value={formData.wasteType}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
              >
                <option value="">Select waste type</option>
                {wasteTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Quantity *
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                required
                placeholder="Enter quantity"
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              placeholder="Enter any additional notes or observations..."
              className={`w-full px-4 py-2 rounded-lg border ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
            />
          </div>

          {/* Auto-filled timestamp display */}
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Entry Timestamp:
              </span>
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {new Date().toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Detection Source:
              </span>
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Manual Entry
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="btn-primary flex items-center"
            >
              <Save className="mr-2" size={20} />
              Save Waste Entry
            </motion.button>
          </div>
        </form>
      </div>

      {/* Quick Entry Tips */}
      <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <h3 className="text-lg font-semibold mb-4">Quick Entry Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: '🏥', title: 'Hospital Waste', desc: 'General medical waste from patient care' },
            { icon: '💉', title: 'Sharps', desc: 'Needles, syringes, and other sharp objects' },
            { icon: '🧤', title: 'PPE', desc: 'Gloves, masks, gowns, and protective equipment' }
          ].map((tip, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
            >
              <div className="text-2xl mb-2">{tip.icon}</div>
              <h4 className={`font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {tip.title}
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {tip.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WasteEntry;
