import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Check,
  X,
  Clock,
  Key,
  Wallet,
  UserPlus,
  AlertTriangle,
} from "lucide-react";
import { useEnhancedWeb3 } from "../contexts/EnhancedWeb3Context";
import { mpcService } from "../services/mpcService";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Alert, AlertDescription } from "./ui/alert";

interface MPCWallet {
  walletId: string;
  threshold: number;
  totalSigners: number;
  isActive: boolean;
  nonce: number;
  signers: string[];
}

interface PendingTransaction {
  txId: string;
  keyId: string;
  operationHash: string;
  initiator: string;
  timestamp: number;
  isExecuted: boolean;
  approvalCount: number;
  requiredSignatures: number;
  description?: string;
}

const MPCApprovalInterface: React.FC = () => {
  const { account, isConnected } = useEnhancedWeb3();
  const [userWallets, setUserWallets] = useState<MPCWallet[]>([]);
  const [pendingTransactions, setPendingTransactions] = useState<
    PendingTransaction[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateWallet, setShowCreateWallet] = useState(false);
  const [showAddSigner, setShowAddSigner] = useState(false);

  // Wallet creation form state
  const [walletData, setWalletData] = useState({
    signers: [""],
    threshold: 2,
    purpose: "Supply Chain Custody",
  });

  // Add signer form state
  const [signerData, setSignerData] = useState({
    walletId: "",
    signerAddress: "",
  });

  useEffect(() => {
    if (isConnected && account) {
      loadUserWallets();
      loadPendingTransactions();
    }
  }, [isConnected, account]);

  const loadUserWallets = async () => {
    try {
      // In a real implementation, we would fetch user's wallets from the service
      // For now, we'll use mock data
      const mockWallets: MPCWallet[] = [
        {
          walletId: "key_12345",
          threshold: 2,
          totalSigners: 3,
          isActive: true,
          nonce: 5,
          signers: ["0x1234...5678", "0x9876...5432", "0x5678...1234"],
        },
        {
          walletId: "key_67890",
          threshold: 3,
          totalSigners: 5,
          isActive: true,
          nonce: 2,
          signers: [
            "0x1234...5678",
            "0x1111...2222",
            "0x3333...4444",
            "0x5555...6666",
            "0x7777...8888",
          ],
        },
      ];
      setUserWallets(mockWallets);
      // Set initial state if needed
      // setSelectedWallet is not used in current implementation
    } catch (err) {
      setError("Failed to load wallets");
      console.error(err);
    }
  };

  const loadPendingTransactions = async () => {
    try {
      // In a real implementation, we would fetch pending transactions from the service
      // For now, we'll use mock data
      const mockTransactions: PendingTransaction[] = [
        {
          txId: "tx_abc123",
          keyId: "key_12345",
          operationHash: "0x7f8a...",
          initiator: "0x1234...5678",
          timestamp: Date.now() - 3600000,
          isExecuted: false,
          approvalCount: 1,
          requiredSignatures: 2,
          description: "Transfer custody of Product #1001 to Transporter",
        },
        {
          txId: "tx_def456",
          keyId: "key_67890",
          operationHash: "0x9b2c...",
          initiator: "0x1111...2222",
          timestamp: Date.now() - 1800000,
          isExecuted: false,
          approvalCount: 2,
          requiredSignatures: 3,
          description: "Approve packaging of Batch #B2023-001",
        },
      ];
      setPendingTransactions(mockTransactions);
    } catch (err) {
      setError("Failed to load transactions");
      console.error(err);
    }
  };

  const handleCreateWallet = async () => {
    if (walletData.signers.length < 2) {
      setError("At least 2 signers are required");
      return;
    }

    if (walletData.threshold > walletData.signers.length) {
      setError("Threshold cannot be greater than number of signers");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const walletId = await mpcService.createWallet(
        walletData.signers,
        walletData.threshold,
        walletData.purpose
      );

      // Add new wallet to the list
      const newWallet: MPCWallet = {
        walletId,
        threshold: walletData.threshold,
        totalSigners: walletData.signers.length,
        isActive: true,
        nonce: 0,
        signers: walletData.signers,
      };

      setUserWallets([...userWallets, newWallet]);
      // setSelectedWallet is not used in current implementation
      setShowCreateWallet(false);

      // Reset form
      setWalletData({
        signers: [""],
        threshold: 2,
        purpose: "Supply Chain Custody",
      });
    } catch (err) {
      setError("Failed to create wallet");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSigner = async () => {
    if (!signerData.walletId || !signerData.signerAddress) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const success = await mpcService.authorizeParty(
        signerData.walletId,
        signerData.signerAddress
      );

      if (success) {
        // Update local state
        setUserWallets(
          userWallets.map((wallet) =>
            wallet.walletId === signerData.walletId
              ? {
                  ...wallet,
                  signers: [...wallet.signers, signerData.signerAddress],
                }
              : wallet
          )
        );

        setShowAddSigner(false);
        setSignerData({ walletId: "", signerAddress: "" });
      } else {
        setError("Failed to add signer");
      }
    } catch (err) {
      setError("Failed to add signer");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveTransaction = async (txId: string) => {
    setLoading(true);
    try {
      await mpcService.approveTransaction(txId);

      // Update local state
      setPendingTransactions(
        pendingTransactions.map((tx) =>
          tx.txId === txId ? { ...tx, approvalCount: tx.approvalCount + 1 } : tx
        )
      );
    } catch (err) {
      setError("Failed to approve transaction");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Functionality placeholder for future implementation
  // const handleRevokeSigner = async (walletId: string, signerAddress: string) => {
  //   setLoading(true);
  //   try {
  //     const success = await mpcService.revokeParty(walletId, signerAddress);
  //
  //     if (success) {
  //       // Update local state
  //       setUserWallets(userWallets.map(wallet =>
  //         wallet.walletId === walletId
  //           ? { ...wallet, signers: wallet.signers.filter(s => s !== signerAddress) }
  //           : wallet
  //       ));
  //     } else {
  //       setError("Failed to revoke signer");
  //     }
  //   } catch (err) {
  //     setError("Failed to revoke signer");
  //     console.error(err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isUserSigner = (signers: string[]) => {
    return signers.some((signer) => signer === account);
  };

  const hasUserApproved = () => {
    // In a real implementation, we would check if the user has approved this transaction
    // For now, we'll return false to allow approval
    return false;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Shield className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              MPC Approval Interface
            </h1>
            <p className="text-gray-400">
              Multi-Party Computation wallet management and transaction
              approvals
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Dialog open={showCreateWallet} onOpenChange={setShowCreateWallet}>
            <DialogTrigger>
              <Button>
                <Wallet className="w-4 h-4 mr-2" />
                Create Wallet
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create MPC Wallet</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Purpose</Label>
                  <Input
                    value={walletData.purpose}
                    onChange={(e) =>
                      setWalletData({ ...walletData, purpose: e.target.value })
                    }
                    placeholder="Supply Chain Custody"
                  />
                </div>

                <div>
                  <Label>Threshold</Label>
                  <Input
                    type="number"
                    min="1"
                    max={walletData.signers.length || 10}
                    value={walletData.threshold}
                    onChange={(e) =>
                      setWalletData({
                        ...walletData,
                        threshold: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Signers</Label>
                  {walletData.signers.map((signer, index) => (
                    <div key={index} className="flex gap-2 mt-2">
                      <Input
                        value={signer}
                        onChange={(e) => {
                          const newSigners = [...walletData.signers];
                          newSigners[index] = e.target.value;
                          setWalletData({ ...walletData, signers: newSigners });
                        }}
                        placeholder={`Signer ${index + 1} address`}
                      />
                      {index > 0 && (
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => {
                            const newSigners = [...walletData.signers];
                            newSigners.splice(index, 1);
                            setWalletData({
                              ...walletData,
                              signers: newSigners,
                            });
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() =>
                      setWalletData({
                        ...walletData,
                        signers: [...walletData.signers, ""],
                      })
                    }
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Signer
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateWallet(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateWallet} disabled={loading}>
                    {loading ? "Creating..." : "Create Wallet"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showAddSigner} onOpenChange={setShowAddSigner}>
            <DialogTrigger>
              <Button variant="outline">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Signer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Signer to Wallet</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Wallet</Label>
                  <Select
                    value={signerData.walletId}
                    onValueChange={(value) =>
                      setSignerData({ ...signerData, walletId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select wallet" />
                    </SelectTrigger>
                    <SelectContent>
                      {userWallets.map((wallet) => (
                        <SelectItem
                          key={wallet.walletId}
                          value={wallet.walletId}
                        >
                          {wallet.walletId}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Signer Address</Label>
                  <Input
                    value={signerData.signerAddress}
                    onChange={(e) =>
                      setSignerData({
                        ...signerData,
                        signerAddress: e.target.value,
                      })
                    }
                    placeholder="0x..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddSigner(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddSigner} disabled={loading}>
                    {loading ? "Adding..." : "Add Signer"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Wallet Overview */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Key className="w-5 h-5 mr-2" />
            MPC Wallets
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userWallets.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No MPC wallets found. Create your first wallet to get started.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userWallets.map((wallet) => (
                <motion.div
                  key={wallet.walletId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-900/50 border border-gray-600 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-white">
                        {wallet.walletId}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        {wallet.signers.length} signers, {wallet.threshold}-of-
                        {wallet.signers.length} threshold
                      </div>
                    </div>
                    <Badge variant={wallet.isActive ? "default" : "secondary"}>
                      {wallet.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <div className="mt-3">
                    <div className="text-xs text-gray-400">Signers</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {wallet.signers.map((signer, index) => (
                        <div
                          key={index}
                          className={`px-2 py-1 rounded text-xs flex items-center ${
                            signer === account
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-gray-700 text-gray-300"
                          }`}
                        >
                          {formatAddress(signer)}
                          {signer === account && (
                            <span className="ml-1">⭐</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-700">
                    <div className="text-sm text-gray-400">
                      Nonce: {wallet.nonce}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSignerData({
                          walletId: wallet.walletId,
                          signerAddress: "",
                        });
                        setShowAddSigner(true);
                      }}
                    >
                      <UserPlus className="w-3 h-3 mr-1" />
                      Add Signer
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Transactions */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Pending Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No pending transactions
            </div>
          ) : (
            <div className="space-y-4">
              {pendingTransactions.map((tx) => (
                <motion.div
                  key={tx.txId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gray-900/50 border border-gray-600 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-white">
                        {tx.description || `Transaction ${tx.txId}`}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        Key: {tx.keyId} •{" "}
                        {new Date(tx.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <Badge variant={tx.isExecuted ? "default" : "secondary"}>
                      {tx.isExecuted ? "Executed" : "Pending"}
                    </Badge>
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Approvals</span>
                      <span className="text-gray-400">
                        {tx.approvalCount}/{tx.requiredSignatures}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${
                            (tx.approvalCount / tx.requiredSignatures) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-gray-400">
                      Initiator: {formatAddress(tx.initiator)}
                    </div>
                    {isUserSigner(
                      userWallets.find((w) => w.walletId === tx.keyId)
                        ?.signers || []
                    ) &&
                    !hasUserApproved() &&
                    !tx.isExecuted ? (
                      <Button
                        onClick={() => handleApproveTransaction(tx.txId)}
                        disabled={loading}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                    ) : (
                      <Button variant="outline" disabled>
                        {tx.isExecuted ? "Executed" : "Already Approved"}
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MPCApprovalInterface;
