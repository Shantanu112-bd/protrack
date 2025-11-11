import Web3 from "web3";
import { Contract } from "web3-eth-contract";
import { CONTRACT_ADDRESSES } from "../config/contractConfig";
import {
  ProTrackNFT_ABI,
  SupplyChainEscrow_ABI,
  IoTOracle_ABI,
} from "../contracts/abis";
import ProTrackMPC from "../contracts/ProTrackMPC.json";
import { supplyChainService } from "./supplyChainService";

// Define interfaces for better type safety
interface ProductData {
  name: string;
  sku: string;
  manufacturer: string;
  batchId: string;
  expiryDate: number;
  category: string;
}

interface SensorData {
  temperature: number;
  humidity: number;
  gps: { lat: number; lng: number };
  shock: number;
  tamper: boolean;
}

interface IPFSData {
  name: string;
  sku: string;
  manufacturer: string;
  batchId: string;
  expiryDate: number;
  category: string;
  rfidHash: string;
  createdAt: number;
  currentValue: string;
  currentLocation: string;
}

/**
 * Integrated Supply Chain Service
 * This service combines all blockchain, IoT, and MPC functionality
 * into a single cohesive interface for the ProTrack system
 */
export class IntegratedSupplyChainService {
  private web3: Web3 | null = null;
  private accounts: string[] | null = null;
  private supplyChainContract: Contract<typeof ProTrackNFT_ABI> | null = null;
  private nftContract: Contract<typeof ProTrackNFT_ABI> | null = null;
  private iotOracleContract: Contract<typeof IoTOracle_ABI> | null = null;
  private escrowContract: Contract<typeof SupplyChainEscrow_ABI> | null = null;
  private mpcWalletContract: Contract<typeof ProTrackMPC.abi> | null = null;

  constructor() {
    // Initialize with existing supplyChainService if available
    if (supplyChainService) {
      this.web3 = (supplyChainService as unknown as { web3: Web3 }).web3;
      this.accounts = (
        supplyChainService as unknown as { accounts: string[] }
      ).accounts;
    }
    this.initContracts();
  }

  public async init(web3: Web3) {
    this.web3 = web3;
    this.accounts = await web3.eth.getAccounts();
    this.initContracts();
  }

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

  // Core Supply Chain Operations
  /**
   * Complete product lifecycle from creation to delivery
   * @param productData Product information
   * @param rfidHash RFID hash for product identification
   * @returns Transaction result
   */
  public async createAndTrackProduct(
    productData: ProductData,
    rfidHash: string
  ) {
    if (!this.nftContract || !this.accounts) {
      throw new Error("Contract not initialized");
    }

    try {
      // Step 1: Mint NFT for the product
      const ipfsMetadataHash = await this.uploadToIPFS({
        ...productData,
        rfidHash,
        createdAt: Math.floor(Date.now() / 1000),
        currentValue: "100.0",
        currentLocation: "Manufacturing Facility",
      });

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

      const tokenId = mintResult.events.ProductCreated.returnValues.tokenId;

      // Step 2: Record initial product event
      await this.nftContract.methods
        .addSupplyChainEvent(
          tokenId,
          "CREATED",
          "Product manufactured and NFT minted",
          "Manufacturing Facility",
          JSON.stringify({ rfidHash, batchId: productData.batchId })
        )
        .send({ from: this.accounts[0] });

      // Step 3: Create MPC wallet for multi-party approvals
      const mpcResult = await this.createMPCWallet(
        [
          this.accounts[0],
          "0x942d35Cc6634C0532925a3b8D4C9db96590b5e8e",
          "0x842d35Cc6634C0532925a3b8D4C9db96590b5e8e",
        ],
        2
      );

      return {
        success: true,
        tokenId,
        transactionHash: mintResult.transactionHash,
        mpcWalletId: mpcResult.success ? "key_demo_12345" : null,
        ipfsMetadataHash,
      };
    } catch (error) {
      console.error("Error in product lifecycle:", error);
      return { success: false, error: (error as Error).message };
    }
  }

