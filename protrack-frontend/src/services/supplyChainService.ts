import Web3 from "web3";
import { Contract } from "web3-eth-contract";
import { CONTRACT_ADDRESSES } from "../config/contractConfig";
import {
  ProTrackNFT_ABI,
  SupplyChainEscrow_ABI,
  IoTOracle_ABI,
} from "../contracts/abis";
import ProTrackMPC from "../contracts/ProTrackMPC.json";

export class SupplyChainService {
  private web3: Web3 | null = null;
  private accounts: string[] | null = null;
  private supplyChainContract: Contract<typeof ProTrackNFT_ABI> | null = null;
  private nftContract: Contract<typeof ProTrackNFT_ABI> | null = null;
  private iotOracleContract: Contract<typeof IoTOracle_ABI> | null = null;
  private escrowContract: Contract<typeof SupplyChainEscrow_ABI> | null = null;
  private mpcWalletContract: Contract<typeof ProTrackMPC.abi> | null = null;

  constructor() {
    this.initContracts();
  }

  public async init(web3: Web3) {
    this.web3 = web3;
    this.accounts = await web3.eth.getAccounts();
    this.initContracts();
  }

  private initContracts() {
    if (this.web3) {
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
    }
  }

  // Supply Chain Product Management
  public async mintProduct(
    rfidHash: string,
    productName: string,
    batchNumber: string,
    expiryDate: number,
    ipfsMetadataHash: string,
    manufacturer: string
  ) {
    if (!this.supplyChainContract || !this.accounts)
      throw new Error("Contract not initialized");

    try {
      const tx = await this.supplyChainContract.methods
        .mintProduct(
          rfidHash,
          productName,
          batchNumber,
          expiryDate,
          ipfsMetadataHash,
          manufacturer
        )
        .send({ from: this.accounts[0] });

      return { success: true, transactionHash: tx.transactionHash };
    } catch (error) {
      console.error("Error minting product:", error);
      return { success: false, error: (error as Error).message };
    }
  }

  public async transferProduct(
    tokenId: number,
    to: string,
    newStatus: number,
    location: string,
    notes: string
  ) {
    if (!this.supplyChainContract || !this.accounts)
      throw new Error("Contract not initialized");

    try {
      const tx = await this.supplyChainContract.methods
        .transferProduct(tokenId, to, newStatus, location, notes)
        .send({ from: this.accounts[0] });

      return { success: true, transactionHash: tx.transactionHash };
    } catch (error) {
      console.error("Error transferring product:", error);
      return { success: false, error: (error as Error).message };
    }
  }

  public async getProductByRFID(rfidHash: string) {
    if (!this.supplyChainContract) throw new Error("Contract not initialized");

    try {
      const product = await this.supplyChainContract.methods
        .getProductByRFID(rfidHash)
        .call();
      return { success: true, data: product };
    } catch (error) {
      console.error("Error getting product by RFID:", error);
      return { success: false, error: (error as Error).message };
    }
  }

  public async getProductEvents(tokenId: number) {
    if (!this.supplyChainContract) throw new Error("Contract not initialized");

    try {
      const events = await this.supplyChainContract.methods
        .getProductEvents(tokenId)
        .call();
      return { success: true, data: events };
    } catch (error) {
      console.error("Error getting product events:", error);
      return { success: false, error: (error as Error).message };
    }
  }

  // NFT Management
  public async mintNFT(
    to: string,
    tokenURI: string,
    productData: {
      name: string;
      sku: string;
      manufacturer: string;
      createdAt: number;
      batchId: string;
      category: string;
      expiryDate: number;
      isActive: boolean;
      currentValue: string;
      currentLocation: string;
    }
  ) {
    if (!this.nftContract || !this.accounts)
      throw new Error("Contract not initialized");

    try {
      const tx = await this.nftContract.methods
        .mintProduct(to, tokenURI, productData)
        .send({ from: this.accounts[0] });
      return { success: true, transactionHash: tx.transactionHash };
    } catch (error) {
      console.error("Error minting NFT:", error);
      return { success: false, error: (error as Error).message };
    }
  }

  public async addSupplyChainEvent(
    tokenId: number,
    eventType: string,
    description: string,
    location: string,
    data: string
  ) {
    if (!this.nftContract || !this.accounts)
      throw new Error("Contract not initialized");

    try {
      const tx = await this.nftContract.methods
        .addSupplyChainEvent(tokenId, eventType, description, location, data)
        .send({ from: this.accounts[0] });

      return { success: true, transactionHash: tx.transactionHash };
    } catch (error) {
      console.error("Error adding supply chain event:", error);
      return { success: false, error: (error as Error).message };
    }
  }

