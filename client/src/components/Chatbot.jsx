import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, Bot, User } from 'lucide-react';

const Chatbot = ({ isDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your medical waste assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Rule-based responses
    if (lowerMessage.includes('syringe') || lowerMessage.includes('needle')) {
      return "Syringes and needles are considered sharps waste. They should be disposed of in puncture-proof containers labeled as 'Biohazard Sharps'. Never recap used needles!";
    } else if (lowerMessage.includes('mask')) {
      return "Face masks should be disposed of in regular medical waste bins if not contaminated. If contaminated with bodily fluids, they go in infectious waste containers.";
    } else if (lowerMessage.includes('glove')) {
      return "Used gloves should be disposed of in medical waste bins. Remove them carefully without touching the outside surface and dispose of immediately after use.";
    } else if (lowerMessage.includes('biomedical') || lowerMessage.includes('medical waste')) {
      return "Biomedical waste is any waste containing infectious materials or potentially infectious substances. It includes sharps, laboratory waste, and healthcare-associated waste.";
    } else if (lowerMessage.includes('dispose') || lowerMessage.includes('disposal')) {
      return "Medical waste disposal follows strict guidelines: 1) Segregate at source 2) Use color-coded bins 3) Follow local regulations 4) Use authorized disposal services 5) Maintain proper documentation.";
    } else if (lowerMessage.includes('color') || lowerMessage.includes('bin')) {
      return "Medical waste bins are color-coded: Yellow for infectious waste, Red for anatomical waste, Blue for pharmaceutical waste, White for sharps, and Black for general waste.";
    } else if (lowerMessage.includes('navigation') || lowerMessage.includes('how to use')) {
      return "You can navigate the system using: 1) Switch between Admin/Compounder roles using the toggle 2) Access camera detection, upload, or manual entry 3) View analytics in Admin mode 4) Check waste logs anytime!";
    } else if (lowerMessage.includes('help')) {
      return "I can help you with: • Waste disposal guidelines • System navigation • Biomedical waste information • Safety protocols • Regulatory compliance. What would you like to know?";
    } else {
      return "I'm here to help with medical waste management. You can ask me about disposal procedures, waste types, safety guidelines, or how to use this system. For specific questions, try asking about syringes, masks, gloves, or disposal methods.";
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot thinking time
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: generateResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center z-40 ${
          isOpen ? 'hidden' : 'flex'
        }`}
      >
        <MessageCircle size={24} />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`fixed bottom-6 right-6 w-96 h-[500px] ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl z-50 flex flex-col`}
          >
            {/* Header */}
            <div className="bg-primary-600 text-white p-4 rounded-t-xl flex items-center justify-between">
              <div className="flex items-center">
                <Bot className="mr-2" size={20} />
                <div>
                  <h3 className="font-semibold">Medical Waste Assistant</h3>
                  <p className="text-xs opacity-90">Always here to help</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-primary-700 p-1 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className={`flex-1 overflow-y-auto p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start max-w-[80%] ${
                      message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.sender === 'user' ? 'bg-primary-600 ml-2' : 'bg-gray-200 mr-2'
                      }`}>
                        {message.sender === 'user' ? (
                          <User size={16} className="text-white" />
                        ) : (
                          <Bot size={16} className="text-gray-600" />
                        )}
                      </div>
                      <div className={`px-4 py-2 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-primary-600 text-white'
                          : isDarkMode
                          ? 'bg-gray-700 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm">{message.text}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender === 'user'
                            ? 'text-primary-200'
                            : isDarkMode
                            ? 'text-gray-400'
                            : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-200 mr-2 flex items-center justify-center">
                        <Bot size={16} className="text-gray-600" />
                      </div>
                      <div className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <div className="flex space-x-1">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 0.8 }}
                            className="w-2 h-2 bg-gray-400 rounded-full"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
                            className="w-2 h-2 bg-gray-400 rounded-full"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
                            className="w-2 h-2 bg-gray-400 rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about medical waste disposal..."
                  className={`flex-1 px-4 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="ml-2 p-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  <Send size={20} />
                </motion.button>
              </div>
              
              {/* Quick Suggestions */}
              <div className="flex flex-wrap gap-2 mt-3">
                {['How to dispose syringes?', 'What is biomedical waste?', 'Safety guidelines'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInputMessage(suggestion)}
                    className={`text-xs px-3 py-1 rounded-full ${
                      isDarkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } transition-colors`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
