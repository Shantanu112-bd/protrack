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
  MapPin,
  Truck,
  DollarSign,
  Calendar,
  Filter,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Settings,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  ChevronUp,
  ChevronDown,
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
  vehicleType: string;
  driver: string;
  stops: number;
  trafficDelay: string;
  weatherImpact: string;
  efficiencyScore: number;
  savingsPotential: number;
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
  warehouseLocation: string;
  lastRestocked: string;
  minStockLevel: number;
  maxStockLevel: number;
  turnoverRate: number;
  demandForecast: number;
  storageCost: number;
}

interface GasOptimization {
  id: number;
  operation: string;
  currentGas: number;
  optimizedGas: number;
  savings: number;
  bundlingOpportunity: boolean;
  batchSize: number;
  priority: "high" | "medium" | "low";
  estimatedExecutionTime: string;
  gasPrice: number;
  potentialSavingsUSD: number;
}

interface SchedulerJob {
  id: number;
  name: string;
  type: string;
  schedule: string;
  lastRun: string;
  nextRun: string;
  status: string;
  dependencies: string[];
  retryCount: number;
  maxRetries: number;
  notificationEmails: string[];
  executionTime: number;
  resourceUsage: string;
}

interface CostOptimization {
  id: number;
  category: string;
  currentCost: number;
  optimizedCost: number;
  savings: number;
  savingsPercentage: number;
  recommendation: string;
  implementationDifficulty: "easy" | "medium" | "hard";
}

