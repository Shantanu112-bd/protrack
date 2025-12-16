import React, { useState, useEffect } from "react";
import { useWeb3 } from "../contexts/web3ContextTypes";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { LoadingSpinner } from "./ui/loading-spinner";
import { supabase } from "../services/supabase";
import { dashboardService } from "../services/dashboardService";
import { integratedSupplyChainService } from "../services/integratedSupplyChainService";
import {
  Package,
  Layers,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Hash,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

interface NFTProductCreationProps {
  isDark: boolean;
  onProductCreated?: (tokenId: string, txHash: string) => void;
}

const NFTProductCreation: React.FC<NFTProductCreationProps> = ({
  isDark,
  onProductCreated,
}) => {
  const { account, isActive } = useWeb3();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [minting, setMinting] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [mintedTokens, setMintedTokens] = useState<any[]>([]);
  const [success, setSuccess] = useState<{
    tokenId: string;
    txHash: string;
    productName: string;
  } | null>(null);

  // Load unminted products
  const loadProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .is('token_id', null)
        .eq('owner_wallet', account)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load minted tokens
  const loadMintedTokens = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .not('token_id', 'is', null)
        .eq('owner_wallet', account)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setMintedTokens(data || []);
    } catch (error) {
      console.error('Error loading minted tokens:', error);
    }
  };

  useEffect(() => {
    if (account) {
      loadProducts();
      loadMintedTokens();
    }
  }, [account]);

  const handleMintNFT = async () => {
    if (!isActive || !account || !selectedProduct) {
      alert("Please connect your wallet and select a product");
      return;
    }

    const product = products.find(p => p.id === selectedProduct);
    if (!product) {
      alert("Product not found");
      return;
    }

    try {
      setMinting(selectedProduct);

      // Mint NFT using integrated service
      const result = await integratedSupplyChainService.mintProductNFT({
        rfidHash: product.rfid_tag,
        productName: product.product_name,
        batchNumber: product.batch_no,
        manufacturingDate: product.mfg_date,
        expiryDate: product.exp_date,
        manufacturer: account
      });

      // Update product with token ID
      const { error } = await supabase
        .from('products')
        .update({ 
          token_id: result.toString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedProduct);

      if (error) throw error;

      // Set success state
      setSuccess({
        tokenId: result.toString(),
        txHash: `0x${Math.random().toString(16).substr(2, 64)}`, // Mock tx hash
        productName: product.product_name
      });

      // Refresh data
      await loadProducts();
      await loadMintedTokens();

      // Clear selection
      setSelectedProduct("");

      // Call callback if provided
      if (onProductCreated) {
        onProductCreated(result.toString(), `0x${Math.random().toString(16).substr(2, 64)}`);
      }

    } catch (error) {
      console.error('Error minting NFT:', error);
      alert('Failed to mint NFT. Please try again.');
    } finally {
      setMinting(null);
    }
  };
        txHash: "0x" + Math.random().toString(16).substr(2, 64),
      };

      setSuccess(result);
      onProductCreated?.(result.tokenId, result.txHash);

      // Reset form
      setFormData({
        name: "",
        sku: "",
        description: "",
        category: "dairy",
        origin: "",
        certifications: [],
      });
    } catch (error) {
      console.error("Error creating NFT product:", error);
      alert("Failed to create NFT product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          className={`${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          } rounded-xl p-8 shadow-sm border text-center`}
        >
          <div className="text-6xl mb-6">🎉</div>
          <h3
            className={`text-3xl font-bold ${
              isDark ? "text-white" : "text-gray-900"
            } mb-4`}
          >
            NFT Product Created Successfully!
          </h3>
          <div
            className={`${
              isDark ? "bg-gray-700" : "bg-gray-50"
            } rounded-lg p-6 mb-6`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div>
                <p
                  className={`text-sm font-medium ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  } mb-1`}
                >
                  Token ID
                </p>
                <p
                  className={`text-lg font-mono ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  #{success.tokenId}
                </p>
              </div>
              <div>
                <p
                  className={`text-sm font-medium ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  } mb-1`}
                >
                  Transaction Hash
                </p>
                <p
                  className={`text-sm font-mono ${
                    isDark ? "text-white" : "text-gray-900"
                  } break-all`}
                >
                  {success.txHash}
                </p>
              </div>
            </div>
          </div>
          <div className="flex space-x-4 justify-center">
            <button
              onClick={() => setSuccess(null)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Another Product
            </button>
            <a
              href={`https://etherscan.io/tx/${success.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              View on Etherscan
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div
        className={`${
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } rounded-xl p-8 shadow-sm border`}
      >
        <div className="flex items-center mb-8">
          <div className="text-4xl mr-4">🏭</div>
          <div>
            <h3
              className={`text-2xl font-semibold ${
                isDark ? "text-white" : "text-gray-900"
              } mb-2`}
            >
              Create Product NFT
            </h3>
            <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
              Mint your product as an NFT on the blockchain for immutable
              provenance tracking
            </p>
          </div>
        </div>

        {/* Wallet connection warning */}
        {!isActive && (
          <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
            <p
              className={`${
                isDark ? "text-yellow-200" : "text-yellow-800"
              } text-center`}
            >
              Please connect your wallet to create NFT products
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="name"
                className={`block text-sm font-medium ${
                  isDark ? "text-gray-300" : "text-gray-700"
                } mb-1`}
              >
                Product Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 border ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="e.g., Organic Milk"
              />
            </div>

            <div>
              <label
                htmlFor="sku"
                className={`block text-sm font-medium ${
                  isDark ? "text-gray-300" : "text-gray-700"
                } mb-1`}
              >
                SKU *
              </label>
              <input
                type="text"
                id="sku"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 border ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="e.g., MILK-ORG-001"
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className={`block text-sm font-medium ${
                  isDark ? "text-gray-300" : "text-gray-700"
                } mb-1`}
              >
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              >
                <option value="dairy">Dairy</option>
                <option value="meat">Meat</option>
                <option value="produce">Produce</option>
                <option value="grains">Grains</option>
                <option value="beverages">Beverages</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="origin"
                className={`block text-sm font-medium ${
                  isDark ? "text-gray-300" : "text-gray-700"
                } mb-1`}
              >
                Origin
              </label>
              <input
                type="text"
                id="origin"
                name="origin"
                value={formData.origin}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="e.g., California, USA"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="description"
                className={`block text-sm font-medium ${
                  isDark ? "text-gray-300" : "text-gray-700"
                } mb-1`}
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-3 py-2 border ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Describe your product..."
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!isActive || isSubmitting}
              className={`px-6 py-3 rounded-lg font-medium ${
                !isActive || isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white transition-colors`}
            >
              {isSubmitting ? "Creating NFT..." : "Create NFT"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NFTProductCreation;
