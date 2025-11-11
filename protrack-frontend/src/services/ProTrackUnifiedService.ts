import Web3 from "web3";
import { Contract } from "web3-eth-contract";
import { CONTRACT_ADDRESSES } from "../config/contractConfig";
import {
  ProTrackNFT_ABI,
  SupplyChainEscrow_ABI,
  IoTOracle_ABI,
} from "../contracts/abis";
import ProTrackMPC from "../contracts/ProTrackMPC.json";
import { supabase, trackingService } from "./supabase";
import rfidService from "./RFIDService";
import { supplyChainService } from "./supplyChainService";

// Define interfaces for better type safety
interface ProductData {
  name: string;
  sku: string;
  manufacturer: string;
  batchId: string;
  expiryDate: number;
  category: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  certifications: string[];
}

interface SensorData {
  temperature?: number;
  humidity?: number;
  shock?: number;
  light_exposure?: number;
  battery?: number;
  timestamp?: string;
  [key: string]: number | string | undefined;
}

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

interface TransactionResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  data?: Record<string, unknown>;
}

/**
 * ProTrack Unified Service
 * This service provides a unified interface for all ProTrack supply chain operations,
 * combining RFID, IoT, MPC, and blockchain functionality into a single cohesive system.
 */
export class ProTrackUnifiedService {
  private web3: Web3 | null = null;
  private accounts: string[] | null = null;
  private supplyChainContract: Contract<typeof ProTrackNFT_ABI> | null = null;
  private nftContract: Contract<typeof ProTrackNFT_ABI> | null = null;
  private iotOracleContract: Contract<typeof IoTOracle_ABI> | null = null;
  private escrowContract: Contract<typeof SupplyChainEscrow_ABI> | null = null;
  private mpcWalletContract: Contract<typeof ProTrackMPC.abi> | null = null;
  private rfidService: typeof rfidService;

  constructor() {
    this.rfidService = rfidService;
  }

  /**
   * Initialize the service with a Web3 provider
   * @param web3 Web3 instance
   */
  public async init(web3: Web3) {
    this.web3 = web3;
    this.accounts = await web3.eth.getAccounts();
    this.initContracts();
  }

  /**
   * Initialize all smart contracts
   */
  private initContracts() {
    if (this.web3) {
      try {
        this.supplyChainContract = new this.web3.eth.Contract(
          ProTrackNFT_ABI,
          CONTRACT_ADDRESSES.SUPPLY_CHAIN
        );

        this.nftContract = new this.web3.eth.Contract(
          ProTrackNFT_ABI,
          CONTRACT_ADDRESSES.SUPPLY_CHAIN
        );

        this.iotOracleContract = new this.web3.eth.Contract(
          IoTOracle_ABI,
          CONTRACT_ADDRESSES.ORACLE
        );

        this.escrowContract = new this.web3.eth.Contract(
          SupplyChainEscrow_ABI,
          CONTRACT_ADDRESSES.SUPPLY_CHAIN
        );

        this.mpcWalletContract = new this.web3.eth.Contract(
          ProTrackMPC.abi,
          CONTRACT_ADDRESSES.MPC_WALLET
        );
      } catch (error) {
        console.error("Error initializing contracts:", error);
      }
    }
  }

  // ==================== PRODUCT LIFECYCLE MANAGEMENT ====================

