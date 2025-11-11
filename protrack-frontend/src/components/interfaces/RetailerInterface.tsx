import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import RetailerDashboard from "../dashboards/RetailerDashboard";
import EnhancedRFIDScanner from "../EnhancedRFIDScanner";

const RetailerInterface: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Retailer Dashboard
          </h1>
          <p className="text-gray-400">
            Manage product inventory and verify authenticity
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 backdrop-blur-lg border border-blue-700/50 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Products in Stock</p>
                <p className="text-2xl font-bold text-white mt-1">842</p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-xl text-2xl text-blue-400">
                📦
              </div>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-green-900/30 to-green-800/30 backdrop-blur-lg border border-green-700/50 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Verified Products</p>
                <p className="text-2xl font-bold text-white mt-1">839</p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-xl text-2xl text-green-400">
                ✅
              </div>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 backdrop-blur-lg border border-purple-700/50 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Sales Today</p>
                <p className="text-2xl font-bold text-white mt-1">42</p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-xl text-2xl text-purple-400">
                💰
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl shadow-2xl">
              <CardHeader>
                <CardTitle className="text-xl text-white">
                  Retail Operations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RetailerDashboard />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl shadow-2xl">
              <CardHeader>
                <CardTitle className="text-lg text-white">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 rounded-lg bg-gray-800/30 hover:bg-gray-700/50 text-gray-300">
                    Verify Product Authenticity
                  </button>
                  <button className="w-full text-left p-3 rounded-lg bg-gray-800/30 hover:bg-gray-700/50 text-gray-300">
                    Update Inventory
                  </button>
                  <button className="w-full text-left p-3 rounded-lg bg-gray-800/30 hover:bg-gray-700/50 text-gray-300">
                    Process Returns
                  </button>
                  <button className="w-full text-left p-3 rounded-lg bg-gray-800/30 hover:bg-gray-700/50 text-gray-300">
                    Generate Reports
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl shadow-2xl">
              <CardHeader>
                <CardTitle className="text-lg text-white">
                  Product Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EnhancedRFIDScanner />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetailerInterface;
