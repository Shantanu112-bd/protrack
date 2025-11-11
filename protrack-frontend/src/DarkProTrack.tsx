import React, { useState, useEffect } from 'react';
import { Web3Provider, useWeb3 } from './contexts/Web3Context';
import DarkDashboard from './components/DarkDashboard';
import SignInPage from './SignInPage';

const DarkProTrack: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Theme configuration
  const theme = {
    bg: isDarkMode ? 'bg-gray-900' : 'bg-white',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    card: isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    button: isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600',
    buttonHover: isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100',
  };

  // Handle login
  const handleLogin = (email: string, password: string) => {
    // For demo purposes, any login works
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
    return true;
  };

  // Check if user is already authenticated
  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <Web3Provider>
      <div className={`min-h-screen ${theme.bg} ${theme.text}`}>
        {!isAuthenticated ? (
          <SignInPage onLogin={handleLogin} />
        ) : (
          <DarkDashboard theme={theme} />
        )}
      </div>
    </Web3Provider>
  );
};

export default DarkProTrack;