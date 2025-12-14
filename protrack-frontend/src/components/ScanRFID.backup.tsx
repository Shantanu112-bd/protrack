import React, { useState, useEffect } from "react";
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
  Camera,
  Wifi,
  Battery,
  Zap,
  WifiOff,
  BatteryCharging,
  BatteryFull,
  BatteryMedium,
  BatteryLow,
  Signal,
  SignalLow,
  SignalMedium,
  SignalHigh,
  Eye,
  EyeOff,
  Edit,
  Plus,
  Save,
  Trash2,
  Copy,
  Share2,
  Check,
  X,
  Info,
  Upload,
  HardDrive,
  Cloud,
  Navigation,
  Map,
  ZapOff,
  Activity,
  Pause,
  Play,
  SkipForward,
  SkipBack,
  RotateCcw,
  RotateCw,
  Repeat,
  Shuffle,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Phone,
  MessageSquare,
  Mail,
  Bell,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  Flag,
  Award,
  Gift,
  ShoppingBag,
  ShoppingCart,
  CreditCard,
  DollarSign,
  Percent,
  PieChart,
  BarChart,
  LineChart,
  AreaChart,
  ScatterChart,
  CandlestickChart,
  Network,
  Cpu,
  HardDrive as HardDriveIcon,
  Database,
  Database as DatabaseIcon,
  Server,
  Server as ServerIcon,
  Cloud as CloudIcon,
  Wifi as WifiIcon,
  Battery as BatteryIcon,
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Moon,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
  CloudOff,
  Cloudy,
  Tornado,
  Umbrella,
  Sunset,
  Sunrise,
  Compass,
  Map as MapIcon,
  Navigation2,
  Locate,
  NavigationOff,
  Crosshair,
  Target,
  Move,
  Move3D,
  Rotate3D,
  FlipHorizontal,
  FlipVertical,
  Crop,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Octagon,
  Pentagon,
  Star as StarIcon,
  Heart as HeartIcon,
  Smile,
  Frown,
  Meh,
  Laugh,
  Angry,
  Annoyed,
  Zap as ZapIcon,
  ZapOff as ZapOffIcon,
  WifiOff as WifiOffIcon,
  Volume,
  Volume1,
  Volume2 as Volume2Icon,
  VolumeX as VolumeXIcon,
  Play as PlayIcon,
  Pause as PauseIcon,
  Rewind,
  FastForward,
  SkipBack as SkipBackIcon,
  SkipForward as SkipForwardIcon,
  Shuffle as ShuffleIcon,
  Repeat as RepeatIcon,
  Repeat1,
  Speaker,
  Headphones,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Camera as CameraIcon,
  Video,
  Film,
  Image,
  Music,
  Disc,
  Radio,
  Tv,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Computer,
  Server as Server2,
  HardDrive as HardDrive2,
  Database as Database2,
  CloudOff as CloudOffIcon,
  CloudRain as CloudRainIcon,
  CloudSnow as CloudSnowIcon,
  CloudLightning as CloudLightningIcon,
  CloudDrizzle as CloudDrizzleIcon,
  Cloudy as CloudyIcon,
  Tornado as TornadoIcon,
  Umbrella as UmbrellaIcon,
  Sunset as SunsetIcon,
  Sunrise as SunriseIcon,
  Compass as CompassIcon,
  MapPin as MapPinIcon,
  Navigation as NavigationIcon,
  Locate as LocateIcon,
  NavigationOff as NavigationOffIcon,
  Crosshair as CrosshairIcon,
  Target as TargetIcon,
  Move as MoveIcon,
  Move3D as Move3DIcon,
  Rotate3D as Rotate3DIcon,
  FlipHorizontal as FlipHorizontalIcon,
  FlipVertical as FlipVerticalIcon,
  Crop as CropIcon,
  Square as SquareIcon,
  Circle as CircleIcon,
  Triangle as TriangleIcon,
  Hexagon as HexagonIcon,
  Octagon as OctagonIcon,
  Pentagon as PentagonIcon,
  Star as Star2,
  Heart as Heart2,
  Smile as SmileIcon,
  Frown as FrownIcon,
  Meh as MehIcon,
  Laugh as LaughIcon,
  Angry as AngryIcon,
  Annoyed as AnnoyedIcon,
} from "lucide-react";
import { getProTrackContract, getProvider } from "../contracts/contractConfig";

