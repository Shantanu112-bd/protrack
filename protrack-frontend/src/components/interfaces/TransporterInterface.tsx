import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import TransporterDashboard from "../dashboards/TransporterDashboard";
import EnhancedSupplyChainDashboard from "../EnhancedSupplyChainDashboard";

const TransporterInterface: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Transporter Dashboard
          </h1>
          <p className="text-gray-400">
            Manage product shipments and track goods in transit
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 backdrop-blur-lg border border-blue-700/50 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Active Shipments</p>
                <p className="text-2xl font-bold text-white mt-1">24</p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-xl text-2xl text-blue-400">
                🚚
              </div>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-green-900/30 to-green-800/30 backdrop-blur-lg border border-green-700/50 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">On-Time Delivery</p>
                <p className="text-2xl font-bold text-white mt-1">92%</p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-xl text-2xl text-green-400">
                ⏰
              </div>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 backdrop-blur-lg border border-purple-700/50 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Completed Today</p>
                <p className="text-2xl font-bold text-white mt-1">8</p>
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
                  Shipment Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TransporterDashboard />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl shadow-2xl">
              <CardHeader>
                <CardTitle className="text-lg text-white">
                  Shipment Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-white font-medium">
                        SCM-2023-001
                      </span>
                      <span className="text-green-400">In Transit</span>
                    </div>
                    <div className="text-gray-400 text-sm mt-1">
                      From: Manufacturer
                    </div>
                    <div className="text-gray-400 text-sm">To: Distributor</div>
                  </div>
                  <div className="p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-white font-medium">
                        SCM-2023-002
                      </span>
                      <span className="text-blue-400">At Warehouse</span>
                    </div>
                    <div className="text-gray-400 text-sm mt-1">
                      From: Distributor
                    </div>
                    <div className="text-gray-400 text-sm">To: Retailer</div>
                  </div>
                  <div className="p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-white font-medium">
                        SCM-2023-003
                      </span>
                      <span className="text-purple-400">Delivered</span>
                    </div>
                    <div className="text-gray-400 text-sm mt-1">
                      From: Retailer
                    </div>
                    <div className="text-gray-400 text-sm">To: Consumer</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl shadow-2xl">
              <CardHeader>
                <CardTitle className="text-lg text-white">
                  IoT Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EnhancedSupplyChainDashboard />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransporterInterface;
