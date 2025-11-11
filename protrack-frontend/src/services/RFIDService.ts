/**
 * RFID Scanner Integration Service
 * Handles RFID tag scanning, validation, and tokenization
 */

import Web3 from "web3";
import { Contract } from "web3-eth-contract";

export interface RFIDScanResult {
  rfidHash: string;
  rawData: string;
  timestamp: number;
  isValid: boolean;
  productExists: boolean;
  tokenId?: number;
}

export interface ProductMetadata {
  name: string;
  description: string;
  manufacturer: string;
  batchNumber: string;
  manufacturingDate: number;
  expiryDate: number;
  category: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  certifications: string[];
  images: string[];
}

export interface TokenizationRequest {
  rfidHash: string;
  productMetadata: ProductMetadata;
  manufacturerAddress: string;
  ipfsHash?: string;
}

class RFIDService {
  private web3: Web3 | null = null;
  private supplyChainContract: Contract<[]> | null = null;
  private isScanning = false;

  constructor() {
    this.initializeWeb3();
  }

  private async initializeWeb3() {
    if (typeof window.ethereum !== "undefined") {
      this.web3 = new Web3(window.ethereum as unknown as string);
      // Contract will be initialized when needed
    }
  }

  /**
   * Initialize smart contract connection
   */
  public async initializeContract(contractAddress: string, abi: []) {
    if (!this.web3) {
      throw new Error("Web3 not initialized");
    }

    this.supplyChainContract = new this.web3.eth.Contract(abi, contractAddress);
  }

  /**
   * Simulate RFID scanning (in real implementation, this would interface with RFID hardware)
   */
  public async scanRFID(): Promise<RFIDScanResult> {
    if (this.isScanning) {
      throw new Error("Scan already in progress");
    }

    this.isScanning = true;

    try {
      // Simulate RFID scan delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In real implementation, this would read from RFID hardware
      // For demo, we'll generate a mock RFID reading
      const mockRFIDData = this.generateMockRFIDData();

      const scanResult: RFIDScanResult = {
        rfidHash: this.hashRFIDData(mockRFIDData.rawData),
        rawData: mockRFIDData.rawData,
        timestamp: Date.now(),
        isValid: this.validateRFIDData(mockRFIDData.rawData),
        productExists: false,
      };

      // Check if product already exists on blockchain
      if (this.supplyChainContract && scanResult.isValid) {
        try {
          const product = (await this.supplyChainContract.methods
            .getProductByRFID(scanResult.rfidHash)
            .call()) as unknown as {
            tokenId: string | number;
            [key: string]: unknown;
          };

          if (parseInt(product.tokenId.toString()) > 0) {
            scanResult.productExists = true;
            scanResult.tokenId = parseInt(product.tokenId.toString());
          }
        } catch (_error) {
          // Product doesn't exist, which is fine for new products
          console.log("Product not found on blockchain (new product)");
        }
      }

      return scanResult;
    } finally {
      this.isScanning = false;
    }
  }

  /**
   * Scan RFID with barcode fallback
   */
  public async scanWithBarcodeFallback(): Promise<RFIDScanResult> {
    try {
      return await this.scanRFID();
    } catch (rfidError) {
      console.warn("RFID scan failed, attempting barcode scan:", rfidError);
      return await this.scanBarcode();
    }
  }

  /**
   * Scan barcode as fallback
   */
  public async scanBarcode(): Promise<RFIDScanResult> {
    // Simulate barcode scanning
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const mockBarcodeData = this.generateMockBarcodeData();

    return {
      rfidHash: this.hashRFIDData(mockBarcodeData),
      rawData: mockBarcodeData,
      timestamp: Date.now(),
      isValid: true,
      productExists: false,
    };
  }

