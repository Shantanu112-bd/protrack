import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Navigation,
  Truck,
  Package,
  Clock,
  Thermometer,
  Droplets,
  Activity,
} from "lucide-react";
import { supabase } from "../services/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface LocationPoint {
  id: string;
  product_id: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: string;
  created_at: string;
}

interface Product {
  id: string;
  rfid_tag: string;
  product_name: string | null;
  status: string;
  current_custodian_id: string | null;
  manufacturer_id: string;
  token_id: string;
  batch_id: string;
  expiry_date: string;
  created_at: string;
  updated_at: string;
}

interface SensorData {
  id: string;
  product_id: string;
  data: Record<string, unknown>;
  timestamp: string;
  created_at: string;
}

interface RouteSegment {
  from: { lat: number; lng: number; name: string };
  to: { lat: number; lng: number; name: string };
  distance: number;
  estimatedTime: string;
}

const EnhancedProductTrackingMap: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<LocationPoint[]>([]);
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<"1h" | "6h" | "24h" | "7d">("24h");
  const [mapView, setMapView] = useState<"satellite" | "roadmap" | "terrain">(
    "roadmap"
  );

  // Load products on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  // Load data when product or time range changes
  useEffect(() => {
    if (selectedProduct) {
      loadData();
    }
  }, [selectedProduct, timeRange]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      setProducts(data || []);
      if (data && data.length > 0) {
        setSelectedProduct(data[0].id);
      }
    } catch (err) {
      console.error("Error loading products:", err);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    if (!selectedProduct) return;

    setLoading(true);
    setError(null);

    try {
      // Load location history
      const { data: locationData, error: locationError } = await supabase
        .from("product_locations")
        .select("*")
        .eq("product_id", selectedProduct)
        .order("timestamp", { ascending: false })
        .limit(100);

      if (locationError) throw locationError;
      setLocations(locationData || []);

      // Load sensor data
      const { data: sensorData, error: sensorError } = await supabase
        .from("iot_data")
        .select("*")
        .eq("product_id", selectedProduct)
        .order("timestamp", { ascending: false })
        .limit(50);

      if (sensorError) throw sensorError;
      setSensorData(sensorData || []);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load tracking data");
    } finally {
      setLoading(false);
    }
  };

  const getLatestSensorValue = (sensorType: string): number | null => {
    if (sensorData.length === 0) return null;

    // Find the most recent sensor data entry
    const latestData = sensorData[0];

    // Extract value based on sensor type
    if (typeof latestData.data === "object" && latestData.data !== null) {
      switch (sensorType) {
        case "temperature":
          return "temperature" in latestData.data
            ? (latestData.data.temperature as number)
            : null;
        case "humidity":
          return "humidity" in latestData.data
            ? (latestData.data.humidity as number)
            : null;
        case "shock":
          return "shock" in latestData.data
            ? (latestData.data.shock as number)
            : null;
        default:
          return null;
      }
    }

    return null;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "manufactured":
        return "bg-blue-500";
      case "in_transit":
        return "bg-yellow-500";
      case "delivered":
        return "bg-green-500";
      case "received":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatAddress = (lat: number, lng: number) => {
    // In a real implementation, we would use a geocoding service
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  };

  const calculateDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ) => {
    // Simple distance calculation (in km)
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const generateRouteSegments = (): RouteSegment[] => {
    if (locations.length < 2) return [];

    const segments: RouteSegment[] = [];

    // Create segments between consecutive locations
    for (let i = 0; i < locations.length - 1; i++) {
      const from = locations[i];
      const to = locations[i + 1];

      const distance = calculateDistance(
        from.latitude,
        from.longitude,
        to.latitude,
        to.longitude
      );

      segments.push({
        from: {
          lat: from.latitude,
          lng: from.longitude,
          name: formatAddress(from.latitude, from.longitude),
        },
        to: {
          lat: to.latitude,
          lng: to.longitude,
          name: formatAddress(to.latitude, to.longitude),
        },
        distance: parseFloat(distance.toFixed(2)),
        estimatedTime: "2h 15m", // Mock data
      });
    }

    return segments;
  };

  const routeSegments = generateRouteSegments();
  const latestLocation = locations.length > 0 ? locations[0] : null;
  const selectedProductData = products.find((p) => p.id === selectedProduct);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Enhanced Product Tracking
          </h1>
          <p className="text-gray-400 mt-1">
            Real-time GPS tracking and sensor monitoring for supply chain
            products
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Select value={selectedProduct} onValueChange={setSelectedProduct}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select a product" />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  <div className="flex items-center">
                    <Package className="w-4 h-4 mr-2" />
                    <span className="font-medium">
                      {product.product_name || `Product #${product.token_id}`}
                    </span>
                    <Badge
                      className={`ml-2 w-3 h-3 p-0 ${getStatusColor(
                        product.status
                      )}`}
                      variant="secondary"
                    />
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={timeRange}
            onValueChange={(value: "1h" | "6h" | "24h" | "7d") =>
              setTimeRange(value)
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="6h">Last 6 Hours</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-300">
          {error}
        </div>
      )}

      {selectedProductData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Info Card */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Product Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-gray-400">Product Name</div>
                <div className="text-white font-medium">
                  {selectedProductData.product_name || "Unnamed Product"}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-400">Token ID</div>
                <div className="text-white font-mono">
                  #{selectedProductData.token_id}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-400">Status</div>
                <Badge className={getStatusColor(selectedProductData.status)}>
                  {selectedProductData.status}
                </Badge>
              </div>

              <div>
                <div className="text-sm text-gray-400">Batch ID</div>
                <div className="text-white font-mono">
                  {selectedProductData.batch_id}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-400">Expiry Date</div>
                <div className="text-white">
                  {new Date(
                    selectedProductData.expiry_date
                  ).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sensor Data Card */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Current Conditions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Thermometer className="w-5 h-5 text-red-400 mr-2" />
                    <div className="text-sm text-gray-400">Temperature</div>
                  </div>
                  <div className="text-2xl font-bold text-white mt-1">
                    {getLatestSensorValue("temperature") !== null
                      ? `${getLatestSensorValue("temperature")}°C`
                      : "N/A"}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Safe range: -20°C to 40°C
                  </div>
                </div>

                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Droplets className="w-5 h-5 text-blue-400 mr-2" />
                    <div className="text-sm text-gray-400">Humidity</div>
                  </div>
                  <div className="text-2xl font-bold text-white mt-1">
                    {getLatestSensorValue("humidity") !== null
                      ? `${getLatestSensorValue("humidity")}%`
                      : "N/A"}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Safe range: 0% to 95%
                  </div>
                </div>

                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Activity className="w-5 h-5 text-yellow-400 mr-2" />
                    <div className="text-sm text-gray-400">Shock</div>
                  </div>
                  <div className="text-2xl font-bold text-white mt-1">
                    {getLatestSensorValue("shock") !== null
                      ? `${getLatestSensorValue("shock")}G`
                      : "N/A"}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Max: 5G</div>
                </div>

                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-purple-400 mr-2" />
                    <div className="text-sm text-gray-400">Last Update</div>
                  </div>
                  <div className="text-lg font-bold text-white mt-1">
                    {sensorData.length > 0
                      ? new Date(sensorData[0].timestamp).toLocaleTimeString()
                      : "N/A"}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Sensor data</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Card */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Current Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              {latestLocation ? (
                <div className="space-y-4">
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-400">Coordinates</div>
                        <div className="text-white font-mono text-lg">
                          {latestLocation.latitude.toFixed(6)},{" "}
                          {latestLocation.longitude.toFixed(6)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-400">Accuracy</div>
                        <div className="text-white">
                          {latestLocation.accuracy
                            ? `±${latestLocation.accuracy}m`
                            : "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <div className="text-sm text-gray-400">Last Updated</div>
                    <div className="text-white font-medium">
                      {new Date(latestLocation.timestamp).toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <div className="text-sm text-gray-400">Address</div>
                    <div className="text-white">
                      {formatAddress(
                        latestLocation.latitude,
                        latestLocation.longitude
                      )}
                    </div>
                  </div>

                  <Button className="w-full">
                    <Navigation className="w-4 h-4 mr-2" />
                    Navigate to Location
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No location data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Map Visualization */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center">
              <Navigation className="w-5 h-5 mr-2" />
              Product Route Map
            </div>
            <div className="flex gap-2">
              <Select
                value={mapView}
                onValueChange={(value: "satellite" | "roadmap" | "terrain") =>
                  setMapView(value)
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="roadmap">Road Map</SelectItem>
                  <SelectItem value="satellite">Satellite</SelectItem>
                  <SelectItem value="terrain">Terrain</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-gradient-to-br from-blue-900/30 via-purple-900/20 to-indigo-900/30 rounded-2xl border border-gray-700/50 flex items-center justify-center backdrop-blur-sm shadow-2xl relative overflow-hidden">
            {/* Map Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/10"></div>

            {/* Route Visualization */}
            {routeSegments.length > 0 ? (
              <>
                {/* Route Line */}
                <svg className="absolute inset-0 w-full h-full">
                  {routeSegments.map((segment, index) => (
                    <line
                      key={index}
                      x1={`${50 + (index % 3) * 15}%`}
                      y1={`${30 + (index % 2) * 20}%`}
                      x2={`${50 + ((index + 1) % 3) * 15}%`}
                      y2={`${30 + ((index + 1) % 2) * 20}%`}
                      stroke="#3b82f6"
                      strokeWidth="3"
                      strokeDasharray="5,5"
                      className="animate-pulse"
                    />
                  ))}
                </svg>

                {/* Location Markers */}
                {routeSegments.map((segment, index) => (
                  <motion.div
                    key={index}
                    className="absolute w-8 h-8 rounded-full bg-blue-500 border-4 border-white shadow-lg flex items-center justify-center"
                    style={{
                      left: `${50 + (index % 3) * 15}%`,
                      top: `${30 + (index % 2) * 20}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.2 }}
                  >
                    <Truck className="w-4 h-4 text-white" />
                  </motion.div>
                ))}

                {/* Current Location Marker */}
                <motion.div
                  className="absolute w-10 h-10 rounded-full bg-green-500 border-4 border-white shadow-lg flex items-center justify-center"
                  style={{
                    left: "70%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: routeSegments.length * 0.2 }}
                >
                  <Package className="w-5 h-5 text-white" />
                </motion.div>
              </>
            ) : (
              <div className="text-center p-8 max-w-md">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                  <div className="relative text-5xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    🌍
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                  Supply Chain Map
                </h3>
                <p className="text-gray-300 mb-6">
                  Interactive map showing product locations and shipment routes
                </p>
                <div className="mt-8 grid grid-cols-3 gap-4">
                  <div className="bg-gray-800/60 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 transform hover:scale-105">
                    <div className="text-blue-400 text-2xl mb-2">🏭</div>
                    <div className="text-white font-medium text-sm">
                      Manufacturing
                    </div>
                    <div className="text-gray-400 text-xs mt-1">
                      Seattle, WA
                    </div>
                  </div>
                  <div className="bg-gray-800/60 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50 hover:border-green-500/50 transition-all duration-300 transform hover:scale-105">
                    <div className="text-green-400 text-2xl mb-2">🚚</div>
                    <div className="text-white font-medium text-sm">
                      In Transit
                    </div>
                    <div className="text-gray-400 text-xs mt-1">
                      Chicago, IL
                    </div>
                  </div>
                  <div className="bg-gray-800/60 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 transform hover:scale-105">
                    <div className="text-purple-400 text-2xl mb-2">🏪</div>
                    <div className="text-white font-medium text-sm">Retail</div>
                    <div className="text-gray-400 text-xs mt-1">
                      New York, NY
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex justify-center space-x-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-gray-300 text-sm">
                      Product Location
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-gray-300 text-sm">Route</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Route Details */}
      {routeSegments.length > 0 && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Truck className="w-5 h-5 mr-2" />
              Route Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {routeSegments.map((segment, index) => (
                <div
                  key={index}
                  className="flex items-center p-4 bg-gray-700/30 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-white">
                          Segment {index + 1}
                        </div>
                        <div className="text-sm text-gray-400 mt-1">
                          From: {segment.from.name}
                        </div>
                        <div className="text-sm text-gray-400">
                          To: {segment.to.name}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-white">
                          {segment.distance} km
                        </div>
                        <div className="text-sm text-gray-400">
                          Est. {segment.estimatedTime}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-4"></div>
            <div className="text-white">Loading tracking data...</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedProductTrackingMap;
