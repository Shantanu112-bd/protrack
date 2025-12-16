import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWeb3 } from "../contexts/web3ContextTypes";
import WalletConnection from "./WalletConnection";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { LoadingSpinner } from "./ui/loading-spinner";
import {
  dashboardService,
  DashboardStats,
  RecentActivity,
  SystemAlert,
} from "../services/dashboardService";
import {
  Package,
  Truck,
  Layers,
  BarChart3,
  ShieldCheck,
  ClipboardCheck,
  AlertTriangle,
  TrendingUp,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { account, chainId, isActive } = useWeb3();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setRefreshing(true);
      const [statsData, activityData, alertsData] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getRecentActivity(),
        dashboardService.getSystemAlerts(),
      ]);

      setStats(statsData);
      setRecentActivity(activityData);
      setAlerts(alertsData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, [account, isActive]);

  // Quick actions
  const handleQuickAction = (action: string) => {
    switch (action) {
      case "add-product":
        navigate("/products");
        break;
      case "create-shipment":
        navigate("/shipments");
        break;
      case "mint-nft":
        navigate("/mint");
        break;
      case "run-test":
        navigate("/quality");
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  const getIconByType = (type: string) => {
    switch (type) {
      case "product":
        return <Package className="h-5 w-5 text-blue-500" />;
      case "shipment":
        return <Truck className="h-5 w-5 text-green-500" />;
      case "quality":
        return <ClipboardCheck className="h-5 w-5 text-amber-500" />;
      case "compliance":
        return <ShieldCheck className="h-5 w-5 text-purple-500" />;
      default:
        return <BarChart3 className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "in-progress":
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500">
            <Clock className="h-3 w-3 mr-1" />
            In Progress
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gradient-to-r from-gray-300 to-gray-500">
            {status}
          </Badge>
        );
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "critical":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "info":
        return <BarChart3 className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getAlertBadge = (type: string) => {
    switch (type) {
      case "warning":
        return (
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
            Warning
          </Badge>
        );
      case "critical":
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-rose-500">
            Critical
          </Badge>
        );
      case "info":
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500">
            Info
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gradient-to-r from-gray-300 to-gray-500">
            {type}
          </Badge>
        );
    }
  };

  return (
    <div className="p-8">
      {/* Wallet Connection Status */}
      <div className="mb-8">
        <WalletConnection />
      </div>

      {/* Network Status Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
          Network Status
        </h2>
        {isActive ? (
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-700 dark:text-gray-300">
                Connected to wallet
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Account
                </p>
                <p className="font-mono text-gray-800 dark:text-white break-all">
                  {account?.substring(0, 6)}...
                  {account?.substring(account.length - 4)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Chain ID
                </p>
                <p className="text-gray-800 dark:text-white">{chainId}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
            <span className="text-gray-700 dark:text-gray-300">
              Wallet not connected
            </span>
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Supply Chain Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Real-time visibility into your supply chain operations
          </p>
        </div>
        <Button
          onClick={loadDashboardData}
          disabled={refreshing}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Products Tracked
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.productsTracked.toLocaleString() || 0}
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <div
                className={`w-2 h-2 rounded-full mr-2 ${
                  stats?.networkStatus === "connected"
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              ></div>
              <span className="text-gray-600">
                {stats?.networkStatus === "connected"
                  ? "Blockchain Connected"
                  : "Offline Mode"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Shipments
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.activeShipments || 0}
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <Truck className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>Real-time tracking</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Verified Items
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.verifiedItems.toLocaleString() || 0}
                </p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <ShieldCheck className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-purple-600">
              <ShieldCheck className="h-4 w-4 mr-1" />
              <span>Blockchain verified</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Quality Tests
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.qualityTests || 0}
                </p>
              </div>
              <div className="rounded-full bg-amber-100 p-3">
                <ClipboardCheck className="h-8 w-8 text-amber-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span>Automated testing</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Compliance Rate
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.complianceRate.toFixed(1) || 0}%
                </p>
              </div>
              <div className="rounded-full bg-indigo-100 p-3">
                <ShieldCheck className="h-8 w-8 text-indigo-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <ShieldCheck className="h-4 w-4 mr-1" />
              <span>Regulatory compliant</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Alerts
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.alerts || 0}
                </p>
              </div>
              <div className="rounded-full bg-red-100 p-3">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-red-600">
              <AlertTriangle className="h-4 w-4 mr-1" />
              <span>{stats?.alerts || 0} require attention</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-800 dark:text-white">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="mr-4 mt-1">
                        {getIconByType(activity.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium text-gray-800 dark:text-white">
                            {activity.title}
                          </p>
                          {getStatusBadge(activity.status)}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {activity.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{activity.time}</span>
                          </div>
                          {activity.txHash && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 text-xs"
                              onClick={() =>
                                window.open(
                                  `https://etherscan.io/tx/${activity.txHash}`,
                                  "_blank"
                                )
                              }
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Tx
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No recent activity</p>
                    <p className="text-sm">
                      Start by creating products or shipments
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-lg h-full">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-800 dark:text-white">
                <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
                System Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.length > 0 ? (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 ${
                        alert.type === "critical"
                          ? "border-red-500"
                          : alert.type === "warning"
                          ? "border-yellow-500"
                          : alert.type === "info"
                          ? "border-blue-500"
                          : "border-green-500"
                      }`}
                    >
                      <div className="flex items-start">
                        <div className="mr-3 mt-1">
                          {getAlertIcon(alert.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className="font-medium text-gray-800 dark:text-white">
                              {alert.title}
                            </p>
                            {getAlertBadge(alert.type)}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {alert.description}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{alert.time}</span>
                            </div>
                            {alert.actionRequired && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 text-xs"
                              >
                                Take Action
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No active alerts</p>
                    <p className="text-sm">All systems operating normally</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <Zap className="h-5 w-5 mr-2 text-gray-600" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              onClick={() => handleQuickAction("add-product")}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white h-16"
            >
              <Package className="h-5 w-5 mr-2" />
              <span>Add Product</span>
            </Button>
            <Button
              onClick={() => handleQuickAction("create-shipment")}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-16"
            >
              <Truck className="h-5 w-5 mr-2" />
              <span>Create Shipment</span>
            </Button>
            <Button
              onClick={() => handleQuickAction("mint-nft")}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-16"
            >
              <Layers className="h-5 w-5 mr-2" />
              <span>Mint NFT</span>
            </Button>
            <Button
              onClick={() => handleQuickAction("run-test")}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white h-16"
            >
              <ClipboardCheck className="h-5 w-5 mr-2" />
              <span>Run Test</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
