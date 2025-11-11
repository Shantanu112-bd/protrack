import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Package, 
  Scan, 
  MapPin, 
  Cpu, 
  BarChart3, 
  AlertTriangle, 
  Settings,
  TrendingUp,
  Users,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Zap,
  Bell,
  Search,
  Plus,
  Eye,
  ArrowRight,
  Activity,
  Globe,
  Wifi,
  WifiOff
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { formatNumber } from '../../lib/utils'
import { InteractiveDashboardGrid } from '../../components/ui/interactive-dashboard-grid'
import { FloatingActionMenu } from '../../components/ui/floating-action-menu'
import { KeyboardShortcuts } from '../../components/ui/keyboard-shortcuts'
import { ContextualMenu, productMenuItems } from '../../components/ui/contextual-menu-system'

// Enhanced mock data with real-time updates simulation
const mockStats = {
  totalProducts: 12847,
  activeShipments: 234,
  verifiedProducts: 11923,
  alertsCount: 7,
  connectedDevices: 156,
  systemHealth: 98.5,
  recentActivity: [
    { 
      id: 1, 
      type: 'product_created', 
      message: 'New product batch #BT-2024-001 created by GreenTech Manufacturing', 
      time: '2 minutes ago', 
      status: 'success',
      user: 'John Smith',
      location: 'Factory A'
    },
    { 
      id: 2, 
      type: 'shipment_arrived', 
      message: 'Shipment #SH-789 arrived at Central Warehouse', 
      time: '15 minutes ago', 
      status: 'success',
      user: 'Transport Co.',
      location: 'Warehouse B'
    },
    { 
      id: 3, 
      type: 'alert', 
      message: 'Temperature threshold exceeded for batch #BT-2024-002', 
      time: '1 hour ago', 
      status: 'warning',
      user: 'IoT System',
      location: 'Cold Storage'
    },
    { 
      id: 4, 
      type: 'verification', 
      message: 'Product #PR-456 verified by customer via QR scan', 
      time: '2 hours ago', 
      status: 'success',
      user: 'Customer',
      location: 'Retail Store'
    },
    { 
      id: 5, 
      type: 'compliance', 
      message: 'Compliance audit completed for Q4 2024', 
      time: '3 hours ago', 
      status: 'success',
      user: 'Audit Team',
      location: 'HQ'
    }
  ],
  quickMetrics: [
    { label: 'Today\'s Scans', value: 1247, trend: 'up', percentage: 12.5 },
    { label: 'Active Users', value: 89, trend: 'up', percentage: 8.3 },
    { label: 'System Uptime', value: '99.9%', trend: 'neutral', percentage: 0 },
    { label: 'Response Time', value: '120ms', trend: 'down', percentage: -5.2 }
  ]
}

