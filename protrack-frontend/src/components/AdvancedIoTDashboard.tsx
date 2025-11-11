import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Thermometer, 
  Droplets, 
  Zap, 
  MapPin, 
  Shield, 
  AlertTriangle,
  Activity,
  Wifi,
  Battery,
  Settings
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { useEnhancedWeb3 } from '../contexts/EnhancedWeb3Context'

interface IoTDevice {
  deviceId: string
  deviceType: string
  protocol: string
  isActive: boolean
  batteryLevel: number
  lastHeartbeat: number
  currentValue: number
  unit: string
  status: 'normal' | 'warning' | 'critical'
}

interface SensorData {
  timestamp: number
  temperature: number
  humidity: number
  vibration: number
  gps: string
}

const AdvancedIoTDashboard: React.FC = () => {
  const { getIoTDashboard, registerIoTDevice, createAlertRule } = useEnhancedWeb3()
  
  const [devices, setDevices] = useState<IoTDevice[]>([])
  const [sensorData, setSensorData] = useState<SensorData[]>([])
  const [dashboardStats, setDashboardStats] = useState({
    totalDevices: 0,
    activeDevices: 0,
    alertsLast24h: 0,
    dataPointsToday: 0
  })
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
    generateMockData()
    
    const interval = setInterval(() => {
      generateMockData()
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      const stats = await getIoTDashboard()
      setDashboardStats(stats)
    } catch (error) {
      console.error('Error loading dashboard:', error)
    }
  }

  const generateMockData = () => {
    // Mock IoT devices
    const mockDevices: IoTDevice[] = [
      {
        deviceId: 'TEMP_001',
        deviceType: 'temperature',
        protocol: 'LoRa',
        isActive: true,
        batteryLevel: 85,
        lastHeartbeat: Date.now() - 30000,
        currentValue: 22.5 + Math.random() * 5,
        unit: '°C',
        status: 'normal'
      },
      {
        deviceId: 'HUM_002',
        deviceType: 'humidity',
        protocol: 'MQTT',
        isActive: true,
        batteryLevel: 92,
        lastHeartbeat: Date.now() - 15000,
        currentValue: 45 + Math.random() * 20,
        unit: '%',
        status: 'normal'
      },
      {
        deviceId: 'VIB_003',
        deviceType: 'vibration',
        protocol: 'WiFi',
        isActive: false,
        batteryLevel: 12,
        lastHeartbeat: Date.now() - 300000,
        currentValue: 0,
        unit: 'g',
        status: 'critical'
      },
      {
        deviceId: 'GPS_004',
        deviceType: 'gps',
        protocol: 'Cellular',
        isActive: true,
        batteryLevel: 67,
        lastHeartbeat: Date.now() - 60000,
        currentValue: 0,
        unit: 'coords',
        status: 'normal'
      }
    ]

    setDevices(mockDevices)

    // Mock sensor data
    const now = Date.now()
    const newDataPoint: SensorData = {
      timestamp: now,
      temperature: 22.5 + Math.random() * 5,
      humidity: 45 + Math.random() * 20,
      vibration: Math.random() * 10,
      gps: `${(40.7128 + Math.random() * 0.01).toFixed(6)},${(-74.0060 + Math.random() * 0.01).toFixed(6)}`
    }

    setSensorData(prev => [...prev.slice(-20), newDataPoint])
  }

  const getDeviceStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-400 bg-green-400/20'
      case 'warning': return 'text-yellow-400 bg-yellow-400/20'
      case 'critical': return 'text-red-400 bg-red-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const getProtocolIcon = (protocol: string) => {
    switch (protocol) {
      case 'LoRa': return <Zap className="w-4 h-4" />
      case 'MQTT': return <Wifi className="w-4 h-4" />
      case 'WiFi': return <Wifi className="w-4 h-4" />
      case 'Cellular': return <Activity className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <Activity className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Advanced IoT Dashboard</h2>
            <p className="text-gray-400">Real-time monitoring and encrypted sensor data</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Devices', value: dashboardStats.totalDevices, icon: Activity, color: 'blue' },
          { label: 'Active Devices', value: dashboardStats.activeDevices, icon: Wifi, color: 'green' },
          { label: 'Alerts (24h)', value: dashboardStats.alertsLast24h, icon: AlertTriangle, color: 'yellow' },
          { label: 'Data Points', value: dashboardStats.dataPointsToday, icon: Shield, color: 'purple' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`p-3 bg-${stat.color}-500/20 rounded-lg`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Device Grid and Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device List */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-medium text-white mb-4">IoT Devices</h3>
          <div className="space-y-3">
            {devices.map((device) => (
              <motion.div
                key={device.deviceId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-900/50 border border-gray-600 rounded-lg p-4 hover:border-green-500/50 transition-colors cursor-pointer"
                onClick={() => setSelectedDevice(device.deviceId)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {getProtocolIcon(device.protocol)}
                      <span className="text-white font-medium">{device.deviceId}</span>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs ${getDeviceStatusColor(device.status)}`}>
                      {device.status}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Battery className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-300">{device.batteryLevel}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Type:</span>
                    <div className="text-white capitalize">{device.deviceType}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Protocol:</span>
                    <div className="text-white">{device.protocol}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Value:</span>
                    <div className="text-white">
                      {device.currentValue.toFixed(1)} {device.unit}
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-xs text-gray-400">
                  Last seen: {new Date(device.lastHeartbeat).toLocaleTimeString()}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Real-time Charts */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-medium text-white mb-4">Real-time Sensor Data</h3>
          
          <div className="space-y-6">
            {/* Temperature Chart */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Thermometer className="w-4 h-4 text-red-400" />
                <span className="text-sm text-gray-300">Temperature (°C)</span>
              </div>
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={sensorData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                    stroke="#9CA3AF"
                    fontSize={10}
                  />
                  <YAxis stroke="#9CA3AF" fontSize={10} />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleTimeString()}
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="temperature" 
                    stroke="#EF4444" 
                    fill="#EF4444" 
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Humidity Chart */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Droplets className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-300">Humidity (%)</span>
              </div>
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={sensorData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                    stroke="#9CA3AF"
                    fontSize={10}
                  />
                  <YAxis stroke="#9CA3AF" fontSize={10} />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleTimeString()}
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="humidity" 
                    stroke="#3B82F6" 
                    fill="#3B82F6" 
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Rules */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">Alert Rules</h3>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            Add Rule
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { sensor: 'Temperature', min: -20, max: 40, unit: '°C', active: true },
            { sensor: 'Humidity', min: 0, max: 95, unit: '%', active: true },
            { sensor: 'Vibration', min: 0, max: 100, unit: 'g', active: false }
          ].map((rule, index) => (
            <div key={index} className="bg-gray-900/50 border border-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white font-medium">{rule.sensor}</span>
                <div className={`px-2 py-1 rounded-full text-xs ${
                  rule.active ? 'bg-green-400/20 text-green-400' : 'bg-gray-400/20 text-gray-400'
                }`}>
                  {rule.active ? 'Active' : 'Inactive'}
                </div>
              </div>
              <div className="text-sm text-gray-400">
                Range: {rule.min} - {rule.max} {rule.unit}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdvancedIoTDashboard
