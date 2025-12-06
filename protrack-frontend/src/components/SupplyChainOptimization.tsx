import React, { useState, useEffect } from "react";
import { useWeb3 } from "../contexts/web3ContextTypes";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import {
  Download,
  RefreshCw,
  Package,
  Truck,
  Zap,
  MapPin,
  Clock,
  DollarSign,
} from "lucide-react";

// Define types
interface OptimizationOpportunity {
  id: number;
  area: string;
  description: string;
  potentialSavings: number;
  implementationEffort: string;
  priority: string;
  status: string;
}

interface RouteOptimization {
  id: number;
  shipmentId: string;
  currentRoute: string;
  optimizedRoute: string;
  distanceSaved: number;
  timeSaved: number;
  costSaved: number;
}

interface InventoryOptimization {
  id: number;
  productId: number;
  productName: string;
  currentStock: number;
  optimalStock: number;
  recommendation: string;
  savings: number;
}

const SupplyChainOptimization = () => {
  const { isActive } = useWeb3();
  const [opportunities, setOpportunities] = useState<OptimizationOpportunity[]>(
    []
  );
  const [routes, setRoutes] = useState<RouteOptimization[]>([]);
  const [inventory, setInventory] = useState<InventoryOptimization[]>([]);
  const [activeTab, setActiveTab] = useState("opportunities");
  const [userRole, setUserRole] = useState("admin"); // Add user role state

  // Mock data for demonstration
  useEffect(() => {
    // Optimization opportunities
    setOpportunities([
      {
        id: 1,
        area: "Transportation",
        description: "Consolidate shipments to reduce transportation costs",
        potentialSavings: 15000,
        implementationEffort: "Medium",
        priority: "High",
        status: "identified",
      },
      {
        id: 2,
        area: "Inventory",
        description: "Optimize safety stock levels to reduce carrying costs",
        potentialSavings: 25000,
        implementationEffort: "Low",
        priority: "High",
        status: "planned",
      },
      {
        id: 3,
        area: "Supplier",
        description: "Negotiate better terms with key suppliers",
        potentialSavings: 35000,
        implementationEffort: "High",
        priority: "Medium",
        status: "evaluating",
      },
      {
        id: 4,
        area: "Warehousing",
        description: "Implement automated storage and retrieval system",
        potentialSavings: 50000,
        implementationEffort: "High",
        priority: "Low",
        status: "identified",
      },
      {
        id: 5,
        area: "Packaging",
        description: "Switch to sustainable packaging to reduce costs",
        potentialSavings: 12000,
        implementationEffort: "Low",
        priority: "Medium",
        status: "implemented",
      },
    ]);

    // Route optimizations
    setRoutes([
      {
        id: 1,
        shipmentId: "TRK-001-ABC",
        currentRoute: "NYC → Chicago → LA",
        optimizedRoute: "NYC → Dallas → LA",
        distanceSaved: 250,
        timeSaved: 8,
        costSaved: 450,
      },
      {
        id: 2,
        shipmentId: "TRK-002-DEF",
        currentRoute: "SF → Denver → Miami",
        optimizedRoute: "SF → Phoenix → Miami",
        distanceSaved: 180,
        timeSaved: 6,
        costSaved: 320,
      },
      {
        id: 3,
        shipmentId: "TRK-003-GHI",
        currentRoute: "Seattle → Minneapolis → Atlanta",
        optimizedRoute: "Seattle → Denver → Atlanta",
        distanceSaved: 320,
        timeSaved: 10,
        costSaved: 580,
      },
    ]);

    // Inventory optimizations
    setInventory([
      {
        id: 1,
        productId: 101,
        productName: "Organic Coffee Beans",
        currentStock: 1200,
        optimalStock: 800,
        recommendation: "Reduce stock by 400 units",
        savings: 2400,
      },
      {
        id: 2,
        productId: 102,
        productName: "Premium Chocolate",
        currentStock: 600,
        optimalStock: 750,
        recommendation: "Increase stock by 150 units",
        savings: -1500,
      },
      {
        id: 3,
        productId: 103,
        productName: "Organic Honey",
        currentStock: 450,
        optimalStock: 500,
        recommendation: "Increase stock by 50 units",
        savings: -500,
      },
      {
        id: 4,
        productId: 104,
        productName: "Artisanal Cheese",
        currentStock: 900,
        optimalStock: 700,
        recommendation: "Reduce stock by 200 units",
        savings: 1800,
      },
    ]);
  }, []);

  // Refresh optimization data
  const refreshOptimizationData = async () => {
    if (!isActive) {
      console.log("Wallet not connected");
      return;
    }

    try {
      // In a real implementation, you'd fetch actual optimization data from the blockchain
      console.log("Refreshing optimization data...");
    } catch (error) {
      console.error("Error refreshing optimization data:", error);
    }
  };

  // Export optimization data
  const exportOptimizationData = () => {
    // In a real app, this would export data to CSV/PDF
    console.log("Exporting optimization data...");
  };

  // Format priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600">
            High
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
            Medium
          </Badge>
        );
      case "low":
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
            Low
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gradient-to-r from-gray-300 to-gray-500 hover:from-gray-400 hover:to-gray-600">
            {priority}
          </Badge>
        );
    }
  };

  // Format status badge
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "identified":
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
            Identified
          </Badge>
        );
      case "planned":
        return (
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
            Planned
          </Badge>
        );
      case "evaluating":
        return (
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
            Evaluating
          </Badge>
        );
      case "implemented":
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
            Implemented
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gradient-to-r from-gray-300 to-gray-500 hover:from-gray-400 hover:to-gray-600">
            {status}
          </Badge>
        );
    }
  };

  // Format effort badge
  const getEffortBadge = (effort: string) => {
    switch (effort.toLowerCase()) {
      case "low":
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
            Low
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
            Medium
          </Badge>
        );
      case "high":
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600">
            High
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gradient-to-r from-gray-300 to-gray-500 hover:from-gray-400 hover:to-gray-600">
            {effort}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Supply Chain Optimization
          </h1>
          <p className="text-gray-600 mt-2">
            Identify opportunities to improve efficiency and reduce costs
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
          <Button
            onClick={refreshOptimizationData}
            className="flex items-center bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={exportOptimizationData}
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
            <Zap className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800 font-medium">
              Wallet not connected - Connect to interact with blockchain
              features
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("opportunities")}
          className={`py-3 px-6 font-medium text-sm ${
            activeTab === "opportunities"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Opportunities
        </button>
        <button
          onClick={() => setActiveTab("routes")}
          className={`py-3 px-6 font-medium text-sm ${
            activeTab === "routes"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Route Optimization
        </button>
        <button
          onClick={() => setActiveTab("inventory")}
          className={`py-3 px-6 font-medium text-sm ${
            activeTab === "inventory"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Inventory
        </button>
      </div>

      {/* Opportunities Tab */}
      {activeTab === "opportunities" && (
        <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800">
              <Zap className="h-5 w-5 mr-2 text-blue-500" />
              Optimization Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="text-gray-700 font-bold">
                      Area
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Description
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Savings
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Effort
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Priority
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {opportunities.map((opportunity) => (
                    <TableRow key={opportunity.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {opportunity.area}
                      </TableCell>
                      <TableCell>{opportunity.description}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-green-500 mr-1" />
                          <span className="font-medium">
                            ${opportunity.potentialSavings.toLocaleString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getEffortBadge(opportunity.implementationEffort)}
                      </TableCell>
                      <TableCell>
                        {getPriorityBadge(opportunity.priority)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(opportunity.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Route Optimization Tab */}
      {activeTab === "routes" && (
        <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800">
              <MapPin className="h-5 w-5 mr-2 text-blue-500" />
              Route Optimization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="text-gray-700 font-bold">
                      Shipment
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Current Route
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Optimized Route
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Distance Saved
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Time Saved
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Cost Saved
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {routes.map((route) => (
                    <TableRow key={route.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {route.shipmentId}
                      </TableCell>
                      <TableCell>{route.currentRoute}</TableCell>
                      <TableCell className="font-medium text-green-600">
                        {route.optimizedRoute}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Truck className="h-4 w-4 text-blue-500 mr-1" />
                          {route.distanceSaved} miles
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-purple-500 mr-1" />
                          {route.timeSaved} hrs
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-green-500 mr-1" />
                          ${route.costSaved}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Tab */}
      {activeTab === "inventory" && (
        <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800">
              <Package className="h-5 w-5 mr-2 text-blue-500" />
              Inventory Optimization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="text-gray-700 font-bold">
                      Product
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Current Stock
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Optimal Stock
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Recommendation
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Savings
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.map((item) => (
                    <TableRow key={item.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {item.productName}
                      </TableCell>
                      <TableCell>{item.currentStock} units</TableCell>
                      <TableCell>{item.optimalStock} units</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            item.savings > 0
                              ? "bg-green-100 text-green-800"
                              : item.savings < 0
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {item.recommendation}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <DollarSign
                            className={`h-4 w-4 mr-1 ${
                              item.savings > 0
                                ? "text-green-500"
                                : item.savings < 0
                                ? "text-red-500"
                                : "text-gray-500"
                            }`}
                          />
                          <span
                            className={
                              item.savings > 0
                                ? "text-green-600 font-medium"
                                : item.savings < 0
                                ? "text-red-600 font-medium"
                                : "text-gray-600"
                            }
                          >
                            {item.savings > 0 ? "+" : ""}
                            {item.savings === 0
                              ? "No change"
                              : `$${item.savings}`}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SupplyChainOptimization;
