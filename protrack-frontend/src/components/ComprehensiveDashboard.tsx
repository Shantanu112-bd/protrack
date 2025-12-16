import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  LayoutDashboard,
  Package,
  Truck,
  Scan,
  Layers,
  ShieldCheck,
  BarChart3,
  Zap,
  ClipboardCheck,
  AlertTriangle,
  Settings,
  ArrowRight,
} from "lucide-react";

const ComprehensiveDashboard = () => {
  const navigate = useNavigate();

  // Module data
  const modules = [
    {
      id: "products",
      title: "Products",
      description: "Manage product lifecycle and NFT tokenization",
      icon: Package,
      color: "from-blue-500 to-cyan-500",
      path: "/products",
      status: "active",
    },
    {
      id: "shipments",
      title: "Shipments",
      description: "Track logistics and monitor delivery status",
      icon: Truck,
      color: "from-green-500 to-emerald-500",
      path: "/shipments",
      status: "active",
    },
    {
      id: "scan",
      title: "Scan RFID",
      description: "Verify products and authenticate supply chain",
      icon: Scan,
      color: "from-purple-500 to-pink-500",
      path: "/scan",
      status: "active",
    },
    {
      id: "mint",
      title: "Mint Products",
      description: "Create NFTs for products with blockchain",
      icon: Layers,
      color: "from-amber-500 to-orange-500",
      path: "/mint",
      status: "active",
    },
    {
      id: "iot",
      title: "IoT Monitor",
      description: "Real-time sensor data and device management",
      icon: BarChart3,
      color: "from-teal-500 to-blue-500",
      path: "/iot",
      status: "active",
    },
    {
      id: "analytics",
      title: "Supply Chain Analytics",
      description: "Data insights and predictive analytics",
      icon: BarChart3,
      color: "from-indigo-500 to-purple-500",
      path: "/analytics",
      status: "enhanced",
    },
    {
      id: "optimization",
      title: "Supply Chain Optimization",
      description: "Route, inventory, and cost optimization",
      icon: Zap,
      color: "from-rose-500 to-red-500",
      path: "/optimization",
      status: "enhanced",
    },
    {
      id: "quality",
      title: "Quality Assurance",
      description: "Testing, certifications, and compliance",
      icon: ClipboardCheck,
      color: "from-emerald-500 to-green-500",
      path: "/quality",
      status: "enhanced",
    },
    {
      id: "compliance",
      title: "Compliance Management",
      description: "Regulatory compliance and audit management",
      icon: ShieldCheck,
      color: "from-violet-500 to-indigo-500",
      path: "/compliance",
      status: "enhanced",
    },
  ];

  // Navigate to module
  const goToModule = (path: string) => {
    navigate(path);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500">
            Active
          </Badge>
        );
      case "enhanced":
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500">
            Enhanced
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Comprehensive Supply Chain Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          End-to-end supply chain management and blockchain verification
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-3">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Active Products
                </p>
                <p className="text-2xl font-bold text-gray-900">1,248</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-3">
                <Truck className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Transit</p>
                <p className="text-2xl font-bold text-gray-900">86</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-amber-100 p-3">
                <ClipboardCheck className="h-6 w-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Quality Tests
                </p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-purple-100 p-3">
                <ShieldCheck className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Compliance</p>
                <p className="text-2xl font-bold text-gray-900">100%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => {
          const IconComponent = module.icon;
          return (
            <Card
              key={module.id}
              className="hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200"
              onClick={() => goToModule(module.path)}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className={`rounded-lg bg-gradient-to-r ${module.color} p-2`}
                    >
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <span className="ml-3 text-gray-900">{module.title}</span>
                  </div>
                  {getStatusBadge(module.status)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{module.description}</p>
                <Button
                  className="w-full bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToModule(module.path);
                  }}
                >
                  Access Module
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <Settings className="h-5 w-5 mr-2 text-gray-600" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              onClick={() => navigate("/products")}
            >
              <Package className="h-4 w-4 mr-2" />
              Add New Product
            </Button>
            <Button
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              onClick={() => navigate("/shipments")}
            >
              <Truck className="h-4 w-4 mr-2" />
              Create Shipment
            </Button>
            <Button
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              onClick={() => navigate("/scan")}
            >
              <Scan className="h-4 w-4 mr-2" />
              Scan Product
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComprehensiveDashboard;
