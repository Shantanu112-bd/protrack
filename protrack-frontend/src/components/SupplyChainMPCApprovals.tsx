import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Users,
  Shield,
  AlertTriangle,
  Check,
  Plus,
  X,
  Truck,
  Package,
  Warehouse,
  Store,
  User,
} from "lucide-react";
import { useEnhancedWeb3 } from "../contexts/EnhancedWeb3Context";

interface SupplyChainTransaction {
  txHash: string;
  productId: number;
  productName: string;
  fromParty: string;
  toParty: string;
  operation: "TRANSFER" | "PACKAGING" | "SHIPPING" | "DELIVERY" | "RECALL";
  signatureCount: number;
  requiredSignatures: number;
  timestamp: number;
  status: "pending" | "approved" | "executed" | "rejected";
  proposer: string;
  signers: { address: string; role: string; name: string }[];
  approvals: { signer: string; timestamp: number; role: string }[];
  metadata?: {
    location?: string;
    temperature?: number;
    humidity?: number;
    batchNumber?: string;
  };
}

const SupplyChainMPCApprovals: React.FC = () => {
  const { account, isConnected, signMPCTransaction } = useEnhancedWeb3();

  const [pendingTransactions, setPendingTransactions] = useState<
    SupplyChainTransaction[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [showNewProposal, setShowNewProposal] = useState(false);
  const [userRole, setUserRole] = useState<string>("MANUFACTURER");

  // Proposal form state
  const [proposalData, setProposalData] = useState({
    productId: "",
    productName: "",
    toParty: "",
    operation: "TRANSFER" as
      | "TRANSFER"
      | "PACKAGING"
      | "SHIPPING"
      | "DELIVERY"
      | "RECALL",
    batchNumber: "",
    location: "",
  });

  // Mock user data
  const userRoles = {
    "0x1234...5678": { role: "MANUFACTURER", name: "ABC Pharma" },
    "0x9876...5432": { role: "PACKAGER", name: "XYZ Packaging" },
    "0x5678...1234": { role: "TRANSPORTER", name: "Global Logistics" },
    "0x4321...8765": { role: "WHOLESALER", name: "MediDistributor" },
    "0x1111...2222": { role: "RETAILER", name: "HealthPlus Pharmacy" },
  };

  useEffect(() => {
    if (isConnected && account) {
      loadPendingTransactions();
    }
  }, [isConnected, account]);

  const loadPendingTransactions = async () => {
    try {
      // Mock pending transactions with supply chain context
      const mockTransactions: SupplyChainTransaction[] = [
        {
          txHash: "0xabc123def456...",
          productId: 1001,
          productName: "Vaccine Batch A",
          fromParty: "0x1234...5678",
          toParty: "0x9876...5432",
          operation: "PACKAGING",
          signatureCount: 1,
          requiredSignatures: 2,
          timestamp: Date.now() - 3600000,
          status: "pending",
          proposer: "0x1234...5678",
          signers: [
            {
              address: "0x1234...5678",
              role: "MANUFACTURER",
              name: "ABC Pharma",
            },
            {
              address: "0x9876...5432",
              role: "PACKAGER",
              name: "XYZ Packaging",
            },
          ],
          approvals: [
            {
              signer: "0x1234...5678",
              timestamp: Date.now() - 3600000,
              role: "MANUFACTURER",
            },
          ],
          metadata: {
            batchNumber: "BATCH-2023-001",
            location: "Factory A, New York",
          },
        },
        {
          txHash: "0xdef456abc123...",
          productId: 1001,
          productName: "Vaccine Batch A",
          fromParty: "0x9876...5432",
          toParty: "0x5678...1234",
          operation: "SHIPPING",
          signatureCount: 2,
          requiredSignatures: 3,
          timestamp: Date.now() - 1800000,
          status: "pending",
          proposer: "0x9876...5432",
          signers: [
            {
              address: "0x9876...5432",
              role: "PACKAGER",
              name: "XYZ Packaging",
            },
            {
              address: "0x5678...1234",
              role: "TRANSPORTER",
              name: "Global Logistics",
            },
            {
              address: account!,
              role: userRole,
              name:
                userRoles[account as keyof typeof userRoles]?.name ||
                "Current User",
            },
          ],
          approvals: [
            {
              signer: "0x9876...5432",
              timestamp: Date.now() - 1800000,
              role: "PACKAGER",
            },
            {
              signer: "0x5678...1234",
              timestamp: Date.now() - 1700000,
              role: "TRANSPORTER",
            },
          ],
          metadata: {
            batchNumber: "BATCH-2023-001",
            location: "Distribution Center, Chicago",
            temperature: 2.5,
            humidity: 45,
          },
        },
      ];
      setPendingTransactions(mockTransactions);
    } catch (error) {
      console.error("Error loading pending transactions:", error);
    }
  };

  const handleApproveTransaction = async (txHash: string, walletId: number) => {
    setLoading(true);
    try {
      await signMPCTransaction(walletId, txHash);

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
                    signer: account!,
                    timestamp: Date.now(),
                    role: userRole,
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
    if (
      !proposalData.productId ||
      !proposalData.toParty ||
      !proposalData.operation
    )
      return;

    setLoading(true);
    try {
      // In a real implementation, this would interact with the smart contract
      const txHash = `0x${Math.random().toString(16).substr(2, 40)}`;

      // Add to pending transactions
      const newTransaction: SupplyChainTransaction = {
        txHash,
        productId: parseInt(proposalData.productId),
        productName: proposalData.productName,
        fromParty: account!,
        toParty: proposalData.toParty,
        operation: proposalData.operation,
        signatureCount: 1, // Proposer auto-signs
        requiredSignatures: 2, // Default threshold
        timestamp: Date.now(),
        status: "pending",
        proposer: account!,
        signers: [
          {
            address: account!,
            role: userRole,
            name:
              userRoles[account as keyof typeof userRoles]?.name ||
              "Current User",
          },
          { address: proposalData.toParty, role: "PARTNER", name: "Partner" },
        ],
        approvals: [
          {
            signer: account!,
            timestamp: Date.now(),
            role: userRole,
          },
        ],
        metadata: {
          batchNumber: proposalData.batchNumber,
          location: proposalData.location,
        },
      };

      setPendingTransactions((prev) => [...prev, newTransaction]);

      // Reset form
      setProposalData({
        productId: "",
        productName: "",
        toParty: "",
        operation: "TRANSFER",
        batchNumber: "",
        location: "",
      });
      setShowNewProposal(false);
    } catch (error) {
      console.error("Error proposing transaction:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionStatusColor = (tx: SupplyChainTransaction) => {
    if (tx.signatureCount >= tx.requiredSignatures) return "text-green-400";
    if (tx.signatureCount > 0) return "text-yellow-400";
    return "text-gray-400";
  };

  const getOperationIcon = (operation: SupplyChainTransaction["operation"]) => {
    switch (operation) {
      case "PACKAGING":
        return <Package className="w-4 h-4" />;
      case "SHIPPING":
        return <Truck className="w-4 h-4" />;
      case "DELIVERY":
        return <Store className="w-4 h-4" />;
      case "RECALL":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Check className="w-4 h-4" />;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "MANUFACTURER":
        return <Factory className="w-4 h-4" />;
      case "PACKAGER":
        return <Package className="w-4 h-4" />;
      case "TRANSPORTER":
        return <Truck className="w-4 h-4" />;
      case "WHOLESALER":
        return <Warehouse className="w-4 h-4" />;
      case "RETAILER":
        return <Store className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isUserSigner = (
    signers: { address: string; role: string; name: string }[]
  ) => {
    return signers.some((signer) => signer.address === account);
  };

  const hasUserApproved = (
    approvals: { signer: string; timestamp: number; role: string }[]
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
            <h2 className="text-xl font-semibold text-white">
              Supply Chain Approvals
            </h2>
            <p className="text-gray-400">
              Multi-Party approvals for supply chain operations
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowNewProposal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Transfer</span>
        </button>
      </div>

      {/* Role Selection */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4">
        <h3 className="text-lg font-medium text-white mb-3">Your Role</h3>
        <div className="flex flex-wrap gap-2">
          {[
            "MANUFACTURER",
            "PACKAGER",
            "TRANSPORTER",
            "WHOLESALER",
            "RETAILER",
          ].map((role) => (
            <button
              key={role}
              onClick={() => setUserRole(role)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                userRole === role
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {getRoleIcon(role)}
              <span>{role}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Pending Transactions */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Clock className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-medium text-white">Pending Transfers</h3>
        </div>

        <div className="space-y-4">
          {pendingTransactions.map((tx) => (
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
                    {getOperationIcon(tx.operation)}
                  </div>
                  <div>
                    <div className="text-white font-medium">
                      {tx.operation} - {tx.productName}
                    </div>
                    <div className="text-gray-400 text-sm">
                      Product #{tx.productId} •{" "}
                      {tx.metadata?.batchNumber || "No batch"}
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
                  <span className="text-gray-400">From:</span>
                  <div className="text-white">
                    {userRoles[tx.fromParty as keyof typeof userRoles]?.name ||
                      formatAddress(tx.fromParty)}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {userRoles[tx.fromParty as keyof typeof userRoles]?.role ||
                      "Unknown"}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">To:</span>
                  <div className="text-white">
                    {userRoles[tx.toParty as keyof typeof userRoles]?.name ||
                      formatAddress(tx.toParty)}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {userRoles[tx.toParty as keyof typeof userRoles]?.role ||
                      "Unknown"}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">Location:</span>
                  <div className="text-white">
                    {tx.metadata?.location || "Not specified"}
                  </div>
                  {tx.metadata?.temperature && (
                    <div className="text-gray-400 text-xs">
                      Temp: {tx.metadata.temperature}°C, Humidity:{" "}
                      {tx.metadata.humidity}%
                    </div>
                  )}
                </div>
              </div>

              {/* Approval Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Approvals</span>
                  <span className="text-gray-400">
                    {tx.approvals.length}/{tx.signers.length} parties
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
                  <span className="text-gray-400 text-sm">Parties</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tx.signers.map((signer, index) => {
                    const hasApproved = tx.approvals.some(
                      (a) => a.signer === signer.address
                    );
                    return (
                      <div
                        key={index}
                        className={`px-2 py-1 rounded text-xs flex items-center space-x-1 ${
                          signer.address === account
                            ? hasApproved
                              ? "bg-green-500/20 text-green-400"
                              : "bg-blue-500/20 text-blue-400"
                            : hasApproved
                            ? "bg-green-500/20 text-green-400"
                            : "bg-gray-700 text-gray-300"
                        }`}
                      >
                        {hasApproved && <Check className="w-3 h-3" />}
                        <span>
                          {signer.name} ({signer.role})
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Approval Button */}
              {isUserSigner(tx.signers) && !hasUserApproved(tx.approvals) && (
                <button
                  onClick={() =>
                    handleApproveTransaction(tx.txHash, tx.productId)
                  }
                  disabled={
                    loading || tx.signatureCount >= tx.requiredSignatures
                  }
                  className="w-full px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? "Approving..." : "Approve Transfer"}
                </button>
              )}

              {hasUserApproved(tx.approvals) && (
                <div className="w-full px-4 py-2 bg-green-600/20 text-green-400 rounded-lg text-center">
                  You have approved this transfer
                </div>
              )}

              {!isUserSigner(tx.signers) && (
                <div className="w-full px-4 py-2 bg-gray-700 text-gray-400 rounded-lg text-center">
                  You are not involved in this transfer
                </div>
              )}
            </motion.div>
          ))}

          {pendingTransactions.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No pending transfers
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
                  New Product Transfer
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
                    Product ID
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
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={proposalData.productName}
                    onChange={(e) =>
                      setProposalData({
                        ...proposalData,
                        productName: e.target.value,
                      })
                    }
                    placeholder="Vaccine Batch A"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Operation Type
                  </label>
                  <select
                    value={proposalData.operation}
                    onChange={(e) =>
                      setProposalData({
                        ...proposalData,
                        operation: e.target.value as
                          | "TRANSFER"
                          | "PACKAGING"
                          | "SHIPPING"
                          | "DELIVERY"
                          | "RECALL",
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="TRANSFER">Transfer Custody</option>
                    <option value="PACKAGING">Packaging</option>
                    <option value="SHIPPING">Shipping</option>
                    <option value="DELIVERY">Delivery</option>
                    <option value="RECALL">Product Recall</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    To Party Address
                  </label>
                  <input
                    type="text"
                    value={proposalData.toParty}
                    onChange={(e) =>
                      setProposalData({
                        ...proposalData,
                        toParty: e.target.value,
                      })
                    }
                    placeholder="0x..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Batch Number
                  </label>
                  <input
                    type="text"
                    value={proposalData.batchNumber}
                    onChange={(e) =>
                      setProposalData({
                        ...proposalData,
                        batchNumber: e.target.value,
                      })
                    }
                    placeholder="BATCH-2023-001"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={proposalData.location}
                    onChange={(e) =>
                      setProposalData({
                        ...proposalData,
                        location: e.target.value,
                      })
                    }
                    placeholder="Distribution Center, Chicago"
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
                    loading || !proposalData.productId || !proposalData.toParty
                  }
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Transfer"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Add missing Factory component since it's not in lucide-react
const Factory: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
    />
  </svg>
);

export default SupplyChainMPCApprovals;
