import React, { useState, useEffect } from "react";
import { useWeb3 } from "../contexts/web3ContextTypes";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Download,
  RefreshCw,
  Package,
  Truck,
  Activity,
  Shield,
  BarChart3,
} from "lucide-react";

// Define types
interface ProductData {
  name: string;
  value: number;
}

interface ShipmentData {
  name: string;
  shipments: number;
  onTime: number;
  delayed: number;
}

interface SensorData {
  name: string;
  normal: number;
  warning: number;
  alert: number;
}

interface QualityData {
  name: string;
  passed: number;
  failed: number;
  pending: number;
}

const SupplyChainAnalytics = () => {
  const { isActive } = useWeb3();
  const [productData, setProductData] = useState<ProductData[]>([]);
  const [shipmentData, setShipmentData] = useState<ShipmentData[]>([]);
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [qualityData, setQualityData] = useState<QualityData[]>([]);
  const [timeRange, setTimeRange] = useState("30d");
  const [userRole, setUserRole] = useState("admin"); // Add user role state

  // Mock data for demonstration
  useEffect(() => {
    // Product distribution data
    setProductData([
      { name: "Coffee Beans", value: 400 },
      { name: "Chocolate", value: 300 },
      { name: "Honey", value: 200 },
      { name: "Cheese", value: 278 },
      { name: "Olive Oil", value: 189 },
    ]);

    // Shipment performance data
    setShipmentData([
      { name: "Jan", shipments: 45, onTime: 42, delayed: 3 },
      { name: "Feb", shipments: 52, onTime: 48, delayed: 4 },
      { name: "Mar", shipments: 48, onTime: 45, delayed: 3 },
      { name: "Apr", shipments: 60, onTime: 55, delayed: 5 },
      { name: "May", shipments: 55, onTime: 52, delayed: 3 },
      { name: "Jun", shipments: 65, onTime: 60, delayed: 5 },
    ]);

    // IoT sensor data
    setSensorData([
      { name: "Temperature", normal: 85, warning: 12, alert: 3 },
      { name: "Humidity", normal: 78, warning: 18, alert: 4 },
      { name: "Vibration", normal: 92, warning: 6, alert: 2 },
      { name: "Pressure", normal: 88, warning: 10, alert: 2 },
    ]);

    // Quality check data
    setQualityData([
      { name: "Q1", passed: 120, failed: 8, pending: 12 },
      { name: "Q2", passed: 145, failed: 5, pending: 10 },
      { name: "Q3", passed: 138, failed: 7, pending: 15 },
      { name: "Q4", passed: 152, failed: 3, pending: 15 },
    ]);
  }, []);

  // Refresh analytics data
  const refreshAnalyticsData = async () => {
    if (!isActive) {
      console.log("Wallet not connected");
      return;
    }

    try {
      // In a real implementation, you'd fetch actual analytics data from the blockchain
      console.log("Refreshing analytics data...");
    } catch (error) {
      console.error("Error refreshing analytics data:", error);
    }
  };

  // Export analytics data
  const exportAnalyticsData = () => {
    // In a real app, this would export data to CSV/PDF
    console.log("Exporting analytics data...");
  };

  // Colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Supply Chain Analytics
          </h1>
          <p className="text-gray-600 mt-2">
            Insights and performance metrics for your supply chain
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
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <Button
            onClick={refreshAnalyticsData}
            className="flex items-center bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={exportAnalyticsData}
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
            <BarChart3 className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800 font-medium">
              Wallet not connected - Connect to interact with blockchain
              features
            </span>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">1,456</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Truck className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Active Shipments</p>
                <p className="text-2xl font-bold text-gray-900">142</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">IoT Sensors</p>
                <p className="text-2xl font-bold text-gray-900">87</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Shield className="h-6 w-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Quality Score</p>
                <p className="text-2xl font-bold text-gray-900">94.2%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Distribution */}
        <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800">
              <Package className="h-5 w-5 mr-2 text-blue-500" />
              Product Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={productData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {productData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Shipment Performance */}
        <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800">
              <Truck className="h-5 w-5 mr-2 text-green-500" />
              Shipment Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={shipmentData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="shipments"
                    fill="#3B82F6"
                    name="Total Shipments"
                  />
                  <Bar
                    dataKey="onTime"
                    fill="#10B981"
                    name="On-Time Deliveries"
                  />
                  <Bar
                    dataKey="delayed"
                    fill="#EF4444"
                    name="Delayed Shipments"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* IoT Sensor Status */}
        <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800">
              <Activity className="h-5 w-5 mr-2 text-purple-500" />
              IoT Sensor Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sensorData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="normal" fill="#10B981" name="Normal" />
                  <Bar dataKey="warning" fill="#F59E0B" name="Warning" />
                  <Bar dataKey="alert" fill="#EF4444" name="Alert" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quality Checks */}
        <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800">
              <Shield className="h-5 w-5 mr-2 text-amber-500" />
              Quality Checks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={qualityData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="passed"
                    stroke="#10B981"
                    name="Passed"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="failed"
                    stroke="#EF4444"
                    name="Failed"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="pending"
                    stroke="#94A3B8"
                    name="Pending"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <TrendingUp className="h-5 w-5 mr-2 text-indigo-500" />
            Detailed Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="ml-3 font-semibold text-gray-900">
                  Product Metrics
                </h3>
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Manufactured</span>
                  <span className="font-medium">1,240</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">In Transit</span>
                  <span className="font-medium">142</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivered</span>
                  <span className="font-medium">987</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-6 rounded-xl border border-green-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Truck className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="ml-3 font-semibold text-gray-900">
                  Shipment Metrics
                </h3>
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">On-Time Rate</span>
                  <span className="font-medium">96.8%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg. Delivery Time</span>
                  <span className="font-medium">2.4 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Return Rate</span>
                  <span className="font-medium">1.2%</span>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Activity className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="ml-3 font-semibold text-gray-900">
                  IoT Metrics
                </h3>
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sensor Uptime</span>
                  <span className="font-medium">99.7%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Alerts This Month</span>
                  <span className="font-medium">24</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg. Response Time</span>
                  <span className="font-medium">18 min</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupplyChainAnalytics;
