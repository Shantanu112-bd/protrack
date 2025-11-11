import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Package, 
  Scan, 
  MapPin, 
  Bell, 
  Search, 
  Zap, 
  Camera,
  FileText,
  Upload,
  Download,
  Share,
  Settings,
  X
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/utils'

interface FloatingAction {
  id: string
  label: string
  icon: React.ElementType
  href?: string
  onClick?: () => void
  color: string
  gradient: string
  shortcut?: string
}

const floatingActions: FloatingAction[] = [
  {
    id: 'create-product',
    label: 'Create Product',
    icon: Package,
    href: '/dashboard/products/create',
    color: 'text-blue-600',
    gradient: 'from-blue-500 to-blue-600',
    shortcut: '⌘N'
  },
  {
    id: 'quick-scan',
    label: 'Quick Scan',
    icon: Scan,
    href: '/dashboard/products/scan',
    color: 'text-purple-600',
    gradient: 'from-purple-500 to-purple-600',
    shortcut: '⌘S'
  },
  {
    id: 'track-shipment',
    label: 'Track Shipment',
    icon: MapPin,
    href: '/dashboard/tracking',
    color: 'text-orange-600',
    gradient: 'from-orange-500 to-orange-600',
    shortcut: '⌘T'
  },
  {
    id: 'camera-scan',
    label: 'Camera Scan',
    icon: Camera,
    onClick: () => {
      // Open camera scanner
      console.log('Opening camera scanner...')
    },
    color: 'text-green-600',
    gradient: 'from-green-500 to-green-600',
    shortcut: '⌘C'
  },
  {
    id: 'search',
    label: 'Global Search',
    icon: Search,
    onClick: () => {
      // Open search modal
      console.log('Opening search...')
    },
    color: 'text-indigo-600',
    gradient: 'from-indigo-500 to-indigo-600',
    shortcut: '⌘K'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    href: '/dashboard/notifications',
    color: 'text-red-600',
    gradient: 'from-red-500 to-red-600',
    shortcut: '⌘B'
  }
]

const quickTools: FloatingAction[] = [
  {
    id: 'export',
    label: 'Export Data',
    icon: Download,
    onClick: () => console.log('Exporting data...'),
    color: 'text-cyan-600',
    gradient: 'from-cyan-500 to-cyan-600'
  },
  {
    id: 'import',
    label: 'Import Data',
    icon: Upload,
    onClick: () => console.log('Importing data...'),
    color: 'text-teal-600',
    gradient: 'from-teal-500 to-teal-600'
  },
  {
    id: 'share',
    label: 'Share Report',
    icon: Share,
    onClick: () => console.log('Sharing report...'),
    color: 'text-pink-600',
    gradient: 'from-pink-500 to-pink-600'
  },
  {
    id: 'settings',
    label: 'Quick Settings',
    icon: Settings,
    href: '/dashboard/settings',
    color: 'text-gray-600',
    gradient: 'from-gray-500 to-gray-600'
  }
]

interface FloatingActionMenuProps {
  className?: string
}

export const FloatingActionMenu: React.FC<FloatingActionMenuProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSubmenu, setActiveSubmenu] = useState<'main' | 'tools' | null>(null)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
    setActiveSubmenu(null)
  }

  const handleActionClick = (action: FloatingAction) => {
    if (action.onClick) {
      action.onClick()
    }
    setIsOpen(false)
    setActiveSubmenu(null)
  }

  const containerVariants = {
    closed: {
      scale: 0.8,
      opacity: 0
    },
    open: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.05
      }
    }
  }

  const itemVariants = {
    closed: {
      scale: 0,
      opacity: 0,
      y: 20
    },
    open: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  }

  return (
    <div className={cn("fixed bottom-6 right-6 z-50", className)}>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Action Items */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={containerVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="absolute bottom-20 right-0 space-y-3"
          >
            {/* Main Actions */}
            {activeSubmenu === null || activeSubmenu === 'main' ? (
              <>
                {floatingActions.map((action, index) => (
                  <motion.div
                    key={action.id}
                    variants={itemVariants}
                    className="flex items-center space-x-3"
                  >
                    {/* Label */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                          {action.label}
                        </span>
                        {action.shortcut && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">
                            {action.shortcut}
                          </span>
                        )}
                      </div>
                    </motion.div>

                    {/* Action Button */}
                    {action.href ? (
                      <Link to={action.href}>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className={`w-12 h-12 rounded-full bg-gradient-to-r ${action.gradient} text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center`}
                        >
                          <action.icon className="w-6 h-6" />
                        </motion.button>
                      </Link>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleActionClick(action)}
                        className={`w-12 h-12 rounded-full bg-gradient-to-r ${action.gradient} text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center`}
                      >
                        <action.icon className="w-6 h-6" />
                      </motion.button>
                    )}
                  </motion.div>
                ))}

                {/* Tools Submenu Trigger */}
                <motion.div
                  variants={itemVariants}
                  className="flex items-center space-x-3"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
                  >
                    <span className="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                      Quick Tools
                    </span>
                  </motion.div>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveSubmenu('tools')}
                    className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
                  >
                    <FileText className="w-6 h-6" />
                  </motion.button>
                </motion.div>
              </>
            ) : (
              /* Tools Submenu */
              <>
                {quickTools.map((tool, index) => (
                  <motion.div
                    key={tool.id}
                    variants={itemVariants}
                    className="flex items-center space-x-3"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
                    >
                      <span className="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                        {tool.label}
                      </span>
                    </motion.div>

                    {tool.href ? (
                      <Link to={tool.href}>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className={`w-12 h-12 rounded-full bg-gradient-to-r ${tool.gradient} text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center`}
                        >
                          <tool.icon className="w-6 h-6" />
                        </motion.button>
                      </Link>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleActionClick(tool)}
                        className={`w-12 h-12 rounded-full bg-gradient-to-r ${tool.gradient} text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center`}
                      >
                        <tool.icon className="w-6 h-6" />
                      </motion.button>
                    )}
                  </motion.div>
                ))}

                {/* Back Button */}
                <motion.div
                  variants={itemVariants}
                  className="flex items-center space-x-3"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
                  >
                    <span className="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                      Back to Main
                    </span>
                  </motion.div>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveSubmenu('main')}
                    className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </motion.div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleMenu}
        className={cn(
          "w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center relative overflow-hidden",
          isOpen && "rotate-45"
        )}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <Plus className="w-8 h-8" />
        </motion.div>

        {/* Ripple Effect */}
        <motion.div
          className="absolute inset-0 bg-white/20 rounded-full"
          initial={{ scale: 0, opacity: 0 }}
          whileTap={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        />

        {/* Pulse Animation */}
        {!isOpen && (
          <motion.div
            className="absolute inset-0 bg-blue-400/30 rounded-full"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.button>

      {/* Keyboard Shortcut Hint */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -top-12 right-0 bg-gray-900 text-white px-3 py-1 rounded-lg text-xs whitespace-nowrap"
          >
            Press ⌘+Space for quick actions
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
