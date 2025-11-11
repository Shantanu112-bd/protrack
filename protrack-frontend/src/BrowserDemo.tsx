import React, { useState } from "react";

// Define types for better TypeScript support
interface ProductData {
  name: string;
  sku: string;
  manufacturer: string;
  createdAt: number;
  batchId: string;
  category: string;
  expiryDate: number;
  currentValue: string;
  currentLocation: string;
}

interface SensorData {
  deviceId: string;
  sensorType: number;
  value: number;
  unit: string;
  timestamp: number;
  location: string;
}

// Mock service implementations for browser demo
const mockSupplyChainService = {
  mintProduct: async (rfidHash: string, productData: ProductData) => {
    console.log("Minting product with RFID:", rfidHash);
    // Use productData to satisfy linter
    console.log("Product name:", productData.name);
    return { success: true, tokenId: 12345, transactionHash: "0x123abc" };
  },

  transferProduct: async (
    tokenId: number,
    to: string,
    newStatus: number,
    location: string,
    notes: string
  ) => {
    console.log("Transferring product:", tokenId, "to", to);
    // Use parameters to satisfy linter
    console.log("Status:", newStatus, "Location:", location, "Notes:", notes);
    return { success: true, transactionHash: "0x456def" };
  },

  getProductByRFID: async (rfidHash: string) => {
    console.log("Getting product by RFID:", rfidHash);
    return {
      success: true,
      data: {
        tokenId: 12345,
        owner: "0x742d35Cc6634C0532925a3b8D4C9db96590b5e8e",
        status: 2,
        name: "Demo Product",
        batchId: "BATCH-2023-001",
      },
    };
  },
};

const mockMPCService = {
  createWallet: async (
    signers: string[],
    threshold: number,
    purpose: string
  ) => {
    console.log(
      "Creating MPC wallet with",
      signers.length,
      "signers and threshold",
      threshold
    );
    // Use purpose to satisfy linter
    console.log("Purpose:", purpose);
    return "key_demo_12345";
  },

  initiateTransaction: async (keyId: string, operationHash: string) => {
    console.log("Initiating MPC transaction with key:", keyId);
    // Use operationHash to satisfy linter
    console.log("Operation hash:", operationHash);
    return "tx_demo_67890";
  },

  approveTransaction: async (txId: string) => {
    console.log("Approving MPC transaction:", txId);
    return;
  },

  getKey: async (keyId: string) => {
    console.log("Getting key info for:", keyId);
    return {
      walletId: keyId,
      threshold: 2,
      totalSigners: 3,
      isActive: true,
      nonce: 5,
      signers: [
        "0x742d35Cc6634C0532925a3b8D4C9db96590b5e8e",
        "0x942d35Cc6634C0532925a3b8D4C9db96590b5e8e",
        "0x842d35Cc6634C0532925a3b8D4C9db96590b5e8e",
      ],
    };
  },
};

const mockIoTService = {
  processSensorData: (sensorData: SensorData) => {
    console.log("Processing sensor data:", sensorData);
    return {
      isValid: true,
      normalizedValue: sensorData.value,
      alertLevel: sensorData.value > 30 ? "high" : "normal",
      trend: "stable",
    };
  },

  submitToOracle: async (
    deviceId: string,
    sensorType: number,
    value: number,
    unit: string
  ) => {
    console.log("Submitting to oracle:", deviceId, sensorType, value, unit);
    return { success: true, transactionHash: "0x789ghi" };
  },
};

