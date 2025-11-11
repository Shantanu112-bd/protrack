import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scan,
  Lock,
  Unlock,
  QrCode,
  Radio,
  MapPin,
  CheckCircle,
  AlertCircle,
  Zap,
  Database,
  Hash,
} from "lucide-react";
import { useEnhancedWeb3 } from "../contexts/EnhancedWeb3Context";

interface RFIDScanResult {
  rfidHash: string;
  rawData: string;
  timestamp: number;
  location: string;
  isEncrypted: boolean;
  tokenId?: number;
  productName?: string;
  batchNumber?: string;
}

interface BatchScanData {
  batchId: string;
  scannedItems: RFIDScanResult[];
  totalItems: number;
  completionPercentage: number;
}

const AdvancedRFIDScanner: React.FC = () => {
  const { isConnected, scanRFID, tokenizeRFID } = useEnhancedWeb3();

  const [isScanning, setIsScanning] = useState(false);
  const [scanMode, setScanMode] = useState<"single" | "batch" | "continuous">(
    "single"
  );
  const [scanResults, setScanResults] = useState<RFIDScanResult[]>([]);
  const [batchData, setBatchData] = useState<BatchScanData | null>(null);
  const [selectedResult, setSelectedResult] = useState<RFIDScanResult | null>(
    null
  );
  const [showPrivacyMode, setShowPrivacyMode] = useState(false);
  const [gpsLocation, setGpsLocation] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Tokenization form state
  const [showTokenizeForm, setShowTokenizeForm] = useState(false);
  const [tokenizeData, setTokenizeData] = useState({
    productName: "",
    batchNumber: "",
    expiryDate: "",
    authorizedUsers: [""],
    enablePrivacy: true,
  });

  // Simulated RFID scanner
  const scannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get user's GPS location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setGpsLocation(`${latitude.toFixed(6)},${longitude.toFixed(6)}`);
        },
        (error) => {
          console.error("Error getting location:", error);
          setGpsLocation("Location unavailable");
        }
      );
    }
  }, []);

  const generateMockRFIDData = () => {
    const prefixes = ["PROD", "BATCH", "ITEM", "PKG"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}_${timestamp}_${random}`;
  };

  const handleScanRFID = async () => {
    if (!isConnected) return;

    setIsScanning(true);
    setLoading(true);

    try {
      // Simulate RFID scan delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockRFIDData = generateMockRFIDData();
      const rfidHash = await scanRFID(mockRFIDData, gpsLocation);

      const newScanResult: RFIDScanResult = {
        rfidHash,
        rawData: mockRFIDData,
        timestamp: Date.now(),
        location: gpsLocation,
        isEncrypted: showPrivacyMode,
      };

      setScanResults((prev) => [newScanResult, ...prev]);

      if (scanMode === "batch" && batchData) {
        setBatchData((prev) => ({
          ...prev!,
          scannedItems: [...prev!.scannedItems, newScanResult],
          completionPercentage: Math.min(
            100,
            ((prev!.scannedItems.length + 1) / prev!.totalItems) * 100
          ),
        }));
      }
    } catch (error) {
      console.error("Error scanning RFID:", error);
    } finally {
      setIsScanning(false);
      setLoading(false);
    }
  };

  const handleTokenizeRFID = async (rfidResult: RFIDScanResult) => {
    if (!isConnected || !rfidResult) return;

    setLoading(true);
    try {
      const expiryTimestamp =
        new Date(tokenizeData.expiryDate).getTime() / 1000;
      const validUsers = tokenizeData.authorizedUsers.filter((u) => u.trim());

      const productData = {
        productName: tokenizeData.productName,
        batchNumber: tokenizeData.batchNumber,
        expiryDate: expiryTimestamp,
        encryptedMetadata: JSON.stringify({
          rfidData: rfidResult.rawData,
          scanLocation: rfidResult.location,
          scanTimestamp: rfidResult.timestamp,
          privacy: tokenizeData.enablePrivacy,
        }),
        ipfsHash: `QmHash${Math.random().toString(36).substring(2, 15)}`,
      };

      const tokenId = await tokenizeRFID(
        rfidResult.rfidHash,
        productData,
        validUsers
      );

      // Update scan result with token info
      setScanResults((prev) =>
        prev.map((result) =>
          result.rfidHash === rfidResult.rfidHash
            ? {
                ...result,
                tokenId,
                productName: tokenizeData.productName,
                batchNumber: tokenizeData.batchNumber,
              }
            : result
        )
      );

      setShowTokenizeForm(false);
      setTokenizeData({
        productName: "",
        batchNumber: "",
        expiryDate: "",
        authorizedUsers: [""],
        enablePrivacy: true,
      });
    } catch (error) {
      console.error("Error tokenizing RFID:", error);
    } finally {
      setLoading(false);
    }
  };

  const startBatchScan = () => {
    const batchId = `BATCH_${Date.now().toString(36).toUpperCase()}`;
    setBatchData({
      batchId,
      scannedItems: [],
      totalItems: 50, // Mock batch size
      completionPercentage: 0,
    });
    setScanMode("batch");
  };

  const startContinuousScan = () => {
    setScanMode("continuous");
    // In a real implementation, this would start continuous scanning
    const interval = setInterval(() => {
      if (scanMode === "continuous") {
        handleScanRFID();
      } else {
        clearInterval(interval);
      }
    }, 5000);
  };

  const addAuthorizedUser = () => {
    setTokenizeData((prev) => ({
      ...prev,
      authorizedUsers: [...prev.authorizedUsers, ""],
    }));
  };

  const updateAuthorizedUser = (index: number, value: string) => {
    setTokenizeData((prev) => ({
      ...prev,
      authorizedUsers: prev.authorizedUsers.map((user, i) =>
        i === index ? value : user
      ),
    }));
  };

  const removeAuthorizedUser = (index: number) => {
    if (tokenizeData.authorizedUsers.length > 1) {
      setTokenizeData((prev) => ({
        ...prev,
        authorizedUsers: prev.authorizedUsers.filter((_, i) => i !== index),
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Radio className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">
              Advanced RFID Scanner
            </h2>
            <p className="text-gray-400">
              Privacy-preserving RFID scanning with tokenization
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowPrivacyMode(!showPrivacyMode)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              showPrivacyMode
                ? "bg-green-600/20 text-green-400 border border-green-500/30"
                : "bg-gray-700 text-gray-300 border border-gray-600"
            }`}
          >
            {showPrivacyMode ? (
              <Lock className="w-4 h-4" />
            ) : (
              <Unlock className="w-4 h-4" />
            )}
            <span>Privacy Mode</span>
          </button>
        </div>
      </div>

      {/* Scanner Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner Controls */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-medium text-white mb-4">
            Scanner Controls
          </h3>

          {/* Scan Mode Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Scan Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { mode: "single", label: "Single", icon: QrCode },
                { mode: "batch", label: "Batch", icon: Database },
                { mode: "continuous", label: "Continuous", icon: Zap },
              ].map(({ mode, label, icon: Icon }) => (
                <button
                  key={mode}
                  onClick={() =>
                    setScanMode(mode as "single" | "batch" | "continuous")
                  }
                  className={`flex items-center justify-center space-x-2 p-3 rounded-lg transition-colors ${
                    scanMode === mode
                      ? "bg-purple-600/20 text-purple-400 border border-purple-500/30"
                      : "bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Location Info */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
              <MapPin className="w-4 h-4" />
              <span>Current Location</span>
            </div>
            <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-3">
              <code className="text-xs text-green-400">{gpsLocation}</code>
            </div>
          </div>

          {/* Scanner Viewport */}
          <div
            ref={scannerRef}
            className="relative bg-gradient-to-br from-gray-900 to-black rounded-2xl p-10 mb-8 border-2 border-dashed border-gray-700 shadow-2xl"
          >
            <div className="text-center relative z-10">
              {isScanning ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="inline-block"
                >
                  <Scan className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                </motion.div>
              ) : (
                <Scan className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              )}
              <p className="text-gray-400 text-lg font-medium">
                {isScanning
                  ? "Scanning RFID..."
                  : "Position RFID tag in scanner range"}
              </p>
            </div>

            {/* Scanning Animation */}
            {isScanning && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 0.8, 0],
                  scale: [0.9, 1.1, 0.9],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 border-2 border-purple-500 rounded-2xl bg-gradient-to-br from-purple-900/20 to-blue-900/20"
              />
            )}

            {/* Scanner Grid Effect */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              {isScanning && (
                <>
                  <motion.div
                    className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"
                    animate={{
                      y: [0, 200],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <motion.div
                    className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-transparent via-blue-500 to-transparent"
                    animate={{
                      x: [0, 300],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </>
              )}
            </div>
          </div>

          {/* Scan Actions */}
          <div className="space-y-3">
            {scanMode === "single" && (
              <button
                onClick={handleScanRFID}
                disabled={isScanning || loading}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                <Scan className="w-4 h-4" />
                <span>{isScanning ? "Scanning..." : "Scan RFID"}</span>
              </button>
            )}

            {scanMode === "batch" && !batchData && (
              <button
                onClick={startBatchScan}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Database className="w-4 h-4" />
                <span>Start Batch Scan</span>
              </button>
            )}

            {scanMode === "batch" && batchData && (
              <div className="space-y-3">
                <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-3">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">
                      Batch: {batchData.batchId}
                    </span>
                    <span className="text-white">
                      {batchData.scannedItems.length}/{batchData.totalItems}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${batchData.completionPercentage}%` }}
                    />
                  </div>
                </div>
                <button
                  onClick={handleScanRFID}
                  disabled={isScanning || loading}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                  <Scan className="w-4 h-4" />
                  <span>{isScanning ? "Scanning..." : "Scan Next Item"}</span>
                </button>
              </div>
            )}

            {scanMode === "continuous" && (
              <button
                onClick={startContinuousScan}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Zap className="w-4 h-4" />
                <span>Start Continuous Scan</span>
              </button>
            )}
          </div>
        </div>

        {/* Scan Results */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">Scan Results</h3>
            <div className="text-sm text-gray-400">
              {scanResults.length} items scanned
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {scanResults.map((result) => (
              <motion.div
                key={result.rfidHash}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-xl p-5 hover:border-purple-500/50 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-purple-500/10"
                onClick={() => setSelectedResult(result)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Hash className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <span className="text-white font-mono text-sm font-medium">
                        {result.rfidHash.slice(0, 16)}...
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {result.isEncrypted && (
                      <div className="p-1.5 bg-green-500/20 rounded-full">
                        <Lock className="w-4 h-4 text-green-400" />
                      </div>
                    )}
                    {result.tokenId ? (
                      <div className="p-1.5 bg-green-500/20 rounded-full">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      </div>
                    ) : (
                      <div className="p-1.5 bg-yellow-500/20 rounded-full">
                        <AlertCircle className="w-4 h-4 text-yellow-400" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700/50">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Status:</span>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        result.tokenId
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {result.tokenId ? "Tokenized" : "Scanned"}
                    </span>
                  </div>

                  {result.productName && (
                    <div className="text-sm text-gray-300 truncate max-w-[120px]">
                      {result.productName}
                    </div>
                  )}
                </div>

                {!result.tokenId && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedResult(result);
                      setShowTokenizeForm(true);
                    }}
                    className="mt-4 w-full px-4 py-2.5 bg-gradient-to-r from-blue-600/30 to-purple-600/30 hover:from-blue-600/40 hover:to-purple-600/40 text-blue-300 rounded-lg transition-all duration-300 text-sm font-medium border border-blue-500/30 hover:border-blue-500/50"
                  >
                    Tokenize RFID
                  </button>
                )}
              </motion.div>
            ))}

            {scanResults.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No RFID scans yet. Start scanning to see results here.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tokenize Form Modal */}
      <AnimatePresence>
        {showTokenizeForm && selectedResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-white">
                  Tokenize RFID
                </h3>
                <button
                  onClick={() => setShowTokenizeForm(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={tokenizeData.productName}
                    onChange={(e) =>
                      setTokenizeData((prev) => ({
                        ...prev,
                        productName: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all duration-300"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Batch Number
                  </label>
                  <input
                    type="text"
                    value={tokenizeData.batchNumber}
                    onChange={(e) =>
                      setTokenizeData((prev) => ({
                        ...prev,
                        batchNumber: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all duration-300"
                    placeholder="Enter batch number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="datetime-local"
                    value={tokenizeData.expiryDate}
                    onChange={(e) =>
                      setTokenizeData((prev) => ({
                        ...prev,
                        expiryDate: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Authorized Users
                  </label>
                  {tokenizeData.authorizedUsers.map((user, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 mb-2"
                    >
                      <input
                        type="text"
                        value={user}
                        onChange={(e) =>
                          updateAuthorizedUser(index, e.target.value)
                        }
                        placeholder="0x..."
                        className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all duration-300"
                      />
                      {tokenizeData.authorizedUsers.length > 1 && (
                        <button
                          onClick={() => removeAuthorizedUser(index)}
                          className="p-2 text-red-400 hover:text-red-300"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addAuthorizedUser}
                    className="text-purple-400 hover:text-purple-300 text-sm"
                  >
                    + Add User
                  </button>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="enablePrivacy"
                    checked={tokenizeData.enablePrivacy}
                    onChange={(e) =>
                      setTokenizeData((prev) => ({
                        ...prev,
                        enablePrivacy: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                  />
                  <label
                    htmlFor="enablePrivacy"
                    className="text-sm text-gray-300"
                  >
                    Enable privacy mode (encrypted metadata)
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowTokenizeForm(false)}
                  className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all duration-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleTokenizeRFID(selectedResult)}
                  disabled={
                    loading ||
                    !tokenizeData.productName ||
                    !tokenizeData.batchNumber
                  }
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl transition-all duration-300 font-medium disabled:opacity-50 shadow-lg hover:shadow-purple-500/20"
                >
                  {loading ? "Tokenizing..." : "Tokenize"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedRFIDScanner;
