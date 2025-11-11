import React, { useState, useEffect } from "react";
import { integratedSupplyChainService } from "../services/integratedSupplyChainService";

const IntegratedDemo: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [account, setAccount] = useState<string | null>(null);

  useEffect(() => {
    // Simulate account initialization
    setAccount("0x742d35Cc6634C0532925a3b8D4C9db96590b5e8e");
  }, []);

  const addLog = (message: string) => {
    setLogs((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const runFullDemo = async () => {
    setIsProcessing(true);
    addLog("🚀 Starting Integrated Supply Chain Demo...");

    try {
      // Step 1: Create and track a product
      addLog("📦 Creating and tracking new product...");
      const productResult =
        await integratedSupplyChainService.createAndTrackProduct(
          {
            name: "Premium Coffee Beans",
            sku: "COFFEE-2024-001",
            manufacturer: "0x742d35Cc6634C0532925a3b8D4C9db96590b5e8e",
            batchId: "BATCH-2024-COL-001",
            expiryDate: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
            category: "Agricultural",
          },
          "0xabcdef1234567890"
        );

      if (productResult.success) {
        addLog(`✅ Product created with Token ID: ${productResult.tokenId}`);
        addLog(
          `🔗 Transaction: ${productResult.transactionHash.substring(0, 10)}...`
        );
      }

      // Step 2: Process IoT data
      addLog("📡 Processing IoT sensor data...");
      const iotResult = await integratedSupplyChainService.processIoTData(
        {
          temperature: 22.5,
          humidity: 65.2,
          gps: { lat: 40.7128, lng: -74.006 },
          shock: 0.3,
          tamper: false,
        },
        "SENSOR-001"
      );

      if (iotResult.success) {
        addLog("✅ IoT data processed and submitted to blockchain");
      }

      // Step 3: Transfer product with MPC approval
      addLog("🔐 Transferring product with MPC approval...");
      const transferResult =
        await integratedSupplyChainService.transferProductWithApproval(
          productResult.tokenId,
          "0x942d35Cc6634C0532925a3b8D4C9db96590b5e8e",
          "Distribution Center NYC",
          "Shipped via express delivery"
        );

      if (transferResult.success) {
        addLog(
          `✅ Product transferred successfully to: ${transferResult.to.substring(
            0,
            10
          )}...`
        );
        addLog(`📍 Location: ${transferResult.location}`);
      }

      // Step 4: Get product info
      addLog("🔍 Retrieving product information...");
      const infoResult = await integratedSupplyChainService.getProductInfo(
        productResult.tokenId
      );

      if (infoResult.success) {
        addLog(`✅ Product info retrieved: ${infoResult.data.name}`);
      }

      addLog("🎉 Integrated Supply Chain Demo completed successfully!");
    } catch (error) {
      addLog(`❌ Error in demo: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
            Integrated Supply Chain Demo
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Complete end-to-end demonstration of RFID, IoT, and MPC integration
            in a decentralized supply chain
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
                  onClick={runFullDemo}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    "🚀 Run Full Demo"
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
                {account && (
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                    <span>Account: {account.substring(0, 10)}...</span>
                  </div>
                )}
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
                    Click "Run Full Demo" to start the demonstration...
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

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-6 rounded-2xl border border-purple-700/50">
            <h3 className="text-xl font-bold text-purple-400 mb-3">
              RFID Integration
            </h3>
            <p className="text-gray-300">
              Products are identified via RFID tags that are linked to NFTs on
              the blockchain for immutable tracking.
            </p>
          </div>

          <div className="bg-gradient-to-r from-green-900/30 to-teal-900/30 p-6 rounded-2xl border border-green-700/50">
            <h3 className="text-xl font-bold text-green-400 mb-3">
              IoT Monitoring
            </h3>
            <p className="text-gray-300">
              Real-time sensor data (temperature, humidity, GPS) is collected
              and verified through oracles.
            </p>
          </div>

          <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 p-6 rounded-2xl border border-yellow-700/50">
            <h3 className="text-xl font-bold text-yellow-400 mb-3">
              MPC Security
            </h3>
            <p className="text-gray-300">
              Multi-Party Computation wallets ensure secure, threshold-based
              approvals for custody transfers.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>
            This demo showcases the full integration of RFID, IoT, and MPC
            technologies in a decentralized supply chain system.
          </p>
          <p className="mt-2">
            All operations are simulated for browser demonstration purposes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default IntegratedDemo;
