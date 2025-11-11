/**
 * Product Verification Service for ProTrack
 * Handles blockchain-based product verification and proof validation
 */

import { ethers } from "ethers";
import { supabase } from "./supabase/client";
import { ProTrackNFT_ABI as ProTrackTokenABI } from "../contracts/abis";
import ProTrackMPCABI from "../contracts/ProTrackMPC.json";
import { IoTOracle_ABI as ProTrackOracleABI } from "../contracts/abis";

export interface ProductVerification {
  tokenId: number;
  name: string;
  description: string;
  manufacturer: string;
  manufactureDate: number;
  status: string;
  location: string;
  history: ProductHistoryItem[];
  certifications: string[];
  blockchainProof: BlockchainProof;
  zkProof?: ZKProof;
}

export interface ProductHistoryItem {
  id: number;
  timestamp: number;
  event: string;
  location?: string;
  actor: string;
  metadata?: { [key: string]: string | number | boolean };
}

export interface BlockchainProof {
  transactionHash: string;
  blockNumber: number;
  timestamp: number;
  validator: string;
  signature: string;
  merkleProof?: string[];
}

export interface ZKProof {
  proof: string;
  publicSignals: string[];
  verificationKey: string;
  isValid: boolean;
}

export interface VerificationResult {
  verified: boolean;
  product?: ProductVerification;
  error?: string;
  proofDetails?: {
    onChainData: boolean;
    offChainData: boolean;
    zkProofValid?: boolean;
  };
}

export class VerificationService {
  private provider: ethers.BrowserProvider | null = null;
  private tokenContract: ethers.Contract | null = null;
  private mpcContract: ethers.Contract | null = null;
  private oracleContract: ethers.Contract | null = null;

  constructor(
    private tokenContractAddress: string,
    private mpcContractAddress: string,
    private oracleContractAddress: string
  ) {}

  /**
   * Initialize the verification service with web3 provider
   */
  async initialize(provider: ethers.BrowserProvider) {
    this.provider = provider;
    this.tokenContract = new ethers.Contract(
      this.tokenContractAddress,
      ProTrackTokenABI,
      provider
    );
    this.mpcContract = new ethers.Contract(
      this.mpcContractAddress,
      ProTrackMPCABI.abi,
      provider
    );
    this.oracleContract = new ethers.Contract(
      this.oracleContractAddress,
      ProTrackOracleABI,
      provider
    );
  }

  /**
   * Verify product authenticity using blockchain data
   * @param rfidHash - RFID hash of the product
   * @returns Verification result with product details
   */
  async verifyProductByRFID(rfidHash: string): Promise<VerificationResult> {
    try {
      // First, check if product exists in Supabase
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("rfid_hash", rfidHash)
        .single();

      if (productError || !productData) {
        return {
          verified: false,
          error: "Product not found in database",
        };
      }

      // Verify on-chain token exists
      const tokenId = productData.token_id;
      if (!this.tokenContract) {
        throw new Error("Token contract not initialized");
      }

      const tokenExists = await this.tokenContract.exists(tokenId);
      if (!tokenExists) {
        return {
          verified: false,
          error: "Product token not found on blockchain",
        };
      }

      // Get product details from blockchain
      const productDetails = await this.tokenContract.getProduct(tokenId);

      // Get product history
      const historyCount = await this.tokenContract.getProductHistoryCount(
        tokenId
      );
      const history: ProductHistoryItem[] = [];

      for (let i = 0; i < historyCount; i++) {
        const historyItem = await this.tokenContract.getProductHistoryItem(
          tokenId,
          i
        );
        history.push({
          id: i,
          timestamp: Date.now(), // In a real implementation, this would come from blockchain events
          event: historyItem,
          actor: productDetails.manufacturer,
        });
      }

      // Get blockchain proof
      const blockNumber = await this.provider?.getBlockNumber();
      const block = blockNumber
        ? await this.provider?.getBlock(blockNumber)
        : null;

      const blockchainProof: BlockchainProof = {
        transactionHash: productData.transaction_hash || "0x0",
        blockNumber: blockNumber || 0,
        timestamp: block?.timestamp || Math.floor(Date.now() / 1000),
        validator: productDetails.manufacturer,
        signature: "0x0", // In a real implementation, this would be a real signature
      };

      // Check for ZK proofs
      const zkProof = await this.getZKProofForProduct(tokenId);

      const productVerification: ProductVerification = {
        tokenId,
        name: productDetails.name,
        description: productDetails.description,
        manufacturer: productDetails.manufacturer,
        manufactureDate: productDetails.manufactureDate.toNumber(),
        status: this.getStatusString(productDetails.status),
        location: productDetails.location,
        history,
        certifications: productData.certifications || [],
        blockchainProof,
        zkProof,
      };

      return {
        verified: true,
        product: productVerification,
        proofDetails: {
          onChainData: true,
          offChainData: true,
          zkProofValid: zkProof?.isValid,
        },
      };
    } catch (error) {
      console.error("Product verification failed:", error);
      return {
        verified: false,
        error: error instanceof Error ? error.message : "Verification failed",
      };
    }
  }

