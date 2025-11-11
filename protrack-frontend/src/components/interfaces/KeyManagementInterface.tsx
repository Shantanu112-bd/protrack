import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { KeyManagement } from "../KeyManagement";

const KeyManagementInterface: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Key Management</h1>
          <p className="text-gray-400">
            Manage cryptographic keys for secure supply chain operations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl shadow-2xl">
              <CardHeader>
                <CardTitle className="text-xl text-white">
                  Key Management System
                </CardTitle>
              </CardHeader>
              <CardContent>
                <KeyManagement contractAddress="0x1234567890123456789012345678901234567890" />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl shadow-2xl">
              <CardHeader>
                <CardTitle className="text-lg text-white">
                  Key Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
                    <span className="text-gray-300">Total Keys</span>
                    <span className="text-white font-bold">12</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
                    <span className="text-gray-300">Active Keys</span>
                    <span className="text-green-400 font-bold">10</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
                    <span className="text-gray-300">MPC Keys</span>
                    <span className="text-blue-400 font-bold">8</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl shadow-2xl">
              <CardHeader>
                <CardTitle className="text-lg text-white">
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-800/30 rounded-lg">
                    <div className="text-white font-medium">
                      Generated new MPC key
                    </div>
                    <div className="text-gray-400 text-sm mt-1">
                      2 hours ago
                    </div>
                  </div>
                  <div className="p-3 bg-gray-800/30 rounded-lg">
                    <div className="text-white font-medium">
                      Rotated backup key
                    </div>
                    <div className="text-gray-400 text-sm mt-1">1 day ago</div>
                  </div>
                  <div className="p-3 bg-gray-800/30 rounded-lg">
                    <div className="text-white font-medium">
                      Revoked IoT device key
                    </div>
                    <div className="text-gray-400 text-sm mt-1">2 days ago</div>
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

export default KeyManagementInterface;
