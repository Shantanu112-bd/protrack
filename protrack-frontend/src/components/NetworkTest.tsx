import React, { useState, useEffect } from "react";
import { useWeb3 } from "../contexts/web3ContextTypes";
import { ensureCorrectNetwork } from "../utils/switchNetwork";

const NetworkTest: React.FC = () => {
  const { account, chainId, isActive, connectWallet, disconnectWallet, error } =
    useWeb3();
  const [networkStatus, setNetworkStatus] = useState<string>("");
  const [isChecking, setIsChecking] = useState<boolean>(false);

  useEffect(() => {
    // Check if we're on the correct chain
    if (chainId) {
      if (chainId === 1337) {
        setNetworkStatus("Connected to Local Hardhat Network (Chain ID: 1337)");
      } else {
        setNetworkStatus(
          `Connected to unsupported chain (Chain ID: ${chainId})`
        );
      }
    } else if (isActive) {
      setNetworkStatus("Wallet connected but chain ID not available");
    } else {
      setNetworkStatus("Wallet not connected");
    }
  }, [chainId, isActive]);

  const handleSwitchNetwork = async () => {
    setIsChecking(true);
    try {
      const result = await ensureCorrectNetwork();
      if (result) {
        setNetworkStatus(
          "Successfully switched to Local Hardhat Network (Chain ID: 1337)"
        );
      } else {
        setNetworkStatus(
          "Failed to switch network. Please check console for details."
        );
      }
    } catch (err) {
      console.error("Error switching network:", err);
      setNetworkStatus(`Error: ${(err as Error).message}`);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="p-6 bg-blue-50 rounded-lg max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Network Test</h2>

      <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-lg mb-2">Connection Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Account</p>
              <p className="font-mono break-all">
                {account || "Not connected"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Chain ID</p>
              <p>{chainId || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p>{isActive ? "Connected" : "Disconnected"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Network</p>
              <p>{networkStatus}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="flex flex-wrap gap-4 justify-center">
          {!isActive ? (
            <button
              onClick={connectWallet}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Connect Wallet
            </button>
          ) : (
            <button
              onClick={disconnectWallet}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Disconnect Wallet
            </button>
          )}

          <button
            onClick={handleSwitchNetwork}
            disabled={isChecking}
            className={`px-6 py-2 text-white rounded-lg transition-colors ${
              isChecking
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isChecking ? "Switching..." : "Switch to Local Network"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NetworkTest;
