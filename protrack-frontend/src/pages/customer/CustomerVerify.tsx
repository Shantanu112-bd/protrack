import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Scan, Search, Shield, CheckCircle, XCircle, Package, Calendar, MapPin } from 'lucide-react'
import { formatDate } from '../../lib/utils'

// Mock verification data
const mockProduct = {
  verified: true,
  product: {
    name: 'Organic Coffee Beans',
    brand: 'Green Valley Farms',
    sku: 'OCB-2024-001',
    batch: 'BT-2024-001',
    manufacturingDate: '2024-01-15T10:30:00Z',
    expiryDate: '2024-12-15T00:00:00Z',
    origin: 'Colombia',
    certifications: ['Organic', 'Fair Trade', 'Rainforest Alliance'],
    journey: [
      { stage: 'Farm', location: 'Green Valley Farm, Colombia', date: '2024-01-15T10:30:00Z' },
      { stage: 'Processing', location: 'Processing Plant, Bogotá', date: '2024-01-16T14:20:00Z' },
      { stage: 'Quality Check', location: 'QA Lab, Medellín', date: '2024-01-17T09:15:00Z' },
      { stage: 'Packaging', location: 'Packaging Facility, Cartagena', date: '2024-01-18T11:45:00Z' },
      { stage: 'Export', location: 'Port of Cartagena', date: '2024-01-20T08:00:00Z' },
      { stage: 'Import', location: 'Port of Miami, USA', date: '2024-01-25T16:30:00Z' },
      { stage: 'Distribution', location: 'Distribution Center, Atlanta', date: '2024-01-26T10:15:00Z' }
    ]
  }
}

export const CustomerVerify: React.FC = () => {
  const [scanInput, setScanInput] = useState('')
  const [verificationResult, setVerificationResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [scanMode, setScanMode] = useState<'qr' | 'manual'>('qr')

  const handleVerify = async () => {
    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setVerificationResult(mockProduct)
      setLoading(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blockchain-50 via-white to-supply-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Verify Product Authenticity
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Scan the QR code or enter the product ID to verify authenticity and view the complete supply chain journey
          </p>
        </motion.div>

        {/* Verification Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
            {/* Scan Mode Toggle */}
            <div className="flex justify-center mb-6">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1 flex">
                <button
                  onClick={() => setScanMode('qr')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    scanMode === 'qr'
                      ? 'bg-white dark:bg-gray-600 text-blockchain-600 dark:text-blockchain-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Scan className="w-4 h-4 inline mr-2" />
                  QR Code
                </button>
                <button
                  onClick={() => setScanMode('manual')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    scanMode === 'manual'
                      ? 'bg-white dark:bg-gray-600 text-blockchain-600 dark:text-blockchain-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Search className="w-4 h-4 inline mr-2" />
                  Manual Entry
                </button>
              </div>
            </div>

            {scanMode === 'qr' ? (
              <div className="text-center">
                <div className="w-64 h-64 mx-auto bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center mb-6">
                  <div className="text-center">
                    <Scan className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Position QR code within the frame
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleVerify}
                  disabled={loading}
                  className="w-full bg-blockchain-600 text-white py-3 px-6 rounded-lg hover:bg-blockchain-700 disabled:opacity-50 transition-colors font-medium"
                >
                  {loading ? 'Scanning...' : 'Start Camera Scan'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Product ID or QR Code Data
                  </label>
                  <input
                    type="text"
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blockchain-500"
                    placeholder="Enter product identifier"
                  />
                </div>
                <button
                  onClick={handleVerify}
                  disabled={loading || !scanInput.trim()}
                  className="w-full bg-blockchain-600 text-white py-3 px-6 rounded-lg hover:bg-blockchain-700 disabled:opacity-50 transition-colors font-medium"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Verifying...
                    </div>
                  ) : (
                    'Verify Product'
                  )}
                </button>
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
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
              {/* Verification Status */}
              <div className="text-center mb-8">
                <div className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-semibold ${
                  verificationResult.verified
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {verificationResult.verified ? (
                    <CheckCircle className="w-6 h-6 mr-2" />
                  ) : (
                    <XCircle className="w-6 h-6 mr-2" />
                  )}
                  {verificationResult.verified ? 'Authentic Product' : 'Product Not Verified'}
                </div>
              </div>

              {verificationResult.verified && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Product Information */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                      <Package className="w-6 h-6 mr-2 text-blockchain-500" />
                      Product Information
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          {verificationResult.product.name}
                        </h4>
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                          by {verificationResult.product.brand}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            SKU
                          </label>
                          <p className="font-mono text-gray-900 dark:text-white">{verificationResult.product.sku}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Batch
                          </label>
                          <p className="font-mono text-gray-900 dark:text-white">{verificationResult.product.batch}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Manufacturing Date
                          </label>
                          <p className="text-gray-900 dark:text-white">{formatDate(verificationResult.product.manufacturingDate)}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Expiry Date
                          </label>
                          <p className="text-gray-900 dark:text-white">{formatDate(verificationResult.product.expiryDate)}</p>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Origin
                        </label>
                        <p className="text-gray-900 dark:text-white">{verificationResult.product.origin}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                          Certifications
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {verificationResult.product.certifications.map((cert: string, index: number) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-supply-100 text-supply-800 dark:bg-supply-900/20 dark:text-supply-400"
                            >
                              <Shield className="w-3 h-3 mr-1" />
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Supply Chain Journey */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                      <MapPin className="w-6 h-6 mr-2 text-supply-500" />
                      Supply Chain Journey
                    </h3>
                    
                    <div className="space-y-4">
                      {verificationResult.product.journey.map((step: any, index: number) => (
                        <div key={index} className="flex items-start space-x-4">
                          <div className="flex flex-col items-center">
                            <div className="w-4 h-4 bg-blockchain-500 rounded-full" />
                            {index < verificationResult.product.journey.length - 1 && (
                              <div className="w-0.5 h-8 bg-gray-300 dark:bg-gray-600 mt-2" />
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-gray-900 dark:text-white">{step.stage}</h4>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(step.date)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{step.location}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-blockchain-100 dark:bg-blockchain-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blockchain-600 dark:text-blockchain-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Blockchain Verified
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Every product is verified on the blockchain for immutable authenticity
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-supply-100 dark:bg-supply-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-supply-600 dark:text-supply-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Complete Traceability
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Track your product's journey from origin to your hands
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Instant Verification
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Get immediate results with our advanced verification system
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
