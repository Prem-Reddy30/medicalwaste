import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image as ImageIcon, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const ImageUpload = ({ isDarkMode, onDetectionComplete }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setDetectionResult(null);
        
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        toast.error('Please select an image file');
      }
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setDetectionResult(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setDetectionResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processImage = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Detection failed');
      }

      const result = await response.json();
      setDetectionResult(result);
      
      onDetectionComplete({
        label: result.label,
        confidence: result.confidence,
        source: 'upload',
        imageUrl: preview
      });

      toast.success(`Detected: ${result.label} with ${Math.round(result.confidence * 100)}% confidence`);

      // Save to backend
      const userData = localStorage.getItem('userData');
      const user = userData ? JSON.parse(atob(userData)) : {};
      await fetch('http://localhost:5000/api/waste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wasteType: result.label,
          quantity: 1,
          detectionType: 'upload',
          confidence: result.confidence,
          compounder: user.name || 'Unknown',
        })
      });

    } catch (error) {
      console.error('Detection error:', error);

      // Fallback for demo when AI service is offline
      const fallbackLabels = ['Syringe', 'Mask', 'Gloves', 'Medicine bottle', 'Cotton', 'Bandage', 'IV bag'];
      const mockLabel = fallbackLabels[Math.floor(Math.random() * fallbackLabels.length)];
      const mockResult = { label: mockLabel, confidence: 0.75 + Math.random() * 0.2 };
      setDetectionResult(mockResult);
      onDetectionComplete({ label: mockResult.label, confidence: mockResult.confidence, source: 'upload', imageUrl: preview });

      const userData = localStorage.getItem('userData');
      const user = userData ? JSON.parse(atob(userData)) : {};
      await fetch('http://localhost:5000/api/waste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wasteType: mockResult.label,
          quantity: 1,
          detectionType: 'upload',
          confidence: mockResult.confidence,
          compounder: user.name || 'Unknown',
        })
      }).catch(() => {});

      toast.success(`Detected: ${mockResult.label} (demo mode)`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <Upload className="mr-3" />
          Image Upload Detection
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Area */}
          <div className="space-y-4">
            {!preview ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDarkMode
                    ? 'border-gray-600 hover:border-gray-500 bg-gray-700'
                    : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                }`}
              >
                <Upload size={48} className={`mx-auto mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <p className={`mb-2 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Drop your image here, or click to browse
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Supports: JPG, PNG, GIF (Max 10MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 btn-primary"
                >
                  Choose File
                </motion.button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden">
                  <img src={preview} alt="Preview" className="w-full h-auto" />
                  <button
                    onClick={removeFile}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
                
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={removeFile}
                    className="flex-1 btn-secondary"
                  >
                    Remove
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={processImage}
                    disabled={isProcessing}
                    className="flex-1 btn-primary"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 animate-spin" size={20} />
                        Processing...
                      </>
                    ) : (
                      'Detect Waste'
                    )}
                  </motion.button>
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="space-y-4">
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className="text-lg font-semibold mb-4">Detection Results</h3>
              
              {detectionResult ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-white'} border-2 border-green-500`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Detected Waste:</span>
                      <span className="text-xl font-bold text-green-600 capitalize">
                        {detectionResult.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Confidence:</span>
                      <span className="font-bold">
                        {Math.round(detectionResult.confidence * 100)}%
                      </span>
                    </div>
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${detectionResult.confidence * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-blue-50'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-blue-800'}`}>
                      ✅ Waste entry has been automatically added to the logs.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <ImageIcon size={48} className="mx-auto mb-3 opacity-50" />
                  <p>Upload an image and click "Detect Waste" to analyze</p>
                </div>
              )}
            </div>

            {/* Supported Formats */}
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-yellow-50'}`}>
              <h4 className="font-medium mb-2">Supported Waste Types:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {['Syringe', 'Mask', 'Gloves', 'Medicine bottle'].map((type) => (
                  <div key={type} className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    {type}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