  // IoT Data Management
  public async registerIoTDevice(
    deviceId: string,
    owner: string,
    supportedSensors: number[],
    location: string,
    metadata: string
  ) {
    if (!this.iotOracleContract || !this.accounts)
      throw new Error("Contract not initialized");

    try {
      const tx = await this.iotOracleContract.methods
        .registerDevice(deviceId, owner, supportedSensors, location, metadata)
        .send({ from: this.accounts[0] });

      return { success: true, transactionHash: tx.transactionHash };
    } catch (error) {
      console.error("Error registering IoT device:", error);
      return { success: false, error: (error as Error).message };
    }
  }

  public async submitIoTData(
    deviceId: string,
    sensorType: number,
    value: number,
    unit: string,
    location: string,
    metadata: string
  ) {
    if (!this.iotOracleContract || !this.accounts)
      throw new Error("Contract not initialized");

    try {
      const tx = await this.iotOracleContract.methods
        .submitDataPoint(deviceId, sensorType, value, unit, location, metadata)
        .send({ from: this.accounts[0] });

      return { success: true, transactionHash: tx.transactionHash };
    } catch (error) {
      console.error("Error submitting IoT data:", error);
      return { success: false, error: (error as Error).message };
    }
  }

  // Escrow Management
  public async createEscrow(
    tokenId: number,
    seller: string,
    expectedDeliveryTime: number,
    deliveryLocation: string,
    autoRelease: boolean,
    amount: string
  ) {
    if (!this.escrowContract || !this.accounts)
      throw new Error("Contract not initialized");

    try {
      const tx = await this.escrowContract.methods
        .createEscrow(
          tokenId,
          seller,
          expectedDeliveryTime,
          deliveryLocation,
          autoRelease
        )
        .send({
          from: this.accounts[0],
          value: this.web3?.utils.toWei(amount, "ether"),
        });

      return { success: true, transactionHash: tx.transactionHash };
    } catch (error) {
      console.error("Error creating escrow:", error);
      return { success: false, error: (error as Error).message };
    }
  }

  public async confirmDelivery(escrowId: number) {
    if (!this.escrowContract || !this.accounts)
      throw new Error("Contract not initialized");

    try {
      const tx = await this.escrowContract.methods
        .confirmDelivery(escrowId)
        .send({ from: this.accounts[0] });
      return { success: true, transactionHash: tx.transactionHash };
    } catch (error) {
      console.error("Error confirming delivery:", error);
      return { success: false, error: (error as Error).message };
    }
  }

  // MPC Wallet Operations
  public async createMPCWallet(signers: string[], threshold: number) {
    if (!this.mpcWalletContract || !this.accounts)
      throw new Error("Contract not initialized");

    try {
      const tx = await this.mpcWalletContract.methods
        .createKey(
          "0x", // publicKey - empty for now
          threshold,
          signers,
          this.web3?.utils.asciiToHex("supply_chain") || "0x"
        )
        .send({ from: this.accounts[0] });

      return { success: true, transactionHash: tx.transactionHash };
    } catch (error) {
      console.error("Error creating MPC wallet:", error);
      return { success: false, error: (error as Error).message };
    }
  }

  public async proposeTransaction(keyId: string, operationHash: string) {
    if (!this.mpcWalletContract || !this.accounts)
      throw new Error("Contract not initialized");

    try {
      const tx = await this.mpcWalletContract.methods
        .initiateTransaction(keyId, operationHash)
        .send({ from: this.accounts[0] });

      return { success: true, transactionHash: tx.transactionHash };
    } catch (error) {
      console.error("Error proposing transaction:", error);
      return { success: false, error: (error as Error).message };
    }
  }

  // Utility functions
  public async getContractAddresses() {
    return CONTRACT_ADDRESSES;
  }

  public async getAccount() {
    if (!this.accounts) throw new Error("Accounts not initialized");
    return this.accounts[0];
  }

  public async getNetwork() {
    if (!this.web3) throw new Error("Web3 not initialized");
    return await this.web3.eth.net.getId();
  }
}

// Export singleton instance
export const supplyChainService = new SupplyChainService();
