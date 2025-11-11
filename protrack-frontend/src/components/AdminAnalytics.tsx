import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Download,
  Database,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { useEnhancedWeb3 } from "../contexts/EnhancedWeb3Context";
import { supabase } from "../services/supabase";
import { formatNumber, formatDate } from "../lib/utils";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";

// Define TypeScript interfaces
interface Product {
  id: string;
  rfid_tag: string;
  batch_id: string;
  token_id: string;
  manufacturer_id: string;
  current_custodian_id: string | null;
  product_name: string | null;
  expiry_date: string;
  status: string;
  max_temperature: number | null;
  min_temperature: number | null;
  max_humidity: number | null;
  min_humidity: number | null;
  max_shock: number | null;
  destination: string | null;
  expected_arrival: string | null;
  created_at: string;
  updated_at: string;
}

interface User {
  id: string;
  wallet_address: string;
  role: string;
  name: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

interface Shipment {
  id: string;
  product_id: string;
  from_party: string;
  to_party: string;
  status: string;
  mpc_tx_id: string | null;
  temp_key_id: string | null;
  requested_at: string;
  approved_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  confirmed_at: string | null;
  tracking_info: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

interface IoTData {
  id: string;
  product_id: string;
  data: Record<string, unknown>;
  timestamp: string;
  created_at: string;
}

interface Device {
  id: string;
  device_id: string;
  device_type: string;
  status: "active" | "inactive" | "maintenance";
  last_seen: string;
  location: string;
  assigned_product: string | null;
  created_at: string;
}

interface AlertData {
  id: string;
  product_id: string;
  alert_type: string;
  alert_value: number;
  threshold: number;
  timestamp: string;
  created_at: string;
}

const AdminAnalytics: React.FC = () => {
  const { account, isConnected } = useEnhancedWeb3();
  const [timeRange, setTimeRange] = useState<"1m" | "3m" | "6m" | "1y">("6m");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [devices, setDevices] = useState<Device[]>([]);
  const [alerts, setAlerts] = useState<AlertData[]>([]);

  // Analytics data
  const [totalProducts, setTotalProducts] = useState(0);
  // Removed unused state variables
  const [activeDevices, setActiveDevices] = useState(0);
  // Removed unused state variables
  const [verificationRate, setVerificationRate] = useState(0);
  const [onTimeDeliveries, setOnTimeDeliveries] = useState(0);

  // Chart data
  interface ChartDataPoint {
    [key: string]: string | number;
  }

  const [productionData, setProductionData] = useState<ChartDataPoint[]>([]);
  // Removed unused state variable
  const [shipmentStatusData, setShipmentStatusData] = useState<
    ChartDataPoint[]
  >([]);
  const [deviceStatusData, setDeviceStatusData] = useState<ChartDataPoint[]>(
    []
  );
  const [alertTrendData, setAlertTrendData] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    if (isConnected && account) {
      loadData();
    }
  }, [isConnected, account, timeRange]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load all data in parallel
      const [
        productsResult,
        usersResult,
        shipmentsResult,
        iotDataResult,
        devicesResult,
        alertsResult,
      ] = await Promise.all([
        supabase.from("products").select("*"),
        supabase.from("users").select("*"),
        supabase.from("shipments").select("*"),
        supabase.from("iot_data").select("*"),
        // Mock device data since there's no devices table in the schema
        Promise.resolve({ data: [], error: null }),
        supabase.from("alerts").select("*"),
      ]);

      if (productsResult.error) throw productsResult.error;
      if (usersResult.error) throw usersResult.error;
      if (shipmentsResult.error) throw shipmentsResult.error;
      if (iotDataResult.error) throw iotDataResult.error;
      if (alertsResult.error) throw alertsResult.error;

      setDevices(devicesResult.data || []);
      setAlerts(alertsResult.data || []);

      // Calculate metrics
      calculateMetrics([], [], [], []);

