import { supabase } from "./supabase";
import Web3 from "web3";
import { supplyChainService } from "./supplyChainService";
// import ProTrackAdvancedIoTABI from "../contracts/ProTrackAdvancedIoT.json";
import { CONTRACT_ADDRESSES } from "../config/contractConfig";
import { Json } from "../types/supabase";

// Define types for better TypeScript support
interface SensorData {
  temperature?: number;
  humidity?: number;
  shock?: number;
  light_exposure?: number;
  battery?: number;
  timestamp?: string;
  [key: string]: number | string | undefined; // Allow additional properties
}

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
  heading?: number;
}

interface ProductData {
  id: string;
  rfid_tag: string;
  batch_id: string;
  token_id: string;
  manufacturer_id: string;
  current_custodian_id: string | null;
  product_name: string | null;
  expiry_date: string;
  status: string;
  max_temperature: number | null;
  min_temperature: number | null;
  max_humidity: number | null;
  min_humidity: number | null;
  max_shock: number | null;
  destination: string | null;
  expected_arrival: string | null;
  created_at: string;
  updated_at: string;
}

interface IoTEvent {
  rfidTag?: string;
  data?: SensorData;
  location?: LocationData;
  sensorData?: SensorData;
  productId?: string;
  deviceId?: string;
  alerts?: Array<{ type: string; value: number; threshold: number }>;
  timestamp: string;
  dataHash?: string;
  txHash?: string;
  error?: unknown;
  type?: string;
  product?: ProductData;
  blockchainData?: unknown;
  alertType?: string;
  message?: string;
  severity?: string;
  value?: number;
  threshold?: number;
  status?: string;
  batteryLevel?: number;
  signalStrength?: number;
  reason?: string;
}

// interface DeviceData {
//   deviceId: string;
//   deviceType: string;
//   protocol: string;
//   firmwareVersion: string;
//   enableEncryption: boolean;
//   supportedSensors: string[];
//   lastSeen: string;
//   status: "active" | "inactive" | "maintenance";
// }

interface IoTDeviceConnection {
  deviceId: string;
  connection: WebSocket;
  lastPing: number;
  status: "connected" | "disconnected" | "error";
}

// Enhanced IoT service that connects to actual smart contracts and IoT devices
class EnhancedIoTService {
  private iotContractAddress: string;
  private supplyChainContractAddress: string;
  private web3: Web3 | null = null;
  private accounts: string[] | null = null;
  // private iotContract: Web3 | null = null;
  // private supplyChainContract: Web3 | null = null;
  private isConnected = false;
  private listeners: Map<string, ((data: IoTEvent) => void)[]> = new Map();
  private deviceConnections: Map<string, IoTDeviceConnection> = new Map();
  private sensorDataBuffer: SensorData[] = [];
  private dataProcessingInterval: NodeJS.Timeout | null = null;

  constructor(iotContractAddress: string, supplyChainContractAddress: string) {
    this.iotContractAddress = iotContractAddress;
    this.supplyChainContractAddress = supplyChainContractAddress;

    // Start periodic data processing
    this.startDataProcessing();
  }

  async connect(web3: Web3) {
    try {
      this.web3 = web3;
      this.accounts = await web3.eth.getAccounts();

      // Initialize contracts using supplyChainService's web3 instance
      // Initialize contracts using supplyChainService's web3 instance
      // this.iotContract = new web3.eth.Contract(
      //   ProTrackAdvancedIoTABI.abi,
      //   this.iotContractAddress
      // );

      // this.supplyChainContract = new web3.eth.Contract(
      //   ProTrackAdvancedIoTABI.abi, // Using IoT ABI for now
      //   this.supplyChainContractAddress
      // );

      this.isConnected = true;
      console.log("Enhanced IoT Service connected to blockchain");

      return true;
    } catch (error) {
      console.error("Failed to connect Enhanced IoT service:", error);
      this.isConnected = false;
      return false;
    }
  }

