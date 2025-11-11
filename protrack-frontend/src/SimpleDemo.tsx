import React, { useState } from 'react'

const SimpleDemo = () => {
  const [currentView, setCurrentView] = useState('login')
  const [isDark, setIsDark] = useState(true)

  const toggleTheme = () => setIsDark(!isDark)

  const LoginView = () => (
    <div className={`min-h-screen flex items-center justify-center ${
      isDark ? 'bg-gray-900' : 'bg-gray-100'
    }`}>
      <div className={`w-full max-w-md p-8 rounded-2xl shadow-xl ${
        isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Pro<span className="text-blue-500">Track</span>
          </h1>
          <p className="text-gray-500">Simple Demo Version</p>
        </div>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Enter email"
            className={`w-full px-4 py-3 rounded-lg border ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
          <input
            type="password"
            placeholder="Enter password"
            className={`w-full px-4 py-3 rounded-lg border ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
          <button
            onClick={() => setCurrentView('dashboard')}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
          >
            Login to Demo
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={toggleTheme}
            className="text-blue-500 hover:text-blue-600 text-sm"
          >
            Switch to {isDark ? 'Light' : 'Dark'} Theme
          </button>
        </div>
      </div>
    </div>
  )

  const DashboardView = () => (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`border-b p-4 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">ProTrack Simple Demo</h1>
          <div className="flex space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-600"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => setCurrentView('login')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { title: 'Total Products', value: '1,247', icon: '📦' },
            { title: 'Active Shipments', value: '89', icon: '🚚' },
            { title: 'Verified Items', value: '1,156', icon: '✅' }
          ].map((stat, i) => (
            <div key={i} className={`p-6 rounded-xl shadow-sm ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <h3 className="text-sm text-gray-500 mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className={`p-6 rounded-xl shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Add Product', 'Scan QR Code', 'Track Shipment', 'View Reports'].map((action, i) => (
              <button
                key={i}
                className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              >
                {action}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className={`mt-6 p-6 rounded-xl shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[
              'Coffee Beans batch CB-001 verified successfully',
              'Tea Leaves shipment TL-002 departed from Mumbai',
              'Chocolate batch CH-003 delivered to Bangalore',
              'New product Organic Honey added to inventory'
            ].map((activity, i) => (
              <div key={i} className="flex items-center space-x-3 py-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p className="text-sm">{activity}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  return currentView === 'login' ? <LoginView /> : <DashboardView />
}

export default SimpleDemo
