import React, { useState } from "react";
import {
  Wallet,
  ChevronDown,
  Copy,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Wifi,
  Zap,
} from "lucide-react";
import { useWeb3 } from "../contexts/web3ContextTypes";
import { CHAIN_ID } from "../contracts/contractConfig";
import { switchNetwork } from "../utils/switchNetwork";

const WalletConnection: React.FC = () => {
  const { account, chainId, isActive, connectWallet, disconnectWallet, error } =
    useWeb3();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);

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

  const handleSwitchNetwork = async () => {
    if (!isActive) return;

    setIsSwitchingNetwork(true);
    try {
      await switchNetwork(CHAIN_ID);
    } catch (error) {
      // Only log error, don't show alert for user rejections
      if (
        error instanceof Error &&
        !error.message.includes("User rejected") &&
        !error.message.includes("User denied")
      ) {
        console.error("Failed to switch network:", error);
        // Optionally show a non-intrusive notification
      }
    } finally {
      setIsSwitchingNetwork(false);
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
        className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl font-bold disabled:opacity-50 text-lg w-full justify-center"
      >
        <Wallet className="w-6 h-6" />
        {isConnecting ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
            Connecting Wallet...
          </div>
        ) : (
          "Connect Wallet"
        )}
      </button>
    );
  }

  return (
    <div className="relative w-full">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white rounded-2xl transition-all duration-300 transform hover:scale-105 border border-gray-700 shadow-xl w-full justify-between"
      >
        <div className="flex items-center gap-3">
          {isCorrectNetwork ? (
            <div className="relative">
              <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
              <CheckCircle className="w-6 h-6 text-green-400 relative" />
            </div>
          ) : (
            <AlertCircle className="w-6 h-6 text-yellow-400" />
          )}
          <Wallet className="w-6 h-6" />
          <span className="font-mono text-lg font-bold">
            {formatAddress(account!)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center text-sm bg-gray-700 px-3 py-1 rounded-full">
            <Wifi className="w-4 h-4 mr-1" />
            {isCorrectNetwork ? "Connected" : "Wrong Network"}
          </div>
          <ChevronDown
            className={`w-6 h-6 transition-transform duration-300 ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-3 w-full md:w-96 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700 z-50 animate-fade-in">
          <div className="p-6">
            {/* Account Info */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-bold text-white">
                  Wallet Connected
                </span>
                <button
                  onClick={copyAddress}
                  className="flex items-center gap-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-2 rounded-lg transition-colors"
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copied ? "Copied!" : "Copy Address"}
                </button>
              </div>
              <div className="font-mono text-lg bg-gray-800/50 p-4 rounded-lg border border-gray-700 break-all">
                {account}
              </div>
            </div>

            {/* Network Status */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-bold text-white">
                  Network Status
                </span>
                {!isCorrectNetwork && (
                  <span className="text-sm bg-gradient-to-r from-yellow-600 to-amber-600 text-white px-4 py-2 rounded-full">
                    Wrong Network
                  </span>
                )}
              </div>
              <div
                className={`flex items-center gap-3 p-4 rounded-lg ${
                  isCorrectNetwork
                    ? "bg-green-900/20 border border-green-800/50"
                    : "bg-yellow-900/20 border border-yellow-800/50"
                }`}
              >
                {isCorrectNetwork ? (
                  <CheckCircle className="w-8 h-8 text-green-400" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-yellow-400" />
                )}
                <div>
                  <div className="font-bold text-white text-lg">
                    {isCorrectNetwork
                      ? "Localhost (Hardhat)"
                      : `Chain ID: ${chainId}`}
                  </div>
                  <div className="text-sm text-gray-400">
                    {isCorrectNetwork
                      ? "Connected to the correct network"
                      : "Please switch to the correct network"}
                  </div>
                </div>
              </div>
              {!isCorrectNetwork && (
                <div className="mt-3">
                  <button
                    onClick={handleSwitchNetwork}
                    disabled={isSwitchingNetwork}
                    className="w-full bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center disabled:opacity-50"
                  >
                    {isSwitchingNetwork ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Switching Network...
                      </>
                    ) : (
                      "Switch to Correct Network"
                    )}
                  </button>
                  <div className="text-sm text-gray-500 mt-3 p-3 bg-gray-800/50 rounded-lg">
                    Switch to Localhost (Chain ID: {CHAIN_ID}) to interact with
                    smart contracts
                  </div>
                </div>
              )}
            </div>

            {/* Smart Contract Status */}
            {isCorrectNetwork && (
              <div className="mb-6 p-5 bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg border border-green-800/50">
                <div className="flex items-center gap-3 text-green-400 mb-3">
                  <Zap className="w-6 h-6" />
                  <span className="text-lg font-bold">
                    Smart Contracts Active
                  </span>
                </div>
                <div className="text-sm text-green-500">
                  Connected to ProTrack contracts on Hardhat network. You can
                  now interact with all blockchain features.
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-900/30 rounded-lg border border-red-800/50">
                <div className="flex items-center gap-3 text-red-400 mb-2">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-bold">Connection Error</span>
                </div>
                <div className="text-sm text-red-300">{error}</div>
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
                className="flex items-center gap-2 px-5 py-3 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-all duration-300 flex-1 justify-center"
              >
                <ExternalLink className="w-5 h-5" />
                <span className="hidden md:inline">View on Explorer</span>
              </button>
              <button
                onClick={() => {
                  disconnectWallet();
                  setIsDropdownOpen(false);
                }}
                className="flex items-center gap-2 px-5 py-3 text-sm bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg transition-all duration-300 flex-1 justify-center"
              >
                <Wallet className="w-5 h-5" />
                <span className="hidden md:inline">Disconnect</span>
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
