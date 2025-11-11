import React, { useState } from "react";
import { useEnhancedWeb3 } from "../contexts/EnhancedWeb3Context";

const WalletTest: React.FC = () => {
  const { account, isConnected, balance, connectWallet, disconnectWallet } =
    useEnhancedWeb3();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      console.log("Testing wallet connection...");
      console.log("window.ethereum:", window.ethereum);

      if (typeof window.ethereum === "undefined") {
        throw new Error("MetaMask not found");
      }

      await connectWallet();
      console.log("Connection successful!");
    } catch (err: unknown) {
      console.error("Connection failed:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">Wallet Connection Test</h2>

      <div className="space-y-4">
        <div>
          <strong>MetaMask Status:</strong>{" "}
          {typeof window.ethereum !== "undefined"
            ? "✅ Detected"
            : "❌ Not Found"}
        </div>

        <div>
          <strong>Connection Status:</strong>{" "}
          {isConnected ? "✅ Connected" : "❌ Disconnected"}
        </div>

        {account && (
          <div>
            <strong>Account:</strong> {account}
          </div>
        )}

        {balance && (
          <div>
            <strong>Balance:</strong> {balance} ETH
          </div>
        )}

        {error && (
          <div className="text-red-600 text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="flex space-x-2">
          <button
            onClick={handleConnect}
            disabled={isConnecting || isConnected}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isConnecting ? "Connecting..." : "Connect"}
          </button>

          <button
            onClick={disconnectWallet}
            disabled={!isConnected}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletTest;
