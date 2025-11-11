import Web3 from "web3";
import { Contract } from "web3-eth-contract";
import { supabase } from "./supabase";
import { CONTRACT_ADDRESSES } from "../config/contractConfig";
import ProTrackRegistryABI from "../contracts/ProTrackRegistry.json";

export interface RFIDScanResult {
  rfidHash: string;
  rawData: string;
  timestamp: number;
  isValid: boolean;
  productExists: boolean;
  tokenId?: number;
  productData?: Record<string, unknown>;
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

export interface MPCKeyData {
  senderKey: string;
  receiverKey: string;
  productId: string;
}

class RFIDScannerService {
  private web3: Web3 | null = null;
  private registryContract: Contract<typeof ProTrackRegistryABI.abi> | null =
    null;
  private isScanning = false;

  constructor() {
    this.initializeWeb3();
  }

  private async initializeWeb3() {
    if (typeof window.ethereum !== "undefined") {
      this.web3 = new Web3(window.ethereum as unknown as Web3);
      await this.initializeContract();
    }
  }

  private async initializeContract() {
    if (!this.web3) {
      throw new Error("Web3 not initialized");
    }

    this.registryContract = new this.web3.eth.Contract(
      ProTrackRegistryABI.abi,
      CONTRACT_ADDRESSES.SUPPLY_CHAIN
    );
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

      const rfidHash = this.hashRFIDData(mockRFIDData.rawData);
      let productExists = false;
      let tokenId: number | undefined;
      let productData: Record<string, unknown> | null = null;

      // Check if product already exists on blockchain
      if (this.registryContract) {
        try {
          const existingTokenId = await this.registryContract.methods
            .getTokenIdByRFID(rfidHash)
            .call();

          if (existingTokenId && existingTokenId.toString() !== "0") {
            productExists = true;
            tokenId = parseInt(existingTokenId.toString());

            // Get product data
            productData = (await this.registryContract.methods
              .getProduct(tokenId)
              .call()) as Record<string, unknown>;
          }
        } catch (error) {
          // Product doesn't exist, which is fine for new products
          console.log("Product not found on blockchain (new product)");
          console.error("Error checking product existence:", error);
        }
      }

      const scanResult: RFIDScanResult = {
        rfidHash,
        rawData: mockRFIDData.rawData,
        timestamp: Date.now(),
        isValid: this.validateRFIDData(mockRFIDData.rawData),
        productExists,
        tokenId,
        productData: productData || undefined,
      };

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
    const rfidHash = this.hashRFIDData(mockBarcodeData);

    return {
      rfidHash,
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
    if (!this.registryContract || !this.web3) {
      throw new Error("Contract not initialized");
    }

    try {
      // Upload metadata to IPFS if not provided
      let ipfsHash = request.ipfsHash;
      if (!ipfsHash) {
        ipfsHash = await this.uploadToIPFS(request.productMetadata);
      }

      // Mint product token
      const transaction = await this.registryContract.methods
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

      // Store product in Supabase
      await this.storeProductInSupabase(
        tokenId,
        request,
        ipfsHash,
        fromAddress
      );

      // Generate MPC keys for sender and receiver
      await this.generateMPCKeyPair(tokenId.toString(), fromAddress);

      return {
        success: true,
        tokenId,
        transactionHash: transaction.transactionHash,
      };
    } catch (error: unknown) {
      console.error("Tokenization failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Verify product authenticity by RFID
   */
  public async verifyProduct(rfidHash: string): Promise<{
    isAuthentic: boolean;
    product?: Record<string, unknown>;
    events?: Record<string, unknown>[];
    iotData?: Record<string, unknown>[];
  }> {
    if (!this.registryContract) {
      throw new Error("Contract not initialized");
    }

    try {
      const tokenId = await this.registryContract.methods
        .getTokenIdByRFID(rfidHash)
        .call();

      if (!tokenId || tokenId.toString() === "0") {
        return { isAuthentic: false };
      }

      // Get product data
      const product = (await this.registryContract.methods
        .getProduct(tokenId)
        .call()) as Record<string, unknown>;

      // Get IoT data
      const iotData = (await this.registryContract.methods
        .getIoTData(tokenId)
        .call()) as Record<string, unknown>[];

      return {
        isAuthentic: true,
        product,
        iotData: Array.isArray(iotData) ? iotData : [],
      };
    } catch (error) {
      console.error("Product verification failed:", error);
      return { isAuthentic: false };
    }
  }

  /**
   * Get product supply chain history
   */
  public async getProductHistory(tokenId: number): Promise<{
    product: Record<string, unknown>;
    shipments: Record<string, unknown>[];
    iotData: Record<string, unknown>[];
    gpsHistory: Record<string, unknown>[];
  }> {
    if (!this.registryContract) {
      throw new Error("Contract not initialized");
    }

    try {
      const [product, shipments, iotData] = await Promise.all([
        this.registryContract.methods.getProduct(tokenId).call() as Promise<
          Record<string, unknown>
        >,
        this.getShipmentHistory(tokenId),
        this.registryContract.methods.getIoTData(tokenId).call() as Promise<
          Record<string, unknown>[]
        >,
      ]);

      // Get GPS history from Supabase
      const { data: gpsHistory } = await supabase
        .from("iot_data")
        .select("*")
        .eq("product_id", tokenId.toString())
        .not("gps_lat", "is", null)
        .order("recorded_at", { ascending: false });

      return {
        product,
        shipments,
        iotData: Array.isArray(iotData) ? iotData : [],
        gpsHistory: gpsHistory || [],
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
  private async uploadToIPFS(metadata: ProductMetadata): Promise<string> {
    // In real implementation, this would upload to IPFS
    // For demo, we'll return a mock IPFS hash
    const mockHash = `Qm${Math.random().toString(36).substring(2, 46)}`;

    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Log the metadata for debugging
    console.log("Uploading metadata to IPFS:", metadata);

    return mockHash;
  }

  /**
   * Extract token ID from transaction receipt
   */
  private extractTokenIdFromTransaction(
    transaction: Record<string, unknown>
  ): number {
    // Simplified extraction - in a real implementation, you would properly type the transaction object
    try {
      if (transaction.events) {
        const events = transaction.events as Record<string, unknown>;
        const productMinted = events["ProductMinted"] as Record<
          string,
          unknown
        >;
        if (productMinted && productMinted["returnValues"]) {
          const returnValues = productMinted["returnValues"] as Record<
            string,
            unknown
          >;
          return parseInt(returnValues["tokenId"] as string);
        }
      }

      // Fallback: parse from logs
      if (transaction["logs"] && Array.isArray(transaction["logs"])) {
        const logs = transaction["logs"] as unknown[];
        for (const log of logs) {
          const logObj = log as Record<string, unknown>;
          const topics = logObj["topics"] as unknown[];
          if (
            topics &&
            topics[0] ===
              this.web3?.utils.keccak256(
                "ProductMinted(uint256,string,address,string)"
              )
          ) {
            return parseInt(topics[1] as string, 16);
          }
        }
      }
    } catch (error) {
      // Ignore errors and fall through to throw
      console.error("Error extracting token ID:", error);
    }

    throw new Error("Could not extract token ID from transaction");
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
   * Store product in Supabase
   */
  private async storeProductInSupabase(
    tokenId: number,
    request: TokenizationRequest,
    ipfsHash: string,
    manufacturerAddress: string
  ) {
    const { data: manufacturer, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("wallet_address", manufacturerAddress.toLowerCase())
      .single();

    if (userError) {
      throw new Error("Manufacturer not found in system");
    }

    const { error: productError } = await supabase.from("products").insert({
      rfid_tag: request.rfidHash,
      batch_id: request.productMetadata.batchNumber,
      product_name: request.productMetadata.name,
      token_id: tokenId.toString(),
      manufacturer_id: manufacturer?.id,
      expiry_date: new Date(request.productMetadata.expiryDate).toISOString(),
      status: "manufactured",
      // Note: Other fields are not in the current schema
    });

    if (productError) {
      console.error("Failed to store product in Supabase:", productError);
      throw new Error("Failed to store product data");
    }
  }

  /**
   * Generate MPC key pair for sender and receiver
   */
  private async generateMPCKeyPair(
    productId: string,
    senderAddress: string
  ): Promise<MPCKeyData> {
    // In a real implementation, this would interface with an MPC service
    // For demo, we'll generate mock encrypted keys

    // Generate random keys
    const senderKey = `sender_key_${Math.random()
      .toString(36)
      .substring(2, 15)}`;
    const receiverKey = `receiver_key_${Math.random()
      .toString(36)
      .substring(2, 15)}`;

    // Store in Supabase
    const { error } = await supabase
      // Store MPC keys in mpc_key_shares table instead
      .from("mpc_key_shares")
      .insert({
        token_id: productId,
        user_id: senderAddress,
        encrypted_key_share: senderKey,
      });

    if (error) {
      console.error("Failed to store MPC keys:", error);
      throw new Error("Failed to generate access keys");
    }

    return {
      senderKey,
      receiverKey,
      productId,
    };
  }

  /**
   * Get shipment history for a product
   */
  private async getShipmentHistory(
    tokenId: number
  ): Promise<Record<string, unknown>[]> {
    if (!this.registryContract) {
      return [];
    }

    try {
      const shipmentIds = (await this.registryContract.methods
        .getProductShipments(tokenId)
        .call()) as unknown as string[];

      const shipments = [];
      if (Array.isArray(shipmentIds)) {
        for (const shipmentId of shipmentIds) {
          if (shipmentId !== "0") {
            const shipment = (await this.registryContract.methods
              .getShipment(shipmentId)
              .call()) as Record<string, unknown>;
            shipments.push(shipment);
          }
        }
      }
      return shipments;
    } catch (error) {
      console.error("Failed to get shipment history:", error);
      return [];
    }
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

export default new RFIDScannerService();
