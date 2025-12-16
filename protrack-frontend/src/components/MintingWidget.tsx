/**
 * Minting Widget Component
 * Reusable NFT minting component that can be integrated into any page
 */

import React, { useState } from "react";
import { useWeb3 } from "../contexts/web3ContextTypes";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { mintingService, ProductToMint } from "../services/mintingService";
import {
  Layers,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Hash,
} from "lucide-react";

interface MintingWidgetProps {
  product: ProductToMint;
  onMintSuccess?: (tokenId: string) => void;
  onMintError?: (error: string) => void;
  size?: "sm" | "md" | "lg";
  showBadge?: boolean;
}

export const MintingWidget: React.FC<MintingWidgetProps> = ({
  product,
  onMintSuccess,
  onMintError,
  size = "md",
  showBadge = true,
}) => {
  const { account, isActive } = useWeb3();
  const [minting, setMinting] = useState(false);
  const [minted, setMinted] = useState(false);
  const [tokenId, setTokenId] = useState<string | null>(null);

  const handleMint = async () => {
    if (!isActive || !account) {
      onMintError?.("Please connect your wallet first");
      return;
    }

    try {
      setMinting(true);

      const result = await mintingService.mintProduct(product, account);

      if (result.success && result.tokenId) {
        setMinted(true);
        setTokenId(result.tokenId);
        onMintSuccess?.(result.tokenId);
      } else {
        throw new Error(result.error || "Minting failed");
      }
    } catch (error: any) {
      console.error("Minting error:", error);
      onMintError?.(error.message || "Failed to mint NFT");
    } finally {
      setMinting(false);
    }
  };

  // If already minted, show badge
  if (minted && tokenId && showBadge) {
    return (
      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500">
        <CheckCircle className="h-3 w-3 mr-1" />
        Minted #{tokenId}
      </Badge>
    );
  }

  // Size variants
  const sizeClasses = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <Button
      onClick={handleMint}
      disabled={minting || !isActive}
      className={`bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 ${sizeClasses[size]}`}
      title={!isActive ? "Connect wallet to mint" : "Mint as NFT"}
    >
      {minting ? (
        <>
          <Loader2 className={`${iconSizes[size]} mr-2 animate-spin`} />
          Minting...
        </>
      ) : (
        <>
          <Layers className={`${iconSizes[size]} mr-2`} />
          Mint NFT
        </>
      )}
    </Button>
  );
};

/**
 * Minting Status Badge
 * Shows the minting status of a product
 */
interface MintingStatusBadgeProps {
  tokenId?: string | null;
  size?: "sm" | "md" | "lg";
}

export const MintingStatusBadge: React.FC<MintingStatusBadgeProps> = ({
  tokenId,
  size = "md",
}) => {
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-2",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  if (tokenId) {
    return (
      <Badge
        className={`bg-gradient-to-r from-blue-500 to-cyan-500 ${sizeClasses[size]}`}
      >
        <Hash className={`${iconSizes[size]} mr-1`} />#{tokenId}
      </Badge>
    );
  }

  return (
    <Badge
      className={`bg-gradient-to-r from-gray-500 to-gray-700 ${sizeClasses[size]}`}
    >
      <AlertTriangle className={`${iconSizes[size]} mr-1`} />
      Not Minted
    </Badge>
  );
};

/**
 * Batch Minting Component
 * Allows minting multiple products at once
 */
interface BatchMintingProps {
  products: ProductToMint[];
  onComplete?: (results: any[]) => void;
}

export const BatchMinting: React.FC<BatchMintingProps> = ({
  products,
  onComplete,
}) => {
  const { account, isActive } = useWeb3();
  const [minting, setMinting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleBatchMint = async () => {
    if (!isActive || !account) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      setMinting(true);
      setProgress(0);

      const results = [];
      for (let i = 0; i < products.length; i++) {
        const result = await mintingService.mintProduct(products[i], account);
        results.push(result);
        setProgress(Math.round(((i + 1) / products.length) * 100));

        // Add delay between mints
        if (i < products.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      onComplete?.(results);
    } catch (error) {
      console.error("Batch minting error:", error);
      alert("Batch minting failed. Please try again.");
    } finally {
      setMinting(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">
          {products.length} products ready to mint
        </span>
        <Button
          onClick={handleBatchMint}
          disabled={minting || !isActive || products.length === 0}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        >
          {minting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Minting {progress}%
            </>
          ) : (
            <>
              <Layers className="h-4 w-4 mr-2" />
              Mint All ({products.length})
            </>
          )}
        </Button>
      </div>

      {minting && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default MintingWidget;
