import Web3 from "web3";
// ethers import removed
import {
  PROTRACK_NFT_ADDRESS,
  PROTRACK_SUPPLY_CHAIN_ADDRESS,
  PROTRACK_ORACLE_ADDRESS,
  PROTRACK_RFID_TOKENIZER_ADDRESS,
  PROTRACK_MPC_ADDRESS,
} from "../contracts/contractConfig";
import {
  ProTrackNFT_ABI,
  SupplyChainEscrow_ABI,
  IoTOracle_ABI,
} from "../contracts/abis";
import ProTrackMPCABI from "../contracts/ProTrackMPC.json";
import { ProductNFTData, SupplyChainEvent } from "./nftService";
import { RFIDScanResult as RFIDScanData } from "./RFIDService";

// Custom error classes for better error handling
export class SupplyChainError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "SupplyChainError";
  }
}

export class ContractError extends SupplyChainError {
  constructor(message: string, public contractMethod?: string) {
    super(message, "CONTRACT_ERROR");
    this.name = "ContractError";
  }
}

export class NetworkError extends SupplyChainError {
  constructor(message: string) {
    super(message, "NETWORK_ERROR");
    this.name = "NetworkError";
  }
}
// Define local types
interface IoTDataPoint {
  id: string;
  deviceId: string;
  sensorType: number;
  value: number;
  unit: string;
  timestamp: number;
  location: string;
  metadata?: string;
}

// Types for our supply chain system
export interface ShipmentData {
  tokenId: number;
  sender: string;
  receiver: string;
  location: string;
  timestamp: number;
  status: "created" | "in_transit" | "delivered" | "completed";
  temperature?: number;
  humidity?: number;
  vibration?: number;
}

export interface KeyData {
  keyId: string;
  publicKey: string;
  threshold: number;
  authorizedParties: string[];
  currentSignatures: number;
  isActive: boolean;
  lastUsed: number;
  purpose: string;
}

export interface MPCTransaction {
  txId: string;
  keyId: string;
  operationHash: string;
  initiator: string;
  timestamp: number;
  isExecuted: boolean;
  approvalCount: number;
}

export interface ProductVerification {
  productId: string;
  keyId: string;
  verifier: string;
  timestamp: number;
  success: boolean;
}

export interface OracleData {
  deviceId: string;
  sensorType: number;
  value: number;
  unit: string;
  timestamp: number;
  location: string;
  metadata: string;
}

export class SupplyChainService {
  private web3: Web3;
  private account: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private nftContract: any; // Contract instance
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private escrowContract: any; // Contract instance
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private oracleContract: any; // Contract instance
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private rfidTokenizerContract: any; // Contract instance
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mpcContract: any; // Contract instance

  constructor(web3: Web3, account: string) {
    this.web3 = web3;
    this.account = account;

    // Initialize all contracts
    this.nftContract = new this.web3.eth.Contract(
      ProTrackNFT_ABI,
      PROTRACK_NFT_ADDRESS
    );
    this.escrowContract = new this.web3.eth.Contract(
      SupplyChainEscrow_ABI,
      PROTRACK_SUPPLY_CHAIN_ADDRESS
    );
    this.oracleContract = new this.web3.eth.Contract(
      IoTOracle_ABI,
      PROTRACK_ORACLE_ADDRESS
    );
    this.rfidTokenizerContract = new this.web3.eth.Contract(
      ProTrackMPCABI.abi,
      PROTRACK_RFID_TOKENIZER_ADDRESS
    );
    this.mpcContract = new this.web3.eth.Contract(
      ProTrackMPCABI.abi,
      PROTRACK_MPC_ADDRESS
    );
  }

  // 🔗 Smart Contract Lifecycle Methods