  /**
   * Tokenize a product on the blockchain
   */
  public async tokenizeProduct(
    request: TokenizationRequest,
    fromAddress: string
  ): Promise<{
    success: boolean;
    tokenId?: number;
    transactionHash?: string;
    error?: string;
  }> {
    if (!this.supplyChainContract || !this.web3) {
      throw new Error("Contract not initialized");
    }

    try {
      // Upload metadata to IPFS if not provided
      let ipfsHash = request.ipfsHash;
      if (!ipfsHash) {
        ipfsHash = await this.uploadToIPFS(request.productMetadata);
      }

      // Mint product NFT
      const transaction = await this.supplyChainContract.methods
        .mintProduct(
          request.rfidHash,
          request.productMetadata.name,
          request.productMetadata.batchNumber,
          Math.floor(request.productMetadata.expiryDate / 1000), // Convert to seconds
          ipfsHash,
          request.manufacturerAddress
        )
        .send({ from: fromAddress });

      // Extract token ID from transaction events
      const tokenId = this.extractTokenIdFromTransaction(transaction);

      return {
        success: true,
        tokenId,
        transactionHash: transaction.transactionHash,
      };
    } catch (error: unknown) {
      console.error("Tokenization failed:", error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Verify product authenticity by RFID
   */
  public async verifyProduct(rfidHash: string): Promise<{
    isAuthentic: boolean;
    product?: Record<string, unknown>;
    events?: unknown[];
    iotData?: unknown[];
  }> {
    if (!this.supplyChainContract) {
      throw new Error("Contract not initialized");
    }

    try {
      const product = (await this.supplyChainContract.methods
        .getProductByRFID(rfidHash)
        .call()) as unknown as { tokenId: string; [key: string]: unknown };

      if (product.tokenId === "0") {
        return { isAuthentic: false, events: [], iotData: [] };
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
        isAuthentic: true,
        product,
        events: Array.isArray(events) ? events : [],
        iotData: Array.isArray(iotData) ? iotData : [],
      };
    } catch (error) {
      console.error("Product verification failed:", error);
      return { isAuthentic: false, events: [], iotData: [] };
    }
  }

  /**
   * Get product supply chain history
   */
  public async getProductHistory(tokenId: number): Promise<{
    product: Record<string, unknown>;
    events: unknown[];
    iotData: unknown[];
    gpsHistory: unknown[];
  }> {
    if (!this.supplyChainContract) {
      throw new Error("Contract not initialized");
    }

    try {
      const [product, events, iotData] = await Promise.all([
        this.supplyChainContract.methods.products(tokenId).call() as Promise<
          Record<string, unknown>
        >,
        this.supplyChainContract.methods
          .getProductEvents(tokenId)
          .call() as Promise<unknown[]>,
        this.supplyChainContract.methods
          .getProductIoTData(tokenId)
          .call() as Promise<unknown[]>,
      ]);

      // TODO: Get GPS history from oracle contract
      const gpsHistory: unknown[] = [];

      return {
        product,
        events,
        iotData,
        gpsHistory,
      };
    } catch (error) {
      console.error("Failed to get product history:", error);
      throw error;
    }
  }

  /**
   * Generate cryptographic hash from RFID data
   */
  private hashRFIDData(rawData: string): string {
    if (!this.web3) {
      // Fallback hash function
      return this.simpleHash(rawData);
    }

    return this.web3.utils.keccak256(rawData);
  }

  /**
   * Validate RFID data format and integrity
   */
  private validateRFIDData(rawData: string): boolean {
    // Basic validation rules
    if (!rawData || rawData.length < 8) {
      return false;
    }

    // Check for valid RFID format (simplified)
    const rfidPattern = /^[A-F0-9]{8,24}$/i;
    return rfidPattern.test(rawData.replace(/[^A-F0-9]/gi, ""));
  }

  /**
   * Generate mock RFID data for testing
   */
  private generateMockRFIDData(): { rawData: string; productCode: string } {
    const productCode = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();
    const serialNumber = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, "0");
    const checksum = Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, "0");

    const rawData = `${productCode}${serialNumber}${checksum}`;

    return { rawData, productCode };
  }

  /**
   * Generate mock barcode data
   */
  private generateMockBarcodeData(): string {
    // Generate EAN-13 style barcode
    const countryCode = "123"; // Mock country code
    const manufacturerCode = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    const productCode = Math.floor(Math.random() * 100000)
      .toString()
      .padStart(5, "0");
    const checkDigit = Math.floor(Math.random() * 10);

    return `${countryCode}${manufacturerCode}${productCode}${checkDigit}`;
  }

  /**
   * Upload metadata to IPFS
   */
  private async uploadToIPFS(_metadata: ProductMetadata): Promise<string> {
    // Use the _metadata parameter to satisfy the linter
    console.log("Uploading metadata to IPFS:", _metadata.name);
    // In real implementation, this would upload to IPFS
    // For demo, we'll return a mock IPFS hash
    const mockHash = `Qm${Math.random().toString(36).substring(2, 46)}`;

    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return mockHash;
  }

  /**
   * Extract token ID from transaction receipt
   */
  private extractTokenIdFromTransaction(
    transaction: Record<string, unknown>
  ): number {
    // Use the transaction parameter to satisfy the linter
    console.log("Extracting token ID from transaction:", transaction);
    // In a real implementation, this would properly extract the token ID
    return Math.floor(Math.random() * 1000) + 1;
  }

  /**
   * Simple hash function fallback
   */
  private simpleHash(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return `0x${Math.abs(hash).toString(16).padStart(64, "0")}`;
  }

  /**
   * Check if scanner is currently active
   */
  public isCurrentlyScanning(): boolean {
    return this.isScanning;
  }

  /**
   * Stop current scan operation
   */
  public stopScanning(): void {
    this.isScanning = false;
  }
}

export default new RFIDService();
