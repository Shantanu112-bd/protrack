import { supabase, trackingService } from "./supabase";
import { ethers } from "ethers";
import ProTrackAdvancedIoTABI from "../contracts/ProTrackAdvancedIoT.json";
import ProTrackSupplyChainABI from "../contracts/ProTrackSupplyChain.json";

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
  alerts?: Array<{ type: string; value: number; threshold: number }>;
  timestamp: string;
  dataHash?: string;
  txHash?: string;
  error?: unknown;
  type?: string;
  product?: ProductData;
  blockchainData?: unknown;
}

interface DeviceData {
  deviceId: string;
  deviceType: string;
  protocol: string;
  firmwareVersion: string;
  enableEncryption: boolean;
}

// Enhanced IoT service that connects to actual smart contracts
class IoTService {
  private iotContractAddress: string;
  private supplyChainContractAddress: string;
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;
  private iotContract: ethers.Contract | null = null;
  private supplyChainContract: ethers.Contract | null = null;
  private isConnected = false;
  private listeners: Map<string, ((data: IoTEvent) => void)[]> = new Map();

  constructor(iotContractAddress: string, supplyChainContractAddress: string) {
    this.iotContractAddress = iotContractAddress;
    this.supplyChainContractAddress = supplyChainContractAddress;
  }

