import React, { useState, useEffect } from "react";
import { useWeb3 } from "../contexts/web3ContextTypes";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import {
  Package,
  Truck,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Thermometer,
  Droplets,
  Zap,
  MapPin,
  Shield,
  Wifi,
  Battery,
  Scan,
  Key,
  Search,
  User,
  Hash,
  Calendar,
  TrendingUp,
  Globe,
  BarChart3,
} from "lucide-react";
import { Link } from "react-router-dom";
import ProductTrackingMap from "./map/ProductTrackingMap";

const Dashboard = () => {
  const { account, isActive } = useWeb3();
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeShipments: 0,
    activeSensors: 0,
    alerts: 0,
    qualityScore: 0,
    avgDeliveryTime: 0,
  });
  const [userRole, setUserRole] = useState("admin");
  const [activeTab, setActiveTab] = useState("overview");
  const [scanInput, setScanInput] = useState("");

  interface VerificationResult {
    verified: boolean;
    product?: {
      tokenId: number;
      name: string;
      description: string;
      status: string;
      certifications: string[];
      manufacturer: string;
      manufactureDate: number;
      location: string;
      blockchainProof: {
        transactionHash: string;
        blockNumber: number;
        timestamp: number;
        validator: string;
      };
      zkProof: {
        isValid: boolean;
      };
      history: Array<{
        id: string;
        event: string;
        timestamp: number;
        location: string;
        actor: string;
      }>;
    };
    proofDetails?: {
      onChainData: boolean;
      offChainData: boolean;
      zkProofValid: boolean;
    };
    error?: string;
  }

  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    setStats({
      totalProducts: 124,
      activeShipments: 12,
      activeSensors: 142,
      alerts: 3,
      qualityScore: 92,
      avgDeliveryTime: 2.4,
    });
  }, []);

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    unit,
    change,
  }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    unit?: string;
    change?: string;
  }) => {
    const colorClasses = {
      blue: "bg-blue-500/20 text-blue-500 border-blue-500/30",
      green: "bg-green-500/20 text-green-500 border-green-500/30",
      purple: "bg-purple-500/20 text-purple-500 border-purple-500/30",
      red: "bg-red-500/20 text-red-500 border-red-500/30",
      yellow: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
      teal: "bg-teal-500/20 text-teal-500 border-teal-500/30",
    };

    return (
      <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">
            {title}
          </CardTitle>
          <div
            className={`p-3 rounded-xl ${
              colorClasses[color as keyof typeof colorClasses]
            }`}
          >
            <Icon className="h-6 w-6" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white flex items-baseline">
            {value}
            {unit && (
              <span className="text-lg font-normal text-gray-400 ml-2">
                {unit}
              </span>
            )}
          </div>
          {change && (
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500">{change}</span>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-2">
            {title.includes("Products") && "+2 from last month"}
            {title.includes("Shipments") && "+1 in transit"}
            {title.includes("Sensors") && "All active"}
            {title.includes("Alerts") && "2 require attention"}
            {title.includes("Quality") && "Excellent score"}
            {title.includes("Delivery") && "Average time"}
          </p>
        </CardContent>
      </Card>
    );
  };

  const handleVerify = async () => {
    if (!scanInput.trim()) return;

    setLoading(true);
    try {
      // Mock verification result
      const mockResult = {
        verified: Math.random() > 0.3,
        product: {
          tokenId: Math.floor(Math.random() * 1000),
          name: "Organic Coffee Beans",
          description: "Premium organic coffee beans from sustainable farms",
          status: "delivered",
          certifications: ["Organic", "Fair Trade"],
          manufacturer: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
          manufactureDate: Math.floor(Date.now() / 1000) - 86400 * 30,
          location: "New York, NY",
          blockchainProof: {
            transactionHash: "0x" + Math.random().toString(16).substr(2, 64),
            blockNumber: Math.floor(Math.random() * 1000000),
            timestamp: Math.floor(Date.now() / 1000),
            validator: "0x" + Math.random().toString(16).substr(2, 40),
          },
          zkProof: {
            isValid: Math.random() > 0.2,
          },
          history: [
            {
              id: "1",
              event: "Manufactured",
              timestamp: Math.floor(Date.now() / 1000) - 86400 * 30,
              location: "Seattle, WA",
              actor: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
            },
            {
              id: "2",
              event: "Packaged",
              timestamp: Math.floor(Date.now() / 1000) - 86400 * 25,
              location: "Seattle, WA",
              actor: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
            },
            {
              id: "3",
              event: "Shipped",
              timestamp: Math.floor(Date.now() / 1000) - 86400 * 20,
              location: "Chicago, IL",
              actor: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
            },
            {
              id: "4",
              event: "Delivered",
              timestamp: Math.floor(Date.now() / 1000) - 86400 * 15,
              location: "New York, NY",
              actor: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
            },
          ],
        },
        proofDetails: {
          onChainData: true,
          offChainData: true,
          zkProofValid: Math.random() > 0.2,
        },
      };
      setVerificationResult(mockResult);
    } catch (error) {
      console.error("Verification failed:", error);
      setVerificationResult({
        verified: false,
        error: error instanceof Error ? error.message : "Verification failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "created":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "in transit":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400";
    }
  };

  const renderDashboardContent = () => {
    switch (activeTab) {
      case "supplychain":
        return (
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center">
                <Truck className="h-6 w-6 mr-3 text-blue-400" />
                Supply Chain Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/30">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Recent Shipments
                  </h3>
                  <div className="space-y-4">
                    {[
                      {
                        id: 1,
                        product: "Organic Coffee Beans",
                        status: "in transit",
                        destination: "New York, NY",
                      },
                      {
                        id: 2,
                        product: "Premium Chocolate",
                        status: "delivered",
                        destination: "Los Angeles, CA",
                      },
                      {
                        id: 3,
                        product: "Artisanal Cheese",
                        status: "shipped",
                        destination: "Chicago, IL",
                      },
                    ].map((shipment) => (
                      <div
                        key={shipment.id}
                        className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-all duration-300"
                      >
                        <div>
                          <p className="font-medium text-white">
                            {shipment.product}
                          </p>
                          <p className="text-sm text-gray-400">
                            {shipment.destination}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                            shipment.status
                          )}`}
                        >
                          {shipment.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/30">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Product Lifecycle
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                        1
                      </div>
                      <div className="ml-4">
                        <p className="font-medium text-white">Manufacturing</p>
                        <p className="text-sm text-gray-400">Completed</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                        2
                      </div>
                      <div className="ml-4">
                        <p className="font-medium text-white">Quality Check</p>
                        <p className="text-sm text-gray-400">Completed</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold">
                        3
                      </div>
                      <div className="ml-4">
                        <p className="font-medium text-white">Packaging</p>
                        <p className="text-sm text-gray-400">In Progress</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white font-bold">
                        4
                      </div>
                      <div className="ml-4">
                        <p className="font-medium text-white">Shipping</p>
                        <p className="text-sm text-gray-400">Pending</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      case "iot":
        return (
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center">
                <Activity className="h-6 w-6 mr-3 text-green-400" />
                IoT Sensor Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {[
                  {
                    name: "Temperature",
                    value: "22.5°C",
                    status: "normal",
                    icon: Thermometer,
                  },
                  {
                    name: "Humidity",
                    value: "45%",
                    status: "normal",
                    icon: Droplets,
                  },
                  {
                    name: "Vibration",
                    value: "0.2g",
                    status: "normal",
                    icon: Activity,
                  },
                ].map((sensor, index) => {
                  const Icon = sensor.icon;
                  return (
                    <div
                      key={index}
                      className="bg-gray-800/30 p-5 rounded-xl border border-gray-700/30 hover:bg-gray-700/50 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400">{sensor.name}</p>
                          <p className="text-2xl font-bold text-white">
                            {sensor.value}
                          </p>
                        </div>
                        <Icon className="h-10 w-10 text-green-400" />
                      </div>
                      <div className="mt-3">
                        <div className="w-full bg-gray-700 rounded-full h-3">
                          <div
                            className="bg-green-500 h-3 rounded-full"
                            style={{
                              width:
                                sensor.name === "Temperature"
                                  ? "75%"
                                  : sensor.name === "Humidity"
                                  ? "45%"
                                  : "20%",
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/30">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Sensor Alerts
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      id: 1,
                      sensor: "Temperature",
                      value: "25.3°C",
                      threshold: "25°C",
                      time: "2 min ago",
                      status: "warning",
                    },
                    {
                      id: 2,
                      sensor: "Humidity",
                      value: "52%",
                      threshold: "50%",
                      time: "15 min ago",
                      status: "warning",
                    },
                  ].map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-all duration-300"
                    >
                      <div className="flex items-center">
                        <AlertTriangle className="h-6 w-6 text-yellow-400 mr-4" />
                        <div>
                          <p className="font-medium text-white">
                            {alert.sensor} Alert
                          </p>
                          <p className="text-sm text-gray-400">
                            {alert.value} exceeds {alert.threshold}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {alert.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      case "verification":
        return (
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center">
                <Shield className="h-6 w-6 mr-3 text-purple-400" />
                Product Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-3xl mx-auto">
                <div className="bg-gray-800/30 rounded-2xl p-8 border border-gray-700/30 mb-8">
                  <div className="flex justify-center mb-8">
                    <div className="bg-gray-700 rounded-xl p-1 flex">
                      <button className="px-6 py-3 rounded-lg text-base font-medium transition-colors bg-white dark:bg-gray-600 text-blockchain-600 dark:text-blockchain-400 shadow-sm">
                        <Scan className="w-5 h-5 inline mr-2" />
                        Scan RFID
                      </button>
                      <button className="px-6 py-3 rounded-lg text-base font-medium transition-colors text-gray-300">
                        <Search className="w-5 h-5 inline mr-2" />
                        Manual Entry
                      </button>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-base font-medium text-gray-300 mb-3">
                        Product RFID or Identifier
                      </label>
                      <input
                        type="text"
                        value={scanInput}
                        onChange={(e) => setScanInput(e.target.value)}
                        className="w-full px-5 py-4 border border-gray-600 rounded-xl bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
                        placeholder="Enter RFID hash or product identifier"
                      />
                    </div>
                    <button
                      onClick={handleVerify}
                      disabled={loading || !scanInput.trim()}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-8 rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-colors font-bold text-lg"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                          Verifying Product...
                        </div>
                      ) : (
                        "Verify Product"
                      )}
                    </button>
                  </div>
                </div>

                {verificationResult && (
                  <div className="bg-gray-800/30 rounded-2xl p-8 border border-gray-700/30">
                    <div className="text-center mb-8">
                      <div
                        className={`inline-flex items-center px-8 py-4 rounded-2xl text-2xl font-bold ${
                          verificationResult.verified
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                        }`}
                      >
                        {verificationResult.verified ? (
                          <CheckCircle className="w-8 h-8 mr-3" />
                        ) : (
                          <AlertTriangle className="w-8 h-8 mr-3" />
                        )}
                        {verificationResult.verified
                          ? "Authentic Product"
                          : "Product Not Verified"}
                      </div>
                    </div>

                    {verificationResult.verified &&
                      verificationResult.product && (
                        <div className="space-y-8">
                          <div className="bg-gray-700/30 rounded-xl p-6">
                            <h3 className="text-2xl font-bold text-white mb-3">
                              {verificationResult.product.name}
                            </h3>
                            <p className="text-gray-300 mb-6 text-lg">
                              {verificationResult.product.description}
                            </p>
                            <div className="flex flex-wrap gap-3">
                              <span
                                className={`inline-flex items-center px-4 py-2 rounded-full text-base font-medium ${getStatusColor(
                                  verificationResult.product.status
                                )}`}
                              >
                                <div className="w-3 h-3 rounded-full bg-current mr-2"></div>
                                {verificationResult.product.status}
                              </span>
                              {verificationResult.product.certifications.map(
                                (cert, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-4 py-2 rounded-full text-base font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                                  >
                                    <Shield className="w-4 h-4 mr-2" />
                                    {cert}
                                  </span>
                                )
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-700/30 rounded-xl p-5">
                              <div className="flex items-center text-gray-400 mb-3">
                                <Hash className="w-5 h-5 mr-3" />
                                <span className="text-base font-medium">
                                  Token ID
                                </span>
                              </div>
                              <p className="font-mono text-white text-xl">
                                #{verificationResult.product.tokenId}
                              </p>
                            </div>
                            <div className="bg-gray-700/30 rounded-xl p-5">
                              <div className="flex items-center text-gray-400 mb-3">
                                <User className="w-5 h-5 mr-3" />
                                <span className="text-base font-medium">
                                  Manufacturer
                                </span>
                              </div>
                              <p className="font-mono text-white text-xl">
                                {formatAddress(
                                  verificationResult.product.manufacturer
                                )}
                              </p>
                            </div>
                            <div className="bg-gray-700/30 rounded-xl p-5">
                              <div className="flex items-center text-gray-400 mb-3">
                                <Calendar className="w-5 h-5 mr-3" />
                                <span className="text-base font-medium">
                                  Manufacture Date
                                </span>
                              </div>
                              <p className="text-white text-xl">
                                {formatDate(
                                  verificationResult.product.manufactureDate
                                )}
                              </p>
                            </div>
                            <div className="bg-gray-700/30 rounded-xl p-5">
                              <div className="flex items-center text-gray-400 mb-3">
                                <MapPin className="w-5 h-5 mr-3" />
                                <span className="text-base font-medium">
                                  Current Location
                                </span>
                              </div>
                              <p className="text-white text-xl">
                                {verificationResult.product.location ||
                                  "Unknown"}
                              </p>
                            </div>
                          </div>

                          <div className="bg-blue-900/20 rounded-xl p-6 border border-blue-700/30">
                            <h4 className="text-xl font-semibold text-blue-300 mb-5 flex items-center">
                              <Key className="w-6 h-6 mr-3" />
                              Blockchain Proof
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-base">
                              <div>
                                <div className="text-blue-400 mb-2">
                                  Transaction Hash
                                </div>
                                <div className="font-mono text-blue-200 break-all">
                                  {
                                    verificationResult.product.blockchainProof
                                      .transactionHash
                                  }
                                </div>
                              </div>
                              <div>
                                <div className="text-blue-400 mb-2">
                                  Block Number
                                </div>
                                <div className="font-mono text-blue-200">
                                  #
                                  {
                                    verificationResult.product.blockchainProof
                                      .blockNumber
                                  }
                                </div>
                              </div>
                              <div>
                                <div className="text-blue-400 mb-2">
                                  Timestamp
                                </div>
                                <div className="text-blue-200">
                                  {new Date(
                                    verificationResult.product.blockchainProof
                                      .timestamp * 1000
                                  ).toLocaleString()}
                                </div>
                              </div>
                              <div>
                                <div className="text-blue-400 mb-2">
                                  Validator
                                </div>
                                <div className="font-mono text-blue-200">
                                  {formatAddress(
                                    verificationResult.product.blockchainProof
                                      .validator
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      case "map":
        return (
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center">
                <Globe className="h-6 w-6 mr-3 text-blue-400" />
                Global Supply Chain Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[500px] rounded-2xl overflow-hidden border border-gray-700/50 bg-gray-900/50">
                <ProductTrackingMap />
              </div>
            </CardContent>
          </Card>
        );
      default: // overview
        return (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard
                title="Total Products"
                value={stats.totalProducts}
                icon={Package}
                color="blue"
                change="+2.5%"
              />
              <StatCard
                title="Active Shipments"
                value={stats.activeShipments}
                icon={Truck}
                color="green"
                change="+5.2%"
              />
              <StatCard
                title="IoT Sensors"
                value={stats.activeSensors}
                icon={Activity}
                color="purple"
                change="+1.8%"
              />
              <StatCard
                title="Active Alerts"
                value={stats.alerts}
                icon={AlertTriangle}
                color="red"
                change="-12.3%"
              />
              <StatCard
                title="Quality Score"
                value={stats.qualityScore}
                icon={Shield}
                color="teal"
                unit="%"
                change="+3.1%"
              />
              <StatCard
                title="Avg Delivery Time"
                value={stats.avgDeliveryTime}
                icon={Clock}
                color="yellow"
                unit="days"
                change="-0.5 days"
              />
            </div>

            {/* Quick Actions and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Quick Actions */}
              <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50">
                <CardHeader>
                  <CardTitle className="text-2xl text-white flex items-center">
                    <Zap className="h-6 w-6 mr-3 text-yellow-400" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Link to="/dashboard/mint">
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 h-16 text-lg font-bold">
                        <Package className="h-5 w-5 mr-2" />
                        Mint Product
                      </Button>
                    </Link>
                    <Link to="/dashboard/scan">
                      <Button className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 transition-all duration-300 h-16 text-lg font-bold">
                        <Scan className="h-5 w-5 mr-2" />
                        Scan RFID
                      </Button>
                    </Link>
                    <Link to="/dashboard/products">
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 h-16 text-lg font-bold">
                        <Package className="h-5 w-5 mr-2" />
                        View Products
                      </Button>
                    </Link>
                    <Link to="/dashboard/shipments">
                      <Button className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 transition-all duration-300 h-16 text-lg font-bold">
                        <Truck className="h-5 w-5 mr-2" />
                        Track Shipments
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50">
                <CardHeader>
                  <CardTitle className="text-2xl text-white flex items-center">
                    <BarChart3 className="h-6 w-6 mr-3 text-cyan-400" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        action: "Product Minted",
                        product: "Organic Coffee Beans",
                        time: "2 minutes ago",
                        icon: Package,
                        color: "text-blue-400",
                      },
                      {
                        action: "Shipment Approved",
                        product: "Premium Chocolate",
                        time: "15 minutes ago",
                        icon: CheckCircle,
                        color: "text-green-400",
                      },
                      {
                        action: "IoT Alert",
                        product: "Organic Coffee Beans",
                        time: "1 hour ago",
                        icon: AlertTriangle,
                        color: "text-yellow-400",
                      },
                      {
                        action: "Custody Transferred",
                        product: "Premium Chocolate",
                        time: "2 hours ago",
                        icon: Truck,
                        color: "text-purple-400",
                      },
                    ].map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={index}
                          className="flex items-center p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:bg-gray-700/30 transition-all duration-300"
                        >
                          <div
                            className={
                              "p-3 rounded-lg " +
                              item.color
                                .replace("text", "bg")
                                .replace("-400", "-400/20")
                            }
                          >
                            <Icon className={"h-6 w-6 " + item.color} />
                          </div>
                          <div className="ml-4 flex-1">
                            <p className="font-medium text-white">
                              {item.action}
                            </p>
                            <p className="text-sm text-gray-400">
                              {item.product}
                            </p>
                          </div>
                          <span className="text-sm text-gray-500">
                            {item.time}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* IoT Sensors Overview */}
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 mt-6">
              <CardHeader>
                <CardTitle className="text-2xl text-white flex items-center">
                  <Activity className="h-6 w-6 mr-3 text-green-400" />
                  IoT Sensors Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    {
                      name: "Temperature",
                      value: "22.5°C",
                      icon: Thermometer,
                      color: "text-red-400",
                    },
                    {
                      name: "Humidity",
                      value: "45%",
                      icon: Droplets,
                      color: "text-blue-400",
                    },
                    {
                      name: "Vibration",
                      value: "0.2g",
                      icon: Activity,
                      color: "text-purple-400",
                    },
                    {
                      name: "Battery",
                      value: "87%",
                      icon: Battery,
                      color: "text-green-400",
                    },
                  ].map((sensor, index) => {
                    const Icon = sensor.icon;
                    return (
                      <div
                        key={index}
                        className="bg-gray-800/30 p-5 rounded-xl border border-gray-700/30 flex items-center hover:bg-gray-700/30 transition-all duration-300"
                      >
                        <div
                          className={
                            "p-3 rounded-lg " +
                            sensor.color
                              .replace("text", "bg")
                              .replace("-400", "-400/20")
                          }
                        >
                          <Icon className={`h-6 w-6 ${sensor.color}`} />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm text-gray-400">{sensor.name}</p>
                          <p className="font-bold text-white text-xl">
                            {sensor.value}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 text-white w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              ProTrack Dashboard
            </h1>
            <p className="text-gray-400 mt-2 text-lg">
              Track products through the supply chain with blockchain
              verification
            </p>
          </div>

          {!isActive ? (
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-4 text-center shadow-lg">
              <div className="flex items-center justify-center">
                <Wifi className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="text-yellow-800 font-medium">
                  Wallet not connected - Connect to interact with blockchain
                  features
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-3">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
                <div className="w-3 h-3 rounded-full bg-green-500 relative"></div>
              </div>
              <span className="text-base font-medium text-gray-300">
                {account
                  ? `${account.substring(0, 6)}...${account.substring(
                      account.length - 4
                    )}`
                  : "Connected"}
              </span>
            </div>
          )}
        </div>

        {/* Wallet connection warning */}
        {!isActive && (
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-4 text-center shadow-lg mb-6">
            <div className="flex items-center justify-center">
              <Wifi className="h-5 w-5 text-yellow-600 mr-2" />
              <span className="text-yellow-800 font-medium">
                Wallet not connected - Connect to interact with blockchain
                features
              </span>
            </div>
          </div>
        )}

        {/* Role Selection and Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "overview", label: "Overview", icon: Package },
              { id: "supplychain", label: "Supply Chain", icon: Truck },
              { id: "iot", label: "IoT Dashboard", icon: Activity },
              { id: "verification", label: "Verification", icon: Shield },
              { id: "map", label: "Tracking Map", icon: MapPin },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-5 py-3 rounded-xl transition-all duration-300 text-base font-medium ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                      : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50"
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <select
            value={userRole}
            onChange={(e) => setUserRole(e.target.value)}
            className="px-5 py-3 rounded-xl border bg-gray-800/50 border-gray-700/50 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 text-base"
          >
            <option value="admin">Admin</option>
            <option value="manufacturer">Manufacturer</option>
            <option value="transporter">Transporter</option>
            <option value="retailer">Retailer</option>
            <option value="consumer">Consumer</option>
          </select>
        </div>

        {/* Dashboard Content */}
        <div className="transition-all duration-500 ease-in-out w-full">
          {renderDashboardContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
