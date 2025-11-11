import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Scan, 
  Camera, 
  Upload, 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Package,
  MapPin,
  Calendar,
  Shield,
  Hash,
  Eye
} from 'lucide-react'
import { useNotifications } from '../../contexts/NotificationContext'
import { formatDate } from '../../lib/utils'

// Mock product verification data
const mockVerificationResult = {
  verified: true,
  product: {
    id: 'PR-001',
    name: 'Organic Coffee Beans',
    sku: 'OCB-2024-001',
    batch: 'BT-2024-001',
    manufacturer: 'Green Valley Farms',
    manufacturingDate: '2024-01-15T10:30:00Z',
    expiryDate: '2024-12-15T00:00:00Z',
    location: 'Warehouse A',
    hash: '0x1a2b3c4d5e6f7890abcdef1234567890',
    status: 'active',
    certificates: ['Organic Certification', 'Quality Assurance'],
    journey: [
      { stage: 'Manufacturing', location: 'Green Valley Farms', date: '2024-01-15T10:30:00Z', status: 'completed' },
      { stage: 'Quality Check', location: 'QA Lab', date: '2024-01-16T14:20:00Z', status: 'completed' },
      { stage: 'Packaging', location: 'Packaging Facility', date: '2024-01-17T09:15:00Z', status: 'completed' },
      { stage: 'Warehouse Storage', location: 'Warehouse A', date: '2024-01-18T11:45:00Z', status: 'current' }
    ]
  }
}

export const ProductScan: React.FC = () => {
  const [scanMode, setScanMode] = useState<'qr' | 'rfid' | 'manual'>('qr')
  const [scanning, setScanning] = useState(false)
  const [manualInput, setManualInput] = useState('')
  const [verificationResult, setVerificationResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addNotification } = useNotifications()

  const handleScan = async (input?: string) => {
    setLoading(true)
    setVerificationResult(null)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock verification result
      setVerificationResult(mockVerificationResult)
      
      addNotification({
        type: 'success',
        title: 'Product verified successfully',
        message: `${mockVerificationResult.product.name} is authentic and verified.`
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Verification failed',
        message: 'Could not verify product. Please try again.'
      })
    } finally {
      setLoading(false)
      setScanning(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // In a real app, this would process the QR code from the image
      handleScan()
    }
  }

  const startCamera = () => {
    setScanning(true)
    // In a real app, this would start the camera for QR scanning
    setTimeout(() => {
      handleScan()
    }, 3000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Scan & Verify</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Verify product authenticity using QR codes, RFID, or manual input
        </p>
      </motion.div>

      {/* Scan Methods */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Choose Verification Method
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => setScanMode('qr')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              scanMode === 'qr'
                ? 'border-blockchain-500 bg-blockchain-50 dark:bg-blockchain-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <Scan className={`w-8 h-8 mx-auto mb-2 ${scanMode === 'qr' ? 'text-blockchain-500' : 'text-gray-400'}`} />
            <div className="text-sm font-medium text-gray-900 dark:text-white">QR Code</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Scan QR code</div>
          </button>

          <button
            onClick={() => setScanMode('rfid')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              scanMode === 'rfid'
                ? 'border-supply-500 bg-supply-50 dark:bg-supply-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <Shield className={`w-8 h-8 mx-auto mb-2 ${scanMode === 'rfid' ? 'text-supply-500' : 'text-gray-400'}`} />
            <div className="text-sm font-medium text-gray-900 dark:text-white">RFID Tag</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Tap RFID tag</div>
          </button>

          <button
            onClick={() => setScanMode('manual')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              scanMode === 'manual'
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <Search className={`w-8 h-8 mx-auto mb-2 ${scanMode === 'manual' ? 'text-purple-500' : 'text-gray-400'}`} />
            <div className="text-sm font-medium text-gray-900 dark:text-white">Manual Input</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Enter product ID</div>
          </button>
        </div>

        {/* Scan Interface */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          {scanMode === 'qr' && (
            <div className="text-center">
              {scanning ? (
                <div className="space-y-4">
                  <div className="w-64 h-64 mx-auto bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-pulse" />
                      <p className="text-gray-600 dark:text-gray-400">Scanning for QR code...</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setScanning(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={startCamera}
                      disabled={loading}
                      className="flex items-center px-6 py-3 bg-blockchain-600 text-white rounded-lg hover:bg-blockchain-700 disabled:opacity-50 transition-colors"
                    >
                      <Camera className="w-5 h-5 mr-2" />
                      Start Camera
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={loading}
                      className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      Upload Image
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          )}

          {scanMode === 'rfid' && (
            <div className="text-center">
              <div className="w-64 h-64 mx-auto bg-gradient-to-br from-supply-100 to-supply-200 dark:from-supply-900/20 dark:to-supply-800/20 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <Shield className="w-16 h-16 text-supply-500 mx-auto mb-4 animate-pulse" />
                  <p className="text-gray-600 dark:text-gray-400">Bring RFID tag close to reader</p>
                </div>
              </div>
              <button
                onClick={() => handleScan()}
                disabled={loading}
                className="px-6 py-3 bg-supply-600 text-white rounded-lg hover:bg-supply-700 disabled:opacity-50 transition-colors"
              >
                Simulate RFID Scan
              </button>
            </div>
          )}

          {scanMode === 'manual' && (
            <div className="max-w-md mx-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Product ID, SKU, or Hash
                  </label>
                  <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter product identifier"
                  />
                </div>
                <button
                  onClick={() => handleScan(manualInput)}
                  disabled={loading || !manualInput.trim()}
                  className="w-full flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Search className="w-5 h-5 mr-2" />
                  )}
                  {loading ? 'Verifying...' : 'Verify Product'}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Verification Result */}
      {verificationResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Verification Result
            </h3>
            <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              verificationResult.verified
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            }`}>
              {verificationResult.verified ? (
                <CheckCircle className="w-4 h-4 mr-1" />
              ) : (
                <XCircle className="w-4 h-4 mr-1" />
              )}
              {verificationResult.verified ? 'Verified' : 'Not Verified'}
            </div>
          </div>

          {verificationResult.verified && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Product Details */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-blockchain-500" />
                  Product Information
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Name:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{verificationResult.product.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">SKU:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{verificationResult.product.sku}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Batch:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{verificationResult.product.batch}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Manufacturer:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{verificationResult.product.manufacturer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Manufacturing Date:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatDate(verificationResult.product.manufacturingDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Expiry Date:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatDate(verificationResult.product.expiryDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Blockchain Hash:</span>
                    <span className="font-mono text-sm text-gray-900 dark:text-white">{verificationResult.product.hash.slice(0, 20)}...</span>
                  </div>
                </div>
              </div>

              {/* Supply Chain Journey */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-supply-500" />
                  Supply Chain Journey
                </h4>
                <div className="space-y-4">
                  {verificationResult.product.journey.map((step: any, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`w-3 h-3 rounded-full mt-1 ${
                        step.status === 'completed' ? 'bg-green-500' :
                        step.status === 'current' ? 'bg-blue-500' : 'bg-gray-300'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{step.stage}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(step.date)}</span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{step.location}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <button className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
              <Eye className="w-4 h-4 mr-2" />
              View Full Journey
            </button>
            <button className="flex items-center px-4 py-2 bg-blockchain-600 text-white rounded-lg hover:bg-blockchain-700 transition-colors">
              <Hash className="w-4 h-4 mr-2" />
              View on Blockchain
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
