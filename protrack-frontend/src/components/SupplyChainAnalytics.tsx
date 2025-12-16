import React, { useState, useEffect } from "react";
import { useWeb3 } from "../contexts/web3ContextTypes";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { LoadingSpinner } from "./ui/loading-spinner";
import { supabase } from "../services/supabase";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Package,
  Truck,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Calendar,
  Users,
  Activity,
  Zap,
} from "lucide-react";

interface AnalyticsData {
  totalProducts: number;
  totalShipments: number;
  activeShipments: number;
  completedShipments: number;
  averageDeliveryTime: number;
  onTimeDeliveryRate: number;
  temperatureViolations: number;
  qualityScore: number;
  topLocations: { location: string; count: number }[];
  monthlyTrends: { month: string; products: number; shipments: number }[];
  statusDistribution: { status: string; count: number; percentage: number }[];
  recentAlerts: any[];
}

const SupplyChainAnalytics = () => {
  const { account, isActive } = useWeb3();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");

  // Calculate monthly trends from actual data
  const calculateMonthlyTrends = (
    products: any[],
    shipments: any[],
    startDate: Date
  ) => {
    const months = [];
    const currentDate = new Date();

    for (let i = 2; i >= 0; i--) {
      const monthDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      const nextMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i + 1,
        1
      );

      const monthProducts = products.filter((p) => {
        const createdDate = new Date(p.created_at);
        return createdDate >= monthDate && createdDate < nextMonth;
      }).length;

      const monthShipments = shipments.filter((s) => {
        const createdDate = new Date(s.created_at);
        return createdDate >= monthDate && createdDate < nextMonth;
      }).length;

      months.push({
        month: monthDate.toLocaleDateString("en-US", { month: "short" }),
        products: monthProducts,
        shipments: monthShipments,
      });
    }

    return months;
  };

  // Load analytics data
  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      switch (timeRange) {
        case "7d":
          startDate.setDate(endDate.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(endDate.getDate() - 30);
          break;
        case "90d":
          startDate.setDate(endDate.getDate() - 90);
          break;
        default:
          startDate.setDate(endDate.getDate() - 30);
      }

      // Fetch data from multiple tables
      const [productsResult, shipmentsResult, iotDataResult] =
        await Promise.all([
          supabase
            .from("products")
            .select("*")
            .gte("created_at", startDate.toISOString()),
          supabase
            .from("shipments")
            .select("*")
            .gte("created_at", startDate.toISOString()),
          supabase
            .from("iot_data")
            .select("*")
            .gte("recorded_at", startDate.toISOString()),
        ]);

      const products = productsResult.data || [];
      const shipments = shipmentsResult.data || [];
      const iotData = iotDataResult.data || [];

      // Calculate analytics
      const totalProducts = products.length;
      const totalShipments = shipments.length;
      const activeShipments = shipments.filter((s) =>
        ["requested", "approved", "shipped"].includes(s.status)
      ).length;
      const completedShipments = shipments.filter(
        (s) => s.status === "delivered" || s.status === "confirmed"
      ).length;

      // Calculate average delivery time
      const deliveredShipments = shipments.filter(
        (s) => s.delivered_at && s.shipped_at
      );
      const averageDeliveryTime =
        deliveredShipments.length > 0
          ? deliveredShipments.reduce((sum, s) => {
              const shipped = new Date(s.shipped_at!);
              const delivered = new Date(s.delivered_at!);
              return (
                sum +
                (delivered.getTime() - shipped.getTime()) /
                  (1000 * 60 * 60 * 24)
              );
            }, 0) / deliveredShipments.length
          : 0;

      // Calculate on-time delivery rate
      const onTimeShipments = shipments.filter(
        (s) =>
          s.delivered_at &&
          s.expected_arrival &&
          new Date(s.delivered_at) <= new Date(s.expected_arrival)
      ).length;
      const onTimeDeliveryRate =
        deliveredShipments.length > 0
          ? (onTimeShipments / deliveredShipments.length) * 100
          : 0;

      // Calculate temperature violations
      const temperatureViolations = iotData.filter(
        (d) => d.temperature && (d.temperature > 25 || d.temperature < 2)
      ).length;

      // Calculate quality score (based on various factors)
      const qualityScore = Math.max(
        0,
        100 - temperatureViolations * 2 - (100 - onTimeDeliveryRate) * 0.5
      );

      // Top locations
      const locationCounts: { [key: string]: number } = {};
      products.forEach((p) => {
        if (p.current_location) {
          locationCounts[p.current_location] =
            (locationCounts[p.current_location] || 0) + 1;
        }
      });
      const topLocations = Object.entries(locationCounts)
        .map(([location, count]) => ({ location, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calculate actual monthly trends from real data
      const monthlyTrends = calculateMonthlyTrends(
        products,
        shipments,
        startDate
      );

      // Status distribution
      const statusCounts: { [key: string]: number } = {};
      products.forEach((p) => {
        statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
      });
      const statusDistribution = Object.entries(statusCounts).map(
        ([status, count]) => ({
          status,
          count,
          percentage: (count / totalProducts) * 100,
        })
      );

      // Recent alerts (temperature violations)
      const recentAlerts = iotData
        .filter(
          (d) => d.temperature && (d.temperature > 25 || d.temperature < 2)
        )
        .slice(0, 5);

      setAnalytics({
        totalProducts,
        totalShipments,
        activeShipments,
        completedShipments,
        averageDeliveryTime,
        onTimeDeliveryRate,
        temperatureViolations,
        qualityScore,
        topLocations,
        monthlyTrends,
        statusDistribution,
        recentAlerts,
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const exportReport = () => {
    if (!analytics) return;

    const report = {
      generatedAt: new Date().toISOString(),
      timeRange,
      data: analytics,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `supply-chain-analytics-${timeRange}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500">Failed to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Supply Chain Analytics
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive insights into your supply chain performance
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button
            onClick={exportReport}
            className="flex items-center bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            <Download className="h-5 w-5 mr-2" />
            Export Report
          </Button>
          <Button
            onClick={loadAnalytics}
            className="flex items-center bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Products
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {analytics.totalProducts.toLocaleString()}
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>Active tracking</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Shipments
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {analytics.activeShipments}
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <Truck className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-blue-600">
              <Activity className="h-4 w-4 mr-1" />
              <span>In transit</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  On-Time Delivery
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {analytics.onTimeDeliveryRate.toFixed(1)}%
                </p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span>Performance metric</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Quality Score
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {analytics.qualityScore.toFixed(1)}
                </p>
              </div>
              <div className="rounded-full bg-amber-100 p-3">
                <Zap className="h-8 w-8 text-amber-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>Overall health</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
              Product Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.statusDistribution.map((item) => (
                <div
                  key={item.status}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <Badge className="mr-3 capitalize">{item.status}</Badge>
                    <span className="text-sm text-gray-600">
                      {item.count} products
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Locations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-green-500" />
              Top Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topLocations.map((location, index) => (
                <div
                  key={location.location}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-medium text-gray-600">
                        {index + 1}
                      </span>
                    </div>
                    <span className="font-medium">{location.location}</span>
                  </div>
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500">
                    {location.count} products
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-purple-500" />
              Delivery Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Average Delivery Time</span>
                <span className="font-medium">
                  {analytics.averageDeliveryTime.toFixed(1)} days
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Completed Shipments</span>
                <span className="font-medium">
                  {analytics.completedShipments}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">On-Time Rate</span>
                <Badge
                  className={`${
                    analytics.onTimeDeliveryRate >= 90
                      ? "bg-gradient-to-r from-green-500 to-emerald-500"
                      : analytics.onTimeDeliveryRate >= 70
                      ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                      : "bg-gradient-to-r from-red-500 to-rose-500"
                  }`}
                >
                  {analytics.onTimeDeliveryRate.toFixed(1)}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
              Quality Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Temperature Violations</span>
                <Badge
                  className={`${
                    analytics.temperatureViolations === 0
                      ? "bg-gradient-to-r from-green-500 to-emerald-500"
                      : analytics.temperatureViolations < 5
                      ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                      : "bg-gradient-to-r from-red-500 to-rose-500"
                  }`}
                >
                  {analytics.temperatureViolations}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quality Score</span>
                <span className="font-medium">
                  {analytics.qualityScore.toFixed(1)}/100
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Alert Status</span>
                <Badge
                  className={`${
                    analytics.temperatureViolations === 0
                      ? "bg-gradient-to-r from-green-500 to-emerald-500"
                      : "bg-gradient-to-r from-red-500 to-rose-500"
                  }`}
                >
                  {analytics.temperatureViolations === 0
                    ? "All Clear"
                    : "Action Required"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-blue-500" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Shipments</span>
                <span className="font-medium">{analytics.totalShipments}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active Tracking</span>
                <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500">
                  {analytics.activeShipments} active
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">System Status</span>
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Operational
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupplyChainAnalytics;