      // Generate chart data
      generateChartData([], []);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (
    products: Product[],
    users: User[],
    shipments: Shipment[]
    // iotData: IoTData[] - Removed unused parameter
  ) => {
    setTotalProducts(products.length);
    // Removed unused state setters
    setActiveDevices(devices.filter((d) => d.status === "active").length);
    // Removed unused state setter

    // Calculate verification rate (mock implementation)
    const verifiedProducts = products.filter(
      (p) => p.status === "verified"
    ).length;
    setVerificationRate(
      products.length > 0 ? (verifiedProducts / products.length) * 100 : 0
    );

    // Calculate on-time deliveries (mock implementation)
    const onTime = shipments.filter((s) => s.status === "delivered").length;
    setOnTimeDeliveries(
      shipments.length > 0 ? (onTime / shipments.length) * 100 : 0
    );
  };

  const generateChartData = (
    products: Product[],
    shipments: Shipment[]
    // devices: Device[], - Removed unused parameter
    // alerts: AlertData[] - Removed unused parameter
  ) => {
    // Production trends (mock data)
    const productionTrends = [
      { month: "Jan", products: 1200, verified: 1150, revenue: 45000 },
      { month: "Feb", products: 1350, verified: 1320, revenue: 52000 },
      { month: "Mar", products: 1100, verified: 1080, revenue: 41000 },
      { month: "Apr", products: 1450, verified: 1420, revenue: 58000 },
      { month: "May", products: 1600, verified: 1580, revenue: 64000 },
      { month: "Jun", products: 1750, verified: 1720, revenue: 70000 },
    ];
    setProductionData(productionTrends);

    // Category distribution (mock data)
    const categories = [
      { name: "Food & Beverages", value: 35, color: "#3b82f6" },
      { name: "Pharmaceuticals", value: 25, color: "#10b981" },
      { name: "Electronics", value: 20, color: "#f59e0b" },
      { name: "Textiles", value: 15, color: "#ef4444" },
      { name: "Other", value: 5, color: "#8b5cf6" },
    ];
    // setCategoryData is not used in current implementation

    // Shipment status distribution
    const statuses = [
      {
        name: "Requested",
        value: shipments.filter((s) => s.status === "requested").length,
        color: "#3b82f6",
      },
      {
        name: "Approved",
        value: shipments.filter((s) => s.status === "approved").length,
        color: "#10b981",
      },
      {
        name: "Shipped",
        value: shipments.filter((s) => s.status === "shipped").length,
        color: "#f59e0b",
      },
      {
        name: "Delivered",
        value: shipments.filter((s) => s.status === "delivered").length,
        color: "#ef4444",
      },
      {
        name: "Confirmed",
        value: shipments.filter((s) => s.status === "confirmed").length,
        color: "#8b5cf6",
      },
    ];
    setShipmentStatusData(statuses);

    // Device status distribution (mock data)
    const deviceStatuses = [
      { name: "Active", value: 65, color: "#10b981" },
      { name: "Inactive", value: 20, color: "#ef4444" },
      { name: "Maintenance", value: 15, color: "#f59e0b" },
    ];
    setDeviceStatusData(deviceStatuses);

    // Alert trends (mock data)
    const alertTrends = [
      { date: "2023-01", temperature: 12, humidity: 8, shock: 5 },
      { date: "2023-02", temperature: 15, humidity: 10, shock: 7 },
      { date: "2023-03", temperature: 8, humidity: 5, shock: 3 },
      { date: "2023-04", temperature: 20, humidity: 15, shock: 10 },
      { date: "2023-05", temperature: 5, humidity: 3, shock: 2 },
      { date: "2023-06", temperature: 18, humidity: 12, shock: 8 },
    ];
    setAlertTrendData(alertTrends);
  };

