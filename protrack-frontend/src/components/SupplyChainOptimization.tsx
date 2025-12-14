import React, { useState } from "react";
import { useWeb3 } from "../contexts/web3ContextTypes";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Route,
  Package,
  Zap,
  Calculator,
  TrendingDown,
  Play,
  Pause,
  Clock,
} from "lucide-react";

// Define types
interface RouteOptimization {
  id: number;
  origin: string;
  destination: string;
  distance: number;
  estimatedTime: string;
  cost: number;
  co2Emissions: number;
  suggested: boolean;
}

interface InventoryOptimization {
  id: number;
  productId: string;
  productName: string;
  currentStock: number;
  reorderPoint: number;
  suggestedOrder: number;
  leadTime: number;
  spoilageRisk: number;
}

interface GasOptimization {
  id: number;
  operation: string;
  currentGas: number;
  optimizedGas: number;
  savings: number;
  bundlingOpportunity: boolean;
}

interface SchedulerJob {
  id: number;
  name: string;
  type: string;
  schedule: string;
  lastRun: string;
  nextRun: string;
  status: string;
}

const SupplyChainOptimization = () => {
  const { isActive } = useWeb3();
  const [optimizationMode, setOptimizationMode] = useState("routes");
  const [routeOptimizations, setRouteOptimizations] = useState<
    RouteOptimization[]
  >([
    {
      id: 1,
      origin: "New York, NY",
      destination: "Los Angeles, CA",
      distance: 2790,
      estimatedTime: "4.2 days",
      cost: 1250,
      co2Emissions: 420,
      suggested: true,
    },
    {
      id: 2,
      origin: "Chicago, IL",
      destination: "Miami, FL",
      distance: 1380,
      estimatedTime: "2.1 days",
      cost: 780,
      co2Emissions: 210,
      suggested: false,
    },
    {
      id: 3,
      origin: "Seattle, WA",
      destination: "Atlanta, GA",
      distance: 2150,
      estimatedTime: "3.5 days",
      cost: 1020,
      co2Emissions: 330,
      suggested: true,
    },
  ]);
  const [inventoryOptimizations] = useState<InventoryOptimization[]>([
    {
      id: 1,
      productId: "PROD-101",
      productName: "Organic Coffee Beans",
      currentStock: 1250,
      reorderPoint: 800,
      suggestedOrder: 0,
      leadTime: 5,
      spoilageRisk: 15,
    },
    {
      id: 2,
      productId: "PROD-102",
      productName: "Premium Chocolate",
      currentStock: 750,
      reorderPoint: 1000,
      suggestedOrder: 500,
      leadTime: 7,
      spoilageRisk: 8,
    },
    {
      id: 3,
      productId: "PROD-103",
      productName: "Organic Honey",
      currentStock: 2000,
      reorderPoint: 1500,
      suggestedOrder: 0,
      leadTime: 3,
      spoilageRisk: 5,
    },
  ]);
  const [gasOptimizations] = useState<GasOptimization[]>([
    {
      id: 1,
      operation: "Batch Minting",
      currentGas: 250000,
      optimizedGas: 180000,
      savings: 70000,
      bundlingOpportunity: true,
    },
    {
      id: 2,
      operation: "Quality Certifications",
      currentGas: 120000,
      optimizedGas: 95000,
      savings: 25000,
      bundlingOpportunity: true,
    },
    {
      id: 3,
      operation: "Shipment Updates",
      currentGas: 85000,
      optimizedGas: 65000,
      savings: 20000,
      bundlingOpportunity: false,
    },
  ]);
  const [schedulerJobs] = useState<SchedulerJob[]>([
    {
      id: 1,
      name: "Daily Inventory Check",
      type: "inventory",
      schedule: "0 9 * * *",
      lastRun: "2023-12-01 09:00:00",
      nextRun: "2023-12-02 09:00:00",
      status: "active",
    },
    {
      id: 2,
      name: "Weekly Route Optimization",
      type: "routing",
      schedule: "0 2 * * 1",
      lastRun: "2023-11-27 02:00:00",
      nextRun: "2023-12-04 02:00:00",
      status: "active",
    },
    {
      id: 3,
      name: "Monthly Cost Analysis",
      type: "analytics",
      schedule: "0 0 1 * *",
      lastRun: "2023-11-01 00:00:00",
      nextRun: "2023-12-01 00:00:00",
      status: "pending",
    },
  ]);

  // Run optimization
  const runOptimization = () => {
    // In a real app, this would trigger optimization algorithms
    console.log("Running optimization for:", optimizationMode);
    alert(`Optimization started for ${optimizationMode}!`);

    // Simulate optimization results
    if (optimizationMode === "routes") {
      setRouteOptimizations([
        ...routeOptimizations,
        {
          id: routeOptimizations.length + 1,
          origin: "Boston, MA",
          destination: "Dallas, TX",
          distance: 1750,
          estimatedTime: "2.8 days",
          cost: 920,
          co2Emissions: 280,
          suggested: true,
        },
      ]);
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500">
            <Play className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "paused":
        return (
          <Badge className="bg-gradient-to-r from-gray-500 to-gray-700">
            <Pause className="h-3 w-3 mr-1" />
            Paused
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

  // Get risk level badge
  const getRiskBadge = (risk: number) => {
    if (risk >= 15) {
      return (
        <Badge className="bg-gradient-to-r from-red-500 to-rose-500">
          High Risk
        </Badge>
      );
    } else if (risk >= 10) {
      return (
        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
          Medium Risk
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500">
          Low Risk
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
            Optimize routes, inventory, costs, and scheduling
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <select
            value={optimizationMode}
            onChange={(e) => setOptimizationMode(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="routes">Route Optimization</option>
            <option value="inventory">Inventory Optimization</option>
            <option value="gas">Gas Optimization</option>
            <option value="scheduling">Scheduler</option>
          </select>
          <Button
            onClick={runOptimization}
            className="flex items-center bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Zap className="h-5 w-5 mr-2" />
            Run Optimization
          </Button>
        </div>
      </div>

      {/* Wallet connection warning */}
      {!isActive && (
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-4 text-center shadow-lg">
          <div className="flex items-center justify-center">
            <Calculator className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800 font-medium">
              Wallet not connected - Connect for blockchain-optimized operations
            </span>
          </div>
        </div>
      )}

      {/* Route Optimizations */}
      {optimizationMode === "routes" && (
        <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800">
              <Route className="h-5 w-5 mr-2 text-blue-500" />
              Route Optimization Suggestions
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
                      Distance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Est. Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Cost ($)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      CO2 (kg)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Recommendation
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {routeOptimizations.map((route) => (
                    <tr
                      key={route.id}
                      className={`hover:bg-gray-50 ${
                        route.suggested ? "bg-blue-50" : ""
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {route.origin}
                        </div>
                        <div className="text-sm text-gray-500">to</div>
                        <div className="text-sm font-medium text-gray-900">
                          {route.destination}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {route.distance.toLocaleString()} miles
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {route.estimatedTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${route.cost.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {route.co2Emissions.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {route.suggested ? (
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500">
                            <TrendingDown className="h-3 w-3 mr-1" />
                            Suggested
                          </Badge>
                        ) : (
                          <Badge className="bg-gradient-to-r from-gray-300 to-gray-500">
                            Current
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Optimizations */}
      {optimizationMode === "inventory" && (
        <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800">
              <Package className="h-5 w-5 mr-2 text-blue-500" />
              Inventory Optimization Recommendations
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
                      Current Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Reorder Point
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Suggested Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Lead Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Spoilage Risk
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inventoryOptimizations.map((inventory) => (
                    <tr key={inventory.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {inventory.productName}
                        </div>
                        <div className="text-sm text-gray-500">
                          #{inventory.productId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {inventory.currentStock.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {inventory.reorderPoint.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {inventory.suggestedOrder > 0 ? (
                          <span className="font-bold text-green-600">
                            +{inventory.suggestedOrder.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {inventory.leadTime} days
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRiskBadge(inventory.spoilageRisk)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gas Optimizations */}
      {optimizationMode === "gas" && (
        <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800">
              <Zap className="h-5 w-5 mr-2 text-blue-500" />
              Gas Optimization Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Operation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Current Gas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Optimized Gas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Savings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Bundling
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {gasOptimizations.map((gas) => (
                    <tr key={gas.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {gas.operation}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {gas.currentGas.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {gas.optimizedGas.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold">
                        -{gas.savings.toLocaleString()} (
                        {Math.round((gas.savings / gas.currentGas) * 100)}%)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {gas.bundlingOpportunity ? (
                          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500">
                            Opportunity
                          </Badge>
                        ) : (
                          <span>-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scheduler */}
      {optimizationMode === "scheduling" && (
        <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800">
              <Clock className="h-5 w-5 mr-2 text-blue-500" />
              Scheduled Optimization Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Job Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Schedule
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Last Run
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Next Run
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {schedulerJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {job.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
                          {job.type}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.schedule}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.lastRun}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.nextRun}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(job.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SupplyChainOptimization;
