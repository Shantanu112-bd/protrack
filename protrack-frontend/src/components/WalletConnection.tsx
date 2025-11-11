import React, { useState } from "react";
import {
  Wallet,
  ChevronDown,
  Copy,
  ExternalLink,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useWeb3 } from "../hooks/useWeb3";
import { CHAIN_ID } from "../contracts/contractConfig";

const WalletConnection: React.FC = () => {
  const { account, chainId, isActive, connectWallet, disconnectWallet } =
    useWeb3();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connectWallet();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isCorrectNetwork = chainId === CHAIN_ID;

  if (!isActive) {
    return (
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg font-medium disabled:opacity-50"
      >
        <Wallet className="w-5 h-5" />
        {isConnecting ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
            Connecting...
          </div>
        ) : (
          "Connect Wallet"
        )}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl transition-all duration-300 transform hover:scale-105 border border-gray-700 shadow-lg"
      >
        <div className="flex items-center gap-2">
          {isCorrectNetwork ? (
            <CheckCircle className="w-5 h-5 text-green-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-yellow-400" />
          )}
          <Wallet className="w-5 h-5" />
          <span className="font-mono text-sm font-medium">
            {formatAddress(account!)}
          </span>
        </div>
        <ChevronDown
          className={`w-5 h-5 transition-transform duration-300 ${
            isDropdownOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl border border-gray-700 z-50 animate-fade-in">
          <div className="p-5">
            {/* Account Info */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-400">
                  Account
                </span>
                <button
                  onClick={copyAddress}
                  className="flex items-center gap-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded-lg transition-colors"
                >
                  {copied ? (
                    <CheckCircle className="w-3 h-3 text-green-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <div className="font-mono text-sm bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                {account}
              </div>
            </div>

            {/* Network Status */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-400">
                  Network
                </span>
                {!isCorrectNetwork && (
                  <span className="text-xs bg-gradient-to-r from-yellow-600 to-amber-600 text-white px-3 py-1 rounded-lg">
                    Wrong Network
                  </span>
                )}
              </div>
              <div
                className={`flex items-center gap-2 ${
                  isCorrectNetwork ? "text-green-400" : "text-yellow-400"
                }`}
              >
                {isCorrectNetwork ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span className="text-sm font-medium">
                  {isCorrectNetwork
                    ? "Localhost (Hardhat)"
                    : `Chain ID: ${chainId}`}
                </span>
              </div>
              {!isCorrectNetwork && (
                <div className="text-xs text-gray-500 mt-2">
                  Switch to Localhost (Chain ID: {CHAIN_ID}) to interact with
                  smart contracts
                </div>
              )}
            </div>

            {/* Smart Contract Status */}
            {isCorrectNetwork && (
              <div className="mb-5 p-4 bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg border border-green-800/50">
                <div className="flex items-center gap-2 text-green-400 mb-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-bold">
                    Smart Contracts Active
                  </span>
                </div>
                <div className="text-xs text-green-500">
                  Connected to ProTrack contracts on Hardhat network
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() =>
                  window.open(
                    `https://etherscan.io/address/${account}`,
                    "_blank"
                  )
                }
                className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-all duration-300"
              >
                <ExternalLink className="w-4 h-4" />
                Explorer
              </button>
              <button
                onClick={() => {
                  disconnectWallet();
                  setIsDropdownOpen(false);
                }}
                className="flex-1 px-4 py-2 text-sm bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg transition-all duration-300"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default WalletConnection;