// Define types
interface ProductInfo {
  id: number;
  productId: string;
  sku: string;
  name: string;
  description: string;
  manufacturerId: string;
  manufactureDate: string;
  expiryDate: string;
  batchId: string;
  rfid: string;
  barcode: string;
  productHash: string;
  status: string;
  owner: string;
  location: string;
  lastUpdate: string;
  tokenId?: number;
  isTokenized: boolean;
  recallFlag: boolean;
  recallReason?: string;
  images: string[];
  specSheets: string[];
  certificates: string[];
  ownershipHistory: OwnershipEvent[];
  metadataURI?: string;
}

interface OwnershipEvent {
  id: string;
  eventType: string;
  timestamp: string;
  location: string;
  actor: string;
  transactionHash?: string;
}

interface ScanResult {
  id: string;
  productId: string;
  productName: string;
  rfid: string;
  barcode: string;
  scanTime: string;
  location: string;
  status: "verified" | "unverified" | "tampered" | "quarantined";
  verificationResult: {
    hashMatch: boolean;
    onChainOwner: string;
    offChainOwner: string;
    timestampVerified: boolean;
  };
  actions: ScanAction[];
}

interface ScanAction {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  description: string;
}

interface DeviceStatus {
  id: string;
  name: string;
  type: "rfid" | "qr" | "nfc" | "camera";
  status: "online" | "offline" | "connecting" | "error";
  battery: number;
  signal: number;
  lastSeen: string;
  location?: string;
}

interface OfflineScan {
  id: string;
  productId: string;
  scanData: string;
  timestamp: string;
  synced: boolean;
  syncAttempts: number;
}