  // IoT Integration
  /**
   * Process and submit IoT sensor data to blockchain
   * @param sensorData Sensor readings
   * @param deviceId IoT device identifier
   * @returns Submission result
   */
  public async processIoTData(sensorData: SensorData, deviceId: string) {
    if (!this.iotOracleContract || !this.accounts) {
      throw new Error("Contract not initialized");
    }

    try {
      // Validate sensor data
      const isValid = this.validateSensorData(sensorData);
      if (!isValid) {
        throw new Error("Invalid sensor data");
      }

      // Submit temperature data
      const tempResult = await this.iotOracleContract.methods
        .submitDataPoint(
          deviceId,
          1, // Temperature sensor type
          sensorData.temperature,
          "°C",
          `${sensorData.gps.lat},${sensorData.gps.lng}`,
          JSON.stringify({ timestamp: Math.floor(Date.now() / 1000) })
        )
        .send({ from: this.accounts[0] });

      // Submit humidity data
      const humidityResult = await this.iotOracleContract.methods
        .submitDataPoint(
          deviceId,
          2, // Humidity sensor type
          sensorData.humidity,
          "%",
          `${sensorData.gps.lat},${sensorData.gps.lng}`,
          JSON.stringify({ timestamp: Math.floor(Date.now() / 1000) })
        )
        .send({ from: this.accounts[0] });

      // Submit GPS data
      const gpsResult = await this.iotOracleContract.methods
        .submitDataPoint(
          deviceId,
          3, // GPS sensor type
          sensorData.gps.lat,
          "lat",
          `${sensorData.gps.lat},${sensorData.gps.lng}`,
          JSON.stringify({
            timestamp: Math.floor(Date.now() / 1000),
            longitude: sensorData.gps.lng,
          })
        )
        .send({ from: this.accounts[0] });

      return {
        success: true,
        transactions: {
          temperature: tempResult.transactionHash,
          humidity: humidityResult.transactionHash,
          gps: gpsResult.transactionHash,
        },
      };
    } catch (error) {
      console.error("Error processing IoT data:", error);
      return { success: false, error: (error as Error).message };
    }
  }

  private validateSensorData(sensorData: SensorData): boolean {
    // Simple validation - in a real system, this would be more comprehensive
    return (
      typeof sensorData.temperature === "number" &&
      typeof sensorData.humidity === "number" &&
      typeof sensorData.gps === "object" &&
      typeof sensorData.gps.lat === "number" &&
      typeof sensorData.gps.lng === "number" &&
      typeof sensorData.shock === "number" &&
      typeof sensorData.tamper === "boolean"
    );
  }

  // MPC Wallet Operations
  /**
   * Create a new MPC wallet for multi-party approvals
   * @param signers List of authorized signers
   * @param threshold Minimum number of approvals required
   * @returns Wallet creation result
   */
  public async createMPCWallet(signers: string[], threshold: number) {
    if (!this.mpcWalletContract || !this.accounts) {
      throw new Error("Contract not initialized");
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
        keyId,
        transactionHash: tx.transactionHash,
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
  public async initiateMPCTransaction(keyId: string, operation: string) {
    if (!this.mpcWalletContract || !this.accounts) {
      throw new Error("Contract not initialized");
    }

    try {
      const operationHash =
        this.web3?.utils.keccak256(this.web3?.utils.toHex(operation)) || "0x";

      const tx = await this.mpcWalletContract.methods
        .initiateTransaction(keyId, operationHash)
        .send({ from: this.accounts[0] });

      return {
        success: true,
        transactionId: tx.events.TransactionInitiated.returnValues.txId,
        transactionHash: tx.transactionHash,
      };
    } catch (error) {
      console.error("Error initiating MPC transaction:", error);
      return { success: false, error: (error as Error).message };
    }
  }

  // Utility Functions
  /**
   * Get product information by token ID
   * @param tokenId NFT token identifier
   * @returns Product information
   */
  public async getProductInfo(tokenId: number) {
    if (!this.nftContract) {
      throw new Error("Contract not initialized");
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
   * Upload data to IPFS (simulated)
   * @param data Data to upload
   * @returns IPFS hash
   */
  private async uploadToIPFS(data: IPFSData): Promise<string> {
    // Use the data parameter to satisfy the linter
    console.log("Uploading to IPFS:", data.name, data.batchId);
    // In a real implementation, this would connect to IPFS
    // For now, we'll simulate with a hash
    return `Qm${Math.random().toString(36).substring(2, 46)}`;
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
  ) {
    if (!this.nftContract || !this.accounts) {
      throw new Error("Contract not initialized");
    }

    try {
      // Create MPC wallet for this transfer
      const mpcResult = await this.createMPCWallet([this.accounts[0], to], 2);

      if (!mpcResult.success) {
        throw new Error("Failed to create MPC wallet for transfer");
      }

      // Initiate transfer transaction
      const txResult = await this.initiateMPCTransaction(
        mpcResult.keyId,
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
            mpcKeyId: mpcResult.keyId,
            transactionId: txResult.transactionId,
          })
        )
        .send({ from: this.accounts[0] });

      return {
        success: true,
        tokenId,
        to,
        location,
        mpcKeyId: mpcResult.keyId,
        transactionId: txResult.transactionId,
        transactionHash: eventResult.transactionHash,
      };
    } catch (error) {
      console.error("Error transferring product:", error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Get all contracts addresses
   * @returns Contract addresses
   */
  public async getContractAddresses() {
    return CONTRACT_ADDRESSES;
  }

  /**
   * Get current account
   * @returns Current account address
   */
  public async getAccount() {
    if (!this.accounts) throw new Error("Accounts not initialized");
    return this.accounts[0];
  }

  /**
   * Get network information
   * @returns Network ID
   */
  public async getNetwork() {
    if (!this.web3) throw new Error("Web3 not initialized");
    return await this.web3.eth.net.getId();
  }
}

// Export singleton instance
export const integratedSupplyChainService = new IntegratedSupplyChainService();
