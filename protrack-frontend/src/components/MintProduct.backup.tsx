import React, { useState, useEffect } from "react";
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
  Clock,
  User,
  Link,
  Database,
  Server,
  Tag,
  Layers,
  FileImage,
  FileCheck,
  Settings,
  Plus,
  Save,
  Copy,
  Share2,
  CheckSquare,
  FileSignature,
  Anchor,
  Route,
  Timer,
  TrendingUp,
  BarChart3,
  Award,
  Users,
  Home,
  Building,
  Plane,
  Ship,
  Car,
  Train,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Filter,
  Search,
  Edit,
  Trash2,
  Send,
  Check,
  X,
  AlertOctagon,
  Info,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  Upload,
  FolderOpen,
  HardDrive,
  Cloud,
  Wifi,
  Battery,
  MapPin,
  Navigation,
  Map,
  Globe2,
  ZapOff,
  Activity,
  TrendingDown,
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
  Camera,
  Video,
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
  Award as AwardIcon,
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
  Database as DatabaseIcon,
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
  BatteryCharging,
  BatteryFull,
  BatteryMedium,
  BatteryLow,
  WifiOff,
  Bluetooth,
  BluetoothOff,
  Signal,
  SignalLow,
  SignalMedium,
  SignalHigh,
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
  Video as VideoIcon,
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

