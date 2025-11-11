import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Package, Calendar, Users, Send, Eye, CheckCircle, XCircle } from 'lucide-react'
import { formatDate } from '../../lib/utils'

// Mock recall data
const mockRecalls = [
  {
    id: 'RC-001',
    productName: 'Organic Honey Batch #BT-2024-004',
    reason: 'Potential contamination detected',
    severity: 'high',
    status: 'active',
    affectedUnits: 1250,
    initiatedBy: 'Quality Control Team',
    initiatedDate: '2024-01-19T10:00:00Z',
    description: 'Routine testing revealed potential bacterial contamination in batch BT-2024-004. Immediate recall initiated as precautionary measure.'
  },
  {
    id: 'RC-002', 
    productName: 'Premium Coffee Beans #BT-2024-001',
    reason: 'Packaging defect - incorrect expiry date',
    severity: 'medium',
    status: 'resolved',
    affectedUnits: 500,
    initiatedBy: 'Packaging Department',
    initiatedDate: '2024-01-15T14:30:00Z',
    description: 'Incorrect expiry dates printed on packaging. Products recalled and repackaged with correct information.'
  }
]

export const Recalls: React.FC = () => {
  const [selectedRecall, setSelectedRecall] = useState(mockRecalls[0])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'investigating': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recall Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage product recalls and notify stakeholders across the supply chain
          </p>
        </div>
        <button className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          <AlertTriangle className="w-4 h-4 mr-2" />
          Initiate Recall
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recalls List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Active Recalls
            </h3>
            <div className="space-y-3">
              {mockRecalls.map((recall) => (
                <div
                  key={recall.id}
                  onClick={() => setSelectedRecall(recall)}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedRecall.id === recall.id
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                        {recall.productName}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {recall.id}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(recall.severity)}`}>
                      {recall.severity}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Status:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(recall.status)}`}>
                        {recall.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Affected Units:</span>
                      <span className="text-xs font-medium text-gray-900 dark:text-white">{recall.affectedUnits}</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {formatDate(recall.initiatedDate)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recall Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recall Details
              </h3>
              <div className="flex space-x-2">
                <button className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </button>
                <button className="flex items-center px-3 py-2 bg-blockchain-600 text-white rounded-lg hover:bg-blockchain-700 transition-colors">
                  <Send className="w-4 h-4 mr-1" />
                  Notify
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Product
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedRecall.productName}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Recall ID
                  </label>
                  <p className="text-gray-900 dark:text-white font-mono">{selectedRecall.id}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Severity
                  </label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(selectedRecall.severity)}`}>
                    {selectedRecall.severity.toUpperCase()}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedRecall.status)}`}>
                    {selectedRecall.status === 'resolved' ? (
                      <CheckCircle className="w-4 h-4 mr-1" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-1" />
                    )}
                    {selectedRecall.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Affected Units
                  </label>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {selectedRecall.affectedUnits.toLocaleString()}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Initiated By
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedRecall.initiatedBy}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date Initiated
                  </label>
                  <p className="text-gray-900 dark:text-white">{formatDate(selectedRecall.initiatedDate)}</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason for Recall
              </label>
              <p className="text-gray-900 dark:text-white font-medium mb-2">{selectedRecall.reason}</p>
              <p className="text-gray-600 dark:text-gray-400">{selectedRecall.description}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
