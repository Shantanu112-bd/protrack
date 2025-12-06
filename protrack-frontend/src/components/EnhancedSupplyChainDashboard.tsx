import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Truck,
  Shield,
  AlertTriangle,
  Activity,
  CheckCircle,
  XCircle,
  Hash,
  Thermometer,
  Droplets,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import ProductTrackingMap from "./map/ProductTrackingMap";
import { useEnhancedWeb3 } from "../contexts/EnhancedWeb3Context";

interface SupplyChainEvent {
  id: string;
  tokenId: number;
  eventType:
    | "manufactured"
    | "packaged"
    | "shipped"
    | "delivered"
    | "sold"
    | "recalled";
  timestamp: number;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  actor: {
    address: string;
    role: string;
    name: string;
  };
  metadata: {
    batchNumber: string;
    temperature: number;
    humidity: number;
  };
  verified: boolean;
}

interface ProductJourney {
  tokenId: number;
  productName: string;
  currentStatus: string;
  events: SupplyChainEvent[];
  iotData: Array<{
    timestamp: number;
    temperature: number;
    humidity: number;
    vibration: number;
    gps: string;
    dataHash?: string;
    verified?: boolean;
    txHash?: string;
  }>;
  certificates: Array<{
    id: string;
    type: string;
    issuer: string;
    validUntil: string;
  }>;
  alerts: Array<{
    id: string;
    type: string;
    value: number;
    threshold: number;
    timestamp: string;
  }>;
}

interface SensorData {
  timestamp: number;
  temperature: number;
  humidity: number;
  vibration: number;
  gps: string;
  dataHash?: string;
  verified?: boolean;
  txHash?: string;
}

