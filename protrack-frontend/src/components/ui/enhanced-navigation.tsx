import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, 
  Package, 
  Scan, 
  MapPin, 
  Cpu, 
  BarChart3, 
  AlertTriangle, 
  Settings,
  Plus,
  Search,
  Bell,
  Zap,
  Shield,
  Users,
  FileText,
  ChevronRight,
  Sparkles
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '../../lib/utils'

interface NavigationItem {
  name: string
  href: string
  icon: React.ElementType
  description: string
  shortcut?: string
  badge?: number
  color: string
  gradient: string
}

const navigationItems: NavigationItem[] = [
  { 
    name: 'Overview', 
    href: '/dashboard/overview', 
    icon: Home, 
    description: 'Dashboard overview and analytics',
    shortcut: '⌘1',
    color: 'text-blue-600',
    gradient: 'from-blue-500 to-blue-600'
  },
  { 
    name: 'Products', 
    href: '/dashboard/products', 
    icon: Package, 
    description: 'Manage your product catalog',
    shortcut: '⌘2',
    badge: 12,
    color: 'text-green-600',
    gradient: 'from-green-500 to-green-600'
  },
  { 
    name: 'Scan & Verify', 
    href: '/dashboard/products/scan', 
    icon: Scan, 
    description: 'QR/RFID scanning and verification',
    shortcut: '⌘3',
    color: 'text-purple-600',
    gradient: 'from-purple-500 to-purple-600'
  },
  { 
    name: 'GPS Tracking', 
    href: '/dashboard/tracking', 
    icon: MapPin, 
    description: 'Real-time shipment tracking',
    shortcut: '⌘4',
    badge: 5,
    color: 'text-orange-600',
    gradient: 'from-orange-500 to-orange-600'
  },
  { 
    name: 'IoT Dashboard', 
    href: '/dashboard/iot', 
    icon: Cpu, 
    description: 'Monitor IoT sensors and devices',
    shortcut: '⌘5',
    color: 'text-cyan-600',
    gradient: 'from-cyan-500 to-cyan-600'
  },
  { 
    name: 'Analytics', 
    href: '/dashboard/analytics', 
    icon: BarChart3, 
    description: 'Supply chain insights and reports',
    shortcut: '⌘6',
    color: 'text-indigo-600',
    gradient: 'from-indigo-500 to-indigo-600'
  },
  { 
    name: 'Recalls', 
    href: '/dashboard/recalls', 
    icon: AlertTriangle, 
    description: 'Manage product recalls and alerts',
    shortcut: '⌘7',
    badge: 3,
    color: 'text-red-600',
    gradient: 'from-red-500 to-red-600'
  },
  { 
    name: 'Settings', 
    href: '/dashboard/settings', 
    icon: Settings, 
    description: 'Account and system preferences',
    shortcut: '⌘8',
    color: 'text-gray-600',
    gradient: 'from-gray-500 to-gray-600'
  },
]

const quickActions = [
  { name: 'Create Product', icon: Plus, color: 'text-blue-600', bg: 'bg-blue-50 hover:bg-blue-100' },
  { name: 'Quick Search', icon: Search, color: 'text-green-600', bg: 'bg-green-50 hover:bg-green-100' },
  { name: 'Notifications', icon: Bell, color: 'text-purple-600', bg: 'bg-purple-50 hover:bg-purple-100' },
  { name: 'Quick Scan', icon: Zap, color: 'text-orange-600', bg: 'bg-orange-50 hover:bg-orange-100' },
]

interface EnhancedNavigationProps {
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export const EnhancedNavigation: React.FC<EnhancedNavigationProps> = ({ 
  isCollapsed = false, 
  onToggleCollapse 
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const location = useLocation()

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        const shortcutMap: { [key: string]: string } = {
          '1': '/dashboard/overview',
          '2': '/dashboard/products',
          '3': '/dashboard/products/scan',
          '4': '/dashboard/tracking',
          '5': '/dashboard/iot',
          '6': '/dashboard/analytics',
          '7': '/dashboard/recalls',
          '8': '/dashboard/settings',
        }
        
        if (shortcutMap[e.key]) {
          e.preventDefault()
          window.location.href = shortcutMap[e.key]
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const filteredItems = navigationItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Pro<span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Track</span>
          </h1>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white"
          >
            <Sparkles className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search navigation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        <AnimatePresence>
          {filteredItems.map((item, index) => {
            const isActive = location.pathname === item.href
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                onMouseEnter={() => setHoveredItem(item.name)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Link
                  to={item.href}
                  className={cn(
                    "group relative flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r text-white shadow-lg transform scale-[1.02]"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:scale-[1.01]",
                    isActive && item.gradient
                  )}
                  style={isActive ? { backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))` } : {}}
                >
                  {/* Glow effect for active item */}
                  {isActive && (
                    <motion.div
                      layoutId="activeGlow"
                      className="absolute inset-0 bg-gradient-to-r opacity-20 rounded-xl blur-sm"
                      style={{ backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))` }}
                    />
                  )}

                  <div className="relative flex items-center w-full">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "flex-shrink-0 w-5 h-5 mr-3",
                        isActive ? "text-white" : item.color
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                    </motion.div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="truncate">{item.name}</span>
                        <div className="flex items-center space-x-2">
                          {item.badge && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className={cn(
                                "px-2 py-1 text-xs font-medium rounded-full",
                                isActive 
                                  ? "bg-white/20 text-white" 
                                  : "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                              )}
                            >
                              {item.badge}
                            </motion.span>
                          )}
                          {item.shortcut && hoveredItem === item.name && (
                            <motion.span
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded font-mono"
                            >
                              {item.shortcut}
                            </motion.span>
                          )}
                        </div>
                      </div>
                      
                      {hoveredItem === item.name && !isCollapsed && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className={cn(
                            "text-xs mt-1 truncate",
                            isActive ? "text-white/80" : "text-gray-500 dark:text-gray-400"
                          )}
                        >
                          {item.description}
                        </motion.p>
                      )}
                    </div>

                    {hoveredItem === item.name && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(
                          "ml-2",
                          isActive ? "text-white" : "text-gray-400"
                        )}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </motion.div>
                    )}
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </nav>

      {/* Quick Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "flex flex-col items-center p-3 rounded-lg transition-all duration-200",
                action.bg
              )}
            >
              <action.icon className={cn("w-5 h-5 mb-1", action.color)} />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {action.name}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Status Indicator */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            System Online
          </span>
        </div>
      </div>
    </div>
  )
}
