import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import EnhancedRFIDScanner from "./EnhancedRFIDScanner";
import SupplyChainDashboard from "./SupplyChainDashboard";
import IoTVisualization from "./IoTVisualization";
import MPCApprovalInterface from "./MPCApprovalInterface";
import ProductVerification from "./ProductVerification";
import AdminAnalytics from "./AdminAnalytics";
import EnhancedProductTrackingMap from "./EnhancedProductTrackingMap";
import {
  Package,
  Scan,
  Activity,
  Shield,
  MapPin,
  BarChart3,
  User,
  LogOut,
  Wrench,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type UserRole =
  | "manufacturer"
  | "transporter"
  | "retailer"
  | "admin"
  | "consumer";

const ProTrackUnifiedDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<UserRole>("manufacturer");
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleSignOut = () => {
    // In a real implementation, we would disconnect the wallet here
    navigate("/signin");
  };

  const handleRoleChange = (role: UserRole) => {
    setUserRole(role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800/30 backdrop-blur-lg border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-lg">PT</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              ProTrack Unified Dashboard
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-gray-400" />
              <div className="text-sm">
                <div className="text-gray-400">Connected as</div>
                <div className="font-medium text-white capitalize">
                  {userRole}
                </div>
              </div>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700/50 flex items-center"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Role Selection */}
      <div className="container mx-auto px-4 py-6">
        <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center">
              <Wrench className="w-5 h-5 mr-2" />
              Select Your Role
            </CardTitle>
            <CardDescription className="text-gray-400">
              Choose your role in the supply chain to view the appropriate
              dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                variant={userRole === "manufacturer" ? "default" : "outline"}
                onClick={() => handleRoleChange("manufacturer")}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  userRole === "manufacturer"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                    : "border-gray-600 text-gray-300 hover:bg-gray-700/50"
                }`}
              >
                Manufacturer
              </Button>
              <Button
                variant={userRole === "transporter" ? "default" : "outline"}
                onClick={() => handleRoleChange("transporter")}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  userRole === "transporter"
                    ? "bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-lg"
                    : "border-gray-600 text-gray-300 hover:bg-gray-700/50"
                }`}
              >
                Transporter
              </Button>
              <Button
                variant={userRole === "retailer" ? "default" : "outline"}
                onClick={() => handleRoleChange("retailer")}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  userRole === "retailer"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
                    : "border-gray-600 text-gray-300 hover:bg-gray-700/50"
                }`}
              >
                Retailer
              </Button>
              <Button
                variant={userRole === "admin" ? "default" : "outline"}
                onClick={() => handleRoleChange("admin")}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  userRole === "admin"
                    ? "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-lg"
                    : "border-gray-600 text-gray-300 hover:bg-gray-700/50"
                }`}
              >
                Admin
              </Button>
              <Button
                variant={userRole === "consumer" ? "default" : "outline"}
                onClick={() => handleRoleChange("consumer")}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  userRole === "consumer"
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-lg"
                    : "border-gray-600 text-gray-300 hover:bg-gray-700/50"
                }`}
              >
                Consumer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <div className="container mx-auto px-4 pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 mb-6 bg-gray-800/50 border border-gray-700 rounded-xl p-1">
            <TabsTrigger
              value="dashboard"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              <Package className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger
              value="scanner"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              <Scan className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">RFID Scanner</span>
            </TabsTrigger>
            <TabsTrigger
              value="iot"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              <Activity className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">IoT Data</span>
            </TabsTrigger>
            <TabsTrigger
              value="map"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              <MapPin className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Tracking Map</span>
            </TabsTrigger>
            <TabsTrigger
              value="mpc"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              <Shield className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">MPC Wallet</span>
            </TabsTrigger>
            <TabsTrigger
              value="verify"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              <Package className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Verify</span>
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-0">
            <SupplyChainDashboard />
          </TabsContent>

          <TabsContent value="scanner" className="mt-0">
            <EnhancedRFIDScanner />
          </TabsContent>

          <TabsContent value="iot" className="mt-0">
            <IoTVisualization />
          </TabsContent>

          <TabsContent value="map" className="mt-0">
            <EnhancedProductTrackingMap />
          </TabsContent>

          <TabsContent value="mpc" className="mt-0">
            <MPCApprovalInterface />
          </TabsContent>

          <TabsContent value="verify" className="mt-0">
            <ProductVerification />
          </TabsContent>

          <TabsContent value="analytics" className="mt-0">
            <AdminAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProTrackUnifiedDashboard;
