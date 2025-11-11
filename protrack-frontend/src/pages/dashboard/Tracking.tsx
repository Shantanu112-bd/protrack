import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  MapPin, 
  Truck, 
  Package, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Navigation,
  Thermometer,
  Droplets,
  Activity
} from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { formatDate } from '../../lib/utils'

// Mock tracking data
const mockShipments = [
  {
    id: 'SH-001',
    productName: 'Organic Coffee Beans',
    batch: 'BT-2024-001',
    status: 'in_transit',
    origin: 'Green Valley Farms',
    destination: 'Distribution Center A',
    currentLocation: { lat: 40.7128, lng: -74.0060, name: 'New York, NY' },
    estimatedArrival: '2024-01-20T14:30:00Z',
    progress: 65,
    temperature: 22.5,
    humidity: 45,
    route: [
      { lat: 40.7589, lng: -73.9851 },
      { lat: 40.7505, lng: -73.9934 },
      { lat: 40.7128, lng: -74.0060 }
    ],
    events: [
      { time: '2024-01-18T08:00:00Z', event: 'Shipment departed', location: 'Green Valley Farms' },
      { time: '2024-01-18T14:30:00Z', event: 'Temperature check passed', location: 'Checkpoint A' },
      { time: '2024-01-19T09:15:00Z', event: 'Customs cleared', location: 'Border Control' },
      { time: '2024-01-19T16:45:00Z', event: 'In transit', location: 'Highway 95' }
    ]
  },
  {
    id: 'SH-002',
    productName: 'Premium Tea Leaves',
    batch: 'BT-2024-002',
    status: 'delivered',
    origin: 'Mountain Tea Gardens',
    destination: 'Retail Store B',
    currentLocation: { lat: 34.0522, lng: -118.2437, name: 'Los Angeles, CA' },
    estimatedArrival: '2024-01-19T10:00:00Z',
    progress: 100,
    temperature: 18.2,
    humidity: 38,
    route: [
      { lat: 37.7749, lng: -122.4194 },
      { lat: 36.7783, lng: -119.4179 },
      { lat: 34.0522, lng: -118.2437 }
    ],
    events: [
      { time: '2024-01-17T06:00:00Z', event: 'Shipment departed', location: 'Mountain Tea Gardens' },
      { time: '2024-01-18T12:00:00Z', event: 'Quality inspection passed', location: 'QA Facility' },
      { time: '2024-01-19T10:00:00Z', event: 'Delivered successfully', location: 'Retail Store B' }
    ]
  }
]

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  in_transit: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  delayed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
}

export const Tracking: React.FC = () => {
  const [selectedShipment, setSelectedShipment] = useState(mockShipments[0])
  const [mapCenter] = useState([40.7128, -74.0060])

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">GPS Tracking</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Real-time tracking of shipments with GPS and IoT sensor data
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shipments List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Active Shipments
            </h3>
            <div className="space-y-3">
              {mockShipments.map((shipment) => (
                <div
                  key={shipment.id}
                  onClick={() => setSelectedShipment(shipment)}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedShipment.id === shipment.id
                      ? 'border-blockchain-500 bg-blockchain-50 dark:bg-blockchain-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                        {shipment.productName}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {shipment.id} • {shipment.batch}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[shipment.status as keyof typeof statusColors]}`}>
                      {shipment.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                      <MapPin className="w-3 h-3 mr-1" />
                      {shipment.currentLocation.name}
                    </div>
                    
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blockchain-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${shipment.progress}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{shipment.progress}% complete</span>
                      <span>ETA: {formatDate(shipment.estimatedArrival)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Map and Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Map */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Live Tracking Map
              </h3>
              <div className="flex items-center space-x-2">
                <Navigation className="w-4 h-4 text-blockchain-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedShipment.currentLocation.name}
                </span>
              </div>
            </div>
            
            <div className="h-80 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
              <MapContainer
                center={mapCenter as [number, number]}
                zoom={10}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {/* Route polyline */}
                <Polyline
                  positions={selectedShipment.route as [number, number][]}
                  color="#3b82f6"
                  weight={4}
                  opacity={0.7}
                />
                
                {/* Current location marker */}
                <Marker position={[selectedShipment.currentLocation.lat, selectedShipment.currentLocation.lng]}>
                  <Popup>
                    <div className="text-center">
                      <strong>{selectedShipment.productName}</strong><br />
                      Current Location: {selectedShipment.currentLocation.name}<br />
                      Status: {selectedShipment.status}
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>

          {/* Shipment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* IoT Sensor Data */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-supply-500" />
                IoT Sensor Data
              </h4>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center">
                    <Thermometer className="w-5 h-5 text-blue-500 mr-2" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Temperature</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {selectedShipment.temperature}°C
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center">
                    <Droplets className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Humidity</span>
                  </div>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {selectedShipment.humidity}%
                  </span>
                </div>
                
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Progress</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{selectedShipment.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-blockchain-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${selectedShipment.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Shipment Events */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-purple-500" />
                Shipment Events
              </h4>
              
              <div className="space-y-3">
                {selectedShipment.events.map((event, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blockchain-500 rounded-full mt-2" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {event.event}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(event.time)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {event.location}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
