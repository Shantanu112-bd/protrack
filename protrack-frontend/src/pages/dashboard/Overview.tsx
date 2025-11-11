import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Package, 
  Scan, 
  MapPin, 
  AlertTriangle, 
  Users, 
  Clock,
  CheckCircle,
  Search,
  BarChart3,
  Settings,
  Grid,
  List,
  ArrowUpRight,
  Activity,
  Box,
  CheckSquare,
  RefreshCw,
  Database,
  Link2,
  HardDrive
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { formatNumber, cn } from '../../lib/utils'
import { InteractiveDashboardGrid } from '../../components/ui/interactive-dashboard-grid'

// Mock data - in real app, this would come from API
const mockStats = {
  totalProducts: 12847,
  activeShipments: 234,
  verifiedProducts: 11923,
  alertsCount: 7,
  recentActivity: [
    { id: 1, type: 'product_created', message: 'New product batch #BT-2024-001 created', time: '2 minutes ago', status: 'success' },
    { id: 2, type: 'shipment_arrived', message: 'Shipment #SH-789 arrived at warehouse', time: '15 minutes ago', status: 'success' },
    { id: 3, type: 'alert', message: 'Temperature threshold exceeded for batch #BT-2024-002', time: '1 hour ago', status: 'warning' },
    { id: 4, type: 'verification', message: 'Product #PR-456 verified by customer', time: '2 hours ago', status: 'success' },
  ]
}

