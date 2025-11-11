import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWeb3 } from "../hooks/useWeb3";

const SimpleDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { account, disconnectWallet } = useWeb3();
  const [activeTab, setActiveTab] = useState("overview");

  const handleSignOut = () => {
    disconnectWallet();
    navigate("/signin");
  };

  // If no account, redirect to sign in
  if (!account) {
    navigate("/signin");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-lg">PT</span>
            </div>
            <h1 className="text-2xl font-bold">ProTrack Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <div className="text-gray-400">Connected as</div>
              <div className="font-mono text-gray-200">
                {account.slice(0, 6)}...{account.slice(-4)}
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-800/50 border-b border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "overview"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "products"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              Products
            </button>
            <button
              onClick={() => setActiveTab("tracking")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "tracking"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              Tracking
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-xl font-semibold mb-2">Total Products</h3>
                <p className="text-3xl font-bold text-blue-400">1,247</p>
                <p className="text-gray-400 text-sm mt-1">
                  +12% from last month
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-xl font-semibold mb-2">Active Shipments</h3>
                <p className="text-3xl font-bold text-green-400">23</p>
                <p className="text-gray-400 text-sm mt-1">2 in transit</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-xl font-semibold mb-2">Verified Items</h3>
                <p className="text-3xl font-bold text-purple-400">1,198</p>
                <p className="text-gray-400 text-sm mt-1">
                  96.1% verification rate
                </p>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span>Product batch verified successfully</span>
                  </div>
                  <span className="text-gray-400 text-sm">2 min ago</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <span>New shipment started tracking</span>
                  </div>
                  <span className="text-gray-400 text-sm">15 min ago</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                    <span>Temperature alert triggered</span>
                  </div>
                  <span className="text-gray-400 text-sm">1 hour ago</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Products Management</h2>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Your Products</h3>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                  Create Product
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4">Product</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Location</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-800">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium">
                            Organic Coffee Beans
                          </div>
                          <div className="text-gray-400 text-sm">
                            COF-2023-001
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                          Active
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-300">
                        Roastery Facility
                      </td>
                      <td className="py-4 px-4">
                        <button className="text-blue-400 hover:text-blue-300 mr-3">
                          View
                        </button>
                        <button className="text-green-400 hover:text-green-300">
                          Edit
                        </button>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium">Premium Tea Leaves</div>
                          <div className="text-gray-400 text-sm">
                            TEA-2023-002
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                          In Transit
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-300">
                        Distribution Center
                      </td>
                      <td className="py-4 px-4">
                        <button className="text-blue-400 hover:text-blue-300 mr-3">
                          View
                        </button>
                        <button className="text-green-400 hover:text-green-300">
                          Edit
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "tracking" && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Shipment Tracking</h2>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-4">Active Shipments</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-700/50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium">Shipment #SH-2023-001</div>
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                      In Transit
                    </span>
                  </div>
                  <div className="text-gray-400 text-sm mb-3">
                    Organic Coffee Beans → Distribution Center NYC
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: "65%" }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400 mt-2">
                    <span>Roastery Facility</span>
                    <span>Distribution Center NYC</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-4">Tracking Map</h3>
              <div className="h-64 bg-gradient-to-br from-blue-900/30 via-purple-900/20 to-indigo-900/30 rounded-xl border border-gray-700/50 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">🌍</div>
                  <p className="text-gray-400">
                    Interactive map showing shipment locations
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SimpleDashboard;
