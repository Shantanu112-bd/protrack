import Web3 from 'web3'

// Oracle Contract ABI (Chainlink-style)
const ORACLE_ABI = [
  {
    "inputs": [
      {"name": "jobId", "type": "bytes32"},
      {"name": "payment", "type": "uint256"},
      {"name": "url", "type": "string"},
      {"name": "path", "type": "string"}
    ],
    "name": "requestData",
    "outputs": [{"name": "", "type": "bytes32"}],
    "type": "function"
  },
  {
    "inputs": [{"name": "requestId", "type": "bytes32"}],
    "name": "getResult",
    "outputs": [{"name": "", "type": "uint256"}],
    "type": "function"
  },
  {
    "inputs": [
      {"name": "deviceId", "type": "string"},
      {"name": "sensorType", "type": "string"},
      {"name": "value", "type": "uint256"},
      {"name": "timestamp", "type": "uint256"}
    ],
    "name": "submitIoTData",
    "outputs": [{"name": "", "type": "bytes32"}],
    "type": "function"
  },
  {
    "inputs": [
      {"name": "shipmentId", "type": "string"},
      {"name": "latitude", "type": "int256"},
      {"name": "longitude", "type": "int256"},
      {"name": "timestamp", "type": "uint256"}
    ],
    "name": "submitGPSData",
    "outputs": [{"name": "", "type": "bytes32"}],
    "type": "function"
  }
]

const ORACLE_CONTRACT_ADDRESS = '0x1111111111111111111111111111111111111111'

export interface IoTDataPoint {
  deviceId: string
  sensorType: 'temperature' | 'humidity' | 'pressure' | 'vibration' | 'light'
  value: number
  unit: string
  timestamp: number
  verified: boolean
  txHash?: string
  blockNumber?: number
}

export interface GPSDataPoint {
  shipmentId: string
  latitude: number
  longitude: number
  timestamp: number
  verified: boolean
  txHash?: string
  blockNumber?: number
}

export interface OracleRequest {
  requestId: string
  status: 'pending' | 'fulfilled' | 'failed'
  result?: any
  timestamp: number
  txHash: string
}

export class OracleService {
  private web3: Web3
  private account: string
  private oracleContract: any

  constructor(web3: Web3, account: string) {
    this.web3 = web3
    this.account = account
    this.oracleContract = new web3.eth.Contract(ORACLE_ABI, ORACLE_CONTRACT_ADDRESS)
  }

  // Submit IoT sensor data to blockchain via oracle
  async submitIoTData(data: Omit<IoTDataPoint, 'verified' | 'txHash' | 'blockNumber'>): Promise<string> {
    try {
      // Convert value to appropriate scale (e.g., temperature * 100 for 2 decimal places)
      const scaledValue = Math.round(data.value * 100)
      
      const tx = await this.oracleContract.methods
        .submitIoTData(
          data.deviceId,
          data.sensorType,
          scaledValue,
          data.timestamp
        )
        .send({ from: this.account })

      return tx.transactionHash
    } catch (error) {
      console.error('Error submitting IoT data:', error)
      throw error
    }
  }

  // Submit GPS location data to blockchain via oracle
  async submitGPSData(data: Omit<GPSDataPoint, 'verified' | 'txHash' | 'blockNumber'>): Promise<string> {
    try {
      // Convert coordinates to integers (multiply by 1e6 for precision)
      const latInt = Math.round(data.latitude * 1e6)
      const lonInt = Math.round(data.longitude * 1e6)
      
      const tx = await this.oracleContract.methods
        .submitGPSData(
          data.shipmentId,
          latInt,
          lonInt,
          data.timestamp
        )
        .send({ from: this.account })

      return tx.transactionHash
    } catch (error) {
      console.error('Error submitting GPS data:', error)
      throw error
    }
  }

  // Request external data via oracle (e.g., weather, commodity prices)
  async requestExternalData(apiUrl: string, jsonPath: string): Promise<OracleRequest> {
    try {
      const jobId = this.web3.utils.asciiToHex('external-data-job')
      const payment = this.web3.utils.toWei('0.1', 'ether') // LINK payment
      
      const tx = await this.oracleContract.methods
        .requestData(jobId, payment, apiUrl, jsonPath)
        .send({ from: this.account })

      const requestId = tx.events.DataRequested?.returnValues?.requestId || 
                       this.web3.utils.randomHex(32)

      return {
        requestId,
        status: 'pending',
        timestamp: Math.floor(Date.now() / 1000),
        txHash: tx.transactionHash
      }
    } catch (error) {
      console.error('Error requesting external data:', error)
      throw error
    }
  }

