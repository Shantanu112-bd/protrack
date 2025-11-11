import React, { useState, useEffect } from "react";
import { useWeb3 } from "../hooks/useWeb3";
import ERC1155Service from "../services/erc1155Service";
import type { ERC1155TokenData } from "../services/erc1155Service";

interface ERC1155TokenManagerProps {
  isDark: boolean;
}

const ERC1155TokenManager: React.FC<ERC1155TokenManagerProps> = ({
  isDark,
}) => {
  const { isActive, account } = useWeb3();
  const [activeTab, setActiveTab] = useState<"mint" | "manage" | "transfer">(
    "mint"
  );
  const [tokenType, setTokenType] = useState<
    "product" | "batch" | "certificate"
  >("product");
  const [isLoading, setIsLoading] = useState(false);
  const [tokens, setTokens] = useState<ERC1155TokenData[]>([]);
  const [mintResult, setMintResult] = useState<{
    tokenId: number;
    txHash: string;
  } | null>(null);

  const erc1155Service = new ERC1155Service();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    supply: 1,
    batchSize: 100,
    certificateType: "organic" as "organic" | "quality" | "safety" | "origin",
  });

  useEffect(() => {
    // Load demo tokens
    const demoTokens: ERC1155TokenData[] = [
      ERC1155Service.generateDemoProductToken("Organic Milk"),
      ERC1155Service.generateDemoBatchToken(50),
      ERC1155Service.generateDemoCertificateToken("organic"),
      ERC1155Service.generateDemoProductToken("Premium Cheese"),
      ERC1155Service.generateDemoBatchToken(25),
      ERC1155Service.generateDemoCertificateToken("quality"),
    ];
    setTokens(demoTokens);
  }, []);

  const handleMintToken = async () => {
    if (!isActive || !account) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      setIsLoading(true);
      let result: { tokenId: number; txHash: string };

      switch (tokenType) {
        case "product": {
          const productData = ERC1155Service.generateDemoProductToken(
            formData.name || "Demo Product"
          );
          result = await erc1155Service.mintProduct(account, productData);
          setTokens((prev) => [...prev, productData]);
          break;
        }

        case "batch": {
          const batchData = ERC1155Service.generateDemoBatchToken(
            formData.batchSize
          );
          batchData.name = formData.name || batchData.name;
          batchData.description = formData.description || batchData.description;
          result = await erc1155Service.mintBatch(account, batchData);
          setTokens((prev) => [...prev, batchData]);
          break;
        }

        case "certificate": {
          const certificateData = ERC1155Service.generateDemoCertificateToken(
            formData.certificateType
          );
          certificateData.name = formData.name || certificateData.name;
          certificateData.description =
            formData.description || certificateData.description;
          certificateData.supply = formData.supply;
          result = await erc1155Service.mintCertificate(
            account,
            certificateData
          );
          setTokens((prev) => [...prev, certificateData]);
          break;
        }

        default:
          throw new Error("Invalid token type");
      }

      setMintResult(result);
      setFormData({
        name: "",
        description: "",
        supply: 1,
        batchSize: 100,
        certificateType: "organic",
      });
    } catch (error) {
      console.error("Error minting token:", error);
      alert("Failed to mint token. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getTokenTypeIcon = (type: string) => {
    switch (type) {
      case "product":
        return "📦";
      case "batch":
        return "📋";
      case "certificate":
        return "🏆";
      default:
        return "🔗";
    }
  };

  const getTokenTypeColor = (type: string) => {
    switch (type) {
      case "product":
        return "blue";
      case "batch":
        return "green";
      case "certificate":
        return "purple";
      default:
        return "gray";
    }
  };

  // Define types for tab and option objects
  type Tab = {
    id: "mint" | "manage" | "transfer";
    label: string;
    icon: string;
  };

  type TokenTypeOption = {
    type: "product" | "batch" | "certificate";
    label: string;
    icon: string;
    desc: string;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2
          className={`text-3xl font-bold ${
            isDark ? "text-white" : "text-gray-900"
          } mb-4`}
        >
          🎨 ERC-1155 Multi-Token Manager
        </h2>
        <p className={`text-lg ${isDark ? "text-gray-300" : "text-gray-600"}`}>
          Manage products, batches, and certificates with advanced multi-token
          standard
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="flex bg-gray-100 rounded-lg p-1">
          {[
            { id: "mint", label: "Mint Tokens", icon: "🎨" },
            { id: "manage", label: "Manage Tokens", icon: "📊" },
            { id: "transfer", label: "Transfer Tokens", icon: "🔄" },
          ].map((tab: Tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mint Tokens Tab */}
      {activeTab === "mint" && (
        <div
          className={`${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          } rounded-xl p-8 shadow-sm border`}
        >
          <h3
            className={`text-xl font-semibold ${
              isDark ? "text-white" : "text-gray-900"
            } mb-6`}
          >
            Mint New Tokens
          </h3>

          {/* Token Type Selection */}
          <div className="mb-6">
            <label
              className={`block text-sm font-medium ${
                isDark ? "text-gray-300" : "text-gray-700"
              } mb-3`}
            >
              Token Type
            </label>
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  type: "product",
                  label: "Product Token",
                  icon: "📦",
                  desc: "Unique product NFT",
                },
                {
                  type: "batch",
                  label: "Batch Token",
                  icon: "📋",
                  desc: "Semi-fungible batch",
                },
                {
                  type: "certificate",
                  label: "Certificate Token",
                  icon: "🏆",
                  desc: "Fungible certificates",
                },
              ].map((option: TokenTypeOption) => (
                <button
                  key={option.type}
                  onClick={() => setTokenType(option.type)}
                  className={`p-4 border-2 rounded-lg transition-all text-center ${
                    tokenType === option.type
                      ? "border-blue-500 bg-blue-50 text-blue-900"
                      : isDark
                      ? "border-gray-600 hover:border-blue-500 hover:bg-gray-700 text-white"
                      : "border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-900"
                  }`}
                >
                  <div className="text-2xl mb-2">{option.icon}</div>
                  <div className="font-medium mb-1">{option.label}</div>
                  <div
                    className={`text-xs ${
                      tokenType === option.type
                        ? "text-blue-700"
                        : isDark
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  >
                    {option.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label
                className={`block text-sm font-medium ${
                  isDark ? "text-gray-300" : "text-gray-700"
                } mb-2`}
              >
                Token Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder={`Enter ${tokenType} name`}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium ${
                  isDark ? "text-gray-300" : "text-gray-700"
                } mb-2`}
              >
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Enter description"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
              />
            </div>

            {/* Conditional Fields */}
            {tokenType === "batch" && (
              <div>
                <label
                  className={`block text-sm font-medium ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  } mb-2`}
                >
                  Batch Size
                </label>
                <input
                  type="number"
                  value={formData.batchSize}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      batchSize: parseInt(e.target.value) || 1,
                    }))
                  }
                  min="1"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              </div>
            )}

            {tokenType === "certificate" && (
              <>
                <div>
                  <label
                    className={`block text-sm font-medium ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    } mb-2`}
                  >
                    Certificate Type
                  </label>
                  <select
                    value={formData.certificateType}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        certificateType: e.target.value as
                          | "organic"
                          | "quality"
                          | "safety"
                          | "origin",
                      }))
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  >
                    <option value="organic">Organic Certification</option>
                    <option value="quality">Quality Assurance</option>
                    <option value="safety">Food Safety</option>
                    <option value="origin">Origin Verification</option>
                  </select>
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    } mb-2`}
                  >
                    Supply Amount
                  </label>
                  <input
                    type="number"
                    value={formData.supply}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        supply: parseInt(e.target.value) || 1,
                      }))
                    }
                    min="1"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  />
                </div>
              </>
            )}
          </div>

          {/* Mint Button */}
          <button
            onClick={handleMintToken}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading ? (
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
                <span>Minting...</span>
              </>
            ) : (
              <>
                <span>{getTokenTypeIcon(tokenType)}</span>
                <span>
                  Mint {tokenType.charAt(0).toUpperCase() + tokenType.slice(1)}{" "}
                  Token
                </span>
              </>
            )}
          </button>

          {/* Mint Result */}
          {mintResult && (
            <div className="mt-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
              <h4
                className={`font-semibold ${
                  isDark ? "text-green-200" : "text-green-800"
                } mb-2`}
              >
                ✅ Token Minted Successfully!
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                    Token ID:{" "}
                  </span>
                  <span
                    className={`font-mono ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    #{mintResult.tokenId}
                  </span>
                </div>
                <div>
                  <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                    Transaction:{" "}
                  </span>
                  <span
                    className={`font-mono text-xs ${
                      isDark ? "text-blue-400" : "text-blue-600"
                    }`}
                  >
                    {mintResult.txHash.slice(0, 10)}...
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manage Tokens Tab */}
      {activeTab === "manage" && (
        <div
          className={`${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          } rounded-xl p-8 shadow-sm border`}
        >
          <h3
            className={`text-xl font-semibold ${
              isDark ? "text-white" : "text-gray-900"
            } mb-6`}
          >
            Your ERC-1155 Tokens
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tokens.map((token, index) => (
              <div
                key={index}
                className={`${
                  isDark ? "bg-gray-700" : "bg-gray-50"
                } rounded-lg p-6 border`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">
                    {getTokenTypeIcon(token.tokenType)}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium bg-${getTokenTypeColor(
                      token.tokenType
                    )}-100 text-${getTokenTypeColor(token.tokenType)}-800`}
                  >
                    {token.tokenType.toUpperCase()}
                  </span>
                </div>

                <h4
                  className={`font-semibold ${
                    isDark ? "text-white" : "text-gray-900"
                  } mb-2`}
                >
                  {token.name}
                </h4>
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  } mb-4`}
                >
                  {token.description}
                </p>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span
                      className={isDark ? "text-gray-400" : "text-gray-500"}
                    >
                      Token ID:
                    </span>
                    <span
                      className={`font-mono ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      #{token.id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span
                      className={isDark ? "text-gray-400" : "text-gray-500"}
                    >
                      Supply:
                    </span>
                    <span className={isDark ? "text-white" : "text-gray-900"}>
                      {token.supply}
                    </span>
                  </div>
                  {token.tokenType === "batch" && "batchSize" in token && (
                    <div className="flex justify-between">
                      <span
                        className={isDark ? "text-gray-400" : "text-gray-500"}
                      >
                        Batch Size:
                      </span>
                      <span className={isDark ? "text-white" : "text-gray-900"}>
                        {(token as BatchTokenData).batchSize}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transfer Tokens Tab */}
      {activeTab === "transfer" && (
        <div
          className={`${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          } rounded-xl p-8 shadow-sm border`}
        >
          <h3
            className={`text-xl font-semibold ${
              isDark ? "text-white" : "text-gray-900"
            } mb-6`}
          >
            Transfer Tokens
          </h3>

          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔄</div>
            <h4
              className={`text-xl font-semibold ${
                isDark ? "text-white" : "text-gray-900"
              } mb-2`}
            >
              Token Transfer Interface
            </h4>
            <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
              Advanced transfer functionality for ERC-1155 tokens coming soon
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Define BatchTokenData interface for type casting
interface BatchTokenData {
  batchSize: number;
}

export default ERC1155TokenManager;
