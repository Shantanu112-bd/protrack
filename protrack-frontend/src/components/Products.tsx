import React, { useState, useEffect } from "react";
import { useWeb3 } from "../contexts/web3ContextTypes";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import {
  Package,
  Search,
  Filter,
  Eye,
  Download,
  RefreshCw,
  Edit,
} from "lucide-react";
import { getProTrackContract, getProvider } from "../contracts/contractConfig";

// Define types
interface Product {
  id: number;
  rfid: string;
  barcode: string;
  name: string;
  batch: string;
  status: string;
  owner: string;
  location: string;
  lastUpdate: string;
}

const Products = () => {
  const { isActive } = useWeb3();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [userRole, setUserRole] = useState("admin"); // Add user role state

  // Mock data for demonstration
  useEffect(() => {
    setProducts([
      {
        id: 1,
        rfid: "RFID-001-ABC",
        barcode: "BARCODE-12345",
        name: "Organic Coffee Beans",
        batch: "BATCH-2023-001",
        status: "In Transit",
        owner: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
        location: "Warehouse A, New York",
        lastUpdate: "2023-12-01 14:30:00",
      },
      {
        id: 2,
        rfid: "RFID-002-DEF",
        barcode: "BARCODE-67890",
        name: "Premium Chocolate",
        batch: "BATCH-2023-002",
        status: "Received",
        owner: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
        location: "Store B, Los Angeles",
        lastUpdate: "2023-12-02 09:15:00",
      },
      {
        id: 3,
        rfid: "RFID-003-GHI",
        barcode: "BARCODE-11111",
        name: "Organic Honey",
        batch: "BATCH-2023-003",
        status: "Manufactured",
        owner: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
        location: "Factory C, Chicago",
        lastUpdate: "2023-12-03 11:45:00",
      },
      {
        id: 4,
        rfid: "RFID-004-JKL",
        barcode: "BARCODE-22222",
        name: "Artisanal Cheese",
        batch: "BATCH-2023-004",
        status: "Packaged",
        owner: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
        location: "Packaging Facility D, Boston",
        lastUpdate: "2023-12-04 16:20:00",
      },
      {
        id: 5,
        rfid: "RFID-005-MNO",
        barcode: "BARCODE-33333",
        name: "Cold-Pressed Olive Oil",
        batch: "BATCH-2023-005",
        status: "In Transit",
        owner: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
        location: "Distribution Center E, Miami",
        lastUpdate: "2023-12-05 10:45:00",
      },
    ]);
  }, []);

  // Refresh products data
  const refreshProducts = async () => {
    if (!isActive) {
      console.log("Wallet not connected");
      return;
    }

    try {
      // Get provider and contract instance
      const provider = getProvider();
      const contract = getProTrackContract(provider);

      // For now, we'll use a simple approach to fetch some products
      // In a real implementation, you'd want to track all minted products
      const productIds = [1, 2, 3, 4, 5]; // Sample product IDs
      const fetchedProducts: Product[] = [];

      for (const id of productIds) {
        try {
          // Get product data
          const productData = await contract.getProduct(id);

          // Convert contract data to UI format
          const product: Product = {
            id: Number(id),
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
          };

          fetchedProducts.push(product);
        } catch (error) {
          console.error(`Error fetching product ${id}:`, error);
        }
      }

      setProducts(fetchedProducts);
    } catch (error) {
      console.error("Error refreshing products:", error);
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

  // Export products data
  const exportProducts = () => {
    // In a real app, this would export data to CSV/PDF
    console.log("Exporting products data...");
  };

  // Filter products based on search term and status
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.rfid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      product.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
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
    // In a real implementation, this would open a modal with product details
    console.log("Viewing product details:", product);
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
                Search Products
              </Label>
              <div className="relative mt-1">
                <Input
                  id="search"
                  type="text"
                  placeholder="Search by name, RFID, or barcode..."
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
                <option value="recalled">Recalled</option>
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
                    Batch
                  </TableHead>
                  <TableHead className="text-gray-700 font-bold">
                    Status
                  </TableHead>
                  <TableHead className="text-gray-700 font-bold">
                    Owner
                  </TableHead>
                  <TableHead className="text-gray-700 font-bold">
                    Location
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
                        {product.id}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500">
                            RFID: {product.rfid}
                          </div>
                          <div className="text-sm text-gray-500">
                            Barcode: {product.barcode}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{product.batch}</TableCell>
                      <TableCell>{getStatusBadge(product.status)}</TableCell>
                      <TableCell>
                        <div className="font-mono text-sm">
                          {product.owner.substring(0, 6)}...
                          {product.owner.substring(product.owner.length - 4)}
                        </div>
                      </TableCell>
                      <TableCell>{product.location}</TableCell>
                      <TableCell>{product.lastUpdate}</TableCell>
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
                          {canPerformAction("update") && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
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
    </div>
  );
};

export default Products;
