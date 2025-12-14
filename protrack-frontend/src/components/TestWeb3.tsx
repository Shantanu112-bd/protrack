import React, { useState, useEffect } from "react";
import { useWeb3 } from "../contexts/web3ContextTypes";

const TestWeb3: React.FC = () => {
  const { account, chainId, isActive, connectWallet, disconnectWallet, error } =
    useWeb3();
  const [chainStatus, setChainStatus] = useState<string>("");

  useEffect(() => {
    // Check if we're on the correct chain
    if (chainId) {
      if (chainId === 1337) {
        setChainStatus("Connected to Local Hardhat Network (Chain ID: 1337)");
      } else {
        setChainStatus(`Connected to unsupported chain (Chain ID: ${chainId})`);
      }
    } else if (isActive) {
      setChainStatus("Wallet connected but chain ID not available");
    } else {
      setChainStatus("Wallet not connected");
    }
  }, [chainId, isActive]);

  return (
    <div className="p-4 bg-green-100 rounded-lg">
      <h2 className="text-xl font-bold mb-2">Web3 Test</h2>
      <div className="space-y-2">
        <p>
          <strong>Account:</strong> {account || "Not connected"}
        </p>
        <p>
          <strong>Status:</strong> {isActive ? "Connected" : "Disconnected"}
        </p>
        <p>
          <strong>Chain:</strong> {chainStatus}
        </p>
        {error && (
          <p className="text-red-600">
            <strong>Error:</strong> {error}
          </p>
        )}
        <div className="flex space-x-2 mt-4">
          <button
            onClick={connectWallet}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Connect Wallet
          </button>
          <button
            onClick={disconnectWallet}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Disconnect Wallet
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestWeb3;
