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
  MapPin,
  Truck,
  Search,
  Filter,
  Eye,
  Calendar,
  Download,
  RefreshCw,
  Edit,
} from "lucide-react";

// Define types
interface Shipment {
  id: number;
  trackingId: string;
  productName: string;
  status: string;
  origin: string;
  destination: string;
  estimatedArrival: string;
  carrier: string;
  lastUpdate: string;
}

const Shipments = () => {
  const { isActive } = useWeb3();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [userRole, setUserRole] = useState("admin"); // Add user role state

  // Mock data for demonstration
  useEffect(() => {
    setShipments([
      {
        id: 1,
        trackingId: "TRK-001-ABC",
        productName: "Organic Coffee Beans",
        status: "In Transit",
        origin: "Seattle, WA",
        destination: "New York, NY",
        estimatedArrival: "2023-12-10",
        carrier: "FedEx",
        lastUpdate: "2023-12-01 14:30:00",
      },
      {
        id: 2,
        trackingId: "TRK-002-DEF",
        productName: "Premium Chocolate",
        status: "Delivered",
        origin: "San Francisco, CA",
        destination: "Los Angeles, CA",
        estimatedArrival: "2023-12-05",
        carrier: "UPS",
        lastUpdate: "2023-12-02 09:15:00",
      },
      {
        id: 3,
        trackingId: "TRK-003-GHI",
        productName: "Organic Honey",
        status: "Processing",
        origin: "Chicago, IL",
        destination: "Miami, FL",
        estimatedArrival: "2023-12-15",
        carrier: "DHL",
        lastUpdate: "2023-12-03 11:45:00",
      },
      {
        id: 4,
        trackingId: "TRK-004-JKL",
        productName: "Artisanal Cheese",
        status: "Shipped",
        origin: "Boston, MA",
        destination: "Atlanta, GA",
        estimatedArrival: "2023-12-12",
        carrier: "USPS",
        lastUpdate: "2023-12-04 16:20:00",
      },
      {
        id: 5,
        trackingId: "TRK-005-MNO",
        productName: "Cold-Pressed Olive Oil",
        status: "In Transit",
        origin: "Portland, OR",
        destination: "Dallas, TX",
        estimatedArrival: "2023-12-18",
        carrier: "FedEx",
        lastUpdate: "2023-12-05 10:45:00",
      },
    ]);
  }, []);

  // Refresh shipments data
  const refreshShipments = async () => {
    if (!isActive) {
      console.log("Wallet not connected");
      return;
    }

    try {
      // In a real implementation, you'd fetch actual shipment data from the blockchain
      console.log("Refreshing shipments data...");
    } catch (error) {
      console.error("Error refreshing shipments:", error);
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
      shipment.trackingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.productName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      shipment.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Format status badge
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "processing":
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
            Processing
          </Badge>
        );
      case "shipped":
        return (
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
            Shipped
          </Badge>
        );
      case "in transit":
        return (
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
            In Transit
          </Badge>
        );
      case "delivered":
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
            Delivered
          </Badge>
        );
      case "delayed":
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600">
            Delayed
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

  // View shipment details
  const viewShipmentDetails = (shipment: Shipment) => {
    // In a real implementation, this would open a modal with shipment details
    console.log("Viewing shipment details:", shipment);
  };

  // Check if user has permission to perform actions based on role
  const canPerformAction = (action: string) => {
    switch (userRole) {
      case "admin":
        return true;
      case "manufacturer":
        return ["view"].includes(action);
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
            Shipments
          </h1>
          <p className="text-gray-600 mt-2">
            Track and manage your supply chain shipments
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

      {/* Wallet connection warning */}
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
                  placeholder="Search by tracking ID or product name..."
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
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="in transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="delayed">Delayed</option>
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
            Shipment Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="text-gray-700 font-bold">ID</TableHead>
                  <TableHead className="text-gray-700 font-bold">
                    Tracking ID
                  </TableHead>
                  <TableHead className="text-gray-700 font-bold">
                    Product
                  </TableHead>
                  <TableHead className="text-gray-700 font-bold">
                    Status
                  </TableHead>
                  <TableHead className="text-gray-700 font-bold">
                    Origin
                  </TableHead>
                  <TableHead className="text-gray-700 font-bold">
                    Destination
                  </TableHead>
                  <TableHead className="text-gray-700 font-bold">
                    Est. Arrival
                  </TableHead>
                  <TableHead className="text-gray-700 font-bold">
                    Carrier
                  </TableHead>
                  <TableHead className="text-gray-700 font-bold text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShipments.length > 0 ? (
                  filteredShipments.map((shipment) => (
                    <TableRow key={shipment.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {shipment.id}
                      </TableCell>
                      <TableCell className="font-mono">
                        {shipment.trackingId}
                      </TableCell>
                      <TableCell>{shipment.productName}</TableCell>
                      <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                          {shipment.origin}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                          {shipment.destination}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                          {shipment.estimatedArrival}
                        </div>
                      </TableCell>
                      <TableCell>{shipment.carrier}</TableCell>
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
                          {canPerformAction("update") && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Update
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={9}
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
    </div>
  );
};

export default Shipments;
