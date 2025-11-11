import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MoreHorizontal,
  Edit,
  Trash2,
  Share,
  Copy,
  Download,
  Eye,
  EyeOff,
  Star,
  Archive,
  RefreshCw,
  Settings,
  ExternalLink,
  Flag,
  Clock,
  Users,
  ChevronRight
} from 'lucide-react'
import { cn } from '../../lib/utils'

interface ContextualMenuItem {
  id: string
  label: string
  icon: React.ElementType
  onClick: () => void
  shortcut?: string
  color?: string
  disabled?: boolean
  separator?: boolean
  submenu?: ContextualMenuItem[]
}

interface ContextualMenuProps {
  trigger: React.ReactNode
  items: ContextualMenuItem[]
  position?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

export const ContextualMenu: React.FC<ContextualMenuProps> = ({
  trigger,
  items,
  position = 'bottom',
  className
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
          triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setActiveSubmenu(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleItemClick = (item: ContextualMenuItem) => {
    if (!item.disabled && !item.submenu) {
      item.onClick()
      setIsOpen(false)
      setActiveSubmenu(null)
    }
  }

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full mb-2'
      case 'left':
        return 'right-full mr-2 top-0'
      case 'right':
        return 'left-full ml-2 top-0'
      default:
        return 'top-full mt-2'
    }
  }

  return (
    <div className={cn("relative", className)}>
      <div
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer"
      >
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute z-50 min-w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2",
              getPositionClasses()
            )}
          >
            {items.map((item) => (
              <React.Fragment key={item.id}>
                {item.separator && (
                  <div className="my-1 border-t border-gray-200 dark:border-gray-700" />
                )}
                
                <div className="relative">
                  <motion.button
                    whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                    onClick={() => handleItemClick(item)}
                    onMouseEnter={() => item.submenu && setActiveSubmenu(item.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-2 text-sm transition-colors",
                      item.disabled 
                        ? "text-gray-400 cursor-not-allowed" 
                        : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white",
                      item.color && !item.disabled && `text-${item.color}-600 hover:text-${item.color}-700`
                    )}
                    disabled={item.disabled}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {item.shortcut && (
                        <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">
                          {item.shortcut}
                        </span>
                      )}
                      {item.submenu && (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </motion.button>

                  {/* Submenu */}
                  <AnimatePresence>
                    {item.submenu && activeSubmenu === item.id && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="absolute left-full top-0 ml-2 min-w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2"
                      >
                        {item.submenu.map((subItem) => (
                          <motion.button
                            key={subItem.id}
                            whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                            onClick={() => handleItemClick(subItem)}
                            className={cn(
                              "w-full flex items-center justify-between px-4 py-2 text-sm transition-colors",
                              subItem.disabled 
                                ? "text-gray-400 cursor-not-allowed" 
                                : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white",
                              subItem.color && !subItem.disabled && `text-${subItem.color}-600 hover:text-${subItem.color}-700`
                            )}
                            disabled={subItem.disabled}
                          >
                            <div className="flex items-center space-x-3">
                              <subItem.icon className="w-4 h-4" />
                              <span>{subItem.label}</span>
                            </div>
                            
                            {subItem.shortcut && (
                              <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">
                                {subItem.shortcut}
                              </span>
                            )}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </React.Fragment>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Predefined menu configurations for different contexts
export const productMenuItems: ContextualMenuItem[] = [
  {
    id: 'view',
    label: 'View Details',
    icon: Eye,
    onClick: () => console.log('View product'),
    shortcut: '⌘E'
  },
  {
    id: 'edit',
    label: 'Edit Product',
    icon: Edit,
    onClick: () => console.log('Edit product'),
    shortcut: '⌘E'
  },
  {
    id: 'duplicate',
    label: 'Duplicate',
    icon: Copy,
    onClick: () => console.log('Duplicate product'),
    shortcut: '⌘D'
  },
  { id: 'separator1', label: '', icon: Edit, onClick: () => {}, separator: true },
  {
    id: 'share',
    label: 'Share',
    icon: Share,
    onClick: () => console.log('Share product'),
    submenu: [
      {
        id: 'share-link',
        label: 'Copy Link',
        icon: Copy,
        onClick: () => console.log('Copy link')
      },
      {
        id: 'share-qr',
        label: 'Generate QR Code',
        icon: ExternalLink,
        onClick: () => console.log('Generate QR')
      }
    ]
  },
  {
    id: 'export',
    label: 'Export',
    icon: Download,
    onClick: () => console.log('Export product'),
    submenu: [
      {
        id: 'export-pdf',
        label: 'Export as PDF',
        icon: Download,
        onClick: () => console.log('Export PDF')
      },
      {
        id: 'export-csv',
        label: 'Export as CSV',
        icon: Download,
        onClick: () => console.log('Export CSV')
      }
    ]
  },
  {
    id: 'favorite',
    label: 'Add to Favorites',
    icon: Star,
    onClick: () => console.log('Add to favorites')
  },
  { id: 'separator2', label: '', icon: Edit, onClick: () => {}, separator: true },
  {
    id: 'archive',
    label: 'Archive',
    icon: Archive,
    onClick: () => console.log('Archive product'),
    color: 'orange'
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: Trash2,
    onClick: () => console.log('Delete product'),
    color: 'red',
    shortcut: '⌘⌫'
  }
]

export const shipmentMenuItems: ContextualMenuItem[] = [
  {
    id: 'track',
    label: 'Track Shipment',
    icon: Eye,
    onClick: () => console.log('Track shipment'),
    shortcut: '⌘T'
  },
  {
    id: 'update-status',
    label: 'Update Status',
    icon: RefreshCw,
    onClick: () => console.log('Update status')
  },
  {
    id: 'contact-carrier',
    label: 'Contact Carrier',
    icon: Users,
    onClick: () => console.log('Contact carrier')
  },
  { id: 'separator1', label: '', icon: Edit, onClick: () => {}, separator: true },
  {
    id: 'generate-report',
    label: 'Generate Report',
    icon: Download,
    onClick: () => console.log('Generate report')
  },
  {
    id: 'set-alert',
    label: 'Set Alert',
    icon: Flag,
    onClick: () => console.log('Set alert')
  },
  { id: 'separator2', label: '', icon: Edit, onClick: () => {}, separator: true },
  {
    id: 'cancel',
    label: 'Cancel Shipment',
    icon: Trash2,
    onClick: () => console.log('Cancel shipment'),
    color: 'red'
  }
]

export const iotDeviceMenuItems: ContextualMenuItem[] = [
  {
    id: 'view-data',
    label: 'View Live Data',
    icon: Eye,
    onClick: () => console.log('View live data'),
    shortcut: '⌘L'
  },
  {
    id: 'configure',
    label: 'Configure Device',
    icon: Settings,
    onClick: () => console.log('Configure device')
  },
  {
    id: 'calibrate',
    label: 'Calibrate Sensors',
    icon: RefreshCw,
    onClick: () => console.log('Calibrate sensors')
  },
  { id: 'separator1', label: '', icon: Edit, onClick: () => {}, separator: true },
  {
    id: 'export-data',
    label: 'Export Data',
    icon: Download,
    onClick: () => console.log('Export data'),
    submenu: [
      {
        id: 'export-24h',
        label: 'Last 24 Hours',
        icon: Clock,
        onClick: () => console.log('Export 24h')
      },
      {
        id: 'export-week',
        label: 'Last Week',
        icon: Clock,
        onClick: () => console.log('Export week')
      },
      {
        id: 'export-custom',
        label: 'Custom Range',
        icon: Clock,
        onClick: () => console.log('Export custom')
      }
    ]
  },
  {
    id: 'set-thresholds',
    label: 'Set Thresholds',
    icon: Flag,
    onClick: () => console.log('Set thresholds')
  },
  { id: 'separator2', label: '', icon: Edit, onClick: () => {}, separator: true },
  {
    id: 'disable',
    label: 'Disable Device',
    icon: EyeOff,
    onClick: () => console.log('Disable device'),
    color: 'orange'
  },
  {
    id: 'remove',
    label: 'Remove Device',
    icon: Trash2,
    onClick: () => console.log('Remove device'),
    color: 'red'
  }
]

// Example usage component
export const ContextualMenuExample: React.FC = () => {
  return (
    <div className="p-8 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        Contextual Menu Examples
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Product Menu */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Product Actions</h3>
          <ContextualMenu
            trigger={
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                <span>Product Options</span>
                <MoreHorizontal className="w-4 h-4" />
              </button>
            }
            items={productMenuItems}
          />
        </div>

        {/* Shipment Menu */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Shipment Actions</h3>
          <ContextualMenu
            trigger={
              <button className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                <span>Shipment Options</span>
                <MoreHorizontal className="w-4 h-4" />
              </button>
            }
            items={shipmentMenuItems}
          />
        </div>

        {/* IoT Device Menu */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">IoT Device Actions</h3>
          <ContextualMenu
            trigger={
              <button className="flex items-center space-x-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors">
                <span>Device Options</span>
                <MoreHorizontal className="w-4 h-4" />
              </button>
            }
            items={iotDeviceMenuItems}
          />
        </div>
      </div>
    </div>
  )
}
