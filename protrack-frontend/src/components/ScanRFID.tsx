import React, { useState, useEffect, useRef } from "react";
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
  X,
} from "lucide-react";
import { cameraService } from "../services/CameraService";

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
  // New fields for enhanced features
  qrCode: string;
  rfidPayload: string;
  productHash: string;
  isVerified: boolean;
  verificationTimestamp: string;
  quickActions: QuickAction[];
}

interface ScanEvent {
  id: number;
  timestamp: string;
  productId: string;
  scannerId: string;
  location: string;
  action: string;
  result: string;
  // New fields for enhanced features
  offline: boolean;
  synced: boolean;
  securityChallenge?: string;
  securityResponse?: string;
}

interface QuickAction {
  id: string;
  name: string;
  icon: string;
}

interface OfflineScan {
  id: string;
  timestamp: string;
  productId: string;
  scannerId: string;
  location: string;
  action: string;
  result: string;
  synced: boolean;
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
      // New fields
      qrCode: "QR-PROD-101",
      rfidPayload: "RFID-PAYLOAD-101",
      productHash: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
      isVerified: true,
      verificationTimestamp: "2023-12-01 14:30:00",
      quickActions: [
        { id: "receive", name: "Mark Received", icon: "📥" },
        { id: "qa", name: "Start QA", icon: "🔬" },
        { id: "note", name: "Add Note", icon: "📝" },
        { id: "dispute", name: "Open Dispute", icon: "⚠️" },
      ],
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
      // New fields
      qrCode: "QR-PROD-102",
      rfidPayload: "RFID-PAYLOAD-102",
      productHash: "0x35Cc6634C0532925a3b8D4C0532925a3b8D4742d",
      isVerified: true,
      verificationTimestamp: "2023-12-02 09:15:00",
      quickActions: [
        { id: "receive", name: "Mark Received", icon: "📥" },
        { id: "qa", name: "Start QA", icon: "🔬" },
        { id: "note", name: "Add Note", icon: "📝" },
        { id: "dispute", name: "Open Dispute", icon: "⚠️" },
      ],
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
      // New fields
      offline: false,
      synced: true,
    },
    {
      id: 2,
      timestamp: "2023-12-02 09:15:00",
      productId: "PROD-102",
      scannerId: "SCANNER-002",
      location: "Store B, Los Angeles",
      action: "quality_check",
      result: "success",
      // New fields
      offline: false,
      synced: true,
    },
  ]);
  const [offlineScans, setOfflineScans] = useState<OfflineScan[]>([
    {
      id: "offline-001",
      timestamp: "2023-12-01 10:30:00",
      productId: "PROD-103",
      scannerId: "SCANNER-001",
      location: "Warehouse A, New York",
      action: "receive",
      result: "success",
      synced: false,
    },
  ]);
  const [securityMode, setSecurityMode] = useState("standard"); // standard or enhanced

  // Camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

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
      // New fields
      offline: false,
      synced: true,
    };

    setScanHistory([newScan, ...scanHistory]);
    setManualInput("");
  };

  // Handle quick action
  const handleQuickAction = (actionId: string, productId: string) => {
    console.log(`Executing action ${actionId} for product ${productId}`);
    // In a real implementation, this would execute the specific action
    alert(`Executing action: ${actionId} for product: ${productId}`);
  };

  // Sync offline scans
  const syncOfflineScans = async () => {
    console.log("Syncing offline scans...");
    // In a real implementation, this would sync offline scans to the backend
    const updatedScans = offlineScans.map((scan) => ({
      ...scan,
      synced: true,
    }));
    setOfflineScans(updatedScans);
    alert(`Synced ${offlineScans.length} offline scans`);
  };

  // Toggle security mode
  const toggleSecurityMode = () => {
    setSecurityMode(securityMode === "standard" ? "enhanced" : "standard");
  };

  // Initialize camera
  const initCamera = async () => {
    if (!videoRef.current) return;

    try {
      await cameraService.initializeCamera(videoRef.current);
      setIsCameraActive(true);
    } catch (error) {
      console.error("Camera initialization failed:", error);
      alert(
        error instanceof Error ? error.message : "Failed to initialize camera"
      );
    }
  };

  // Stop camera
  const stopCamera = () => {
    cameraService.stopCamera();
    setIsCameraActive(false);
    setIsScanning(false);
  };

  // Handle camera scan
  const handleCameraScan = async () => {
    if (!isCameraActive || isScanning) return;

    setIsScanning(true);

    try {
      const result = await cameraService.scanForCode((decodedText) => {
        processScanResult(decodedText);
      });

      // If scan completed without callback (fallback)
      if (result) {
        processScanResult(result);
      }
    } catch (error) {
      console.error("Scan failed:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Scan failed. Please try again."
      );
    } finally {
      setIsScanning(false);
    }
  };

  // Process scan result
  const processScanResult = (scanResult: string) => {
    console.log("Scanned code:", scanResult);
    alert(`Scanned: ${scanResult}`);

    // Add to scan history
    const newScan: ScanEvent = {
      id: scanHistory.length + 1,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      productId: scanResult,
      scannerId: "CAMERA-001",
      location: "Current Location",
      action: "camera_scan",
      result: "success",
      // New fields
      offline: false,
      synced: true,
    };

    setScanHistory([newScan, ...scanHistory]);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isCameraActive) {
        cameraService.stopCamera();
      }
    };
  }, [isCameraActive]);

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
      // New fields
      offline: false,
      synced: true,
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
          <Button
            onClick={toggleSecurityMode}
            variant="outline"
            className="flex items-center"
          >
            <Shield className="h-4 w-4 mr-2" />
            {securityMode === "standard" ? "Enhanced Mode" : "Standard Mode"}
          </Button>
          <Button
            onClick={syncOfflineScans}
            variant="outline"
            className="flex items-center"
            disabled={offlineScans.filter((scan) => !scan.synced).length === 0}
          >
            <Wifi className="h-4 w-4 mr-2" />
            Sync Offline ({offlineScans.filter((scan) => !scan.synced).length})
          </Button>
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
                <p className="mt-2">
                  Security Mode:{" "}
                  {securityMode === "standard" ? "Standard" : "Enhanced"}
                </p>
              </div>
            </div>
          )}

          {scanMethod === "camera" && (
            <div className="text-center py-8">
              <div className="mx-auto bg-gray-900 border-2 border-dashed rounded-xl w-full max-w-lg h-96 flex items-center justify-center mb-4 overflow-hidden relative">
                {!isCameraActive ? (
                  <div className="text-center text-gray-300">
                    <Camera className="h-16 w-16 mx-auto mb-4" />
                    <p className="mb-4">Camera is not active</p>
                    <Button
                      onClick={initCamera}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Camera className="h-5 w-5 mr-2" />
                      Start Camera
                    </Button>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                    />
                    {isScanning && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                          <p className="text-white">Scanning...</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
              <p className="text-gray-600 mb-4">
                Point your camera at a QR code or barcode to scan
              </p>
              <div className="flex justify-center gap-4">
                {isCameraActive && (
                  <>
                    <Button
                      onClick={handleCameraScan}
                      disabled={isScanning}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Camera className="h-5 w-5 mr-2" />
                      {isScanning ? "Scanning..." : "Scan Code"}
                    </Button>
                    <Button
                      onClick={stopCamera}
                      variant="outline"
                      className="flex items-center"
                    >
                      <X className="h-5 w-5 mr-2" />
                      Stop Camera
                    </Button>
                  </>
                )}
              </div>
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
                    Batch/Hash
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {product.batchId}
                      </div>
                      <div className="text-xs text-gray-400 font-mono truncate">
                        {product.productHash.substring(0, 10)}...
                      </div>
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {product.quickActions.map((action) => (
                          <Button
                            key={action.id}
                            onClick={() =>
                              handleQuickAction(action.id, product.productId)
                            }
                            variant="outline"
                            size="sm"
                            className="text-xs p-1 h-6"
                          >
                            <span className="mr-1">{action.icon}</span>
                            {action.name}
                          </Button>
                        ))}
                      </div>
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
