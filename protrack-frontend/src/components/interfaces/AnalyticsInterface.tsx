import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import EnhancedSupplyChainDashboard from "../EnhancedSupplyChainDashboard";

const AnalyticsInterface: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Supply Chain Analytics
          </h1>
          <p className="text-gray-400">
            Comprehensive analytics and insights across the supply chain
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 backdrop-blur-lg border border-blue-700/50 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Products</p>
                <p className="text-2xl font-bold text-white mt-1">1,248</p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-xl text-2xl text-blue-400">
                📦
              </div>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-green-900/30 to-green-800/30 backdrop-blur-lg border border-green-700/50 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Active Shipments</p>
                <p className="text-2xl font-bold text-white mt-1">142</p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-xl text-2xl text-green-400">
                🚚
              </div>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 backdrop-blur-lg border border-purple-700/50 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Completion Rate</p>
                <p className="text-2xl font-bold text-white mt-1">98.2%</p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-xl text-2xl text-purple-400">
                ✅
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl shadow-2xl">
              <CardHeader>
                <CardTitle className="text-xl text-white">
                  Supply Chain Performance
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
                  Top Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between p-2 bg-gray-800/30 rounded-lg">
                    <span className="text-gray-300">Product A</span>
                    <span className="text-white">245 units</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-800/30 rounded-lg">
                    <span className="text-gray-300">Product B</span>
                    <span className="text-white">198 units</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-800/30 rounded-lg">
                    <span className="text-gray-300">Product C</span>
                    <span className="text-white">176 units</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-800/30 rounded-lg">
                    <span className="text-gray-300">Product D</span>
                    <span className="text-white">154 units</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-800/30 rounded-lg">
                    <span className="text-gray-300">Product E</span>
                    <span className="text-white">132 units</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl shadow-2xl">
              <CardHeader>
                <CardTitle className="text-lg text-white">Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-red-900/30 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-white font-medium">
                        Temperature Alert
                      </span>
                      <span className="text-red-400">High</span>
                    </div>
                    <div className="text-gray-400 text-sm mt-1">
                      Shipment SCM-2023-001
                    </div>
                  </div>
                  <div className="p-3 bg-yellow-900/30 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-white font-medium">
                        Delay Warning
                      </span>
                      <span className="text-yellow-400">Medium</span>
                    </div>
                    <div className="text-gray-400 text-sm mt-1">
                      Shipment SCM-2023-002
                    </div>
                  </div>
                  <div className="p-3 bg-green-900/30 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-white font-medium">
                        Delivery Complete
                      </span>
                      <span className="text-green-400">Info</span>
                    </div>
                    <div className="text-gray-400 text-sm mt-1">
                      Shipment SCM-2023-003
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsInterface;
