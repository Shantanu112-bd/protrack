import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { useWeb3 } from '../contexts/Web3Context'
import IoTOracleService, { SensorReading, GPSLocation, SensorAlert } from '../services/IoTOracleService'

interface IoTDashboardProps {
  tokenId?: number
  isDark?: boolean
}

const IoTDashboard: React.FC<IoTDashboardProps> = ({ tokenId, isDark = false }) => {
  const { isConnected, oracleContract } = useWeb3()
  const [sensorData, setSensorData] = useState<SensorReading[]>([])
  const [gpsHistory, setGpsHistory] = useState<GPSLocation[]>([])
  const [alerts, setAlerts] = useState<SensorAlert[]>([])
  const [selectedTokenId, setSelectedTokenId] = useState<number>(tokenId || 1)
  const [isLoading, setIsLoading] = useState(false)
  const [simulationActive, setSimulationActive] = useState(false)

  useEffect(() => {
    if (oracleContract) {
      IoTOracleService.initializeContracts(
        oracleContract.options.address,
        oracleContract.options.jsonInterface,
        '', // Supply chain address would be passed here
        []
      )
    }
  }, [oracleContract])

  useEffect(() => {
    // Add alert listener
    const handleAlert = (alert: SensorAlert) => {
      setAlerts(prev => [alert, ...prev].slice(0, 10)) // Keep only last 10 alerts
    }

    IoTOracleService.addAlertListener(handleAlert)
    
    return () => {
      IoTOracleService.removeAlertListener(handleAlert)
    }
  }, [])

  useEffect(() => {
    if (selectedTokenId) {
      loadSensorData()
    }
  }, [selectedTokenId])

  const loadSensorData = async () => {
    setIsLoading(true)
    try {
      const [sensorReadings, gpsData] = await Promise.all([
        IoTOracleService.getTokenSensorData(selectedTokenId),
        IoTOracleService.getTokenGPSHistory(selectedTokenId)
      ])
      
      setSensorData(sensorReadings)
      setGpsHistory(gpsData)
    } catch (error) {
      console.error('Failed to load sensor data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const startSimulation = () => {
    setSimulationActive(true)
    IoTOracleService.simulateDeviceData(`device-${selectedTokenId}`, selectedTokenId)
  }

  const stopSimulation = () => {
    setSimulationActive(false)
    IoTOracleService.disconnectAllDevices()
  }

  const acknowledgeAlert = (index: number) => {
    setAlerts(prev => prev.map((alert, i) => 
      i === index ? { ...alert, acknowledged: true } : alert
    ))
  }

  // Process sensor data for charts
  const temperatureData = sensorData
    .filter(reading => reading.sensorType === 'temperature')
    .map(reading => ({
      timestamp: new Date(reading.timestamp).toLocaleTimeString(),
      value: reading.value,
      time: reading.timestamp
    }))
    .sort((a, b) => a.time - b.time)
    .slice(-20) // Last 20 readings

  const humidityData = sensorData
    .filter(reading => reading.sensorType === 'humidity')
    .map(reading => ({
      timestamp: new Date(reading.timestamp).toLocaleTimeString(),
      value: reading.value,
      time: reading.timestamp
    }))
    .sort((a, b) => a.time - b.time)
    .slice(-20)

  const vibrationData = sensorData
    .filter(reading => reading.sensorType === 'vibration')
    .map(reading => ({
      timestamp: new Date(reading.timestamp).toLocaleTimeString(),
      value: reading.value,
      time: reading.timestamp
    }))
    .sort((a, b) => a.time - b.time)
    .slice(-20)

  // Get latest sensor values
  const latestTemperature = temperatureData[temperatureData.length - 1]?.value || 0
  const latestHumidity = humidityData[humidityData.length - 1]?.value || 0
  const latestVibration = vibrationData[vibrationData.length - 1]?.value || 0
  const latestGPS = gpsHistory[gpsHistory.length - 1]

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            IoT Sensor Dashboard
          </h1>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
            Real-time monitoring of product conditions and location
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Product Token ID
            </label>
            <input
              type="number"
              value={selectedTokenId}
              onChange={(e) => setSelectedTokenId(parseInt(e.target.value) || 1)}
              className={`px-3 py-2 rounded-lg border ${
                isDark 
                  ? 'bg-gray-800 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              min="1"
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={simulationActive ? stopSimulation : startSimulation}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                simulationActive
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {simulationActive ? 'Stop Simulation' : 'Start Simulation'}
            </button>
            
            <button
              onClick={loadSensorData}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Blockchain Connection: {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${simulationActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              IoT Simulation: {simulationActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Current Values Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Temperature
              </p>
              <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {latestTemperature.toFixed(1)}°C
              </p>
            </div>
            <div className={`p-3 rounded-full ${
              latestTemperature < -20 || latestTemperature > 40 
                ? 'bg-red-100 text-red-600' 
                : 'bg-blue-100 text-blue-600'
            }`}>
              🌡️
            </div>
          </div>
          <div className={`mt-2 text-sm ${
            latestTemperature < -20 || latestTemperature > 40 
              ? 'text-red-600' 
              : 'text-green-600'
          }`}>
            {latestTemperature < -20 || latestTemperature > 40 ? 'Out of range' : 'Normal range'}
          </div>
        </div>

        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Humidity
              </p>
              <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {latestHumidity.toFixed(1)}%
              </p>
            </div>
            <div className={`p-3 rounded-full ${
              latestHumidity < 0 || latestHumidity > 95 
                ? 'bg-red-100 text-red-600' 
                : 'bg-blue-100 text-blue-600'
            }`}>
              💧
            </div>
          </div>
          <div className={`mt-2 text-sm ${
            latestHumidity < 0 || latestHumidity > 95 
              ? 'text-red-600' 
              : 'text-green-600'
          }`}>
            {latestHumidity < 0 || latestHumidity > 95 ? 'Out of range' : 'Normal range'}
          </div>
        </div>

        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Vibration
              </p>
              <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {latestVibration.toFixed(0)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${
              latestVibration > 100 
                ? 'bg-red-100 text-red-600' 
                : 'bg-green-100 text-green-600'
            }`}>
              📳
            </div>
          </div>
          <div className={`mt-2 text-sm ${
            latestVibration > 100 
              ? 'text-red-600' 
              : 'text-green-600'
          }`}>
            {latestVibration > 100 ? 'High vibration' : 'Normal'}
          </div>
        </div>

        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Location
              </p>
              <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {latestGPS ? `${latestGPS.latitude.toFixed(4)}, ${latestGPS.longitude.toFixed(4)}` : 'No GPS data'}
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              📍
            </div>
          </div>
          <div className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {latestGPS ? `Accuracy: ${latestGPS.accuracy}m` : 'GPS not available'}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature Chart */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
            Temperature Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={temperatureData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
              <XAxis 
                dataKey="timestamp" 
                stroke={isDark ? '#9ca3af' : '#6b7280'}
                fontSize={12}
              />
              <YAxis 
                stroke={isDark ? '#9ca3af' : '#6b7280'}
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: isDark ? '#1f2937' : '#ffffff',
                  border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  color: isDark ? '#ffffff' : '#000000'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                name="Temperature (°C)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Humidity Chart */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
            Humidity Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={humidityData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
              <XAxis 
                dataKey="timestamp" 
                stroke={isDark ? '#9ca3af' : '#6b7280'}
                fontSize={12}
              />
              <YAxis 
                stroke={isDark ? '#9ca3af' : '#6b7280'}
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: isDark ? '#1f2937' : '#ffffff',
                  border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  color: isDark ? '#ffffff' : '#000000'
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#10b981" 
                fill="#10b981"
                fillOpacity={0.3}
                strokeWidth={2}
                name="Humidity (%)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vibration Chart */}
      <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
          Vibration Levels
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={vibrationData}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
            <XAxis 
              dataKey="timestamp" 
              stroke={isDark ? '#9ca3af' : '#6b7280'}
              fontSize={12}
            />
            <YAxis 
              stroke={isDark ? '#9ca3af' : '#6b7280'}
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                borderRadius: '8px',
                color: isDark ? '#ffffff' : '#000000'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#f59e0b" 
              strokeWidth={2}
              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
              name="Vibration Level"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Alerts Panel */}
      {alerts.length > 0 && (
        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
            Recent Alerts
          </h3>
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  alert.severity === 'critical' 
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : alert.severity === 'high'
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : alert.severity === 'medium'
                    ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                    : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                } ${alert.acknowledged ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`font-semibold ${
                        alert.severity === 'critical' ? 'text-red-700 dark:text-red-300' :
                        alert.severity === 'high' ? 'text-orange-700 dark:text-orange-300' :
                        alert.severity === 'medium' ? 'text-yellow-700 dark:text-yellow-300' :
                        'text-blue-700 dark:text-blue-300'
                      }`}>
                        {alert.alertType.replace('_', ' ')}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        alert.severity === 'critical' ? 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200' :
                        alert.severity === 'high' ? 'bg-orange-200 text-orange-800 dark:bg-orange-800 dark:text-orange-200' :
                        alert.severity === 'medium' ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200' :
                        'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200'
                      }`}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {alert.message}
                    </p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                  
                  {!alert.acknowledged && (
                    <button
                      onClick={() => acknowledgeAlert(index)}
                      className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default IoTDashboard
