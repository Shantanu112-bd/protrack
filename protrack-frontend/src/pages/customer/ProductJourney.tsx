import React from 'react'
import { motion } from 'framer-motion'
import { useParams } from 'react-router-dom'
import { MapPin, Calendar, Package, Shield, CheckCircle, Truck, Factory, Store } from 'lucide-react'
import { formatDate } from '../../lib/utils'

// Mock product journey data
const mockJourney = {
  product: {
    name: 'Organic Coffee Beans',
    brand: 'Green Valley Farms',
    image: '/api/placeholder/400/300',
    description: 'Premium organic coffee beans sourced from sustainable farms in Colombia'
  },
  stages: [
    {
      id: 1,
      name: 'Farm Origin',
      location: 'Green Valley Farm, Huila, Colombia',
      date: '2024-01-15T10:30:00Z',
      status: 'completed',
      icon: Factory,
      description: 'Coffee beans harvested from certified organic farms at 1,800m altitude',
      details: {
        temperature: '18-22°C',
        humidity: '65-75%',
        certifications: ['Organic', 'Fair Trade']
      }
    },
    {
      id: 2,
      name: 'Processing',
      location: 'Processing Plant, Bogotá, Colombia',
      date: '2024-01-16T14:20:00Z',
      status: 'completed',
      icon: Factory,
      description: 'Beans processed using traditional washed method',
      details: {
        method: 'Washed Processing',
        duration: '48 hours',
        quality: 'Grade A'
      }
    },
    {
      id: 3,
      name: 'Quality Control',
      location: 'QA Laboratory, Medellín, Colombia',
      date: '2024-01-17T09:15:00Z',
      status: 'completed',
      icon: Shield,
      description: 'Comprehensive quality testing and certification',
      details: {
        tests: ['Moisture Content', 'Defect Analysis', 'Cup Quality'],
        score: '85/100',
        inspector: 'Maria Rodriguez'
      }
    },
    {
      id: 4,
      name: 'Packaging',
      location: 'Packaging Facility, Cartagena, Colombia',
      date: '2024-01-18T11:45:00Z',
      status: 'completed',
      icon: Package,
      description: 'Vacuum sealed in biodegradable packaging',
      details: {
        packaging: 'Biodegradable',
        weight: '500g',
        batch: 'BT-2024-001'
      }
    },
    {
      id: 5,
      name: 'Export Shipping',
      location: 'Port of Cartagena, Colombia',
      date: '2024-01-20T08:00:00Z',
      status: 'completed',
      icon: Truck,
      description: 'Shipped via container vessel to destination port',
      details: {
        vessel: 'MV Coffee Express',
        container: 'TCLU-1234567',
        route: 'Cartagena → Miami'
      }
    },
    {
      id: 6,
      name: 'Import & Customs',
      location: 'Port of Miami, Florida, USA',
      date: '2024-01-25T16:30:00Z',
      status: 'completed',
      icon: CheckCircle,
      description: 'Cleared customs and import inspection',
      details: {
        customs: 'Cleared',
        inspection: 'Passed',
        documents: 'Complete'
      }
    },
    {
      id: 7,
      name: 'Distribution',
      location: 'Distribution Center, Atlanta, GA',
      date: '2024-01-26T10:15:00Z',
      status: 'completed',
      icon: Truck,
      description: 'Sorted and prepared for retail distribution',
      details: {
        warehouse: 'DC-ATL-001',
        temperature: '20°C',
        humidity: '45%'
      }
    },
    {
      id: 8,
      name: 'Retail Store',
      location: 'Premium Coffee Shop, New York, NY',
      date: '2024-01-28T14:00:00Z',
      status: 'current',
      icon: Store,
      description: 'Available for purchase at retail location',
      details: {
        store: 'Premium Coffee Shop',
        shelf: 'A-12',
        price: '$24.99'
      }
    }
  ]
}

export const ProductJourney: React.FC = () => {
  const { productId } = useParams()

  const getStageColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500'
      case 'current':
        return 'bg-blue-500 animate-pulse'
      case 'pending':
        return 'bg-gray-300'
      default:
        return 'bg-gray-300'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blockchain-50 via-white to-supply-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Product Journey
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Follow the complete supply chain journey of your product from origin to destination
          </p>
        </motion.div>

        {/* Product Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto mb-12"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
              <div className="w-48 h-48 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                <Package className="w-20 h-20 text-gray-400" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {mockJourney.product.name}
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
                  by {mockJourney.product.brand}
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {mockJourney.product.description}
                </p>
                <div className="flex items-center justify-center md:justify-start space-x-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Verified Authentic
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Product ID: {productId}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Journey Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Supply Chain Journey
            </h3>
            
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600" />
              
              <div className="space-y-8">
                {mockJourney.stages.map((stage, index) => {
                  const StageIcon = stage.icon
                  return (
                    <motion.div
                      key={stage.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.1 * index }}
                      className="relative flex items-start space-x-6"
                    >
                      {/* Timeline Dot */}
                      <div className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center ${getStageColor(stage.status)}`}>
                        <StageIcon className="w-8 h-8 text-white" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                          <div>
                            <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                              {stage.name}
                            </h4>
                            <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
                              <MapPin className="w-4 h-4 mr-1" />
                              {stage.location}
                            </div>
                          </div>
                          <div className="flex items-center text-gray-500 dark:text-gray-400">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(stage.date)}
                          </div>
                        </div>
                        
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                          {stage.description}
                        </p>
                        
                        {/* Stage Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {Object.entries(stage.details).map(([key, value]) => (
                            <div key={key} className="bg-white dark:bg-gray-800 rounded-lg p-3">
                              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {Array.isArray(value) ? value.join(', ') : value}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
        >
          <div className="text-center bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 bg-blockchain-100 dark:bg-blockchain-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blockchain-600 dark:text-blockchain-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Blockchain Secured
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              All journey data is immutably recorded on the blockchain
            </p>
          </div>
          
          <div className="text-center bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 bg-supply-100 dark:bg-supply-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-supply-600 dark:text-supply-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Verified Authentic
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Product authenticity verified at every stage
            </p>
          </div>
          
          <div className="text-center bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Full Traceability
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Complete visibility from origin to destination
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
