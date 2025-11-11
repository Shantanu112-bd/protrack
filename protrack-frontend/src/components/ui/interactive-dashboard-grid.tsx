import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
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
  Truck,
  Factory,
  Store,
  Eye,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  ExternalLink,
  Star,
  Bookmark
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/utils'

interface DashboardCard {
  id: string
  title: string
  description: string
  icon: React.ElementType
  href: string
  color: string
  gradient: string
  stats?: {
    value: string | number
    label: string
    trend?: 'up' | 'down' | 'neutral'
  }
  actions?: {
    label: string
    href: string
    icon: React.ElementType
  }[]
  badge?: {
    text: string
    color: string
  }
  isNew?: boolean
  isFavorite?: boolean
}

const dashboardCards: DashboardCard[] = [
  {
    id: 'overview',
    title: 'Dashboard Overview',
    description: 'Get insights into your supply chain performance',
    icon: BarChart3,
    href: '/dashboard/overview',
    color: 'text-blue-600',
    gradient: 'from-blue-500 to-blue-600',
    stats: {
      value: '12.4K',
      label: 'Total Products',
      trend: 'up'
    },
    actions: [
      { label: 'View Details', href: '/dashboard/overview', icon: Eye },
      { label: 'Export Report', href: '/dashboard/analytics/export', icon: ExternalLink }
    ]
  },
  {
    id: 'products',
    title: 'Product Management',
    description: 'Create, manage, and track your products',
    icon: Package,
    href: '/dashboard/products',
    color: 'text-green-600',
    gradient: 'from-green-500 to-green-600',
    stats: {
      value: 247,
      label: 'Active Products',
      trend: 'up'
    },
    actions: [
      { label: 'Create Product', href: '/dashboard/products/create', icon: Plus },
      { label: 'View All', href: '/dashboard/products', icon: Eye }
    ],
    badge: {
      text: 'Popular',
      color: 'bg-green-100 text-green-800'
    }
  },
  {
    id: 'scan',
    title: 'Scan & Verify',
    description: 'QR/RFID scanning and blockchain verification',
    icon: Scan,
    href: '/dashboard/products/scan',
    color: 'text-purple-600',
    gradient: 'from-purple-500 to-purple-600',
    stats: {
      value: '98.5%',
      label: 'Success Rate',
      trend: 'up'
    },
    actions: [
      { label: 'Quick Scan', href: '/dashboard/products/scan', icon: Zap },
      { label: 'Scan History', href: '/dashboard/products/scan/history', icon: Clock }
    ],
    isNew: true
  },
  {
    id: 'tracking',
    title: 'GPS Tracking',
    description: 'Real-time shipment and location tracking',
    icon: MapPin,
    href: '/dashboard/tracking',
    color: 'text-orange-600',
    gradient: 'from-orange-500 to-orange-600',
    stats: {
      value: 23,
      label: 'Active Shipments',
      trend: 'neutral'
    },
    actions: [
      { label: 'Track Shipment', href: '/dashboard/tracking', icon: Truck },
      { label: 'Route History', href: '/dashboard/tracking/history', icon: MapPin }
    ],
    badge: {
      text: '5 Alerts',
      color: 'bg-orange-100 text-orange-800'
    }
  },
  {
    id: 'iot',
    title: 'IoT Dashboard',
    description: 'Monitor sensors, temperature, and device status',
    icon: Cpu,
    href: '/dashboard/iot',
    color: 'text-cyan-600',
    gradient: 'from-cyan-500 to-cyan-600',
    stats: {
      value: 156,
      label: 'Connected Devices',
      trend: 'up'
    },
    actions: [
      { label: 'View Sensors', href: '/dashboard/iot', icon: Cpu },
      { label: 'Device Settings', href: '/dashboard/iot/settings', icon: Settings }
    ]
  },
  {
    id: 'analytics',
    title: 'Analytics & Reports',
    description: 'Supply chain insights and performance metrics',
    icon: TrendingUp,
    href: '/dashboard/analytics',
    color: 'text-indigo-600',
    gradient: 'from-indigo-500 to-indigo-600',
    stats: {
      value: '94.2%',
      label: 'Efficiency Score',
      trend: 'up'
    },
    actions: [
      { label: 'View Reports', href: '/dashboard/analytics', icon: FileText },
      { label: 'Custom Report', href: '/dashboard/analytics/custom', icon: Plus }
    ],
    isFavorite: true
  },
  {
    id: 'recalls',
    title: 'Recall Management',
    description: 'Manage product recalls and safety alerts',
    icon: AlertTriangle,
    href: '/dashboard/recalls',
    color: 'text-red-600',
    gradient: 'from-red-500 to-red-600',
    stats: {
      value: 3,
      label: 'Active Recalls',
      trend: 'down'
    },
    actions: [
      { label: 'View Recalls', href: '/dashboard/recalls', icon: AlertTriangle },
      { label: 'Create Alert', href: '/dashboard/recalls/create', icon: Plus }
    ],
    badge: {
      text: 'Urgent',
      color: 'bg-red-100 text-red-800'
    }
  },
  {
    id: 'settings',
    title: 'Settings & Config',
    description: 'Account settings and system configuration',
    icon: Settings,
    href: '/dashboard/settings',
    color: 'text-gray-600',
    gradient: 'from-gray-500 to-gray-600',
    stats: {
      value: '100%',
      label: 'Setup Complete',
      trend: 'neutral'
    },
    actions: [
      { label: 'Account Settings', href: '/dashboard/settings', icon: Users },
      { label: 'System Config', href: '/dashboard/settings/system', icon: Settings }
    ]
  },
  {
    id: 'compliance',
    title: 'Compliance & Audit',
    description: 'Regulatory compliance and audit trails',
    icon: Shield,
    href: '/dashboard/compliance',
    color: 'text-emerald-600',
    gradient: 'from-emerald-500 to-emerald-600',
    stats: {
      value: '99.1%',
      label: 'Compliance Score',
      trend: 'up'
    },
    actions: [
      { label: 'View Audits', href: '/dashboard/compliance', icon: FileText },
      { label: 'Generate Report', href: '/dashboard/compliance/report', icon: ExternalLink }
    ],
    isNew: true
  }
]