  /**
   * Verify product using token ID
   * @param tokenId - Token ID of the product
   * @returns Verification result with product details
   */
  async verifyProductByTokenId(tokenId: number): Promise<VerificationResult> {
    try {
      if (!this.tokenContract) {
        throw new Error("Token contract not initialized");
      }

      // Verify token exists
      const tokenExists = await this.tokenContract.exists(tokenId);
      if (!tokenExists) {
        return {
          verified: false,
          error: "Product token not found on blockchain",
        };
      }

      // Get product details from blockchain
      const productDetails = await this.tokenContract.getProduct(tokenId);

      // Get product from Supabase
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("token_id", tokenId)
        .single();

      // Get product history
      const historyCount = await this.tokenContract.getProductHistoryCount(
        tokenId
      );
      const history: ProductHistoryItem[] = [];

      for (let i = 0; i < historyCount; i++) {
        const historyItem = await this.tokenContract.getProductHistoryItem(
          tokenId,
          i
        );
        history.push({
          id: i,
          timestamp: Date.now(), // In a real implementation, this would come from blockchain events
          event: historyItem,
          actor: productDetails.manufacturer,
        });
      }

      // Get blockchain proof
      const blockNumber = await this.provider?.getBlockNumber();
      const block = blockNumber
        ? await this.provider?.getBlock(blockNumber)
        : null;

      const blockchainProof: BlockchainProof = {
        transactionHash: productData?.transaction_hash || "0x0",
        blockNumber: blockNumber || 0,
        timestamp: block?.timestamp || Math.floor(Date.now() / 1000),
        validator: productDetails.manufacturer,
        signature: "0x0", // In a real implementation, this would be a real signature
      };

      // Check for ZK proofs
      const zkProof = await this.getZKProofForProduct(tokenId);

      const productVerification: ProductVerification = {
        tokenId,
        name: productDetails.name,
        description: productDetails.description,
        manufacturer: productDetails.manufacturer,
        manufactureDate: productDetails.manufactureDate.toNumber(),
        status: this.getStatusString(productDetails.status),
        location: productDetails.location,
        history,
        certifications: productData?.certifications || [],
        blockchainProof,
        zkProof,
      };

      return {
        verified: true,
        product: productVerification,
        proofDetails: {
          onChainData: true,
          offChainData: !!productData && !productError,
          zkProofValid: zkProof?.isValid,
        },
      };
    } catch (error) {
      console.error("Product verification failed:", error);
      return {
        verified: false,
        error: error instanceof Error ? error.message : "Verification failed",
      };
    }
  }

  /**
   * Get ZK proof for a product if available
   * @param tokenId - Token ID of the product
   * @returns ZK proof or null
   */
  private async getZKProofForProduct(tokenId: number): Promise<ZKProof | null> {
    try {
      // Check Supabase for ZK proof
      const { data: zkProofData, error } = await supabase
        .from("zk_proofs")
        .select("*")
        .eq("product_id", tokenId)
        .single();

      if (error || !zkProofData) {
        return null;
      }

      return {
        proof: zkProofData.proof,
        publicSignals: zkProofData.public_signals,
        verificationKey: zkProofData.verification_key,
        isValid: zkProofData.verified,
      };
    } catch (error) {
      console.error("Error fetching ZK proof:", error);
      return null;
    }
  }

  /**
   * Convert product status enum to string
   * @param status - Status enum value
   * @returns Status string
   */
  private getStatusString(status: number): string {
    const statusMap: Record<number, string> = {
      0: "Created",
      1: "In Transit",
      2: "Delivered",
    };

    return statusMap[status] || "Unknown";
  }

  /**
   * Verify a ZK proof
   * @param proof - ZK proof to verify
   * @returns Whether the proof is valid
   */
  async verifyZKProof(proof: ZKProof): Promise<boolean> {
    try {
      // In a real implementation, this would call a ZK verification contract
      // For now, we'll simulate verification
      return proof.isValid;
    } catch (error) {
      console.error("ZK proof verification failed:", error);
      return false;
    }
  }

  /**
   * Generate verification certificate
   * @param verification - Verification result
   * @returns Certificate data
   */
  async generateVerificationCertificate(
    verification: VerificationResult
  ): Promise<string> {
    if (!verification.verified || !verification.product) {
      throw new Error("Cannot generate certificate for unverified product");
    }

    const certificate = {
      productId: verification.product.tokenId,
      productName: verification.product.name,
      manufacturer: verification.product.manufacturer,
      verificationDate: new Date().toISOString(),
      blockchainProof: verification.product.blockchainProof,
      zkProofValid: verification.product.zkProof?.isValid,
      signature: ethers.keccak256(
        ethers.toUtf8Bytes(
          `${verification.product.tokenId}${
            verification.product.manufacturer
          }${Date.now()}`
        )
      ),
    };

    // In a real implementation, this would be signed by the verification service
    return JSON.stringify(certificate);
  }
}

export default VerificationService;
