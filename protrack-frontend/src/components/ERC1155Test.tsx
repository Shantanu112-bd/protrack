import React from 'react'

interface ERC1155TestProps {
  isDark: boolean
}

const ERC1155Test: React.FC<ERC1155TestProps> = ({ isDark }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-8 shadow-sm border`}>
        <div className="text-center">
          <div className="text-6xl mb-4">🎨</div>
          <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
            ERC-1155 Multi-Token System
          </h2>
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-8`}>
            Advanced multi-token standard for products, batches, and certificates
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`${isDark ? 'bg-gray-700' : 'bg-blue-50'} rounded-lg p-6`}>
              <div className="text-3xl mb-3">📦</div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                Product Tokens
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Unique NFTs for individual products with complete metadata
              </p>
            </div>
            
            <div className={`${isDark ? 'bg-gray-700' : 'bg-green-50'} rounded-lg p-6`}>
              <div className="text-3xl mb-3">📋</div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                Batch Tokens
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Semi-fungible tokens representing production batches
              </p>
            </div>
            
            <div className={`${isDark ? 'bg-gray-700' : 'bg-purple-50'} rounded-lg p-6`}>
              <div className="text-3xl mb-3">🏆</div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                Certificate Tokens
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Fungible tokens for compliance and quality certificates
              </p>
            </div>
          </div>
          
          <div className="mt-8">
            <div className={`${isDark ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'} border rounded-lg p-4`}>
              <div className="flex items-center justify-center space-x-2">
                <span className="text-green-500">✅</span>
                <span className={`font-medium ${isDark ? 'text-green-400' : 'text-green-800'}`}>
                  ERC-1155 Multi-Token System is Active
                </span>
              </div>
              <p className={`text-sm mt-2 ${isDark ? 'text-green-300' : 'text-green-700'} text-center`}>
                Ready to mint products, batches, and certificates with advanced blockchain technology
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ERC1155Test
