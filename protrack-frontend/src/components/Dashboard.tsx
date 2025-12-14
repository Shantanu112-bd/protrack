import React from "react";
import { useWeb3 } from "../contexts/web3ContextTypes";
import WalletConnection from "./WalletConnection";

const Dashboard = () => {
  const { account, chainId, isActive } = useWeb3();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Welcome to your ProTrack dashboard
        </p>
      </div>

      {/* Wallet Connection Status */}
      <div className="mb-8">
        <WalletConnection />
      </div>

      {/* Network Status Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Network Status</h2>
        {isActive ? (
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-700 dark:text-gray-300">Connected to wallet</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Account</p>
                <p className="font-mono text-gray-800 dark:text-white break-all">
                  {account}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Chain ID</p>
                <p className="text-gray-800 dark:text-white">{chainId}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
            <span className="text-gray-700 dark:text-gray-300">Wallet not connected</span>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Products Tracked</h3>
          <p className="text-3xl font-bold">128</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Active Shipments</h3>
          <p className="text-3xl font-bold">24</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Verified Items</h3>
          <p className="text-3xl font-bold">89</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-4">
              <span className="text-blue-600 dark:text-blue-300 font-bold">P</span>
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-white">Product #12345 registered</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-4">
              <span className="text-green-600 dark:text-green-300 font-bold">S</span>
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-white">Shipment #67890 dispatched</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">5 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;