  const exportData = () => {
    // Mock export functionality
    alert("Export functionality would be implemented here");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Analytics</h1>
          <p className="text-gray-400 mt-1">
            Global supply chain insights and device registry
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Select
            value={timeRange}
            onValueChange={(value: "1m" | "3m" | "6m" | "1y") =>
              setTimeRange(value)
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Last Month</SelectItem>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportData} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-gray-800/50 border border-gray-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">
                Total Products
              </p>
              <p className="text-2xl font-bold text-white mt-1">
                {formatNumber(totalProducts)}
              </p>
              <p className="text-sm text-green-500 mt-1">
                +12.5% from last period
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/20">
              <Package className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gray-800/50 border border-gray-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">
                Verification Rate
              </p>
              <p className="text-2xl font-bold text-white mt-1">
                {verificationRate.toFixed(1)}%
              </p>
              <p className="text-sm text-green-500 mt-1">
                +2.1% from last period
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-500/20">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-gray-800/50 border border-gray-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">
                Active Devices
              </p>
              <p className="text-2xl font-bold text-white mt-1">
                {formatNumber(activeDevices)}
              </p>
              <p className="text-sm text-green-500 mt-1">+5 new this month</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500/20">
              <Activity className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gray-800/50 border border-gray-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">
                On-Time Deliveries
              </p>
              <p className="text-2xl font-bold text-white mt-1">
                {onTimeDeliveries.toFixed(1)}%
              </p>
              <p className="text-sm text-green-500 mt-1">
                +3.2% from last period
              </p>
            </div>
            <div className="p-3 rounded-lg bg-orange-500/20">
              <Clock className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Production Trends */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-gray-800/50 border border-gray-700 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            Production & Verification Trends
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    borderColor: "#374151",
                  }}
                  formatter={(value: number, name: string) => [
                    formatNumber(value),
                    name === "products"
                      ? "Products Created"
                      : "Products Verified",
                  ]}
                />
                <Bar dataKey="products" fill="#3b82f6" name="products" />
                <Bar dataKey="verified" fill="#10b981" name="verified" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Shipment Status Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-gray-800/50 border border-gray-700 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            Shipment Status Distribution
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={shipmentStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {shipmentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color as string} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    borderColor: "#374151",
                  }}
                  formatter={(value: number) => [`${value}`, "Count"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Device Registry */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="bg-gray-800/50 border border-gray-700 rounded-xl p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-white">Device Registry</h3>
          <Button variant="outline" size="sm">
            <Database className="w-4 h-4 mr-2" />
            Add Device
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">
                  Device ID
                </th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">
                  Type
                </th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">
                  Last Seen
                </th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">
                  Location
                </th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">
                  Assigned Product
                </th>
              </tr>
            </thead>
            <tbody>
              {devices.slice(0, 5).map((device) => (
                <tr
                  key={device.id}
                  className="border-b border-gray-700/50 hover:bg-gray-700/30"
                >
                  <td className="py-3 px-4 text-white font-mono">
                    {device.device_id.substring(0, 10)}...
                  </td>
                  <td className="py-3 px-4 text-gray-300">
                    {device.device_type}
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={
                        device.status === "active"
                          ? "default"
                          : device.status === "maintenance"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {device.status.charAt(0).toUpperCase() +
                        device.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-gray-300">
                    {formatDate(device.last_seen)}
                  </td>
                  <td className="py-3 px-4 text-gray-300">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {device.location}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-300">
                    {device.assigned_product
                      ? device.assigned_product.substring(0, 10) + "..."
                      : "Unassigned"}
                  </td>
                </tr>
              ))}
              {devices.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No devices registered
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alert Trends */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-gray-800/50 border border-gray-700 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            Alert Trends
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={alertTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    borderColor: "#374151",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="temperature"
                  stackId="1"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.3}
                  name="Temperature"
                />
                <Area
                  type="monotone"
                  dataKey="humidity"
                  stackId="1"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  name="Humidity"
                />
                <Area
                  type="monotone"
                  dataKey="shock"
                  stackId="1"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.3}
                  name="Shock"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Device Status Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="bg-gray-800/50 border border-gray-700 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            Device Status Distribution
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {deviceStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color as string} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    borderColor: "#374151",
                  }}
                  formatter={(value: number) => [`${value}%`, "Share"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0 }}
        className="bg-gray-800/50 border border-gray-700 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-6">Recent Alerts</h3>

        <div className="space-y-4">
          {alerts.slice(0, 5).map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg"
            >
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-red-500/20 mr-4">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <div className="font-medium text-white">
                    {alert.alert_type.replace("_", " ")}
                  </div>
                  <div className="text-sm text-gray-400">
                    Product: {alert.product_id.substring(0, 10)}... •{" "}
                    {formatDate(alert.timestamp)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-white">
                  {alert.alert_value}
                </div>
                <div className="text-sm text-gray-400">
                  Threshold: {alert.threshold}
                </div>
              </div>
            </div>
          ))}

          {alerts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No recent alerts
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminAnalytics;
