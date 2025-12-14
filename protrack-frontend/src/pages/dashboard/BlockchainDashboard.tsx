import React from "react";
import { motion } from "framer-motion";
import { Wallet, Activity, TrendingUp, Shield } from "lucide-react";
import SmartContractInteraction from "../../components/SmartContractInteraction";
import { useWeb3 } from "../../contexts/web3ContextTypes";
import { useBlockchain } from "../../contexts/BlockchainContext";

const BlockchainDashboard: React.FC = () => {
  const { account, isActive: isConnected, chainId, balance } = useWeb3();
  const { totalNFTs, recentTransactions } = useBlockchain();

  const stats = [
    {
      name: "Wallet Balance",
      value: balance ? `${parseFloat(balance).toFixed(4)} ETH` : "0 ETH",
      icon: Wallet,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
    {
      name: "Products Minted",
      value: totalNFTs.toString(),
      icon: Activity,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-green-200 dark:border-green-800",
    },
    {
      name: "Transactions",
      value: recentTransactions.length.toString(),
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      borderColor: "border-purple-200 dark:border-purple-800",
    },
    {
      name: "Network",
      value: chainId === 1337 ? "Localhost" : `Chain ${chainId}`,
      icon: Shield,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      borderColor: "border-orange-200 dark:border-orange-800",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Blockchain Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Interact with ProTrack smart contracts and monitor blockchain
            activity
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`p-6 rounded-lg border ${stat.bgColor} ${stat.borderColor}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.name}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6"
        >
          <div className="flex items-center">
            <Wallet className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                Wallet Not Connected
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300">
                Connect your MetaMask wallet to interact with smart contracts
                and view your blockchain activity.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Smart Contract Interaction */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <SmartContractInteraction />
      </motion.div>

      {/* Recent Transactions */}
      {isConnected && recentTransactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Transactions
          </h3>
          <div className="space-y-3">
            {recentTransactions.slice(0, 5).map((tx, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {tx.type}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(tx.timestamp).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm text-gray-900 dark:text-white">
                    {tx.txHash.slice(0, 10)}...
                  </div>
                  <div
                    className={`text-xs ${
                      tx.status === "confirmed"
                        ? "text-green-600 dark:text-green-400"
                        : "text-yellow-600 dark:text-yellow-400"
                    }`}
                  >
                    {tx.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6"
      >
        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">
          Getting Started with Smart Contracts
        </h3>
        <div className="space-y-2 text-blue-700 dark:text-blue-300">
          <p>
            • Connect your MetaMask wallet to the Localhost network (Chain ID:
            1337)
          </p>
          <p>• Use the Hardhat accounts provided in the terminal for testing</p>
          <p>• Interact with deployed contracts using the buttons above</p>
          <p>
            • Monitor your transactions and contract interactions in real-time
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default BlockchainDashboard;
