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
} from "lucide-react";

// Define types
interface MintPolicy {
  trigger: string;
  mintType: string;
  approvalRequired: boolean;
  metadataStorage: string;
}

interface PendingMint {
  id: number;
  productId: number;
  productName: string;
  batchId: string;
  status: string;
  createdAt: string;
  approvers: string[];
  requiredApprovals: number;
  currentApprovals: number;
}

const MintProduct = () => {
  const { isActive } = useWeb3();
  const [mintPolicy, setMintPolicy] = useState<MintPolicy>({
    trigger: "manufacture",
    mintType: "batch",
    approvalRequired: true,
    metadataStorage: "ipfs",
  });
  const [pendingMints, setPendingMints] = useState<PendingMint[]>([
    {
      id: 1,
      productId: 101,
      productName: "Organic Coffee Beans",
      batchId: "BATCH-2023-001",
      status: "pending_approval",
      createdAt: "2023-12-01 10:30:00",
      approvers: ["0x742d...a3b8", "0x35Cc...5329"],
      requiredApprovals: 3,
      currentApprovals: 2,
    },
    {
      id: 2,
      productId: 102,
      productName: "Premium Chocolate",
      batchId: "BATCH-2023-002",
      status: "approved",
      createdAt: "2023-12-02 14:15:00",
      approvers: ["0x742d...a3b8", "0x35Cc...5329", "0xC053...25a3"],
      requiredApprovals: 3,
      currentApprovals: 3,
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
    value: string | boolean
  ) => {
    setMintPolicy({
      ...mintPolicy,
      [field]: value,
    });
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

  // Submit new mint request
  const submitMintRequest = () => {
    if (!newMintRequest.productId || !newMintRequest.productName) {
      alert("Please fill in required fields");
      return;
    }

    // In a real app, this would interact with the blockchain
    console.log("Submitting mint request:", newMintRequest);
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
    alert("Mint executed successfully!");

    // Update local state
    setPendingMints(
      pendingMints.map((mint) =>
        mint.id === id ? { ...mint, status: "minted" } : mint
      )
    );
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
      default:
        return (
          <Badge className="bg-gradient-to-r from-gray-300 to-gray-500 hover:from-gray-400 hover:to-gray-600">
            {status}
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
                    Batch
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
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {mint.batchId}
                      </div>
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
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {mint.createdAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
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
