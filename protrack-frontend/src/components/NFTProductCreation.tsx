import React, { useState } from "react";
import { useWeb3 } from "../contexts/web3ContextTypes";

interface NFTProductCreationProps {
  isDark: boolean;
  onProductCreated?: (tokenId: number, txHash: string) => void;
}

const NFTProductCreation: React.FC<NFTProductCreationProps> = ({
  isDark,
  onProductCreated,
}) => {
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

      // For demo purposes, we'll simulate the minting process
      // In a real implementation, this would call the blockchain
      const result = {
        tokenId: Math.floor(Math.random() * 10000),
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