  // Register a listener for IoT events
  on(eventType: string, callback: (data: IoTEvent) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)?.push(callback);
  }

  // Emit an event to all registered listeners
  private emit(eventType: string, data: IoTEvent) {
    const callbacks = this.listeners.get(eventType) || [];
    callbacks.forEach((callback) => callback(data));
  }

  // Connect to an IoT device via WebSocket
  async connectToDevice(
    deviceId: string,
    websocketUrl: string
  ): Promise<boolean> {
    try {
      // Close existing connection if it exists
      if (this.deviceConnections.has(deviceId)) {
        const existingConnection = this.deviceConnections.get(deviceId);
        if (existingConnection) {
          existingConnection.connection.close();
        }
      }

      // Create new WebSocket connection
      const ws = new WebSocket(websocketUrl);

      // Set up event handlers
      ws.onopen = () => {
        console.log(`Connected to IoT device: ${deviceId}`);

        // Update device connection status
        this.deviceConnections.set(deviceId, {
          deviceId,
          connection: ws,
          lastPing: Date.now(),
          status: "connected",
        });

        // Send authentication message
        ws.send(
          JSON.stringify({
            type: "auth",
            deviceId: deviceId,
            timestamp: Date.now(),
          })
        );

        // Emit connection event
        this.emit("device-connected", {
          deviceId,
          timestamp: new Date().toISOString(),
        });
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleDeviceMessage(deviceId, data);
        } catch (error) {
          console.error(
            `Failed to parse message from device ${deviceId}:`,
            error
          );
        }
      };

      ws.onclose = () => {
        console.log(`Disconnected from IoT device: ${deviceId}`);

        // Update connection status
        if (this.deviceConnections.has(deviceId)) {
          const connection = this.deviceConnections.get(deviceId)!;
          connection.status = "disconnected";
        }

        // Emit disconnection event
        this.emit("device-disconnected", {
          deviceId,
          timestamp: new Date().toISOString(),
        });

        // Attempt reconnection after 5 seconds
        setTimeout(() => {
          this.connectToDevice(deviceId, websocketUrl);
        }, 5000);
      };

      ws.onerror = (error) => {
        console.error(`IoT device connection error (${deviceId}):`, error);

        // Update connection status
        if (this.deviceConnections.has(deviceId)) {
          const connection = this.deviceConnections.get(deviceId)!;
          connection.status = "error";
        }

        // Emit error event
        this.emit("device-error", {
          deviceId,
          error,
          timestamp: new Date().toISOString(),
        });
      };

      return true;
    } catch (error) {
      console.error(`Failed to connect to device ${deviceId}:`, error);
      return false;
    }
  }

  // Handle incoming message from IoT device
  private handleDeviceMessage(deviceId: string, data: Record<string, unknown>) {
    switch (data.type) {
      case "sensor_data":
        this.processSensorData(deviceId, data);
        break;
      case "location_update":
        this.processLocationUpdate(deviceId, data);
        break;
      case "alert":
        this.processAlert(deviceId, data);
        break;
      case "heartbeat":
        this.processHeartbeat(deviceId, data);
        break;
      case "device_status":
        this.processDeviceStatus(deviceId, data);
        break;
      default:
        console.warn(
          `Unknown message type from device ${deviceId}:`,
          data.type
        );
    }
  }

  // Process sensor data from IoT device
  private async processSensorData(
    deviceId: string,
    data: Record<string, unknown>
  ) {
    try {
      const sensorData: SensorData = {
        temperature:
          typeof data.payload === "object" &&
          data.payload !== null &&
          "temperature" in data.payload
            ? (data.payload.temperature as number)
            : undefined,
        humidity:
          typeof data.payload === "object" &&
          data.payload !== null &&
          "humidity" in data.payload
            ? (data.payload.humidity as number)
            : undefined,
        shock:
          typeof data.payload === "object" &&
          data.payload !== null &&
          "shock" in data.payload
            ? (data.payload.shock as number)
            : undefined,
        timestamp: new Date().toISOString(),
      };

      // Add to buffer for batch processing
      this.sensorDataBuffer.push(sensorData);

      // Emit real-time data event
      this.emit("sensor-data", {
        deviceId,
        sensorData,
        timestamp: new Date().toISOString(),
      });

      // Check for alerts
      await this.checkAlerts(sensorData);
    } catch (error) {
      console.error(
        `Error processing sensor data from device ${deviceId}:`,
        error
      );
    }
  }

  // Process location update from IoT device
  private async processLocationUpdate(
    deviceId: string,
    data: Record<string, unknown>
  ) {
    try {
      const locationData: LocationData = {
        latitude:
          typeof data.payload === "object" &&
          data.payload !== null &&
          "latitude" in data.payload
            ? (data.payload.latitude as number)
            : 0,
        longitude:
          typeof data.payload === "object" &&
          data.payload !== null &&
          "longitude" in data.payload
            ? (data.payload.longitude as number)
            : 0,
        accuracy:
          typeof data.payload === "object" &&
          data.payload !== null &&
          "accuracy" in data.payload
            ? (data.payload.accuracy as number)
            : undefined,
        altitude:
          typeof data.payload === "object" &&
          data.payload !== null &&
          "altitude" in data.payload
            ? (data.payload.altitude as number)
            : undefined,
        speed:
          typeof data.payload === "object" &&
          data.payload !== null &&
          "speed" in data.payload
            ? (data.payload.speed as number)
            : undefined,
        heading:
          typeof data.payload === "object" &&
          data.payload !== null &&
          "heading" in data.payload
            ? (data.payload.heading as number)
            : undefined,
      };

      // Store in database
      // Store location data in iot_data table for now
      const { error } = await supabase.from("iot_data").insert([
        {
          product_id: deviceId, // Using deviceId as product_id for now
          data: {
            type: "location",
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            accuracy: locationData.accuracy,
            altitude: locationData.altitude,
            speed: locationData.speed,
            heading: locationData.heading,
          },
          timestamp: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error("Failed to store location data:", error);
        return;
      }

      // Emit location update event
      this.emit("location-update", {
        deviceId,
        location: locationData,
        timestamp: new Date().toISOString(),
      });

      console.log(`Location updated for device ${deviceId}:`, locationData);
    } catch (error) {
      console.error(
        `Error processing location update from device ${deviceId}:`,
        error
      );
    }
  }

  // Process alert from IoT device
  private processAlert(deviceId: string, data: Record<string, unknown>) {
    const alertData: IoTEvent = {
      deviceId,
      alertType: typeof data.alertType === "string" ? data.alertType : "",
      message: typeof data.message === "string" ? data.message : "",
      severity: typeof data.severity === "string" ? data.severity : "medium",
      timestamp: new Date().toISOString(),
    };

    // Emit alert event
    this.emit("alert", alertData);

    console.log(`Alert from device ${deviceId}:`, alertData);
  }

  // Process heartbeat from IoT device
  private processHeartbeat(deviceId: string, data: Record<string, unknown>) {
    // Update last ping time
    if (this.deviceConnections.has(deviceId)) {
      const connection = this.deviceConnections.get(deviceId)!;
      connection.lastPing = Date.now();
    }

    console.log(`Heartbeat received from device ${deviceId}:`, data.timestamp);
  }

  // Process device status update
  private async processDeviceStatus(
    deviceId: string,
    data: Record<string, unknown>
  ) {
    try {
      // Update device status in database
      // Update device status in products table for now
      const { error } = await supabase
        .from("products")
        .update({
          status: typeof data.status === "string" ? data.status : "unknown",
          updated_at: new Date().toISOString(),
        })
        .eq("rfid_tag", deviceId);

      if (error) {
        console.error("Failed to update device status:", error);
        return;
      }

      // Emit device status event
      this.emit("device-status", {
        deviceId,
        status: typeof data.status === "string" ? data.status : "unknown",
        batteryLevel:
          typeof data.batteryLevel === "number" ? data.batteryLevel : 0,
        signalStrength:
          typeof data.signalStrength === "number" ? data.signalStrength : 0,
        timestamp: new Date().toISOString(),
      });

      console.log(`Status updated for device ${deviceId}:`, data.status);
    } catch (error) {
      console.error(
        `Error processing device status from device ${deviceId}:`,
        error
      );
    }
  }

  // Check sensor data for alert conditions
  private async checkAlerts(sensorData: SensorData) {
    try {
      const alerts = [];

      // Check temperature alerts
      if (sensorData.temperature !== undefined) {
        if (sensorData.temperature > 30) {
          alerts.push({
            type: "temperature-high",
            value: sensorData.temperature,
            threshold: 30,
            message: `Temperature ${sensorData.temperature}°C exceeds safe threshold of 30°C`,
          });
        } else if (sensorData.temperature < 0) {
          alerts.push({
            type: "temperature-low",
            value: sensorData.temperature,
            threshold: 0,
            message: `Temperature ${sensorData.temperature}°C below safe threshold of 0°C`,
          });
        }
      }

      // Check humidity alerts
      if (sensorData.humidity !== undefined) {
        if (sensorData.humidity > 80) {
          alerts.push({
            type: "humidity-high",
            value: sensorData.humidity,
            threshold: 80,
            message: `Humidity ${sensorData.humidity}% exceeds safe threshold of 80%`,
          });
        } else if (sensorData.humidity < 20) {
          alerts.push({
            type: "humidity-low",
            value: sensorData.humidity,
            threshold: 20,
            message: `Humidity ${sensorData.humidity}% below safe threshold of 20%`,
          });
        }
      }

      // Check shock alerts
      if (sensorData.shock !== undefined && sensorData.shock > 5) {
        alerts.push({
          type: "shock-exceeded",
          value: sensorData.shock,
          threshold: 5,
          message: `Shock level ${sensorData.shock}G exceeds safe threshold of 5G`,
        });
      }

      // If any alerts were triggered, emit them
      if (alerts.length > 0) {
        alerts.forEach((alert) => {
          this.emit("alert", {
            alertType: alert.type,
            message: alert.message,
            severity: "high",
            value: alert.value,
            threshold: alert.threshold,
            timestamp: new Date().toISOString(),
          });
        });
      }
    } catch (error) {
      console.error("Error checking alerts:", error);
    }
  }

  // Start periodic data processing
  private startDataProcessing() {
    this.dataProcessingInterval = setInterval(async () => {
      if (this.sensorDataBuffer.length > 0) {
        // Process buffered sensor data
        await this.processSensorDataBuffer();
      }

      // Check device connections
      this.checkDeviceConnections();
    }, 30000); // Every 30 seconds
  }

  // Process buffered sensor data
  private async processSensorDataBuffer() {
    if (this.sensorDataBuffer.length === 0) {
      return;
    }

    // Take up to 50 items from buffer
    const batch = this.sensorDataBuffer.splice(0, 50);

    try {
      // Store in database
      // Store sensor data in iot_data table
      const { error } = await supabase.from("iot_data").insert(
        batch.map((data) => ({
          product_id: (data.deviceId as string) || "unknown",
          data: data as unknown as Json,
          timestamp: data.timestamp || new Date().toISOString(),
          created_at: new Date().toISOString(),
        }))
      );

      if (error) {
        console.error("Failed to store sensor data batch:", error);
        // Re-add to buffer if failed
        this.sensorDataBuffer.unshift(...batch);
        return;
      }

      console.log(`Processed ${batch.length} sensor data points`);
    } catch (error) {
      console.error("Error processing sensor data batch:", error);
      // Re-add to buffer if failed
      this.sensorDataBuffer.unshift(...batch);
    }
  }

  // Check device connections and clean up stale ones
  private checkDeviceConnections() {
    const now = Date.now();
    const timeout = 5 * 60 * 1000; // 5 minutes

    this.deviceConnections.forEach((connection, deviceId) => {
      // If no ping received for 5 minutes, mark as disconnected
      if (now - connection.lastPing > timeout) {
        console.warn(
          `Device ${deviceId} appears to be disconnected (no ping for 5 minutes)`
        );
        connection.status = "disconnected";

        // Emit disconnection event
        this.emit("device-disconnected", {
          deviceId,
          reason: "timeout",
          timestamp: new Date().toISOString(),
        });
      }
    });
  }

  // Submit sensor data to blockchain
  async submitSensorDataToBlockchain(
    deviceId: string,
    sensorType: string,
    value: number,
    unit: string,
    metadata: string
  ) {
    try {
      if (!this.isConnected) {
        throw new Error("IoT Service not connected");
      }

      if (!this.accounts || this.accounts.length === 0) {
        throw new Error("No accounts available");
      }

      // Submit to IoT contract using supplyChainService
      const result = await supplyChainService.submitIoTData(
        deviceId,
        this.getSensorTypeCode(sensorType),
        value,
        unit,
        "0,0", // gpsCoordinates
        metadata
      );

      if (result.success) {
        // Emit blockchain submission event
        this.emit("blockchain-submission", {
          deviceId,
          txHash: result.transactionHash,
          timestamp: new Date().toISOString(),
        });

        return {
          success: true,
          txHash: result.transactionHash,
        };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Failed to submit sensor data to blockchain:", error);
      this.emit("error", {
        type: "blockchain-submission-error",
        error,
        deviceId,
        timestamp: new Date().toISOString(),
      });

      return {
        success: false,
        error,
      };
    }
  }

  // Get sensor type code
  private getSensorTypeCode(sensorType: string): number {
    switch (sensorType.toLowerCase()) {
      case "temperature":
        return 0;
      case "humidity":
        return 1;
      case "pressure":
        return 2;
      case "shock":
        return 3;
      case "light":
        return 4;
      case "gps":
        return 5;
      default:
        return 7; // CUSTOM
    }
  }

  // Get device status
  getDeviceStatus(
    deviceId: string
  ): "connected" | "disconnected" | "error" | null {
    if (!this.deviceConnections.has(deviceId)) {
      return null;
    }

    return this.deviceConnections.get(deviceId)!.status;
  }

  // Get all connected devices
  getConnectedDevices(): string[] {
    const connectedDevices: string[] = [];

    this.deviceConnections.forEach((connection, deviceId) => {
      if (connection.status === "connected") {
        connectedDevices.push(deviceId);
      }
    });

    return connectedDevices;
  }

  // Disconnect from a device
  disconnectDevice(deviceId: string) {
    if (this.deviceConnections.has(deviceId)) {
      const connection = this.deviceConnections.get(deviceId)!;
      connection.connection.close();
      this.deviceConnections.delete(deviceId);

      console.log(`Disconnected from device: ${deviceId}`);
    }
  }

  // Disconnect from all devices
  disconnectAllDevices() {
    this.deviceConnections.forEach((connection, deviceId) => {
      connection.connection.close();
      console.log(`Disconnected from device: ${deviceId}`);
    });

    this.deviceConnections.clear();
  }

  // Cleanup resources
  destroy() {
    // Clear data processing interval
    if (this.dataProcessingInterval) {
      clearInterval(this.dataProcessingInterval);
    }

    // Disconnect all devices
    this.disconnectAllDevices();

    // Clear listeners
    this.listeners.clear();
  }
}

// Create and export a singleton instance
export const enhancedIoTService = new EnhancedIoTService(
  CONTRACT_ADDRESSES.ADVANCED_IOT,
  CONTRACT_ADDRESSES.SUPPLY_CHAIN
);

export default enhancedIoTService;