const EnhancedSupplyChainDashboard: React.FC = () => {
  const { account, isConnected } = useEnhancedWeb3();

  const [selectedProduct, setSelectedProduct] = useState<ProductJourney | null>(
    null
  );
  const [products, setProducts] = useState<ProductJourney[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTokenId, setSearchTokenId] = useState<string>("");
  const [analytics, setAnalytics] = useState({
    totalProducts: 0,
    activeShipments: 0,
    completedDeliveries: 0,
    alerts: 0,
    averageDeliveryTime: 0,
    qualityScore: 0,
  });
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [verifying, setVerifying] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
    loadRecentProducts();
    generateMockData();

    const interval = setInterval(() => {
      generateMockData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadAnalytics = async () => {
    // Generate mock analytics data
    setAnalytics({
      totalProducts: Math.floor(Math.random() * 1000) + 500,
      activeShipments: Math.floor(Math.random() * 50) + 20,
      completedDeliveries: Math.floor(Math.random() * 800) + 400,
      alerts: Math.floor(Math.random() * 10) + 2,
      averageDeliveryTime: Math.floor(Math.random() * 5) + 3, // days
      qualityScore: Math.floor(Math.random() * 20) + 80, // 80-100%
    });
  };

  const loadRecentProducts = async () => {
    // Generate mock product data
    const mockProducts: ProductJourney[] = Array.from(
      { length: 5 },
      (_, i) => ({
        tokenId: i + 1,
        productName: `Product ${i + 1}`,
        currentStatus: ["manufactured", "packaged", "shipped", "delivered"][
          Math.floor(Math.random() * 4)
        ],
        events: generateMockEvents(i + 1),
        iotData: [],
        certificates: [],
        alerts: [],
      })
    );

    setProducts(mockProducts);
  };

  const generateMockEvents = (tokenId: number): SupplyChainEvent[] => {
    const events: SupplyChainEvent[] = [];
    const eventTypes: Array<SupplyChainEvent["eventType"]> = [
      "manufactured",
      "packaged",
      "shipped",
      "delivered",
    ];

    const locations = [
      { latitude: 40.7128, longitude: -74.006, address: "New York, NY" },
      { latitude: 34.0522, longitude: -118.2437, address: "Los Angeles, CA" },
      { latitude: 41.8781, longitude: -87.6298, address: "Chicago, IL" },
      { latitude: 29.7604, longitude: -95.3698, address: "Houston, TX" },
    ];

    eventTypes.forEach((eventType, index) => {
      events.push({
        id: `event-${tokenId}-${index}`,
        tokenId,
        eventType,
        timestamp:
          Date.now() - (eventTypes.length - index) * 24 * 60 * 60 * 1000,
        location: locations[index],
        actor: {
          address: `0x${Math.random().toString(16).substring(2, 42)}`,
          role: ["manufacturer", "packager", "transporter", "retailer"][index],
          name: [
            "Acme Manufacturing",
            "PackCorp",
            "FastShip Logistics",
            "RetailMart",
          ][index],
        },
        metadata: {
          batchNumber: `BATCH-${tokenId}-${index}`,
          temperature: Math.floor(Math.random() * 30) + 10,
          humidity: Math.floor(Math.random() * 50) + 30,
        },
        verified: true,
      });
    });

    return events;
  };

  const generateMockData = () => {
    // Mock sensor data with blockchain verification
    const now = Date.now();
    const newDataPoint: SensorData = {
      timestamp: now,
      temperature: 22.5 + Math.random() * 5,
      humidity: 45 + Math.random() * 20,
      vibration: Math.random() * 10,
      gps: `${(40.7128 + Math.random() * 0.01).toFixed(6)},${(
        -74.006 +
        Math.random() * 0.01
      ).toFixed(6)}`,
      dataHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      verified: Math.random() > 0.2, // 80% verification rate
      txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
    };

    setSensorData((prev) => [...prev.slice(-20), newDataPoint]);
  };

  const searchProduct = async () => {
    if (!searchTokenId) return;

    setIsLoading(true);
    try {
      const tokenId = parseInt(searchTokenId);

      // In a real implementation, this would fetch from blockchain
      const mockProduct: ProductJourney = {
        tokenId,
        productName: `Product ${tokenId}`,
        currentStatus: "shipped",
        events: generateMockEvents(tokenId),
        iotData: [],
        certificates: [],
        alerts: [],
      };

      setSelectedProduct(mockProduct);
    } catch (error) {
      console.error("Failed to load product:", error);
      alert("Product not found");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyDataOnBlockchain = async (dataHash: string) => {
    if (!isConnected || !account) return;

    setVerifying(dataHash);

    try {
      // In a real implementation, this would call the actual IoT service
      // For now, we'll simulate verification
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const isVerified = Math.random() > 0.3; // 70% success rate

      // Update sensor data with verification result
      setSensorData((prev) =>
        prev.map((data) =>
          data.dataHash === dataHash ? { ...data, verified: isVerified } : data
        )
      );
    } catch (error) {
      console.error("Verification failed:", error);
    } finally {
      setVerifying(null);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      manufactured: "#3b82f6",
      packaged: "#10b981",
      shipped: "#f59e0b",
      delivered: "#8b5cf6",
      sold: "#06d6a0",
      recalled: "#ef4444",
      normal: "#10b981",
      warning: "#f59e0b",
      critical: "#ef4444",
    };
    return colors[status as keyof typeof colors] || "#6b7280";
  };

  const getEventIcon = (eventType: string) => {
    const icons = {
      manufactured: "🏭",
      packaged: "📦",
      shipped: "🚚",
      delivered: "🏪",
      sold: "💰",
      recalled: "⚠️",
    };
    return icons[eventType as keyof typeof icons] || "📍";
  };

  // Chart data
  const statusDistribution = [
    { name: "Manufactured", value: 25, color: "#3b82f6" },
    { name: "Packaged", value: 20, color: "#10b981" },
    { name: "Shipped", value: 30, color: "#f59e0b" },
    { name: "Delivered", value: 25, color: "#8b5cf6" },
  ];

  const deliveryTrends = Array.from({ length: 7 }, (_, i) => ({
    day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
    deliveries: Math.floor(Math.random() * 50) + 20,
    shipments: Math.floor(Math.random() * 60) + 30,
  }));

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Enhanced Supply Chain Dashboard
          </h1>
          <p className="text-gray-400 mt-1">
            Complete product journey tracking with blockchain verification
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={searchTokenId}
            onChange={(e) => setSearchTokenId(e.target.value)}
            placeholder="Enter Token ID"
            className="px-4 py-2 rounded-lg border bg-gray-800 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={searchProduct}
            disabled={isLoading || !searchTokenId}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              isLoading || !searchTokenId
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white`}
          >
            {isLoading ? "Searching..." : "Track Product"}
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        {[
          {
            label: "Total Products",
            value: analytics.totalProducts,
            icon: Package,
            color: "blue",
          },
          {
            label: "Active Shipments",
            value: analytics.activeShipments,
            icon: Truck,
            color: "orange",
          },
          {
            label: "Completed",
            value: analytics.completedDeliveries,
            icon: CheckCircle,
            color: "green",
          },
          {
            label: "Active Alerts",
            value: analytics.alerts,
            icon: AlertTriangle,
            color: "red",
          },
          {
            label: "Avg Delivery",
            value: `${analytics.averageDeliveryTime}d`,
            icon: Activity,
            color: "purple",
          },
          {
            label: "Quality Score",
            value: `${analytics.qualityScore}%`,
            icon: Shield,
            color: "teal",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`p-3 bg-${stat.color}-500/20 rounded-lg`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            Product Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Delivery Trends */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            Weekly Delivery Trends
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={deliveryTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="shipments" fill="#3b82f6" name="Shipments" />
              <Bar dataKey="deliveries" fill="#10b981" name="Deliveries" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Selected Product Details */}
      {selectedProduct && (
        <div className="space-y-6">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {selectedProduct.productName}
                </h3>
                <p className="text-gray-400 mt-1">
                  Token ID: {selectedProduct.tokenId}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{
                    backgroundColor: getStatusColor(
                      selectedProduct.currentStatus
                    ),
                  }}
                ></div>
                <span className="font-medium text-white">
                  {selectedProduct.currentStatus.charAt(0).toUpperCase() +
                    selectedProduct.currentStatus.slice(1)}
                </span>
              </div>
            </div>

            {/* Product Journey Timeline */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-white mb-4">
                Supply Chain Journey
              </h4>
              <div className="space-y-4">
                {selectedProduct.events.map((event) => (
                  <div key={event.id} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white`}
                        style={{
                          backgroundColor: getStatusColor(event.eventType),
                        }}
                      >
                        {getEventIcon(event.eventType)}
                      </div>
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-semibold text-white">
                            {event.eventType.charAt(0).toUpperCase() +
                              event.eventType.slice(1)}
                          </h5>
                          <p className="text-sm text-gray-400">
                            {event.actor.name} • {event.location.address}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(event.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {event.verified && (
                            <span className="text-green-500 text-sm">
                              ✓ Verified
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map showing product journey */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-white mb-4">
                Geographic Journey
              </h4>
              <div className="h-96 rounded-lg overflow-hidden border border-gray-600">
                <ProductTrackingMap
                  productId={selectedProduct.tokenId.toString()}
                />
              </div>
            </div>

            {/* IoT Sensor Data */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-white mb-4">
                IoT Sensor Data
              </h4>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Real-time Charts */}
                <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4">
                  <h5 className="text-md font-medium text-white mb-3">
                    Real-time Sensor Data
                  </h5>

                  <div className="space-y-4">
                    {/* Temperature Chart */}
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Thermometer className="w-4 h-4 text-red-400" />
                        <span className="text-sm text-gray-300">
                          Temperature (°C)
                        </span>
                      </div>
                      <ResponsiveContainer width="100%" height={100}>
                        <AreaChart data={sensorData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#374151"
                          />
                          <XAxis
                            dataKey="timestamp"
                            tickFormatter={(value) =>
                              new Date(value).toLocaleTimeString()
                            }
                            stroke="#9CA3AF"
                            fontSize={10}
                          />
                          <YAxis stroke="#9CA3AF" fontSize={10} />
                          <Tooltip
                            labelFormatter={(value) =>
                              new Date(value).toLocaleTimeString()
                            }
                            contentStyle={{
                              backgroundColor: "#1F2937",
                              border: "1px solid #374151",
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="temperature"
                            stroke="#EF4444"
                            fill="#EF4444"
                            fillOpacity={0.2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Humidity Chart */}
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Droplets className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-gray-300">
                          Humidity (%)
                        </span>
                      </div>
                      <ResponsiveContainer width="100%" height={100}>
                        <AreaChart data={sensorData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#374151"
                          />
                          <XAxis
                            dataKey="timestamp"
                            tickFormatter={(value) =>
                              new Date(value).toLocaleTimeString()
                            }
                            stroke="#9CA3AF"
                            fontSize={10}
                          />
                          <YAxis stroke="#9CA3AF" fontSize={10} />
                          <Tooltip
                            labelFormatter={(value) =>
                              new Date(value).toLocaleTimeString()
                            }
                            contentStyle={{
                              backgroundColor: "#1F2937",
                              border: "1px solid #374151",
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="humidity"
                            stroke="#3B82F6"
                            fill="#3B82F6"
                            fillOpacity={0.2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Blockchain Verification */}
                <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4">
                  <h5 className="text-md font-medium text-white mb-3">
                    Blockchain Verification
                  </h5>

                  <div className="space-y-3">
                    {sensorData.slice(-3).map((data, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <Hash className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-300 font-mono">
                              {data.dataHash?.slice(0, 8)}...
                              {data.dataHash?.slice(-4)}
                            </span>
                          </div>
                          {data.verified !== undefined &&
                            (data.verified ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-400" />
                            ))}
                        </div>

                        <button
                          onClick={() =>
                            data.dataHash &&
                            verifyDataOnBlockchain(data.dataHash)
                          }
                          disabled={verifying === data.dataHash}
                          className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                            verifying === data.dataHash
                              ? "bg-gray-600 text-gray-300"
                              : data.verified
                              ? "bg-green-600/20 text-green-400 hover:bg-green-600/30"
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                          }`}
                        >
                          {verifying === data.dataHash
                            ? "Verifying..."
                            : data.verified
                            ? "Verified"
                            : "Verify"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Products Table */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">
          Recent Products
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-300">
                  Token ID
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-300">
                  Product Name
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-300">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-300">
                  Last Update
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.tokenId} className="border-b border-gray-700">
                  <td className="py-3 px-4 text-gray-300">
                    #{product.tokenId}
                  </td>
                  <td className="py-3 px-4 text-white font-medium">
                    {product.productName}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: getStatusColor(
                            product.currentStatus
                          ),
                        }}
                      ></div>
                      <span className="text-sm text-gray-300">
                        {product.currentStatus}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {new Date().toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => {
                        setSearchTokenId(product.tokenId.toString());
                        searchProduct();
                      }}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EnhancedSupplyChainDashboard;
