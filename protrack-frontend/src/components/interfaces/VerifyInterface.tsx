import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import EnhancedRFIDScanner from "../EnhancedRFIDScanner";

const VerifyInterface: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Product Verification
          </h1>
          <p className="text-gray-400">
            Verify product authenticity and view supply chain history
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl shadow-2xl">
              <CardHeader>
                <CardTitle className="text-xl text-white">
                  Product Verification Scanner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EnhancedRFIDScanner />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl shadow-2xl">
              <CardHeader>
                <CardTitle className="text-lg text-white">
                  Verification Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Scan a Product
                  </h3>
                  <p className="text-gray-400">
                    Use the scanner to verify product authenticity
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl shadow-2xl">
              <CardHeader>
                <CardTitle className="text-lg text-white">
                  Verification History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-white font-medium">
                        RFID-789456
                      </span>
                      <span className="text-green-400">Verified</span>
                    </div>
                    <div className="text-gray-400 text-sm mt-1">
                      2 hours ago
                    </div>
                  </div>
                  <div className="p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-white font-medium">
                        RFID-123789
                      </span>
                      <span className="text-green-400">Verified</span>
                    </div>
                    <div className="text-gray-400 text-sm mt-1">1 day ago</div>
                  </div>
                  <div className="p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-white font-medium">
                        RFID-456123
                      </span>
                      <span className="text-red-400">Invalid</span>
                    </div>
                    <div className="text-gray-400 text-sm mt-1">3 days ago</div>
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

export default VerifyInterface;