interface InteractiveDashboardGridProps {
  className?: string
}

export const InteractiveDashboardGrid: React.FC<InteractiveDashboardGridProps> = ({ className }) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<string[]>(['analytics'])

  const toggleFavorite = (cardId: string) => {
    setFavorites(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    )
  }

  const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-500" />
      case 'down':
        return <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />
      default:
        return <Clock className="w-3 h-3 text-gray-500" />
    }
  }

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
      {dashboardCards.map((card, index) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          onMouseEnter={() => setHoveredCard(card.id)}
          onMouseLeave={() => setHoveredCard(null)}
          className="group relative"
        >
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            {/* Background Gradient on Hover */}
            <AnimatePresence>
              {hoveredCard === card.id && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.05 }}
                  exit={{ opacity: 0 }}
                  className={`absolute inset-0 bg-gradient-to-br ${card.gradient}`}
                />
              )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient} text-white shadow-lg`}
                >
                  <card.icon className="w-6 h-6" />
                </motion.div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {card.title}
                  </h3>
                  {card.badge && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${card.badge.color}`}>
                      {card.badge.text}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {card.isNew && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full"
                  >
                    New
                  </motion.span>
                )}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleFavorite(card.id)}
                  className={cn(
                    "p-1 rounded-full transition-colors",
                    favorites.includes(card.id)
                      ? "text-yellow-500"
                      : "text-gray-400 hover:text-yellow-500"
                  )}
                >
                  {favorites.includes(card.id) ? (
                    <Star className="w-4 h-4 fill-current" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                </motion.button>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {card.description}
            </p>

            {/* Stats */}
            {card.stats && (
              <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {card.stats.value}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {card.stats.label}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  {getTrendIcon(card.stats.trend)}
                </div>
              </div>
            )}

            {/* Actions */}
            <AnimatePresence>
              {hoveredCard === card.id && card.actions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 mb-4"
                >
                  {card.actions.map((action, actionIndex) => (
                    <motion.div
                      key={action.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: actionIndex * 0.05 }}
                    >
                      <Link
                        to={action.href}
                        className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        <action.icon className="w-4 h-4" />
                        <span>{action.label}</span>
                        <ArrowRight className="w-3 h-3 ml-auto" />
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Action Button */}
            <Link
              to={card.href}
              className="block w-full"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r ${card.gradient} text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200`}
              >
                <span>Open {card.title}</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      ))}
    </div>
  )
}
