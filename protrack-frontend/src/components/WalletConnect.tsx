import React, { useState } from "react";
import { useWeb3 } from "../contexts/web3ContextTypes";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import {
  Wallet,
  AlertTriangle,
  CheckCircle,
  Network,
  Copy,
} from "lucide-react";
import { getSupportedNetwork } from "../contracts/contractConfig";

const WalletConnect = () => {
  const {
    account,
    isActive,
    chainId,
    connectWallet,
    disconnectWallet,
    balance,
    error,
  } = useWeb3();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatAddress = (address: string | undefined) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Wallet Connection</h1>
        <p className="text-gray-600">
          Connect your wallet to interact with the blockchain
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wallet className="h-5 w-5 mr-2" />
            Wallet Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isActive ? (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-green-800 mb-2">
                  Wallet Connected
                </h2>
                <p className="text-green-700 mb-4">
                  Your wallet is successfully connected to the ProTrack network
                </p>
                <div className="bg-gray-100 p-4 rounded-md font-mono text-sm break-all flex items-center justify-between">
                  <span>{formatAddress(account)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => account && copyToClipboard(account)}
                    className="ml-2"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                {copied && (
                  <p className="text-green-600 text-sm mt-2">
                    Address copied to clipboard!
                  </p>
                )}
              </div>

              {balance && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-800 mb-2">
                    Account Balance
                  </h3>
                  <p className="text-blue-700 text-2xl font-bold">{balance}</p>
                </div>
              )}

              {chainId && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Network className="h-5 w-5 text-purple-500 mr-2" />
                    <h3 className="font-medium text-purple-800">
                      Network Information
                    </h3>
                  </div>
                  <div className="mt-2">
                    <p className="text-purple-700">
                      <span className="font-medium">Chain ID:</span> {chainId}
                    </p>
                    <p className="text-purple-700">
                      <span className="font-medium">Network:</span>{" "}
                      {getSupportedNetwork(chainId)?.name || "Unknown"}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-center">
                <Button
                  onClick={disconnectWallet}
                  variant="outline"
                  className="flex items-center"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Disconnect Wallet
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-yellow-800 mb-2">
                  Wallet Not Connected
                </h2>
                <p className="text-yellow-700 mb-4">
                  Connect your wallet to interact with ProTrack smart contracts
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              <div className="flex justify-center">
                <Button onClick={connectWallet} className="flex items-center">
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect Wallet
                </Button>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Supported Wallets
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4 text-center">
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-3" />
                    <h4 className="font-medium">MetaMask</h4>
                    <p className="text-sm text-gray-500">
                      Most popular browser extension
                    </p>
                  </div>
                  <div className="border rounded-lg p-4 text-center">
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-3" />
                    <h4 className="font-medium">WalletConnect</h4>
                    <p className="text-sm text-gray-500">
                      Mobile wallet integration
                    </p>
                  </div>
                  <div className="border rounded-lg p-4 text-center">
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-3" />
                    <h4 className="font-medium">Coinbase Wallet</h4>
                    <p className="text-sm text-gray-500">
                      Secure mobile wallet
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletConnect;
