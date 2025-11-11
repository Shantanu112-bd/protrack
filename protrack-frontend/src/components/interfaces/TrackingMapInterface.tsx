import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const TrackingMapInterface: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Tracking Map</h1>
          <p className="text-gray-400">
            Visualize product locations and shipment routes on an interactive
            map
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl shadow-2xl">
              <CardHeader>
                <CardTitle className="text-xl text-white">
                  Product Tracking Map
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[600px] rounded-xl overflow-hidden">
                  <div className="bg-gradient-to-br from-blue-900/30 via-purple-900/20 to-indigo-900/30 rounded-xl border border-gray-700/50 flex items-center justify-center h-full">
                    <div className="text-center p-6">
                      <div className="text-6xl mb-6">🌍</div>
                      <h3 className="text-2xl font-semibold text-white mb-4">
                        Interactive Supply Chain Map
                      </h3>
                      <p className="text-gray-400 max-w-md mx-auto">
                        Real-time visualization of product locations and
                        shipment routes across the supply chain
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl shadow-2xl">
              <CardHeader>
                <CardTitle className="text-lg text-white">
                  Active Shipments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-white font-medium">
                        SCM-2023-001
                      </span>
                      <span className="text-green-400 text-sm">In Transit</span>
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
                      <span className="text-blue-400 text-sm">
                        At Warehouse
                      </span>
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
                      <span className="text-purple-400 text-sm">Delivered</span>
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
                  Map Controls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <button className="w-full text-left p-2 rounded-lg bg-gray-800/30 hover:bg-gray-700/50 text-gray-300">
                    Show Temperature Zones
                  </button>
                  <button className="w-full text-left p-2 rounded-lg bg-gray-800/30 hover:bg-gray-700/50 text-gray-300">
                    Show Humidity Zones
                  </button>
                  <button className="w-full text-left p-2 rounded-lg bg-gray-800/30 hover:bg-gray-700/50 text-gray-300">
                    Show Route History
                  </button>
                  <button className="w-full text-left p-2 rounded-lg bg-gray-800/30 hover:bg-gray-700/50 text-gray-300">
                    Export Map Data
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

export default TrackingMapInterface;
