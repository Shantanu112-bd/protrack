import React, { useState, useEffect } from "react";
import { mpcService } from "../services/mpcService";

// Define proper types
interface Transaction {
  txId: string;
  keyId: string;
  operationHash: string;
  initiator: string;
  timestamp: number;
  isExecuted: boolean;
  approvalCount: number;
}

interface TransactionApprovalProps {
  contractAddress: string;
}

export const TransactionApproval: React.FC<TransactionApprovalProps> = ({
  contractAddress,
}) => {
  // Use the contractAddress parameter to avoid unused variable warning
  console.log("Contract address:", contractAddress);

  const [userKeys, setUserKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState("");
  const [operation, setOperation] = useState("");
  const [transactions, setTransactions] = useState<Record<string, Transaction>>(
    {}
  );
  const [pendingTransactions, setPendingTransactions] = useState<string[]>([]);
  const [status, setStatus] = useState<{
    type: "success" | "error" | "info" | null;
    message: string;
  }>({ type: null, message: "" });

  // Load user keys
  useEffect(() => {
    const loadUserKeys = async () => {
      try {
        // For demo purposes, we'll use a mock account
        const account = "0x742d35Cc6634C0532925a3b8D4C9db96590b5e8e";
        const keys = await mpcService.getUserKeys(account);
        setUserKeys(keys);
        setLoading(false);
      } catch (error) {
        console.error("Error loading user keys:", error);
        setLoading(false);
      }
    };

    loadUserKeys();
  }, []);

  // Load transactions for the selected key
  useEffect(() => {
    const loadTransactions = async () => {
      if (!selectedKey) return;

      try {
        // In a real implementation, you would fetch transactions from an indexer or event logs
        // Here we're simulating it with local storage for demonstration
        const storedTxs = localStorage.getItem(`transactions_${selectedKey}`);
        if (storedTxs) {
          const txIds = JSON.parse(storedTxs);
          const txDetails: Record<string, Transaction> = {};

          for (const txId of txIds) {
            try {
              const tx = await mpcService.getTransaction(txId);
              txDetails[txId] = tx;
              if (!tx.isExecuted) {
                setPendingTransactions((prev) => [...prev, txId]);
              }
            } catch (error) {
              console.error(`Error loading transaction ${txId}:`, error);
            }
          }

          setTransactions(txDetails);
        }
      } catch (error) {
        console.error("Error loading transactions:", error);
      }
    };

    loadTransactions();
  }, [selectedKey]);

  const handleInitiateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKey || !operation) return;

    setStatus({ type: "info", message: "Initiating transaction..." });

    try {
      // Create operation hash (simplified for demo)
      const operationHash = `0x${Array.from(new TextEncoder().encode(operation))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")}`;

      const txId = await mpcService.initiateTransaction(
        selectedKey,
        operationHash
      );

      // Store transaction ID in local storage
      const storedTxs = localStorage.getItem(`transactions_${selectedKey}`);
      const txIds = storedTxs ? JSON.parse(storedTxs) : [];
      txIds.push(txId);
      localStorage.setItem(
        `transactions_${selectedKey}`,
        JSON.stringify(txIds)
      );

      const tx = await mpcService.getTransaction(txId);
      setTransactions((prev) => ({
        ...prev,
        [txId]: tx,
      }));
      setPendingTransactions((prev) => [...prev, txId]);

      setStatus({
        type: "success",
        message: "Transaction initiated successfully!",
      });
      setOperation("");
    } catch (error) {
      console.error("Error initiating transaction:", error);
      setStatus({
        type: "error",
        message: "Error initiating transaction: " + (error as Error).message,
      });
    }
  };

  const handleApproveTransaction = async (txId: string) => {
    try {
      setStatus({ type: "info", message: "Approving transaction..." });

      const tx = transactions[txId];
      // Generate message hash for signing (mocked for demo)
      const messageHash = `0x${Array.from(
        new TextEncoder().encode(`${tx.operationHash}${tx.timestamp}`)
      )
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")}`;
      console.log("Message hash for signing:", messageHash);

      await mpcService.approveTransaction(txId);

      // Update transaction status
      const updatedTx = await mpcService.getTransaction(txId);
      setTransactions((prev) => ({
        ...prev,
        [txId]: updatedTx,
      }));

      if (updatedTx.isExecuted) {
        setPendingTransactions((prev) => prev.filter((id) => id !== txId));
      }

      setStatus({
        type: "success",
        message: "Transaction approved successfully!",
      });
    } catch (error) {
      console.error("Error approving transaction:", error);
      setStatus({
        type: "error",
        message: "Error approving transaction: " + (error as Error).message,
      });
    }
  };

  if (loading) {
    return <div className="p-4">Loading transaction approval...</div>;
  }

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold mb-4">Transaction Approval</h2>

      {/* Initiate Transaction Form */}
      <form
        onSubmit={handleInitiateTransaction}
        className="space-y-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Select Key</label>
          <select
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-700"
            required
          >
            <option value="">Select a key...</option>
            {userKeys.map((keyId) => (
              <option key={keyId} value={keyId}>
                {keyId.slice(0, 10)}...
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Operation</label>
          <input
            type="text"
            value={operation}
            onChange={(e) => setOperation(e.target.value)}
            placeholder="Enter operation details"
            className="w-full p-2 border rounded dark:bg-gray-700"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
        >
          Initiate Transaction
        </button>
      </form>

      {/* Status Messages */}
      {status.type && (
        <div
          className={`p-4 rounded ${
            status.type === "success"
              ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-100"
              : status.type === "error"
              ? "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-100"
              : "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-100"
          }`}
        >
          {status.message}
        </div>
      )}

      {/* Pending Transactions */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Pending Transactions</h3>
        <div className="space-y-4">
          {pendingTransactions.map((txId) => {
            const tx = transactions[txId];
            return (
              <div key={txId} className="border-b dark:border-gray-700 pb-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">
                      Transaction ID: {txId.slice(0, 10)}...
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Initiated by: {tx.initiator?.slice(0, 6)}...
                      {tx.initiator?.slice(-4)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Time:{" "}
                      {tx.timestamp
                        ? new Date(tx.timestamp).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium">
                      Approvals: {tx.approvalCount || 0}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleApproveTransaction(txId)}
                  className="w-full mt-2 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
                >
                  Approve
                </button>
              </div>
            );
          })}
          {pendingTransactions.length === 0 && (
            <p className="text-gray-600 dark:text-gray-400">
              No pending transactions
            </p>
          )}
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Transaction History</h3>
        <div className="space-y-4">
          {Object.entries(transactions)
            .filter(([, tx]) => tx.isExecuted)
            .map(([txId, tx]) => (
              <div key={txId} className="border-b dark:border-gray-700 pb-4">
                <h4 className="font-medium">
                  Transaction ID: {txId.slice(0, 10)}...
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Initiated by: {tx.initiator?.slice(0, 6)}...
                  {tx.initiator?.slice(-4)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Time:{" "}
                  {tx.timestamp
                    ? new Date(tx.timestamp).toLocaleString()
                    : "N/A"}
                </p>
                <span className="inline-block mt-2 px-2 py-1 text-sm bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-100 rounded">
                  Executed
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
