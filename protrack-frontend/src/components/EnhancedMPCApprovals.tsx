import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  Clock,
  Users,
  Shield,
  AlertTriangle,
  Check,
  Plus,
  X,
} from "lucide-react";
import { useEnhancedWeb3 } from "../contexts/EnhancedWeb3Context";
import { mpcService } from "../services/mpcService";

interface ApprovalTransaction {
  txHash: string;
  walletId: number;
  productId?: number;
  to: string;
  value: number;
  operation: string;
  signatureCount: number;
  requiredSignatures: number;
  timestamp: number;
  status: "pending" | "approved" | "executed" | "rejected";
  proposer: string;
  signers: string[];
  approvals: { signer: string; timestamp: number }[];
}

interface MPCWalletInfo {
  walletId: number;
  threshold: number;
  totalSigners: number;
  isActive: boolean;
  nonce: number;
  signers: string[];
}

const EnhancedMPCApprovals: React.FC = () => {
  const { account, isConnected } = useEnhancedWeb3();

  const [wallets, setWallets] = useState<MPCWalletInfo[]>([]);
  const [pendingTransactions, setPendingTransactions] = useState<
    ApprovalTransaction[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<number | null>(null);
  const [showNewProposal, setShowNewProposal] = useState(false);

  // Proposal form state
  const [proposalData, setProposalData] = useState({
    to: "",
    value: "",
    operation: "TRANSFER",
    productId: "",
  });

  useEffect(() => {
    if (isConnected && account) {
      loadWallets();
      loadPendingTransactions();
    }
  }, [isConnected, account]);

  const loadWallets = async () => {
    try {
      if (!account) return;

      // Get user's wallets from the MPC service
      const userKeys = await mpcService.getUserKeys(account);
      const walletPromises = userKeys.map((keyId) => mpcService.getKey(keyId));
      const walletData = await Promise.all(walletPromises);

      // Convert to the expected format
      const formattedWallets = walletData.map((wallet, index) => ({
        walletId: index + 1, // Simple ID for display
        threshold: wallet.threshold,
        totalSigners: wallet.totalSigners,
        isActive: wallet.isActive,
        nonce: wallet.nonce,
        signers: wallet.signers,
      }));

      setWallets(formattedWallets);
    } catch (error) {
      console.error("Error loading wallets:", error);
    }
  };

  const loadPendingTransactions = async () => {
    try {
      // In a real implementation, we would fetch pending transactions from the contract
      // For now, we'll use mock data but with real wallet information
      const mockTransactions: ApprovalTransaction[] = [
        {
          txHash: "0xabc123def456...",
          walletId: 1,
          productId: 1001,
          to: "0x742d35Cc6634C0532925a3b8D0C9C3c8e1B5C9E8",
          value: 0,
          operation: "PRODUCT_TRANSFER",
          signatureCount: 1,
          requiredSignatures: 2,
          timestamp: Date.now() - 3600000,
          status: "pending",
          proposer: account || "",
          signers: [
            account || "",
            "0x742d35Cc6634C0532925a3b8D0C9C3c8e1B5C9E8",
            "0x8ba1f109551bD432803012645Hac136c0c8416",
          ],
          approvals: [
            {
              signer: account || "",
              timestamp: Date.now() - 3600000,
            },
          ],
        },
        {
          txHash: "0xdef456abc123...",
          walletId: 2,
          productId: 1002,
          to: "0x8ba1f109551bD432803012645Hac136c0c8416",
          value: 0,
          operation: "PRODUCT_RECALL",
          signatureCount: 2,
          requiredSignatures: 3,
          timestamp: Date.now() - 1800000,
          status: "pending",
          proposer: "0x742d35Cc6634C0532925a3b8D0C9C3c8e1B5C9E8",
          signers: [
            "0x742d35Cc6634C0532925a3b8D0C9C3c8e1B5C9E8",
            account || "",
            "0x8ba1f109551bD432803012645Hac136c0c8416",
            "0x123456789abcdef123456789abcdef123456789a",
            "0x987654321fedcba987654321fedcba987654321f",
          ],
          approvals: [
            {
              signer: "0x742d35Cc6634C0532925a3b8D0C9C3c8e1B5C9E8",
              timestamp: Date.now() - 1800000,
            },
            {
              signer: "0x123456789abcdef123456789abcdef123456789a",
              timestamp: Date.now() - 1700000,
            },
          ],
        },
      ];
      setPendingTransactions(mockTransactions);
    } catch (error) {
      console.error("Error loading pending transactions:", error);
    }
  };

  const handleApproveTransaction = async (txHash: string) => {
    if (!account) return;

    setLoading(true);
    try {
      // Approve the transaction using the MPC service
      await mpcService.approveTransaction(txHash);

      // Update local state
      setPendingTransactions((prev) =>
        prev.map((tx) =>
          tx.txHash === txHash
            ? {
                ...tx,
                signatureCount: tx.signatureCount + 1,
                approvals: [
                  ...tx.approvals,
                  {
                    signer: account,
                    timestamp: Date.now(),
                  },
                ],
              }
            : tx
        )
      );
    } catch (error) {
      console.error("Error approving transaction:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewProposal = async () => {
    if (!selectedWallet || !proposalData.to || !proposalData.operation) return;

    setLoading(true);
    try {
      const wallet = wallets.find((w) => w.walletId === selectedWallet);
      if (!wallet) throw new Error("Wallet not found");

      // Create operation hash (simplified for demo)
      const operationData = `${proposalData.to}${proposalData.value}${proposalData.operation}`;
      const operationHash = `0x${Array.from(
        new TextEncoder().encode(operationData)
      )
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")}`;

      // Initiate transaction using the MPC service
      const txHash = await mpcService.initiateTransaction(
        `key_${selectedWallet}`, // Simple key ID mapping
        operationHash
      );

      // Add to pending transactions
      const newTransaction: ApprovalTransaction = {
        txHash,
        walletId: selectedWallet,
        productId: proposalData.productId
          ? parseInt(proposalData.productId)
          : undefined,
        to: proposalData.to,
        value: parseFloat(proposalData.value) || 0,
        operation: proposalData.operation,
        signatureCount: 1, // Proposer auto-signs
        requiredSignatures: wallet.threshold,
        timestamp: Date.now(),
        status: "pending",
        proposer: account || "",
        signers: wallet.signers,
        approvals: [
          {
            signer: account || "",
            timestamp: Date.now(),
          },
        ],
      };

      setPendingTransactions((prev) => [...prev, newTransaction]);

      // Reset form
      setProposalData({
        to: "",
        value: "",
        operation: "TRANSFER",
        productId: "",
      });
      setShowNewProposal(false);
    } catch (error) {
      console.error("Error proposing transaction:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionStatusColor = (tx: ApprovalTransaction) => {
    if (tx.signatureCount >= tx.requiredSignatures) return "text-green-400";
    if (tx.signatureCount > 0) return "text-yellow-400";
    return "text-gray-400";
  };

  const getTransactionStatusIcon = (tx: ApprovalTransaction) => {
    if (tx.signatureCount >= tx.requiredSignatures)
      return <CheckCircle className="w-4 h-4" />;
    if (tx.signatureCount > 0) return <Clock className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isUserSigner = (signers: string[]) => {
    return signers.includes(account || "");
  };

  const hasUserApproved = (
    approvals: { signer: string; timestamp: number }[]
  ) => {
    return approvals.some((approval) => approval.signer === account);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Shield className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">MPC Approvals</h2>
            <p className="text-gray-400">
              Multi-Party Computation transaction approvals
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowNewProposal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Proposal</span>
        </button>
      </div>

      {/* Wallet Selection */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4">
        <h3 className="text-lg font-medium text-white mb-3">Select Wallet</h3>
        <div className="flex flex-wrap gap-2">
          {wallets.map((wallet) => (
            <button
              key={wallet.walletId}
              onClick={() => setSelectedWallet(wallet.walletId)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedWallet === wallet.walletId
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Wallet #{wallet.walletId} ({wallet.threshold}/
              {wallet.totalSigners})
            </button>
          ))}
        </div>
      </div>

      {/* Pending Transactions */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Clock className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-medium text-white">Pending Approvals</h3>
        </div>

        <div className="space-y-4">
          {pendingTransactions
            .filter(
              (tx) => selectedWallet === null || tx.walletId === selectedWallet
            )
            .map((tx) => (
              <motion.div
                key={tx.txHash}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-900/50 border border-gray-600 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-1 rounded ${getTransactionStatusColor(tx)}`}
                    >
                      {getTransactionStatusIcon(tx)}
                    </div>
                    <div>
                      <div className="text-white font-medium">
                        {tx.operation}
                      </div>
                      <div className="text-gray-400 text-sm">
                        Wallet #{tx.walletId} •{" "}
                        {tx.productId
                          ? `Product #${tx.productId}`
                          : "No Product"}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm ${getTransactionStatusColor(tx)}`}>
                      {tx.signatureCount}/{tx.requiredSignatures} approvals
                    </div>
                    <div className="text-gray-400 text-xs">
                      {new Date(tx.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-gray-400">To:</span>
                    <div className="text-white font-mono text-xs">
                      {formatAddress(tx.to)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Value:</span>
                    <div className="text-white">{tx.value} ETH</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Proposer:</span>
                    <div className="text-white font-mono text-xs">
                      {formatAddress(tx.proposer)}
                    </div>
                  </div>
                </div>

                {/* Approval Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Approvals</span>
                    <span className="text-gray-400">
                      {tx.approvals.length}/{tx.signers.length} signers
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${
                          (tx.approvals.length / tx.signers.length) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Signer List */}
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400 text-sm">Signers</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tx.signers.map((signer, index) => {
                      const hasApproved = tx.approvals.some(
                        (a) => a.signer === signer
                      );
                      return (
                        <div
                          key={index}
                          className={`px-2 py-1 rounded text-xs flex items-center space-x-1 ${
                            signer === account
                              ? hasApproved
                                ? "bg-green-500/20 text-green-400"
                                : "bg-blue-500/20 text-blue-400"
                              : hasApproved
                              ? "bg-green-500/20 text-green-400"
                              : "bg-gray-700 text-gray-300"
                          }`}
                        >
                          {hasApproved && <Check className="w-3 h-3" />}
                          <span>{formatAddress(signer)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Approval Button */}
                {isUserSigner(tx.signers) && !hasUserApproved(tx.approvals) && (
                  <button
                    onClick={() => handleApproveTransaction(tx.txHash)}
                    disabled={
                      loading || tx.signatureCount >= tx.requiredSignatures
                    }
                    className="w-full px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loading ? "Approving..." : "Approve Transaction"}
                  </button>
                )}

                {hasUserApproved(tx.approvals) && (
                  <div className="w-full px-4 py-2 bg-green-600/20 text-green-400 rounded-lg text-center">
                    You have approved this transaction
                  </div>
                )}

                {!isUserSigner(tx.signers) && (
                  <div className="w-full px-4 py-2 bg-gray-700 text-gray-400 rounded-lg text-center">
                    You are not a signer for this transaction
                  </div>
                )}
              </motion.div>
            ))}

          {pendingTransactions.filter(
            (tx) => selectedWallet === null || tx.walletId === selectedWallet
          ).length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No pending approvals
            </div>
          )}
        </div>
      </div>

      {/* New Proposal Modal */}
      <AnimatePresence>
        {showNewProposal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-white">
                  New Transaction Proposal
                </h3>
                <button
                  onClick={() => setShowNewProposal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Operation Type
                  </label>
                  <select
                    value={proposalData.operation}
                    onChange={(e) =>
                      setProposalData({
                        ...proposalData,
                        operation: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="TRANSFER">Transfer Product</option>
                    <option value="MINT">Mint NFT</option>
                    <option value="RECALL">Product Recall</option>
                    <option value="IOT_UPDATE">IoT Data Update</option>
                    <option value="VERIFY">Product Verification</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    To Address
                  </label>
                  <input
                    type="text"
                    value={proposalData.to}
                    onChange={(e) =>
                      setProposalData({ ...proposalData, to: e.target.value })
                    }
                    placeholder="0x..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Product ID (optional)
                  </label>
                  <input
                    type="number"
                    value={proposalData.productId}
                    onChange={(e) =>
                      setProposalData({
                        ...proposalData,
                        productId: e.target.value,
                      })
                    }
                    placeholder="12345"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Value (ETH)
                  </label>
                  <input
                    type="number"
                    value={proposalData.value}
                    onChange={(e) =>
                      setProposalData({
                        ...proposalData,
                        value: e.target.value,
                      })
                    }
                    placeholder="0.0"
                    step="0.01"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowNewProposal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleNewProposal}
                  disabled={
                    loading || !proposalData.to || !proposalData.operation
                  }
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? "Proposing..." : "Propose"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedMPCApprovals;
