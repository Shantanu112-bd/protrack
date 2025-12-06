import React, { useState } from "react";
import { useWeb3 } from "../contexts/web3ContextTypes";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import {
  QrCode,
  Package,
  MapPin,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Search,
  Scan,
  Shield,
  BarChart3,
  Download,
  RefreshCw,
} from "lucide-react";
import { getProTrackContract, getProvider } from "../contracts/contractConfig";

// Define types
interface ProductInfo {
  id: number;
  rfid: string;
  barcode: string;
  name: string;
  batch: string;
  status: string;
  owner: string;
  location: string;
  lastUpdate: string;
  expiryDate: string;
  manufacturer: string;
}

const ScanRFID = () => {
  const { isActive } = useWeb3();
  const [rfidInput, setRfidInput] = useState("");
  const [scannedProduct, setScannedProduct] = useState<ProductInfo | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useState<ProductInfo[]>([]);
  const [userRole, setUserRole] = useState("admin"); // Add user role state

  // Scan RFID
  const scanRFID = async () => {
    if (!rfidInput) {
      setError("Please enter an RFID or barcode");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get provider and contract instance
      const provider = getProvider();
      const contract = getProTrackContract(provider);

      // First, try to get token ID by RFID
      let tokenId = await contract.rfidToTokenId(rfidInput);

      // If not found by RFID, try by barcode
      if (tokenId.toString() === "0") {
        tokenId = await contract.barcodeToTokenId(rfidInput);
      }

      // If still not found, show error
      if (tokenId.toString() === "0") {
        setError("Product not found with this RFID or barcode");
        return;
      }

      // Get product data
      const productData = await contract.getProduct(tokenId);

      // Convert contract data to UI format
      const product: ProductInfo = {
        id: Number(tokenId),
        rfid: productData.rfidHash,
        barcode: productData.barcode,
        name: productData.productName,
        batch: productData.batchId,
        status: getProductStatusString(productData.status),
        owner: productData.currentCustodian,
        location: productData.currentLocation,
        lastUpdate: new Date(
          Number(productData.lastUpdated) * 1000
        ).toLocaleString(),
        expiryDate: new Date(
          Number(productData.expiryDate) * 1000
        ).toLocaleDateString(),
        manufacturer: productData.manufacturer,
      };

      setScannedProduct(product);
      // Add to scan history
      setScanHistory((prev) => [product, ...prev.slice(0, 4)]);
    } catch (err) {
      console.error("Error scanning RFID:", err);
      setError(
        "Failed to scan RFID: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Convert product status enum to string
  const getProductStatusString = (status: number): string => {
    switch (status) {
      case 0:
        return "Manufactured";
      case 1:
        return "Packaged";
      case 2:
        return "In Transit";
      case 3:
        return "Received";
      case 4:
        return "Sold";
      case 5:
        return "Recalled";
      default:
        return "Unknown";
    }
  };

  // Format status badge
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "manufactured":
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
            Manufactured
          </Badge>
        );
      case "packaged":
        return (
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
            Packaged
          </Badge>
        );
      case "in transit":
        return (
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
            In Transit
          </Badge>
        );
      case "received":
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
            Received
          </Badge>
        );
      case "sold":
        return (
          <Badge className="bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800">
            Sold
          </Badge>
        );
      case "recalled":
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600">
            Recalled
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

  // Refresh scanner
  const refreshScanner = () => {
    // Clear input and reset state
    setRfidInput("");
    setScannedProduct(null);
    setError(null);
    console.log("Refreshing scanner...");
  };

  // Export scan data
  const exportScanData = () => {
    // In a real app, this would export scan data to CSV/PDF
    console.log("Exporting scan data...");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Scan RFID
          </h1>
          <p className="text-gray-600 mt-2">
            Verify product authenticity using RFID or barcode
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
            onClick={refreshScanner}
            className="flex items-center bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={exportScanData}
            className="flex items-center bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Download className="h-5 w-5 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Wallet connection warning */}
      {!isActive && (
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-4 text-center shadow-lg">
          <div className="flex items-center justify-center">
            <Scan className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800 font-medium">
              Wallet not connected - Connect to interact with blockchain
              features
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scanner Section */}
        <div className="lg:col-span-2">
          <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-800">
                <Scan className="h-5 w-5 mr-2 text-blue-500" />
                Product Scanner
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="rfidInput" className="text-gray-700">
                    RFID or Barcode
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="rfidInput"
                      type="text"
                      placeholder="Enter RFID hash or barcode"
                      value={rfidInput}
                      onChange={(e) => setRfidInput(e.target.value)}
                      className="pl-10"
                      onKeyPress={(e) => e.key === "Enter" && scanRFID()}
                    />
                    <QrCode className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={scanRFID}
                    disabled={isLoading || !rfidInput}
                    className="flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Scan Product
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={refreshScanner}
                    variant="outline"
                    className="flex items-center"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                      <span className="text-red-700">{error}</span>
                    </div>
                  </div>
                )}

                {scannedProduct && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          {scannedProduct.name}
                        </h3>
                        <p className="text-gray-600 mt-1">
                          Batch: {scannedProduct.batch}
                        </p>
                      </div>
                      <Badge
                        className={`${
                          scannedProduct.status.toLowerCase() === "recalled"
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {scannedProduct.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="bg-white p-4 rounded-xl border border-gray-200">
                        <div className="flex items-center text-gray-500 mb-2">
                          <Package className="h-4 w-4 mr-2" />
                          <span className="text-sm font-medium">
                            Product ID
                          </span>
                        </div>
                        <p className="font-mono text-gray-900">
                          #{scannedProduct.id}
                        </p>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-gray-200">
                        <div className="flex items-center text-gray-500 mb-2">
                          <QrCode className="h-4 w-4 mr-2" />
                          <span className="text-sm font-medium">RFID</span>
                        </div>
                        <p className="font-mono text-gray-900 text-sm">
                          {scannedProduct.rfid}
                        </p>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-gray-200">
                        <div className="flex items-center text-gray-500 mb-2">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span className="text-sm font-medium">Location</span>
                        </div>
                        <p className="text-gray-900">
                          {scannedProduct.location}
                        </p>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-gray-200">
                        <div className="flex items-center text-gray-500 mb-2">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span className="text-sm font-medium">
                            Expiry Date
                          </span>
                        </div>
                        <p className="text-gray-900">
                          {scannedProduct.expiryDate}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Blockchain Verification
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                          <div className="flex items-center text-gray-500 mb-2">
                            <Shield className="h-4 w-4 mr-2" />
                            <span className="text-sm font-medium">Status</span>
                          </div>
                          <div className="flex items-center">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                            <span className="text-green-700 font-medium">
                              Verified
                            </span>
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                          <div className="flex items-center text-gray-500 mb-2">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            <span className="text-sm font-medium">
                              Last Update
                            </span>
                          </div>
                          <p className="text-gray-900">
                            {scannedProduct.lastUpdate}
                          </p>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                          <div className="flex items-center text-gray-500 mb-2">
                            <Package className="h-4 w-4 mr-2" />
                            <span className="text-sm font-medium">Owner</span>
                          </div>
                          <p className="font-mono text-gray-900 text-sm">
                            {scannedProduct.owner.substring(0, 6)}...
                            {scannedProduct.owner.substring(
                              scannedProduct.owner.length - 4
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scan History */}
        <div>
          <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-800">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
                Recent Scans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scanHistory.length > 0 ? (
                  scanHistory.map((product) => (
                    <div
                      key={product.id}
                      className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => {
                        setScannedProduct(product);
                        setRfidInput(
                          product.rfid ||
                            product.barcode ||
                            product.id.toString()
                        );
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {product.name}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            {product.batch}
                          </p>
                        </div>
                        {getStatusBadge(product.status)}
                      </div>
                      <div className="mt-3 flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {product.lastUpdate}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Scan className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p>No scan history yet</p>
                    <p className="text-sm mt-1">
                      Scan a product to see it here
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ScanRFID;
