import Web3 from "web3";
import { ProTrackNFT_ABI, SupplyChainEscrow_ABI } from "../contracts/abis";
import {
  PROTRACK_NFT_ADDRESS,
  PROTRACK_SUPPLY_CHAIN_ADDRESS,
} from "../contracts/contractConfig";

export interface ProductNFTData {
  name: string;
  sku: string;
  manufacturer: string;
  createdAt: number;
  batchId: string;
  category?: string;
  expiryDate?: number;
  currentValue?: string;
  currentLocation?: string;
  description?: string;
  image?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export interface SupplyChainEvent {
  event: string;
  data: string;
  timestamp: number;
  actor: string;
  txHash?: string;
}

export class NFTService {
  private web3: Web3;
  private account: string;
  private productContract: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  private escrowContract: any; // eslint-disable-line @typescript-eslint/no-explicit-any

  constructor(web3: Web3, account: string) {
    this.web3 = web3;
    this.account = account;

    const nftAddress = PROTRACK_NFT_ADDRESS;
    const escrowAddress = PROTRACK_SUPPLY_CHAIN_ADDRESS;

    this.productContract = new web3.eth.Contract(ProTrackNFT_ABI, nftAddress);
    this.escrowContract = new web3.eth.Contract(
      SupplyChainEscrow_ABI,
      escrowAddress
    );
  }

  // Mint a new product as NFT
  async mintProductNFT(
    productData: ProductNFTData
  ): Promise<{ tokenId: number; txHash: string }> {
    try {
      // In a real implementation, this would upload metadata to IPFS
      // For now, we'll use a placeholder URI
      const tokenURI = `ipfs://QmHash/${productData.batchId}`;

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
        currentLocation: productData.currentLocation || "Unknown",
      };

      const tx = await this.productContract.methods
        .mintProduct(this.account, tokenURI, contractData)
        .send({ from: this.account });

      // Extract token ID from events
      const tokenId =
        tx.events.ProductMinted?.returnValues?.tokenId ||
        tx.events.Transfer?.returnValues?.tokenId ||
        1;

      return {
        tokenId: parseInt(tokenId),
        txHash: tx.transactionHash,
      };
    } catch (error) {
      console.error("Error minting product NFT:", error);
      throw error;
    }
  }

  // Get product data from NFT
  async getProductData(tokenId: number): Promise<ProductNFTData> {
    try {
      const result = await this.productContract.methods
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

  // Add supply chain event to NFT
  async addSupplyChainEvent(
    tokenId: number,
    event: string,
    data: Record<string, unknown>
  ): Promise<string> {
    try {
      const eventData = JSON.stringify(data);
      const location = (data.location as string) || "Unknown";
      const description = (data.description as string) || event;

      const tx = await this.productContract.methods
        .addSupplyChainEvent(tokenId, event, description, location, eventData)
        .send({ from: this.account });

      return tx.transactionHash;
    } catch (error) {
      console.error("Error adding supply chain event:", error);
      throw error;
    }
  }

  // Get complete supply chain history
  async getSupplyChainHistory(tokenId: number): Promise<SupplyChainEvent[]> {
    try {
      const result = await this.productContract.methods
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

  // Create escrow for product transaction
  async createEscrow(
    tokenId: number,
    seller: string,
    amount: string,
    deliveryLocation: string = "Unknown"
  ): Promise<{ escrowId: number; txHash: string }> {
    try {
      const amountWei = this.web3.utils.toWei(amount, "ether");
      const expectedDeliveryTime =
        Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days

      const tx = await this.escrowContract.methods
        .createEscrow(
          tokenId,
          seller,
          expectedDeliveryTime,
          deliveryLocation,
          true
        )
        .send({
          from: this.account,
          value: amountWei,
        });

      const escrowId = tx.events.EscrowCreated?.returnValues?.escrowId || 1;

      return {
        escrowId: parseInt(escrowId),
        txHash: tx.transactionHash,
      };
    } catch (error) {
      console.error("Error creating escrow:", error);
      throw error;
    }
  }

  // Release escrow payment
  async releaseEscrowPayment(escrowId: number): Promise<string> {
    try {
      const tx = await this.escrowContract.methods
        .releasePayment(escrowId)
        .send({ from: this.account });

      return tx.transactionHash;
    } catch (error) {
      console.error("Error releasing escrow payment:", error);
      throw error;
    }
  }

  // Trigger penalty for SLA breach
  async triggerPenalty(escrowId: number, reason: string): Promise<string> {
    try {
      const tx = await this.escrowContract.methods
        .triggerPenalty(escrowId, reason)
        .send({ from: this.account });

      return tx.transactionHash;
    } catch (error) {
      console.error("Error triggering penalty:", error);
      throw error;
    }
  }

  // Simulate demo data for development
  static generateDemoNFTData(productName: string): ProductNFTData {
    const timestamp = Math.floor(Date.now() / 1000);
    const batchId = `BATCH-${timestamp}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    return {
      name: productName,
      sku: `SKU-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      manufacturer: "0x742d35Cc6634C0532925a3b8D4C9db96590b5e8e",
      createdAt: timestamp,
      batchId,
      description: `Premium ${productName} with blockchain verification`,
      attributes: [
        { trait_type: "Quality Grade", value: "A+" },
        { trait_type: "Origin", value: "Certified Farm" },
        { trait_type: "Organic", value: "Yes" },
      ],
    };
  }
}

export default NFTService;
