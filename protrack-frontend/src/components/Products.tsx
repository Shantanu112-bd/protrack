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
import { dashboardService } from "../services/dashboardService";
import { supabase, trackingService } from "../services/supabase";
import { integratedSupplyChainService } from "../services/integratedSupplyChainService";
import { fallbackService } from "../services/fallbackService";
import { mintingService } from "../services/mintingService";
import { ProductInsert } from "../types/database-override";
import {
  Package,
  Search,
  Filter,
  Eye,
  Download,
  RefreshCw,
  Plus,
  MapPin,
  User,
  Hash,
  Link,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Globe,
  Leaf,
  Loader2,
} from "lucide-react";

// Define types matching actual Supabase response
interface Product {
  id: string;
  rfid_tag: string;
  barcode?: string;
  product_hash?: string;
  product_name?: string;
  batch_id?: string; // Supabase returns batch_id, not batch_no
  batch_no?: string; // Keep for compatibility
  mfg_date?: string;
  exp_date?: string;
  expiry_date?: string; // Supabase might return expiry_date
  token_id?: string;
  owner_wallet?: string;
  manufacturer_id?: string;
  current_custodian_id?: string;
  status: string;
  current_location?: string;
  max_temperature?: number;
  min_temperature?: number;
  max_humidity?: number;
  min_humidity?: number;
  max_shock?: number;
  destination?: string;
  expected_arrival?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
  // Joined fields
  manufacturer?: { name: string; wallet_address: string };
  current_custodian?: { name: string; wallet_address: string };
  // Additional UI fields
  category?: string;
  weight?: number;
  dimensions?: string;
  price?: number;
  currency?: string;
  qualityScore?: number;
  sustainabilityRating?: number;
  isTokenized: boolean;
}

interface OwnershipEvent {
  id: string;
  eventType: string;
  timestamp: string;
  location: string;
  actor: string;
  transactionHash?: string;
}