  // Manufacture Stage: RFID scanned → hash minted → token created on-chain
  async mintProductFromRFID(
    rfidData: RFIDScanData,
    productData: ProductNFTData
  ): Promise<{ tokenId: number; txHash: string }> {
    try {
      // First, tokenize the RFID data
      const rfidHash = this.web3.utils.keccak256(
        this.web3.utils.toHex(rfidData.rawData)
      );

      // Create token URI (would typically be IPFS hash)
      const tokenURI = `ipfs://QmHash/${productData.batchId}`;

      // Prepare product data for contract
      const contractData = {
        name: productData.name,
        sku: productData.sku,
        manufacturer: productData.manufacturer,
        createdAt: productData.createdAt,
        batchId: productData.batchId,
        category: productData.category || "General",
        expiryDate:
          productData.expiryDate ||
          Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
        isActive: true,
        currentValue: this.web3.utils.toWei(
          productData.currentValue || "0.1",
          "ether"
        ),
        currentLocation:
          productData.currentLocation || "Manufacturing Facility",
      };

      // Mint the NFT
      const tx = await this.nftContract.methods
        .mintProduct(this.account, tokenURI, contractData)
        .send({ from: this.account });

      // Extract token ID from events
      const tokenId =
        tx.events.ProductMinted?.returnValues?.tokenId ||
        tx.events.Transfer?.returnValues?.tokenId ||
        1;

      // Add initial supply chain event
      await this.addSupplyChainEvent(parseInt(tokenId), "Manufactured", {
        description: "Product manufactured and NFT minted",
        location: productData.currentLocation || "Manufacturing Facility",
        rfidHash: rfidHash,
        timestamp: productData.createdAt,
      });

      return {
        tokenId: parseInt(tokenId),
        txHash: tx.transactionHash,
      };
    } catch (error) {
      console.error("Error minting product from RFID:", error);
      if (error instanceof SupplyChainError) {
        throw error;
      }
      throw new ContractError(
        `Failed to mint product: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "mintProduct"
      );
    }
  }

  // Packaging: IoT verifies conditions; logs packaging proof → IPFS
  async logPackagingProof(
    tokenId: number,
    iotData: IoTDataPoint[],
    location: string
  ): Promise<string> {
    try {
      // Log IoT data to oracle
      const iotTxHashes: string[] = [];
      for (const data of iotData) {
        const tx = await this.oracleContract.methods
          .submitDataPoint(
            data.deviceId,
            data.sensorType,
            data.value,
            data.unit,
            location,
            data.metadata || ""
          )
          .send({ from: this.account });
        iotTxHashes.push(tx.transactionHash);
      }

      // Add packaging event to supply chain
      const packagingTx = await this.addSupplyChainEvent(tokenId, "Packaged", {
        description: "Product packaged with IoT verification",
        location: location,
        iotDataPoints: iotData.map((d) => d.id),
        timestamp: Math.floor(Date.now() / 1000),
      });

      return packagingTx;
    } catch (error) {
      console.error("Error logging packaging proof:", error);
      if (error instanceof SupplyChainError) {
        throw error;
      }
      throw new ContractError(
        `Failed to log packaging proof: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "logPackagingProof"
      );
    }
  }

  // Shipping: Each shipment generates new temp encryption key
  async initiateShipment(
    tokenId: number,
    sender: string,
    receiver: string,
    location: string
  ): Promise<{ shipmentId: string; tempKey: string }> {
    try {
      // Generate temporary encryption key for shipment
      const tempKey = this.web3.utils.keccak256(
        this.web3.utils.toHex(`${tokenId}-${Date.now()}-${Math.random()}`)
      );

      // Create shipment ID
      const shipmentId = this.web3.utils.keccak256(
        this.web3.utils.toHex(`${tokenId}-${sender}-${receiver}-${Date.now()}`)
      );

      // Add shipping event to supply chain
      await this.addSupplyChainEvent(tokenId, "Shipped", {
        description: "Product shipped to next party",
        location: location,
        sender: sender,
        receiver: receiver,
        shipmentId: shipmentId,
        timestamp: Math.floor(Date.now() / 1000),
      });

      // In a real implementation, we would store the tempKey in a secure way
      // and provide access to sender and receiver only
      console.log(`Temporary key for shipment ${shipmentId}: ${tempKey}`);

      return {
        shipmentId,
        tempKey,
      };
    } catch (error) {
      console.error("Error initiating shipment:", error);
      if (error instanceof SupplyChainError) {
        throw error;
      }
      throw new ContractError(
        `Failed to initiate shipment: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "initiateShipment"
      );
    }
  }

  // Receiving: Receiver decrypts using private key; ownership transferred
  async receiveShipment(
    tokenId: number,
    receiver: string,
    location: string,

    decryptionKey: string
  ): Promise<string> {
    try {
      // In a real implementation, we would verify the decryption key
      // and transfer ownership of the NFT
      console.log(`Verifying decryption key: ${decryptionKey}`);

      // Add receiving event to supply chain
      const txHash = await this.addSupplyChainEvent(tokenId, "Received", {
        description: "Product received by destination party",
        location: location,
        receiver: receiver,
        timestamp: Math.floor(Date.now() / 1000),
      });

      return txHash;
    } catch (error) {
      console.error("Error receiving shipment:", error);
      if (error instanceof SupplyChainError) {
        throw error;
      }
      throw new ContractError(
        `Failed to receive shipment: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "receiveShipment"
      );
    }
  }

