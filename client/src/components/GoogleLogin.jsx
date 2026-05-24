import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GoogleLogin from 'react-google-login';
import toast from 'react-hot-toast';

const GoogleLoginComponent = ({ onLogin, isDarkMode }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async (googleData) => {
    setIsLoading(true);
    try {
      // Send Google user data to backend to create/update user
      const response = await fetch('http://localhost:5000/api/users/google-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: googleData.profileObj.name,
          email: googleData.profileObj.email,
          googleId: googleData.googleId,
          imageUrl: googleData.profileObj.imageUrl,
          role: 'compounder'
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        onLogin(data.user, data.token);
        toast.success('Google login successful!');
      } else {
        toast.error(data.error || 'Google login failed');
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Google login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleFailure = (response) => {
    console.error('Google login failed:', response);
    toast.error('Google login cancelled or failed');
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-6">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Sign in with Google
        </h2>
        <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Quick and secure login with your Google account
        </p>
      </div>

      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
        >
          <div className="text-center">
            <GoogleLogin
              clientId="YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
              buttonText="Sign in with Google"
              onSuccess={handleGoogleLogin}
              onFailure={handleGoogleFailure}
              cookiePolicy={'single_host_origin'}
              disabled={isLoading}
              style={{
                backgroundColor: isDarkMode ? '#4285f4' : '#4285f4',
                color: 'white',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
                width: '100%'
              }}
            />
            {isLoading && (
              <div className="mt-4 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-r-2 border-t-2 border-l-2 border-blue-500"></div>
                <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Signing in...
                </span>
              </div>
            )}
          </div>
        </motion.div>

        <div className="text-center">
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoogleLoginComponent;