const ScanRFID = () => {
  console.log("ScanRFID component loaded with enhanced features");

  const { isActive } = useWeb3();
  const [activeTab, setActiveTab] = useState("scanner");
  const [userRole, setUserRole] = useState("admin");
  const [rfidInput, setRfidInput] = useState("");
  const [scannedProduct, setScannedProduct] = useState<ProductInfo | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [devices, setDevices] = useState<DeviceStatus[]>([]);
  const [offlineScans, setOfflineScans] = useState<OfflineScan[]>([]);
  const [securityMode, setSecurityMode] = useState<
    "standard" | "enhanced" | "challenge"
  >("standard");
  const [challengeResponse, setChallengeResponse] = useState("");
  const [showCamera, setShowCamera] = useState(false);

  // Initialize mock data
  useEffect(() => {
    // Mock devices
    setDevices([
      {
        id: "DEV-001",
        name: "RFID Handheld Reader",
        type: "rfid",
        status: "online",
        battery: 85,
        signal: 92,
        lastSeen: "2023-12-06 14:30:00",
        location: "Dock 3, Warehouse A",
      },
      {
        id: "DEV-002",
        name: "QR Code Scanner",
        type: "qr",
        status: "online",
        battery: 100,
        signal: 98,
        lastSeen: "2023-12-06 14:35:00",
        location: "Receiving Bay 1",
      },
      {
        id: "DEV-003",
        name: "Mobile NFC Reader",
        type: "nfc",
        status: "connecting",
        battery: 45,
        signal: 65,
        lastSeen: "2023-12-06 14:25:00",
        location: "Loading Dock 2",
      },
    ]);

    // Mock scan history
    setScanHistory([
      {
        id: "SCAN-001",
        productId: "PROD-001",
        productName: "Organic Coffee Beans",
        rfid: "RFID-001-ABC",
        barcode: "BARCODE-12345",
        scanTime: "2023-12-06 14:30:00",
        location: "Warehouse A, New York",
        status: "verified",
        verificationResult: {
          hashMatch: true,
          onChainOwner: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
          offChainOwner: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
          timestampVerified: true,
        },
        actions: [
          {
            id: "act-001",
            name: "Mark Received",
            icon: "Check",
            enabled: true,
            description: "Confirm receipt of product",
          },
          {
            id: "act-002",
            name: "Start QA",
            icon: "TestTube",
            enabled: true,
            description: "Initiate quality assurance process",
          },
          {
            id: "act-003",
            name: "Add Note",
            icon: "Note",
            enabled: true,
            description: "Add observation or comment",
          },
        ],
      },
      {
        id: "SCAN-002",
        productId: "PROD-002",
        productName: "Premium Chocolate",
        rfid: "RFID-002-DEF",
        barcode: "BARCODE-67890",
        scanTime: "2023-12-06 14:25:00",
        location: "Store B, Los Angeles",
        status: "verified",
        verificationResult: {
          hashMatch: true,
          onChainOwner: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
          offChainOwner: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
          timestampVerified: true,
        },
        actions: [
          {
            id: "act-004",
            name: "Mark Sold",
            icon: "ShoppingCart",
            enabled: true,
            description: "Record sale to customer",
          },
          {
            id: "act-005",
            name: "Return",
            icon: "RotateCcw",
            enabled: true,
            description: "Process product return",
          },
          {
            id: "act-006",
            name: "Add Note",
            icon: "Note",
            enabled: true,
            description: "Add observation or comment",
          },
        ],
      },
    ]);

    // Mock offline scans
    setOfflineScans([
      {
        id: "OFF-001",
        productId: "PROD-003",
        scanData: "RFID-003-GHI",
        timestamp: "2023-12-06 14:20:00",
        synced: false,
        syncAttempts: 2,
      },
      {
        id: "OFF-002",
        productId: "PROD-004",
        scanData: "BARCODE-54321",
        timestamp: "2023-12-06 14:15:00",
        synced: false,
        syncAttempts: 1,
      },
    ]);
  }, []);

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

  // Scan RFID/Barcode
  const scanRFID = async () => {
    if (!rfidInput) {
      setError("Please enter an RFID or barcode");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate scanning process
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock product data
      const product: ProductInfo = {
        id: Math.floor(Math.random() * 1000),
        productId: `PROD-${Math.floor(Math.random() * 1000)}`,
        sku: `SKU-${rfidInput.substring(0, 6)}`,
        name: "Scanned Product",
        description: "Product scanned via RFID/Barcode",
        manufacturerId: "MFG-001",
        manufactureDate: "2023-11-15",
        expiryDate: "2024-11-15",
        batchId: `BATCH-${Math.floor(Math.random() * 1000)}`,
        rfid: rfidInput.includes("RFID") ? rfidInput : "",
        barcode: rfidInput.includes("BARCODE") ? rfidInput : "",
        productHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        status: "In Transit",
        owner: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
        location: "Scanning Location",
        lastUpdate: new Date().toLocaleString(),
        isTokenized: Math.random() > 0.5,
        recallFlag: false,
        images: [],
        specSheets: [],
        certificates: [],
        ownershipHistory: [],
      };

      setScannedProduct(product);

      // Add to scan history
      const scanResult: ScanResult = {
        id: `SCAN-${Date.now()}`,
        productId: product.productId,
        productName: product.name,
        rfid: product.rfid,
        barcode: product.barcode,
        scanTime: new Date().toLocaleString(),
        location: product.location,
        status: "verified",
        verificationResult: {
          hashMatch: true,
          onChainOwner: product.owner,
          offChainOwner: product.owner,
          timestampVerified: true,
        },
        actions: [
          {
            id: "act-new1",
            name: "Mark Received",
            icon: "Check",
            enabled: true,
            description: "Confirm receipt of product",
          },
          {
            id: "act-new2",
            name: "Start QA",
            icon: "TestTube",
            enabled: true,
            description: "Initiate quality assurance process",
          },
          {
            id: "act-new3",
            name: "Add Note",
            icon: "Note",
            enabled: true,
            description: "Add observation or comment",
          },
        ],
      };

      setScanHistory([scanResult, ...scanHistory]);
    } catch (err) {
      console.error("Error scanning product:", err);
      setError("Failed to scan product. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle quick action
  const handleQuickAction = (actionId: string, productId: string) => {
    console.log(`Executing action ${actionId} for product ${productId}`);
    // In a real implementation, this would execute the specific action
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
  };

  // Render scanner tab
  const renderScanner = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">Scan Products</h3>
        <div className="flex space-x-2">
          <Button
            onClick={() => setShowCamera(!showCamera)}
            variant={showCamera ? "default" : "outline"}
            size="sm"
          >
            <Camera className="h-4 w-4 mr-2" />
            {showCamera ? "Hide Camera" : "Show Camera"}
          </Button>
          <Button
            onClick={() =>
              setSecurityMode(
                securityMode === "standard" ? "enhanced" : "standard"
              )
            }
            variant="outline"
            size="sm"
          >
            <Shield className="h-4 w-4 mr-2" />
            {securityMode === "standard" ? "Enhanced Mode" : "Standard Mode"}
          </Button>
        </div>
      </div>

      {showCamera && (
        <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800">
              <Camera className="h-5 w-5 mr-2 text-blue-500" />
              Camera Scanner
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-64 flex items-center justify-center">
              <div className="text-center">
                <Camera className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Camera feed would appear here</p>
                <p className="text-sm text-gray-400 mt-1">
                  Point at QR code or barcode to scan
                </p>
              </div>
            </div>
            <div className="mt-4 flex justify-center">
              <Button>
                <Scan className="h-4 w-4 mr-2" />
                Capture Image
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <Scan className="h-5 w-5 mr-2 text-blue-500" />
            Manual Scan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="rfidInput" className="text-gray-700">
                RFID / Barcode
              </Label>
              <div className="relative mt-1">
                <Input
                  id="rfidInput"
                  type="text"
                  placeholder="Enter RFID or barcode..."
                  value={rfidInput}
                  onChange={(e) => setRfidInput(e.target.value)}
                  className="pl-10"
                  onKeyDown={(e) => e.key === "Enter" && scanRFID()}
                />
                <QrCode className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>
            <div className="flex items-end">
              <Button
                onClick={scanRFID}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Scan className="h-4 w-4 mr-2" />
                    Scan
                  </>
                )}
              </Button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {scannedProduct && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <h4 className="font-medium text-green-800">Product Found</h4>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Product ID:</span>
                  <span className="ml-2 font-medium">
                    {scannedProduct.productId}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Name:</span>
                  <span className="ml-2 font-medium">
                    {scannedProduct.name}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">RFID:</span>
                  <span className="ml-2 font-medium">
                    {scannedProduct.rfid || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Barcode:</span>
                  <span className="ml-2 font-medium">
                    {scannedProduct.barcode || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Challenge Mode */}
      {securityMode === "challenge" && (
        <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md border-2 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800">
              <Shield className="h-5 w-5 mr-2 text-yellow-500" />
              Security Challenge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-yellow-800 mb-3">
                Enhanced security mode requires challenge-response verification
                for untrusted scanners.
              </p>
              <div className="flex items-center">
                <Input
                  type="text"
                  placeholder="Enter challenge response..."
                  value={challengeResponse}
                  onChange={(e) => setChallengeResponse(e.target.value)}
                  className="flex-1 mr-2"
                />
                <Button
                  variant="outline"
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Verify
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Render devices tab
  const renderDevices = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">
          Connected Devices
        </h3>
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {devices.map((device) => (
          <Card
            key={device.id}
            className="bg-gradient-to-br from-white to-gray-50 shadow-md"
          >
            <CardHeader>
              <CardTitle className="flex items-center text-gray-800">
                {device.type === "rfid" && (
                  <Package className="h-5 w-5 mr-2 text-blue-500" />
                )}
                {device.type === "qr" && (
                  <QrCode className="h-5 w-5 mr-2 text-green-500" />
                )}
                {device.type === "nfc" && (
                  <Smartphone className="h-5 w-5 mr-2 text-purple-500" />
                )}
                {device.type === "camera" && (
                  <Camera className="h-5 w-5 mr-2 text-red-500" />
                )}
                {device.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <Badge
                    className={
                      device.status === "online"
                        ? "bg-green-100 text-green-800"
                        : device.status === "offline"
                        ? "bg-red-100 text-red-800"
                        : device.status === "connecting"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }
                  >
                    {device.status.charAt(0).toUpperCase() +
                      device.status.slice(1)}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Battery</span>
                  <div className="flex items-center">
                    {device.battery > 75 && (
                      <BatteryFull className="h-4 w-4 text-green-500 mr-1" />
                    )}
                    {device.battery > 25 && device.battery <= 75 && (
                      <BatteryMedium className="h-4 w-4 text-yellow-500 mr-1" />
                    )}
                    {device.battery <= 25 && (
                      <BatteryLow className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className="text-sm">{device.battery}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Signal</span>
                  <div className="flex items-center">
                    {device.signal > 75 && (
                      <Signal className="h-4 w-4 text-green-500 mr-1" />
                    )}
                    {device.signal > 50 && device.signal <= 75 && (
                      <SignalHigh className="h-4 w-4 text-green-500 mr-1" />
                    )}
                    {device.signal > 25 && device.signal <= 50 && (
                      <SignalMedium className="h-4 w-4 text-yellow-500 mr-1" />
                    )}
                    {device.signal <= 25 && (
                      <SignalLow className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className="text-sm">{device.signal}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Last Seen</span>
                  <span className="text-sm">{device.lastSeen}</span>
                </div>

                {device.location && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Location</span>
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                      <span>{device.location}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Reconnect
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 mr-1"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Render verification tab
  const renderVerification = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">
          Verification Results
        </h3>
      </div>

      <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <CheckCircle className="h-5 w-5 mr-2 text-blue-500" />
            Recent Scans
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    Product
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    Scan Time
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    Location
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {scanHistory.map((scan) => (
                  <tr key={scan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {scan.productName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {scan.productId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {scan.scanTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {scan.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        className={
                          scan.status === "verified"
                            ? "bg-green-100 text-green-800"
                            : scan.status === "unverified"
                            ? "bg-yellow-100 text-yellow-800"
                            : scan.status === "tampered"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {scan.status.charAt(0).toUpperCase() +
                          scan.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
                {scanHistory.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No scan history available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {scannedProduct && (
        <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800">
              <Shield className="h-5 w-5 mr-2 text-blue-500" />
              Verification Details - {scannedProduct.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Hash Verification
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      {true ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        Product Hash Match
                      </p>
                      <p className="text-xs text-gray-500">
                        0x1a2b3c4d5e6f7890123456789012345678901234567890123456789012345678
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      {true ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        Timestamp Verification
                      </p>
                      <p className="text-xs text-gray-500">
                        Timestamp verified against blockchain
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Ownership Verification
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      {true ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        On-Chain Owner
                      </p>
                      <p className="text-xs font-mono text-gray-500">
                        0x742d...a3b8D4
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      {true ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        Off-Chain Owner
                      </p>
                      <p className="text-xs font-mono text-gray-500">
                        0x742d...a3b8D4
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  {
                    id: "receive",
                    name: "Mark Received",
                    icon: "Check",
                    color: "green",
                  },
                  {
                    id: "qa",
                    name: "Start QA",
                    icon: "TestTube",
                    color: "blue",
                  },
                  {
                    id: "note",
                    name: "Add Note",
                    icon: "Note",
                    color: "yellow",
                  },
                  {
                    id: "dispute",
                    name: "Open Dispute",
                    icon: "AlertTriangle",
                    color: "red",
                  },
                ].map((action) => (
                  <Button
                    key={action.id}
                    onClick={() =>
                      handleQuickAction(action.id, scannedProduct.productId)
                    }
                    variant="outline"
                    className="flex flex-col items-center justify-center h-20"
                  >
                    {action.icon === "Check" && (
                      <Check className="h-5 w-5 mb-1" />
                    )}
                    {action.icon === "TestTube" && <FlaskConical />}
                    {action.icon === "Note" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5 mb-1"
                      >
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <line x1="10" y1="9" x2="8" y2="9" />
                      </svg>
                    )}
                    {action.icon === "AlertTriangle" && (
                      <AlertTriangle className="h-5 w-5 mb-1" />
                    )}
                    <span className="text-xs">{action.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Render offline mode tab
  const renderOfflineMode = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">Offline Scans</h3>
        <Button
          onClick={syncOfflineScans}
          disabled={offlineScans.every((scan) => scan.synced)}
          className="flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Sync All
        </Button>
      </div>

      <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <WifiOff className="h-5 w-5 mr-2 text-blue-500" />
            Queued Scans
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    Product ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    Scan Data
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    Timestamp
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    Attempts
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {offlineScans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {scan.productId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {scan.scanData}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {scan.timestamp}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        className={
                          scan.synced
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {scan.synced ? "Synced" : "Pending"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {scan.syncAttempts}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        onClick={() => {
                          // Remove from offline scans
                          setOfflineScans(
                            offlineScans.filter((s) => s.id !== scan.id)
                          );
                        }}
                        variant="outline"
                        size="sm"
                        className="mr-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => {
                          // Retry sync for this scan
                          const updatedScans = offlineScans.map((s) =>
                            s.id === scan.id
                              ? { ...s, syncAttempts: s.syncAttempts + 1 }
                              : s
                          );
                          setOfflineScans(updatedScans);
                        }}
                        variant="outline"
                        size="sm"
                        disabled={scan.synced}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {offlineScans.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No offline scans queued
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <Info className="h-5 w-5 mr-2 text-blue-500" />
            Offline Mode Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p className="text-gray-700">
              Offline mode allows you to continue scanning products even when
              network connectivity is unavailable. Scans are stored locally and
              automatically synchronized when connectivity is restored.
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-1 text-gray-700">
              <li>Scans are stored securely on your device</li>
              <li>Automatic synchronization when online</li>
              <li>Manual sync option available</li>
              <li>Retry mechanism for failed synchronizations</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // If user doesn't have permission to scan products, show restricted access message
  if (userRole === "consumer") {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Scan Products
            </h1>
            <p className="text-gray-600 mt-2">
              Scan and verify supply chain products
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
                Your current role ({userRole}) does not have permission to scan
                products in the supply chain.
              </p>
              <p className="text-gray-500 text-sm">
                Contact an administrator to request access or switch to a
                different role.
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
            Scan Products
          </h1>
          <p className="text-gray-600 mt-2">
            Scan and verify supply chain products
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
            onClick={() => {
              setRfidInput("");
              setScannedProduct(null);
              setError(null);
            }}
            className="flex items-center bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {/* Wallet connection warning */}
      {!isActive && (
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-4 text-center shadow-lg">
          <div className="flex items-center justify-center">
            <Shield className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800 font-medium">
              Wallet not connected - Connect to interact with blockchain
              features
            </span>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab("scanner")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "scanner"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Scan className="h-4 w-4 inline mr-2" />
            Scanner
          </button>
          <button
            onClick={() => setActiveTab("devices")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "devices"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Smartphone className="h-4 w-4 inline mr-2" />
            Devices
          </button>
          <button
            onClick={() => setActiveTab("verification")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "verification"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Shield className="h-4 w-4 inline mr-2" />
            Verification
          </button>
          <button
            onClick={() => setActiveTab("offline")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "offline"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <WifiOff className="h-4 w-4 inline mr-2" />
            Offline Mode
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "scanner" && renderScanner()}
      {activeTab === "devices" && renderDevices()}
      {activeTab === "verification" && renderVerification()}
      {activeTab === "offline" && renderOfflineMode()}
    </div>
  );
};

// Add missing FlaskConical icon
const FlaskConical = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0-.037.917l1.95 3.457a1 1 0 0 0 .87.516H17a1 1 0 0 0 .87-.516l1.95-3.457a1 1 0 0 0-.037-.917l-5.069-10.127A2 2 0 0 1 14 9.527V2" />
    <path d="M8 2h8" />
  </svg>
);

export default ScanRFID;
