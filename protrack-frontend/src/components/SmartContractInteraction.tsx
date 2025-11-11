import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Coins,
  Package,
  Cpu,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Loader2,
  Copy,
} from "lucide-react";
import { useWeb3 } from "../hooks/useWeb3";
import { useBlockchain } from "../contexts/BlockchainContext";
import {
  PROTRACK_NFT_ADDRESS,
  PROTRACK_SUPPLY_CHAIN_ADDRESS,
  PROTRACK_ORACLE_ADDRESS,
  PROTRACK_RFID_TOKENIZER_ADDRESS,
  PROTRACK_MPC_ADDRESS,
} from "../contracts/contractConfig";

const SmartContractInteraction: React.FC = () => {
  const { account, isActive, chainId } = useWeb3();
  const { mintProductNFT, createEscrow, submitIoTData } = useBlockchain();
  const [isLoading, setIsLoading] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const contracts = chainId
    ? {
        NFT: PROTRACK_NFT_ADDRESS,
        SupplyChain: PROTRACK_SUPPLY_CHAIN_ADDRESS,
        Oracle: PROTRACK_ORACLE_ADDRESS,
        RFIDTokenizer: PROTRACK_RFID_TOKENIZER_ADDRESS,
        MPC: PROTRACK_MPC_ADDRESS,
      }
    : null;
  const isCorrectNetwork = chainId === 1337;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMintNFT = async () => {
    if (!isActive || !mintProductNFT) return;

    setIsLoading(true);
    try {
      const productData = {
        name: `Test Product ${Date.now()}`,
        sku: `SKU-${Date.now()}`,
        manufacturer: account!,
        createdAt: Math.floor(Date.now() / 1000),
        batchId: `BATCH-${Date.now()}`,
        category: "Electronics",
        currentLocation: "Factory A",
      };

      const result = await mintProductNFT(productData);
      setLastTransaction(result.txHash);
    } catch (error) {
      console.error("Failed to mint NFT:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEscrow = async () => {
    if (!isActive || !createEscrow) return;

    setIsLoading(true);
    try {
      const result = await createEscrow(account!, account!, 1, "0.1");
      setLastTransaction(result.txHash);
    } catch (error) {
      console.error("Failed to create escrow:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitIoTData = async () => {
    if (!isActive || !submitIoTData) return;

    setIsLoading(true);
    try {
      const result = await submitIoTData({
        deviceId: `DEVICE-${Date.now()}`,
        sensorType: "temperature" as const,
        value: Math.floor(Math.random() * 30) + 10, // 10-40°C
        unit: "°C",
        timestamp: Math.floor(Date.now() / 1000),
      });
      setLastTransaction(result);
    } catch (error) {
      console.error("Failed to submit IoT data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isActive) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Wallet Not Connected
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Connect your wallet to interact with smart contracts
          </p>
        </div>
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Wrong Network
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Switch to Localhost (Chain ID: 1337) to interact with smart
            contracts
          </p>
          <div className="text-sm text-gray-500">
            Current network: {chainId}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Contract Addresses */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Smart Contract Addresses
        </h3>
        <div className="space-y-3">
          {contracts &&
            Object.entries(contracts).map(([name, address]) => (
              <div
                key={name}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {name}
                  </div>
                  <div className="text-sm font-mono text-gray-600 dark:text-gray-400">
                    {address as string}
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(address as string)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Smart Contract Interactions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Mint NFT */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleMintNFT}
            disabled={isLoading}
            className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50"
          >
            <Package className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <div className="font-medium text-gray-900 dark:text-white">
              Mint Product NFT
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Create a new product token
            </div>
          </motion.button>

          {/* Create Escrow */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateEscrow}
            disabled={isLoading}
            className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors disabled:opacity-50"
          >
            <Coins className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <div className="font-medium text-gray-900 dark:text-white">
              Create Escrow
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Set up payment escrow
            </div>
          </motion.button>

          {/* Submit IoT Data */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmitIoTData}
            disabled={isLoading}
            className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors disabled:opacity-50"
          >
            <Cpu className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
            <div className="font-medium text-gray-900 dark:text-white">
              Submit IoT Data
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Add sensor reading
            </div>
          </motion.button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="mt-4 flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600 mr-2" />
            <span className="text-gray-700 dark:text-gray-300">
              Processing transaction...
            </span>
          </div>
        )}

        {/* Last Transaction */}
        {lastTransaction && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center mb-2">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
              <span className="font-medium text-green-800 dark:text-green-200">
                Transaction Successful
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono text-green-700 dark:text-green-300">
                {lastTransaction}
              </span>
              <button
                onClick={() =>
                  window.open(
                    `https://etherscan.io/tx/${lastTransaction}`,
                    "_blank"
                  )
                }
                className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Network Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Network Status
            </h3>
            <div className="flex items-center mt-2">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-green-600 dark:text-green-400">
                Connected to Localhost (Chain ID: 1337)
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Account
            </div>
            <div className="font-mono text-sm text-gray-900 dark:text-white">
              {account?.slice(0, 6)}...{account?.slice(-4)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartContractInteraction;
