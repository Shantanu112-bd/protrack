import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import MPCWalletManager from "../MPCWalletManager";
import EnhancedSupplyChainDashboard from "../EnhancedSupplyChainDashboard";

const AdminInterface: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-400">
            System administration and MPC wallet management
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 backdrop-blur-lg border border-blue-700/50 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white mt-1">1,248</p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-xl text-2xl text-blue-400">
                👥
              </div>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-green-900/30 to-green-800/30 backdrop-blur-lg border border-green-700/50 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Active Products</p>
                <p className="text-2xl font-bold text-white mt-1">5,421</p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-xl text-2xl text-green-400">
                📦
              </div>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 backdrop-blur-lg border border-purple-700/50 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">System Health</p>
                <p className="text-2xl font-bold text-white mt-1">99.8%</p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-xl text-2xl text-purple-400">
                💻
              </div>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-red-900/30 to-red-800/30 backdrop-blur-lg border border-red-700/50 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Pending Alerts</p>
                <p className="text-2xl font-bold text-white mt-1">3</p>
              </div>
              <div className="p-3 bg-red-500/20 rounded-xl text-2xl text-red-400">
                ⚠️
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl shadow-2xl">
              <CardHeader>
                <CardTitle className="text-xl text-white">
                  System Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EnhancedSupplyChainDashboard />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl shadow-2xl">
              <CardHeader>
                <CardTitle className="text-lg text-white">
                  MPC Wallet Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MPCWalletManager />
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl shadow-2xl">
              <CardHeader>
                <CardTitle className="text-lg text-white">
                  System Controls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 rounded-lg bg-gray-800/30 hover:bg-gray-700/50 text-gray-300">
                    User Management
                  </button>
                  <button className="w-full text-left p-3 rounded-lg bg-gray-800/30 hover:bg-gray-700/50 text-gray-300">
                    System Configuration
                  </button>
                  <button className="w-full text-left p-3 rounded-lg bg-gray-800/30 hover:bg-gray-700/50 text-gray-300">
                    Security Settings
                  </button>
                  <button className="w-full text-left p-3 rounded-lg bg-gray-800/30 hover:bg-gray-700/50 text-gray-300">
                    Audit Logs
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminInterface;
