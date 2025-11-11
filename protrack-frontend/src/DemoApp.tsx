import React, { useState } from 'react'

const DemoApp = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const toggleTheme = () => setIsDarkMode(!isDarkMode)
  const login = () => setIsLoggedIn(true)
  const logout = () => setIsLoggedIn(false)

  const theme = {
    bg: isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900',
    card: isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    input: isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
  }

  if (!isLoggedIn) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme.bg}`}>
        <div className={`w-96 p-8 rounded-2xl border shadow-xl ${theme.card}`}>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Pro<span className="text-blue-500">Track</span></h1>
            <p className="text-gray-500 mt-2">Demo Supply Chain Dashboard</p>
          </div>
          
          <div className="space-y-4">
            <input 
              type="email" 
              placeholder="demo@protrack.com"
              className={`w-full px-4 py-3 rounded-lg border ${theme.input}`}
            />
            <input 
              type="password" 
              placeholder="password"
              className={`w-full px-4 py-3 rounded-lg border ${theme.input}`}
            />
            <button 
              onClick={login}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
            >
              Login to Demo
            </button>
          </div>

          <button 
            onClick={toggleTheme}
            className="mt-4 w-full py-2 text-sm text-blue-500 hover:text-blue-600"
          >
            Switch to {isDarkMode ? 'Light' : 'Dark'} Mode
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${theme.bg}`}>
      {/* Header */}
      <header className={`border-b p-4 ${theme.card}`}>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">ProTrack Demo</h1>
          <div className="flex space-x-4">
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-600">
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <button onClick={logout} className="px-4 py-2 bg-red-600 text-white rounded-lg">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="p-4">
        <div className="flex space-x-4">
          {[
            { id: 'overview', name: 'Overview' },
            { id: 'products', name: 'Products' },
            { id: 'tracking', name: 'Tracking' },
            { id: 'analytics', name: 'Analytics' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-600 text-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { title: 'Total Products', value: '1,247' },
                { title: 'Active Shipments', value: '89' },
                { title: 'Verified Items', value: '1,156' },
                { title: 'Alerts', value: '3' }
              ].map((stat, i) => (
                <div key={i} className={`p-6 rounded-xl border ${theme.card}`}>
                  <h3 className="text-sm text-gray-500">{stat.title}</h3>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Products Management</h2>
            <div className={`p-6 rounded-xl border ${theme.card}`}>
              <h3 className="text-lg font-semibold mb-4">Recent Products</h3>
              {['Coffee Beans - Active', 'Tea Leaves - Shipped', 'Chocolate - Delivered'].map((product, i) => (
                <div key={i} className="py-2 border-b last:border-b-0">
                  <p className="font-medium">{product}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tracking' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">GPS Tracking</h2>
            <div className={`p-6 rounded-xl border ${theme.card}`}>
              <h3 className="text-lg font-semibold mb-4">Live Tracking</h3>
              <div className="h-64 bg-gray-600 rounded-lg flex items-center justify-center">
                <p className="text-white">🗺️ Interactive Map</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-xl border ${theme.card}`}>
                <h3 className="text-lg font-semibold mb-4">Performance Chart</h3>
                <div className="h-48 bg-gray-600 rounded-lg flex items-center justify-center">
                  <p className="text-white">📊 Analytics Chart</p>
                </div>
              </div>
              <div className={`p-6 rounded-xl border ${theme.card}`}>
                <h3 className="text-lg font-semibold mb-4">Supply Chain Flow</h3>
                <div className="h-48 bg-gray-600 rounded-lg flex items-center justify-center">
                  <p className="text-white">🔄 Flow Diagram</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default DemoApp