const SupplyChainOptimization = () => {
  const { isActive } = useWeb3();
  const [optimizationMode, setOptimizationMode] = useState("routes");
  const [expandedRows, setExpandedRows] = useState<number[]>([]);

  // State for editable forms
  const [editingRoute, setEditingRoute] = useState<RouteOptimization | null>(
    null
  );
  const [editingInventory, setEditingInventory] =
    useState<InventoryOptimization | null>(null);
  const [editingGas, setEditingGas] = useState<GasOptimization | null>(null);
  const [editingScheduler, setEditingScheduler] = useState<SchedulerJob | null>(
    null
  );

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
      vehicleType: "Refrigerated Truck",
      driver: "John Smith",
      stops: 2,
      trafficDelay: "30 minutes",
      weatherImpact: "Clear",
      efficiencyScore: 87,
      savingsPotential: 150,
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
      vehicleType: "Standard Van",
      driver: "Maria Garcia",
      stops: 1,
      trafficDelay: "15 minutes",
      weatherImpact: "Rain",
      efficiencyScore: 76,
      savingsPotential: 95,
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
      vehicleType: "Refrigerated Truck",
      driver: "Robert Johnson",
      stops: 3,
      trafficDelay: "45 minutes",
      weatherImpact: "Snow",
      efficiencyScore: 82,
      savingsPotential: 120,
    },
  ]);

  const [inventoryOptimizations, setInventoryOptimizations] = useState<
    InventoryOptimization[]
  >([
    {
      id: 1,
      productId: "PROD-101",
      productName: "Organic Coffee Beans",
      currentStock: 1250,
      reorderPoint: 800,
      suggestedOrder: 0,
      leadTime: 5,
      spoilageRisk: 15,
      warehouseLocation: "Warehouse A, Bay 3",
      lastRestocked: "2023-11-25",
      minStockLevel: 500,
      maxStockLevel: 2000,
      turnoverRate: 2.5,
      demandForecast: 1500,
      storageCost: 250,
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
      warehouseLocation: "Warehouse B, Shelf 2",
      lastRestocked: "2023-11-28",
      minStockLevel: 300,
      maxStockLevel: 1500,
      turnoverRate: 1.8,
      demandForecast: 900,
      storageCost: 180,
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
      warehouseLocation: "Warehouse C, Rack 1",
      lastRestocked: "2023-11-30",
      minStockLevel: 800,
      maxStockLevel: 3000,
      turnoverRate: 3.2,
      demandForecast: 1800,
      storageCost: 320,
    },
  ]);

  const [gasOptimizations, setGasOptimizations] = useState<GasOptimization[]>([
    {
      id: 1,
      operation: "Batch Minting",
      currentGas: 250000,
      optimizedGas: 180000,
      savings: 70000,
      bundlingOpportunity: true,
      batchSize: 50,
      priority: "high",
      estimatedExecutionTime: "2 minutes",
      gasPrice: 25,
      potentialSavingsUSD: 1750,
    },
    {
      id: 2,
      operation: "Quality Certifications",
      currentGas: 120000,
      optimizedGas: 95000,
      savings: 25000,
      bundlingOpportunity: true,
      batchSize: 25,
      priority: "medium",
      estimatedExecutionTime: "1 minute",
      gasPrice: 25,
      potentialSavingsUSD: 625,
    },
    {
      id: 3,
      operation: "Shipment Updates",
      currentGas: 85000,
      optimizedGas: 65000,
      savings: 20000,
      bundlingOpportunity: false,
      batchSize: 10,
      priority: "low",
      estimatedExecutionTime: "30 seconds",
      gasPrice: 25,
      potentialSavingsUSD: 500,
    },
  ]);

  const [schedulerJobs, setSchedulerJobs] = useState<SchedulerJob[]>([
    {
      id: 1,
      name: "Daily Inventory Check",
      type: "inventory",
      schedule: "0 9 * * *",
      lastRun: "2023-12-01 09:00:00",
      nextRun: "2023-12-02 09:00:00",
      status: "active",
      dependencies: [],
      retryCount: 0,
      maxRetries: 3,
      notificationEmails: ["manager@company.com"],
      executionTime: 45,
      resourceUsage: "Low",
    },
    {
      id: 2,
      name: "Weekly Route Optimization",
      type: "routing",
      schedule: "0 2 * * 1",
      lastRun: "2023-11-27 02:00:00",
      nextRun: "2023-12-04 02:00:00",
      status: "active",
      dependencies: ["Daily Inventory Check"],
      retryCount: 1,
      maxRetries: 3,
      notificationEmails: ["logistics@company.com", "manager@company.com"],
      executionTime: 120,
      resourceUsage: "Medium",
    },
    {
      id: 3,
      name: "Monthly Cost Analysis",
      type: "analytics",
      schedule: "0 0 1 * *",
      lastRun: "2023-11-01 00:00:00",
      nextRun: "2023-12-01 00:00:00",
      status: "pending",
      dependencies: ["Daily Inventory Check", "Weekly Route Optimization"],
      retryCount: 0,
      maxRetries: 2,
      notificationEmails: ["finance@company.com", "manager@company.com"],
      executionTime: 300,
      resourceUsage: "High",
    },
  ]);

  const [costOptimizations] = useState<CostOptimization[]>([
    {
      id: 1,
      category: "Transportation",
      currentCost: 15000,
      optimizedCost: 12750,
      savings: 2250,
      savingsPercentage: 15,
      recommendation: "Consolidate shipments to reduce transportation costs",
      implementationDifficulty: "easy",
    },
    {
      id: 2,
      category: "Storage",
      currentCost: 8000,
      optimizedCost: 6800,
      savings: 1200,
      savingsPercentage: 15,
      recommendation: "Optimize warehouse layout to reduce handling costs",
      implementationDifficulty: "medium",
    },
    {
      id: 3,
      category: "Packaging",
      currentCost: 5000,
      optimizedCost: 4250,
      savings: 750,
      savingsPercentage: 15,
      recommendation: "Switch to more efficient packaging materials",
      implementationDifficulty: "easy",
    },
  ]);

  // Toggle row expansion
  const toggleRowExpansion = (id: number) => {
    if (expandedRows.includes(id)) {
      setExpandedRows(expandedRows.filter((rowId) => rowId !== id));
    } else {
      setExpandedRows([...expandedRows, id]);
    }
  };

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
          vehicleType: "Refrigerated Truck",
          driver: "Sarah Wilson",
          stops: 1,
          trafficDelay: "20 minutes",
          weatherImpact: "Clear",
          efficiencyScore: 91,
          savingsPotential: 135,
        },
      ]);
    } else if (optimizationMode === "inventory") {
      setInventoryOptimizations([
        ...inventoryOptimizations,
        {
          id: inventoryOptimizations.length + 1,
          productId: "PROD-104",
          productName: "Artisanal Tea",
          currentStock: 600,
          reorderPoint: 500,
          suggestedOrder: 400,
          leadTime: 4,
          spoilageRisk: 12,
          warehouseLocation: "Warehouse D, Section 2",
          lastRestocked: "2023-12-01",
          minStockLevel: 300,
          maxStockLevel: 1200,
          turnoverRate: 2.1,
          demandForecast: 750,
          storageCost: 150,
        },
      ]);
    }
  };

  // Refresh data
  const refreshData = () => {
    console.log("Refreshing data for:", optimizationMode);
    alert(`Data refreshed for ${optimizationMode}!`);
  };

  // View route on map
  const viewRouteOnMap = (routeId: number) => {
    console.log("Viewing route on map:", routeId);
    alert(`Opening map view for route ${routeId}`);
  };

  // Retry job
  const retryJob = (jobId: number) => {
    console.log("Retrying job:", jobId);
    alert(`Retrying job ${jobId}`);

    // Update job status
    setSchedulerJobs(
      schedulerJobs.map((job) =>
        job.id === jobId
          ? { ...job, status: "active", retryCount: job.retryCount + 1 }
          : job
      )
    );
  };

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-rose-500">
            High
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
            Medium
          </Badge>
        );
      case "low":
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500">
            Low
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gradient-to-r from-gray-300 to-gray-500">
            {priority}
          </Badge>
        );
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

  // Get difficulty badge
  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500">
            Easy
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
            Medium
          </Badge>
        );
      case "hard":
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-rose-500">
            Hard
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gradient-to-r from-gray-300 to-gray-500">
            {difficulty}
          </Badge>
        );
    }
  };

  // Handle save for route editing
  const saveRouteEdit = () => {
    if (editingRoute) {
      setRouteOptimizations(
        routeOptimizations.map((route) =>
          route.id === editingRoute.id ? editingRoute : route
        )
      );
      setEditingRoute(null);
    }
  };

  // Handle save for inventory editing
  const saveInventoryEdit = () => {
    if (editingInventory) {
      setInventoryOptimizations(
        inventoryOptimizations.map((inventory) =>
          inventory.id === editingInventory.id ? editingInventory : inventory
        )
      );
      setEditingInventory(null);
    }
  };

  // Handle save for gas editing
  const saveGasEdit = () => {
    if (editingGas) {
      setGasOptimizations(
        gasOptimizations.map((gas) =>
          gas.id === editingGas.id ? editingGas : gas
        )
      );
      setEditingGas(null);
    }
  };

  // Handle save for scheduler editing
  const saveSchedulerEdit = () => {
    if (editingScheduler) {
      setSchedulerJobs(
        schedulerJobs.map((job) =>
          job.id === editingScheduler.id ? editingScheduler : job
        )
      );
      setEditingScheduler(null);
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
            <option value="cost">Cost Optimization</option>
          </select>
          <Button
            onClick={runOptimization}
            className="flex items-center bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Zap className="h-5 w-5 mr-2" />
            Run Optimization
          </Button>
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
                      Efficiency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Recommendation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {routeOptimizations.map((route) => (
                    <React.Fragment key={route.id}>
                      <tr
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <Activity className="h-4 w-4 text-blue-500 mr-1" />
                            {route.efficiencyScore}%
                          </div>
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => viewRouteOnMap(route.id)}
                            >
                              <MapPin className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingRoute({ ...route })}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleRowExpansion(route.id)}
                            >
                              {expandedRows.includes(route.id) ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                      {expandedRows.includes(route.id) && (
                        <tr className="bg-gray-50">
                          <td colSpan={8} className="px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  Details
                                </h4>
                                <ul className="mt-2 space-y-1 text-sm text-gray-600">
                                  <li>Vehicle: {route.vehicleType}</li>
                                  <li>Driver: {route.driver}</li>
                                  <li>Stops: {route.stops}</li>
                                </ul>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  Conditions
                                </h4>
                                <ul className="mt-2 space-y-1 text-sm text-gray-600">
                                  <li>Traffic Delay: {route.trafficDelay}</li>
                                  <li>Weather Impact: {route.weatherImpact}</li>
                                </ul>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  Savings
                                </h4>
                                <ul className="mt-2 space-y-1 text-sm text-gray-600">
                                  <li>
                                    Potential Savings: ${route.savingsPotential}
                                  </li>
                                  <li>
                                    Efficiency Score: {route.efficiencyScore}%
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Forecast
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Storage Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inventoryOptimizations.map((inventory) => (
                    <React.Fragment key={inventory.id}>
                      <tr className="hover:bg-gray-50">
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {inventory.demandForecast.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${inventory.storageCost.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setEditingInventory({ ...inventory })
                              }
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleRowExpansion(inventory.id)}
                            >
                              {expandedRows.includes(inventory.id) ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                      {expandedRows.includes(inventory.id) && (
                        <tr className="bg-gray-50">
                          <td colSpan={9} className="px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  Storage Details
                                </h4>
                                <ul className="mt-2 space-y-1 text-sm text-gray-600">
                                  <li>
                                    Location: {inventory.warehouseLocation}
                                  </li>
                                  <li>
                                    Last Restocked: {inventory.lastRestocked}
                                  </li>
                                </ul>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  Stock Levels
                                </h4>
                                <ul className="mt-2 space-y-1 text-sm text-gray-600">
                                  <li>Min Level: {inventory.minStockLevel}</li>
                                  <li>Max Level: {inventory.maxStockLevel}</li>
                                </ul>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  Performance
                                </h4>
                                <ul className="mt-2 space-y-1 text-sm text-gray-600">
                                  <li>
                                    Turnover Rate: {inventory.turnoverRate}
                                    x/month
                                  </li>
                                  <li>
                                    Demand Forecast: {inventory.demandForecast}
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Batch Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      USD Savings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Bundling
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {gasOptimizations.map((gas) => (
                    <React.Fragment key={gas.id}>
                      <tr className="hover:bg-gray-50">
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getPriorityBadge(gas.priority)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {gas.batchSize}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold">
                          ${gas.potentialSavingsUSD.toLocaleString()}
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingGas({ ...gas })}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleRowExpansion(gas.id)}
                            >
                              {expandedRows.includes(gas.id) ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                      {expandedRows.includes(gas.id) && (
                        <tr className="bg-gray-50">
                          <td colSpan={9} className="px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  Execution Details
                                </h4>
                                <ul className="mt-2 space-y-1 text-sm text-gray-600">
                                  <li>
                                    Estimated Time: {gas.estimatedExecutionTime}
                                  </li>
                                  <li>
                                    Current Gas Price: {gas.gasPrice} Gwei
                                  </li>
                                </ul>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  Savings Analysis
                                </h4>
                                <ul className="mt-2 space-y-1 text-sm text-gray-600">
                                  <li>
                                    Gas Savings: {gas.savings.toLocaleString()}
                                  </li>
                                  <li>
                                    USD Savings: $
                                    {gas.potentialSavingsUSD.toLocaleString()}
                                  </li>
                                </ul>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  Opportunities
                                </h4>
                                <ul className="mt-2 space-y-1 text-sm text-gray-600">
                                  <li>
                                    Bundling:{" "}
                                    {gas.bundlingOpportunity
                                      ? "Available"
                                      : "Not Available"}
                                  </li>
                                  <li>
                                    Batch Size: {gas.batchSize} operations
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {schedulerJobs.map((job) => (
                    <React.Fragment key={job.id}>
                      <tr className="hover:bg-gray-50">
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <BarChart3 className="h-4 w-4 text-blue-500 mr-1" />
                            {job.executionTime}s
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {job.status === "active" ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setSchedulerJobs(
                                    schedulerJobs.map((j) =>
                                      j.id === job.id
                                        ? { ...j, status: "paused" }
                                        : j
                                    )
                                  )
                                }
                              >
                                <Pause className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setSchedulerJobs(
                                    schedulerJobs.map((j) =>
                                      j.id === job.id
                                        ? { ...j, status: "active" }
                                        : j
                                    )
                                  )
                                }
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => retryJob(job.id)}
                              disabled={job.retryCount >= job.maxRetries}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingScheduler({ ...job })}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleRowExpansion(job.id)}
                            >
                              {expandedRows.includes(job.id) ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                      {expandedRows.includes(job.id) && (
                        <tr className="bg-gray-50">
                          <td colSpan={8} className="px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  Dependencies
                                </h4>
                                <ul className="mt-2 space-y-1 text-sm text-gray-600">
                                  {job.dependencies.length > 0 ? (
                                    job.dependencies.map((dep, idx) => (
                                      <li key={idx}>• {dep}</li>
                                    ))
                                  ) : (
                                    <li>None</li>
                                  )}
                                </ul>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  Notifications
                                </h4>
                                <ul className="mt-2 space-y-1 text-sm text-gray-600">
                                  {job.notificationEmails.map((email, idx) => (
                                    <li key={idx}>• {email}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  Retry Info
                                </h4>
                                <ul className="mt-2 space-y-1 text-sm text-gray-600">
                                  <li>
                                    Retries: {job.retryCount}/{job.maxRetries}
                                  </li>
                                  <li>Resource Usage: {job.resourceUsage}</li>
                                </ul>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cost Optimization */}
      {optimizationMode === "cost" && (
        <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800">
              <DollarSign className="h-5 w-5 mr-2 text-blue-500" />
              Cost Optimization Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Current Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Optimized Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Savings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Difficulty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Recommendation
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {costOptimizations.map((cost) => (
                    <tr key={cost.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {cost.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${cost.currentCost.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${cost.optimizedCost.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold">
                        ${cost.savings.toLocaleString()} (
                        {cost.savingsPercentage}%)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getDifficultyBadge(cost.implementationDifficulty)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {cost.recommendation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Cards */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-green-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">
                        Total Potential Savings
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        ${(2250 + 1200 + 750).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <PieChart className="h-8 w-8 text-blue-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">
                        Avg. Savings Percentage
                      </p>
                      <p className="text-xl font-bold text-gray-900">15%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Settings className="h-8 w-8 text-purple-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">
                        Implementation Effort
                      </p>
                      <p className="text-xl font-bold text-gray-900">Medium</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Route Modal */}
      {editingRoute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Edit Route</span>
                <Button variant="ghost" onClick={() => setEditingRoute(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Origin
                  </label>
                  <input
                    type="text"
                    value={editingRoute.origin}
                    onChange={(e) =>
                      setEditingRoute({
                        ...editingRoute,
                        origin: e.target.value,
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Destination
                  </label>
                  <input
                    type="text"
                    value={editingRoute.destination}
                    onChange={(e) =>
                      setEditingRoute({
                        ...editingRoute,
                        destination: e.target.value,
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Distance (miles)
                  </label>
                  <input
                    type="number"
                    value={editingRoute.distance}
                    onChange={(e) =>
                      setEditingRoute({
                        ...editingRoute,
                        distance: Number(e.target.value),
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Estimated Time
                  </label>
                  <input
                    type="text"
                    value={editingRoute.estimatedTime}
                    onChange={(e) =>
                      setEditingRoute({
                        ...editingRoute,
                        estimatedTime: e.target.value,
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Cost ($)
                  </label>
                  <input
                    type="number"
                    value={editingRoute.cost}
                    onChange={(e) =>
                      setEditingRoute({
                        ...editingRoute,
                        cost: Number(e.target.value),
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    CO2 Emissions (kg)
                  </label>
                  <input
                    type="number"
                    value={editingRoute.co2Emissions}
                    onChange={(e) =>
                      setEditingRoute({
                        ...editingRoute,
                        co2Emissions: Number(e.target.value),
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Vehicle Type
                  </label>
                  <input
                    type="text"
                    value={editingRoute.vehicleType}
                    onChange={(e) =>
                      setEditingRoute({
                        ...editingRoute,
                        vehicleType: e.target.value,
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Driver
                  </label>
                  <input
                    type="text"
                    value={editingRoute.driver}
                    onChange={(e) =>
                      setEditingRoute({
                        ...editingRoute,
                        driver: e.target.value,
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setEditingRoute(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={saveRouteEdit}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Inventory Modal */}
      {editingInventory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Edit Inventory</span>
                <Button
                  variant="ghost"
                  onClick={() => setEditingInventory(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={editingInventory.productName}
                    onChange={(e) =>
                      setEditingInventory({
                        ...editingInventory,
                        productName: e.target.value,
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Product ID
                  </label>
                  <input
                    type="text"
                    value={editingInventory.productId}
                    onChange={(e) =>
                      setEditingInventory({
                        ...editingInventory,
                        productId: e.target.value,
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Current Stock
                  </label>
                  <input
                    type="number"
                    value={editingInventory.currentStock}
                    onChange={(e) =>
                      setEditingInventory({
                        ...editingInventory,
                        currentStock: Number(e.target.value),
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Reorder Point
                  </label>
                  <input
                    type="number"
                    value={editingInventory.reorderPoint}
                    onChange={(e) =>
                      setEditingInventory({
                        ...editingInventory,
                        reorderPoint: Number(e.target.value),
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Suggested Order
                  </label>
                  <input
                    type="number"
                    value={editingInventory.suggestedOrder}
                    onChange={(e) =>
                      setEditingInventory({
                        ...editingInventory,
                        suggestedOrder: Number(e.target.value),
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Lead Time (days)
                  </label>
                  <input
                    type="number"
                    value={editingInventory.leadTime}
                    onChange={(e) =>
                      setEditingInventory({
                        ...editingInventory,
                        leadTime: Number(e.target.value),
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setEditingInventory(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveInventoryEdit}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Gas Modal */}
      {editingGas && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Edit Gas Optimization</span>
                <Button variant="ghost" onClick={() => setEditingGas(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Operation
                  </label>
                  <input
                    type="text"
                    value={editingGas.operation}
                    onChange={(e) =>
                      setEditingGas({
                        ...editingGas,
                        operation: e.target.value,
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Current Gas
                  </label>
                  <input
                    type="number"
                    value={editingGas.currentGas}
                    onChange={(e) =>
                      setEditingGas({
                        ...editingGas,
                        currentGas: Number(e.target.value),
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Optimized Gas
                  </label>
                  <input
                    type="number"
                    value={editingGas.optimizedGas}
                    onChange={(e) =>
                      setEditingGas({
                        ...editingGas,
                        optimizedGas: Number(e.target.value),
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Batch Size
                  </label>
                  <input
                    type="number"
                    value={editingGas.batchSize}
                    onChange={(e) =>
                      setEditingGas({
                        ...editingGas,
                        batchSize: Number(e.target.value),
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Priority
                  </label>
                  <select
                    value={editingGas.priority}
                    onChange={(e) =>
                      setEditingGas({
                        ...editingGas,
                        priority: e.target.value as "high" | "medium" | "low",
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Gas Price (Gwei)
                  </label>
                  <input
                    type="number"
                    value={editingGas.gasPrice}
                    onChange={(e) =>
                      setEditingGas({
                        ...editingGas,
                        gasPrice: Number(e.target.value),
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setEditingGas(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={saveGasEdit}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Scheduler Modal */}
      {editingScheduler && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Edit Scheduler Job</span>
                <Button
                  variant="ghost"
                  onClick={() => setEditingScheduler(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Job Name
                  </label>
                  <input
                    type="text"
                    value={editingScheduler.name}
                    onChange={(e) =>
                      setEditingScheduler({
                        ...editingScheduler,
                        name: e.target.value,
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <input
                    type="text"
                    value={editingScheduler.type}
                    onChange={(e) =>
                      setEditingScheduler({
                        ...editingScheduler,
                        type: e.target.value,
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Schedule (Cron)
                  </label>
                  <input
                    type="text"
                    value={editingScheduler.schedule}
                    onChange={(e) =>
                      setEditingScheduler({
                        ...editingScheduler,
                        schedule: e.target.value,
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    value={editingScheduler.status}
                    onChange={(e) =>
                      setEditingScheduler({
                        ...editingScheduler,
                        status: e.target.value,
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Notification Emails (comma separated)
                  </label>
                  <input
                    type="text"
                    value={editingScheduler.notificationEmails.join(", ")}
                    onChange={(e) =>
                      setEditingScheduler({
                        ...editingScheduler,
                        notificationEmails: e.target.value
                          .split(",")
                          .map((email) => email.trim()),
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setEditingScheduler(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveSchedulerEdit}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SupplyChainOptimization;
