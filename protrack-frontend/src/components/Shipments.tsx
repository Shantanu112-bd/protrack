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
} from "lucide-react";

// Define types
interface Shipment {
  id: number;
  shipmentId: string;
  origin: string;
  destination: string;
  carrierId: string;
  expectedETD: string;
  expectedETA: string;
  currentStatus: string;
  packingList: { productId: number; quantity: number }[];
  deviceId: string;
  events: ShipmentEvent[];
  insurancePolicy?: string;
  sla?: string;
  claimRecords?: string[];
}

interface ShipmentEvent {
  id: number;
  timestamp: string;
  location: string;
  eventType: string;
  signer: string;
}

const Shipments = () => {
  const { isActive } = useWeb3();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [userRole, setUserRole] = useState("admin");

  // Mock data for demonstration
  useEffect(() => {
    setShipments([
      {
        id: 1,
        shipmentId: "SHP-2023-001",
        origin: "Factory A, Chicago",
        destination: "Warehouse B, Los Angeles",
        carrierId: "CARRIER-001",
        expectedETD: "2023-12-01 08:00:00",
        expectedETA: "2023-12-05 16:00:00",
        currentStatus: "In Transit",
        packingList: [
          { productId: 1, quantity: 100 },
          { productId: 2, quantity: 50 },
        ],
        deviceId: "DEV-TRK-001",
        events: [
          {
            id: 1,
            timestamp: "2023-12-01 08:15:00",
            location: "Factory A, Chicago",
            eventType: "Departure",
            signer: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
          },
          {
            id: 2,
            timestamp: "2023-12-02 14:30:00",
            location: "Distribution Center, Denver",
            eventType: "Arrival",
            signer: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
          },
          {
            id: 3,
            timestamp: "2023-12-02 16:45:00",
            location: "Distribution Center, Denver",
            eventType: "Departure",
            signer: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
          },
        ],
        insurancePolicy: "POLICY-INS-001",
        sla: "2-day delivery guarantee",
        claimRecords: [],
      },
      {
        id: 2,
        shipmentId: "SHP-2023-002",
        origin: "Warehouse C, Miami",
        destination: "Store D, New York",
        carrierId: "CARRIER-002",
        expectedETD: "2023-12-03 10:00:00",
        expectedETA: "2023-12-06 14:00:00",
        currentStatus: "Prepared",
        packingList: [
          { productId: 3, quantity: 200 },
          { productId: 4, quantity: 75 },
        ],
        deviceId: "DEV-TRK-002",
        events: [
          {
            id: 1,
            timestamp: "2023-12-03 09:30:00",
            location: "Warehouse C, Miami",
            eventType: "Packing",
            signer: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
          },
        ],
      },
      {
        id: 3,
        shipmentId: "SHP-2023-003",
        origin: "Factory E, Seattle",
        destination: "Distribution Center F, Atlanta",
        carrierId: "CARRIER-003",
        expectedETD: "2023-12-04 07:00:00",
        expectedETA: "2023-12-08 18:00:00",
        currentStatus: "Delivered",
        packingList: [{ productId: 5, quantity: 150 }],
        deviceId: "DEV-TRK-003",
        events: [
          {
            id: 1,
            timestamp: "2023-12-04 07:15:00",
            location: "Factory E, Seattle",
            eventType: "Departure",
            signer: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
          },
          {
            id: 2,
            timestamp: "2023-12-06 12:30:00",
            location: "Customs Office, Chicago",
            eventType: "Customs Inspection",
            signer: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
          },
          {
            id: 3,
            timestamp: "2023-12-07 09:45:00",
            location: "Distribution Center F, Atlanta",
            eventType: "Arrival",
            signer: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
          },
          {
            id: 4,
            timestamp: "2023-12-07 10:30:00",
            location: "Distribution Center F, Atlanta",
            eventType: "Delivery",
            signer: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
          },
        ],
        insurancePolicy: "POLICY-INS-002",
        sla: "Ground shipping - 4 day delivery",
        claimRecords: ["CLAIM-001"],
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
      // Get provider and contract instance
      // const provider = getProvider(); // Commented out to avoid linter error
      // In a real implementation, you'd call contract methods here

      // For now, we'll use a simple approach to fetch some shipments
      // In a real implementation, you'd want to track all shipments
      const shipmentIds = [1, 2, 3]; // Sample shipment IDs
      const fetchedShipments: Shipment[] = [];

      for (const id of shipmentIds) {
        try {
          // Get shipment data
          // This is a mock implementation - in reality, you'd call the appropriate contract methods
          const shipmentData = {
            id,
            shipmentId: `SHP-2023-${id.toString().padStart(3, "0")}`,
            origin: "Sample Origin",
            destination: "Sample Destination",
            carrierId: "CARRIER-001",
            expectedETD: "2023-12-01 08:00:00",
            expectedETA: "2023-12-05 16:00:00",
            currentStatus: "In Transit",
            packingList: [{ productId: id, quantity: 100 }],
            deviceId: `DEV-TRK-${id.toString().padStart(3, "0")}`,
            events: [],
          };

          fetchedShipments.push(shipmentData as Shipment);
        } catch (error) {
          console.error(`Error fetching shipment ${id}:`, error);
        }
      }

      setShipments(fetchedShipments);
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
      shipment.shipmentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.carrierId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      shipment.currentStatus.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Format status badge
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "prepared":
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
            Prepared
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
      case "cancelled":
        return (
          <Badge className="bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800">
            Cancelled
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
                <option value="prepared">Prepared</option>
                <option value="in transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="delayed">Delayed</option>
                <option value="cancelled">Cancelled</option>
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
                    Carrier
                  </TableHead>
                  <TableHead className="text-gray-700 font-bold">
                    Device
                  </TableHead>
                  <TableHead className="text-gray-700 font-bold">
                    Timeline
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
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {shipment.shipmentId}
                          </div>
                          <div className="text-sm text-gray-500">
                            ETD: {shipment.expectedETD}
                          </div>
                          <div className="text-sm text-gray-500">
                            ETA: {shipment.expectedETA}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                          <span className="text-sm">
                            {shipment.origin.split(",")[0]}
                          </span>
                        </div>
                        <div className="flex items-center mt-1">
                          <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                          <span className="text-sm">
                            {shipment.destination.split(",")[0]}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(shipment.currentStatus)}
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm">
                          {shipment.carrierId}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm">
                          {shipment.deviceId}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                          <span className="text-sm">
                            {shipment.events.length} events
                          </span>
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
                          {canPerformAction("update") && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center"
                            >
                              <Truck className="h-4 w-4 mr-1" />
                              Track
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
                      No shipments found matching your criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Packing Lists Section */}
      <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <Package className="h-5 w-5 mr-2 text-blue-500" />
            Packing Lists
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shipments.slice(0, 3).map((shipment) => (
              <Card key={shipment.id} className="border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {shipment.shipmentId}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {shipment.packingList.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span>Product #{item.productId}</span>
                        <span className="font-medium">
                          Qty: {item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-2 border-t border-gray-200">
                    <div className="flex justify-between font-medium">
                      <span>Total Items:</span>
                      <span>
                        {shipment.packingList.reduce(
                          (sum, item) => sum + item.quantity,
                          0
                        )}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Shipments;
