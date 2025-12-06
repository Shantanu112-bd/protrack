import React, { useState } from "react";
import { useWeb3 } from "../contexts/Web3Context";
import SupplyChainService from "../services/supplyChainService";
import Web3 from "web3";
import { useToast } from "../contexts/ToastContext";

const SupplyChainTestRunner: React.FC = () => {
  const { account, isActive } = useWeb3();
  const { addToast } = useToast();
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const runSupplyChainTest = async () => {
    if (!account || !isActive) {
      addToast({
        type: "error",
        title: "Wallet Not Connected",
        message: "Please connect your wallet before running tests",
        duration: 5000,
      });
      return;
    }

    setIsTesting(true);
    setTestResults([]);

    try {
      const web3 = new Web3(window.ethereum as unknown as string);
      const supplyChainService = new SupplyChainService(web3, account);

      // Add initial test message
      const results = ["🧪 Starting Supply Chain Integration Tests..."];
      setTestResults(results);

      // 1. Test Manufacture Stage
      results.push("1️⃣ Testing Manufacture Stage...");
      setTestResults([...results]);

      const rfidData = SupplyChainService.generateDemoRFIDData();
      const productData = {
        name: "Test Product",
        sku: "TEST-001",
        manufacturer: account,
        createdAt: Math.floor(Date.now() / 1000),
        batchId: "BATCH-TEST-001",
        category: "Test Category",
        expiryDate: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
        currentValue: "10.0",
        currentLocation: "Manufacturing Facility",
      };

      const mintResult = await supplyChainService.mintProductFromRFID(
        rfidData,
        productData
      );
      results.push(
        `✅ Product minted successfully! Token ID: ${mintResult.tokenId}`
      );
      setTestResults([...results]);

      // 2. Test Packaging Stage
      results.push("2️⃣ Testing Packaging Stage...");
      setTestResults([...results]);

      const iotData = SupplyChainService.generateDemoIoTData();
      await supplyChainService.logPackagingProof(
        mintResult.tokenId,
        iotData,
        "Packaging Facility"
      );
      results.push(`✅ Packaging proof logged successfully!`);
      setTestResults([...results]);

      // 3. Test Shipping Stage
      results.push("3️⃣ Testing Shipping Stage...");
      setTestResults([...results]);

      const shipmentResult = await supplyChainService.initiateShipment(
        mintResult.tokenId,
        account,
        "0xDistributorAddress",
        "Distribution Center"
      );
      results.push(`✅ Shipment initiated successfully!`);
      setTestResults([...results]);

      // 4. Test Receiving Stage
      results.push("4️⃣ Testing Receiving Stage...");
      setTestResults([...results]);

      await supplyChainService.receiveShipment(
        mintResult.tokenId,
        "0xDistributorAddress",
        "Warehouse Facility",
        shipmentResult.tempKey
      );
      results.push(`✅ Shipment received successfully!`);
      setTestResults([...results]);

      // 5. Test Customer Verification Stage
      results.push("5️⃣ Testing Customer Verification Stage...");
      setTestResults([...results]);

      const verificationResult =
        await supplyChainService.verifyProductAuthenticity(
          mintResult.tokenId,
          rfidData.rfidHash
        );
      results.push(
        `✅ Product verification completed! Authentic: ${verificationResult.isValid}`
      );
      setTestResults([...results]);

      // 6. Test Risk Analysis
      results.push("6️⃣ Testing Risk Analysis...");
      setTestResults([...results]);

      const riskAnalysis = await supplyChainService.analyzeSupplyChainRisk(
        mintResult.tokenId,
        iotData
      );
      results.push(
        `✅ Risk analysis completed! Spoilage Risk: ${riskAnalysis.spoilageRisk}%`
      );
      setTestResults([...results]);

      // 7. Test Encryption Key Management
      results.push("7️⃣ Testing Encryption Key Management...");
      setTestResults([...results]);

      await supplyChainService.generateEncryptionKeys(
        mintResult.tokenId,
        account,
        "0xDistributorAddress"
      );
      results.push(`✅ Encryption keys generated successfully!`);
      setTestResults([...results]);

      await supplyChainService.rotateEncryptionKey(
        mintResult.tokenId,
        account,
        "0xDistributorAddress"
      );
      results.push(`✅ Encryption key rotated successfully!`);
      setTestResults([...results]);

      results.push(
        "🎉 All supply chain integration tests passed successfully!"
      );
      setTestResults([...results]);

      addToast({
        type: "success",
        title: "Tests Completed",
        message: "All supply chain integration tests passed successfully!",
        duration: 5000,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      const results = [...testResults, `❌ Test failed: ${errorMessage}`];
      setTestResults(results);

      addToast({
        type: "error",
        title: "Test Failed",
        message: errorMessage,
        duration: 5000,
      });

      console.error("Test failed:", error);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Supply Chain Integration Tests
      </h2>

      <div className="mb-6">
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Run comprehensive tests to verify all supply chain functionality is
          working correctly with the blockchain.
        </p>

        <button
          onClick={runSupplyChainTest}
          disabled={isTesting}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            isTesting
              ? "bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {isTesting ? (
            <span className="flex items-center">
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
              Running Tests...
            </span>
          ) : (
            "Run Integration Tests"
          )}
        </button>
      </div>

      {testResults.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
            Test Results
          </h3>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto">
            <ul className="space-y-2">
              {testResults.map((result, index) => (
                <li
                  key={index}
                  className="text-sm font-mono p-2 bg-white dark:bg-gray-600 rounded"
                >
                  {result}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
          Test Information
        </h4>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          These tests verify that all supply chain components are properly
          integrated with the blockchain. Tests include manufacturing,
          packaging, shipping, receiving, verification, risk analysis, and
          encryption.
        </p>
      </div>
    </div>
  );
};

export default SupplyChainTestRunner;