  // Get oracle request result
  async getOracleResult(requestId: string): Promise<any> {
    try {
      const result = await this.oracleContract.methods.getResult(requestId).call()
      return result
    } catch (error) {
      console.error('Error getting oracle result:', error)
      throw error
    }
  }

  // Verify IoT data authenticity
  async verifyIoTData(deviceId: string, timestamp: number): Promise<boolean> {
    try {
      // In a real implementation, this would check the blockchain for the data
      // For demo, we'll simulate verification
      const events = await this.web3.eth.getPastLogs({
        address: ORACLE_CONTRACT_ADDRESS,
        topics: [
          this.web3.utils.keccak256('IoTDataSubmitted(string,string,uint256,uint256)'),
          this.web3.utils.keccak256(deviceId)
        ],
        fromBlock: 'earliest',
        toBlock: 'latest'
      })

      return events.length > 0
    } catch (error) {
      console.error('Error verifying IoT data:', error)
      return false
    }
  }

  // Generate demo IoT data with blockchain verification
  static generateDemoIoTData(deviceId: string, sensorType: IoTDataPoint['sensorType']): IoTDataPoint {
    const baseValues = {
      temperature: { min: -10, max: 40, unit: '°C' },
      humidity: { min: 30, max: 90, unit: '%' },
      pressure: { min: 980, max: 1050, unit: 'hPa' },
      vibration: { min: 0, max: 10, unit: 'g' },
      light: { min: 0, max: 1000, unit: 'lux' }
    }

    const config = baseValues[sensorType]
    const value = Math.random() * (config.max - config.min) + config.min

    return {
      deviceId,
      sensorType,
      value: Math.round(value * 100) / 100,
      unit: config.unit,
      timestamp: Math.floor(Date.now() / 1000),
      verified: Math.random() > 0.1, // 90% verification rate for demo
      txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      blockNumber: Math.floor(Math.random() * 1000000) + 18000000
    }
  }

  // Generate demo GPS data with blockchain verification
  static generateDemoGPSData(shipmentId: string, baseLocation?: {lat: number, lon: number}): GPSDataPoint {
    const base = baseLocation || { lat: 40.7128, lon: -74.0060 } // NYC default
    
    // Add some random movement
    const latOffset = (Math.random() - 0.5) * 0.01 // ~1km radius
    const lonOffset = (Math.random() - 0.5) * 0.01

    return {
      shipmentId,
      latitude: base.lat + latOffset,
      longitude: base.lon + lonOffset,
      timestamp: Math.floor(Date.now() / 1000),
      verified: Math.random() > 0.05, // 95% verification rate for demo
      txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      blockNumber: Math.floor(Math.random() * 1000000) + 18000000
    }
  }

  // Simulate SLA monitoring
  async monitorSLA(shipmentId: string, conditions: {
    maxTemperature?: number
    minTemperature?: number
    maxDeliveryTime?: number
    requiredLocation?: { lat: number, lon: number, radius: number }
  }): Promise<{
    compliant: boolean
    violations: string[]
    penaltyAmount?: number
  }> {
    try {
      const violations: string[] = []
      
      // Simulate checking recent IoT data
      const recentTemp = OracleService.generateDemoIoTData(`${shipmentId}-temp`, 'temperature')
      
      if (conditions.maxTemperature && recentTemp.value > conditions.maxTemperature) {
        violations.push(`Temperature exceeded: ${recentTemp.value}°C > ${conditions.maxTemperature}°C`)
      }
      
      if (conditions.minTemperature && recentTemp.value < conditions.minTemperature) {
        violations.push(`Temperature too low: ${recentTemp.value}°C < ${conditions.minTemperature}°C`)
      }

      // Simulate checking GPS data
      const recentGPS = OracleService.generateDemoGPSData(shipmentId)
      
      if (conditions.requiredLocation) {
        const distance = this.calculateDistance(
          recentGPS.latitude, recentGPS.longitude,
          conditions.requiredLocation.lat, conditions.requiredLocation.lon
        )
        
        if (distance > conditions.requiredLocation.radius) {
          violations.push(`Location deviation: ${distance.toFixed(2)}km from required location`)
        }
      }

      const compliant = violations.length === 0
      const penaltyAmount = violations.length * 0.1 // 0.1 ETH per violation

      return {
        compliant,
        violations,
        penaltyAmount: compliant ? undefined : penaltyAmount
      }
    } catch (error) {
      console.error('Error monitoring SLA:', error)
      throw error
    }
  }

  // Calculate distance between two GPS coordinates
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }
}

export default OracleService