export const Overview: React.FC = () => {
  const { profile } = useAuth()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    // Simulate data refresh
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  const getRoleSpecificStats = () => {
    const baseStats = [
      { 
        id: 'products',
        name: 'Total Products', 
        value: mockStats.totalProducts, 
        icon: Package, 
        color: 'text-blue-600', 
        bg: 'bg-blue-100 dark:bg-blue-900/20',
        trend: [12000, 12500, 12300, 12700, 12800, 12750, 12847],
        change: 3.7,
        isPositive: true,
        description: 'Across all batches and locations'
      },
      { 
        id: 'verified',
        name: 'Verified', 
        value: mockStats.verifiedProducts, 
        icon: CheckCircle, 
        color: 'text-green-600', 
        bg: 'bg-green-100 dark:bg-green-900/20',
        trend: [11000, 11300, 11500, 11600, 11750, 11800, 11923],
        change: 5.2,
        isPositive: true,
        description: 'Products with verified authenticity'
      },
      { 
        id: 'active',
        name: 'Active Users', 
        value: 1247, 
        icon: Users, 
        color: 'text-purple-600', 
        bg: 'bg-purple-100 dark:bg-purple-900/20',
        trend: [1000, 1050, 1100, 1150, 1200, 1220, 1247],
        change: 8.3,
        isPositive: true,
        description: 'Active in the last 30 days'
      },
      { 
        id: 'alerts',
        name: 'Alerts', 
        value: mockStats.alertsCount, 
        icon: AlertTriangle, 
        color: 'text-red-600', 
        bg: 'bg-red-100 dark:bg-red-900/20',
        trend: [12, 10, 8, 9, 7, 6, 7],
        change: -5.2,
        isPositive: false,
        description: 'Requiring attention'
      }
    ]

    // Role-specific overrides
    const roleOverrides: Record<string, any> = {
      manufacturer: {
        name: 'Products Created',
        icon: Package,
        description: 'Total products in the system'
      },
      wholesaler: {
        name: 'Products Handled',
        icon: Box,
        description: 'Products currently in inventory'
      },
      inspector: {
        name: 'Inspections Done',
        icon: CheckSquare,
        description: 'Completed product inspections'
      }
    }

    return baseStats.map(stat => {
      const role = profile?.role as keyof typeof roleOverrides
      return role && roleOverrides[role] ? 
        { ...stat, ...roleOverrides[role] } : 
        stat
    })
  }

  const stats = getRoleSpecificStats()

  return (
    <div className="space-y-6">
      {/* Welcome Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 bg-gradient-to-r from-blockchain-500 to-supply-500 rounded-xl p-6 text-white"
        >
          <h1 className="text-2xl font-bold mb-2">
            {getGreeting()}, {profile?.company_name || 'User'}! 👋
          </h1>
          <p className="text-blockchain-100">
            Welcome to your ProTrack dashboard. Here's what's happening in your supply chain.
          </p>
        </motion.div>
        
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg p-2 shadow-sm border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              title="Grid view"
            >
              <Grid className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              title="List view"
            >
              <List className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title="Refresh data"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-300 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full rounded-lg border-0 bg-white dark:bg-gray-800 py-2 pl-10 pr-3 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blockchain-500 sm:text-sm sm:leading-6"
              placeholder="Search..."
            />
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const StatIcon = stat.icon
          return (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                    {stat.name}
                    <span className="ml-1.5 inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-300">
                      {stat.isPositive ? '↑' : '↓'} {Math.abs(stat.change)}%
                    </span>
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {typeof stat.value === 'number' ? formatNumber(stat.value) : stat.value}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {stat.description}
                  </p>
                </div>
                <div className={`p-2.5 rounded-lg ${stat.bg} dark:bg-opacity-20 group-hover:scale-110 transition-transform`}>
                  <StatIcon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              
              {/* Mini trend chart */}
              <div className="mt-4 h-12 w-full flex items-end">
                <div className="flex items-end w-full h-full space-x-0.5">
                  {stat.trend.map((value: number, i: number) => {
                    const height = (value / Math.max(...stat.trend)) * 100
                    return (
                      <div 
                        key={i}
                        className={`flex-1 rounded-t ${i === stat.trend.length - 1 ? 'bg-gradient-to-t from-blue-500 to-blue-400' : 'bg-gray-200 dark:bg-gray-700'}`}
                        style={{ height: `${height * 0.8}%` }}
                      />
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
      
      {/* Interactive Dashboard Grid */}
      <div className="mt-6">
        <InteractiveDashboardGrid />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity with Enhanced UI */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h3>
            <button className="text-sm font-medium text-blockchain-600 dark:text-blockchain-400 hover:text-blockchain-700 dark:hover:text-blockchain-300">
              View all
            </button>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {mockStats.recentActivity.map((activity, index) => (
              <div key={activity.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-start">
                  <div className={`flex-shrink-0 mt-0.5 mr-3 w-2 h-2 rounded-full ${
                    activity.status === 'success' ? 'bg-green-500' :
                    activity.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.message}
                    </p>
                    <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="mr-1 h-3 w-3" />
                      <span>{activity.time}</span>
                      {index === 0 && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-xs font-medium text-green-800 dark:text-green-200">
                          New
                        </span>
                      )}
                    </div>
                  </div>
                  <button className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              System Status
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { name: 'API Service', status: 'operational', value: '99.99%', icon: Activity },
                { name: 'Database', status: 'operational', value: '100%', icon: Database },
                { name: 'Blockchain', status: 'degraded', value: '97.5%', icon: Link2 },
                { name: 'Storage', status: 'operational', value: '68% used', icon: HardDrive }
              ].map((item) => (
                <div key={item.name} className="flex items-center">
                  <div className="flex-shrink-0 mr-4">
                    <div className={`p-2 rounded-lg ${
                      item.status === 'operational' ? 'bg-green-100 dark:bg-green-900/20' :
                      item.status === 'degraded' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                      'bg-red-100 dark:bg-red-900/20'
                    }`}>
                      {item.status === 'operational' ? (
                        <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : item.status === 'degraded' ? (
                        <Link2 className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                      ) : (
                        <Database className="h-5 w-5 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.status === 'operational' ? 'Operational' : 
                       item.status === 'degraded' ? 'Degraded Performance' : 'Service Disruption'}
                    </p>
                  </div>
                  <div className="ml-4">
                    <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:text-green-200">
                      {item.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex flex-col items-center p-3 bg-blockchain-50 dark:bg-blockchain-900/20 rounded-lg hover:bg-blockchain-100 dark:hover:bg-blockchain-900/30 transition-colors border border-blockchain-100 dark:border-blockchain-900/30">
                  <Package className="w-5 h-5 text-blockchain-600 dark:text-blockchain-400 mb-1.5" />
                  <span className="text-sm font-medium text-blockchain-700 dark:text-blockchain-300">
                    Add Product
                  </span>
                </button>
                <button className="flex flex-col items-center p-3 bg-supply-50 dark:bg-supply-900/20 rounded-lg hover:bg-supply-100 dark:hover:bg-supply-900/30 transition-colors border border-supply-100 dark:border-supply-900/30">
                  <Scan className="w-5 h-5 text-supply-600 dark:text-supply-400 mb-1.5" />
                  <span className="text-sm font-medium text-supply-700 dark:text-supply-300">
                    Scan Item
                  </span>
                </button>
                <button className="flex flex-col items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors border border-purple-100 dark:border-purple-900/30">
                  <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400 mb-1.5" />
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    Track Shipment
                  </span>
                </button>
                <button className="flex flex-col items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors border border-orange-100 dark:border-orange-900/30">
                  <BarChart3 className="w-5 h-5 text-orange-600 dark:text-orange-400 mb-1.5" />
                  <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                    View Reports
                  </span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
