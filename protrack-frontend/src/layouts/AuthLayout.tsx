import React from 'react'
import { motion } from 'framer-motion'

interface AuthLayoutProps {
  children: React.ReactNode
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blockchain-50 via-white to-supply-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="flex min-h-screen">
        {/* Left Side - Branding */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        >
          <div className="absolute inset-0 blockchain-gradient opacity-90" />
          <div className="relative z-10 flex flex-col justify-center px-12 text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <h1 className="text-5xl font-bold mb-6">
                Pro<span className="text-supply-300">Track</span>
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Next-generation supply chain management powered by Web3 technology
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-supply-300 rounded-full animate-pulse" />
                  <span>Blockchain-verified authenticity</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-supply-300 rounded-full animate-pulse" />
                  <span>Real-time IoT tracking</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-supply-300 rounded-full animate-pulse" />
                  <span>Complete supply chain transparency</span>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute -top-20 -right-20 w-40 h-40 border border-white/20 rounded-full"
            />
            <motion.div
              animate={{ 
                rotate: -360,
                scale: [1, 0.9, 1]
              }}
              transition={{ 
                duration: 15,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute -bottom-10 -left-10 w-32 h-32 border border-white/20 rounded-full"
            />
          </div>
        </motion.div>

        {/* Right Side - Auth Form */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-20 xl:px-24"
        >
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              {/* Mobile Logo */}
              <div className="lg:hidden text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Pro<span className="text-blockchain-500">Track</span>
                </h1>
              </div>
              
              {children}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