export const EnhancedOverview: React.FC = () => {
  const { profile } = useAuth()
  const [isOnline, setIsOnline] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h')

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const getRoleSpecificStats = () => {
    switch (profile?.role) {
      case 'manufacturer':
        return [
          { 
            name: 'Products Created', 
            value: mockStats.totalProducts, 
            icon: Package, 
            color: 'text-blue-600', 
            bg: 'bg-blue-100 dark:bg-blue-900/20',
            trend: '+12%',
            description: 'Total products manufactured'
          },
          { 
            name: 'Active Batches', 
            value: 45, 
            icon: Clock, 
            color: 'text-green-600', 
            bg: 'bg-green-100 dark:bg-green-900/20',
            trend: '+5%',
            description: 'Currently in production'
          },
          { 
            name: 'Quality Score', 
            value: '98.5%', 
            icon: Shield, 
            color: 'text-purple-600', 
            bg: 'bg-purple-100 dark:bg-purple-900/20',
            trend: '+0.3%',
            description: 'Quality control rating'
          },
          { 
            name: 'Alerts', 
            value: mockStats.alertsCount, 
            icon: AlertTriangle, 
            color: 'text-red-600', 
            bg: 'bg-red-100 dark:bg-red-900/20',
            trend: '-2',
            description: 'Active system alerts'
          },
        ]
      case 'wholesaler':
        return [
          { 
            name: 'Active Shipments', 
            value: mockStats.activeShipments, 
            icon: MapPin, 
            color: 'text-blue-600', 
            bg: 'bg-blue-100 dark:bg-blue-900/20',
            trend: '+8%',
            description: 'Currently in transit'
          },
          { 
            name: 'Products Handled', 
            value: 8934, 
            icon: Package, 
            color: 'text-green-600', 
            bg: 'bg-green-100 dark:bg-green-900/20',
            trend: '+15%',
            description: 'This month'
          },
          { 
            name: 'On-time Delivery', 
            value: '94.2%', 
            icon: TrendingUp, 
            color: 'text-purple-600', 
            bg: 'bg-purple-100 dark:bg-purple-900/20',
            trend: '+2.1%',
            description: 'Delivery performance'
          },
          { 
            name: 'Alerts', 
            value: mockStats.alertsCount, 
            icon: AlertTriangle, 
            color: 'text-red-600', 
            bg: 'bg-red-100 dark:bg-red-900/20',
            trend: '-1',
            description: 'Active system alerts'
          },
        ]
      default:
        return [
          { 
            name: 'Total Products', 
            value: mockStats.totalProducts, 
            icon: Package, 
            color: 'text-blue-600', 
            bg: 'bg-blue-100 dark:bg-blue-900/20',
            trend: '+12%',
            description: 'All registered products'
          },
          { 
            name: 'Verified Products', 
            value: mockStats.verifiedProducts, 
            icon: CheckCircle, 
            color: 'text-green-600', 
            bg: 'bg-green-100 dark:bg-green-900/20',
            trend: '+8%',
            description: 'Blockchain verified'
          },
          { 
            name: 'Active Users', 
            value: 1247, 
            icon: Users, 
            color: 'text-purple-600', 
            bg: 'bg-purple-100 dark:bg-purple-900/20',
            trend: '+5%',
            description: 'Platform users'
          },
          { 
            name: 'System Health', 
            value: `${mockStats.systemHealth}%`, 
            icon: Activity, 
            color: 'text-emerald-600', 
            bg: 'bg-emerald-100 dark:bg-emerald-900/20',
            trend: '+0.2%',
            description: 'Overall system status'
          },
        ]
    }
  }

  const stats = getRoleSpecificStats()

  return (
    <div className="space-y-8">
      {/* Enhanced Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative bg-gradient-to-r from-blockchain-500 via-blue-600 to-supply-500 rounded-2xl p-8 text-white overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {getGreeting()}, {profile?.company_name || 'User'}!
              </h1>
              <p className="text-blockchain-100 text-lg">
                Welcome to your ProTrack dashboard. Here's what's happening in your supply chain.
              </p>
            </div>

            {/* Status Indicators */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                {isOnline ? (
                  <Wifi className="w-4 h-4 text-green-300" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-300" />
                )}
                <span className="text-sm">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                <Globe className="w-4 h-4 text-blue-300" />
                <span className="text-sm">Global</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {mockStats.quickMetrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-blockchain-100">{metric.label}</span>
                  <div className={`flex items-center text-xs ${
                    metric.trend === 'up' ? 'text-green-300' : 
                    metric.trend === 'down' ? 'text-red-300' : 'text-gray-300'
                  }`}>
                    <TrendingUp className={`w-3 h-3 mr-1 ${
                      metric.trend === 'down' ? 'rotate-180' : ''
                    }`} />
                    {metric.percentage !== 0 && `${Math.abs(metric.percentage)}%`}
                  </div>
                </div>
                <div className="text-xl font-bold text-white">
                  {typeof metric.value === 'number' ? formatNumber(metric.value) : metric.value}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            {/* Contextual Menu */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <ContextualMenu
                trigger={
                  <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded">
                    <Eye className="w-4 h-4" />
                  </button>
                }
                items={productMenuItems}
                position="bottom"
              />
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {stat.name}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {typeof stat.value === 'number' ? formatNumber(stat.value) : stat.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {stat.description}
                </p>
              </div>
              
              <div className="flex flex-col items-end space-y-2">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`p-3 rounded-xl ${stat.bg} shadow-lg`}
                >
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </motion.div>
                
                <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                  stat.trend.startsWith('+') ? 'text-green-600 bg-green-100 dark:bg-green-900/20' :
                  stat.trend.startsWith('-') ? 'text-red-600 bg-red-100 dark:bg-red-900/20' :
                  'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
                }`}>
                  {stat.trend}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '75%' }}
                transition={{ delay: index * 0.2, duration: 1 }}
                className={`h-1 rounded-full bg-gradient-to-r ${
                  stat.color.includes('blue') ? 'from-blue-400 to-blue-600' :
                  stat.color.includes('green') ? 'from-green-400 to-green-600' :
                  stat.color.includes('purple') ? 'from-purple-400 to-purple-600' :
                  stat.color.includes('red') ? 'from-red-400 to-red-600' :
                  'from-gray-400 to-gray-600'
                }`}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Activity Overview
        </h2>
        <div className="flex items-center space-x-2">
          {['1h', '24h', '7d', '30d'].map((range) => (
            <button
              key={range}
              onClick={() => setSelectedTimeRange(range)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                selectedTimeRange === range
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Enhanced Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1">
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-4">
            {mockStats.recentActivity.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                  activity.status === 'success' ? 'bg-green-500' :
                  activity.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white font-medium">
                    {activity.message}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{activity.time}</span>
                    <span>•</span>
                    <span>{activity.user}</span>
                    <span>•</span>
                    <span>{activity.location}</span>
                  </div>
                </div>
                
                <button className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-all">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Interactive Dashboard Grid Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Quick Access
            </h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Customize
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Create Product', icon: Package, color: 'blue', href: '/dashboard/products/create' },
              { label: 'Scan & Verify', icon: Scan, color: 'purple', href: '/dashboard/products/scan' },
              { label: 'Track Shipment', icon: MapPin, color: 'orange', href: '/dashboard/tracking' },
              { label: 'IoT Monitor', icon: Cpu, color: 'cyan', href: '/dashboard/iot' },
              { label: 'View Analytics', icon: BarChart3, color: 'indigo', href: '/dashboard/analytics' },
              { label: 'System Settings', icon: Settings, color: 'gray', href: '/dashboard/settings' }
            ].map((action, index) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-4 rounded-xl border-2 border-dashed border-${action.color}-200 dark:border-${action.color}-800 hover:border-${action.color}-400 dark:hover:border-${action.color}-600 hover:bg-${action.color}-50 dark:hover:bg-${action.color}-900/20 transition-all group`}
              >
                <action.icon className={`w-8 h-8 text-${action.color}-600 dark:text-${action.color}-400 mx-auto mb-2 group-hover:scale-110 transition-transform`} />
                <div className={`text-sm font-medium text-${action.color}-700 dark:text-${action.color}-300`}>
                  {action.label}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Interactive Dashboard Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard Features
          </h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Click any card to explore features
          </div>
        </div>
        <InteractiveDashboardGrid />
      </div>

      {/* Floating Action Menu */}
      <FloatingActionMenu />

      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts />
    </div>
  )
}