  /**
   * Complete product lifecycle from creation to delivery
   * @param productData Product information
   * @param rfidHash RFID hash for product identification
   * @returns Transaction result with product token ID
   */
  public async createAndTrackProduct(
    productData: ProductData,
    rfidHash: string
  ): Promise<TransactionResult> {
    if (!this.nftContract || !this.accounts) {
      return { success: false, error: "Contract not initialized" };
    }

    try {
      // Step 1: Create product record in Supabase
      const productRecord = await trackingService.createProduct({
        rfid_tag: rfidHash,
        batch_id: productData.batchId,
        token_id: "", // Will be updated after minting
        manufacturer_id: this.accounts[0],
        expiry_date: new Date(productData.expiryDate).toISOString(),
        status: "manufacturing",
      });

      // Step 2: Mint NFT for the product
      // In a real implementation, this would upload to IPFS
      const ipfsMetadataHash = `Qm${Math.random()
        .toString(36)
        .substring(2, 46)}`;

      const mintResult = await this.nftContract.methods
        .mintProduct(
          this.accounts[0],
          `https://ipfs.io/ipfs/${ipfsMetadataHash}`,
          {
            name: productData.name,
            sku: productData.sku,
            manufacturer: productData.manufacturer,
            createdAt: Math.floor(Date.now() / 1000),
            batchId: productData.batchId,
            category: productData.category,
            expiryDate: productData.expiryDate,
            isActive: true,
            currentValue: "100.0",
            currentLocation: "Manufacturing Facility",
          }
        )
        .send({ from: this.accounts[0] });

      const tokenId =
        mintResult.events.ProductCreated?.returnValues?.tokenId ||
        mintResult.events.ProductMinted?.returnValues?.tokenId;

      // Step 3: Update product record with token ID
      await supabase
        .from("products")
        .update({ token_id: tokenId.toString() })
        .eq("id", productRecord.id);

      // Step 4: Record initial product event
      await this.nftContract.methods
        .addSupplyChainEvent(
          tokenId,
          "CREATED",
          "Product manufactured and NFT minted",
          "Manufacturing Facility",
          JSON.stringify({ rfidHash, batchId: productData.batchId })
        )
        .send({ from: this.accounts[0] });

      // Step 5: Create MPC wallet for multi-party approvals
      const signers = [
        this.accounts[0], // Manufacturer
        "0x942d35Cc6634C0532925a3b8D4C9db96590b5e8e", // Transporter
        "0x842d35Cc6634C0532925a3b8D4C9db96590b5e8e", // Retailer
      ];

      const mpcResult = await this.createMPCWallet(signers, 2);

      return {
        success: true,
        transactionHash: mintResult.transactionHash,
        data: {
          tokenId: tokenId as number,
          productId: productRecord.id,
          mpcWalletId: mpcResult.success ? "key_demo_12345" : null,
          ipfsMetadataHash,
        },
      };
    } catch (error) {
      console.error("Error in product lifecycle:", error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Transfer product custody with multi-party approval
   * @param tokenId Product token ID
   * @param to New owner address
   * @param location New location
   * @param notes Transfer notes
   * @returns Transfer result
   */
  public async transferProductWithApproval(
    tokenId: number,
    to: string,
    location: string,
    notes: string
  ): Promise<TransactionResult> {
    if (!this.nftContract || !this.accounts) {
      return { success: false, error: "Contract not initialized" };
    }

    try {
      // Get product details
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("token_id", tokenId.toString())
        .single();

      if (productError) {
        throw new Error(`Product not found: ${productError.message}`);
      }

      // Create MPC wallet for this transfer
      const mpcResult = await this.createMPCWallet([this.accounts[0], to], 2);

      if (!mpcResult.success) {
        throw new Error("Failed to create MPC wallet for transfer");
      }

      // Initiate transfer transaction
      const keyId = (mpcResult.data?.keyId as string) || "key_demo_12345";
      const txResult = await this.initiateMPCTransaction(
        keyId,
        `Transfer product ${tokenId} to ${to}`
      );

      if (!txResult.success) {
        throw new Error("Failed to initiate MPC transaction");
      }

      // Record the transfer event
      const eventResult = await this.nftContract.methods
        .addSupplyChainEvent(
          tokenId,
          "TRANSFER",
          notes,
          location,
          JSON.stringify({
            to,
            mpcKeyId: keyId,
            transactionId: txResult.data?.transactionId,
          })
        )
        .send({ from: this.accounts[0] });

      // Update product status in Supabase
      await supabase
        .from("products")
        .update({
          current_custodian_id: to,
          status: "in_transit",
          updated_at: new Date().toISOString(),
        })
        .eq("id", product.id);

      return {
        success: true,
        transactionHash: eventResult.transactionHash,
        data: {
          tokenId,
          to,
          location,
          mpcKeyId: keyId,
          transactionId: txResult.data?.transactionId as string,
        },
      };
    } catch (error) {
      console.error("Error transferring product:", error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Complete product delivery and update status
   * @param tokenId Product token ID
   * @param location Delivery location
   * @returns Delivery completion result
   */
  public async completeDelivery(
    tokenId: number,
    location: string
  ): Promise<TransactionResult> {
    if (!this.nftContract || !this.accounts) {
      return { success: false, error: "Contract not initialized" };
    }

    try {
      // Get product details
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("token_id", tokenId.toString())
        .single();

      if (productError) {
        throw new Error(`Product not found: ${productError.message}`);
      }

      // Record the delivery event
      const eventResult = await this.nftContract.methods
        .addSupplyChainEvent(
          tokenId,
          "DELIVERED",
          "Product delivered to final destination",
          location,
          JSON.stringify({
            deliveredTo: this.accounts[0],
            timestamp: Math.floor(Date.now() / 1000),
          })
        )
        .send({ from: this.accounts[0] });

      // Update product status in Supabase
      await supabase
        .from("products")
        .update({
          status: "delivered",
          current_custodian_id: this.accounts[0],
          updated_at: new Date().toISOString(),
        })
        .eq("id", product.id);

      return {
        success: true,
        transactionHash: eventResult.transactionHash,
        data: {
          tokenId,
          location,
        },
      };
    } catch (error) {
      console.error("Error completing delivery:", error);
      return { success: false, error: (error as Error).message };
    }
  }

  // ==================== RFID INTEGRATION ====================

  /**
   * Scan RFID tag and get product information
   * @param rfidTag RFID tag to scan
   * @returns Product information
   */
  public async scanRFID(rfidTag: string): Promise<TransactionResult> {
    try {
      // Get product from Supabase
      const product = await trackingService.getProductByRFID(rfidTag);

      if (!product) {
        return {
          success: false,
          error: `Product with RFID ${rfidTag} not found`,
        };
      }

      // Get blockchain data using supplyChainService
      const blockchainResult = await supplyChainService.getProductByRFID(
        rfidTag
      );
      let blockchainData = null;

      if (blockchainResult.success) {
        blockchainData = blockchainResult.data;
      }

      return {
        success: true,
        data: {
          product,
          blockchainData,
        },
      };
    } catch (error) {
      console.error("Failed to scan RFID:", error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Verify product authenticity using RFID
   * @param rfidHash RFID hash to verify
   * @returns Verification result
   */
  public async verifyProduct(rfidHash: string): Promise<TransactionResult> {
    if (!this.supplyChainContract) {
      return { success: false, error: "Contract not initialized" };
    }

    try {
      const product = (await this.supplyChainContract.methods
        .getProductByRFID(rfidHash)
        .call()) as unknown as { tokenId: string; [key: string]: unknown };

      if (product.tokenId === "0") {
        return { success: false, error: "Product not found" };
      }

      // Get product events and IoT data
      const [events, iotData] = await Promise.all([
        this.supplyChainContract.methods
          .getProductEvents(product.tokenId)
          .call() as Promise<unknown>,
        this.supplyChainContract.methods
          .getProductIoTData(product.tokenId)
          .call() as Promise<unknown>,
      ]);

      return {
        success: true,
        data: {
          isAuthentic: true,
          product,
          events,
          iotData,
        },
      };
    } catch (error) {
      console.error("Product verification failed:", error);
      return { success: false, error: (error as Error).message };
    }
  }

  // ==================== IoT INTEGRATION ====================

  /**
   * Process and submit IoT sensor data to blockchain
   * @param productId Product ID in Supabase
   * @param sensorData Sensor readings
   * @returns Submission result
   */
  public async processIoTData(
    productId: string,
    sensorData: SensorData
  ): Promise<TransactionResult> {
    if (!this.iotOracleContract || !this.accounts) {
      return { success: false, error: "Contract not initialized" };
    }

    try {
      // Record IoT data in Supabase
      await trackingService.recordIoTData(productId, sensorData);

      // Submit temperature data if available
      if (sensorData.temperature !== undefined) {
        await this.iotOracleContract.methods
          .submitDataPoint(
            `DEVICE_${productId}`,
            1, // Temperature sensor type
            sensorData.temperature,
            "°C",
            "0,0", // Location would come from GPS data
            JSON.stringify({ timestamp: Math.floor(Date.now() / 1000) })
          )
          .send({ from: this.accounts[0] });
      }

      // Submit humidity data if available
      if (sensorData.humidity !== undefined) {
        await this.iotOracleContract.methods
          .submitDataPoint(
            `DEVICE_${productId}`,
            2, // Humidity sensor type
            sensorData.humidity,
            "%",
            "0,0",
            JSON.stringify({ timestamp: Math.floor(Date.now() / 1000) })
          )
          .send({ from: this.accounts[0] });
      }

      // Submit shock data if available
      if (sensorData.shock !== undefined) {
        await this.iotOracleContract.methods
          .submitDataPoint(
            `DEVICE_${productId}`,
            3, // Shock sensor type
            sensorData.shock,
            "G",
            "0,0",
            JSON.stringify({ timestamp: Math.floor(Date.now() / 1000) })
          )
          .send({ from: this.accounts[0] });
      }

      // Check for alerts based on product thresholds
      await this.checkAlerts(productId, sensorData);

      return {
        success: true,
        data: {
          productId,
          sensorData,
        },
      };
    } catch (error) {
      console.error("Error processing IoT data:", error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Update GPS location for a product
   * @param productId Product ID in Supabase
   * @param location Location data
   * @returns Location update result
   */
  public async updateLocation(
    productId: string,
    location: LocationData
  ): Promise<TransactionResult> {
    try {
      // Update location in Supabase
      await trackingService.updateLocation(productId, location);

      // Update blockchain with location data if contract is connected
      if (this.iotOracleContract && this.accounts) {
        const result = await this.iotOracleContract.methods
          .submitDataPoint(
            `GPS_${productId}`,
            5, // GPS sensor type
            location.latitude,
            "lat",
            `${location.latitude},${location.longitude}`,
            JSON.stringify({
              timestamp: Math.floor(Date.now() / 1000),
              longitude: location.longitude,
              accuracy: location.accuracy || 0,
            })
          )
          .send({ from: this.accounts[0] });

        return {
          success: true,
          transactionHash: result.transactionHash,
          data: {
            productId,
            location,
          },
        };
      }

      return {
        success: true,
        data: {
          productId,
          location,
        },
      };
    } catch (error) {
      console.error("Failed to update location:", error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Check sensor data for alert conditions
   * @param productId Product ID
   * @param sensorData Sensor data to check
   */
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

        console.log("Alerts triggered:", alerts);
      }
    } catch (error) {
      console.error("Error checking alerts:", error);
    }
  }

  // ==================== MPC WALLET INTEGRATION ====================

  /**
   * Create a new MPC wallet for multi-party approvals
   * @param signers List of authorized signers
   * @param threshold Minimum number of approvals required
   * @returns Wallet creation result
   */
  public async createMPCWallet(
    signers: string[],
    threshold: number
  ): Promise<TransactionResult> {
    if (!this.mpcWalletContract || !this.accounts) {
      return { success: false, error: "Contract not initialized" };
    }

    try {
      // Generate a unique key ID
      const keyId =
        this.web3?.utils.keccak256(
          this.web3?.utils.toHex(`key_${Date.now()}_${Math.random()}`)
        ) || "0x";

      const tx = await this.mpcWalletContract.methods
        .createKey(
          keyId,
          "0x", // publicKey - empty for now
          threshold,
          signers,
          this.web3?.utils.asciiToHex("supply_chain") || "0x"
        )
        .send({ from: this.accounts[0] });

      return {
        success: true,
        transactionHash: tx.transactionHash,
        data: {
          keyId,
        },
      };
    } catch (error) {
      console.error("Error creating MPC wallet:", error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Initiate a multi-party transaction
   * @param keyId MPC key identifier
   * @param operation Description of operation
   * @returns Transaction initiation result
   */
  public async initiateMPCTransaction(
    keyId: string,
    operation: string
  ): Promise<TransactionResult> {
    if (!this.mpcWalletContract || !this.accounts) {
      return { success: false, error: "Contract not initialized" };
    }

    try {
      const operationHash =
        this.web3?.utils.keccak256(this.web3?.utils.toHex(operation)) || "0x";

      const tx = await this.mpcWalletContract.methods
        .initiateTransaction(keyId, operationHash)
        .send({ from: this.accounts[0] });

      return {
        success: true,
        transactionHash: tx.transactionHash,
        data: {
          transactionId: tx.events.TransactionInitiated?.returnValues?.txId,
        },
      };
    } catch (error) {
      console.error("Error initiating MPC transaction:", error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Approve a pending MPC transaction
   * @param txId Transaction ID
   * @returns Approval result
   */
  public async approveMPCTransaction(txId: string): Promise<TransactionResult> {
    if (!this.mpcWalletContract || !this.accounts) {
      return { success: false, error: "Contract not initialized" };
    }

    try {
      // In a real implementation, this would call the smart contract to approve the transaction
      // For now, we'll simulate the approval
      console.log(`Approved MPC transaction ${txId}`);

      return {
        success: true,
        data: {
          transactionId: txId,
        },
      };
    } catch (error) {
      console.error("Error approving MPC transaction:", error);
      return { success: false, error: (error as Error).message };
    }
  }

  // ==================== UTILITY FUNCTIONS ====================

  /**
   * Get product information by token ID
   * @param tokenId NFT token identifier
   * @returns Product information
   */
  public async getProductInfo(tokenId: number): Promise<TransactionResult> {
    if (!this.nftContract) {
      return { success: false, error: "Contract not initialized" };
    }

    try {
      const product = await this.nftContract.methods.getProduct(tokenId).call();
      const historyCount = (await this.nftContract.methods
        .getProductHistoryCount(tokenId)
        .call()) as unknown as number;

      const history = [];
      for (let i = 0; i < historyCount; i++) {
        const historyItem = await this.nftContract.methods
          .getProductHistoryItem(tokenId, i)
          .call();
        history.push(historyItem);
      }

      return {
        success: true,
        data: {
          ...product,
          tokenId,
          history,
          historyCount,
        },
      };
    } catch (error) {
      console.error("Error getting product info:", error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Get product history from both blockchain and Supabase
   * @param productId Product ID
   * @returns Complete product history
   */
  public async getProductHistory(
    productId: string
  ): Promise<TransactionResult> {
    try {
      // Get history from Supabase
      const supabaseHistory = await trackingService.getProductHistory(
        productId
      );

      // Get product details
      const { data: product } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (!product) {
        return { success: false, error: "Product not found" };
      }

      // Get blockchain history if token ID exists
      let blockchainHistory = null;
      if (product.token_id) {
        const blockchainResult = await this.getProductInfo(
          parseInt(product.token_id)
        );
        if (blockchainResult.success) {
          blockchainHistory = blockchainResult.data;
        }
      }

      return {
        success: true,
        data: {
          product,
          supabaseHistory,
          blockchainHistory,
        },
      };
    } catch (error) {
      console.error("Error getting product history:", error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Get dashboard statistics
   * @returns Dashboard data
   */
  public async getDashboardData(): Promise<TransactionResult> {
    try {
      // Get statistics from Supabase
      const [{ count: totalProducts }, { count: activeShipments }] =
        await Promise.all([
          supabase.from("products").select("*", { count: "exact", head: true }),
          supabase
            .from("products")
            .select("*", { count: "exact", head: true })
            .in("status", ["in_transit", "in_storage"]),
        ]);

      const { data: alerts } = await supabase
        .from("alerts")
        .select("count", { count: "exact" })
        .gte(
          "timestamp",
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        );

      return {
        success: true,
        data: {
          totalProducts: totalProducts || 0,
          activeShipments: activeShipments || 0,
          completedDeliveries: 0, // Would need to implement
          alerts: alerts?.length || 0,
        },
      };
    } catch (error) {
      console.error("Error getting dashboard data:", error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Get current account
   * @returns Current account address
   */
  public async getAccount(): Promise<string | null> {
    return this.accounts ? this.accounts[0] : null;
  }

  /**
   * Get network information
   * @returns Network ID
   */
  public async getNetwork(): Promise<number | null> {
    if (!this.web3) return null;
    const id = await this.web3.eth.net.getId();
    return Number(id);
  }
}

// Export singleton instance
export const proTrackUnifiedService = new ProTrackUnifiedService();
export default proTrackUnifiedService;
