import React, { useState } from "react";
import { useWeb3 } from "../contexts/web3ContextTypes";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  BarChart,
  PieChart,
  TrendingUp,
  Truck,
  Package,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
} from "lucide-react";

// Define types
interface KpiMetric {
  id: number;
  name: string;
  value: number | string;
  change: number;
  trend: "up" | "down" | "neutral";
  unit?: string;
}

interface DeliveryKpi {
  id: number;
  route: string;
  onTime: number;
  delayed: number;
  avgDeliveryTime: string;
  performance: number;
}

interface ColdChainBreach {
  id: number;
  productId: string;
  productName: string;
  timestamp: string;
  location: string;
  temperature: number;
  threshold: number;
  resolved: boolean;
}

interface CarrierPerformance {
  id: number;
  carrier: string;
  shipments: number;
  onTime: number;
  delayed: number;
  avgDeliveryDays: number;
  rating: number;
}

const SupplyChainAnalytics = () => {
  const { isActive } = useWeb3();
  const [timeRange, setTimeRange] = useState("7d");
  const [kpis] = useState<KpiMetric[]>([
    {
      id: 1,
      name: "Total Shipments",
      value: 1247,
      change: 12.5,
      trend: "up",
    },
    {
      id: 2,
      name: "On-Time Delivery Rate",
      value: "94.2%",
      change: 2.1,
      trend: "up",
      unit: "%",
    },
    {
      id: 3,
      name: "Avg. Delivery Time",
      value: "3.2 days",
      change: -0.3,
      trend: "down",
    },
    {
      id: 4,
      name: "Cold Chain Breaches",
      value: 3,
      change: -40.0,
      trend: "down",
    },
  ]);
  const [deliveryKpis] = useState<DeliveryKpi[]>([
    {
      id: 1,
      route: "NYC → LA",
      onTime: 89,
      delayed: 11,
      avgDeliveryTime: "4.1 days",
      performance: 89.0,
    },
    {
      id: 2,
      route: "Chicago → Miami",
      onTime: 156,
      delayed: 4,
      avgDeliveryTime: "2.8 days",
      performance: 97.5,
    },
    {
      id: 3,
      route: "Seattle → Atlanta",
      onTime: 72,
      delayed: 8,
      avgDeliveryTime: "3.5 days",
      performance: 90.0,
    },
  ]);
  const [coldChainBreaches, setColdChainBreaches] = useState<ColdChainBreach[]>(
    [
      {
        id: 1,
        productId: "PROD-101",
        productName: "Organic Coffee Beans",
        timestamp: "2023-12-01 14:30:00",
        location: "Warehouse A, Bay 3",
        temperature: 18,
        threshold: 15,
        resolved: true,
      },
      {
        id: 2,
        productId: "PROD-102",
        productName: "Premium Chocolate",
        timestamp: "2023-12-02 09:15:00",
        location: "Truck #12, Compartment 2",
        temperature: 22,
        threshold: 18,
        resolved: false,
      },
      {
        id: 3,
        productId: "PROD-103",
        productName: "Organic Honey",
        timestamp: "2023-12-03 11:45:00",
        location: "Container XYZ, Shelf 2",
        temperature: 25,
        threshold: 20,
        resolved: true,
      },
    ]
  );
  const [carrierPerformance] = useState<CarrierPerformance[]>([
    {
      id: 1,
      carrier: "Speedy Logistics",
      shipments: 245,
      onTime: 228,
      delayed: 17,
      avgDeliveryDays: 2.8,
      rating: 4.7,
    },
    {
      id: 2,
      carrier: "Global Express",
      shipments: 189,
      onTime: 172,
      delayed: 17,
      avgDeliveryDays: 3.2,
      rating: 4.3,
    },
    {
      id: 3,
      carrier: "Regional Transport",
      shipments: 156,
      onTime: 141,
      delayed: 15,
      avgDeliveryDays: 3.5,
      rating: 4.1,
    },
  ]);

  // Refresh analytics data
  const refreshData = () => {
    // In a real app, this would fetch fresh data from backend
    console.log("Refreshing analytics data...");
    alert("Analytics data refreshed!");
  };

  // Resolve breach
  const resolveBreach = (id: number) => {
    setColdChainBreaches(
      coldChainBreaches.map((breach) =>
        breach.id === id ? { ...breach, resolved: true } : breach
      )
    );
  };

  // Get trend icon
  const getTrendIcon = (trend: string, size: string = "h-4 w-4") => {
    switch (trend) {
      case "up":
        return <TrendingUp className={`${size} text-green-500`} />;
      case "down":
        return <TrendingUp className={`${size} text-red-500 rotate-180`} />;
      default:
        return <div className={`${size} text-gray-500`} />;
    }
  };

  // Get performance badge
  const getPerformanceBadge = (performance: number) => {
    if (performance >= 95) {
      return (
        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500">
          Excellent
        </Badge>
      );
    } else if (performance >= 85) {
      return (
        <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500">
          Good
        </Badge>
      );
    } else if (performance >= 75) {
      return (
        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
          Fair
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-gradient-to-r from-red-500 to-rose-500">
          Poor
        </Badge>
      );
    }
  };

  // Get breach status badge
  const getBreachStatusBadge = (resolved: boolean) => {
    return resolved ? (
      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500">
        <CheckCircle className="h-3 w-3 mr-1" />
        Resolved
      </Badge>
    ) : (
      <Badge className="bg-gradient-to-r from-red-500 to-rose-500">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Active
      </Badge>
    );
  };

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
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <Button
            onClick={refreshData}
            className="flex items-center bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Wallet connection warning */}
      {!isActive && (
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-4 text-center shadow-lg">
          <div className="flex items-center justify-center">
            <BarChart className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800 font-medium">
              Wallet not connected - Connect for blockchain-verified analytics
            </span>
          </div>
        </div>
      )}

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <Card
            key={kpi.id}
            className="bg-gradient-to-br from-white to-gray-50 shadow-md"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {kpi.name}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {kpi.value}
                    {kpi.unit && (
                      <span className="text-sm font-normal">{kpi.unit}</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center">
                  {getTrendIcon(kpi.trend)}
                  <span
                    className={`ml-1 text-sm font-medium ${
                      kpi.trend === "up"
                        ? "text-green-600"
                        : kpi.trend === "down"
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {kpi.change > 0 ? "+" : ""}
                    {kpi.change}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delivery Performance Chart */}
        <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800">
              <Truck className="h-5 w-5 mr-2 text-blue-500" />
              Delivery Performance by Route
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart className="h-12 w-12 text-gray-400 mx-auto" />
                <p className="mt-2 text-gray-500">
                  Delivery performance visualization
                </p>
                <p className="text-sm text-gray-400">
                  Interactive chart would appear here
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Carrier Performance Chart */}
        <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800">
              <Package className="h-5 w-5 mr-2 text-blue-500" />
              Carrier Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <PieChart className="h-12 w-12 text-gray-400 mx-auto" />
                <p className="mt-2 text-gray-500">
                  Carrier performance breakdown
                </p>
                <p className="text-sm text-gray-400">
                  Interactive chart would appear here
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delivery KPIs */}
      <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <Truck className="h-5 w-5 mr-2 text-blue-500" />
            Route Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    On-Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Delayed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Avg. Delivery Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Performance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deliveryKpis.map((kpi) => (
                  <tr key={kpi.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {kpi.route}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {kpi.onTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {kpi.delayed}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {kpi.avgDeliveryTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPerformanceBadge(kpi.performance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Cold Chain Breaches */}
      <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
            Cold Chain Breaches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Temperature
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Threshold
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {coldChainBreaches.map((breach) => (
                  <tr key={breach.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {breach.productName}
                      </div>
                      <div className="text-sm text-gray-500">
                        #{breach.productId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {breach.timestamp}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {breach.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {breach.temperature}°C
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      &lt;{breach.threshold}°C
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getBreachStatusBadge(breach.resolved)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {!breach.resolved && (
                        <Button
                          onClick={() => resolveBreach(breach.id)}
                          size="sm"
                          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                        >
                          Resolve
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Carrier Performance */}
      <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <Package className="h-5 w-5 mr-2 text-blue-500" />
            Carrier Performance Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Carrier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Shipments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    On-Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Delayed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Avg. Delivery Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Rating
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {carrierPerformance.map((carrier) => (
                  <tr key={carrier.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {carrier.carrier}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {carrier.shipments}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {carrier.onTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {carrier.delayed}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {carrier.avgDeliveryDays}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900 mr-2">
                          {carrier.rating}/5
                        </span>
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            filled={i < Math.floor(carrier.rating)}
                          />
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Star icon component for ratings
const StarIcon = ({ filled }: { filled: boolean }) => {
  return filled ? (
    <svg
      className="w-4 h-4 text-yellow-400"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ) : (
    <svg
      className="w-4 h-4 text-gray-300"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
};

export default SupplyChainAnalytics;