const Products = () => {
  const { isActive, account } = useWeb3();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [minting, setMinting] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [userRole, setUserRole] = useState("manufacturer");
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    rfid_tag: "",
    product_name: "",
    batch_no: "",
    mfg_date: "",
    exp_date: "",
    current_location: "",
    category: "",
    weight: 0,
    dimensions: "",
    price: 0,
    currency: "USD",
    max_temperature: 25,
    min_temperature: 2,
    max_humidity: 80,
    min_humidity: 20,
  });

  // Load products from database with fallback support
  const loadProducts = async () => {
    try {
      setLoading(true);

      // Use the enhanced tracking service with fallback
      const data = await trackingService.getAllProducts();

      const formattedProducts: Product[] =
        data?.map((product) => ({
          ...product,
          isTokenized: !!product.token_id,
          category: product.category || "General",
          weight: product.weight || 1000, // Default 1kg
          dimensions: product.dimensions || "Standard",
          price: product.price || 100, // Default $100
          currency: product.currency || "USD",
          qualityScore: product.qualityScore || 80,
          sustainabilityRating: product.sustainabilityRating || 70,
        })) || [];

      setProducts(formattedProducts);

      // Update connection status based on success
      const connectionStatus = fallbackService.getConnectionStatus();
      if (!connectionStatus.supabaseConnected && formattedProducts.length > 0) {
        console.log("📱 Running in offline mode with cached data");
      }
    } catch (error) {
      console.error("Error loading products:", error);

      // If all else fails, show mock data
      const mockProducts = fallbackService.getMockProducts();
      const formattedMockProducts: Product[] = mockProducts.map((product) => ({
        ...product,
        isTokenized: !!product.token_id,
        category: product.category || "General",
        weight: product.weight || 1000,
        dimensions: product.dimensions || "Standard",
        price: product.price || 100,
        currency: product.currency || "USD",
        qualityScore: product.qualityScore || 80,
        sustainabilityRating: product.sustainabilityRating || 70,
      }));

      setProducts(formattedMockProducts);
      console.log("📱 Using fallback mock data due to connection issues");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();

    // Add online/offline event listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Refresh products data
  const refreshProducts = async () => {
    await loadProducts();
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

  // Export products data
  const exportProducts = () => {
    // In a real app, this would export data to CSV/PDF
    console.log("Exporting products data...");
  };

  // Filter products based on search term and status
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.rfid_tag?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.batch_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      product.status?.toLowerCase() === statusFilter.toLowerCase();

    const matchesCategory =
      categoryFilter === "all" ||
      product.category?.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesCategory;
  });

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

  // View product details
  const viewProductDetails = (product: Product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  // Mint product as NFT/SBT using enhanced minting service
  const mintProduct = async (product: Product) => {
    if (!isActive || !account) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      setMinting(product.id);

      // Use enhanced minting service
      const result = await mintingService.mintProduct(
        {
          id: product.id,
          product_name: product.product_name || "",
          rfid_tag: product.rfid_tag,
          batch_no: product.batch_no || product.batch_id || "",
          mfg_date: product.mfg_date || "",
          exp_date: product.exp_date || product.expiry_date || "",
          owner_wallet: account,
          current_location: product.current_location,
        },
        account
      );

      if (result.success) {
        // Update local state
        setProducts(
          products.map((p) =>
            p.id === product.id
              ? { ...p, isTokenized: true, token_id: result.tokenId }
              : p
          )
        );

        alert(
          `Product minted successfully!\nToken ID: ${result.tokenId}\nTransaction: ${result.transactionHash}`
        );

        // Refresh products to get updated data
        await loadProducts();
      } else {
        throw new Error(result.error || "Minting failed");
      }
    } catch (error: any) {
      console.error("Error minting product:", error);
      alert(`Failed to mint product: ${error.message || "Please try again"}`);
    } finally {
      setMinting(null);
    }
  };

  // View provenance timeline
  const viewProvenance = (product: Product) => {
    // In a real implementation, this would show the full ownership history
    console.log("Viewing provenance for:", product);
  };

  // Create new product
  const createProduct = () => {
    setShowCreateModal(true);
  };

  // Handle create product form submission
  const handleCreateProduct = async () => {
    if (!account) {
      alert("Please connect your wallet first");
      return;
    }

    // Validate required fields
    if (!newProduct.rfid_tag.trim()) {
      alert("RFID Tag is required");
      return;
    }
    if (!newProduct.product_name.trim()) {
      alert("Product Name is required");
      return;
    }
    if (!newProduct.batch_no.trim()) {
      alert("Batch Number is required");
      return;
    }
    if (!newProduct.mfg_date) {
      alert("Manufacturing Date is required");
      return;
    }
    if (!newProduct.exp_date) {
      alert("Expiry Date is required");
      return;
    }
    if (!newProduct.current_location.trim()) {
      alert("Current Location is required");
      return;
    }

    try {
      setCreating(true);

      // Check connection status and inform user
      const connectionStatus = fallbackService.getConnectionStatus();
      if (!connectionStatus.isOnline) {
        console.log("📱 Creating product in offline mode");
      } else if (!connectionStatus.supabaseConnected) {
        console.log("📱 Creating product with fallback service");
      } else {
        console.log("✅ Creating product with full connectivity");
      }

      console.log("Creating product with data:", {
        rfid_tag: newProduct.rfid_tag,
        product_name: newProduct.product_name,
        batch_no: newProduct.batch_no,
        mfg_date: newProduct.mfg_date,
        exp_date: newProduct.exp_date,
        owner_wallet: account,
        current_location: newProduct.current_location,
      });

      // Create product using enhanced service with fallback
      const productData = {
        rfid_tag: newProduct.rfid_tag,
        product_name: newProduct.product_name,
        batch_no: newProduct.batch_no,
        mfg_date: newProduct.mfg_date,
        exp_date: newProduct.exp_date,
        owner_wallet: account,
        status: "manufactured",
        current_location: newProduct.current_location,
        // Include optional fields
        max_temperature: newProduct.max_temperature
          ? parseFloat(newProduct.max_temperature.toString())
          : undefined,
        min_temperature: newProduct.min_temperature
          ? parseFloat(newProduct.min_temperature.toString())
          : undefined,
        max_humidity: newProduct.max_humidity
          ? parseFloat(newProduct.max_humidity.toString())
          : undefined,
        min_humidity: newProduct.min_humidity
          ? parseFloat(newProduct.min_humidity.toString())
          : undefined,
      };

      console.log("Creating product with enhanced service:", productData);

      // Use the enhanced tracking service with automatic fallback
      const data = await trackingService.createProduct(productData);

      console.log("Product created successfully:", data);

      // Check if we're in offline mode and inform user
      const finalConnectionStatus = fallbackService.getConnectionStatus();
      if (!finalConnectionStatus.supabaseConnected) {
        console.log(
          "📱 Product created in offline mode - will sync when connection restored"
        );
      }

      // Try to update with temperature/humidity fields if they were provided
      if (
        newProduct.max_temperature ||
        newProduct.min_temperature ||
        newProduct.max_humidity ||
        newProduct.min_humidity
      ) {
        try {
          const tempUpdateData: any = {};
          if (newProduct.max_temperature) {
            tempUpdateData.max_temperature = parseFloat(
              newProduct.max_temperature.toString()
            );
          }
          if (newProduct.min_temperature) {
            tempUpdateData.min_temperature = parseFloat(
              newProduct.min_temperature.toString()
            );
          }
          if (newProduct.max_humidity) {
            tempUpdateData.max_humidity = parseFloat(
              newProduct.max_humidity.toString()
            );
          }
          if (newProduct.min_humidity) {
            tempUpdateData.min_humidity = parseFloat(
              newProduct.min_humidity.toString()
            );
          }

          await supabase
            .from("products")
            .update(tempUpdateData)
            .eq("id", data.id);

          console.log("Temperature/humidity data updated successfully");
        } catch (tempError) {
          console.warn(
            "Could not update temperature/humidity data:",
            tempError
          );
          // Don't fail the entire operation for this
        }
      }

      // Refresh products list
      await loadProducts();

      // Reset form and close modal
      setShowCreateModal(false);
      setNewProduct({
        rfid_tag: "",
        product_name: "",
        batch_no: "",
        mfg_date: "",
        exp_date: "",
        current_location: "",
        category: "",
        weight: 0,
        dimensions: "",
        price: 0,
        currency: "USD",
        max_temperature: 25,
        min_temperature: 2,
        max_humidity: 80,
        min_humidity: 20,
      });

      alert("Product created successfully!");
    } catch (error) {
      console.error("Error creating product:", error);

      // More detailed error message with user-friendly suggestions
      let errorMessage = "Failed to create product. ";
      if (error instanceof Error) {
        errorMessage += error.message;

        // Add helpful suggestions based on error type
        if (error.message.includes("Network connection failed")) {
          errorMessage += "\n\nTroubleshooting tips:\n";
          errorMessage += "• Check your internet connection\n";
          errorMessage += "• Try refreshing the page\n";
          errorMessage += "• Disable VPN if using one\n";
          errorMessage += "• Try again in a few moments";
        } else if (error.message.includes("RFID tag already exists")) {
          errorMessage +=
            "\n\nSolution: Click the 'Generate' button to create a unique RFID tag.";
        } else if (error.message.includes("required fields")) {
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

  // Handle input change for new product form
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setNewProduct({
      ...newProduct,
      [name]: value,
    });
  };

  // Check if user has permission to perform actions based on role
  const canPerformAction = (action: string) => {
    switch (userRole) {
      case "admin":
        return true;
      case "manufacturer":
        return ["view", "create"].includes(action);
      case "transporter":
        return ["view", "update"].includes(action);
      case "retailer":
        return ["view"].includes(action);
      case "consumer":
        return ["view"].includes(action);
      default:
        return false;
    }
  };

  // Get quality score badge
  const getQualityScoreBadge = (score: number) => {
    if (score >= 90) {
      return (
        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500">
          <CheckCircle className="h-3 w-3 mr-1" />
          Excellent ({score})
        </Badge>
      );
    } else if (score >= 75) {
      return (
        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
          <TrendingUp className="h-3 w-3 mr-1" />
          Good ({score})
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-gradient-to-r from-red-500 to-rose-500">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Needs Attention ({score})
        </Badge>
      );
    }
  };

  // Get sustainability badge
  const getSustainabilityBadge = (rating: number) => {
    if (rating >= 85) {
      return (
        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500">
          <Leaf className="h-3 w-3 mr-1" />
          Eco-Friendly ({rating})
        </Badge>
      );
    } else if (rating >= 70) {
      return (
        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
          <Globe className="h-3 w-3 mr-1" />
          Moderate ({rating})
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-gradient-to-r from-gray-500 to-gray-700">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Low ({rating})
        </Badge>
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Products
          </h1>
          <p className="text-gray-600 mt-2">
            Manage and track your supply chain products
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
            onClick={createProduct}
            className="flex items-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Product
          </Button>
          <Button
            onClick={refreshProducts}
            className="flex items-center bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={exportProducts}
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
            <Package className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800 font-medium">
              Wallet not connected - Connect to interact with blockchain
              features
            </span>
          </div>
        </div>
      )}

      {!isOnline && (
        <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-2xl p-4 text-center shadow-lg">
          <div className="flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800 font-medium">
              No internet connection - Running in offline mode
            </span>
          </div>
        </div>
      )}

      {isOnline && !fallbackService.getConnectionStatus().supabaseConnected && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Package className="h-5 w-5 text-blue-600 mr-2" />
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search" className="text-gray-700">
                Search Products
              </Label>
              <div className="relative mt-1">
                <Input
                  id="search"
                  type="text"
                  placeholder="Search by name, RFID, barcode..."
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
                <option value="manufactured">Manufactured</option>
                <option value="packaged">Packaged</option>
                <option value="in transit">In Transit</option>
                <option value="received">Received</option>
                <option value="sold">Sold</option>
                <option value="warehoused">Warehoused</option>
                <option value="delivered">Delivered</option>
                <option value="returned">Returned</option>
                <option value="recalled">Recalled</option>
              </select>
            </div>
            <div>
              <Label htmlFor="category" className="text-gray-700">
                Filter by Category
              </Label>
              <select
                id="category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="beverages">Beverages</option>
                <option value="confectionery">Confectionery</option>
                <option value="sweeteners">Sweeteners</option>
                <option value="general">General</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setCategoryFilter("all");
                }}
                className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <Package className="h-5 w-5 mr-2 text-blue-500" />
            Product Inventory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="text-gray-700 font-bold">ID</TableHead>
                  <TableHead className="text-gray-700 font-bold">
                    Product
                  </TableHead>
                  <TableHead className="text-gray-700 font-bold">
                    Category
                  </TableHead>
                  <TableHead className="text-gray-700 font-bold">
                    Batch/SKU
                  </TableHead>
                  <TableHead className="text-gray-700 font-bold">
                    Lifecycle
                  </TableHead>
                  <TableHead className="text-gray-700 font-bold">
                    Status
                  </TableHead>
                  <TableHead className="text-gray-700 font-bold">
                    Quality
                  </TableHead>
                  <TableHead className="text-gray-700 font-bold">
                    Sustainability
                  </TableHead>
                  <TableHead className="text-gray-700 font-bold">
                    Token
                  </TableHead>
                  <TableHead className="text-gray-700 font-bold">
                    Price
                  </TableHead>
                  <TableHead className="text-gray-700 font-bold">
                    Owner
                  </TableHead>
                  <TableHead className="text-gray-700 font-bold">
                    Last Update
                  </TableHead>
                  <TableHead className="text-gray-700 font-bold text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {product.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {product.product_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            RFID: {product.rfid_tag}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500">
                          {product.category || "General"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">
                            {product.batch_id || product.batch_no}
                          </div>
                          <div className="text-xs text-gray-500">
                            {product.mfg_date}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
                          {product.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(product.status)}</TableCell>
                      <TableCell>
                        {getQualityScoreBadge(product.qualityScore || 80)}
                      </TableCell>
                      <TableCell>
                        {getSustainabilityBadge(
                          product.sustainabilityRating || 70
                        )}
                      </TableCell>
                      <TableCell>
                        {product.isTokenized ? (
                          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500">
                            <Hash className="h-3 w-3 mr-1" />#{product.token_id}
                          </Badge>
                        ) : (
                          <Badge className="bg-gradient-to-r from-gray-500 to-gray-700">
                            Not Minted
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {product.currency || "USD"}{" "}
                          {(product.price || 0).toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm">
                          {product.owner_wallet?.substring(0, 6)}...
                          {product.owner_wallet?.substring(
                            product.owner_wallet.length - 4
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(product.updated_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            onClick={() => viewProductDetails(product)}
                            variant="outline"
                            size="sm"
                            className="flex items-center"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            onClick={() => viewProvenance(product)}
                            variant="outline"
                            size="sm"
                            className="flex items-center"
                          >
                            <Package className="h-4 w-4 mr-1" />
                            Provenance
                          </Button>
                          {!product.isTokenized && (
                            <Button
                              onClick={() => mintProduct(product)}
                              variant="outline"
                              size="sm"
                              className="flex items-center"
                              disabled={minting === product.id}
                            >
                              {minting === product.id ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <Package className="h-4 w-4 mr-1" />
                              )}
                              {minting === product.id ? "Minting..." : "Mint"}
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
                      No products found matching your criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Product Detail Modal */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="flex items-center text-gray-800">
                  <Package className="h-6 w-6 mr-2 text-blue-500" />
                  Product Details: {selectedProduct.product_name}
                </CardTitle>
                <Button
                  variant="ghost"
                  onClick={() => setShowProductModal(false)}
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
                    Basic Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Product ID:</span>
                      <span className="font-medium">{selectedProduct.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">SKU:</span>
                      <span className="font-medium">
                        {selectedProduct.batch_id || selectedProduct.batch_no}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500">
                        {selectedProduct.category}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Batch ID:</span>
                      <span className="font-medium">
                        {selectedProduct.batch_id || selectedProduct.batch_no}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Manufacturer:</span>
                      <span className="font-medium">
                        {selectedProduct.manufacturer_id}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Supplier:</span>
                      <span className="font-medium">
                        {selectedProduct.metadata?.supplier || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Origin Country:</span>
                      <span className="font-medium">
                        {selectedProduct.metadata?.originCountry || "N/A"}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold mt-6 mb-4 text-gray-800">
                    Lifecycle Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      {getStatusBadge(selectedProduct.status)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lifecycle State:</span>
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
                        {selectedProduct.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Manufacture Date:</span>
                      <span className="font-medium">
                        {selectedProduct.mfg_date}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expiry Date:</span>
                      <span className="font-medium">
                        {selectedProduct.exp_date}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    Technical Specifications
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Weight:</span>
                      <span className="font-medium">
                        {selectedProduct.weight} kg
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dimensions:</span>
                      <span className="font-medium">
                        {selectedProduct.dimensions}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Temperature Requirement:
                      </span>
                      <span className="font-medium">
                        {selectedProduct.metadata?.temperatureRequirement ||
                          "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Storage Condition:</span>
                      <span className="font-medium">
                        {selectedProduct.metadata?.storageCondition || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium">
                        {selectedProduct.currency}{" "}
                        {selectedProduct.price.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold mt-6 mb-4 text-gray-800">
                    Quality Metrics
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quality Score:</span>
                      {getQualityScoreBadge(selectedProduct.qualityScore)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Sustainability Rating:
                      </span>
                      {getSustainabilityBadge(
                        selectedProduct.sustainabilityRating
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold mt-6 mb-4 text-gray-800">
                    Blockchain Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tokenized:</span>
                      {selectedProduct.isTokenized ? (
                        <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500">
                          Yes (#{selectedProduct.token_id})
                        </Badge>
                      ) : (
                        <Badge className="bg-gradient-to-r from-gray-500 to-gray-700">
                          No
                        </Badge>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">RFID:</span>
                      <span className="font-mono text-sm">
                        {selectedProduct.rfid_tag}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Barcode:</span>
                      <span className="font-mono text-sm">
                        {selectedProduct.barcode || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Product Hash:</span>
                      <span className="font-mono text-sm truncate">
                        {selectedProduct.product_hash || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">QR Code:</span>
                      <span className="font-mono text-sm">
                        {selectedProduct.metadata?.qrCode || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  Ownership History
                </h3>
                <div className="border border-gray-200 rounded-lg">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead>Event</TableHead>
                        <TableHead>Date/Time</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Actor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(selectedProduct.metadata?.ownershipHistory || []).map(
                        (event: OwnershipEvent) => (
                          <TableRow key={event.id}>
                            <TableCell className="font-medium">
                              {event.eventType}
                            </TableCell>
                            <TableCell>{event.timestamp}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                                {event.location}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <User className="h-4 w-4 text-gray-500 mr-1" />
                                {event.actor}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => viewProvenance(selectedProduct)}
                >
                  <Link className="h-4 w-4 mr-2" />
                  View Full Provenance
                </Button>
                <Button onClick={() => setShowProductModal(false)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Product Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="flex items-center text-gray-800">
                  <Plus className="h-6 w-6 mr-2 text-blue-500" />
                  Create New Product
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="product_name" className="text-gray-700">
                      Product Name
                    </Label>
                    <Input
                      id="product_name"
                      name="product_name"
                      value={newProduct.product_name}
                      onChange={handleInputChange}
                      placeholder="Enter product name"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category" className="text-gray-700">
                      Category
                    </Label>
                    <select
                      id="category"
                      name="category"
                      value={newProduct.category}
                      onChange={handleInputChange}
                      className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select category</option>
                      <option value="beverages">Beverages</option>
                      <option value="confectionery">Confectionery</option>
                      <option value="sweeteners">Sweeteners</option>
                      <option value="pharmaceuticals">Pharmaceuticals</option>
                      <option value="electronics">Electronics</option>
                      <option value="general">General</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rfid_tag" className="text-gray-700">
                      RFID Tag
                    </Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="rfid_tag"
                        name="rfid_tag"
                        value={newProduct.rfid_tag}
                        onChange={handleInputChange}
                        placeholder="Enter RFID tag"
                        className="flex-1"
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const timestamp = Date.now();
                          const randomId = Math.random()
                            .toString(36)
                            .substring(2, 8);
                          const generatedRFID = `RFID_${timestamp}_${randomId}`;
                          setNewProduct({
                            ...newProduct,
                            rfid_tag: generatedRFID,
                          });
                        }}
                        className="px-3"
                      >
                        Generate
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="batch_no" className="text-gray-700">
                      Batch Number
                    </Label>
                    <Input
                      id="batch_no"
                      name="batch_no"
                      value={newProduct.batch_no}
                      onChange={handleInputChange}
                      placeholder="Enter batch number"
                      className="mt-1"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="mfg_date" className="text-gray-700">
                      Manufacturing Date
                    </Label>
                    <Input
                      id="mfg_date"
                      name="mfg_date"
                      type="date"
                      value={newProduct.mfg_date}
                      onChange={handleInputChange}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="exp_date" className="text-gray-700">
                      Expiry Date
                    </Label>
                    <Input
                      id="exp_date"
                      name="exp_date"
                      type="date"
                      value={newProduct.exp_date}
                      onChange={handleInputChange}
                      className="mt-1"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="current_location" className="text-gray-700">
                    Current Location
                  </Label>
                  <Input
                    id="current_location"
                    name="current_location"
                    value={newProduct.current_location}
                    onChange={handleInputChange}
                    placeholder="Enter current location"
                    className="mt-1"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price" className="text-gray-700">
                      Price
                    </Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      value={newProduct.price}
                      onChange={handleInputChange}
                      placeholder="Enter price"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency" className="text-gray-700">
                      Currency
                    </Label>
                    <select
                      id="currency"
                      name="currency"
                      value={newProduct.currency}
                      onChange={handleInputChange}
                      className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="weight" className="text-gray-700">
                      Weight (kg)
                    </Label>
                    <Input
                      id="weight"
                      name="weight"
                      type="number"
                      value={newProduct.weight}
                      onChange={handleInputChange}
                      placeholder="Enter weight"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dimensions" className="text-gray-700">
                      Dimensions
                    </Label>
                    <Input
                      id="dimensions"
                      name="dimensions"
                      value={newProduct.dimensions}
                      onChange={handleInputChange}
                      placeholder="e.g., 10x10x10 cm"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="max_temperature" className="text-gray-700">
                      Max Temperature (°C)
                    </Label>
                    <Input
                      id="max_temperature"
                      name="max_temperature"
                      type="number"
                      value={newProduct.max_temperature}
                      onChange={handleInputChange}
                      placeholder="25"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="min_temperature" className="text-gray-700">
                      Min Temperature (°C)
                    </Label>
                    <Input
                      id="min_temperature"
                      name="min_temperature"
                      type="number"
                      value={newProduct.min_temperature}
                      onChange={handleInputChange}
                      placeholder="2"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="max_humidity" className="text-gray-700">
                      Max Humidity (%)
                    </Label>
                    <Input
                      id="max_humidity"
                      name="max_humidity"
                      type="number"
                      value={newProduct.max_humidity}
                      onChange={handleInputChange}
                      placeholder="80"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="min_humidity" className="text-gray-700">
                      Min Humidity (%)
                    </Label>
                    <Input
                      id="min_humidity"
                      name="min_humidity"
                      type="number"
                      value={newProduct.min_humidity}
                      onChange={handleInputChange}
                      placeholder="20"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  onClick={handleCreateProduct}
                  disabled={
                    creating ||
                    !isOnline ||
                    !account ||
                    !newProduct.product_name ||
                    !newProduct.rfid_tag ||
                    !newProduct.batch_no
                  }
                  title={
                    !isOnline
                      ? "No internet connection"
                      : !account
                      ? "Please connect your wallet"
                      : ""
                  }
                >
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : !isOnline ? (
                    <>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Offline
                    </>
                  ) : !account ? (
                    <>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Connect Wallet
                    </>
                  ) : (
                    "Create Product"
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

export default Products;
