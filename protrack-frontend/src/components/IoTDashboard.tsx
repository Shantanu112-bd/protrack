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
  Thermometer,
  Droplets,
  MapPin,
  Zap,
  Wifi,
  Battery,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Plus,
  Eye,
  TrendingUp,
  TrendingDown,
  Activity,
  Loader2,
} from "lucide-react";

interface IoTData {
  id: string;
  product_id: string;
  device_id?: string;
  sensor_type?: string;
  value?: number;
  unit?: string;
  gps_lat?: number;
  gps_lng?: number;
  temperature?: number;
  humidity?: number;
  shock?: number;
  tamper?: boolean;
  light_exposure?: number;
  battery_level?: number;
  signal_strength?: number;
  custom_data?: any;
  recorded_at: string;
  created_at: string;
  // Joined data
  products?: {
    id: string;
    product_name: string;
    rfid_tag: string;
    current_location: string;
  };
}

interface SensorReading {
  timestamp: string;
  value: number;
  status: "normal" | "warning" | "critical";
}

const IoTDashboard = () => {
  const { isActive, account } = useWeb3();
  const [iotData, setIoTData] = useState<IoTData[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [newReading, setNewReading] = useState({
    product_id: "",
    temperature: "",
    humidity: "",
    gps_lat: "",
    gps_lng: "",
    battery_level: "",
    signal_strength: "",
  });

  // Load IoT data from database
  const loadIoTData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("iot_data")
        .select(
          `
          *,
          products (
            id,
            product_name,
            rfid_tag,
            current_location
          )
        `
        )
        .order("recorded_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setIoTData(data || []);
    } catch (error) {
      console.error("Error loading IoT data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load products for IoT recording with fallback support
  const loadProducts = async () => {
    try {
      // Use the enhanced tracking service with fallback
      const data = await trackingService.getAllProducts();
      setProducts(data || []);

      console.log(`Loaded ${data.length} products for IoT monitoring`);
    } catch (error) {
      console.error("Error loading products:", error);

      // Fallback to mock products if everything fails
      const mockProducts = fallbackService.getMockProducts();
      setProducts(mockProducts);
      console.log("Using fallback mock products for IoT monitoring");
    }
  };

  useEffect(() => {
    loadIoTData();
    loadProducts();

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadIoTData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Record new IoT data
  const handleRecordData = async () => {
    try {
      setRecording(true);

      const sensorData = {
        product_id: newReading.product_id,
        temperature: newReading.temperature
          ? parseFloat(newReading.temperature)
          : undefined,
        humidity: newReading.humidity
          ? parseFloat(newReading.humidity)
          : undefined,
        gps_lat: newReading.gps_lat
          ? parseFloat(newReading.gps_lat)
          : undefined,
        gps_lng: newReading.gps_lng
          ? parseFloat(newReading.gps_lng)
          : undefined,
        battery_level: newReading.battery_level
          ? parseFloat(newReading.battery_level)
          : undefined,
        signal_strength: newReading.signal_strength
          ? parseFloat(newReading.signal_strength)
          : undefined,
      };

      // Check connection status and use appropriate method
      const connectionStatus = fallbackService.getConnectionStatus();

      if (connectionStatus.supabaseConnected) {
        console.log("✅ Recording IoT data with full connectivity");

        // Try dashboard service first
        try {
          await dashboardService.recordIoTData(sensorData);
        } catch (dashboardError) {
          console.warn(
            "Dashboard service failed, trying direct Supabase:",
            dashboardError
          );

          // Fallback to direct Supabase insert
          const { error } = await supabase.from("iot_data").insert({
            ...sensorData,
            device_id: `IOT_${Date.now()}`,
            recorded_at: new Date().toISOString(),
          });

          if (error) throw error;
        }
      } else {
        console.log("📱 Recording IoT data in offline mode");

        // Create offline IoT record
        const offlineData = {
          id: `offline-iot-${Date.now()}`,
          ...sensorData,
          shock: 0, // Default shock value
          device_id: `IOT_${Date.now()}`,
          recorded_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        };

        // Store in localStorage for offline mode
        const existingData = fallbackService.getMockIoTData();
        existingData.unshift(offlineData);
        localStorage.setItem("protrack_iot_data", JSON.stringify(existingData));

        // Add to pending operations
        fallbackService.addPendingOperation({
          id: `iot-${offlineData.id}`,
          type: "CREATE_IOT_DATA",
          data: sensorData,
          timestamp: new Date().toISOString(),
          retryCount: 0,
        });
      }

      // Refresh data
      await loadIoTData();

      // Reset form and close modal
      setShowRecordModal(false);
      setNewReading({
        product_id: "",
        temperature: "",
        humidity: "",
        gps_lat: "",
        gps_lng: "",
        battery_level: "",
        signal_strength: "",
      });

      const statusMessage = connectionStatus.supabaseConnected
        ? "IoT data recorded successfully!"
        : "IoT data recorded offline - will sync when connection restored";

      alert(statusMessage);
    } catch (error) {
      console.error("Error recording IoT data:", error);

      // Enhanced error handling with user-friendly messages
      let errorMessage = "Failed to record IoT data. ";
      if (error instanceof Error) {
        if (error.message.includes("Network")) {
          errorMessage +=
            "Please check your internet connection and try again.";
        } else if (error.message.includes("product_id")) {
          errorMessage += "Please select a valid product.";
        } else {
          errorMessage += error.message;
        }
      } else {
        errorMessage += "Please try again.";
      }

      alert(errorMessage);
    } finally {
      setRecording(false);
    }
  };

  // Get status based on sensor values
  const getTemperatureStatus = (temp?: number) => {
    if (!temp) return "normal";
    if (temp > 25 || temp < 2) return "critical";
    if (temp > 20 || temp < 5) return "warning";
    return "normal";
  };

  const getHumidityStatus = (humidity?: number) => {
    if (!humidity) return "normal";
    if (humidity > 80 || humidity < 20) return "critical";
    if (humidity > 70 || humidity < 30) return "warning";
    return "normal";
  };

  const getBatteryStatus = (battery?: number) => {
    if (!battery) return "normal";
    if (battery < 20) return "critical";
    if (battery < 40) return "warning";
    return "normal";
  };

  // Get status badge
  const getStatusBadge = (status: string, value?: number, unit?: string) => {
    const displayValue = value !== undefined ? `${value}${unit || ""}` : "N/A";

    switch (status) {
      case "critical":
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-rose-500">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {displayValue}
          </Badge>
        );
      case "warning":
        return (
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {displayValue}
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            {displayValue}
          </Badge>
        );
    }
  };

  // Calculate statistics
  const stats = {
    totalReadings: iotData.length,
    activeDevices: new Set(iotData.map((d) => d.device_id).filter(Boolean))
      .size,
    criticalAlerts: iotData.filter(
      (d) =>
        getTemperatureStatus(d.temperature) === "critical" ||
        getHumidityStatus(d.humidity) === "critical" ||
        getBatteryStatus(d.battery_level) === "critical"
    ).length,
    avgTemperature:
      iotData.length > 0
        ? iotData
            .filter((d) => d.temperature)
            .reduce((sum, d) => sum + (d.temperature || 0), 0) /
          iotData.filter((d) => d.temperature).length
        : 0,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            IoT Monitoring
          </h1>
          <p className="text-gray-600 mt-2">
            Real-time sensor data and device monitoring
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Button
            onClick={() => setShowRecordModal(true)}
            className="flex items-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Record Data
          </Button>
          <Button
            onClick={loadIoTData}
            className="flex items-center bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Readings
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalReadings.toLocaleString()}
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Devices
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.activeDevices}
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <Wifi className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Critical Alerts
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.criticalAlerts}
                </p>
              </div>
              <div className="rounded-full bg-red-100 p-3">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Avg Temperature
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.avgTemperature.toFixed(1)}°C
                </p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <Thermometer className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* IoT Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2 text-blue-500" />
            Recent Sensor Readings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Device ID</TableHead>
                  <TableHead>Temperature</TableHead>
                  <TableHead>Humidity</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Battery</TableHead>
                  <TableHead>Signal</TableHead>
                  <TableHead>Recorded At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {iotData.length > 0 ? (
                  iotData.map((data) => (
                    <TableRow key={data.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {data.products?.product_name || "Unknown Product"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {data.products?.rfid_tag}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-gradient-to-r from-gray-500 to-gray-700">
                          {data.device_id || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(
                          getTemperatureStatus(data.temperature),
                          data.temperature,
                          "°C"
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(
                          getHumidityStatus(data.humidity),
                          data.humidity,
                          "%"
                        )}
                      </TableCell>
                      <TableCell>
                        {data.gps_lat && data.gps_lng ? (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                            <span className="text-sm">
                              {data.gps_lat.toFixed(4)},{" "}
                              {data.gps_lng.toFixed(4)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">No GPS</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(
                          getBatteryStatus(data.battery_level),
                          data.battery_level,
                          "%"
                        )}
                      </TableCell>
                      <TableCell>
                        {data.signal_strength ? (
                          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500">
                            <Wifi className="h-3 w-3 mr-1" />
                            {data.signal_strength}%
                          </Badge>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(data.recorded_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-gray-500"
                    >
                      No IoT data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Record Data Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="flex items-center">
                  <Plus className="h-6 w-6 mr-2 text-blue-500" />
                  Record IoT Data
                </CardTitle>
                <Button
                  variant="ghost"
                  onClick={() => setShowRecordModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="product_id">Product</Label>
                  <select
                    id="product_id"
                    value={newReading.product_id}
                    onChange={(e) =>
                      setNewReading({
                        ...newReading,
                        product_id: e.target.value,
                      })
                    }
                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">
                      {products.length === 0
                        ? "Loading products..."
                        : `Select a product (${products.length} available)`}
                    </option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.product_name} ({product.rfid_tag}) -{" "}
                        {product.batch_no || product.batch_id}
                      </option>
                    ))}
                  </select>
                  {products.length === 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      No products available. Create a product first to enable
                      IoT monitoring.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="temperature">Temperature (°C)</Label>
                    <Input
                      id="temperature"
                      type="number"
                      step="0.1"
                      value={newReading.temperature}
                      onChange={(e) =>
                        setNewReading({
                          ...newReading,
                          temperature: e.target.value,
                        })
                      }
                      placeholder="e.g., 22.5"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="humidity">Humidity (%)</Label>
                    <Input
                      id="humidity"
                      type="number"
                      step="0.1"
                      value={newReading.humidity}
                      onChange={(e) =>
                        setNewReading({
                          ...newReading,
                          humidity: e.target.value,
                        })
                      }
                      placeholder="e.g., 65.0"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gps_lat">GPS Latitude</Label>
                    <Input
                      id="gps_lat"
                      type="number"
                      step="0.000001"
                      value={newReading.gps_lat}
                      onChange={(e) =>
                        setNewReading({
                          ...newReading,
                          gps_lat: e.target.value,
                        })
                      }
                      placeholder="e.g., 40.7128"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gps_lng">GPS Longitude</Label>
                    <Input
                      id="gps_lng"
                      type="number"
                      step="0.000001"
                      value={newReading.gps_lng}
                      onChange={(e) =>
                        setNewReading({
                          ...newReading,
                          gps_lng: e.target.value,
                        })
                      }
                      placeholder="e.g., -74.0060"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="battery_level">Battery Level (%)</Label>
                    <Input
                      id="battery_level"
                      type="number"
                      min="0"
                      max="100"
                      value={newReading.battery_level}
                      onChange={(e) =>
                        setNewReading({
                          ...newReading,
                          battery_level: e.target.value,
                        })
                      }
                      placeholder="e.g., 85"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signal_strength">Signal Strength (%)</Label>
                    <Input
                      id="signal_strength"
                      type="number"
                      min="0"
                      max="100"
                      value={newReading.signal_strength}
                      onChange={(e) =>
                        setNewReading({
                          ...newReading,
                          signal_strength: e.target.value,
                        })
                      }
                      placeholder="e.g., 75"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowRecordModal(false)}
                  disabled={recording}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRecordData}
                  disabled={recording || !newReading.product_id}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  {recording ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Recording...
                    </>
                  ) : (
                    "Record Data"
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

export default IoTDashboard;
