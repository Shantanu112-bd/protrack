import React, { useContext, useEffect } from "react";
import { Web3Context } from "../contexts/web3ContextTypes";

const DebugWallet = () => {
  const {
    account,
    isActive,
    chainId,
    connectWallet,
    disconnectWallet,
    balance,
    error,
  } = useContext(Web3Context);

  useEffect(() => {
    console.log("DebugWallet - Web3 Context Values:", {
      account,
      isActive,
      chainId,
      balance,
      error,
    });
  }, [account, isActive, chainId, balance, error]);

  return (
    <div className="p-6 bg-gray-100 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Wallet Debug Info</h2>
      <div className="space-y-2">
        <p>
          <strong>Account:</strong> {account || "Not connected"}
        </p>
        <p>
          <strong>Is Active:</strong> {isActive ? "Yes" : "No"}
        </p>
        <p>
          <strong>Chain ID:</strong> {chainId || "Unknown"}
        </p>
        <p>
          <strong>Balance:</strong> {balance || "N/A"}
        </p>
        <p>
          <strong>Error:</strong> {error || "None"}
        </p>
      </div>
      <div className="mt-4 space-x-2">
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
  );
};

export default DebugWallet;
