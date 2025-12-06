/**
 * IoT Oracle Service
 * Handles IoT sensor data collection, validation, and blockchain submission
 */

import Web3 from 'web3'
import { Contract } from 'web3-eth-contract'

export interface SensorReading {
  deviceId: string
  tokenId: number
  sensorType: 'temperature' | 'humidity' | 'vibration' | 'gps' | 'tamper'
  value: number
  unit: string
  gpsCoordinates?: string
  timestamp: number
  dataHash: string
}

export interface GPSLocation {
  latitude: number
  longitude: number
  altitude?: number
  accuracy: number
  timestamp: number
  address?: string
}

export interface IoTDevice {
  deviceId: string
  deviceAddress: string
  deviceType: string
  isActive: boolean
  lastUpdate: number
  assignedTokenId?: number
}

export interface SensorAlert {
  tokenId: number
  alertType: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: number
  acknowledged: boolean
}

class IoTOracleService {
  private web3: Web3 | null = null
  private oracleContract: Contract | null = null
  private supplyChainContract: Contract | null = null
  private deviceConnections: Map<string, WebSocket> = new Map()
  private sensorDataBuffer: SensorReading[] = []
  private alertListeners: ((alert: SensorAlert) => void)[] = []

  constructor() {
    this.initializeWeb3()
    this.startDataProcessing()
  }

  private async initializeWeb3() {
    if (typeof window.ethereum !== 'undefined') {
      this.web3 = new Web3(window.ethereum)
    }
  }

  /**
   * Initialize oracle contract connection
   */
  public async initializeContracts(
    oracleAddress: string,
    oracleAbi: any,
    supplyChainAddress: string,
    supplyChainAbi: any
  ) {
    if (!this.web3) {
      throw new Error('Web3 not initialized')
    }

    this.oracleContract = new this.web3.eth.Contract(oracleAbi, oracleAddress)
    this.supplyChainContract = new this.web3.eth.Contract(supplyChainAbi, supplyChainAddress)
  }

  /**
   * Register a new IoT device
   */
  public async registerDevice(
    deviceAddress: string,
    deviceId: string,
    deviceType: string,
    fromAddress: string
  ): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    if (!this.oracleContract) {
      throw new Error('Oracle contract not initialized')
    }

