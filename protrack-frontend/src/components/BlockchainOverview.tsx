import React, { useEffect, useState } from "react";
import { useBlockchain } from "../contexts/BlockchainContext";
import { useWeb3 } from "../hooks/useWeb3";

interface BlockchainOverviewProps {
  isDark: boolean;
  userRole: string;
}

const BlockchainOverview: React.FC<BlockchainOverviewProps> = ({ isDark }) => {
  const { totalNFTs, recentTransactions, isLoading } = useBlockchain();
  const { account, isActive, chainId } = useWeb3();
  const [stats, setStats] = useState({
    totalProducts: 1247,
    verifiedItems: 1198,
    activeShipments: 23,
    iotAlerts: 3,
    escrowValue: "45.2",
    avgVerificationTime: "2.3",
  });

  useEffect(() => {
    // Update stats with blockchain data
    setStats((prev) => ({
      ...prev,
      totalProducts: totalNFTs,
    }));
  }, [totalNFTs]);

  const getChainName = (chainId: number | null) => {
    switch (chainId) {
      case 1:
        return "Ethereum Mainnet";
      case 137:
        return "Polygon";
      case 5:
        return "Goerli Testnet";
      case 80001:
        return "Mumbai Testnet";
      default:
        return "Unknown Network";
    }
  };

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case "mint":
        return "🎨";
      case "transfer":
        return "📦";
      case "escrow":
        return "💰";
      case "iot_data":
        return "📡";
      case "gps_data":
        return "🗺️";
      case "sla_violation":
        return "⚠️";
      default:
        return "🔗";
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case "mint":
        return "text-purple-600";
      case "transfer":
        return "text-blue-600";
      case "escrow":
        return "text-green-600";
      case "iot_data":
        return "text-orange-600";
      case "gps_data":
        return "text-indigo-600";
      case "sla_violation":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Wallet Status */}
      {isActive && (
        <div
          className={`${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          } rounded-xl p-6 shadow-sm border mb-8`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3
                className={`text-lg font-semibold ${
                  isDark ? "text-white" : "text-gray-900"
                } mb-2`}
              >
                🔗 Blockchain Connection
              </h3>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className={isDark ? "text-gray-300" : "text-gray-600"}>
                    Connected
                  </span>
                </div>
                <div>
                  <span
                    className={`${
                      isDark ? "text-gray-400" : "text-gray-500"
                    } mr-2`}
                  >
                    Wallet:
                  </span>
                  <span
                    className={`font-mono ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {account?.slice(0, 6)}...{account?.slice(-4)}
                  </span>
                </div>
                <div>
                  <span
                    className={`${
                      isDark ? "text-gray-400" : "text-gray-500"
                    } mr-2`}
                  >
                    Network:
                  </span>
                  <span className={isDark ? "text-white" : "text-gray-900"}>
                    {getChainName(chainId)}
                  </span>
                </div>
                <div>
                  <span
                    className={`${
                      isDark ? "text-gray-400" : "text-gray-500"
                    } mr-2`}
                  >
                    Status:
                  </span>
                  <span className={isDark ? "text-white" : "text-gray-900"}>
                    {isActive ? "Connected" : "Disconnected"}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-3xl">⛓️</div>
          </div>
        </div>
      )}

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          {
            title: "Total NFT Products",
            value: stats.totalProducts.toLocaleString(),
            change: "+12%",
            icon: "🎨",
            color: "purple",
            subtitle: "Minted on blockchain",
          },
          {
            title: "Verified Items",
            value: stats.verifiedItems.toLocaleString(),
            change: "96.1%",
            icon: "✅",
            color: "green",
            subtitle: "Blockchain verified",
          },
          {
            title: "Active Escrows",
            value: stats.escrowValue,
            change: `${stats.activeShipments} active`,
            icon: "💰",
            color: "blue",
            subtitle: "ETH in smart contracts",
          },
          {
            title: "Oracle Alerts",
            value: stats.iotAlerts.toString(),
            change: "Temperature",
            icon: "📡",
            color: "orange",
            subtitle: "IoT data violations",
          },
        ].map((stat, index) => (
          <div
            key={index}
            className={`${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">{stat.icon}</span>
              <span
                className={`text-${
                  stat.color
                }-600 text-sm font-medium px-2 py-1 rounded-full ${
                  isDark ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                {stat.change}
              </span>
            </div>
            <h3
              className={`text-sm font-medium ${
                isDark ? "text-gray-300" : "text-gray-600"
              } mb-1`}
            >
              {stat.title}
            </h3>
            <p className={`text-3xl font-bold text-${stat.color}-600 mb-1`}>
              {stat.value}
            </p>
            <p
              className={`text-xs ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {stat.subtitle}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Blockchain Activity */}
        <div
          className={`${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          } rounded-xl p-6 shadow-sm border`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className={`text-lg font-semibold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Recent Blockchain Activity
            </h3>
            <span className="text-2xl">⛓️</span>
          </div>
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p
                  className={`mt-2 text-sm ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Loading transactions...
                </p>
              </div>
            ) : recentTransactions.length > 0 ? (
              recentTransactions.slice(0, 6).map((tx) => (
                <div key={tx.id} className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      tx.status === "confirmed"
                        ? "bg-green-100 text-green-600"
                        : tx.status === "pending"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {getTransactionTypeIcon(tx.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`${
                        isDark ? "text-white" : "text-gray-900"
                      } truncate`}
                    >
                      {tx.description}
                    </p>
                    <div className="flex items-center space-x-2 text-xs">
                      <span
                        className={`${getTransactionTypeColor(
                          tx.type
                        )} font-medium`}
                      >
                        {tx.type.replace("_", " ").toUpperCase()}
                      </span>
                      <span
                        className={isDark ? "text-gray-400" : "text-gray-500"}
                      >
                        •
                      </span>
                      <span
                        className={`font-mono ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {tx.txHash.slice(0, 10)}...
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        tx.status === "confirmed"
                          ? "bg-green-500"
                          : tx.status === "pending"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    ></div>
                    <span
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {new Date(tx.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🔗</div>
                <p className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  No blockchain transactions yet
                </p>
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  Connect your wallet and create products to see activity
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RFID Tracking System */}
        <div
          className={`${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          } rounded-xl p-6 shadow-sm border`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className={`text-lg font-semibold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              RFID Tracking System
            </h3>
            <span className="text-2xl">📡</span>
          </div>
          <div className="space-y-4">
            <div
              className={`${
                isDark ? "bg-gray-700" : "bg-gray-50"
              } rounded-lg p-4`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-sm font-medium ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Active RFID Tags
                </span>
                <span className="text-green-600 font-semibold">1,247</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: "95%" }}
                ></div>
              </div>
            </div>

            <div
              className={`${
                isDark ? "bg-gray-700" : "bg-gray-50"
              } rounded-lg p-4`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-sm font-medium ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Read Success Rate
                </span>
                <span className="text-blue-600 font-semibold">98.7%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: "98.7%" }}
                ></div>
              </div>
            </div>

            <div
              className={`${
                isDark ? "bg-gray-700" : "bg-gray-50"
              } rounded-lg p-4`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-sm font-medium ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Blockchain Sync
                </span>
                <span className="text-purple-600 font-semibold">99.2%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: "99.2%" }}
                ></div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t border-gray-200">
              <h4
                className={`text-sm font-medium ${
                  isDark ? "text-gray-300" : "text-gray-600"
                } mb-3`}
              >
                Quick Actions
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className={`p-3 border-2 border-dashed ${
                    isDark
                      ? "border-gray-600 hover:border-blue-500 hover:bg-gray-700"
                      : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                  } rounded-lg transition-all text-center`}
                >
                  <div className="text-lg mb-1">🎨</div>
                  <div
                    className={`text-xs font-medium ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Mint NFT
                  </div>
                </button>
                <button
                  className={`p-3 border-2 border-dashed ${
                    isDark
                      ? "border-gray-600 hover:border-green-500 hover:bg-gray-700"
                      : "border-gray-300 hover:border-green-500 hover:bg-green-50"
                  } rounded-lg transition-all text-center`}
                >
                  <div className="text-lg mb-1">💰</div>
                  <div
                    className={`text-xs font-medium ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Create Escrow
                  </div>
                </button>
                <button
                  className={`p-3 border-2 border-dashed ${
                    isDark
                      ? "border-gray-600 hover:border-orange-500 hover:bg-gray-700"
                      : "border-gray-300 hover:border-orange-500 hover:bg-orange-50"
                  } rounded-lg transition-all text-center`}
                >
                  <div className="text-lg mb-1">📡</div>
                  <div
                    className={`text-xs font-medium ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Read RFID
                  </div>
                </button>
                <button
                  className={`p-3 border-2 border-dashed ${
                    isDark
                      ? "border-gray-600 hover:border-purple-500 hover:bg-gray-700"
                      : "border-gray-300 hover:border-purple-500 hover:bg-purple-50"
                  } rounded-lg transition-all text-center`}
                >
                  <div className="text-lg mb-1">🔍</div>
                  <div
                    className={`text-xs font-medium ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Verify Product
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockchainOverview;
