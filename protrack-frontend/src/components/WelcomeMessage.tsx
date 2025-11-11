import React from 'react'

interface WelcomeMessageProps {
  isDark?: boolean
}

const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ isDark = false }) => {
  return (
    <div className={`max-w-4xl mx-auto p-8 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg`}>
      <div className="text-center">
        <div className="text-6xl mb-6">🚀</div>
        <h1 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
          Welcome to ProTrack Web3!
        </h1>
        <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-8`}>
          Your comprehensive Web3 supply chain management system is now running!
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
            <div className="text-3xl mb-3">🔗</div>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
              Blockchain Ready
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Connect your MetaMask wallet to start using Web3 features
            </p>
          </div>
          
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-green-50'}`}>
            <div className="text-3xl mb-3">📱</div>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
              RFID Scanner
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Scan and tokenize products with blockchain verification
            </p>
          </div>
          
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-purple-50'}`}>
            <div className="text-3xl mb-3">🌐</div>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
              IoT Integration
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Real-time sensor monitoring with oracle verification
            </p>
          </div>
        </div>
        
        <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'} text-left`}>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
            🎯 Quick Start Guide:
          </h3>
          <ol className={`space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>1. <strong>Connect Wallet:</strong> Click "Connect Wallet" in the top navigation</li>
            <li>2. <strong>Explore Features:</strong> Navigate through different tabs to explore functionality</li>
            <li>3. <strong>RFID Scanner:</strong> Try the RFID scanner to tokenize products</li>
            <li>4. <strong>Supply Chain:</strong> View the complete supply chain dashboard</li>
            <li>5. <strong>IoT Dashboard:</strong> Monitor real-time sensor data</li>
          </ol>
        </div>
        
        <div className="mt-8">
          <div className={`inline-flex items-center px-4 py-2 rounded-full ${
            isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
          }`}>
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            System Status: Online & Ready
          </div>
        </div>
      </div>
    </div>
  )
}

export default WelcomeMessage
