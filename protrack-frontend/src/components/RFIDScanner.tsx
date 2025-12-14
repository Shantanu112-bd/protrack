import React, { useState, useEffect } from "react";
import { useEnhancedWeb3 } from "../contexts/EnhancedWeb3Context";
import RFIDService, {
  RFIDScanResult,
  ProductMetadata,
} from "../services/RFIDService";

interface RFIDScannerProps {
  onScanComplete?: (result: RFIDScanResult) => void;
  onProductTokenized?: (tokenId: number, transactionHash: string) => void;
  isDark?: boolean;
}

const RFIDScanner: React.FC<RFIDScannerProps> = ({
  onScanComplete,
  onProductTokenized,
  isDark = false,
}) => {
  const { account, isConnected, supplyChainContract } = useEnhancedWeb3();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<RFIDScanResult | null>(null);
  const [isTokenizing, setIsTokenizing] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [productMetadata, setProductMetadata] = useState<ProductMetadata>({
    name: "",
    description: "",
    manufacturer: "",
    batchNumber: "",
    manufacturingDate: Date.now(),
    expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
    category: "",
    certifications: [],
    images: [],
  });

  useEffect(() => {
    // Initialize RFID service with contract
    if (supplyChainContract) {
      RFIDService.initializeContract(
        supplyChainContract.options.address,
        supplyChainContract.options.jsonInterface
      );
    }
  }, [supplyChainContract]);

  const handleScan = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    setIsScanning(true);
    try {
      const result = await RFIDService.scanRFID();
      setScanResult(result);

      if (onScanComplete) {
        onScanComplete(result);
      }

      if (result.isValid && !result.productExists) {
        setShowProductForm(true);
      }
    } catch (error) {
      console.error("Scan failed:", error);
      alert("Scan failed. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleTokenizeProduct = async () => {
    if (!scanResult || !account) return;

    setIsTokenizing(true);
    try {
      const result = await RFIDService.tokenizeProduct(
        {
          rfidHash: scanResult.rfidHash,
          productMetadata,
          manufacturerAddress: account,
        },
        account
      );

      if (result.success && result.tokenId && result.transactionHash) {
        alert(`Product tokenized successfully! Token ID: ${result.tokenId}`);

        if (onProductTokenized) {
          onProductTokenized(result.tokenId, result.transactionHash);
        }

        setShowProductForm(false);
        setScanResult(null);
      } else {
        alert(`Tokenization failed: ${result.error}`);
      }
    } catch (error) {
      console.error("Tokenization failed:", error);
      alert("Tokenization failed. Please try again.");
    } finally {
      setIsTokenizing(false);
    }
  };

  const handleVerifyProduct = async () => {
    if (!scanResult) return;

    try {
      const verification = await RFIDService.verifyProduct(scanResult.rfidHash);

      if (verification.isAuthentic) {
        alert("Product is authentic!");
        console.log("Product details:", verification.product);
        console.log("Supply chain events:", verification.events);
        console.log("IoT data:", verification.iotData);
      } else {
        alert("Product is not authentic or not found in the system.");
      }
    } catch (error) {
      console.error("Verification failed:", error);
      alert("Verification failed. Please try again.");
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setShowProductForm(false);
    setProductMetadata({
      name: "",
      description: "",
      manufacturer: "",
      batchNumber: "",
      manufacturingDate: Date.now(),
      expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
      category: "",
      certifications: [],
      images: [],
    });
  };

  return (
    <div
      className={`max-w-4xl mx-auto p-6 ${
        isDark ? "bg-gray-800" : "bg-white"
      } rounded-xl shadow-lg`}
    >
      <div className="text-center mb-8">
        <h2
          className={`text-3xl font-bold ${
            isDark ? "text-white" : "text-gray-900"
          } mb-2`}
        >
          RFID Product Scanner
        </h2>
        <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
          Scan RFID tags to verify authenticity or tokenize new products
        </p>
      </div>

      {/* Scanner Interface */}
      <div className="text-center mb-8">
        <div
          className={`relative inline-block p-8 rounded-full ${
            isDark ? "bg-gray-700" : "bg-gray-100"
          } mb-6`}
        >
          <div
            className={`w-32 h-32 rounded-full border-4 ${
              isScanning
                ? "border-blue-500 animate-pulse"
                : isDark
                ? "border-gray-500"
                : "border-gray-300"
            } flex items-center justify-center`}
          >
            {isScanning ? (
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
            ) : (
              <svg
                className={`w-16 h-16 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            )}
          </div>
        </div>

        <button
          onClick={handleScan}
          disabled={isScanning || !isConnected}
          className={`px-8 py-3 rounded-lg font-semibold text-white transition-colors ${
            isScanning || !isConnected
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isScanning ? "Scanning..." : "Start RFID Scan"}
        </button>

        {!isConnected && (
          <p className="text-red-500 text-sm mt-2">
            Please connect your wallet to use the scanner
          </p>
        )}
      </div>

      {/* Scan Results */}
      {scanResult && (
        <div
          className={`p-6 rounded-lg ${
            isDark ? "bg-gray-700" : "bg-gray-50"
          } mb-6`}
        >
          <h3
            className={`text-xl font-semibold ${
              isDark ? "text-white" : "text-gray-900"
            } mb-4`}
          >
            Scan Results
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label
                className={`block text-sm font-medium ${
                  isDark ? "text-gray-300" : "text-gray-700"
                } mb-1`}
              >
                RFID Hash
              </label>
              <p
                className={`text-sm font-mono ${
                  isDark ? "text-gray-200" : "text-gray-900"
                } break-all`}
              >
                {scanResult.rfidHash}
              </p>
            </div>

            <div>
              <label
                className={`block text-sm font-medium ${
                  isDark ? "text-gray-300" : "text-gray-700"
                } mb-1`}
              >
                Status
              </label>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    scanResult.isValid ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <span
                  className={`text-sm ${
                    scanResult.isValid ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {scanResult.isValid ? "Valid RFID" : "Invalid RFID"}
                </span>
              </div>
            </div>

            <div>
              <label
                className={`block text-sm font-medium ${
                  isDark ? "text-gray-300" : "text-gray-700"
                } mb-1`}
              >
                Product Status
              </label>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    scanResult.productExists ? "bg-blue-500" : "bg-yellow-500"
                  }`}
                ></div>
                <span
                  className={`text-sm ${
                    isDark ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  {scanResult.productExists
                    ? "Existing Product"
                    : "New Product"}
                </span>
              </div>
            </div>

            <div>
              <label
                className={`block text-sm font-medium ${
                  isDark ? "text-gray-300" : "text-gray-700"
                } mb-1`}
              >
                Scan Time
              </label>
              <p
                className={`text-sm ${
                  isDark ? "text-gray-200" : "text-gray-700"
                }`}
              >
                {new Date(scanResult.timestamp).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex space-x-4">
            {scanResult.productExists ? (
              <button
                onClick={handleVerifyProduct}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Verify Product
              </button>
            ) : (
              <button
                onClick={() => setShowProductForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tokenize Product
              </button>
            )}

            <button
              onClick={resetScanner}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isDark
                  ? "bg-gray-600 text-white hover:bg-gray-500"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              New Scan
            </button>
          </div>
        </div>
      )}

      {/* Product Tokenization Form */}
      {showProductForm && scanResult && (
        <div
          className={`p-6 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-50"}`}
        >
          <h3
            className={`text-xl font-semibold ${
              isDark ? "text-white" : "text-gray-900"
            } mb-4`}
          >
            Product Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
                value={productMetadata.name}
                onChange={(e) =>
                  setProductMetadata({
                    ...productMetadata,
                    name: e.target.value,
                  })
                }
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark
                    ? "bg-gray-800 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium ${
                  isDark ? "text-gray-300" : "text-gray-700"
                } mb-2`}
              >
                Batch Number *
              </label>
              <input
                type="text"
                value={productMetadata.batchNumber}
                onChange={(e) =>
                  setProductMetadata({
                    ...productMetadata,
                    batchNumber: e.target.value,
                  })
                }
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark
                    ? "bg-gray-800 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter batch number"
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium ${
                  isDark ? "text-gray-300" : "text-gray-700"
                } mb-2`}
              >
                Manufacturer *
              </label>
              <input
                type="text"
                value={productMetadata.manufacturer}
                onChange={(e) =>
                  setProductMetadata({
                    ...productMetadata,
                    manufacturer: e.target.value,
                  })
                }
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark
                    ? "bg-gray-800 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter manufacturer name"
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
                value={productMetadata.category}
                onChange={(e) =>
                  setProductMetadata({
                    ...productMetadata,
                    category: e.target.value,
                  })
                }
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark
                    ? "bg-gray-800 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">Select category</option>
                <option value="food">Food & Beverages</option>
                <option value="electronics">Electronics</option>
                <option value="pharmaceuticals">Pharmaceuticals</option>
                <option value="textiles">Textiles</option>
                <option value="automotive">Automotive</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label
                className={`block text-sm font-medium ${
                  isDark ? "text-gray-300" : "text-gray-700"
                } mb-2`}
              >
                Expiry Date *
              </label>
              <input
                type="datetime-local"
                value={new Date(productMetadata.expiryDate)
                  .toISOString()
                  .slice(0, 16)}
                onChange={(e) =>
                  setProductMetadata({
                    ...productMetadata,
                    expiryDate: new Date(e.target.value).getTime(),
                  })
                }
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark
                    ? "bg-gray-800 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>

          <div className="mb-6">
            <label
              className={`block text-sm font-medium ${
                isDark ? "text-gray-300" : "text-gray-700"
              } mb-2`}
            >
              Description
            </label>
            <textarea
              value={productMetadata.description}
              onChange={(e) =>
                setProductMetadata({
                  ...productMetadata,
                  description: e.target.value,
                })
              }
              rows={3}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark
                  ? "bg-gray-800 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter product description"
            />
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleTokenizeProduct}
              disabled={
                isTokenizing ||
                !productMetadata.name ||
                !productMetadata.batchNumber ||
                !productMetadata.manufacturer
              }
              className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
                isTokenizing ||
                !productMetadata.name ||
                !productMetadata.batchNumber ||
                !productMetadata.manufacturer
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isTokenizing ? "Tokenizing..." : "Create Product NFT"}
            </button>

            <button
              onClick={() => setShowProductForm(false)}
              className={`px-4 py-3 rounded-lg transition-colors ${
                isDark
                  ? "bg-gray-600 text-white hover:bg-gray-500"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RFIDScanner;
