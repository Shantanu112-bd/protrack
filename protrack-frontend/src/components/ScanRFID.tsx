import React, { useState } from "react";
import { useWeb3 } from "../contexts/web3ContextTypes";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  QrCode,
  Scan,
  Rss,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Camera,
  Wifi,
  Shield,
} from "lucide-react";

// Define types
interface ScannedProduct {
  id: number;
  productId: string;
  productName: string;
  batchId: string;
  rfidHash: string;
  status: string;
  owner: string;
  lastScan: string;
  location: string;
  verificationResult: string;
}

interface ScanEvent {
  id: number;
  timestamp: string;
  productId: string;
  scannerId: string;
  location: string;
  action: string;
  result: string;
}

const ScanRFID = () => {
  const { isActive } = useWeb3();
  const [scanMethod, setScanMethod] = useState("manual");
  const [manualInput, setManualInput] = useState("");
  const [scannedProducts] = useState<ScannedProduct[]>([
    {
      id: 1,
      productId: "PROD-101",
      productName: "Organic Coffee Beans",
      batchId: "BATCH-2023-001",
      rfidHash: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
      status: "verified",
      owner: "0x742d...a3b8",
      lastScan: "2023-12-01 14:30:00",
      location: "Warehouse A, New York",
      verificationResult: "authentic",
    },
    {
      id: 2,
      productId: "PROD-102",
      productName: "Premium Chocolate",
      batchId: "BATCH-2023-002",
      rfidHash: "0x35Cc6634C0532925a3b8D4C0532925a3b8D4742d",
      status: "verified",
      owner: "0x35Cc...5329",
      lastScan: "2023-12-02 09:15:00",
      location: "Store B, Los Angeles",
      verificationResult: "authentic",
    },
  ]);
  const [scanHistory, setScanHistory] = useState<ScanEvent[]>([
    {
      id: 1,
      timestamp: "2023-12-01 14:30:00",
      productId: "PROD-101",
      scannerId: "SCANNER-001",
      location: "Warehouse A, New York",
      action: "receive",
      result: "success",
    },
    {
      id: 2,
      timestamp: "2023-12-02 09:15:00",
      productId: "PROD-102",
      scannerId: "SCANNER-002",
      location: "Store B, Los Angeles",
      action: "quality_check",
      result: "success",
    },
  ]);

  // Handle manual scan
  const handleManualScan = () => {
    if (!manualInput.trim()) {
      alert("Please enter a product ID, RFID hash, or barcode");
      return;
    }

    // In a real app, this would interact with the blockchain and database
    console.log("Scanning product:", manualInput);
    alert(`Product scanned: ${manualInput}`);

    // Add to scan history
    const newScan: ScanEvent = {
      id: scanHistory.length + 1,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      productId: manualInput,
      scannerId: "MANUAL-INPUT",
      location: "Current Location",
      action: "manual_scan",
      result: "success",
    };

    setScanHistory([newScan, ...scanHistory]);
    setManualInput("");
  };

  // Simulate camera scan
  const simulateCameraScan = () => {
    // In a real app, this would access the device camera
    const simulatedCodes = [
      "RFID-HASH-001-ABC",
      "BARCODE-12345",
      "QR-CODE-XYZ-789",
    ];
    const randomCode =
      simulatedCodes[Math.floor(Math.random() * simulatedCodes.length)];

    console.log("Simulating camera scan:", randomCode);
    alert(`Scanned: ${randomCode}`);

    // Add to scan history
    const newScan: ScanEvent = {
      id: scanHistory.length + 1,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      productId: randomCode,
      scannerId: "CAMERA-001",
      location: "Current Location",
      action: "camera_scan",
      result: "success",
    };

    setScanHistory([newScan, ...scanHistory]);
  };

  // Simulate RFID reader
  const simulateRFIDReader = () => {
    // In a real app, this would connect to an RFID reader device
    const simulatedRFIDs = [
      "RFID-DEVICE-001",
      "RFID-DEVICE-002",
      "RFID-DEVICE-003",
    ];
    const randomRFID =
      simulatedRFIDs[Math.floor(Math.random() * simulatedRFIDs.length)];

    console.log("Simulating RFID read:", randomRFID);
    alert(`RFID detected: ${randomRFID}`);

    // Add to scan history
    const newScan: ScanEvent = {
      id: scanHistory.length + 1,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      productId: randomRFID,
      scannerId: "RFID-READER-001",
      location: "Current Location",
      action: "rfid_read",
      result: "success",
    };

    setScanHistory([newScan, ...scanHistory]);
  };

  // Get verification badge
  const getVerificationBadge = (result: string) => {
    switch (result) {
      case "authentic":
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Authentic
          </Badge>
        );
      case "tampered":
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600">
            <XCircle className="h-3 w-3 mr-1" />
            Tampered
          </Badge>
        );
      case "unknown":
        return (
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Unknown
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gradient-to-r from-gray-300 to-gray-500 hover:from-gray-400 hover:to-gray-600">
            {result}
          </Badge>
        );
    }
  };

  // Get action badge
  const getActionBadge = (action: string) => {
    switch (action) {
      case "receive":
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500">
            Receive
          </Badge>
        );
      case "quality_check":
        return (
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
            QA Check
          </Badge>
        );
      case "ship":
        return (
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
            Ship
          </Badge>
        );
      case "deliver":
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500">
            Deliver
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gradient-to-r from-gray-300 to-gray-500">
            {action}
          </Badge>
        );
    }
  };

  // Get result badge
  const getResultBadge = (result: string) => {
    switch (result) {
      case "success":
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Success
          </Badge>
        );
      case "failure":
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-rose-500">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gradient-to-r from-gray-300 to-gray-500">
            {result}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Scan Products
          </h1>
          <p className="text-gray-600 mt-2">
            Verify product authenticity and update supply chain status
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <select
            value={scanMethod}
            onChange={(e) => setScanMethod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="manual">Manual Entry</option>
            <option value="camera">Camera Scan</option>
            <option value="rfid">RFID Reader</option>
          </select>
        </div>
      </div>

      {/* Wallet connection warning */}
      {!isActive && (
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-4 text-center shadow-lg">
          <div className="flex items-center justify-center">
            <Scan className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800 font-medium">
              Wallet not connected - Connect for full verification features
            </span>
          </div>
        </div>
      )}

      {/* Scan Interface */}
      <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            {scanMethod === "manual" && (
              <>
                <QrCode className="h-5 w-5 mr-2 text-blue-500" />
                Manual Product Entry
              </>
            )}
            {scanMethod === "camera" && (
              <>
                <Camera className="h-5 w-5 mr-2 text-blue-500" />
                Camera Scanner
              </>
            )}
            {scanMethod === "rfid" && (
              <>
                <Rss className="h-5 w-5 mr-2 text-blue-500" />
                RFID Reader
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {scanMethod === "manual" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="manualInput" className="text-gray-700">
                  Enter Product ID, RFID Hash, or Barcode
                </Label>
                <div className="flex mt-1">
                  <Input
                    id="manualInput"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="e.g., PROD-123, 0x742d..., BARCODE-12345"
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleManualScan();
                    }}
                  />
                  <Button
                    onClick={handleManualScan}
                    className="ml-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Scan
                  </Button>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                <p>
                  Examples: PROD-123,
                  0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4, BARCODE-12345
                </p>
              </div>
            </div>
          )}

          {scanMethod === "camera" && (
            <div className="text-center py-8">
              <div className="mx-auto bg-gray-200 border-2 border-dashed rounded-xl w-64 h-64 flex items-center justify-center mb-4">
                <Camera className="h-16 w-16 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-4">
                Point your camera at a QR code or barcode to scan
              </p>
              <Button
                onClick={simulateCameraScan}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Camera className="h-5 w-5 mr-2" />
                Simulate Camera Scan
              </Button>
            </div>
          )}

          {scanMethod === "rfid" && (
            <div className="text-center py-8">
              <div className="mx-auto bg-gray-200 border-2 border-dashed rounded-xl w-64 h-64 flex items-center justify-center mb-4">
                <Rss className="h-16 w-16 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-4">
                Place RFID tag near reader to scan
              </p>
              <Button
                onClick={simulateRFIDReader}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Rss className="h-5 w-5 mr-2" />
                Simulate RFID Read
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recently Scanned Products */}
      <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <Shield className="h-5 w-5 mr-2 text-blue-500" />
            Recently Scanned Products
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
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Last Scan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Verification
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {scannedProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {product.productName}
                      </div>
                      <div className="text-sm text-gray-500">
                        #{product.productId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.batchId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500">
                        {product.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.owner}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.lastScan}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getVerificationBadge(product.verificationResult)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Scan History */}
      <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <Wifi className="h-5 w-5 mr-2 text-blue-500" />
            Scan History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Scanner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Result
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {scanHistory.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.timestamp}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {event.productId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.scannerId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getActionBadge(event.action)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getResultBadge(event.result)}
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

export default ScanRFID;
