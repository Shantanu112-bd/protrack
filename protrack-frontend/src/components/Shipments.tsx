import React, { useState, useEffect } from "react";
import { useWeb3 } from "../contexts/web3ContextTypes";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { LoadingSpinner } from "./ui/loading-spinner";
import { supabase, trackingService } from "../services/supabase";
import { dashboardService } from "../services/dashboardService";
import { fallbackService } from "../services/fallbackService";
import {
  Truck,
  Search,
  Filter,
  Eye,
  Download,
  RefreshCw,
  MapPin,
  Calendar,
  Package,
  Upload,
  Plus,
  Navigation,
  User,
  XCircle,
  Thermometer,
  Droplets,
  Loader2,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
// Removed duplicate event imports

// Define types based on Supabase schema
interface Shipment {
  id: string;
  product_id: string;
  from_party: string;
  to_party: string;
  status: "requested" | "approved" | "shipped" | "delivered" | "confirmed";
  mpc_tx_id?: string;
  temp_key_id?: string;
  requested_at: string;
  approved_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  confirmed_at?: string;
  tracking_info?: any;
  created_at: string;
  updated_at: string;
  expected_arrival?: string;
  // Joined data
  products?: {
    id: string;
    product_name: string;
    rfid_tag: string;
    batch_no: string;
    current_location: string;
  };
  from_user?: {
    id: string;
    name: string;
    wallet_address: string;
  };
  to_user?: {
    id: string;
    name: string;
    wallet_address: string;
  };
}

interface ShipmentEvent {
  id: number;
  timestamp: string;
  location: string;
  eventType: string;
  signer: string;
}

interface Checkpoint {
  id: string;
  timestamp: string;
  location: string;
  eventType: "arrival" | "departure" | "customs" | "inspection";
  signer: string;
  notes?: string;
  lat: number;
  lng: number;
}

interface InsuranceClaim {
  id: string;
  timestamp: string;
  reason: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  documents: string[];
}

interface TemperatureLog {
  timestamp: string;
  value: number;
  location: string;
}

const Shipments = () => {
  const { isActive, account } = useWeb3();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [userRole, setUserRole] = useState("admin");
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(
    null
  );
  const [newShipment, setNewShipment] = useState({
    product_id: "",
    to_party_wallet: "",
    expected_arrival: "",
    destination: "",
  });

  // Load shipments from database with fallback support
  const loadShipments = async () => {
    try {
      setLoading(true);

      // Use the enhanced tracking service with fallback
      const data = await trackingService.getAllShipments();
      setShipments((data || []) as any);

      // Check connection status
      const connectionStatus = fallbackService.getConnectionStatus();
      if (!connectionStatus.supabaseConnected && data.length > 0) {
        console.log("📱 Loading shipments from offline storage");
      }
    } catch (error) {
      console.error("Error loading shipments:", error);

      // If all else fails, show mock data
      const mockShipments = fallbackService.getMockShipments();
      setShipments(mockShipments as any);
      console.log("📱 Using fallback mock shipments due to connection issues");
    } finally {
      setLoading(false);
    }
  };

  // Load products for shipment creation with fallback support
  const loadProducts = async () => {
    try {
      // Use the enhanced tracking service with fallback
      const data = await trackingService.getAllProducts();

      // Filter products owned by current user, or show all if no account
      const userProducts = account
        ? data.filter((product: any) => product.owner_wallet === account)
        : data;

      setProducts(userProducts || []);

      console.log(
        `Loaded ${userProducts.length} products for shipment creation`
      );
    } catch (error) {
      console.error("Error loading products:", error);

      // Fallback to mock products if everything fails
      const mockProducts = fallbackService.getMockProducts();
      const userMockProducts = account
        ? mockProducts.filter(
            (product: any) => product.owner_wallet === account
          )
        : mockProducts;

      setProducts(userMockProducts);
      console.log("Using fallback mock products for shipment creation");
    }
  };

  // Load users for shipment creation with fallback support
  const loadUsers = async () => {
    try {
      // Check if we should use fallback
      if (fallbackService.shouldUseFallback()) {
        throw new Error("Using fallback mode");
      }

      if (!supabase) {
        throw new Error("Supabase not available");
      }

      const { data, error } = await supabase
        .from("users")
        .select("id, name, wallet_address")
        .neq("wallet_address", account || "")
        .order("name");

      if (error) throw error;
      setUsers(data || []);
      console.log(`Loaded ${data?.length || 0} users for recipient selection`);
    } catch (error) {
      console.error("Error loading users:", error);

      // Fallback to mock users from fallback service
      const mockUsers = fallbackService.getMockUsers();

      // Filter out current user if account is available
      const filteredUsers = account
        ? mockUsers.filter((user) => user.wallet_address !== account)
        : mockUsers;

      setUsers(filteredUsers);
      console.log("Using fallback mock users for recipient selection");
    }
  };

  useEffect(() => {
    loadShipments();
    // Always load products and users for shipment creation
    loadProducts();
    loadUsers();
  }, [account]);

  // Refresh shipments data
  const refreshShipments = async () => {
    await loadShipments();
  };

  // Create new shipment with fallback support
  const handleCreateShipment = async () => {
    if (!account) {
      alert("Please connect your wallet first");
      return;
    }

    // Validate required fields
    if (!newShipment.product_id.trim()) {
      alert("Please select a product");
      return;
    }
    if (!newShipment.destination.trim()) {
      alert("Destination is required");
      return;
    }

    try {
      setCreating(true);

      // Check connection status and inform user
      const connectionStatus = fallbackService.getConnectionStatus();
      if (!connectionStatus.isOnline) {
        console.log("📱 Creating shipment in offline mode");
      } else if (!connectionStatus.supabaseConnected) {
        console.log("📱 Creating shipment with fallback service");
      } else {
        console.log("✅ Creating shipment with full connectivity");
      }

      // Create shipment using enhanced service with automatic fallback
      const shipmentData = {
        product_id: newShipment.product_id,
        to_party_wallet: newShipment.to_party_wallet,
        destination: newShipment.destination,
        expected_arrival: newShipment.expected_arrival,
        from_party: account, // Use connected wallet as sender
      };

      console.log("Creating shipment with enhanced service:", shipmentData);

      // Use the enhanced tracking service with automatic fallback
      const result = await trackingService.createShipment(shipmentData);

      console.log("Shipment created successfully:", result);

      // Check if we're in offline mode and inform user
      const finalConnectionStatus = fallbackService.getConnectionStatus();
      if (!finalConnectionStatus.supabaseConnected) {
        console.log(
          "📱 Shipment created in offline mode - will sync when connection restored"
        );
      }

      // Refresh shipments list
      await loadShipments();

      // Reset form and close modal
      setShowCreateModal(false);
      setNewShipment({
        product_id: "",
        to_party_wallet: "",
        expected_arrival: "",
        destination: "",
      });

      // Show success message with connection status
      const successMessage = finalConnectionStatus.supabaseConnected
        ? "Shipment created successfully!"
        : "Shipment created offline - will sync when connected!";
      alert(successMessage);
    } catch (error) {
      console.error("Error creating shipment:", error);

      // More detailed error message with user-friendly suggestions
      let errorMessage = "Failed to create shipment. ";
      if (error instanceof Error) {
        errorMessage += error.message;

        // Add helpful suggestions based on error type
        if (error.message.includes("Network connection failed")) {
          errorMessage += "\n\nTroubleshooting tips:\n";
          errorMessage += "• Check your internet connection\n";
          errorMessage += "• Try refreshing the page\n";
          errorMessage += "• Try again in a few moments";
        } else if (error.message.includes("required")) {
          errorMessage +=
            "\n\nPlease ensure all required fields are filled out.";
        }
      } else {
        errorMessage += "An unexpected error occurred. Please try again.";
      }

      alert(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  // Update shipment status with fallback support
  const updateShipmentStatus = async (
    shipmentId: string,
    newStatus: string
  ) => {
    try {
      setUpdating(shipmentId);

      // Use enhanced service with fallback
      await trackingService.updateShipmentStatus(shipmentId, newStatus);

      // Refresh shipments
      await loadShipments();

      // Check connection status for user feedback
      const connectionStatus = fallbackService.getConnectionStatus();
      const successMessage = connectionStatus.supabaseConnected
        ? `Shipment status updated to ${newStatus}`
        : `Shipment status updated offline - will sync when connected`;
      alert(successMessage);
    } catch (error) {
      console.error("Error updating shipment:", error);

      let errorMessage = "Failed to update shipment status. ";
      if (error instanceof Error) {
        errorMessage += error.message;
      } else {
        errorMessage += "Please try again.";
      }
      alert(errorMessage);
    } finally {
      setUpdating(null);
    }
  };

  // Export shipments data
  const exportShipments = () => {
    // In a real app, this would export data to CSV/PDF
    console.log("Exporting shipments data...");
  };

  // Filter shipments based on search term and status
  const filteredShipments = shipments.filter((shipment) => {
    const matchesSearch =
      shipment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (shipment.products?.product_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (shipment.from_user?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (shipment.to_user?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      shipment.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Format status badge
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "requested":
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
            Requested
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600">
            Approved
          </Badge>
        );
      case "shipped":
        return (
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
            Shipped
          </Badge>
        );
      case "delivered":
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
            Delivered
          </Badge>
        );
      case "confirmed":
        return (
          <Badge className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700">
            Confirmed
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

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-rose-500">
            High
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
            Medium
          </Badge>
        );
      case "low":
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500">
            Low
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gradient-to-r from-gray-300 to-gray-500">
            {priority}
          </Badge>
        );
    }
  };

  // View shipment details
  const viewShipmentDetails = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setShowShipmentModal(true);
  };

  // View live map tracking
  const viewLiveMap = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setShowMapModal(true);
  };

  // Upload proof of delivery
  const uploadPOD = (shipment: Shipment) => {
    // In a real implementation, this would open a file upload dialog
    console.log("Uploading POD for shipment:", shipment);
  };

  // Create new shipment
  const createShipment = () => {
    setShowCreateModal(true);
  };

  // Create new shipment (using the async version above)

  // Handle input change for new shipment form
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setNewShipment({
      ...newShipment,
      [name]: value,
    });
  };

  // Check if user has permission to perform actions based on role
  // const canPerformAction = (action: string) => {
  //   switch (userRole) {
  //     case "admin":
  //       return true;
  //     case "manufacturer":
  //       return ["view"].includes(action);
  //     case "transporter":
  //       return ["view", "update"].includes(action);
  //     case "retailer":
  //       return ["view"].includes(action);
  //     case "consumer":
  //       return ["view"].includes(action);
  //     default:
  //       return false;
  //   }
  // };

  // Get insurance claim status badge
  // const getClaimStatusBadge = (status: string) => {
  //   switch (status) {
  //     case "pending":
  //       return (
  //         <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
  //           <Clock className="h-3 w-3 mr-1" />
  //           Pending
  //         </Badge>
  //       );
  //     case "approved":
  //       return (
  //         <Badge className="bg-gradient-to-r from-green-500 to-emerald-500">
  //           <CheckCircle className="h-3 w-3 mr-1" />
  //           Approved
  //         </Badge>
  //       );
  //     case "rejected":
  //       return (
  //         <Badge className="bg-gradient-to-r from-red-500 to-rose-500">
  //           <XCircle className="h-3 w-3 mr-1" />
  //           Rejected
  //         </Badge>
  //       );
  //     default:
  //       return (
  //         <Badge className="bg-gradient-to-r from-gray-300 to-gray-500">
  //           {status}
  //         </Badge>
  //       );
  //   }
  // };

  // Calculate shipment progress percentage
  const getShipmentProgress = (status: string) => {
    switch (status.toLowerCase()) {
      case "requested":
        return 20;
      case "approved":
        return 40;
      case "shipped":
        return 70;
      case "delivered":
        return 90;
      case "confirmed":
        return 100;
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Shipments
          </h1>
          <p className="text-gray-600 mt-2">
            Manage and track your supply chain shipments
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
            onClick={createShipment}
            className="flex items-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Shipment
          </Button>
          <Button
            onClick={refreshShipments}
            className="flex items-center bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={exportShipments}
            className="flex items-center bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Download className="h-5 w-5 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Connection warnings */}
      {!isActive && (
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-4 text-center shadow-lg">
          <div className="flex items-center justify-center">
            <Truck className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800 font-medium">
              Wallet not connected - Connect to interact with blockchain
              features
            </span>
          </div>
        </div>
      )}

      {!navigator.onLine && (
        <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-2xl p-4 text-center shadow-lg">
          <div className="flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800 font-medium">
              No internet connection - Running in offline mode
            </span>
          </div>
        </div>
      )}

      {navigator.onLine &&
        !fallbackService.getConnectionStatus().supabaseConnected && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Truck className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-blue-800 font-medium">
                  Using offline mode - Data will sync when connection restored
                  {fallbackService.getPendingOperationsCount() > 0 &&
                    ` (${fallbackService.getPendingOperationsCount()} operations pending)`}
                </span>
              </div>
              <Button
                onClick={async () => {
                  try {
                    console.log("🔄 Forcing system online...");
                    await fallbackService.forceOnlineMode();
                    // Refresh the page to update all components
                    window.location.reload();
                  } catch (error) {
                    console.error("Failed to force online mode:", error);
                    alert(
                      "Failed to go online. Please check your connection and try again."
                    );
                  }
                }}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Go Online
              </Button>
            </div>
          </div>
        )}

      {/* Search and Filter Section */}
      <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <Filter className="h-5 w-5 mr-2 text-blue-500" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search" className="text-gray-700">
                Search Shipments
              </Label>
              <div className="relative mt-1">
                <Input
                  id="search"
                  type="text"
                  placeholder="Search by shipment ID, origin, destination..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>
            <div>
              <Label htmlFor="status" className="text-gray-700">
                Filter by Status
              </Label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="requested">Requested</option>
                <option value="approved">Approved</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="confirmed">Confirmed</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipments Table */}
      <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <Truck className="h-5 w-5 mr-2 text-blue-500" />
            Shipment Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="text-gray-700 font-bold">ID</TableHead>
                  <TableHead className="text-gray-700 font-bold">
                    Shipment
                  </TableHead>
                  <TableHead className="text-gray-700 font-bold">
                    Route
                  </TableHead>
                  <TableHead className="text-gray-700 font-bold">
                    Status
                  </TableHead>
                  <TableHead className="text-gray-700 font-bold">
                    Progress
                  </TableHead>
                  <TableHead className="text-gray-700 font-bold">
                    Priority
                  </TableHead>
                  <TableHead className="text-gray-700 font-bold">
                    Carrier
                  </TableHead>
                  <TableHead className="text-gray-700 font-bold">
                    Devices
                  </TableHead>
                  <TableHead className="text-gray-700 font-bold">
                    Checkpoints
                  </TableHead>
                  <TableHead className="text-gray-700 font-bold">
                    Insurance
                  </TableHead>
                  <TableHead className="text-gray-700 font-bold">
                    Emissions
                  </TableHead>
                  <TableHead className="text-gray-700 font-bold">
                    Cost
                  </TableHead>
                  <TableHead className="text-gray-700 font-bold text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={13} className="text-center py-8">
                      <LoadingSpinner />
                    </TableCell>
                  </TableRow>
                ) : filteredShipments.length > 0 ? (
                  filteredShipments.map((shipment) => (
                    <TableRow key={shipment.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {shipment.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {shipment.products?.product_name || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            Product ID: {shipment.product_id}
                          </div>
                          <div className="text-sm text-gray-500">
                            Expected:{" "}
                            {shipment.expected_arrival
                              ? new Date(
                                  shipment.expected_arrival
                                ).toLocaleDateString()
                              : "N/A"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-500 mr-1" />
                          <span className="text-sm">
                            {shipment.from_user?.name || "Unknown"}
                          </span>
                        </div>
                        <div className="flex items-center mt-1">
                          <Navigation className="h-4 w-4 text-gray-500 mr-1" />
                          <span className="text-sm">
                            {shipment.to_user?.name || "Unknown"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                      <TableCell>
                        <div className="w-24">
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                              style={{
                                width: `${getShipmentProgress(
                                  shipment.status
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1 text-center">
                            {getShipmentProgress(shipment.status)}%
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-gradient-to-r from-blue-500 to-purple-500">
                          Standard
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm">
                          {shipment.mpc_tx_id?.substring(0, 8) || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-mono">
                            {shipment.temp_key_id?.substring(0, 8) || "N/A"}
                          </div>
                          <div className="text-gray-500">IoT Enabled</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                          <span className="text-sm">
                            {new Date(shipment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-mono">Standard Coverage</div>
                          <div className="text-gray-500">Active</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">0.5 kg CO2</div>
                          <div className="text-gray-500">Est. 50 miles</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">$150.00</div>
                          <div className="text-gray-500">Estimated</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            onClick={() => viewShipmentDetails(shipment)}
                            variant="outline"
                            size="sm"
                            className="flex items-center"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {shipment.status === "requested" && (
                            <Button
                              onClick={() =>
                                updateShipmentStatus(shipment.id, "approved")
                              }
                              variant="outline"
                              size="sm"
                              className="flex items-center"
                              disabled={updating === shipment.id}
                            >
                              {updating === shipment.id ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-1" />
                              )}
                              Approve
                            </Button>
                          )}
                          {shipment.status === "approved" && (
                            <Button
                              onClick={() =>
                                updateShipmentStatus(shipment.id, "shipped")
                              }
                              variant="outline"
                              size="sm"
                              className="flex items-center"
                              disabled={updating === shipment.id}
                            >
                              {updating === shipment.id ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <Truck className="h-4 w-4 mr-1" />
                              )}
                              Ship
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={13}
                      className="text-center py-8 text-gray-500"
                    >
                      No shipments found matching your criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Shipments Summary */}
      <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <Package className="h-5 w-5 mr-2 text-blue-500" />
            Recent Shipments Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shipments.slice(0, 3).map((shipment) => (
              <Card key={shipment.id} className="border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {shipment.products?.product_name || "Unknown Product"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="font-medium">
                        {getStatusBadge(shipment.status)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>From:</span>
                      <span className="font-medium">
                        {shipment.from_user?.name || "Unknown"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>To:</span>
                      <span className="font-medium">
                        {shipment.to_user?.name || "Unknown"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 pt-2 border-t border-gray-200">
                    <div className="flex justify-between font-medium">
                      <span>Created:</span>
                      <span>
                        {new Date(shipment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Map Modal */}
      {showMapModal && selectedShipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="flex items-center text-gray-800">
                  <MapPin className="h-6 w-6 mr-2 text-blue-500" />
                  Live Tracking:{" "}
                  {selectedShipment.products?.product_name || "Unknown Product"}
                </CardTitle>
                <Button
                  variant="ghost"
                  onClick={() => setShowMapModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-96 flex items-center justify-center relative">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-gray-500 mx-auto" />
                      <p className="mt-2 text-gray-500">
                        Interactive Map Visualization
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Tracking shipment from{" "}
                        {selectedShipment.from_user?.name || "Unknown"} to{" "}
                        {selectedShipment.to_user?.name || "Unknown"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">
                      Current Location
                    </h3>
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <MapPin className="h-5 w-5 text-blue-500 mr-2" />
                      <div>
                        <p className="font-medium">
                          {selectedShipment.products?.current_location ||
                            "Location updating..."}
                        </p>
                        <p className="text-sm text-gray-600">
                          Last updated:{" "}
                          {new Date(
                            selectedShipment.updated_at
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Shipment Details
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p>{getStatusBadge(selectedShipment.status)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Product</p>
                      <p className="font-medium">
                        {selectedShipment.products?.product_name || "Unknown"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">From</p>
                      <p className="font-medium">
                        {selectedShipment.from_user?.name || "Unknown"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">To</p>
                      <p className="font-medium">
                        {selectedShipment.to_user?.name || "Unknown"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Expected Arrival</p>
                      <p className="font-medium">
                        {selectedShipment.expected_arrival
                          ? new Date(
                              selectedShipment.expected_arrival
                            ).toLocaleDateString()
                          : "TBD"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Shipment Detail Modal */}
      {showShipmentModal && selectedShipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="flex items-center text-gray-800">
                  <Truck className="h-6 w-6 mr-2 text-blue-500" />
                  Shipment Details:{" "}
                  {selectedShipment.products?.product_name || "Unknown Product"}
                </CardTitle>
                <Button
                  variant="ghost"
                  onClick={() => setShowShipmentModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    Shipment Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipment ID:</span>
                      <span className="font-medium font-mono">
                        {selectedShipment.id.substring(0, 12)}...
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Product:</span>
                      <span className="font-medium">
                        {selectedShipment.products?.product_name || "Unknown"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">From:</span>
                      <span className="font-medium">
                        {selectedShipment.from_user?.name || "Unknown"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">To:</span>
                      <span className="font-medium">
                        {selectedShipment.to_user?.name || "Unknown"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span>{getStatusBadge(selectedShipment.status)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expected Arrival:</span>
                      <span className="font-medium">
                        {selectedShipment.expected_arrival
                          ? new Date(
                              selectedShipment.expected_arrival
                            ).toLocaleDateString()
                          : "TBD"}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold mt-6 mb-4 text-gray-800">
                    Blockchain Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">MPC Transaction:</span>
                      <span className="font-medium font-mono text-sm">
                        {selectedShipment.mpc_tx_id?.substring(0, 12) || "N/A"}
                        ...
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Temp Key ID:</span>
                      <span className="font-medium font-mono text-sm">
                        {selectedShipment.temp_key_id?.substring(0, 12) ||
                          "N/A"}
                        ...
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    Timeline
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Requested:</span>
                      <span className="font-medium">
                        {new Date(
                          selectedShipment.requested_at
                        ).toLocaleString()}
                      </span>
                    </div>
                    {selectedShipment.approved_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Approved:</span>
                        <span className="font-medium">
                          {new Date(
                            selectedShipment.approved_at
                          ).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {selectedShipment.shipped_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipped:</span>
                        <span className="font-medium">
                          {new Date(
                            selectedShipment.shipped_at
                          ).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {selectedShipment.delivered_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivered:</span>
                        <span className="font-medium">
                          {new Date(
                            selectedShipment.delivered_at
                          ).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {selectedShipment.confirmed_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Confirmed:</span>
                        <span className="font-medium">
                          {new Date(
                            selectedShipment.confirmed_at
                          ).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold mt-6 mb-4 text-gray-800">
                    Product Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">RFID Tag:</span>
                      <span className="font-medium font-mono">
                        {selectedShipment.products?.rfid_tag || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Batch Number:</span>
                      <span className="font-medium">
                        {selectedShipment.products?.batch_no || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Location:</span>
                      <span className="font-medium">
                        {selectedShipment.products?.current_location ||
                          "Unknown"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setShowMapModal(true)}>
                  <MapPin className="h-4 w-4 mr-2" />
                  View on Map
                </Button>
                <Button onClick={() => setShowShipmentModal(false)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Shipment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="flex items-center text-gray-800">
                  <Plus className="h-6 w-6 mr-2 text-blue-500" />
                  Create New Shipment
                </CardTitle>
                <Button
                  variant="ghost"
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="product_id" className="text-gray-700">
                    Select Product
                  </Label>
                  <select
                    id="product_id"
                    name="product_id"
                    value={newShipment.product_id}
                    onChange={handleInputChange}
                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">
                      {products.length === 0
                        ? "Loading products..."
                        : `Select a product (${products.length} available)`}
                    </option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.product_name} -{" "}
                        {product.batch_no || product.batch_id} (
                        {product.rfid_tag})
                      </option>
                    ))}
                  </select>
                  {products.length === 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      No products available. Create a product first to enable
                      shipment creation.
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="to_party_wallet" className="text-gray-700">
                    Recipient
                  </Label>
                  <select
                    id="to_party_wallet"
                    name="to_party_wallet"
                    value={newShipment.to_party_wallet}
                    onChange={handleInputChange}
                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">
                      {users.length === 0
                        ? "Loading recipients..."
                        : `Select recipient (${users.length} available)`}
                    </option>
                    {users.map((user) => (
                      <option key={user.id} value={user.wallet_address}>
                        {user.name} ({user.wallet_address.substring(0, 10)}...)
                      </option>
                    ))}
                  </select>
                  {users.length === 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      No recipients available. Using mock data for
                      demonstration.
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="destination" className="text-gray-700">
                    Destination Address
                  </Label>
                  <Input
                    id="destination"
                    name="destination"
                    value={newShipment.destination}
                    onChange={handleInputChange}
                    placeholder="Enter destination address"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="expected_arrival" className="text-gray-700">
                    Expected Arrival Date
                  </Label>
                  <Input
                    id="expected_arrival"
                    name="expected_arrival"
                    type="datetime-local"
                    value={newShipment.expected_arrival}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  onClick={handleCreateShipment}
                  disabled={creating}
                >
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Shipment"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Shipments;