    try {
      const transaction = await this.oracleContract.methods
        .registerIoTDevice(deviceAddress, deviceId, deviceType)
        .send({ from: fromAddress })

      return {
        success: true,
        transactionHash: transaction.transactionHash
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Connect to IoT device via WebSocket
   */
  public async connectToDevice(deviceId: string, websocketUrl: string): Promise<void> {
    if (this.deviceConnections.has(deviceId)) {
      this.deviceConnections.get(deviceId)?.close()
    }

    const ws = new WebSocket(websocketUrl)

    ws.onopen = () => {
      console.log(`Connected to IoT device: ${deviceId}`)
      // Send authentication message
      ws.send(JSON.stringify({
        type: 'auth',
        deviceId: deviceId,
        timestamp: Date.now()
      }))
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        this.handleDeviceMessage(deviceId, data)
      } catch (error) {
        console.error('Failed to parse device message:', error)
      }
    }

    ws.onclose = () => {
      console.log(`Disconnected from IoT device: ${deviceId}`)
      this.deviceConnections.delete(deviceId)
      // Attempt reconnection after 5 seconds
      setTimeout(() => {
        this.connectToDevice(deviceId, websocketUrl)
      }, 5000)
    }

    ws.onerror = (error) => {
      console.error(`IoT device connection error (${deviceId}):`, error)
    }

    this.deviceConnections.set(deviceId, ws)
  }

  /**
   * Handle incoming message from IoT device
   */
  private handleDeviceMessage(deviceId: string, data: any) {
    switch (data.type) {
      case 'sensor_reading':
        this.processSensorReading(deviceId, data)
        break
      case 'gps_update':
        this.processGPSUpdate(deviceId, data)
        break
      case 'alert':
        this.processAlert(deviceId, data)
        break
      case 'heartbeat':
        this.processHeartbeat(deviceId, data)
        break
      default:
        console.warn(`Unknown message type from device ${deviceId}:`, data.type)
    }
  }

  /**
   * Process sensor reading from IoT device
   */
  private async processSensorReading(deviceId: string, data: any) {
    const reading: SensorReading = {
      deviceId,
      tokenId: data.tokenId,
      sensorType: data.sensorType,
      value: data.value,
      unit: data.unit,
      gpsCoordinates: data.gpsCoordinates,
      timestamp: data.timestamp || Date.now(),
      dataHash: this.generateDataHash(data)
    }

    // Validate reading
    if (this.validateSensorReading(reading)) {
      this.sensorDataBuffer.push(reading)
      
      // Check for immediate alerts
      this.checkForAlerts(reading)
    } else {
      console.warn('Invalid sensor reading received:', reading)
    }
  }

  /**
   * Process GPS update from IoT device
   */
  private async processGPSUpdate(deviceId: string, data: any) {
    const location: GPSLocation = {
      latitude: data.latitude,
      longitude: data.longitude,
      altitude: data.altitude,
      accuracy: data.accuracy,
      timestamp: data.timestamp || Date.now(),
      address: data.address
    }

    // Submit GPS data to oracle contract
    if (this.oracleContract && data.tokenId) {
      try {
        await this.submitGPSUpdate(data.tokenId, location)
      } catch (error) {
        console.error('Failed to submit GPS update:', error)
      }
    }
  }

  /**
   * Process alert from IoT device
   */
  private processAlert(deviceId: string, data: any) {
    const alert: SensorAlert = {
      tokenId: data.tokenId,
      alertType: data.alertType,
      message: data.message,
      severity: data.severity || 'medium',
      timestamp: data.timestamp || Date.now(),
      acknowledged: false
    }

    // Notify alert listeners
    this.alertListeners.forEach(listener => listener(alert))
  }

  /**
   * Process heartbeat from IoT device
   */
  private processHeartbeat(deviceId: string, data: any) {
    console.log(`Heartbeat received from device ${deviceId}:`, data.timestamp)
  }

  /**
   * Submit sensor data to blockchain
   */
  public async submitSensorData(
    reading: SensorReading,
    fromAddress: string
  ): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    if (!this.oracleContract) {
      throw new Error('Oracle contract not initialized')
    }

    try {
      const transaction = await this.oracleContract.methods
        .submitSensorData(
          reading.deviceId,
          reading.tokenId,
          reading.sensorType,
          reading.value,
          reading.unit,
          reading.gpsCoordinates || '',
          reading.dataHash
        )
        .send({ from: fromAddress })

      return {
        success: true,
        transactionHash: transaction.transactionHash
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Submit GPS update to blockchain
   */
  public async submitGPSUpdate(
    tokenId: number,
    location: GPSLocation
  ): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    if (!this.oracleContract || !this.web3) {
      throw new Error('Oracle contract not initialized')
    }

    try {
      const accounts = await this.web3.eth.getAccounts()
      const fromAddress = accounts[0]

      const transaction = await this.oracleContract.methods
        .updateGPSLocation(
          tokenId,
          location.latitude.toString(),
          location.longitude.toString(),
          location.address || '',
          location.accuracy
        )
        .send({ from: fromAddress })

      return {
        success: true,
        transactionHash: transaction.transactionHash
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Batch submit multiple sensor readings
   */
  public async batchSubmitSensorData(
    readings: SensorReading[],
    fromAddress: string
  ): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    if (!this.oracleContract) {
      throw new Error('Oracle contract not initialized')
    }

    const deviceIds = readings.map(r => r.deviceId)
    const tokenIds = readings.map(r => r.tokenId)
    const sensorTypes = readings.map(r => r.sensorType)
    const values = readings.map(r => r.value)
    const units = readings.map(r => r.unit)
    const gpsCoordinates = readings.map(r => r.gpsCoordinates || '')
    const dataHashes = readings.map(r => r.dataHash)

    try {
      const transaction = await this.oracleContract.methods
        .batchSubmitSensorData(
          deviceIds,
          tokenIds,
          sensorTypes,
          values,
          units,
          gpsCoordinates,
          dataHashes
        )
        .send({ from: fromAddress })

      return {
        success: true,
        transactionHash: transaction.transactionHash
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Get sensor data for a token
   */
  public async getTokenSensorData(tokenId: number): Promise<SensorReading[]> {
    if (!this.oracleContract) {
      throw new Error('Oracle contract not initialized')
    }

    try {
      const data = await this.oracleContract.methods
        .getTokenSensorData(tokenId)
        .call()

      return data.map((reading: any) => ({
        deviceId: reading.deviceId,
        tokenId: parseInt(reading.tokenId),
        sensorType: reading.sensorType,
        value: parseInt(reading.value),
        unit: reading.unit,
        gpsCoordinates: reading.gpsCoordinates,
        timestamp: parseInt(reading.timestamp),
        dataHash: reading.dataHash
      }))
    } catch (error) {
      console.error('Failed to get sensor data:', error)
      return []
    }
  }

  /**
   * Get GPS history for a token
   */
  public async getTokenGPSHistory(tokenId: number): Promise<GPSLocation[]> {
    if (!this.oracleContract) {
      throw new Error('Oracle contract not initialized')
    }

    try {
      const history = await this.oracleContract.methods
        .getTokenGPSHistory(tokenId)
        .call()

      return history.map((location: any) => ({
        latitude: parseFloat(location.latitude),
        longitude: parseFloat(location.longitude),
        accuracy: parseInt(location.accuracy),
        timestamp: parseInt(location.timestamp),
        address: location.address_location
      }))
    } catch (error) {
      console.error('Failed to get GPS history:', error)
      return []
    }
  }

  /**
   * Start periodic data processing
   */
  private startDataProcessing() {
    setInterval(() => {
      this.processSensorDataBuffer()
    }, 10000) // Process every 10 seconds
  }

  /**
   * Process buffered sensor data
   */
  private async processSensorDataBuffer() {
    if (this.sensorDataBuffer.length === 0) {
      return
    }

    const batch = this.sensorDataBuffer.splice(0, 10) // Process up to 10 readings at once

    if (this.web3) {
      try {
        const accounts = await this.web3.eth.getAccounts()
        if (accounts.length > 0) {
          await this.batchSubmitSensorData(batch, accounts[0])
        }
      } catch (error) {
        console.error('Failed to process sensor data batch:', error)
        // Re-add failed batch to buffer
        this.sensorDataBuffer.unshift(...batch)
      }
    }
  }

  /**
   * Validate sensor reading
   */
  private validateSensorReading(reading: SensorReading): boolean {
    // Basic validation
    if (!reading.deviceId || !reading.sensorType || reading.tokenId <= 0) {
      return false
    }

    // Validate sensor value ranges
    switch (reading.sensorType) {
      case 'temperature':
        return reading.value >= -50 && reading.value <= 100
      case 'humidity':
        return reading.value >= 0 && reading.value <= 100
      case 'vibration':
        return reading.value >= 0 && reading.value <= 1000
      case 'tamper':
        return reading.value >= 0 && reading.value <= 1
      default:
        return true
    }
  }

  /**
   * Generate data hash for integrity verification
   */
  private generateDataHash(data: any): string {
    if (!this.web3) {
      return `0x${Math.random().toString(16).substring(2, 66)}`
    }

    const dataString = JSON.stringify({
      deviceId: data.deviceId,
      tokenId: data.tokenId,
      sensorType: data.sensorType,
      value: data.value,
      unit: data.unit,
      gpsCoordinates: data.gpsCoordinates,
      timestamp: data.timestamp
    })

    return this.web3.utils.keccak256(dataString)
  }

  /**
   * Check for alerts based on sensor readings
   */
  private checkForAlerts(reading: SensorReading) {
    let alertType: string | null = null
    let message: string | null = null
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'

    switch (reading.sensorType) {
      case 'temperature':
        if (reading.value < -20 || reading.value > 40) {
          alertType = 'TEMPERATURE_ALERT'
          message = `Temperature ${reading.value}°C is outside safe range (-20°C to 40°C)`
          severity = reading.value < -30 || reading.value > 50 ? 'critical' : 'high'
        }
        break
      case 'humidity':
        if (reading.value < 0 || reading.value > 95) {
          alertType = 'HUMIDITY_ALERT'
          message = `Humidity ${reading.value}% is outside safe range (0% to 95%)`
          severity = 'medium'
        }
        break
      case 'vibration':
        if (reading.value > 100) {
          alertType = 'VIBRATION_ALERT'
          message = `Excessive vibration detected: ${reading.value}`
          severity = reading.value > 200 ? 'critical' : 'high'
        }
        break
      case 'tamper':
        if (reading.value > 0) {
          alertType = 'TAMPER_ALERT'
          message = 'Product tampering detected'
          severity = 'critical'
        }
        break
    }

    if (alertType && message) {
      const alert: SensorAlert = {
        tokenId: reading.tokenId,
        alertType,
        message,
        severity,
        timestamp: reading.timestamp,
        acknowledged: false
      }

      this.alertListeners.forEach(listener => listener(alert))
    }
  }

  /**
   * Add alert listener
   */
  public addAlertListener(listener: (alert: SensorAlert) => void) {
    this.alertListeners.push(listener)
  }

  /**
   * Remove alert listener
   */
  public removeAlertListener(listener: (alert: SensorAlert) => void) {
    const index = this.alertListeners.indexOf(listener)
    if (index > -1) {
      this.alertListeners.splice(index, 1)
    }
  }

  /**
   * Simulate IoT device data for testing
   */
  public simulateDeviceData(deviceId: string, tokenId: number) {
    const sensorTypes: ('temperature' | 'humidity' | 'vibration')[] = ['temperature', 'humidity', 'vibration']
    
    setInterval(() => {
      const sensorType = sensorTypes[Math.floor(Math.random() * sensorTypes.length)]
      let value: number
      let unit: string

      switch (sensorType) {
        case 'temperature':
          value = Math.round((Math.random() * 60 - 20) * 10) / 10 // -20 to 40°C
          unit = '°C'
          break
        case 'humidity':
          value = Math.round(Math.random() * 100) // 0 to 100%
          unit = '%'
          break
        case 'vibration':
          value = Math.round(Math.random() * 150) // 0 to 150
          unit = 'units'
          break
      }

      const reading: SensorReading = {
        deviceId,
        tokenId,
        sensorType,
        value,
        unit,
        gpsCoordinates: `${(Math.random() * 180 - 90).toFixed(6)},${(Math.random() * 360 - 180).toFixed(6)}`,
        timestamp: Date.now(),
        dataHash: this.generateDataHash({
          deviceId,
          tokenId,
          sensorType,
          value,
          unit,
          timestamp: Date.now()
        })
      }

      this.processSensorReading(deviceId, {
        type: 'sensor_reading',
        ...reading
      })
    }, 5000) // Every 5 seconds
  }

  /**
   * Disconnect from all devices
   */
  public disconnectAllDevices() {
    this.deviceConnections.forEach((ws, deviceId) => {
      ws.close()
      console.log(`Disconnected from device: ${deviceId}`)
    })
    this.deviceConnections.clear()
  }
}

export default new IoTOracleService()