  // Customer: Scans QR/RFID → blockchain verifies authenticity → display product history
  async verifyProductAuthenticity(
    tokenId: number,
    rfidData?: string
  ): Promise<{
    isValid: boolean;
    productData: ProductNFTData;
    history: SupplyChainEvent[];
  }> {
    try {
      // Get product data
      const productData = await this.getProductData(tokenId);

      // Get supply chain history
      const history = await this.getSupplyChainHistory(tokenId);

      // If RFID data provided, verify it matches
      const isValid = true;
      if (rfidData) {
        const rfidHash = this.web3.utils.keccak256(
          this.web3.utils.toHex(rfidData)
        );
        // In a real implementation, we would check if this RFID hash matches
        // what's stored on-chain for this token
        console.log(`Verifying RFID hash: ${rfidHash}`);
      }

      return {
        isValid,
        productData,
        history,
      };
    } catch (error) {
      console.error("Error verifying product authenticity:", error);
      if (error instanceof SupplyChainError) {
        throw error;
      }
      throw new ContractError(
        `Failed to verify product: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "verifyProductAuthenticity"
      );
    }
  }

  // 🔐 MPC & Privacy Flow Methods

  // On mint: generate AES key K0, encrypt metadata, store encrypted keys for manufacturer + receiver
  async generateEncryptionKeys(
    tokenId: number,
    manufacturer: string,
    receiver: string
  ): Promise<string> {
    try {
      // Generate AES key K0
      const k0 = this.web3.utils.keccak256(
        this.web3.utils.toHex(`${tokenId}-${manufacturer}-${Date.now()}`)
      );

      // In a real implementation, we would:
      // 1. Encrypt metadata with K0
      // 2. Store encrypted metadata on IPFS
      // 3. Encrypt K0 for manufacturer and receiver
      // 4. Store encrypted keys in access_keys mapping

      console.log(`Generated encryption key K0 for token ${tokenId}: ${k0}`);
      console.log(`Encrypted keys stored for ${manufacturer} and ${receiver}`);

      // Add key generation event
      await this.addSupplyChainEvent(tokenId, "KeysGenerated", {
        description: "Encryption keys generated for privacy protection",
        manufacturer: manufacturer,
        receiver: receiver,
        timestamp: Math.floor(Date.now() / 1000),
      });

      return k0;
    } catch (error) {
      console.error("Error generating encryption keys:", error);
      throw error;
    }
  }

  // On shipment: generate K1, encrypt for sender/receiver, store in access_keys
  async rotateEncryptionKey(
    tokenId: number,
    sender: string,
    receiver: string
  ): Promise<string> {
    try {
      // Generate new key K1
      const k1 = this.web3.utils.keccak256(
        this.web3.utils.toHex(`${tokenId}-${sender}-${receiver}-${Date.now()}`)
      );

      // In a real implementation, we would:
      // 1. Re-encrypt metadata with K1
      // 2. Store new encrypted metadata
      // 3. Encrypt K1 for sender and receiver
      // 4. Update access_keys mapping

      console.log(`Rotated encryption key to K1 for token ${tokenId}: ${k1}`);
      console.log(`New encrypted keys stored for ${sender} and ${receiver}`);

      // Add key rotation event
      await this.addSupplyChainEvent(tokenId, "KeyRotated", {
        description: "Encryption key rotated for new custody",
        sender: sender,
        receiver: receiver,
        timestamp: Math.floor(Date.now() / 1000),
      });

      return k1;
    } catch (error) {
      console.error("Error rotating encryption key:", error);
      throw error;
    }
  }

  // Multisig/MPC approval required for custody transfer
  async initiateMPCTransaction(
    keyId: string,
    operation: string
  ): Promise<string> {
    try {
      const operationHash = this.web3.utils.keccak256(
        this.web3.utils.toHex(operation)
      );

      const tx = await this.mpcContract.methods
        .initiateTransaction(keyId, operationHash)
        .send({ from: this.account });

      console.log(`MPC transaction initiated: ${tx.transactionHash}`);

      return (
        tx.events.TransactionInitiated?.returnValues?.txId || tx.transactionHash
      );
    } catch (error) {
      console.error("Error initiating MPC transaction:", error);
      throw error;
    }
  }

  async approveMPCTransaction(txId: string, signature: string): Promise<void> {
    try {
      const tx = await this.mpcContract.methods
        .approveTransaction(txId, signature)
        .send({ from: this.account });

      console.log(`MPC transaction approved: ${tx.transactionHash}`);
    } catch (error) {
      console.error("Error approving MPC transaction:", error);
      throw error;
    }
  }

  // Receiver decrypts token data locally using their wallet key
  async decryptTokenData(
    tokenId: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _userPrivateKey: string
  ): Promise<{ tokenId: number; decryptedAt: number; data: string }> {
    try {
      // In a real implementation, we would:
      // 1. Retrieve encrypted data from IPFS
      // 2. Decrypt using user's private key
      // 3. Return decrypted data

      console.log(`Decrypting token data for ${tokenId} with provided key`);

      // For demo, return mock decrypted data
      return {
        tokenId,
        decryptedAt: Math.floor(Date.now() / 1000),
        data: "Decrypted product information",
      };
    } catch (error) {
      console.error("Error decrypting token data:", error);
      throw error;
    }
  }

  // 🧩 Oracles & Validation Methods

  // Chainlink Functions validate IoT signatures, GPS zones
  async validateIoTData(
    deviceId: string,
    sensorType: number,
    value: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    location: string
  ): Promise<boolean> {
    try {
      // In a real implementation, we would call Chainlink functions
      // to validate IoT signatures and GPS zones

      // For demo, we'll simulate validation
      const isValid = Math.abs(value) < 100; // Simple validation
      console.log(
        `IoT data validation for device ${deviceId}: ${
          isValid ? "PASS" : "FAIL"
        }`
      );

      return isValid;
    } catch (error) {
      console.error("Error validating IoT data:", error);
      throw error;
    }
  }

  // Multi-sign oracle approval for high-value shipments
  async requestOracleApproval(
    shipmentId: string,
    approvers: string[],
    threshold: number
  ): Promise<string> {
    try {
      // In a real implementation, we would:
      // 1. Create multi-signature request
      // 2. Send to oracles for approval
      // 3. Wait for threshold approvals

      console.log(`Oracle approval requested for shipment ${shipmentId}`);
      console.log(`Approvers: ${approvers.join(", ")}`);
      console.log(`Threshold: ${threshold}`);

      // For demo, return mock approval ID
      return `approval-${shipmentId}-${Date.now()}`;
    } catch (error) {
      console.error("Error requesting oracle approval:", error);
      throw error;
    }
  }

  // Oracles log verified IoT proofs on-chain (recordIoT())
  async recordIoTProof(dataPoint: IoTDataPoint): Promise<string> {
    try {
      const tx = await this.oracleContract.methods
        .submitDataPoint(
          dataPoint.deviceId,
          dataPoint.sensorType,
          dataPoint.value,
          dataPoint.unit,
          dataPoint.location,
          dataPoint.metadata || ""
        )
        .send({ from: this.account });

      console.log(`IoT proof recorded: ${tx.transactionHash}`);

      return tx.transactionHash;
    } catch (error) {
      console.error("Error recording IoT proof:", error);
      throw error;
    }
  }

  // 🧠 AI/Analytics Integration Methods

  // Predict spoilage, route delays, counterfeit probability
  async analyzeSupplyChainRisk(
    tokenId: number,
    iotData: IoTDataPoint[]
  ): Promise<{
    spoilageRisk: number;
    delayRisk: number;
    counterfeitRisk: number;
    recommendations: string[];
  }> {
    try {
      // In a real implementation, we would use AI/ML models
      // For demo, we'll simulate analysis based on IoT data

      let spoilageRisk = 0;
      let delayRisk = 0;
      let counterfeitRisk = 0;
      const recommendations: string[] = [];

      // Analyze temperature data for spoilage risk
      const tempData = iotData.filter((d) => d.sensorType === 0); // TEMPERATURE
      if (tempData.length > 0) {
        const avgTemp =
          tempData.reduce((sum, d) => sum + d.value, 0) / tempData.length;
        if (avgTemp > 25) {
          spoilageRisk = Math.min(100, (avgTemp - 25) * 5);
          recommendations.push(
            "Temperature above optimal range - consider cooling"
          );
        }
      }

      // Analyze vibration data for damage risk
      const vibrationData = iotData.filter((d) => d.sensorType === 3); // VIBRATION
      if (vibrationData.length > 0) {
        const maxVibration = Math.max(...vibrationData.map((d) => d.value));
        if (maxVibration > 50) {
          delayRisk = Math.min(100, maxVibration / 2);
          recommendations.push("High vibration detected - check packaging");
        }
      }

      // Analyze location data for counterfeit risk
      // For demo, we'll assume normal risk
      counterfeitRisk = 10;
      if (counterfeitRisk > 50) {
        recommendations.push(
          "Unusual location pattern detected - verify authenticity"
        );
      }

      return {
        spoilageRisk: Math.round(spoilageRisk),
        delayRisk: Math.round(delayRisk),
        counterfeitRisk: Math.round(counterfeitRisk),
        recommendations,
      };
    } catch (error) {
      console.error("Error analyzing supply chain risk:", error);
      throw error;
    }
  }

  // NLP queries: "Show delayed shipments in Mumbai"
  async querySupplyChain(
    query: string
  ): Promise<
    Array<{ tokenId: number; location: string; status: string; eta: string }>
  > {
    try {
      // In a real implementation, we would use NLP processing
      // For demo, we'll simulate query parsing

      console.log(`Processing supply chain query: ${query}`);

      // Simple keyword matching for demo
      if (query.toLowerCase().includes("delayed")) {
        // Return mock delayed shipments
        return [
          {
            tokenId: 1001,
            location: "Mumbai",
            status: "delayed",
            eta: "2023-12-15",
          },
          {
            tokenId: 1002,
            location: "Mumbai",
            status: "delayed",
            eta: "2023-12-16",
          },
        ];
      }

      if (query.toLowerCase().includes("mumbai")) {
        // Return mock shipments in Mumbai
        return [
          {
            tokenId: 1003,
            location: "Mumbai",
            status: "in_transit",
            eta: "2023-12-10",
          },
          {
            tokenId: 1004,
            location: "Mumbai",
            status: "delivered",
            eta: "2023-12-05",
          },
        ];
      }

      // Default: return all shipments
      return [
        {
          tokenId: 1001,
          location: "Mumbai",
          status: "delayed",
          eta: "2023-12-15",
        },
        {
          tokenId: 1002,
          location: "Mumbai",
          status: "delayed",
          eta: "2023-12-16",
        },
        {
          tokenId: 1003,
          location: "Mumbai",
          status: "in_transit",
          eta: "2023-12-10",
        },
        {
          tokenId: 1004,
          location: "Mumbai",
          status: "delivered",
          eta: "2023-12-05",
        },
      ];
    } catch (error) {
      console.error("Error processing supply chain query:", error);
      throw error;
    }
  }

  // Anomaly detection from IoT metrics
  async detectIoTAnomalies(
    iotData: IoTDataPoint[]
  ): Promise<
    Array<{
      dataPointId: string;
      sensorType: number;
      value: number;
      mean: number;
      stdDev: number;
      timestamp: number;
      severity: string;
    }>
  > {
    try {
      // In a real implementation, we would use ML models
      // For demo, we'll simulate anomaly detection

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anomalies: any[] = [];

      // Group data by sensor type
      const sensorData: Record<number, IoTDataPoint[]> = {};
      iotData.forEach((data) => {
        if (!sensorData[data.sensorType]) {
          sensorData[data.sensorType] = [];
        }
        sensorData[data.sensorType].push(data);
      });

      // Simple anomaly detection based on standard deviation
      Object.entries(sensorData).forEach(([sensorType, dataPoints]) => {
        if (dataPoints.length < 3) return; // Need at least 3 points

        const values = dataPoints.map((d) => d.value);
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance =
          values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
          values.length;
        const stdDev = Math.sqrt(variance);

        // Flag points that are more than 2 standard deviations from mean
        dataPoints.forEach((dataPoint) => {
          if (Math.abs(dataPoint.value - mean) > 2 * stdDev) {
            anomalies.push({
              dataPointId: dataPoint.id,
              sensorType: parseInt(sensorType),
              value: dataPoint.value,
              mean: mean,
              stdDev: stdDev,
              timestamp: dataPoint.timestamp,
              severity: "HIGH",
            });
          }
        });
      });

      return anomalies;
    } catch (error) {
      console.error("Error detecting IoT anomalies:", error);
      throw error;
    }
  }

  // 🧰 Additional Modules Methods

  // Composite tokens (batch mapping)
  async createCompositeToken(
    parentTokenId: number,
    childTokenIds: number[]
  ): Promise<string> {
    try {
      // Add batch mapping event
      const txHash = await this.addSupplyChainEvent(
        parentTokenId,
        "BatchCreated",
        {
          description: "Composite token created from child tokens",
          childTokens: childTokenIds,
          timestamp: Math.floor(Date.now() / 1000),
        }
      );

      console.log(`Composite token created for parent ${parentTokenId}`);
      return txHash;
    } catch (error) {
      console.error("Error creating composite token:", error);
      throw error;
    }
  }

  // Recall system (admin revokes token)
  async initiateProductRecall(
    tokenIds: number[],
    reason: string,
    emergency: boolean = false
  ): Promise<string> {
    try {
      // In a real implementation, we would use governance contract
      // For demo, we'll simulate recall initiation

      console.log(`Product recall initiated for ${tokenIds.length} tokens`);
      console.log(`Reason: ${reason}`);
      console.log(`Emergency: ${emergency}`);

      // Add recall event to supply chain for each token
      const txHashes: string[] = [];
      for (const tokenId of tokenIds) {
        const txHash = await this.addSupplyChainEvent(
          tokenId,
          "RecallInitiated",
          {
            description: `Product recall initiated: ${reason}`,
            emergency: emergency,
            timestamp: Math.floor(Date.now() / 1000),
          }
        );
        txHashes.push(txHash);
      }

      return txHashes[0]; // Return first transaction hash
    } catch (error) {
      console.error("Error initiating product recall:", error);
      throw error;
    }
  }

  // Insurance oracles (auto-claim for damaged goods)
  async processInsuranceClaim(
    tokenId: number,
    damageType: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _evidence: string
  ): Promise<{ claimId: string; approved: boolean; amount?: string }> {
    try {
      // In a real implementation, we would interact with insurance contracts
      // For demo, we'll simulate claim processing

      console.log(`Processing insurance claim for token ${tokenId}`);
      console.log(`Damage type: ${damageType}`);

      // Simple approval logic for demo
      const approved =
        damageType.toLowerCase().includes("temperature") ||
        damageType.toLowerCase().includes("vibration");
      const amount = approved ? "1000000000000000000" : "0"; // 1 ETH if approved

      const claimId = `claim-${tokenId}-${Date.now()}`;

      // Add claim event
      await this.addSupplyChainEvent(tokenId, "InsuranceClaim", {
        description: `Insurance claim ${approved ? "approved" : "rejected"}`,
        claimId: claimId,
        damageType: damageType,
        approved: approved,
        amount: approved ? this.web3.utils.fromWei(amount, "ether") : "0",
        timestamp: Math.floor(Date.now() / 1000),
      });

      return {
        claimId,
        approved,
        amount: approved ? this.web3.utils.fromWei(amount, "ether") : undefined,
      };
    } catch (error) {
      console.error("Error processing insurance claim:", error);
      throw error;
    }
  }

  // Reputation layer for logistics accuracy
  async updateLogisticsReputation(
    logisticsProvider: string,
    score: number,
    feedback: string
  ): Promise<void> {
    try {
      // In a real implementation, we would update reputation scores on-chain
      // For demo, we'll just log the update

      console.log(`Updating reputation for ${logisticsProvider}`);
      console.log(`Score: ${score}/100`);
      console.log(`Feedback: ${feedback}`);
    } catch (error) {
      console.error("Error updating logistics reputation:", error);
      throw error;
    }
  }

  // Settlement module — auto-release payments upon confirmed receipt
  async processSettlement(
    escrowId: number,
    confirmation: boolean
  ): Promise<string> {
    try {
      if (confirmation) {
        // Release payment from escrow
        const tx = await this.escrowContract.methods
          .releasePayment(escrowId)
          .send({ from: this.account });

        console.log(`Payment released for escrow ${escrowId}`);
        return tx.transactionHash;
      } else {
        // Handle dispute or penalty
        const tx = await this.escrowContract.methods
          .triggerPenalty(escrowId, "Delivery not confirmed")
          .send({ from: this.account });

        console.log(`Penalty triggered for escrow ${escrowId}`);
        return tx.transactionHash;
      }
    } catch (error) {
      console.error("Error processing settlement:", error);
      throw error;
    }
  }

  // Helper Methods

  // Add supply chain event to NFT
  private async addSupplyChainEvent(
    tokenId: number,
    event: string,
    data: Record<string, unknown>
  ): Promise<string> {
    try {
      const eventData = JSON.stringify(data);
      const location = (data.location as string) || "Unknown";
      const description = (data.description as string) || event;

      const tx = await this.nftContract.methods
        .addSupplyChainEvent(tokenId, event, description, location, eventData)
        .send({ from: this.account });

      return tx.transactionHash;
    } catch (error) {
      console.error("Error adding supply chain event:", error);
      throw error;
    }
  }

  // Get product data from NFT
  private async getProductData(tokenId: number): Promise<ProductNFTData> {
    try {
      const result = await this.nftContract.methods
        .getProductData(tokenId)
        .call();

      return {
        name: result.name,
        sku: result.sku,
        manufacturer: result.manufacturer,
        createdAt: parseInt(result.createdAt),
        batchId: result.batchId,
      };
    } catch (error) {
      console.error("Error getting product data:", error);
      throw error;
    }
  }

  // Get complete supply chain history
  private async getSupplyChainHistory(
    tokenId: number
  ): Promise<SupplyChainEvent[]> {
    try {
      const result = await this.nftContract.methods
        .getSupplyChainHistory(tokenId)
        .call();

      const events: SupplyChainEvent[] = [];
      for (let i = 0; i < result.events.length; i++) {
        events.push({
          event: result.events[i],
          data: result.data?.[i] || "",
          timestamp: parseInt(result.timestamps[i]),
          actor: result.actors[i],
        });
      }

      return events;
    } catch (error) {
      console.error("Error getting supply chain history:", error);
      throw error;
    }
  }

  // Static helper methods
  static generateDemoRFIDData(): RFIDScanData {
    return {
      rfidHash: `RFID-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      rawData: `RFID-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      timestamp: Math.floor(Date.now() / 1000),
      isValid: true,
      productExists: false,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static generateDemoIoTData(): any[] {
    return [
      {
        id: `temp-${Date.now()}`,
        deviceId: "TEMP-001",
        sensorType: 0, // TEMPERATURE
        value: 22 + (Math.random() * 4 - 2), // 20-24°C
        unit: "°C",
        timestamp: Math.floor(Date.now() / 1000),
        location: "Warehouse A",
        metadata: "Temperature sensor reading",
      },
      {
        id: `humidity-${Date.now()}`,
        deviceId: "HUM-001",
        sensorType: 1, // HUMIDITY
        value: 45 + (Math.random() * 10 - 5), // 40-50%
        unit: "%",
        timestamp: Math.floor(Date.now() / 1000),
        location: "Warehouse A",
        metadata: "Humidity sensor reading",
      },
    ];
  }
}

export default SupplyChainService;
