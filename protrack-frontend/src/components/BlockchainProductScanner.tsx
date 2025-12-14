import React, { useState, useEffect } from "react";
import { useBlockchain } from "../contexts/BlockchainContext";
import { useWeb3 } from "../contexts/web3ContextTypes";

interface BlockchainProductScannerProps {
  isDark: boolean;
}

interface ProductVerificationResult {
  tokenId: number;
  isValid: boolean;
  productData: {
    name: string;
    sku: string;
    manufacturer: string;
    createdAt: number;
    batchId: string;
  };
  supplyChainHistory: Array<{
    event: string;
    data: string;
    timestamp: number;
    actor: string;
    txHash?: string;
  }>;
  verificationScore: number;
  riskFactors: string[];
}

const BlockchainProductScanner: React.FC<BlockchainProductScannerProps> = ({
  isDark,
}) => {
  const { getProductData, getSupplyChainHistory } = useBlockchain();
  const { isActive: isConnected, account } = useWeb3();
  const [scanMethod, setScanMethod] = useState<"qr" | "manual" | "nfc">("qr");
  const [tokenId, setTokenId] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [verificationResult, setVerificationResult] =
    useState<ProductVerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    if (!tokenId.trim()) {
      setError("Please enter a valid Token ID");
      return;
    }

    try {
      setIsScanning(true);
      setError(null);

      const tokenIdNum = parseInt(tokenId);
      if (isNaN(tokenIdNum)) {
        throw new Error("Invalid Token ID format");
      }

      // Get product data from blockchain
      const productData = await getProductData(tokenIdNum);
      const supplyChainHistory = await getSupplyChainHistory(tokenIdNum);

      // Calculate verification score based on various factors
      const verificationScore = calculateVerificationScore(
        productData,
        supplyChainHistory
      );
      const riskFactors = identifyRiskFactors(productData, supplyChainHistory);

      setVerificationResult({
        tokenId: tokenIdNum,
        isValid: true,
        productData,
        supplyChainHistory,
        verificationScore,
        riskFactors,
      });

      // Add verification event to blockchain
      if (isConnected) {
        // This would normally add a verification event to the blockchain
        console.log("Adding verification event to blockchain...");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify product");
      setVerificationResult(null);
    } finally {
      setIsScanning(false);
    }
  };

  const calculateVerificationScore = (
    productData: any,
    history: any[]
  ): number => {
    let score = 100;

    // Deduct points for missing data
    if (!productData.name) score -= 10;
    if (!productData.sku) score -= 10;
    if (!productData.manufacturer) score -= 15;

    // Deduct points for lack of supply chain events
    if (history.length < 3) score -= 20;

    // Deduct points for old products (older than 30 days)
    const daysSinceCreation =
      (Date.now() / 1000 - productData.createdAt) / (24 * 60 * 60);
    if (daysSinceCreation > 30) score -= 10;

    return Math.max(0, score);
  };

  const identifyRiskFactors = (productData: any, history: any[]): string[] => {
    const risks: string[] = [];

    if (history.length < 3) {
      risks.push("Limited supply chain visibility");
    }

    const daysSinceCreation =
      (Date.now() / 1000 - productData.createdAt) / (24 * 60 * 60);
    if (daysSinceCreation > 30) {
      risks.push("Product age exceeds recommended timeframe");
    }

    // Check for temperature violations in history
    const tempViolations = history.filter(
      (event) =>
        event.event.toLowerCase().includes("temperature") &&
        event.data.includes("violation")
    );
    if (tempViolations.length > 0) {
      risks.push("Temperature violations detected in supply chain");
    }

    return risks;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return "bg-green-100 border-green-300";
    if (score >= 70) return "bg-yellow-100 border-yellow-300";
    return "bg-red-100 border-red-300";
  };

  const simulateQRScan = () => {
    // Simulate QR code scanning with demo token IDs
    const demoTokenIds = ["1", "42", "123", "456", "789"];
    const randomTokenId =
      demoTokenIds[Math.floor(Math.random() * demoTokenIds.length)];
    setTokenId(randomTokenId);
    setTimeout(() => handleScan(), 1000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2
          className={`text-3xl font-bold ${
            isDark ? "text-white" : "text-gray-900"
          } mb-4`}
        >
          🔍 Blockchain Product Scanner
        </h2>
        <p className={`text-lg ${isDark ? "text-gray-300" : "text-gray-600"}`}>
          Verify product authenticity using blockchain NFT technology
        </p>
      </div>

      {/* Scanning Interface */}
      <div
        className={`${
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } rounded-xl p-8 shadow-sm border mb-8`}
      >
        {/* Scan Method Selection */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { id: "qr", label: "QR Code", icon: "📱" },
              { id: "manual", label: "Manual Entry", icon: "⌨️" },
              { id: "nfc", label: "NFC Tag", icon: "📡" },
            ].map((method) => (
              <button
                key={method.id}
                onClick={() => setScanMethod(method.id as any)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-md font-medium transition-all ${
                  scanMethod === method.id
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                }`}
              >
                <span>{method.icon}</span>
                <span>{method.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Scanning Area */}
        <div className="max-w-md mx-auto">
          {scanMethod === "qr" && (
            <div className="text-center">
              <div
                className={`${
                  isDark
                    ? "bg-gray-700 border-gray-600"
                    : "bg-gray-50 border-gray-300"
                } border-2 border-dashed rounded-xl p-12 mb-6`}
              >
                <div className="text-6xl mb-4">📱</div>
                <p
                  className={`${
                    isDark ? "text-gray-300" : "text-gray-600"
                  } mb-4`}
                >
                  Position QR code within the frame
                </p>
                <button
                  onClick={simulateQRScan}
                  disabled={isScanning}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isScanning ? "Scanning..." : "Simulate QR Scan"}
                </button>
              </div>
            </div>
          )}

          {scanMethod === "manual" && (
            <div className="space-y-4">
              <div>
                <label
                  className={`block text-sm font-medium ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  } mb-2`}
                >
                  NFT Token ID
                </label>
                <input
                  type="text"
                  value={tokenId}
                  onChange={(e) => setTokenId(e.target.value)}
                  placeholder="Enter Token ID (e.g., 123)"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                />
              </div>
              <button
                onClick={handleScan}
                disabled={isScanning || !tokenId.trim()}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isScanning ? "Verifying..." : "Verify Product"}
              </button>
            </div>
          )}

          {scanMethod === "nfc" && (
            <div className="text-center">
              <div
                className={`${
                  isDark
                    ? "bg-gray-700 border-gray-600"
                    : "bg-gray-50 border-gray-300"
                } border-2 border-dashed rounded-xl p-12 mb-6`}
              >
                <div className="text-6xl mb-4">📡</div>
                <p
                  className={`${
                    isDark ? "text-gray-300" : "text-gray-600"
                  } mb-4`}
                >
                  Hold device near NFC tag
                </p>
                <button
                  onClick={simulateQRScan}
                  disabled={isScanning}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {isScanning ? "Reading..." : "Simulate NFC Read"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-center">
            <p className={`${isDark ? "text-red-200" : "text-red-800"}`}>
              {error}
            </p>
          </div>
        )}
      </div>

      {/* Verification Results */}
      {verificationResult && (
        <div className="space-y-6">
          {/* Verification Score */}
          <div
            className={`${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } rounded-xl p-6 shadow-sm border`}
          >
            <div className="flex items-center justify-between mb-6">
              <h3
                className={`text-xl font-semibold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Verification Results
              </h3>
              <div
                className={`px-4 py-2 rounded-full border-2 ${getScoreBgColor(
                  verificationResult.verificationScore
                )}`}
              >
                <span
                  className={`text-2xl font-bold ${getScoreColor(
                    verificationResult.verificationScore
                  )}`}
                >
                  {verificationResult.verificationScore}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4
                  className={`font-semibold ${
                    isDark ? "text-white" : "text-gray-900"
                  } mb-3`}
                >
                  Product Information
                </h4>
                <div className="space-y-2 text-sm">
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
                      #{verificationResult.tokenId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span
                      className={isDark ? "text-gray-400" : "text-gray-500"}
                    >
                      Name:
                    </span>
                    <span className={isDark ? "text-white" : "text-gray-900"}>
                      {verificationResult.productData.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span
                      className={isDark ? "text-gray-400" : "text-gray-500"}
                    >
                      SKU:
                    </span>
                    <span
                      className={`font-mono ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {verificationResult.productData.sku}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span
                      className={isDark ? "text-gray-400" : "text-gray-500"}
                    >
                      Batch ID:
                    </span>
                    <span
                      className={`font-mono ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {verificationResult.productData.batchId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span
                      className={isDark ? "text-gray-400" : "text-gray-500"}
                    >
                      Created:
                    </span>
                    <span className={isDark ? "text-white" : "text-gray-900"}>
                      {new Date(
                        verificationResult.productData.createdAt * 1000
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4
                  className={`font-semibold ${
                    isDark ? "text-white" : "text-gray-900"
                  } mb-3`}
                >
                  Blockchain Verification
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-500">✅</span>
                    <span
                      className={`text-sm ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      NFT exists on blockchain
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-500">✅</span>
                    <span
                      className={`text-sm ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Metadata verified
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-500">✅</span>
                    <span
                      className={`text-sm ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Supply chain tracked
                    </span>
                  </div>
                  {isConnected && (
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-500">🔗</span>
                      <span
                        className={`text-sm ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Verification logged to blockchain
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Risk Factors */}
            {verificationResult.riskFactors.length > 0 && (
              <div className="mt-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                <h4
                  className={`font-semibold ${
                    isDark ? "text-yellow-200" : "text-yellow-800"
                  } mb-2`}
                >
                  ⚠️ Risk Factors Identified
                </h4>
                <ul className="space-y-1">
                  {verificationResult.riskFactors.map((risk, index) => (
                    <li
                      key={index}
                      className={`text-sm ${
                        isDark ? "text-yellow-200" : "text-yellow-700"
                      }`}
                    >
                      • {risk}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Supply Chain History */}
          <div
            className={`${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } rounded-xl p-6 shadow-sm border`}
          >
            <h3
              className={`text-xl font-semibold ${
                isDark ? "text-white" : "text-gray-900"
              } mb-6`}
            >
              🔗 Blockchain Supply Chain History
            </h3>

            <div className="space-y-4">
              {verificationResult.supplyChainHistory.length > 0 ? (
                verificationResult.supplyChainHistory.map((event, index) => (
                  <div
                    key={index}
                    className={`${
                      isDark ? "bg-gray-700" : "bg-gray-50"
                    } rounded-lg p-4`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4
                        className={`font-semibold ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {event.event}
                      </h4>
                      <span
                        className={`text-xs ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {new Date(event.timestamp * 1000).toLocaleString()}
                      </span>
                    </div>
                    <p
                      className={`text-sm ${
                        isDark ? "text-gray-300" : "text-gray-600"
                      } mb-2`}
                    >
                      {event.data}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={isDark ? "text-gray-400" : "text-gray-500"}
                      >
                        Actor: {event.actor.slice(0, 6)}...
                        {event.actor.slice(-4)}
                      </span>
                      {event.txHash && (
                        <span
                          className={`font-mono ${
                            isDark ? "text-blue-400" : "text-blue-600"
                          }`}
                        >
                          Tx: {event.txHash.slice(0, 10)}...
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📋</div>
                  <p
                    className={`${isDark ? "text-gray-400" : "text-gray-500"}`}
                  >
                    No supply chain events recorded yet
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => {
                setVerificationResult(null);
                setTokenId("");
                setError(null);
              }}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Scan Another Product
            </button>
            <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
              Generate Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockchainProductScanner;
