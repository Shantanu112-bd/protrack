import React, { useState } from "react";
import { useWeb3 } from "../contexts/web3ContextTypes";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { getProTrackContract } from "../contracts/contractConfig";
import { getSigner } from "../contracts/contractConfig";

import { Badge } from "./ui/badge";
import {
  Package,
  QrCode,
  Shield,
  Key,
  AlertTriangle,
  CheckCircle,
  PlusCircle,
  Hash,
  Calendar,
  FileText,
  Zap,
  Globe,
  Download,
  RefreshCw,
} from "lucide-react";

const MintProduct = () => {
  const { isActive, account } = useWeb3();
  const [rfid, setRfid] = useState("");
  const [barcode, setBarcode] = useState("");
  const [productName, setProductName] = useState("");
  const [batchId, setBatchId] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [ipfsMetadata, setIpfsMetadata] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: string;
    message: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [userRole, setUserRole] = useState("admin"); // Add user role state

  const showNotification = (type: string, message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Refresh form
  const refreshForm = () => {
    // Reset form
    setRfid("");
    setBarcode("");
    setProductName("");
    setBatchId("");
    setExpiryDate("");
    setIpfsMetadata("");
    console.log("Refreshing form...");
  };

  // Export form data
  const exportFormData = () => {
    // In a real app, this would export form data to CSV/PDF
    console.log("Exporting form data...");
  };

  // Mint a new product
  const mintProduct = async () => {
    if (!isActive) {
      showNotification("error", "Please connect your wallet first");
      return;
    }

    if (
      !rfid ||
      !barcode ||
      !productName ||
      !batchId ||
      !expiryDate ||
      !ipfsMetadata
    ) {
      showNotification("error", "Please fill all fields");
      return;
    }

    setIsLoading(true);
    try {
      const signer = await getSigner();
      const contract = getProTrackContract(signer);

      const tx = await contract.mintProduct(
        rfid,
        barcode,
        productName,
        batchId,
        Math.floor(new Date(expiryDate).getTime() / 1000),
        ipfsMetadata,
        account
      );

      await tx.wait();

      showNotification("success", "Product minted successfully!");

      // Reset form
      setRfid("");
      setBarcode("");
      setProductName("");
      setBatchId("");
      setExpiryDate("");
      setIpfsMetadata("");
    } catch (error) {
      console.error("Error minting product:", error);
      showNotification("error", "Failed to mint product");
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user has permission to perform actions based on role
  const canPerformAction = (action: string) => {
    switch (userRole) {
      case "admin":
        return true;
      case "manufacturer":
        return ["create"].includes(action);
      case "transporter":
        return ["view"].includes(action);
      case "retailer":
        return ["view"].includes(action);
      case "consumer":
        return ["view"].includes(action);
      default:
        return false;
    }
  };

  // If user doesn't have permission to mint products, show restricted access message
  if (!canPerformAction("create")) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Mint New Product
            </h1>
            <p className="text-gray-600 mt-2">
              Create a new product NFT on the blockchain
            </p>
          </div>
        </div>

        <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800">
              <Shield className="h-5 w-5 mr-2 text-red-500" />
              Access Restricted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Shield className="h-16 w-16 text-red-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Insufficient Permissions
              </h3>
              <p className="text-gray-600 mb-4">
                Your current role ({userRole}) does not have permission to mint
                new products.
              </p>
              <p className="text-gray-500 text-sm">
                Contact an administrator to request access or switch to a
                manufacturer role.
              </p>
              <div className="mt-4">
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="admin">Admin</option>
                  <option value="manufacturer">Manufacturer</option>
                  <option value="transporter">Transporter</option>
                  <option value="retailer">Retailer</option>
                  <option value="consumer">Consumer</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Mint New Product
          </h1>
          <p className="text-gray-600 mt-2">
            Create a new product NFT on the blockchain
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <select
            value={userRole}
            onChange={(e) => setUserRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="admin">Admin</option>
            <option value="manufacturer">Manufacturer</option>
            <option value="transporter">Transporter</option>
            <option value="retailer">Retailer</option>
            <option value="consumer">Consumer</option>
          </select>
          <Button
            onClick={refreshForm}
            className="flex items-center bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={exportFormData}
            className="flex items-center bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Download className="h-5 w-5 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-2xl shadow-lg z-50 ${
            notification.type === "success"
              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
              : "bg-gradient-to-r from-red-500 to-rose-500 text-white"
          }`}
        >
          <div className="flex items-center">
            {notification.type === "success" ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <AlertTriangle className="h-5 w-5 mr-2" />
            )}
            {notification.message}
          </div>
        </div>
      )}

      {/* Wallet connection warning */}
      {!isActive && (
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-4 text-center shadow-lg">
          <div className="flex items-center justify-center">
            <Package className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800 font-medium">
              Wallet not connected - Connect to interact with blockchain
              features
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-800">
                <Package className="h-5 w-5 mr-2 text-blue-500" />
                Product Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Tabs */}
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  onClick={() => setActiveTab("basic")}
                  className={`py-2 px-4 font-medium text-sm ${
                    activeTab === "basic"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Basic Info
                </button>
                <button
                  onClick={() => setActiveTab("advanced")}
                  className={`py-2 px-4 font-medium text-sm ${
                    activeTab === "advanced"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Advanced
                </button>
              </div>

              {/* Basic Info Tab */}
              {activeTab === "basic" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="rfid" className="text-gray-700">
                        RFID Hash
                      </Label>
                      <div className="relative mt-1">
                        <Input
                          id="rfid"
                          type="text"
                          placeholder="Enter RFID hash"
                          value={rfid}
                          onChange={(e) => setRfid(e.target.value)}
                          className="pl-10"
                        />
                        <QrCode className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="barcode" className="text-gray-700">
                        Barcode
                      </Label>
                      <div className="relative mt-1">
                        <Input
                          id="barcode"
                          type="text"
                          placeholder="Enter barcode"
                          value={barcode}
                          onChange={(e) => setBarcode(e.target.value)}
                          className="pl-10"
                        />
                        <Hash className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="productName" className="text-gray-700">
                        Product Name
                      </Label>
                      <div className="relative mt-1">
                        <Input
                          id="productName"
                          type="text"
                          placeholder="Enter product name"
                          value={productName}
                          onChange={(e) => setProductName(e.target.value)}
                          className="pl-10"
                        />
                        <Package className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="batchId" className="text-gray-700">
                        Batch ID
                      </Label>
                      <div className="relative mt-1">
                        <Input
                          id="batchId"
                          type="text"
                          placeholder="Enter batch ID"
                          value={batchId}
                          onChange={(e) => setBatchId(e.target.value)}
                          className="pl-10"
                        />
                        <FileText className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="expiryDate" className="text-gray-700">
                        Expiry Date
                      </Label>
                      <div className="relative mt-1">
                        <Input
                          id="expiryDate"
                          type="date"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          className="pl-10"
                        />
                        <Calendar className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Advanced Tab */}
              {activeTab === "advanced" && (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="ipfsMetadata" className="text-gray-700">
                      IPFS Metadata CID
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="ipfsMetadata"
                        type="text"
                        placeholder="Enter IPFS CID for product metadata"
                        value={ipfsMetadata}
                        onChange={(e) => setIpfsMetadata(e.target.value)}
                        className="pl-10"
                      />
                      <Globe className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Link to detailed product information stored on IPFS
                    </p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <Shield className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
                      <div>
                        <h4 className="font-medium text-blue-800">
                          Zero-Knowledge Proof
                        </h4>
                        <p className="text-sm text-blue-700">
                          This product will be verified using zero-knowledge
                          proofs for enhanced privacy and security.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mt-8">
                <Button
                  onClick={refreshForm}
                  variant="outline"
                  className="flex items-center"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button
                  onClick={mintProduct}
                  disabled={isLoading || !isActive}
                  className="flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Zap className="h-4 w-4 mr-2 animate-spin" />
                      Minting...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Mint Product
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Information Section */}
        <div>
          <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-800">
                <Shield className="h-5 w-5 mr-2 text-green-500" />
                Blockchain Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      Immutable Record
                    </p>
                    <p className="text-sm text-gray-500">
                      Product data stored permanently on the blockchain
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100">
                      <Key className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      Zero-Knowledge Proof
                    </p>
                    <p className="text-sm text-gray-500">
                      Enhanced privacy with cryptographic verification
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100">
                      <Globe className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      Global Accessibility
                    </p>
                    <p className="text-sm text-gray-500">
                      Verify product authenticity from anywhere
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-medium text-blue-800 mb-2">
                  Current Account
                </h4>
                <p className="text-sm font-mono text-blue-700">
                  {account
                    ? `${account.substring(0, 6)}...${account.substring(
                        account.length - 4
                      )}`
                    : "Not connected"}
                </p>
                <Badge
                  className={`mt-2 ${
                    isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {isActive ? "Connected" : "Not Connected"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MintProduct;
