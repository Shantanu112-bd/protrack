import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import NFTProductCreation from "../NFTProductCreation";

const NFTProductCreationInterface: React.FC = () => {
  const [darkMode] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            NFT Product Creation
          </h1>
          <p className="text-gray-400">
            Create and manage product NFTs on the blockchain
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl shadow-2xl">
              <CardHeader>
                <CardTitle className="text-xl text-white">
                  Create Product NFT
                </CardTitle>
              </CardHeader>
              <CardContent>
                <NFTProductCreation isDark={darkMode} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl shadow-2xl">
              <CardHeader>
                <CardTitle className="text-lg text-white">
                  NFT Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-800/30 rounded-lg">
                    <h4 className="font-medium text-white">
                      Immutable Ownership
                    </h4>
                    <p className="text-gray-400 text-sm mt-1">
                      Permanent proof of product ownership
                    </p>
                  </div>
                  <div className="p-3 bg-gray-800/30 rounded-lg">
                    <h4 className="font-medium text-white">
                      Supply Chain Transparency
                    </h4>
                    <p className="text-gray-400 text-sm mt-1">
                      Complete product journey on-chain
                    </p>
                  </div>
                  <div className="p-3 bg-gray-800/30 rounded-lg">
                    <h4 className="font-medium text-white">
                      Counterfeit Prevention
                    </h4>
                    <p className="text-gray-400 text-sm mt-1">
                      Tamper-proof product authentication
                    </p>
                  </div>
                  <div className="p-3 bg-gray-800/30 rounded-lg">
                    <h4 className="font-medium text-white">
                      Smart Contract Automation
                    </h4>
                    <p className="text-gray-400 text-sm mt-1">
                      Automated royalty distributions
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl shadow-2xl">
              <CardHeader>
                <CardTitle className="text-lg text-white">
                  Recent NFTs Created
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-800/30 rounded-lg">
                    <div className="text-white font-medium">
                      Product #NFT-7894
                    </div>
                    <div className="text-gray-400 text-sm mt-1">
                      Created 2 hours ago
                    </div>
                  </div>
                  <div className="p-3 bg-gray-800/30 rounded-lg">
                    <div className="text-white font-medium">
                      Product #NFT-1237
                    </div>
                    <div className="text-gray-400 text-sm mt-1">
                      Created 1 day ago
                    </div>
                  </div>
                  <div className="p-3 bg-gray-800/30 rounded-lg">
                    <div className="text-white font-medium">
                      Product #NFT-4561
                    </div>
                    <div className="text-gray-400 text-sm mt-1">
                      Created 2 days ago
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

export default NFTProductCreationInterface;
