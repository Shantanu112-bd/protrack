import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import MPCWalletManager from "../MPCWalletManager";

const MPCWalletInterface: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">MPC Wallet</h1>
          <p className="text-gray-400">
            Manage multi-party computation wallet and transactions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl shadow-2xl">
              <CardHeader>
                <CardTitle className="text-xl text-white">
                  MPC Wallet Manager
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MPCWalletManager />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl shadow-2xl">
              <CardHeader>
                <CardTitle className="text-lg text-white">
                  Wallet Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <div className="text-3xl font-bold text-white mb-2">
                    12.45 ETH
                  </div>
                  <div className="text-gray-400">≈ $24,890.00 USD</div>
                  <div className="mt-4 flex justify-center space-x-3">
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white">
                      Send
                    </button>
                    <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white">
                      Receive
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl shadow-2xl">
              <CardHeader>
                <CardTitle className="text-lg text-white">
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-white font-medium">
                        Product Tokenization
                      </span>
                      <span className="text-green-400">+0.001 ETH</span>
                    </div>
                    <div className="text-gray-400 text-sm mt-1">
                      RFID-789456
                    </div>
                  </div>
                  <div className="p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-white font-medium">
                        Shipment Verification
                      </span>
                      <span className="text-green-400">+0.0005 ETH</span>
                    </div>
                    <div className="text-gray-400 text-sm mt-1">
                      SCM-2023-001
                    </div>
                  </div>
                  <div className="p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-white font-medium">
                        Wallet Transfer
                      </span>
                      <span className="text-red-400">-0.5 ETH</span>
                    </div>
                    <div className="text-gray-400 text-sm mt-1">
                      To: 0x742d...fE7b
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

export default MPCWalletInterface;
