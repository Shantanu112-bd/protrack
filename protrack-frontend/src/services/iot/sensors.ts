/**
 * IoT Sensors Service
 * Handles IoT device communication and sensor data
 */

import { apiClient, ApiResponse } from '../api/client'

export interface SensorReading {
  id: string
  deviceId: string
  sensorType: 'temperature' | 'humidity' | 'vibration' | 'location' | 'light'
  value: number
  unit: string
  timestamp: Date
  productId?: string
  shipmentId?: string
}

export interface IoTDevice {
  id: string
  name: string
  type: 'sensor' | 'tracker' | 'monitor'
  status: 'online' | 'offline' | 'maintenance'
  location?: {
    latitude: number
    longitude: number
  }
  batteryLevel?: number
  lastSeen: Date
  assignedProductId?: string
}

export interface SensorAlert {
  id: string
  deviceId: string
  alertType: 'threshold_exceeded' | 'device_offline' | 'battery_low' | 'tampering'
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: Date
  acknowledged: boolean
}

class IoTService {
  async getDevices(): Promise<ApiResponse<IoTDevice[]>> {
    return apiClient.get<IoTDevice[]>('/iot/devices')
  }

  async getDevice(deviceId: string): Promise<ApiResponse<IoTDevice>> {
    return apiClient.get<IoTDevice>(`/iot/devices/${deviceId}`)
  }

  async registerDevice(device: Omit<IoTDevice, 'id' | 'lastSeen'>): Promise<ApiResponse<IoTDevice>> {
    return apiClient.post<IoTDevice>('/iot/devices', device)
  }

  async updateDevice(deviceId: string, updates: Partial<IoTDevice>): Promise<ApiResponse<IoTDevice>> {
    return apiClient.put<IoTDevice>(`/iot/devices/${deviceId}`, updates)
  }

  async getSensorReadings(
    deviceId: string,
    options?: {
      startDate?: Date
      endDate?: Date
      sensorType?: string
      limit?: number
    }
  ): Promise<ApiResponse<SensorReading[]>> {
    const params = new URLSearchParams()
    
    if (options) {
      if (options.startDate) params.append('startDate', options.startDate.toISOString())
      if (options.endDate) params.append('endDate', options.endDate.toISOString())
      if (options.sensorType) params.append('sensorType', options.sensorType)
      if (options.limit) params.append('limit', options.limit.toString())
    }

    const endpoint = `/iot/devices/${deviceId}/readings${params.toString() ? `?${params.toString()}` : ''}`
    return apiClient.get<SensorReading[]>(endpoint)
  }

  async addSensorReading(reading: Omit<SensorReading, 'id' | 'timestamp'>): Promise<ApiResponse<SensorReading>> {
    return apiClient.post<SensorReading>('/iot/readings', reading)
  }

  async getAlerts(options?: {
    deviceId?: string
    severity?: string
    acknowledged?: boolean
  }): Promise<ApiResponse<SensorAlert[]>> {
    const params = new URLSearchParams()
    
    if (options) {
      if (options.deviceId) params.append('deviceId', options.deviceId)
      if (options.severity) params.append('severity', options.severity)
      if (options.acknowledged !== undefined) params.append('acknowledged', options.acknowledged.toString())
    }

    const endpoint = `/iot/alerts${params.toString() ? `?${params.toString()}` : ''}`
    return apiClient.get<SensorAlert[]>(endpoint)
  }

  async acknowledgeAlert(alertId: string): Promise<ApiResponse<SensorAlert>> {
    return apiClient.put<SensorAlert>(`/iot/alerts/${alertId}/acknowledge`)
  }

  async getRealtimeData(deviceId: string): Promise<EventSource> {
    const token = localStorage.getItem('auth_token')
    const url = `/iot/devices/${deviceId}/stream${token ? `?token=${token}` : ''}`
    
    return new EventSource(url)
  }

  // Simulate sensor data for development
  generateMockSensorData(deviceId: string, sensorType: SensorReading['sensorType']): SensorReading {
    const mockData: Record<SensorReading['sensorType'], { value: number; unit: string }> = {
      temperature: { value: Math.random() * 30 + 10, unit: '°C' },
      humidity: { value: Math.random() * 60 + 20, unit: '%' },
      vibration: { value: Math.random() * 10, unit: 'g' },
      location: { value: Math.random() * 180 - 90, unit: 'degrees' },
      light: { value: Math.random() * 1000, unit: 'lux' }
    }

    const data = mockData[sensorType]
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      deviceId,
      sensorType,
      value: data.value,
      unit: data.unit,
      timestamp: new Date()
    }
  }
}

export const iotService = new IoTService()
