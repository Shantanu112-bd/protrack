import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Cpu, 
  Thermometer, 
  Droplets, 
  Activity, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  Wifi,
  WifiOff,
  Settings,
  Plus,
  MapPin,
  Battery,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { formatDate } from '../../lib/utils'

// Mock IoT device data
const mockDevices = [
  {
    id: 'IOT-001',
    name: 'Temperature Sensor A',
    type: 'temperature',
    location: 'Warehouse A - Section 1',
    status: 'online',
    lastReading: 22.5,
    unit: '°C',
    threshold: { min: 18, max: 25 },
    battery: 85,
    lastUpdate: '2024-01-19T16:45:00Z'
  },
  {
    id: 'IOT-002',
    name: 'Humidity Monitor B',
    type: 'humidity',
    location: 'Warehouse A - Section 2',
    status: 'online',
    lastReading: 45,
    unit: '%',
    threshold: { min: 40, max: 60 },
    battery: 92,
    lastUpdate: '2024-01-19T16:44:00Z'
  },
  {
    id: 'IOT-003',
    name: 'Vibration Detector C',
    type: 'vibration',
    location: 'Transport Vehicle #123',
    status: 'alert',
    lastReading: 8.2,
    unit: 'g',
    threshold: { min: 0, max: 5 },
    battery: 67,
    lastUpdate: '2024-01-19T16:43:00Z'
  },
  {
    id: 'IOT-004',
    name: 'Light Sensor D',
    type: 'light',
    location: 'Storage Room B',
    status: 'offline',
    lastReading: 0,
    unit: 'lux',
    threshold: { min: 0, max: 100 },
    battery: 12,
    lastUpdate: '2024-01-19T14:20:00Z'
  }
]

// Mock sensor data for charts
const generateMockData = (hours: number) => {
  const data = []
  const now = new Date()
  
  for (let i = hours; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000)
    data.push({
      time: time.toISOString(),
      temperature: 20 + Math.random() * 8,
      humidity: 40 + Math.random() * 20,
      vibration: Math.random() * 3,
      light: Math.random() * 80
    })
  }
  
  return data
}

const sensorData = generateMockData(24)

const getStatusColor = (status: string) => {
  switch (status) {
    case 'online':
      return 'text-green-500'
    case 'alert':
      return 'text-red-500'
    case 'offline':
      return 'text-gray-400'
    default:
      return 'text-gray-400'
  }
}

const getStatusBg = (status: string) => {
  switch (status) {
    case 'online':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
    case 'alert':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    case 'offline':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
  }
}

const getSensorIcon = (type: string) => {
  switch (type) {
    case 'temperature':
      return Thermometer
    case 'humidity':
      return Droplets
    case 'vibration':
      return Activity
    case 'light':
      return Zap
    default:
      return Cpu
  }
}

export const IoTDashboard: React.FC = () => {
  const [selectedDevice, setSelectedDevice] = useState(mockDevices[0])
  const [realTimeData, setRealTimeData] = useState(sensorData)

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => {
        const newData = [...prev.slice(1)]
        const lastPoint = prev[prev.length - 1]
        const now = new Date()
        
        newData.push({
          time: now.toISOString(),
          temperature: Math.max(15, Math.min(30, lastPoint.temperature + (Math.random() - 0.5) * 2)),
          humidity: Math.max(30, Math.min(70, lastPoint.humidity + (Math.random() - 0.5) * 5)),
          vibration: Math.max(0, Math.min(10, lastPoint.vibration + (Math.random() - 0.5) * 1)),
          light: Math.max(0, Math.min(100, lastPoint.light + (Math.random() - 0.5) * 10))
        })
        
        return newData
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const onlineDevices = mockDevices.filter(d => d.status === 'online').length
  const alertDevices = mockDevices.filter(d => d.status === 'alert').length
  const offlineDevices = mockDevices.filter(d => d.status === 'offline').length

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">IoT Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor real-time sensor data and device status across your supply chain
          </p>
        </div>
        <button className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-blockchain-600 text-white rounded-lg hover:bg-blockchain-700 transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Add Device
        </button>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Devices</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{mockDevices.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-blockchain-100 dark:bg-blockchain-900/20">
              <Cpu className="w-6 h-6 text-blockchain-600 dark:text-blockchain-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Online</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{onlineDevices}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Alerts</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{alertDevices}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/20">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Offline</p>
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-400 mt-1">{offlineDevices}</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
              <WifiOff className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="lg:col-span-1"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              IoT Devices
            </h3>
            <div className="space-y-3">
              {mockDevices.map((device) => {
                const SensorIcon = getSensorIcon(device.type)
                return (
                  <div
                    key={device.id}
                    onClick={() => setSelectedDevice(device)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedDevice.id === device.id
                        ? 'border-blockchain-500 bg-blockchain-50 dark:bg-blockchain-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <SensorIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                            {device.name}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {device.id}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {device.status === 'online' ? (
                          <Wifi className={`w-4 h-4 ${getStatusColor(device.status)}`} />
                        ) : (
                          <WifiOff className={`w-4 h-4 ${getStatusColor(device.status)}`} />
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Status:</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBg(device.status)}`}>
                          {device.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Reading:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {device.lastReading} {device.unit}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Battery:</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                            <div
                              className={`h-1 rounded-full ${device.battery > 20 ? 'bg-green-500' : 'bg-red-500'}`}
                              style={{ width: `${device.battery}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600 dark:text-gray-400">{device.battery}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* Real-time Charts */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Temperature Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Thermometer className="w-5 h-5 mr-2 text-red-500" />
                Temperature Monitoring
              </h3>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {realTimeData[realTimeData.length - 1]?.temperature.toFixed(1)}°C
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={realTimeData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="time" 
                    tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    labelFormatter={(time) => formatDate(time)}
                    formatter={(value: number) => [`${value.toFixed(1)}°C`, 'Temperature']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="temperature" 
                    stroke="#ef4444" 
                    fill="#ef4444" 
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Humidity Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Droplets className="w-5 h-5 mr-2 text-blue-500" />
                Humidity Monitoring
              </h3>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {realTimeData[realTimeData.length - 1]?.humidity.toFixed(1)}%
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={realTimeData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="time" 
                    tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    labelFormatter={(time) => formatDate(time)}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Humidity']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="humidity" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
