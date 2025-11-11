import React, { useState } from 'react'
import { WalletProvider, useWallet, formatAddress } from './contexts/WalletContext'
import { Web3Provider } from './contexts/Web3Context'
import { BlockchainProvider } from './contexts/BlockchainContext'
import WalletConnect from './components/WalletConnect'
import WalletLoginPage from './components/WalletLoginPage'

// Icons as SVG components
const PackageIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
)

const CheckIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)


const AlertIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
)

const TruckIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM21 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
  </svg>
)

const ProTrackDashboard = () => {
  // Theme and navigation state
  const [activeTab, setActiveTab] = useState('overview')
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showLogin, setShowLogin] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loginType, setLoginType] = useState<'email' | 'wallet'>('email')
  const [userWalletData, setUserWalletData] = useState<any>(null)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [aiMessage, setAiMessage] = useState('')
  
  // Wallet integration
  const { isConnected, address, balance, disconnectWallet } = useWallet()
  
  // Product management state
  const [products, setProducts] = useState([
    { id: 'PR-001', name: 'Organic Coffee Beans', sku: 'OCB-2024-001', status: 'active', location: 'Warehouse A', batch: 'BT-001', verified: true, createdAt: '2024-01-15', did: 'did:ethr:0x1a2b3c4d5e6f', verifiedCredentials: ['Organic', 'Fair Trade'] },
    { id: 'PR-002', name: 'Premium Tea Leaves', sku: 'PTL-2024-002', status: 'in_transit', location: 'En route', batch: 'BT-002', verified: true, createdAt: '2024-01-14', did: 'did:ethr:0x2b3c4d5e6f7', verifiedCredentials: ['Premium', 'Sustainable'] },
    { id: 'PR-003', name: 'Artisan Chocolate', sku: 'AC-2024-003', status: 'delivered', location: 'Store C', batch: 'BT-003', verified: false, createdAt: '2024-01-13', did: 'did:ethr:0x3c4d5e6f7a8', verifiedCredentials: ['Artisan', 'Organic'] },
  ])
  
  // Form and interaction state
  const [newProduct, setNewProduct] = useState({ name: '', sku: '', batch: '', location: '', category: '', did: '', verifiedCredentials: [] })
  const [showProductCreated, setShowProductCreated] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [isARMode, setIsARMode] = useState(false)
  const [trackingData, setTrackingData] = useState({
    shipments: [
      { id: 'SH-001', product: 'Coffee Beans', status: 'In Transit', location: 'Mumbai', progress: 65, dePINValidated: true, zkProofVerified: true },
      { id: 'SH-002', product: 'Tea Leaves', status: 'Delivered', location: 'Delhi', progress: 100, dePINValidated: true, zkProofVerified: true },
      { id: 'SH-003', product: 'Chocolate', status: 'Processing', location: 'Bangalore', progress: 25, dePINValidated: false, zkProofVerified: true }
    ]
  })
  
  // Notifications and alerts
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'success', message: 'Product batch verified successfully', time: '2 min ago', read: false },
    { id: 2, type: 'warning', message: 'Temperature alert for batch BT-002', time: '15 min ago', read: false },
    { id: 3, type: 'info', message: 'New shipment started tracking', time: '1 hour ago', read: true },
    { id: 4, type: 'success', message: 'DID verification completed for PR-001', time: '30 min ago', read: false },
    { id: 5, type: 'info', message: 'Session key created for gasless transactions', time: '45 min ago', read: false },
  ])
  
  // DePIN and IoT data
  const [iotData, setIotData] = useState({
    devices: [
      { id: 'IOT-001', type: 'Temperature', status: 'active', lastReading: '24°C', dePINValidated: true },
      { id: 'IOT-002', type: 'GPS', status: 'active', lastReading: '19.0760° N, 72.8777° E', dePINValidated: true },
      { id: 'IOT-003', type: 'Humidity', status: 'active', lastReading: '65%', dePINValidated: true },
    ],
    alerts: [
      { id: 'ALT-001', type: 'Temperature', message: 'Temperature above threshold', severity: 'high', timestamp: '2024-01-15T10:30:00Z' },
      { id: 'ALT-002', type: 'GPS', message: 'Shipment off route', severity: 'medium', timestamp: '2024-01-15T11:45:00Z' },
      { id: 'ALT-003', type: 'Humidity', message: 'Humidity below threshold', severity: 'low', timestamp: '2024-01-15T09:15:00Z' },
    ]
  })

  // Helper functions
  const toggleTheme = () => setIsDarkMode(!isDarkMode)
  const generateProductId = () => `PR-${Date.now().toString().slice(-6)}`
  const generateSKU = (name: string) => name.split(' ').map((word: string) => word[0]).join('').toUpperCase() + '-2024-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  
  // Login handler for both email and wallet
  const handleLogin = (type: 'email' | 'wallet', data?: any) => {
    setLoginType(type)
    setIsLoggedIn(true)
    setShowLogin(false)
    
    if (type === 'wallet' && data) {
      setUserWalletData(data)
    }
  }
  
  // Logout handler
  const handleLogout = () => {
    setIsLoggedIn(false)
    setShowLogin(true)
    setLoginType('email')
    setUserWalletData(null)
    
    // Disconnect wallet if connected
    if (isConnected) {
      disconnectWallet()
    }
  }
  
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProduct.name || !newProduct.location) return
    
    const product = {
      id: generateProductId(),
      name: newProduct.name,
      sku: newProduct.sku || generateSKU(newProduct.name),
      batch: newProduct.batch || `BT-${Date.now()}`,
      location: newProduct.location,
      category: newProduct.category,
      status: 'active',
      verified: false,
      createdAt: new Date().toISOString().split('T')[0]
    }
    
    setProducts([...products, product])
    setShowProductCreated(true)
    setNewProduct({ name: '', sku: '', batch: '', location: '', category: '' })
    
    // Add success notification
    const newNotification = {
      id: Date.now(),
      type: 'success',
      message: `Product "${product.name}" created successfully!`,
      time: 'Just now',
      read: false
    }
    setNotifications([newNotification, ...notifications])
    
    // Auto hide success message after 3 seconds
    setTimeout(() => setShowProductCreated(false), 3000)
  }

  const handleStartScanning = () => {
    setIsScanning(true)
    // Simulate scanning process
    setTimeout(() => {
      const mockScanResult = {
        productId: 'PR-001',
        name: 'Organic Coffee Beans',
        status: 'Verified ✓',
        blockchain: '0x1a2b3c4d...',
        timestamp: new Date().toLocaleString(),
        authenticity: 'Genuine Product'
      }
      setScanResult(mockScanResult)
      setIsScanning(false)
    }, 2000)
  }


  // Login Page Component
  const LoginPage = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = (e: any) => {
      e.preventDefault()
      setIsLoading(true)
      setTimeout(() => {
        handleLogin(email, password)
        setIsLoading(false)
      }, 1500)
    }

    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-black' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute -top-40 -right-40 w-80 h-80 ${isDarkMode ? 'bg-blue-500/10' : 'bg-blue-500/20'} rounded-full blur-3xl`}></div>
          <div className={`absolute -bottom-40 -left-40 w-80 h-80 ${isDarkMode ? 'bg-purple-500/10' : 'bg-purple-500/20'} rounded-full blur-3xl`}></div>
        </div>
        
        <div className={`relative z-10 w-full max-w-md p-8 ${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-white/80 border-gray-200'} backdrop-blur-xl rounded-2xl border shadow-2xl`}>
          {/* Theme Toggle */}
          <div className="absolute top-4 right-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>

          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'} rounded-2xl flex items-center justify-center shadow-lg`}>
              <PackageIcon />
            </div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
              Pro<span className="text-blue-500">Track</span>
            </h1>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Supply Chain Management System</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                  isDarkMode 
                    ? 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                }`}
                placeholder="admin@protrack.com"
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                  isDarkMode 
                    ? 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                }`}
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In to Dashboard</span>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className={`mt-6 p-4 ${isDarkMode ? 'bg-gray-800/30' : 'bg-blue-50'} rounded-lg`}>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Demo Credentials:</p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Email: <span className="font-mono">admin@protrack.com</span><br/>
              Password: <span className="font-mono">any password</span>
            </p>
          </div>

          {/* Features */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className={`w-8 h-8 mx-auto mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`}>
                <CheckIcon />
              </div>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Secure</p>
            </div>
            <div>
              <div className={`w-8 h-8 mx-auto mb-2 ${isDarkMode ? 'text-green-400' : 'text-green-500'}`}>
                <PackageIcon />
              </div>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tracking</p>
            </div>
            <div>
              <div className={`w-8 h-8 mx-auto mb-2 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`}>
                <TruckIcon />
              </div>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Analytics</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show login page if not logged in
  if (showLogin && !isLoggedIn) {
    return <WalletLoginPage onLogin={handleLogin} isDark={isDarkMode} />
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white' : 'bg-gradient-to-br from-gray-50 via-white to-blue-50 text-gray-900'}`}>
      {/* Add theme class to HTML */}
      <style>{`
        body {
          background: ${isDarkMode ? 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'};
        }
      `}</style>

      {/* Header */}
      <header className={`border-b ${isDarkMode ? 'border-gray-800 bg-black/40' : 'border-gray-200 bg-white/40'} backdrop-blur-xl`}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold">
                Pro<span className="text-blue-500">Track</span> Dashboard
              </h1>
              
              {/* Role Badge - Manufacturer */}
              <div className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium">
                Manufacturer
              </div>
              
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products, batches..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-96 px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-800/50 border-gray-700 text-gray-300 placeholder-gray-500 focus:border-blue-500' 
                      : 'bg-white/50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                  }`}
                />
                <svg className={`absolute left-3 top-2.5 w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Right side header */}
            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <div className="flex items-center space-x-1 px-2 py-1 border border-gray-700 rounded-lg">
                <span className="text-sm font-medium">EN</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              
              {/* Notifications */}
              <div className="relative">
                <button className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">3</span>
                </div>
              </div>
              
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-800 text-yellow-400' : 'hover:bg-gray-100 text-gray-600'}`}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              
              {/* AI Assistant Button */}
              <button 
                onClick={() => setShowAIAssistant(!showAIAssistant)}
                className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-800 text-purple-400' : 'hover:bg-gray-100 text-purple-600'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </button>
              
              {/* Connect Wallet Button */}
              <button 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors text-white flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span>Connect Wallet</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: '📊' },
              { id: 'products', name: 'Products', icon: '📦' },
              { id: 'create', name: 'Create Product', icon: '➕' },
              { id: 'scan', name: 'Scan & Verify', icon: '🔍' },
              { id: 'tracking', name: 'GPS Tracking', icon: '📍' },
              { id: 'iot', name: 'IoT Dashboard', icon: '🌡️' },
              { id: 'analytics', name: 'Analytics', icon: '📈' },
              { id: 'recalls', name: 'Recalls', icon: '⚠️' },
              { id: 'notifications', name: 'Notifications', icon: '🔔' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 px-1 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-500'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span>{tab.icon}</span>
                  <span className="text-sm font-medium">{tab.name}</span>
                </span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8">
        {renderTabContent()}
      </main>
    </div>
  )

  // Function to render content based on active tab
  function renderTabContent() {
    switch (activeTab) {
      case 'overview':
        return renderOverview()
      case 'products':
        return renderProducts()
      case 'create':
        return renderCreateProduct()
      case 'scan':
        return renderScanVerify()
      case 'tracking':
        return renderTracking()
      case 'iot':
        return renderIoTDashboard()
      case 'blockchain':
        return renderBlockchain()
      case 'analytics':
        return renderAnalytics()
      case 'recalls':
        return renderRecalls()
      case 'wallet':
        return renderWallet()
      case 'notifications':
        return renderNotifications()
      default:
        return renderOverview()
    }
  }

  function renderOverview() {
    return (
      <>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Products */}
          <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-gray-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-400 mb-1">Total Products</div>
              <div className="text-3xl font-bold text-blue-500">1,247</div>
              <div className="text-xs text-green-400 mt-1">+12%</div>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <PackageIcon />
            </div>
          </div>
          
          {/* Verified Items */}
          <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-gray-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-400 mb-1">Verified Items</div>
              <div className="text-3xl font-bold text-green-500">1,198</div>
              <div className="text-xs text-green-400 mt-1">96.1%</div>
            </div>
            <div className="p-3 bg-green-500/10 rounded-xl">
              <CheckIcon />
            </div>
          </div>
          
          {/* Active Shipments */}
          <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-gray-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-400 mb-1">Active Shipments</div>
              <div className="text-3xl font-bold text-red-500">23</div>
              <div className="text-xs text-red-400 mt-1">2 today</div>
            </div>
            <div className="p-3 bg-red-500/10 rounded-xl">
              <TruckIcon />
            </div>
          </div>
          
          {/* IoT Alerts */}
          <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-gray-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-400 mb-1">IoT Alerts</div>
              <div className="text-3xl font-bold text-red-500">3</div>
              <div className="text-xs text-red-400 mt-1">Temperature</div>
            </div>
            <div className="p-3 bg-red-500/10 rounded-xl">
              <AlertIcon />
            </div>
          </div>
        </div>
        
        {/* Activity and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Activity */}
          <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-gray-800">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-green-500"></div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium">Product batch verified successfully</p>
                    <span className="text-xs text-gray-400">2 min ago</span>
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium">New shipment started tracking</p>
                    <span className="text-xs text-gray-400">15 min ago</span>
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-orange-500"></div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium">Temperature alert triggered</p>
                    <span className="text-xs text-gray-400">1 hour ago</span>
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-purple-500"></div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium">IoT sensor connected</p>
                    <span className="text-xs text-gray-400">2 hours ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-gray-800">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-4 border border-gray-700 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-800 transition-colors">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center mb-2">
                  <PackageIcon />
                </div>
                <span className="text-sm font-medium">Create Product</span>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-4 border border-gray-700 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-800 transition-colors">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Scan & Verify</span>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-4 border border-gray-700 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-800 transition-colors">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mb-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Track Shipment</span>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-4 border border-gray-700 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-800 transition-colors">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-sm font-medium">IoT Monitor</span>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-gray-800">
            <h3 className="text-xl font-semibold mb-6">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-gray-300">Product batch verified successfully</p>
                  <p className="text-gray-500 text-sm mt-1">2 min ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-gray-300">New shipment started tracking</p>
                  <p className="text-gray-500 text-sm mt-1">16 min ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-gray-300">Temperature alert triggered</p>
                  <p className="text-gray-500 text-sm mt-1">1 hour ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-gray-300">IoT sensor connected</p>
                  <p className="text-gray-500 text-sm mt-1">2 hours ago</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-gray-800">
            <h3 className="text-xl font-semibold mb-6">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 bg-gradient-to-r from-blue-600/20 to-blue-500/10 hover:from-blue-600/30 hover:to-blue-500/20 border border-blue-500/20 rounded-xl transition-all">
                <div className="flex flex-col items-center space-y-2">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <PackageIcon />
                  </div>
                  <span className="text-sm font-medium">Create Product</span>
                </div>
              </button>
              <button className="p-4 bg-gradient-to-r from-green-600/20 to-green-500/10 hover:from-green-600/30 hover:to-green-500/20 border border-green-500/20 rounded-xl transition-all">
                <div className="flex flex-col items-center space-y-2">
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <CheckIcon />
                  </div>
                  <span className="text-sm font-medium">Scan & Verify</span>
                </div>
              </button>
              <button className="p-4 bg-gradient-to-r from-purple-600/20 to-purple-500/10 hover:from-purple-600/30 hover:to-purple-500/20 border border-purple-500/20 rounded-xl transition-all">
                <div className="flex flex-col items-center space-y-2">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <TruckIcon />
                  </div>
                  <span className="text-sm font-medium">Track Shipment</span>
                </div>
              </button>
              <button className="p-4 bg-gradient-to-r from-orange-600/20 to-orange-500/10 hover:from-orange-600/30 hover:to-orange-500/20 border border-orange-500/20 rounded-xl transition-all">
                <div className="flex flex-col items-center space-y-2">
                  <div className="p-3 bg-orange-500/20 rounded-lg">
                    <AlertIcon />
                  </div>
                  <span className="text-sm font-medium">IoT Monitor</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )
    }

    function renderProducts() {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Products Management</h2>
          <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-gray-800">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4">Product</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Location</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id} className="border-b border-gray-800">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-gray-400 text-sm">{product.sku}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          product.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          product.status === 'in_transit' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-purple-500/20 text-purple-400'
                        }`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-300">{product.location}</td>
                      <td className="py-4 px-4">
                        <button className="text-blue-400 hover:text-blue-300 mr-3">View</button>
                        <button className="text-green-400 hover:text-green-300">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )
    }

    function renderCreateProduct() {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Create New Product</h2>
          
          {/* Success Message */}
          {showProductCreated && (
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-6 backdrop-blur-md">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckIcon />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-400">Product Created Successfully! 🎉</h3>
                  <p className="text-green-300">Your product has been added to the supply chain</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-gray-800">
            <form onSubmit={handleCreateProduct} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Product Name *</label>
                  <input 
                    type="text" 
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="e.g., Organic Coffee Beans"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">SKU (Auto-generated)</label>
                  <input 
                    type="text" 
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="Auto-generated or custom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Category</label>
                  <select 
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  >
                    <option value="">Select Category</option>
                    <option value="food">Food & Beverages</option>
                    <option value="electronics">Electronics</option>
                    <option value="textiles">Textiles</option>
                    <option value="pharmaceuticals">Pharmaceuticals</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Location *</label>
                  <input 
                    type="text" 
                    value={newProduct.location}
                    onChange={(e) => setNewProduct({...newProduct, location: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="e.g., Warehouse A, Mumbai"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2 text-gray-300">Batch Number (Auto-generated)</label>
                  <input 
                    type="text" 
                    value={newProduct.batch}
                    onChange={(e) => setNewProduct({...newProduct, batch: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="Auto-generated batch number"
                  />
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button 
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg font-medium transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <PackageIcon />
                  <span>Create Product</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setNewProduct({ name: '', sku: '', batch: '', location: '', category: '' })}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
                >
                  Clear Form
                </button>
              </div>
            </form>
          </div>
        </div>
      )
    }

    function renderScanVerify() {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Scan & Verify Products</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scanner Interface */}
            <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">QR Code Scanner</h3>
              
              {!isScanning && !scanResult && (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h4" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-semibold mb-2">Ready to Scan</h4>
                  <p className="text-gray-400 mb-6">Point your camera at a product QR code</p>
                  <button 
                    onClick={handleStartScanning}
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg font-medium transition-all transform hover:scale-105 flex items-center justify-center space-x-2 mx-auto"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Start Scanning</span>
                  </button>
                </div>
              )}

              {isScanning && (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
                    <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-semibold mb-2 text-green-400">Scanning...</h4>
                  <p className="text-gray-400">Analyzing QR code and verifying on blockchain</p>
                  <div className="mt-4 w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                  </div>
                </div>
              )}

              {scanResult && (
                <div className="space-y-4">
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <CheckIcon />
                      <h4 className="text-lg font-semibold text-green-400">Verification Successful!</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-400">Product:</span> <span className="text-white">{scanResult.name}</span></p>
                      <p><span className="text-gray-400">Status:</span> <span className="text-green-400">{scanResult.status}</span></p>
                      <p><span className="text-gray-400">Blockchain:</span> <span className="text-blue-400">{scanResult.blockchain}</span></p>
                      <p><span className="text-gray-400">Scanned:</span> <span className="text-white">{scanResult.timestamp}</span></p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {setScanResult(null); setIsScanning(false)}}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                  >
                    Scan Another Product
                  </button>
                </div>
              )}
            </div>

            {/* Recent Scans */}
            <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Recent Verifications</h3>
              <div className="space-y-3">
                {[
                  { name: 'Organic Coffee Beans', time: '2 min ago', status: 'verified', id: 'PR-001' },
                  { name: 'Premium Tea Leaves', time: '15 min ago', status: 'verified', id: 'PR-002' },
                  { name: 'Artisan Chocolate', time: '1 hour ago', status: 'pending', id: 'PR-003' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-400">{item.id} • {item.time}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.status === 'verified' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )
    }

    function renderTracking() {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">GPS Tracking & Shipments</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map Area */}
            <div className="lg:col-span-2 bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Live Tracking Map</h3>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Satellite</button>
                  <button className="px-3 py-1 bg-gray-700 text-gray-300 rounded text-sm">Street</button>
                </div>
              </div>
              
              <div className="h-96 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-lg relative overflow-hidden border border-gray-700">
                {/* Simulated Map Background */}
                <div className="absolute inset-0 bg-gray-800"></div>
                
                {/* Route Lines */}
                <svg className="absolute inset-0 w-full h-full">
                  <path d="M50 300 Q200 200 350 250" stroke="#3b82f6" strokeWidth="3" fill="none" strokeDasharray="5,5" className="animate-pulse" />
                  <path d="M350 250 Q500 200 650 180" stroke="#10b981" strokeWidth="3" fill="none" />
                </svg>
                
                {/* Location Markers */}
                <div className="absolute top-16 left-12 w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-lg"></div>
                <div className="absolute top-32 left-48 w-4 h-4 bg-blue-500 rounded-full animate-bounce shadow-lg"></div>
                <div className="absolute top-24 right-32 w-4 h-4 bg-purple-500 rounded-full shadow-lg"></div>
                
                {/* Info Cards on Map */}
                <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 text-xs">
                  <p className="text-green-400 font-medium">SH-001: Coffee Beans</p>
                  <p className="text-gray-300">Mumbai → Delhi</p>
                  <p className="text-blue-400">65% Complete</p>
                </div>
                
                <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 text-xs">
                  <p className="text-purple-400 font-medium">SH-003: Chocolate</p>
                  <p className="text-gray-300">Processing</p>
                  <p className="text-yellow-400">25% Complete</p>
                </div>
              </div>
            </div>

            {/* Shipment List */}
            <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Active Shipments</h3>
              <div className="space-y-4">
                {trackingData.shipments.map((shipment, index) => (
                  <div key={index} className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{shipment.product}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        shipment.status === 'Delivered' ? 'bg-green-500/20 text-green-400' :
                        shipment.status === 'In Transit' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {shipment.status}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-400">
                      <p>📍 {shipment.location}</p>
                      <p>🆔 {shipment.id}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{shipment.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-1000 ${
                            shipment.progress === 100 ? 'bg-green-500' :
                            shipment.progress > 50 ? 'bg-blue-500' : 'bg-yellow-500'
                          }`}
                          style={{width: `${shipment.progress}%`}}
                        ></div>
                      </div>
                    </div>
                    
                    <button className="w-full px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded text-sm text-blue-400 transition-colors">
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )
    }

    function renderIoTDashboard() {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">IoT Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Temperature</h3>
              <div className="text-3xl font-bold text-blue-400 mb-2">22.5°C</div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{width: '75%'}}></div>
              </div>
            </div>
            <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Humidity</h3>
              <div className="text-3xl font-bold text-green-400 mb-2">45%</div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{width: '45%'}}></div>
              </div>
            </div>
            <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Pressure</h3>
              <div className="text-3xl font-bold text-purple-400 mb-2">1013 hPa</div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{width: '80%'}}></div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    function renderAnalytics() {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Analytics & Insights</h2>
          
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { title: 'Monthly Revenue', value: '₹2.4M', change: '+12%', color: 'green' },
              { title: 'Products Verified', value: '1,847', change: '+8%', color: 'blue' },
              { title: 'Supply Chain Efficiency', value: '94.2%', change: '+3%', color: 'purple' },
              { title: 'Customer Satisfaction', value: '4.8/5', change: '+0.2', color: 'orange' }
            ].map((kpi, index) => (
              <div key={index} className="bg-gray-900/50 backdrop-blur-md rounded-xl p-4 border border-gray-800">
                <p className="text-gray-400 text-sm">{kpi.title}</p>
                <p className="text-2xl font-bold text-white mt-1">{kpi.value}</p>
                <p className={`text-sm mt-1 ${
                  kpi.color === 'green' ? 'text-green-400' :
                  kpi.color === 'blue' ? 'text-blue-400' :
                  kpi.color === 'purple' ? 'text-purple-400' : 'text-orange-400'
                }`}>
                  {kpi.change} from last month
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Production Chart */}
            <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Production Trends</h3>
              <div className="h-64 bg-gray-800/50 rounded-lg p-4 relative">
                {/* Simulated Chart */}
                <div className="flex items-end justify-between h-full space-x-2">
                  {[65, 78, 82, 71, 89, 95, 88, 92, 85, 90, 94, 98].map((height, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all duration-1000 hover:from-blue-500 hover:to-blue-300"
                        style={{height: `${height}%`}}
                      ></div>
                      <span className="text-xs text-gray-400 mt-2">{index + 1}</span>
                    </div>
                  ))}
                </div>
                <div className="absolute top-4 right-4 text-sm text-gray-400">
                  <span className="inline-block w-3 h-3 bg-blue-500 rounded mr-2"></span>
                  Products Created
                </div>
              </div>
            </div>

            {/* Supply Chain Flow */}
            <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Supply Chain Flow</h3>
              <div className="h-64 bg-gray-800/50 rounded-lg p-4 flex flex-col justify-center">
                <div className="space-y-4">
                  {[
                    { stage: 'Manufacturing', count: 245, color: 'blue' },
                    { stage: 'Quality Check', count: 198, color: 'green' },
                    { stage: 'Packaging', count: 167, color: 'purple' },
                    { stage: 'Distribution', count: 134, color: 'orange' },
                    { stage: 'Retail', count: 89, color: 'red' }
                  ].map((stage, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className={`w-4 h-4 rounded-full ${
                        stage.color === 'blue' ? 'bg-blue-500' :
                        stage.color === 'green' ? 'bg-green-500' :
                        stage.color === 'purple' ? 'bg-purple-500' :
                        stage.color === 'orange' ? 'bg-orange-500' : 'bg-red-500'
                      }`}></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{stage.stage}</span>
                          <span className="text-sm text-gray-400">{stage.count}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                          <div 
                            className={`h-2 rounded-full ${
                              stage.color === 'blue' ? 'bg-blue-500' :
                              stage.color === 'green' ? 'bg-green-500' :
                              stage.color === 'purple' ? 'bg-purple-500' :
                              stage.color === 'orange' ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{width: `${(stage.count / 245) * 100}%`}}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="lg:col-span-2 bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Performance Dashboard</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-3 relative">
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-700"/>
                      <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={`${2 * Math.PI * 36}`} strokeDashoffset={`${2 * Math.PI * 36 * (1 - 0.94)}`} className="text-green-500"/>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold">94%</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">Delivery Success</p>
                </div>
                
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-3 relative">
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-700"/>
                      <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={`${2 * Math.PI * 36}`} strokeDashoffset={`${2 * Math.PI * 36 * (1 - 0.87)}`} className="text-blue-500"/>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold">87%</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">Quality Score</p>
                </div>
                
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-3 relative">
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-700"/>
                      <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={`${2 * Math.PI * 36}`} strokeDashoffset={`${2 * Math.PI * 36 * (1 - 0.92)}`} className="text-purple-500"/>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold">92%</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">Efficiency</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    function renderRecalls() {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Recall Management</h2>
          <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-gray-800">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertIcon />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Active Recalls</h3>
              <p className="text-gray-400">All products are currently safe</p>
            </div>
          </div>
        </div>
      )
    }

    function renderWallet() {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Wallet Management</h2>
          
          {/* Wallet Connect Component */}
          <WalletConnect isDark={isDarkMode} />
          
          {/* Wallet Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Transaction History */}
            <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
              <div className="space-y-3">
                {[
                  { type: 'Product Mint', amount: '0.001 ETH', status: 'Confirmed', time: '2 min ago' },
                  { type: 'Verification Fee', amount: '0.0005 ETH', status: 'Confirmed', time: '1 hour ago' },
                  { type: 'Supply Chain Update', amount: '0.0002 ETH', status: 'Pending', time: '3 hours ago' }
                ].map((tx, i) => (
                  <div key={i} className={`flex justify-between items-center p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div>
                      <p className="font-medium">{tx.type}</p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{tx.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{tx.amount}</p>
                      <p className={`text-sm ${
                        tx.status === 'Confirmed' ? 'text-green-500' : 'text-yellow-500'
                      }`}>{tx.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Blockchain Stats */}
            <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className="text-lg font-semibold mb-4">Blockchain Activity</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Products Minted</span>
                  <span className="font-semibold">247</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Verifications</span>
                  <span className="font-semibold">1,156</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Smart Contracts</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Gas Saved</span>
                  <span className="font-semibold text-green-500">0.045 ETH</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'Mint Product NFT', icon: '🎨', color: 'bg-blue-600' },
                { name: 'Verify Batch', icon: '✅', color: 'bg-green-600' },
                { name: 'Transfer Ownership', icon: '🔄', color: 'bg-purple-600' },
                { name: 'View on Explorer', icon: '🔍', color: 'bg-orange-600' }
              ].map((action, i) => (
                <button
                  key={i}
                  className={`p-4 ${action.color} hover:opacity-90 text-white rounded-lg font-medium transition-all transform hover:scale-105 flex flex-col items-center space-y-2`}
                >
                  <span className="text-2xl">{action.icon}</span>
                  <span className="text-sm text-center">{action.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    }

    function renderBlockchain() {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Blockchain Dashboard</h2>
              <p className="text-gray-400">Interact with ProTrack smart contracts</p>
            </div>
          </div>

          {/* Connection Status */}
          <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {isConnected ? 'Wallet Connected' : 'Wallet Not Connected'}
                  </h3>
                  <p className="text-gray-400">
                    {isConnected ? `Connected to ${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Connect your MetaMask wallet to interact with smart contracts'}
                  </p>
                </div>
              </div>
              {!isConnected && (
                <WalletConnect />
              )}
            </div>
          </div>

          {/* Smart Contract Addresses */}
          <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Smart Contract Addresses</h3>
            <div className="space-y-3">
              {[
                { name: 'ProTrackNFT', address: '0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0' },
                { name: 'SupplyChainEscrow', address: '0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82' },
                { name: 'IoTOracle', address: '0x9A676e781A523b5d0C0e43731313A708CB607508' },
                { name: 'SupplyChainGovernance', address: '0x0B306BF915C4d645ff596e518fAf3F9669b97016' }
              ].map((contract, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div>
                    <div className="font-medium text-white">{contract.name}</div>
                    <div className="text-sm font-mono text-gray-400">{contract.address}</div>
                  </div>
                  <button className="text-blue-400 hover:text-blue-300 text-sm">
                    Copy
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Smart Contract Interactions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                disabled={!isConnected}
                className="p-4 bg-blue-600/20 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="text-blue-400 text-2xl mb-2">📦</div>
                <div className="font-medium text-white">Mint Product NFT</div>
                <div className="text-sm text-gray-400">Create a new product token</div>
              </button>
              
              <button 
                disabled={!isConnected}
                className="p-4 bg-green-600/20 border border-green-500/30 rounded-lg hover:bg-green-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="text-green-400 text-2xl mb-2">💰</div>
                <div className="font-medium text-white">Create Escrow</div>
                <div className="text-sm text-gray-400">Set up payment escrow</div>
              </button>
              
              <button 
                disabled={!isConnected}
                className="p-4 bg-purple-600/20 border border-purple-500/30 rounded-lg hover:bg-purple-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="text-purple-400 text-2xl mb-2">🌡️</div>
                <div className="font-medium text-white">Submit IoT Data</div>
                <div className="text-sm text-gray-400">Add sensor reading</div>
              </button>
            </div>
          </div>

          {/* Network Info */}
          <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Network Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">1337</div>
                <div className="text-sm text-gray-400">Chain ID</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">4</div>
                <div className="text-sm text-gray-400">Contracts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">Active</div>
                <div className="text-sm text-gray-400">Status</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">Local</div>
                <div className="text-sm text-gray-400">Network</div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    function renderNotifications() {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Notifications</h2>
          <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-gray-800">
            <div className="space-y-4">
              {notifications.map(notification => (
                <div key={notification.id} className="flex items-start space-x-3 p-4 bg-gray-800/50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    notification.type === 'success' ? 'bg-green-500' :
                    notification.type === 'warning' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-gray-300">{notification.message}</p>
                    <p className="text-gray-500 text-sm mt-1">{notification.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }
}

// Wrapper component with all providers
const ProTrackWithWallet = () => {
  return (
    <Web3Provider>
      <BlockchainProvider>
        <WalletProvider>
          <ProTrackDashboard />
        </WalletProvider>
      </BlockchainProvider>
    </Web3Provider>
  )
}

// Export the wrapped component
export default ProTrackWithWallet
