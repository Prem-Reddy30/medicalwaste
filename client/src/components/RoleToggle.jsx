import React from 'react';
import { motion } from 'framer-motion';
import { User, Shield } from 'lucide-react';

const RoleToggle = ({ role, setRole }) => {
  const toggleRole = () => {
    setRole(role === 'compounder' ? 'admin' : 'compounder');
  };

  return (
    <motion.div
      className="relative"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <button
        onClick={toggleRole}
        className="relative flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
      >
        <motion.div
          key={role}
          initial={{ rotate: -180, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex items-center space-x-2"
        >
          {role === 'compounder' ? (
            <>
              <User size={18} />
              <span className="font-medium">Compounder</span>
            </>
          ) : (
            <>
              <Shield size={18} />
              <span className="font-medium">Admin</span>
            </>
          )}
        </motion.div>
      </button>
      
      <motion.div
        className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Click to switch role
      </motion.div>
    </motion.div>
  );
};

export default RoleToggle;
