import React, { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Keyboard, 
  Command, 
  Search, 
  Plus, 
  Scan, 
  MapPin, 
  Package, 
  BarChart3, 
  Settings,
  X,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Zap,
  Eye,
  Edit,
  Trash2,
  Copy,
  Save,
  Undo,
  Redo
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '../../lib/utils'

interface KeyboardShortcut {
  id: string
  keys: string[]
  description: string
  action: () => void
  category: 'navigation' | 'actions' | 'editing' | 'global'
  icon?: React.ElementType
}

interface KeyboardShortcutsProps {
  onShortcutExecuted?: (shortcutId: string) => void
}

export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ onShortcutExecuted }) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set())
  const navigate = useNavigate()

  const shortcuts: KeyboardShortcut[] = [
    // Navigation shortcuts
    {
      id: 'overview',
      keys: ['cmd', '1'],
      description: 'Go to Overview',
      action: () => navigate('/dashboard/overview'),
      category: 'navigation',
      icon: BarChart3
    },
    {
      id: 'products',
      keys: ['cmd', '2'],
      description: 'Go to Products',
      action: () => navigate('/dashboard/products'),
      category: 'navigation',
      icon: Package
    },
    {
      id: 'scan',
      keys: ['cmd', '3'],
      description: 'Go to Scan & Verify',
      action: () => navigate('/dashboard/products/scan'),
      category: 'navigation',
      icon: Scan
    },
    {
      id: 'tracking',
      keys: ['cmd', '4'],
      description: 'Go to GPS Tracking',
      action: () => navigate('/dashboard/tracking'),
      category: 'navigation',
      icon: MapPin
    },
    {
      id: 'iot',
      keys: ['cmd', '5'],
      description: 'Go to IoT Dashboard',
      action: () => navigate('/dashboard/iot'),
      category: 'navigation',
      icon: Zap
    },
    {
      id: 'analytics',
      keys: ['cmd', '6'],
      description: 'Go to Analytics',
      action: () => navigate('/dashboard/analytics'),
      category: 'navigation',
      icon: BarChart3
    },
    {
      id: 'settings',
      keys: ['cmd', '8'],
      description: 'Go to Settings',
      action: () => navigate('/dashboard/settings'),
      category: 'navigation',
      icon: Settings
    },

    // Global shortcuts
    {
      id: 'search',
      keys: ['cmd', 'k'],
      description: 'Open Global Search',
      action: () => console.log('Opening search...'),
      category: 'global',
      icon: Search
    },
    {
      id: 'help',
      keys: ['cmd', '?'],
      description: 'Show Keyboard Shortcuts',
      action: () => setIsHelpOpen(true),
      category: 'global',
      icon: Keyboard
    },
    {
      id: 'command-palette',
      keys: ['cmd', 'shift', 'p'],
      description: 'Open Command Palette',
      action: () => console.log('Opening command palette...'),
      category: 'global',
      icon: Command
    },

    // Action shortcuts
    {
      id: 'create-product',
      keys: ['cmd', 'n'],
      description: 'Create New Product',
      action: () => navigate('/dashboard/products/create'),
      category: 'actions',
      icon: Plus
    },
    {
      id: 'quick-scan',
      keys: ['cmd', 's'],
      description: 'Quick Scan',
      action: () => navigate('/dashboard/products/scan'),
      category: 'actions',
      icon: Scan
    },
    {
      id: 'refresh',
      keys: ['cmd', 'r'],
      description: 'Refresh Current Page',
      action: () => window.location.reload(),
      category: 'actions',
      icon: ArrowUp
    },

    // Editing shortcuts
    {
      id: 'save',
      keys: ['cmd', 's'],
      description: 'Save Current Form',
      action: () => console.log('Saving...'),
      category: 'editing',
      icon: Save
    },
    {
      id: 'copy',
      keys: ['cmd', 'c'],
      description: 'Copy Selection',
      action: () => console.log('Copying...'),
      category: 'editing',
      icon: Copy
    },
    {
      id: 'undo',
      keys: ['cmd', 'z'],
      description: 'Undo Last Action',
      action: () => console.log('Undoing...'),
      category: 'editing',
      icon: Undo
    },
    {
      id: 'redo',
      keys: ['cmd', 'shift', 'z'],
      description: 'Redo Last Action',
      action: () => console.log('Redoing...'),
      category: 'editing',
      icon: Redo
    }
  ]

  const normalizeKey = (key: string): string => {
    const keyMap: { [key: string]: string } = {
      'Meta': 'cmd',
      'Control': 'ctrl',
      'Alt': 'alt',
      'Shift': 'shift',
      ' ': 'space',
      'ArrowUp': 'up',
      'ArrowDown': 'down',
      'ArrowLeft': 'left',
      'ArrowRight': 'right',
      'Escape': 'esc',
      'Enter': 'enter',
      'Backspace': 'backspace',
      'Delete': 'delete',
      'Tab': 'tab'
    }
    return keyMap[key] || key.toLowerCase()
  }

  const checkShortcutMatch = useCallback((shortcut: KeyboardShortcut, currentKeys: Set<string>): boolean => {
    if (shortcut.keys.length !== currentKeys.size) return false
    return shortcut.keys.every(key => currentKeys.has(key))
  }, [])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const key = normalizeKey(event.key)
    const newPressedKeys = new Set(pressedKeys)
    newPressedKeys.add(key)
    setPressedKeys(newPressedKeys)

    // Check for shortcut matches
    const matchedShortcut = shortcuts.find(shortcut => 
      checkShortcutMatch(shortcut, newPressedKeys)
    )

    if (matchedShortcut) {
      event.preventDefault()
      matchedShortcut.action()
      onShortcutExecuted?.(matchedShortcut.id)
      setPressedKeys(new Set())
    }
  }, [pressedKeys, shortcuts, checkShortcutMatch, onShortcutExecuted])

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    const key = normalizeKey(event.key)
    const newPressedKeys = new Set(pressedKeys)
    newPressedKeys.delete(key)
    setPressedKeys(newPressedKeys)
  }, [pressedKeys])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleKeyDown, handleKeyUp])

  const formatShortcut = (keys: string[]): string => {
    return keys.map(key => {
      switch (key) {
        case 'cmd': return '⌘'
        case 'ctrl': return '⌃'
        case 'alt': return '⌥'
        case 'shift': return '⇧'
        case 'space': return '␣'
        case 'enter': return '↵'
        case 'esc': return '⎋'
        case 'backspace': return '⌫'
        case 'delete': return '⌦'
        case 'tab': return '⇥'
        case 'up': return '↑'
        case 'down': return '↓'
        case 'left': return '←'
        case 'right': return '→'
        default: return key.toUpperCase()
      }
    }).join('')
  }

  const categoryColors = {
    navigation: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    actions: 'text-green-600 bg-green-50 dark:bg-green-900/20',
    editing: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
    global: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20'
  }

  const categoryIcons = {
    navigation: ArrowRight,
    actions: Zap,
    editing: Edit,
    global: Command
  }

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = []
    }
    acc[shortcut.category].push(shortcut)
    return acc
  }, {} as Record<string, KeyboardShortcut[]>)

  return (
    <>
      {/* Floating Shortcut Indicator */}
      <AnimatePresence>
        {pressedKeys.size > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-4 right-4 z-50 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-xl"
          >
            <div className="flex items-center space-x-2">
              <Keyboard className="w-4 h-4" />
              <span className="text-sm font-mono">
                {formatShortcut(Array.from(pressedKeys))}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Modal */}
      <AnimatePresence>
        {isHelpOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setIsHelpOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl max-h-[80vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Keyboard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Keyboard Shortcuts
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Boost your productivity with these shortcuts
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsHelpOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => {
                    const CategoryIcon = categoryIcons[category as keyof typeof categoryIcons]
                    return (
                      <div key={category} className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <CategoryIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                            {category}
                          </h3>
                        </div>
                        
                        <div className="space-y-2">
                          {categoryShortcuts.map((shortcut) => (
                            <motion.div
                              key={shortcut.id}
                              whileHover={{ scale: 1.02 }}
                              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <div className="flex items-center space-x-3">
                                {shortcut.icon && (
                                  <shortcut.icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                )}
                                <span className="text-sm text-gray-900 dark:text-white">
                                  {shortcut.description}
                                </span>
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                {shortcut.keys.map((key, index) => (
                                  <React.Fragment key={key}>
                                    <kbd className="px-2 py-1 text-xs font-mono bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-sm">
                                      {formatShortcut([key])}
                                    </kbd>
                                    {index < shortcut.keys.length - 1 && (
                                      <span className="text-gray-400">+</span>
                                    )}
                                  </React.Fragment>
                                ))}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Press <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">⌘?</kbd> to toggle this help
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {shortcuts.length} shortcuts available
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Hook for using keyboard shortcuts in components
export const useKeyboardShortcut = (
  keys: string[],
  callback: () => void,
  deps: React.DependencyList = []
) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const pressedKeys = new Set<string>()
      
      if (event.metaKey) pressedKeys.add('cmd')
      if (event.ctrlKey) pressedKeys.add('ctrl')
      if (event.altKey) pressedKeys.add('alt')
      if (event.shiftKey) pressedKeys.add('shift')
      
      const key = event.key.toLowerCase()
      if (!['meta', 'control', 'alt', 'shift'].includes(key)) {
        pressedKeys.add(key)
      }

      const matches = keys.length === pressedKeys.size && 
        keys.every(key => pressedKeys.has(key.toLowerCase()))

      if (matches) {
        event.preventDefault()
        callback()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, deps)
}