  async connect(provider: ethers.providers.Web3Provider) {
    try {
      this.provider = provider;
      this.signer = provider.getSigner();
      this.iotContract = new ethers.Contract(
        this.iotContractAddress,
        ProTrackAdvancedIoTABI.abi,
        this.signer
      );
      this.supplyChainContract = new ethers.Contract(
        this.supplyChainContractAddress,
        ProTrackSupplyChainABI.abi,
        this.signer
      );
      this.isConnected = true;
      console.log("IoT Service connected to blockchain");

      // Start simulated IoT data polling
      this.startDataPolling();
      return true;
    } catch (error) {
      console.error("Failed to connect IoT service:", error);
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

  // Process incoming IoT data and store it with blockchain verification
  async processIoTData(rfidTag: string, sensorData: SensorData) {
    try {
      if (!this.isConnected || !this.iotContract || !this.supplyChainContract) {
        throw new Error("IoT Service not connected");
      }

      // Get product by RFID
      const product = await trackingService.getProductByRFID(rfidTag);
      if (!product) {
        throw new Error(`Product with RFID ${rfidTag} not found`);
      }

      // Record IoT data in Supabase
      await trackingService.recordIoTData(product.id, sensorData);

      // Submit encrypted sensor data to blockchain
      const deviceId = `DEVICE_${Math.random()
        .toString(36)
        .substr(2, 9)
        .toUpperCase()}`;
      const sequenceNumber = Math.floor(Date.now() / 1000);

      // Encrypt sensor data (simplified for demo)
      const encryptedValue = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(JSON.stringify(sensorData))
      );

      const dataHash = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(
          `${deviceId}${product.token_id}${sequenceNumber}${encryptedValue}`
        )
      );

      // Create signature (simplified for demo)
      const signature = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(`${dataHash}${deviceId}`)
      );

      // Submit to IoT contract
      const tx = await this.iotContract.submitEncryptedSensorData(
        deviceId,
        product.token_id,
        this.getSensorType(sensorData),
        encryptedValue,
        "0x", // encryptedMetadata
        this.getSensorUnit(sensorData),
        "0,0", // gpsCoordinates
        sequenceNumber,
        dataHash,
        signature
      );

      await tx.wait();

      // Emit data processed event
      this.emit("data-processed", {
        rfidTag,
        sensorData,
        dataHash,
        txHash: tx.hash,
        timestamp: new Date().toISOString(),
      });

      // Check for alerts
      this.checkAlerts(product.id, sensorData);

      return {
        success: true,
        dataHash,
        txHash: tx.hash,
      };
    } catch (error) {
      console.error("Failed to process IoT data:", error);
      this.emit("error", {
        type: "data-processing-error",
        error,
        rfidTag,
        sensorData,
        timestamp: new Date().toISOString(),
      });
      return {
        success: false,
        error,
      };
    }
  }

  // Get sensor type from data
  private getSensorType(sensorData: SensorData): string {
    if (sensorData.temperature !== undefined) return "temperature";
    if (sensorData.humidity !== undefined) return "humidity";
    if (sensorData.shock !== undefined) return "shock";
    if (sensorData.light_exposure !== undefined) return "light";
    return "generic";
  }

  // Get sensor unit from data
  private getSensorUnit(sensorData: SensorData): string {
    if (sensorData.temperature !== undefined) return "°C";
    if (sensorData.humidity !== undefined) return "%";
    if (sensorData.shock !== undefined) return "G";
    if (sensorData.light_exposure !== undefined) return "lux";
    return "unit";
  }

  // Check sensor data for alert conditions
  private async checkAlerts(productId: string, sensorData: SensorData) {
    try {
      // Get product details to check against thresholds
      const { data: product } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (!product) return;

      const alerts = [];

      // Check temperature
      if (sensorData.temperature !== undefined) {
        if (sensorData.temperature > (product.max_temperature || 30)) {
          alerts.push({
            type: "temperature-high",
            value: sensorData.temperature,
            threshold: product.max_temperature || 30,
          });
        } else if (sensorData.temperature < (product.min_temperature || 0)) {
          alerts.push({
            type: "temperature-low",
            value: sensorData.temperature,
            threshold: product.min_temperature || 0,
          });
        }
      }

      // Check humidity
      if (sensorData.humidity !== undefined) {
        if (sensorData.humidity > (product.max_humidity || 80)) {
          alerts.push({
            type: "humidity-high",
            value: sensorData.humidity,
            threshold: product.max_humidity || 80,
          });
        } else if (sensorData.humidity < (product.min_humidity || 20)) {
          alerts.push({
            type: "humidity-low",
            value: sensorData.humidity,
            threshold: product.min_humidity || 20,
          });
        }
      }

      // Check shock/impact
      if (
        sensorData.shock !== undefined &&
        sensorData.shock > (product.max_shock || 5)
      ) {
        alerts.push({
          type: "shock-exceeded",
          value: sensorData.shock,
          threshold: product.max_shock || 5,
        });
      }

      // If any alerts were triggered
      if (alerts.length > 0) {
        // Record alerts in database
        await supabase.from("alerts").insert(
          alerts.map((alert) => ({
            product_id: productId,
            alert_type: alert.type,
            alert_value: alert.value,
            threshold: alert.threshold,
            timestamp: new Date().toISOString(),
          }))
        );

        // Emit alert event
        this.emit("alert", {
          productId,
          alerts,
          sensorData,
          timestamp: new Date().toISOString(),
          rfidTag: "", // Add required property
        });
      }
    } catch (error) {
      console.error("Error checking alerts:", error);
    }
  }

  // Simulate IoT data for testing
  private startDataPolling() {
    // This is a simulation - in a real app, this would receive data from actual IoT devices
    setInterval(async () => {
      try {
        // Get active products
        const { data: activeProducts } = await supabase
          .from("products")
          .select("rfid_tag, status")
          .in("status", ["in_transit", "in_storage", "at_retailer"])
          .limit(5);

        if (!activeProducts || activeProducts.length === 0) return;

        // Generate simulated data for a random product
        const randomProduct =
          activeProducts[Math.floor(Math.random() * activeProducts.length)];

        const simulatedData: SensorData = {
          temperature: 20 + Math.random() * 10 - 5, // 15-25°C
          humidity: 40 + Math.random() * 20, // 40-60%
          shock: Math.random() * 5, // 0-5G
          light_exposure: Math.random() * 1000, // 0-1000 lux
          battery: 80 + Math.random() * 20, // 80-100%
          timestamp: new Date().toISOString(),
        };

        // Process the simulated data
        await this.processIoTData(randomProduct.rfid_tag, simulatedData);

        // Emit raw data event
        this.emit("data-received", {
          rfidTag: randomProduct.rfid_tag,
          data: simulatedData,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Error in IoT data simulation:", error);
      }
    }, 30000); // Every 30 seconds
  }

  // Update GPS location for a product with blockchain verification
  async updateLocation(rfidTag: string, location: LocationData) {
    try {
      // Get product by RFID
      const product = await trackingService.getProductByRFID(rfidTag);
      if (!product) {
        throw new Error(`Product with RFID ${rfidTag} not found`);
      }

      // Update location in Supabase
      await trackingService.updateLocation(product.id, location);

      // Update blockchain with location data if contract is connected
      if (this.isConnected && this.iotContract) {
        const deviceId = `GPS_${Math.random()
          .toString(36)
          .substr(2, 9)
          .toUpperCase()}`;
        const sequenceNumber = Math.floor(Date.now() / 1000);

        // Create GPS data
        const gpsData = {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy || 0,
        };

        // Encrypt GPS data (simplified for demo)
        const encryptedValue = ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes(JSON.stringify(gpsData))
        );

        const dataHash = ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes(
            `${deviceId}${product.token_id}${sequenceNumber}${encryptedValue}`
          )
        );

        // Create signature (simplified for demo)
        const signature = ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes(`${dataHash}${deviceId}`)
        );

        // Submit to IoT contract
        const tx = await this.iotContract.submitEncryptedSensorData(
          deviceId,
          product.token_id,
          "gps",
          encryptedValue,
          "0x", // encryptedMetadata
          "coordinates",
          `${location.latitude},${location.longitude}`,
          sequenceNumber,
          dataHash,
          signature
        );

        await tx.wait();

        // Emit location updated event
        this.emit("location-updated", {
          rfidTag,
          location,
          dataHash,
          txHash: tx.hash,
          timestamp: new Date().toISOString(),
        });

        return {
          success: true,
          dataHash,
          txHash: tx.hash,
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error("Failed to update location:", error);
      this.emit("error", {
        type: "location-update-error",
        error,
        rfidTag,
        location,
        timestamp: new Date().toISOString(),
      });
      return {
        success: false,
        error,
      };
    }
  }

  // Scan RFID tag and get product data with blockchain verification
  async scanRFID(rfidTag: string) {
    try {
      // Get product from Supabase
      const product = await trackingService.getProductByRFID(rfidTag);

      if (!product) {
        throw new Error(`Product with RFID ${rfidTag} not found`);
      }

      // Get blockchain data if connected
      let blockchainData = null;
      if (this.isConnected && this.supplyChainContract) {
        try {
          blockchainData = await this.supplyChainContract.getProductByRFID(
            rfidTag
          );
        } catch (error) {
          console.warn("Could not fetch blockchain data for product:", error);
        }
      }

      // Emit scan event
      this.emit("rfid-scanned", {
        rfidTag,
        product,
        blockchainData,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        product,
        blockchainData,
      };
    } catch (error) {
      console.error("Failed to scan RFID:", error);
      this.emit("error", {
        type: "rfid-scan-error",
        error,
        rfidTag,
        timestamp: new Date().toISOString(),
      });
      return {
        success: false,
        error,
      };
    }
  }

  // Verify IoT data authenticity on blockchain
  async verifyIoTData(rfidTag: string, dataHash: string) {
    try {
      if (!this.isConnected || !this.iotContract) {
        throw new Error("IoT Service not connected");
      }

      // Get product by RFID
      const product = await trackingService.getProductByRFID(rfidTag);
      if (!product) {
        throw new Error(`Product with RFID ${rfidTag} not found`);
      }

      // Get IoT data from blockchain
      const iotDataArray = await this.iotContract.getTokenSensorData(
        product.token_id
      );

      // Check if data hash exists in blockchain records
      const isVerified = iotDataArray.some(
        (data: { dataHash: string }) =>
          data.dataHash.toLowerCase() === dataHash.toLowerCase()
      );

      return {
        success: true,
        verified: isVerified,
        tokenId: product.token_id,
      };
    } catch (error) {
      console.error("Failed to verify IoT data:", error);
      return {
        success: false,
        error,
      };
    }
  }

  // Get IoT dashboard data
  async getDashboardData() {
    try {
      if (!this.isConnected || !this.iotContract) {
        throw new Error("IoT Service not connected");
      }

      const dashboardData = await this.iotContract.getDashboardData();

      return {
        success: true,
        data: {
          totalDevices: dashboardData.totalDevices.toNumber(),
          activeDevices: dashboardData.activeDevices.toNumber(),
          alertsLast24h: dashboardData.alertsLast24h.toNumber(),
          dataPointsToday: dashboardData.dataPointsToday.toNumber(),
        },
      };
    } catch (error) {
      console.error("Failed to get dashboard data:", error);
      return {
        success: false,
        error,
      };
    }
  }

  // Register IoT device
  async registerDevice(deviceData: DeviceData) {
    try {
      if (!this.isConnected || !this.iotContract) {
        throw new Error("IoT Service not connected");
      }

      const accounts = await this.provider?.listAccounts();
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts available");
      }

      const tx = await this.iotContract.registerAdvancedDevice(
        accounts[0], // deviceAddress
        deviceData.deviceId,
        deviceData.deviceType,
        deviceData.protocol,
        deviceData.firmwareVersion,
        deviceData.enableEncryption
      );

      await tx.wait();

      return {
        success: true,
        txHash: tx.hash,
      };
    } catch (error) {
      console.error("Failed to register device:", error);
      return {
        success: false,
        error,
      };
    }
  }
}

// Create and export a singleton instance
export const iotService = new IoTService(
  import.meta.env.VITE_IOT_CONTRACT_ADDRESS ||
    "0x99bbA657f2BbC93c02D617f8bA121cB8Fc104Acf",
  import.meta.env.VITE_SUPPLY_CHAIN_CONTRACT_ADDRESS ||
    "0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82"
);

export default iotService;
