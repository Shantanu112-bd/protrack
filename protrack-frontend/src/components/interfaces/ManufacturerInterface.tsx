import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import ManufacturerDashboard from "../dashboards/ManufacturerDashboard";
import EnhancedRFIDScanner from "../EnhancedRFIDScanner";

const ManufacturerInterface: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Manufacturer Dashboard
          </h1>
          <p className="text-gray-400">
            Manage product manufacturing, tokenization, and initial supply chain
            entry
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 backdrop-blur-lg border border-blue-700/50 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Products Manufactured</p>
                <p className="text-2xl font-bold text-white mt-1">1,248</p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-xl text-2xl text-blue-400">
                🏭
              </div>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-green-900/30 to-green-800/30 backdrop-blur-lg border border-green-700/50 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Tokenized Products</p>
                <p className="text-2xl font-bold text-white mt-1">1,245</p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-xl text-2xl text-green-400">
                🔖
              </div>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 backdrop-blur-lg border border-purple-700/50 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Pending Shipments</p>
                <p className="text-2xl font-bold text-white mt-1">24</p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-xl text-2xl text-purple-400">
                📦
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl shadow-2xl">
              <CardHeader>
                <CardTitle className="text-xl text-white">
                  Manufacturing Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ManufacturerDashboard />
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
                    Tokenize New Product
                  </button>
                  <button className="w-full text-left p-3 rounded-lg bg-gray-800/30 hover:bg-gray-700/50 text-gray-300">
                    View Production Schedule
                  </button>
                  <button className="w-full text-left p-3 rounded-lg bg-gray-800/30 hover:bg-gray-700/50 text-gray-300">
                    Manage Raw Materials
                  </button>
                  <button className="w-full text-left p-3 rounded-lg bg-gray-800/30 hover:bg-gray-700/50 text-gray-300">
                    Quality Control Reports
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl shadow-2xl">
              <CardHeader>
                <CardTitle className="text-lg text-white">
                  RFID Tokenization
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

export default ManufacturerInterface;
