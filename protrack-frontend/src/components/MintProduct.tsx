import React, { useState } from "react";
import { useWeb3 } from "../contexts/web3ContextTypes";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Coins,
  FileText,
  Clock,
  CheckCircle,
  Users,
  Upload,
  Server,
  Zap,
  Link,
  Hash,
} from "lucide-react";

// Define types
interface MintPolicy {
  trigger: string;
  mintType: string;
  approvalRequired: boolean;
  metadataStorage: string;
  batchSize?: number;
  gasOptimization: boolean;
}

interface PendingMint {
  id: number;
  productId: number;
  productName: string;
  batchId: string;
  productHash: string;
  status: string;
  createdAt: string;
  approvers: string[];
  requiredApprovals: number;
  currentApprovals: number;
  tokenId?: number;
  metadataURI?: string;
  mintType: "batch" | "unit" | "sbt";
  linkedUnitTokens?: number[];
  onChainEventId?: string;
}

const MintProduct = () => {
  const { isActive } = useWeb3();
  const [mintPolicy, setMintPolicy] = useState<MintPolicy>({
    trigger: "manufacture",
    mintType: "batch",
    approvalRequired: true,
    metadataStorage: "ipfs",
    gasOptimization: true,
  });
  const [pendingMints, setPendingMints] = useState<PendingMint[]>([
    {
      id: 1,
      productId: 101,
      productName: "Organic Coffee Beans",
      batchId: "BATCH-2023-001",
      productHash: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
      status: "pending_approval",
      createdAt: "2023-12-01 10:30:00",
      approvers: ["0x742d...a3b8", "0x35Cc...5329"],
      requiredApprovals: 3,
      currentApprovals: 2,
      mintType: "batch",
      metadataURI: "ipfs://QmExample123456789",
    },
    {
      id: 2,
      productId: 102,
      productName: "Premium Chocolate",
      batchId: "BATCH-2023-002",
      productHash: "0x35Cc6634C0532925a3b8D4C0532925a3b8D4742d",
      status: "approved",
      createdAt: "2023-12-02 14:15:00",
      approvers: ["0x742d...a3b8", "0x35Cc...5329", "0xC053...25a3"],
      requiredApprovals: 3,
      currentApprovals: 3,
      mintType: "unit",
      metadataURI: "ipfs://QmExample987654321",
      tokenId: 1001,
    },
  ]);
  const [showMintForm, setShowMintForm] = useState(false);
  const [newMintRequest, setNewMintRequest] = useState({
    productId: "",
    productName: "",
    batchId: "",
    mintType: "batch",
    metadataURI: "",
  });

  // Handle policy change
  const handlePolicyChange = (
    field: keyof MintPolicy,
    value: string | boolean | number
  ) => {
    setMintPolicy({
      ...mintPolicy,
      [field]: value,
    });
  };

  // Handle batch size change
  const handleBatchSizeChange = (value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0) {
      handlePolicyChange("batchSize", numValue);
    } else {
      handlePolicyChange("batchSize", undefined);
    }
  };

  // Handle new mint request change
  const handleMintRequestChange = (
    field: keyof typeof newMintRequest,
    value: string
  ) => {
    setNewMintRequest({
      ...newMintRequest,
      [field]: value,
    });
  };

  // Generate product hash
  const generateProductHash = (
    manufacturerId: string,
    serial: string,
    timestamp: string,
    batchId: string
  ) => {
    // In a real app, this would use a cryptographic hash function
    return `0x${manufacturerId.slice(0, 8)}${serial.slice(0, 8)}${timestamp
      .replace(/[^0-9]/g, "")
      .slice(0, 8)}${batchId.slice(0, 8)}`;
  };

  // Generate metadata URI
  const generateMetadataURI = (storageType: string, productId: string) => {
    // In a real app, this would upload metadata to the selected storage
    switch (storageType) {
      case "ipfs":
        return `ipfs://Qm${productId}Metadata123456789`;
      case "supabase":
        return `https://supabase.example.com/storage/v1/object/public/metadata/${productId}.json`;
      case "arweave":
        return `https://arweave.net/${productId}-metadata-123456789`;
      default:
        return `ipfs://Qm${productId}Metadata123456789`;
    }
  };

  // Submit new mint request
  const submitMintRequest = () => {
    if (!newMintRequest.productId || !newMintRequest.productName) {
      alert("Please fill in required fields");
      return;
    }

    // Generate product hash and metadata URI
    const timestamp = new Date().toISOString();
    const productHash = generateProductHash(
      "MANUFACTURER-001",
      newMintRequest.productId,
      timestamp,
      newMintRequest.batchId
    );

    const metadataURI = generateMetadataURI(
      mintPolicy.metadataStorage,
      newMintRequest.productId
    );

    // In a real app, this would interact with the blockchain
    console.log("Submitting mint request:", newMintRequest);

    // Add to pending mints
    const newMint: PendingMint = {
      id: pendingMints.length + 1,
      productId: parseInt(newMintRequest.productId, 10),
      productName: newMintRequest.productName,
      batchId: newMintRequest.batchId,
      productHash: productHash,
      status: mintPolicy.approvalRequired ? "pending_approval" : "approved",
      createdAt: timestamp.replace("T", " ").substring(0, 19),
      approvers: [],
      requiredApprovals: mintPolicy.approvalRequired ? 3 : 0,
      currentApprovals: 0,
      mintType: newMintRequest.mintType as "batch" | "unit" | "sbt",
      metadataURI: metadataURI,
    };

    setPendingMints([newMint, ...pendingMints]);
    alert("Mint request submitted successfully!");

    // Reset form
    setNewMintRequest({
      productId: "",
      productName: "",
      batchId: "",
      mintType: "batch",
      metadataURI: "",
    });
    setShowMintForm(false);
  };

  // Approve mint request
  const approveMint = (id: number) => {
    // In a real app, this would interact with the blockchain
    console.log("Approving mint request:", id);
    alert("Mint request approved!");

    // Update local state
    setPendingMints(
      pendingMints.map((mint) =>
        mint.id === id
          ? {
              ...mint,
              currentApprovals: mint.currentApprovals + 1,
              approvers: [...mint.approvers, "0xSigner...1234"],
              status:
                mint.currentApprovals + 1 >= mint.requiredApprovals
                  ? "approved"
                  : mint.status,
            }
          : mint
      )
    );
  };

  // Execute mint
  const executeMint = (id: number) => {
    // In a real app, this would interact with the blockchain
    console.log("Executing mint for request:", id);

    // Simulate generating a token ID
    const tokenId = Math.floor(1000 + Math.random() * 9000);

    alert(`Mint executed successfully! Token ID: ${tokenId}`);

    // Update local state
    setPendingMints(
      pendingMints.map((mint) =>
        mint.id === id
          ? {
              ...mint,
              status: "minted",
              tokenId: tokenId,
              onChainEventId: `evt_${Date.now()}`,
            }
          : mint
      )
    );
  };

  // Batch mint units
  const batchMintUnits = (batchId: number) => {
    console.log("Batch minting units for batch:", batchId);
    alert(`Batch minting initiated for batch ${batchId}!`);

    // In a real implementation, this would:
    // 1. Fetch all unit products linked to this batch
    // 2. Generate SBTs for each unit
    // 3. Link them to the batch NFT
    // 4. Execute as a single transaction for gas optimization
  };

  // View on chain event
  const viewOnChainEvent = (eventId: string) => {
    console.log("Viewing on-chain event:", eventId);
    alert(`Viewing event: ${eventId} on blockchain explorer`);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_approval":
        return (
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
            <Clock className="h-3 w-3 mr-1" />
            Pending Approval
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case "minted":
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
            <Coins className="h-3 w-3 mr-1" />
            Minted
          </Badge>
        );
      case "queued":
        return (
          <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600">
            <Server className="h-3 w-3 mr-1" />
            Queued
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gradient-to-r from-gray-300 to-gray-500 hover:from-gray-400 hover:to-gray-600">
            {status}
          </Badge>
        );
    }
  };

  // Get mint type badge
  const getMintTypeBadge = (type: string) => {
    switch (type) {
      case "batch":
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500">
            <Link className="h-3 w-3 mr-1" />
            Batch NFT
          </Badge>
        );
      case "unit":
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500">
            <Hash className="h-3 w-3 mr-1" />
            Unit NFT
          </Badge>
        );
      case "sbt":
        return (
          <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500">
            <Zap className="h-3 w-3 mr-1" />
            SBT
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gradient-to-r from-gray-300 to-gray-500">
            {type}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Mint Products
          </h1>
          <p className="text-gray-600 mt-2">
            Create NFTs/SBTs for your supply chain products
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button
            onClick={() => setShowMintForm(!showMintForm)}
            className="flex items-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Coins className="h-5 w-5 mr-2" />
            {showMintForm ? "Cancel" : "New Mint Request"}
          </Button>
        </div>
      </div>

      {/* Wallet connection warning */}
      {!isActive && (
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-4 text-center shadow-lg">
          <div className="flex items-center justify-center">
            <Coins className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800 font-medium">
              Wallet not connected - Connect to mint products on blockchain
            </span>
          </div>
        </div>
      )}

      {/* Mint Policy Configuration */}
      <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <FileText className="h-5 w-5 mr-2 text-blue-500" />
            Minting Policy Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-gray-700">Trigger Event</Label>
              <select
                value={mintPolicy.trigger}
                onChange={(e) => handlePolicyChange("trigger", e.target.value)}
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="manufacture">On Manufacturing</option>
                <option value="qa_pass">On QA Pass</option>
                <option value="packaging">On Packaging</option>
                <option value="manual">Manual Trigger</option>
              </select>
            </div>
            <div>
              <Label className="text-gray-700">Mint Type</Label>
              <select
                value={mintPolicy.mintType}
                onChange={(e) => handlePolicyChange("mintType", e.target.value)}
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="batch">Batch NFT</option>
                <option value="unit">Unit NFT</option>
                <option value="sbt">SBT (Soulbound)</option>
              </select>
            </div>
            <div>
              <Label className="text-gray-700">
                Batch Size (for batch minting)
              </Label>
              <Input
                type="number"
                min="1"
                value={mintPolicy.batchSize || ""}
                onChange={(e) => handleBatchSizeChange(e.target.value)}
                placeholder="Enter batch size"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-gray-700">Approval Required</Label>
              <div className="flex items-center mt-1">
                <input
                  type="checkbox"
                  checked={mintPolicy.approvalRequired}
                  onChange={(e) =>
                    handlePolicyChange("approvalRequired", e.target.checked)
                  }
                  className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">
                  Require MPC multisig approval
                </span>
              </div>
            </div>
            <div>
              <Label className="text-gray-700">Gas Optimization</Label>
              <div className="flex items-center mt-1">
                <input
                  type="checkbox"
                  checked={mintPolicy.gasOptimization}
                  onChange={(e) =>
                    handlePolicyChange("gasOptimization", e.target.checked)
                  }
                  className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">
                  Enable batching for gas savings
                </span>
              </div>
            </div>
            <div>
              <Label className="text-gray-700">Metadata Storage</Label>
              <select
                value={mintPolicy.metadataStorage}
                onChange={(e) =>
                  handlePolicyChange("metadataStorage", e.target.value)
                }
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ipfs">IPFS</option>
                <option value="supabase">Supabase Storage</option>
                <option value="arweave">Arweave</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* New Mint Request Form */}
      {showMintForm && (
        <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800">
              <Upload className="h-5 w-5 mr-2 text-blue-500" />
              New Mint Request
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="productId" className="text-gray-700">
                  Product ID *
                </Label>
                <Input
                  id="productId"
                  value={newMintRequest.productId}
                  onChange={(e) =>
                    handleMintRequestChange("productId", e.target.value)
                  }
                  placeholder="Enter product ID"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="productName" className="text-gray-700">
                  Product Name *
                </Label>
                <Input
                  id="productName"
                  value={newMintRequest.productName}
                  onChange={(e) =>
                    handleMintRequestChange("productName", e.target.value)
                  }
                  placeholder="Enter product name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="batchId" className="text-gray-700">
                  Batch ID
                </Label>
                <Input
                  id="batchId"
                  value={newMintRequest.batchId}
                  onChange={(e) =>
                    handleMintRequestChange("batchId", e.target.value)
                  }
                  placeholder="Enter batch ID"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="mintType" className="text-gray-700">
                  Mint Type
                </Label>
                <select
                  id="mintType"
                  value={newMintRequest.mintType}
                  onChange={(e) =>
                    handleMintRequestChange("mintType", e.target.value)
                  }
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="batch">Batch NFT</option>
                  <option value="unit">Unit NFT</option>
                  <option value="sbt">SBT (Soulbound)</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="metadataURI" className="text-gray-700">
                  Metadata URI
                </Label>
                <Textarea
                  id="metadataURI"
                  value={newMintRequest.metadataURI}
                  onChange={(e) =>
                    handleMintRequestChange("metadataURI", e.target.value)
                  }
                  placeholder="Enter metadata URI (IPFS hash, Supabase URL, etc.)"
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="mt-6">
              <Button
                onClick={submitMintRequest}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3"
              >
                Submit Mint Request
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Mint Requests */}
      <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <Clock className="h-5 w-5 mr-2 text-blue-500" />
            Pending Mint Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Batch/Hash
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Approvals
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingMints.map((mint) => (
                  <tr key={mint.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{mint.productId} {mint.productName}
                      </div>
                      {mint.tokenId && (
                        <div className="text-xs text-gray-500">
                          Token ID: {mint.tokenId}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {mint.batchId || "N/A"}
                      </div>
                      <div className="text-xs text-gray-400 font-mono truncate">
                        {mint.productHash.substring(0, 10)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getMintTypeBadge(mint.mintType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(mint.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-gray-500 mr-1" />
                        <span className="text-sm text-gray-900">
                          {mint.currentApprovals}/{mint.requiredApprovals}
                        </span>
                      </div>
                      {mint.approvers.length > 0 && (
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                          {mint.approvers.join(", ")}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {mint.createdAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col space-y-2">
                        {mint.status === "pending_approval" && (
                          <Button
                            onClick={() => approveMint(mint.id)}
                            size="sm"
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                          >
                            Approve
                          </Button>
                        )}
                        {mint.status === "approved" && (
                          <Button
                            onClick={() => executeMint(mint.id)}
                            size="sm"
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                          >
                            Mint
                          </Button>
                        )}
                        {mint.status === "minted" &&
                          mint.mintType === "batch" && (
                            <Button
                              onClick={() => batchMintUnits(mint.id)}
                              size="sm"
                              className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
                            >
                              <Zap className="h-3 w-3 mr-1" />
                              Batch Units
                            </Button>
                          )}
                        {mint.onChainEventId && (
                          <Button
                            onClick={() =>
                              viewOnChainEvent(mint.onChainEventId!)
                            }
                            variant="outline"
                            size="sm"
                            className="text-xs"
                          >
                            View Event
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MintProduct;
