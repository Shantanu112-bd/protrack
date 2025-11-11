import React, { useState } from "react";
import { useBlockchain } from "../contexts/BlockchainContext";
import { useWeb3 } from "../hooks/useWeb3";
import NFTService from "../services/nftService";

interface NFTProductCreationProps {
  isDark: boolean;
  onProductCreated?: (tokenId: number, txHash: string) => void;
}

const NFTProductCreation: React.FC<NFTProductCreationProps> = ({
  isDark,
  onProductCreated,
}) => {
  const { mintProductNFT, isLoading } = useBlockchain();
  const { account, isActive } = useWeb3();
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    category: "dairy",
    origin: "",
    certifications: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<{
    tokenId: number;
    txHash: string;
  } | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isActive || !account) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      setIsSubmitting(true);

      // Generate NFT data
      const nftData = NFTService.generateDemoNFTData(formData.name);
      nftData.description = formData.description || nftData.description;
      nftData.attributes = [
        { trait_type: "SKU", value: formData.sku },
        { trait_type: "Category", value: formData.category },
        { trait_type: "Origin", value: formData.origin },
        { trait_type: "Quality Grade", value: "A+" },
        { trait_type: "Organic", value: "Yes" },
        { trait_type: "Blockchain Verified", value: "True" },
      ];

      // Mint NFT
      const result = await mintProductNFT(nftData);
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
                className={`block text-sm font-medium ${
                  isDark ? "text-gray-300" : "text-gray-700"
                } mb-2`}
              >
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
                placeholder="e.g., Organic Whole Milk"
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium ${
                  isDark ? "text-gray-300" : "text-gray-700"
                } mb-2`}
              >
                SKU *
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
                placeholder="e.g., MILK-ORG-001"
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium ${
                  isDark ? "text-gray-300" : "text-gray-700"
                } mb-2`}
              >
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                <option value="dairy">Dairy Products</option>
                <option value="meat">Meat & Poultry</option>
                <option value="produce">Fresh Produce</option>
                <option value="grains">Grains & Cereals</option>
                <option value="beverages">Beverages</option>
              </select>
            </div>

            <div>
              <label
                className={`block text-sm font-medium ${
                  isDark ? "text-gray-300" : "text-gray-700"
                } mb-2`}
              >
                Origin
              </label>
              <input
                type="text"
                name="origin"
                value={formData.origin}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
                placeholder="e.g., Green Valley Farm, California"
              />
            </div>
          </div>

          <div>
            <label
              className={`block text-sm font-medium ${
                isDark ? "text-gray-300" : "text-gray-700"
              } mb-2`}
            >
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              }`}
              placeholder="Detailed product description, certifications, and quality attributes..."
            />
          </div>

          {/* Blockchain Features Info */}
          <div
            className={`${
              isDark
                ? "bg-blue-900/20 border-blue-700"
                : "bg-blue-50 border-blue-200"
            } border rounded-lg p-6`}
          >
            <h4
              className={`text-lg font-semibold ${
                isDark ? "text-blue-200" : "text-blue-900"
              } mb-3`}
            >
              🔗 Blockchain Features
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✅</span>
                <span className={isDark ? "text-blue-200" : "text-blue-800"}>
                  Immutable Ownership
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✅</span>
                <span className={isDark ? "text-blue-200" : "text-blue-800"}>
                  Supply Chain Tracking
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✅</span>
                <span className={isDark ? "text-blue-200" : "text-blue-800"}>
                  Smart Contract Automation
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              className={`px-6 py-3 border rounded-lg transition-colors ${
                isDark
                  ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Save Draft
            </button>
            <button
              type="submit"
              disabled={!isActive || isSubmitting || isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Minting NFT...</span>
                </>
              ) : (
                <>
                  <span>🎨</span>
                  <span>Mint Product NFT</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NFTProductCreation;
