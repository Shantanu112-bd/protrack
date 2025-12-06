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
  Activity,
  Thermometer,
  Droplets,
  Zap,
  Search,
  Download,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

// Define types
interface SensorData {
  id: number;
  productId: number;
  productName: string;
  sensorType: string;
  value: number;
  unit: string;
  timestamp: string;
  location: string;
  status: string;
}

interface Alert {
  id: number;
  sensorType: string;
  productId: number;
  productName: string;
  value: number;
  threshold: number;
  timestamp: string;
  severity: string;
}

const IoTMonitor = () => {
  const { isActive } = useWeb3();
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredData, setFilteredData] = useState<SensorData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [userRole, setUserRole] = useState("admin"); // Add user role state

  // Mock data for demonstration
  useEffect(() => {
    const mockSensorData: SensorData[] = [
      {
        id: 1,
        productId: 101,
        productName: "Organic Coffee Beans",
        sensorType: "Temperature",
        value: 22.5,
        unit: "°C",
        timestamp: "2023-12-01 14:30:00",
        location: "Warehouse A, New York",
        status: "normal",
      },
      {
        id: 2,
        productId: 102,
        productName: "Premium Chocolate",
        sensorType: "Humidity",
        value: 45.2,
        unit: "%",
        timestamp: "2023-12-01 14:35:00",
        location: "Store B, Los Angeles",
        status: "normal",
      },
      {
        id: 3,
        productId: 103,
        productName: "Organic Honey",
        sensorType: "Vibration",
        value: 0.3,
        unit: "g",
        timestamp: "2023-12-01 14:40:00",
        location: "Factory C, Chicago",
        status: "normal",
      },
      {
        id: 4,
        productId: 101,
        productName: "Organic Coffee Beans",
        sensorType: "Temperature",
        value: 25.8,
        unit: "°C",
        timestamp: "2023-12-01 14:45:00",
        location: "Warehouse A, New York",
        status: "warning",
      },
      {
        id: 5,
        productId: 104,
        productName: "Artisanal Cheese",
        sensorType: "Humidity",
        value: 52.1,
        unit: "%",
        timestamp: "2023-12-01 14:50:00",
        location: "Packaging Facility D, Boston",
        status: "warning",
      },
      {
        id: 6,
        productId: 105,
        productName: "Cold-Pressed Olive Oil",
        sensorType: "Vibration",
        value: 2.5,
        unit: "g",
        timestamp: "2023-12-01 14:55:00",
        location: "Distribution Center E, Miami",
        status: "alert",
      },
    ];

    const mockAlerts: Alert[] = [
      {
        id: 1,
        sensorType: "Vibration",
        productId: 105,
        productName: "Cold-Pressed Olive Oil",
        value: 2.5,
        threshold: 2.0,
        timestamp: "2023-12-01 14:55:00",
        severity: "alert",
      },
      {
        id: 2,
        sensorType: "Temperature",
        productId: 101,
        productName: "Organic Coffee Beans",
        value: 25.8,
        threshold: 25.0,
        timestamp: "2023-12-01 14:45:00",
        severity: "warning",
      },
      {
        id: 3,
        sensorType: "Humidity",
        productId: 104,
        productName: "Artisanal Cheese",
        value: 52.1,
        threshold: 50.0,
        timestamp: "2023-12-01 14:50:00",
        severity: "warning",
      },
    ];

    setSensorData(mockSensorData);
    setFilteredData(mockSensorData);
    setAlerts(mockAlerts);
  }, []);

  // Refresh IoT data
  const refreshIoTData = async () => {
    if (!isActive) {
      console.log("Wallet not connected");
      return;
    }

    try {
      // In a real implementation, you'd fetch actual IoT data from the blockchain
      console.log("Refreshing IoT data...");
    } catch (error) {
      console.error("Error refreshing IoT data:", error);
    }
  };

  // Export IoT data
  const exportIoTData = () => {
    // In a real app, this would export data to CSV/PDF
    console.log("Exporting IoT data...");
  };

  // Filter sensor data based on search term, type, and status
  useEffect(() => {
    let result = sensorData;

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (data) =>
          data.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          data.sensorType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (typeFilter !== "all") {
      result = result.filter((data) => data.sensorType === typeFilter);
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((data) => data.status === statusFilter);
    }

    setFilteredData(result);
  }, [sensorData, searchTerm, typeFilter, statusFilter]);

  // Format status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "normal":
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
            Normal
          </Badge>
        );
      case "warning":
        return (
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
            Warning
          </Badge>
        );
      case "alert":
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600">
            Alert
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

  // Format severity badge
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "warning":
        return (
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
            Warning
          </Badge>
        );
      case "alert":
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600">
            Alert
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gradient-to-r from-gray-300 to-gray-500 hover:from-gray-400 hover:to-gray-600">
            {severity}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            IoT Monitoring
          </h1>
          <p className="text-gray-600 mt-2">
            Real-time sensor data and alerts for your supply chain
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
            onClick={refreshIoTData}
            className="flex items-center bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={exportIoTData}
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
            <Activity className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800 font-medium">
              Wallet not connected - Connect to interact with blockchain
              features
            </span>
          </div>
        </div>
      )}

      {/* Sensor Data Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Thermometer className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Temperature Sensors</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    sensorData.filter(
                      (data) => data.sensorType === "Temperature"
                    ).length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Droplets className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Humidity Sensors</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    sensorData.filter((data) => data.sensorType === "Humidity")
                      .length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-amber-100 rounded-lg">
                <Zap className="h-6 w-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Vibration Sensors</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    sensorData.filter((data) => data.sensorType === "Vibration")
                      .length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
            Active Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length > 0 ? (
            <div className="rounded-md border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="text-gray-700 font-bold">
                      Sensor
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Product
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Value
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Threshold
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Severity
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Timestamp
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.map((alert) => (
                    <TableRow key={alert.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {alert.sensorType}
                      </TableCell>
                      <TableCell>{alert.productName}</TableCell>
                      <TableCell>
                        {alert.value}
                        {alert.sensorType === "Temperature" && "°C"}
                        {alert.sensorType === "Humidity" && "%"}
                        {alert.sensorType === "Vibration" && "g"}
                      </TableCell>
                      <TableCell>
                        {alert.threshold}
                        {alert.sensorType === "Temperature" && "°C"}
                        {alert.sensorType === "Humidity" && "%"}
                        {alert.sensorType === "Vibration" && "g"}
                      </TableCell>
                      <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                      <TableCell>{alert.timestamp}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p>No active alerts</p>
              <p className="text-sm mt-1">All sensors are operating normally</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sensor Data Table */}
      <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <Activity className="h-5 w-5 mr-2 text-blue-500" />
            Sensor Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <Label htmlFor="search" className="text-gray-700">
                Search
              </Label>
              <div className="relative mt-1">
                <Input
                  id="search"
                  type="text"
                  placeholder="Search by product or sensor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>
            <div>
              <Label htmlFor="type" className="text-gray-700">
                Sensor Type
              </Label>
              <select
                id="type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="Temperature">Temperature</option>
                <option value="Humidity">Humidity</option>
                <option value="Vibration">Vibration</option>
              </select>
            </div>
            <div>
              <Label htmlFor="status" className="text-gray-700">
                Status
              </Label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="normal">Normal</option>
                <option value="warning">Warning</option>
                <option value="alert">Alert</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setTypeFilter("all");
                  setStatusFilter("all");
                }}
                className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white"
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Sensor Data Table */}
          <div className="rounded-md border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="text-gray-700 font-bold">ID</TableHead>
                  <TableHead className="text-gray-700 font-bold">
                    Product
                  </TableHead>
                  <TableHead className="text-gray-700 font-bold">
                    Sensor
                  </TableHead>
                  <TableHead className="text-gray-700 font-bold">
                    Value
                  </TableHead>
                  <TableHead className="text-gray-700 font-bold">
                    Location
                  </TableHead>
                  <TableHead className="text-gray-700 font-bold">
                    Status
                  </TableHead>
                  <TableHead className="text-gray-700 font-bold">
                    Timestamp
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((data) => (
                    <TableRow key={data.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{data.id}</TableCell>
                      <TableCell>{data.productName}</TableCell>
                      <TableCell>{data.sensorType}</TableCell>
                      <TableCell>
                        {data.value}
                        {data.unit}
                      </TableCell>
                      <TableCell>{data.location}</TableCell>
                      <TableCell>{getStatusBadge(data.status)}</TableCell>
                      <TableCell>{data.timestamp}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-gray-500"
                    >
                      No sensor data found matching your criteria
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

export default IoTMonitor;