// Define types
interface Product {
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

interface MintRequest {
  id: string;
  productId: string;
  productName: string;
  batchId: string;
  status: "pending" | "approved" | "rejected" | "minted";
  submitter: string;
  approvers: string[];
  requiredApprovals: number;
  createdAt: string;
  approvedAt?: string;
  mintedAt?: string;
  metadataURI: string;
  tokenId?: number;
}

interface Approval {
  id: string;
  requestId: string;
  approver: string;
  status: "pending" | "approved" | "rejected";
  timestamp: string;
  signature?: string;
}

const MintProduct = () => {
  console.log("MintProduct component loaded with enhanced features");

  const { isActive, account } = useWeb3();
  const [activeTab, setActiveTab] = useState("policy");
  const [userRole, setUserRole] = useState("manufacturer");
  const [notification, setNotification] = useState<{
    type: string;
    message: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mint Policy states
  const [mintTrigger, setMintTrigger] = useState("manufacture");
  const [mintType, setMintType] = useState("unit");
  const [autoMint, setAutoMint] = useState(false);

  // Mint Queue states
  const [mintRequests, setMintRequests] = useState<MintRequest[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);

  // MPC Approval states
  const [pendingApprovals, setPendingApprovals] = useState<MintRequest[]>([]);
  const [approvalThreshold, setApprovalThreshold] = useState(2);

  // Metadata states
  const [metadataStorage, setMetadataStorage] = useState("supabase");
  const [ipfsHash, setIpfsHash] = useState("");
  const [supabaseUrl, setSupabaseUrl] = useState("");

  // Form states
  const [newProduct, setNewProduct] = useState({
    sku: "",
    name: "",
    description: "",
    manufacturerId: "",
    manufactureDate: "",
    expiryDate: "",
    batchId: "",
    rfid: "",
    barcode: "",
  });

  // Mock data for demonstration
  useEffect(() => {
    console.log("MintProduct component mounted");

    // Mock mint requests
    setMintRequests([
      {
        id: "REQ-001",
        productId: "PROD-001",
        productName: "Organic Coffee Beans",
        batchId: "BATCH-2023-001",
        status: "approved",
        submitter: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
        approvers: [
          "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
          "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
        ],
        requiredApprovals: 2,
        createdAt: "2023-12-01 09:00:00",
        approvedAt: "2023-12-01 10:30:00",
        metadataURI: "https://supabase.example.com/metadata/PROD-001",
        tokenId: 1001,
      },
      {
        id: "REQ-002",
        productId: "PROD-002",
        productName: "Premium Chocolate",
        batchId: "BATCH-2023-002",
        status: "pending",
        submitter: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
        approvers: ["0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4"],
        requiredApprovals: 2,
        createdAt: "2023-12-02 14:30:00",
        metadataURI: "https://supabase.example.com/metadata/PROD-002",
      },
    ]);

    // Mock approvals
    setApprovals([
      {
        id: "APPR-001",
        requestId: "REQ-001",
        approver: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
        status: "approved",
        timestamp: "2023-12-01 10:15:00",
        signature: "0xsignature1...",
      },
      {
        id: "APPR-002",
        requestId: "REQ-001",
        approver: "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
        status: "approved",
        timestamp: "2023-12-01 10:30:00",
        signature: "0xsignature2...",
      },
      {
        id: "APPR-003",
        requestId: "REQ-002",
        approver: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
        status: "approved",
        timestamp: "2023-12-02 14:45:00",
        signature: "0xsignature3...",
      },
    ]);

    // Mock pending approvals
    setPendingApprovals([
      {
        id: "REQ-002",
        productId: "PROD-002",
        productName: "Premium Chocolate",
        batchId: "BATCH-2023-002",
        status: "pending",
        submitter: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
        approvers: ["0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4"],
        requiredApprovals: 2,
        createdAt: "2023-12-02 14:30:00",
        metadataURI: "https://supabase.example.com/metadata/PROD-002",
      },
    ]);
  }, []);

  const showNotification = (type: string, message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Refresh form
  const refreshForm = () => {
    console.log("Refreshing form...");
    // In a real implementation, this would refresh data from the blockchain or backend
  };

  // Export form data
  const exportFormData = () => {
    console.log("Exporting form data...");
    // In a real implementation, this would export data to CSV/PDF
  };

  // Check if user has permission to perform actions based on role
  const canPerformAction = (action: string) => {
    switch (userRole) {
      case "admin":
        return true;
      case "manufacturer":
        return ["create", "submit", "approve"].includes(action);
      case "transporter":
        return ["view", "approve"].includes(action);
      case "retailer":
        return ["view"].includes(action);
      case "consumer":
        return ["view"].includes(action);
      default:
        return false;
    }
  };

  // Handle create product
  const handleCreateProduct = () => {
    // Generate product hash
    const productHash = `0x${Math.random().toString(16).substr(2, 64)}`;

    // Create metadata URI
    const metadataURI =
      metadataStorage === "ipfs"
        ? `ipfs://${ipfsHash}`
        : `https://supabase.example.com/metadata/${newProduct.sku}`;

    // Create mint request
    const mintRequest: MintRequest = {
      id: `REQ-${Date.now()}`,
      productId: `PROD-${newProduct.sku}`,
      productName: newProduct.name,
      batchId: newProduct.batchId,
      status: "pending",
      submitter: account || "0x0000000000000000000000000000000000000000",
      approvers: [],
      requiredApprovals: approvalThreshold,
      createdAt: new Date().toLocaleString(),
      metadataURI: metadataURI,
    };

    setMintRequests([mintRequest, ...mintRequests]);
    showNotification("success", "Product submitted for minting approval!");

    // Reset form
    setNewProduct({
      sku: "",
      name: "",
      description: "",
      manufacturerId: "",
      manufactureDate: "",
      expiryDate: "",
      batchId: "",
      rfid: "",
      barcode: "",
    });
  };

  // Handle approve mint request
  const handleApproveMint = (requestId: string) => {
    const updatedRequests = mintRequests.map((req) => {
      if (req.id === requestId && req.status === "pending") {
        const updatedApprovers = [...req.approvers, account || ""];
        const newStatus =
          updatedApprovers.length >= req.requiredApprovals
            ? ("approved" as const)
            : ("pending" as const);

        // Update approvals
        const newApproval: Approval = {
          id: `APPR-${Date.now()}`,
          requestId: requestId,
          approver: account || "",
          status: "approved",
          timestamp: new Date().toLocaleString(),
          signature: `0xsignature-${Date.now()}`,
        };

        setApprovals([...approvals, newApproval]);

        return {
          ...req,
          approvers: updatedApprovers,
          status: newStatus,
          approvedAt:
            newStatus === "approved"
              ? new Date().toLocaleString()
              : req.approvedAt,
        };
      }
      return req;
    });

    setMintRequests(updatedRequests);
    showNotification("success", "Mint request approved!");
  };

  // Handle reject mint request
  const handleRejectMint = (requestId: string) => {
    const updatedRequests = mintRequests.map((req) => {
      if (req.id === requestId && req.status === "pending") {
        // Update approvals
        const newApproval: Approval = {
          id: `APPR-${Date.now()}`,
          requestId: requestId,
          approver: account || "",
          status: "rejected",
          timestamp: new Date().toLocaleString(),
          signature: `0xsignature-${Date.now()}`,
        };

        setApprovals([...approvals, newApproval]);

        return {
          ...req,
          status: "rejected" as const,
          approvedAt: new Date().toLocaleString(),
        };
      }
      return req;
    });

    setMintRequests(updatedRequests);
    showNotification("success", "Mint request rejected!");
  };

  // Handle mint product (execute after approval)
  const handleMintProduct = async (requestId: string) => {
    if (!isActive) {
      showNotification("error", "Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    try {
      const signer = await getSigner();
      const contract = getProTrackContract(signer);

      // Find the request
      const request = mintRequests.find((req) => req.id === requestId);
      if (!request) {
        throw new Error("Mint request not found");
      }

      // In a real implementation, this would call the smart contract to mint an NFT
      console.log(`Minting product ${request.productId} as NFT...`);

      // Simulate minting
      const tokenId = Math.floor(Math.random() * 10000);

      // Update request status
      const updatedRequests = mintRequests.map((req) => {
        if (req.id === requestId) {
          return {
            ...req,
            status: "minted" as const,
            tokenId: tokenId,
            mintedAt: new Date().toLocaleString(),
          };
        }
        return req;
      });

      setMintRequests(updatedRequests);

      showNotification(
        "success",
        `Product minted successfully! Token ID: ${tokenId}`
      );
    } catch (error) {
      console.error("Error minting product:", error);
      showNotification("error", "Failed to mint product");
    } finally {
      setIsLoading(false);
    }
  };

  // Render mint policy tab
  const renderMintPolicy = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">Minting Policy</h3>
      </div>

      <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <Settings className="h-5 w-5 mr-2 text-blue-500" />
            Policy Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="mintTrigger" className="text-gray-700">
                Mint Trigger
              </Label>
              <select
                id="mintTrigger"
                value={mintTrigger}
                onChange={(e) => setMintTrigger(e.target.value)}
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="manufacture">On Manufacture</option>
                <option value="qa_pass">On QA Pass</option>
                <option value="packaging">On Packaging</option>
                <option value="manual">Manual Trigger</option>
              </select>
            </div>

            <div>
              <Label htmlFor="mintType" className="text-gray-700">
                Mint Type
              </Label>
              <select
                id="mintType"
                value={mintType}
                onChange={(e) => setMintType(e.target.value)}
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="batch">Batch NFT</option>
                <option value="unit">Unit NFT</option>
                <option value="sbt">SBT (Soulbound)</option>
              </select>
            </div>

            <div>
              <Label htmlFor="approvalThreshold" className="text-gray-700">
                Approval Threshold
              </Label>
              <Input
                id="approvalThreshold"
                type="number"
                min="1"
                max="5"
                value={approvalThreshold}
                onChange={(e) => setApprovalThreshold(parseInt(e.target.value))}
                className="mt-1"
              />
            </div>

            <div className="flex items-center pt-6">
              <input
                id="autoMint"
                type="checkbox"
                checked={autoMint}
                onChange={(e) => setAutoMint(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Label
                htmlFor="autoMint"
                className="ml-2 block text-sm text-gray-700"
              >
                Auto-mint after approval
              </Label>
            </div>
          </div>

          <div className="mt-6">
            <Button
              onClick={() =>
                showNotification("success", "Minting policy updated!")
              }
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Policy
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <Info className="h-5 w-5 mr-2 text-blue-500" />
            Policy Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>
                <strong>On Manufacture:</strong> Automatically trigger minting
                when a product is manufactured
              </li>
              <li>
                <strong>On QA Pass:</strong> Mint only after quality assurance
                tests are passed
              </li>
              <li>
                <strong>On Packaging:</strong> Mint when product is packaged and
                ready for shipment
              </li>
              <li>
                <strong>Manual Trigger:</strong> Require manual approval before
                minting
              </li>
              <li>
                <strong>Batch NFT:</strong> Mint one NFT representing an entire
                batch of products
              </li>
              <li>
                <strong>Unit NFT:</strong> Mint individual NFTs for each unit in
                a batch
              </li>
              <li>
                <strong>SBT:</strong> Mint soulbound tokens that cannot be
                transferred
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render mint queue tab
  const renderMintQueue = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">Mint Queue</h3>
      </div>

      <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <Clock className="h-5 w-5 mr-2 text-blue-500" />
            Pending Requests
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
                    Batch
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    Submitted By
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    Approvals
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    Status
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
                {mintRequests
                  .filter((req) => req.status === "pending")
                  .map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {request.productName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.productId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.batchId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="font-mono text-xs">
                          {request.submitter.substring(0, 6)}...
                          {request.submitter.substring(
                            request.submitter.length - 4
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {request.approvers.length}/{request.requiredApprovals}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Pending
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          onClick={() => handleApproveMint(request.id)}
                          size="sm"
                          className="mr-2 bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleRejectMint(request.id)}
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </td>
                    </tr>
                  ))}
                {mintRequests.filter((req) => req.status === "pending")
                  .length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No pending mint requests
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
            <CheckCircle className="h-5 w-5 mr-2 text-blue-500" />
            Approved Requests
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
                    Batch
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    Approved At
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    Token ID
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
                {mintRequests
                  .filter((req) => req.status === "approved")
                  .map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {request.productName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.productId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.batchId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.approvedAt}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.tokenId ? `#${request.tokenId}` : "Not minted"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          onClick={() => handleMintProduct(request.id)}
                          size="sm"
                          disabled={isLoading}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          {isLoading ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Minting...
                            </>
                          ) : (
                            <>
                              <Zap className="h-4 w-4 mr-2" />
                              Mint NFT
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                {mintRequests.filter((req) => req.status === "approved")
                  .length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No approved mint requests
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render MPC approval tab
  const renderMPCApproval = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">
          MPC Multisig Approval
        </h3>
      </div>

      <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <Lock className="h-5 w-5 mr-2 text-blue-500" />
            Approval Threshold
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Current Threshold</p>
              <p className="text-sm text-gray-500">
                {approvalThreshold} of {approvalThreshold + 1} signatures
                required
              </p>
            </div>
            <div className="flex items-center">
              <div className="relative">
                <div className="flex -space-x-2">
                  {[...Array(approvalThreshold + 1)].map((_, i) => (
                    <div
                      key={i}
                      className={`inline-block h-8 w-8 rounded-full border-2 border-white ${
                        i < approvalThreshold ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <span className="ml-3 text-sm font-medium text-gray-700">
                {approvalThreshold}/{approvalThreshold + 1}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <Key className="h-5 w-5 mr-2 text-blue-500" />
            Pending Approvals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingApprovals.map((request) => (
              <div
                key={request.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {request.productName}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {request.productId} • {request.batchId}
                    </p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    Pending
                  </Badge>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-700 text-xs">
                      Submitted By
                    </Label>
                    <div className="font-mono text-sm mt-1">
                      {request.submitter.substring(0, 6)}...
                      {request.submitter.substring(
                        request.submitter.length - 4
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-700 text-xs">
                      Submitted At
                    </Label>
                    <div className="text-sm mt-1">{request.createdAt}</div>
                  </div>
                  <div>
                    <Label className="text-gray-700 text-xs">
                      Metadata URI
                    </Label>
                    <div className="font-mono text-xs mt-1 truncate bg-gray-100 p-1 rounded">
                      {request.metadataURI}
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-700 text-xs">Approvals</Label>
                    <div className="mt-1">
                      <div className="flex -space-x-2">
                        {request.approvers.map((approver, idx) => (
                          <div
                            key={idx}
                            className="inline-block h-6 w-6 rounded-full bg-green-500 border-2 border-white"
                            title={approver}
                          />
                        ))}
                        {[
                          ...Array(
                            request.requiredApprovals - request.approvers.length
                          ),
                        ].map((_, idx) => (
                          <div
                            key={idx}
                            className="inline-block h-6 w-6 rounded-full bg-gray-300 border-2 border-white"
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 ml-2">
                        {request.approvers.length}/{request.requiredApprovals}{" "}
                        approved
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex space-x-3">
                  <Button
                    onClick={() => handleApproveMint(request.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleRejectMint(request.id)}
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            ))}

            {pendingApprovals.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto text-green-300 mb-3" />
                <p>No pending approvals</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render metadata URI generation tab
  const renderMetadataURI = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">
          Metadata URI Generation
        </h3>
      </div>

      <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <Database className="h-5 w-5 mr-2 text-blue-500" />
            Storage Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-gray-700">Storage Provider</Label>
              <div className="mt-2 space-y-3">
                <div
                  className={`flex items-center p-4 border rounded-lg cursor-pointer ${
                    metadataStorage === "supabase"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() => setMetadataStorage("supabase")}
                >
                  <div
                    className={`h-5 w-5 rounded-full border flex items-center justify-center mr-3 ${
                      metadataStorage === "supabase"
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    {metadataStorage === "supabase" && (
                      <div className="h-2 w-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">Supabase Storage</p>
                    <p className="text-sm text-gray-500">
                      Recommended for structured metadata
                    </p>
                  </div>
                </div>

                <div
                  className={`flex items-center p-4 border rounded-lg cursor-pointer ${
                    metadataStorage === "ipfs"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() => setMetadataStorage("ipfs")}
                >
                  <div
                    className={`h-5 w-5 rounded-full border flex items-center justify-center mr-3 ${
                      metadataStorage === "ipfs"
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    {metadataStorage === "ipfs" && (
                      <div className="h-2 w-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">IPFS</p>
                    <p className="text-sm text-gray-500">
                      Decentralized storage for immutable metadata
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              {metadataStorage === "ipfs" ? (
                <div>
                  <Label htmlFor="ipfsHash" className="text-gray-700">
                    IPFS Content Hash
                  </Label>
                  <Input
                    id="ipfsHash"
                    type="text"
                    placeholder="Enter IPFS hash (Qm...)"
                    value={ipfsHash}
                    onChange={(e) => setIpfsHash(e.target.value)}
                    className="mt-1"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Enter the IPFS hash where your metadata is stored
                  </p>
                </div>
              ) : (
                <div>
                  <Label htmlFor="supabaseUrl" className="text-gray-700">
                    Supabase URL
                  </Label>
                  <Input
                    id="supabaseUrl"
                    type="text"
                    placeholder="https://your-project.supabase.co"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    className="mt-1"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Your Supabase project URL for metadata storage
                  </p>
                </div>
              )}

              <div className="mt-6">
                <Button
                  onClick={() =>
                    showNotification("success", "Storage configuration saved!")
                  }
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Configuration
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <FileText className="h-5 w-5 mr-2 text-blue-500" />
            Metadata Template
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-800 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            {`{
  "name": "Product Name",
  "description": "Product description",
  "image": "https://example.com/image.png",
  "attributes": [
    {
      "trait_type": "SKU",
      "value": "SKU-VALUE"
    },
    {
      "trait_type": "Batch ID",
      "value": "BATCH-ID"
    },
    {
      "trait_type": "Manufacturer",
      "value": "MANUFACTURER-ID"
    },
    {
      "trait_type": "Manufacture Date",
      "value": "YYYY-MM-DD"
    },
    {
      "trait_type": "Expiry Date",
      "value": "YYYY-MM-DD"
    }
  ],
  "external_url": "https://protrack.example.com/product/PRODUCT-ID"
}`}
          </div>
          <div className="mt-4 flex space-x-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Upload Custom Template
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render create product form
  const renderCreateProduct = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">
          Create Product for Minting
        </h3>
      </div>

      <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <PlusCircle className="h-5 w-5 mr-2 text-blue-500" />
            Product Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="sku" className="text-gray-700">
                SKU *
              </Label>
              <Input
                id="sku"
                type="text"
                placeholder="Enter SKU"
                value={newProduct.sku}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, sku: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="name" className="text-gray-700">
                Product Name *
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter product name"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="description" className="text-gray-700">
                Description
              </Label>
              <Input
                id="description"
                type="text"
                placeholder="Enter product description"
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, description: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="manufacturerId" className="text-gray-700">
                Manufacturer ID *
              </Label>
              <Input
                id="manufacturerId"
                type="text"
                placeholder="Enter manufacturer ID"
                value={newProduct.manufacturerId}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    manufacturerId: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="batchId" className="text-gray-700">
                Batch ID *
              </Label>
              <Input
                id="batchId"
                type="text"
                placeholder="Enter batch ID"
                value={newProduct.batchId}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, batchId: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="manufactureDate" className="text-gray-700">
                Manufacture Date *
              </Label>
              <Input
                id="manufactureDate"
                type="date"
                value={newProduct.manufactureDate}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    manufactureDate: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="expiryDate" className="text-gray-700">
                Expiry Date *
              </Label>
              <Input
                id="expiryDate"
                type="date"
                value={newProduct.expiryDate}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, expiryDate: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="rfid" className="text-gray-700">
                RFID
              </Label>
              <Input
                id="rfid"
                type="text"
                placeholder="Auto-generated if empty"
                value={newProduct.rfid}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, rfid: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="barcode" className="text-gray-700">
                Barcode
              </Label>
              <Input
                id="barcode"
                type="text"
                placeholder="Auto-generated if empty"
                value={newProduct.barcode}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, barcode: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              onClick={() => {
                setNewProduct({
                  sku: "",
                  name: "",
                  description: "",
                  manufacturerId: "",
                  manufactureDate: "",
                  expiryDate: "",
                  batchId: "",
                  rfid: "",
                  barcode: "",
                });
              }}
              variant="outline"
            >
              Clear
            </Button>
            <Button
              onClick={handleCreateProduct}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Send className="h-4 w-4 mr-2" />
              Submit for Minting
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

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
            <span>{notification.message}</span>
          </div>
        </div>
      )}

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
            onClick={() => setActiveTab("create")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "create"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <PlusCircle className="h-4 w-4 inline mr-2" />
            Create Product
          </button>
          <button
            onClick={() => setActiveTab("policy")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "policy"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Settings className="h-4 w-4 inline mr-2" />
            Mint Policy
          </button>
          <button
            onClick={() => setActiveTab("queue")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "queue"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Clock className="h-4 w-4 inline mr-2" />
            Mint Queue
          </button>
          <button
            onClick={() => setActiveTab("mpc")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "mpc"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Lock className="h-4 w-4 inline mr-2" />
            MPC Approval
          </button>
          <button
            onClick={() => setActiveTab("metadata")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "metadata"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Database className="h-4 w-4 inline mr-2" />
            Metadata URI
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "create" && renderCreateProduct()}
      {activeTab === "policy" && renderMintPolicy()}
      {activeTab === "queue" && renderMintQueue()}
      {activeTab === "mpc" && renderMPCApproval()}
      {activeTab === "metadata" && renderMetadataURI()}
    </div>
  );
};

export default MintProduct;
