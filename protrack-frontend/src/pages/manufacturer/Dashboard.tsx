/**
 * Manufacturer Dashboard
 * Role-specific dashboard for manufacturers
 */

import React from 'react'

interface ManufacturerDashboardProps {
  isDark?: boolean
}

export const ManufacturerDashboard: React.FC<ManufacturerDashboardProps> = ({ isDark = false }) => {
  const bgClass = isDark ? 'bg-gray-800' : 'bg-white'
  const textClass = isDark ? 'text-white' : 'text-gray-900'
  const subTextClass = isDark ? 'text-gray-300' : 'text-gray-600'

  const manufacturerStats = [
    { title: 'Products Created', value: '1,247', change: '+12%', icon: '🏭', color: 'blue' },
    { title: 'Batches Produced', value: '342', change: '+8%', icon: '📦', color: 'green' },
    { title: 'Certificates Uploaded', value: '156', change: '+15%', icon: '📜', color: 'purple' },
    { title: 'Blockchain Proofs', value: '1,198', change: '96.1%', icon: '⛓️', color: 'orange' }
  ]

  const recentActivities = [
    { text: 'New product batch #BT-2024-001 created', time: '2 min ago', color: 'green' },
    { text: 'Certificate uploaded for SKU-2024-456', time: '15 min ago', color: 'blue' },
    { text: 'Blockchain proof minted for batch #BT-2024-002', time: '1 hour ago', color: 'purple' },
    { text: 'Quality check completed for 50 units', time: '2 hours ago', color: 'yellow' }
  ]

  const quickActions = [
    { label: 'Create Product', icon: '🏭', color: 'blue', description: 'Add new product to catalog' },
    { label: 'Upload Certificate', icon: '📜', color: 'green', description: 'Add quality certificates' },
    { label: 'Mint Blockchain Proof', icon: '⛓️', color: 'purple', description: 'Create NFT authenticity proof' },
    { label: 'Generate QR Codes', icon: '📱', color: 'orange', description: 'Batch generate QR codes' }
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className={`text-3xl font-bold ${textClass} mb-2`}>
          Manufacturer Dashboard
        </h1>
        <p className={subTextClass}>
          Manage your product creation, certificates, and blockchain integration
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {manufacturerStats.map((stat, index) => (
          <div key={index} className={`${bgClass} rounded-xl p-6 shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'} hover:shadow-md transition-shadow`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{stat.icon}</span>
              <span className={`text-${stat.color}-600 text-sm font-medium`}>{stat.change}</span>
            </div>
            <h3 className={`text-sm font-medium ${subTextClass} mb-1`}>{stat.title}</h3>
            <p className={`text-3xl font-bold text-${stat.color}-600`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className={`${bgClass} rounded-xl p-6 shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-lg font-semibold ${textClass} mb-4`}>Recent Manufacturing Activities</h3>
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`w-2 h-2 bg-${activity.color}-500 rounded-full`}></div>
                <span className={`flex-1 ${textClass}`}>{activity.text}</span>
                <span className={`text-xs ${subTextClass}`}>{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`${bgClass} rounded-xl p-6 shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-lg font-semibold ${textClass} mb-4`}>Manufacturer Tools</h3>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <button key={index} className={`p-4 border-2 border-dashed ${isDark ? 'border-gray-600 hover:border-blue-500 hover:bg-gray-700' : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'} rounded-lg transition-all text-left`}>
                <div className="text-2xl mb-2">{action.icon}</div>
                <div className={`text-sm font-medium ${textClass} mb-1`}>{action.label}</div>
                <div className={`text-xs ${subTextClass}`}>{action.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Production Pipeline */}
      <div className={`${bgClass} rounded-xl p-6 shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'} mt-6`}>
        <h3 className={`text-lg font-semibold ${textClass} mb-4`}>Production Pipeline</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { stage: 'Design', count: 12, color: 'blue' },
            { stage: 'Production', count: 8, color: 'yellow' },
            { stage: 'Quality Check', count: 15, color: 'orange' },
            { stage: 'Ready to Ship', count: 23, color: 'green' }
          ].map((stage, index) => (
            <div key={index} className={`text-center p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
              <div className={`text-2xl font-bold text-${stage.color}-600 mb-1`}>{stage.count}</div>
              <div className={`text-sm ${subTextClass}`}>{stage.stage}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
