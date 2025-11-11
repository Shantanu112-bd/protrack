import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import ARScanner from "../ARScanner";

const ARScannerInterface: React.FC = () => {
  const [isScannerOpen, setIsScannerOpen] = useState(true);

  const handleCloseScanner = () => {
    setIsScannerOpen(false);
  };

  const handleScanComplete = (result: string) => {
    console.log("Scan completed with result:", result);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">AR Scanner</h1>
          <p className="text-gray-400">
            Augmented Reality product scanning and verification
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl shadow-2xl">
              <CardHeader>
                <CardTitle className="text-xl text-white">
                  AR Scanning Interface
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ARScanner
                  isOpen={isScannerOpen}
                  onClose={handleCloseScanner}
                  onScanComplete={handleScanComplete}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl shadow-2xl">
              <CardHeader>
                <CardTitle className="text-lg text-white">
                  AR Scan Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
                    <span className="text-gray-300">Total AR Scans</span>
                    <span className="text-white font-bold">86</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
                    <span className="text-gray-300">Successful</span>
                    <span className="text-green-400 font-bold">82</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
                    <span className="text-gray-300">Failed</span>
                    <span className="text-red-400 font-bold">4</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl shadow-2xl">
              <CardHeader>
                <CardTitle className="text-lg text-white">
                  Recent AR Scans
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-white font-medium">AR-789456</span>
                      <span className="text-green-400 text-sm">Success</span>
                    </div>
                    <div className="text-gray-400 text-sm mt-1">2 min ago</div>
                  </div>
                  <div className="p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-white font-medium">AR-123789</span>
                      <span className="text-green-400 text-sm">Success</span>
                    </div>
                    <div className="text-gray-400 text-sm mt-1">5 min ago</div>
                  </div>
                  <div className="p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-white font-medium">AR-456123</span>
                      <span className="text-red-400 text-sm">Failed</span>
                    </div>
                    <div className="text-gray-400 text-sm mt-1">10 min ago</div>
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

export default ARScannerInterface;
