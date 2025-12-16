/**
 * Enhanced NFT Minting Service
 * Integrates minting functionality across all components
 */

import { supabase } from "./supabase";
import { integratedSupplyChainService } from "./integratedSupplyChainService";
import { fallbackService } from "./fallbackService";

export interface MintingResult {
  success: boolean;
  tokenId?: string;
  transactionHash?: string;
  ipfsHash?: string;
  error?: string;
}

export interface ProductToMint {
  id: string;
  product_name: string;
  rfid_tag: string;
  batch_no: string;
  mfg_date: string;
  exp_date: string;
  owner_wallet: string;
  current_location?: string;
}

class MintingService {
  /**
   * Mint a product as NFT
   * @param product Product to mint
   * @param walletAddress Connected wallet address
   * @returns Minting result with token ID and transaction hash
   */
  async mintProduct(
    product: ProductToMint,
    walletAddress: string
  ): Promise<MintingResult> {
    try {
      console.log("🎨 Starting NFT minting for product:", product.product_name);

      // Validate wallet connection
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }

      // Validate product data
      if (!product.rfid_tag || !product.product_name || !product.batch_no) {
        throw new Error("Invalid product data");
      }

      // Check if already minted
      const { data: existingProduct } = await supabase
        .from("products")
        .select("token_id")
        .eq("id", product.id)
        .single();

      if (existingProduct?.token_id) {
        throw new Error("Product already minted");
      }

      // Mint NFT using integrated supply chain service
      const mintResult = await integratedSupplyChainService.mintProductNFT({
        rfidHash: product.rfid_tag,
        productName: product.product_name,
        batchNumber: product.batch_no,
        manufacturingDate: product.mfg_date,
        expiryDate: product.exp_date,
        manufacturer: walletAddress,
      });

      console.log("✅ NFT minted successfully:", mintResult);

      // Update product in database with token ID
      const { error: updateError } = await supabase
        .from("products")
        .update({
          token_id: mintResult.tokenId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", product.id);

      if (updateError) {
        console.warn("Failed to update database:", updateError);
        // Don't fail the minting if database update fails
      }

      return {
        success: true,
        tokenId: mintResult.tokenId,
        transactionHash: mintResult.transactionHash,
        ipfsHash: mintResult.ipfsHash,
      };
    } catch (error: any) {
      console.error("❌ Minting failed:", error);
      return {
        success: false,
        error: error.message || "Failed to mint NFT",
      };
    }
  }

  /**
   * Batch mint multiple products
   * @param products Array of products to mint
   * @param walletAddress Connected wallet address
   * @returns Array of minting results
   */
  async batchMintProducts(
    products: ProductToMint[],
    walletAddress: string
  ): Promise<MintingResult[]> {
    const results: MintingResult[] = [];

    for (const product of products) {
      const result = await this.mintProduct(product, walletAddress);
      results.push(result);

      // Add delay between mints to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return results;
  }

  /**
   * Get unminted products for a wallet
   * @param walletAddress Wallet address
   * @returns Array of unminted products
   */
  async getUnmintedProducts(walletAddress: string): Promise<ProductToMint[]> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .is("token_id", null)
        .eq("owner_wallet", walletAddress)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error loading unminted products:", error);
      return [];
    }
  }

  /**
   * Get minted products (NFTs) for a wallet
   * @param walletAddress Wallet address
   * @returns Array of minted products
   */
  async getMintedProducts(walletAddress: string): Promise<ProductToMint[]> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .not("token_id", "is", null)
        .eq("owner_wallet", walletAddress)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error loading minted products:", error);
      return [];
    }
  }

  /**
   * Check if a product is minted
   * @param productId Product ID
   * @returns True if minted, false otherwise
   */
  async isProductMinted(productId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("token_id")
        .eq("id", productId)
        .single();

      if (error) return false;
      return !!data?.token_id;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get minting statistics for a wallet
   * @param walletAddress Wallet address
   * @returns Minting statistics
   */
  async getMintingStats(walletAddress: string) {
    try {
      const { data: allProducts } = await supabase
        .from("products")
        .select("token_id")
        .eq("owner_wallet", walletAddress);

      const total = allProducts?.length || 0;
      const minted = allProducts?.filter((p) => p.token_id).length || 0;
      const unminted = total - minted;

      return {
        total,
        minted,
        unminted,
        mintedPercentage: total > 0 ? Math.round((minted / total) * 100) : 0,
      };
    } catch (error) {
      console.error("Error getting minting stats:", error);
      return {
        total: 0,
        minted: 0,
        unminted: 0,
        mintedPercentage: 0,
      };
    }
  }

  /**
   * Verify NFT ownership on blockchain
   * @param tokenId Token ID to verify
   * @param walletAddress Expected owner address
   * @returns True if owner matches, false otherwise
   */
  async verifyNFTOwnership(
    tokenId: string,
    walletAddress: string
  ): Promise<boolean> {
    try {
      // This would call the smart contract to verify ownership
      // For now, we'll check the database
      const { data, error } = await supabase
        .from("products")
        .select("owner_wallet")
        .eq("token_id", tokenId)
        .single();

      if (error) return false;
      return data?.owner_wallet?.toLowerCase() === walletAddress.toLowerCase();
    } catch (error) {
      console.error("Error verifying NFT ownership:", error);
      return false;
    }
  }

  /**
   * Get NFT metadata
   * @param tokenId Token ID
   * @returns NFT metadata
   */
  async getNFTMetadata(tokenId: string) {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("token_id", tokenId)
        .single();

      if (error) throw error;

      return {
        tokenId,
        name: data.product_name,
        description: `Supply chain tracked product: ${data.product_name}`,
        image: `https://api.dicebear.com/7.x/shapes/svg?seed=${tokenId}`,
        attributes: [
          { trait_type: "RFID Tag", value: data.rfid_tag },
          { trait_type: "Batch Number", value: data.batch_no },
          { trait_type: "Manufacturing Date", value: data.mfg_date },
          { trait_type: "Expiry Date", value: data.exp_date },
          { trait_type: "Status", value: data.status },
          { trait_type: "Location", value: data.current_location },
        ],
      };
    } catch (error) {
      console.error("Error getting NFT metadata:", error);
      return null;
    }
  }
}

// Export singleton instance
export const mintingService = new MintingService();