const BrowserDemo: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const addLog = (message: string) => {
    setLogs((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  // Supply Chain Demo
  const runSupplyChainDemo = async () => {
    setIsProcessing(true);
    addLog("Starting Supply Chain Demo...");

    try {
      // Mint product
      addLog("Minting new product...");
      const mintResult = await mockSupplyChainService.mintProduct(
        "0xabcdef1234567890",
        {
          name: "Demo Product",
          sku: "DEMO-001",
          manufacturer: "0x742d35Cc6634C0532925a3b8D4C9db96590b5e8e",
          createdAt: Math.floor(Date.now() / 1000),
          batchId: "BATCH-2023-001",
          category: "Demo Category",
          expiryDate: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
          currentValue: "100.0",
          currentLocation: "Manufacturing Facility",
        }
      );
      addLog(`✅ Product minted successfully! Token ID: ${mintResult.tokenId}`);

      // Transfer product
      addLog("Transferring product to distributor...");
      const transferResult = await mockSupplyChainService.transferProduct(
        mintResult.tokenId,
        "0x942d35Cc6634C0532925a3b8D4C9db96590b5e8e",
        2, // In Transit
        "Distribution Center",
        "Shipped via express delivery"
      );
      addLog(
        `✅ Product transferred successfully! Tx: ${transferResult.transactionHash.substring(
          0,
          10
        )}...`
      );

      // Get product info
      addLog("Retrieving product information...");
      const productResult = await mockSupplyChainService.getProductByRFID(
        "0xabcdef1234567890"
      );
      if (productResult.success) {
        addLog(
          `✅ Product retrieved: ${productResult.data.name} (Batch: ${productResult.data.batchId})`
        );
      }

      addLog("🎉 Supply Chain Demo completed successfully!");
    } catch (error) {
      addLog(`❌ Error in Supply Chain Demo: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // MPC Demo
  const runMPCDemo = async () => {
    setIsProcessing(true);
    addLog("Starting MPC Wallet Demo...");

    try {
      // Create wallet
      addLog("Creating MPC wallet...");
      const keyId = await mockMPCService.createWallet(
        [
          "0x742d35Cc6634C0532925a3b8D4C9db96590b5e8e",
          "0x942d35Cc6634C0532925a3b8D4C9db96590b5e8e",
          "0x842d35Cc6634C0532925a3b8D4C9db96590b5e8e",
        ],
        2,
        "supply_chain"
      );
      addLog(
        `✅ MPC wallet created successfully! Key ID: ${keyId.substring(
          0,
          15
        )}...`
      );

      // Get wallet info
      addLog("Retrieving wallet information...");
      const walletInfo = await mockMPCService.getKey(keyId);
      addLog(
        `✅ Wallet info: ${walletInfo.threshold}/${walletInfo.totalSigners} threshold`
      );

      // Initiate transaction
      addLog("Initiating MPC transaction...");
      const txId = await mockMPCService.initiateTransaction(
        keyId,
        "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
      );
      addLog(
        `✅ Transaction initiated successfully! Tx ID: ${txId.substring(
          0,
          15
        )}...`
      );

      // Approve transaction
      addLog("Approving transaction...");
      await mockMPCService.approveTransaction(txId);
      addLog(`✅ Transaction approved successfully!`);

      addLog("🎉 MPC Wallet Demo completed successfully!");
    } catch (error) {
      addLog(`❌ Error in MPC Demo: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // IoT Demo
  const runIoTDemo = async () => {
    setIsProcessing(true);
    addLog("Starting IoT Data Demo...");

    try {
      // Process temperature data
      addLog("Processing temperature sensor data...");
      const tempData = {
        deviceId: "TEMP_SENSOR_001",
        sensorType: 1,
        value: 23.5,
        unit: "°C",
        timestamp: Date.now(),
        location: "40.7128,-74.0060",
      };

      const tempResult = mockIoTService.processSensorData(tempData);
      addLog(
        `✅ Temperature data processed: ${tempData.value}${tempData.unit} (${tempResult.alertLevel})`
      );

      // Process humidity data
      addLog("Processing humidity sensor data...");
      const humidityData = {
        deviceId: "HUM_SENSOR_002",
        sensorType: 2,
        value: 45.2,
        unit: "%",
        timestamp: Date.now(),
        location: "40.7128,-74.0060",
      };

      const humidityResult = mockIoTService.processSensorData(humidityData);
      addLog(
        `✅ Humidity data processed: ${humidityData.value}${humidityData.unit} (${humidityResult.alertLevel})`
      );

      // Submit to oracle
      addLog("Submitting data to oracle...");
      const oracleResult = await mockIoTService.submitToOracle(
        tempData.deviceId,
        tempData.sensorType,
        tempData.value,
        tempData.unit
      );
      addLog(
        `✅ Data submitted to oracle successfully! Tx: ${oracleResult.transactionHash.substring(
          0,
          10
        )}...`
      );

      addLog("🎉 IoT Data Demo completed successfully!");
    } catch (error) {
      addLog(`❌ Error in IoT Demo: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
            ProTrack Browser Demo
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Fully functional frontend demonstration running directly in your
            browser with simulated blockchain interactions
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Demo Controls */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
              <h2 className="text-2xl font-bold mb-6 text-purple-400">
                Demo Controls
              </h2>

              <div className="space-y-4">
                <button
                  onClick={runSupplyChainDemo}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    "📦 Supply Chain Demo"
                  )}
                </button>

                <button
                  onClick={runMPCDemo}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    "🔐 MPC Wallet Demo"
                  )}
                </button>

                <button
                  onClick={runIoTDemo}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-50 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    "📡 IoT Data Demo"
                  )}
                </button>

                <button
                  onClick={clearLogs}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-xl font-medium transition-colors"
                >
                  🗑️ Clear Logs
                </button>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-4 text-blue-400">
                System Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                  <span>Frontend: ✅ Active</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                  <span>Blockchain: 🟡 Demo Mode</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                  <span>Services: ✅ Functional</span>
                </div>
              </div>
            </div>
          </div>

          {/* Demo Logs */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 h-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-green-400">Demo Logs</h2>
                <div className="text-sm text-gray-400">
                  {logs.length} events
                </div>
              </div>

              <div className="bg-gray-900/50 rounded-xl p-4 h-[500px] overflow-y-auto font-mono text-sm">
                {logs.length === 0 ? (
                  <div className="text-gray-500 h-full flex items-center justify-center">
                    Run a demo to see logs here...
                  </div>
                ) : (
                  <div className="space-y-2">
                    {logs.map((log, index) => (
                      <div
                        key={index}
                        className="p-3 bg-gray-800/50 rounded-lg border border-gray-700"
                      >
                        {log}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>
            This browser demo showcases the full functionality of the ProTrack
            system with simulated blockchain interactions.
          </p>
          <p className="mt-2">
            For production use, connect to an actual blockchain network.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BrowserDemo;
