import React, { useState, useEffect } from "react";
import { useWeb3 } from "../../hooks/useWeb3";
import { useEnhancedWeb3 } from "../../contexts/EnhancedWeb3Context";
import { supabase } from "../../services/supabase";
import ProductTrackingMap from "../map/ProductTrackingMap";
import EnhancedSupplyChainDashboard from "../EnhancedSupplyChainDashboard";
import AdvancedIoTDashboard from "../AdvancedIoTDashboard";
import EnhancedProductVerification from "../EnhancedProductVerification";
import MPCWalletManager from "../MPCWalletManager";
import EnhancedMPCApprovals from "../EnhancedMPCApprovals";
import ManufacturerDashboard from "./ManufacturerDashboard";
import TransporterDashboard from "./TransporterDashboard";
import RetailerDashboard from "./RetailerDashboard";
import { supplyChainService } from "../../services/supplyChainService";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

// Add animation styles
const style = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.5s ease-out forwards;
  }
`;

type UserRole =
  | "manufacturer"
  | "transporter"
  | "retailer"
  | "consumer"
  | "admin"
  | "inspector";

const UnifiedDashboard: React.FC = () => {
  const { account } = useWeb3();
  const { getIoTDashboard } = useEnhancedWeb3();
  const [userRole, setUserRole] = useState<UserRole>("consumer");
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    totalProducts: 0,
    activeShipments: 0,
    completedDeliveries: 0,
    alerts: 0,
  });

  useEffect(() => {
    const initWeb3 = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof window !== "undefined" && (window as any).ethereum) {
        const Web3 = (await import("web3")).default;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const web3Instance = new Web3((window as any).ethereum);
        await supplyChainService.init(web3Instance);
      }
    };

    initWeb3();
  }, []);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (account) {
        try {
          // Fetch user role from Supabase based on wallet address
          const { data, error } = await supabase
            .from("users")
            .select("role")
            .eq("wallet_address", account)
            .single();

          if (error) {
            console.error("Error fetching user role:", error);
            setUserRole("consumer"); // Default role
          } else if (data) {
            setUserRole(data.role as UserRole);
          }
        } catch (error) {
          console.error("Failed to fetch user role:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    const fetchDashboardStats = async () => {
      try {
        // Fetch dashboard stats from IoT service
        const result = await getIoTDashboard();
        if (result.success) {
          setDashboardStats({
            totalProducts: result.data.totalDevices,
            activeShipments: result.data.activeDevices,
            completedDeliveries: 120, // Mock data
            alerts: result.data.alertsLast24h,
          });
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        // Use mock data as fallback
        setDashboardStats({
          totalProducts: 124,
          activeShipments: 12,
          completedDeliveries: 120,
          alerts: 3,
        });
      }
    };

    fetchUserRole();
    fetchDashboardStats();
  }, [account, getIoTDashboard]);

  const renderDashboardByRole = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gradient-to-r from-blue-500 to-purple-500"></div>
        </div>
      );
    }

    switch (userRole) {
      case "manufacturer":
        return (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Products"
                value={dashboardStats.totalProducts}
                icon="📦"
                color="blue"
              />
              <StatCard
                title="Active Shipments"
                value={dashboardStats.activeShipments}
                icon="🚚"
                color="green"
              />
              <StatCard
                title="Completed"
                value={dashboardStats.completedDeliveries}
                icon="✅"
                color="purple"
              />
              <StatCard
                title="Alerts"
                value={dashboardStats.alerts}
                icon="⚠️"
                color="red"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-blue-900/20 via-blue-800/10 to-gray-900/50 backdrop-blur-lg border border-blue-700/30 rounded-2xl shadow-2xl p-6 hover:border-blue-500/50 transition-all duration-300 transform hover:-translate-y-1">
                <h3 className="text-xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Manufacturer Dashboard
                </h3>
                <ManufacturerDashboard />
              </div>
              <div className="bg-gradient-to-br from-green-900/20 via-green-800/10 to-gray-900/50 backdrop-blur-lg border border-green-700/30 rounded-2xl shadow-2xl p-6 hover:border-green-500/50 transition-all duration-300 transform hover:-translate-y-1">
                <h3 className="text-xl font-bold text-white mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  IoT Dashboard
                </h3>
                <AdvancedIoTDashboard />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-900/20 via-purple-800/10 to-gray-900/50 backdrop-blur-lg border border-purple-700/30 rounded-2xl shadow-2xl p-6 hover:border-purple-500/50 transition-all duration-300 transform hover:-translate-y-1">
              <h3 className="text-xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Global Supply Chain Map
              </h3>
              <div className="h-96 rounded-xl overflow-hidden border border-gray-700/50">
                <ProductTrackingMap />
              </div>
            </div>
          </div>
        );

      case "transporter":
        return (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Active Shipments"
                value={dashboardStats.activeShipments}
                icon="🚚"
                color="green"
              />
              <StatCard
                title="Completed"
                value={dashboardStats.completedDeliveries}
                icon="✅"
                color="purple"
              />
              <StatCard
                title="Alerts"
                value={dashboardStats.alerts}
                icon="⚠️"
                color="red"
              />
              <StatCard title="On Time" value="98%" icon="⏱️" color="blue" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-green-900/20 via-green-800/10 to-gray-900/50 backdrop-blur-lg border border-green-700/30 rounded-2xl shadow-2xl p-6 hover:border-green-500/50 transition-all duration-300 transform hover:-translate-y-1">
                <h3 className="text-xl font-bold text-white mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  Transporter Dashboard
                </h3>
                <TransporterDashboard />
              </div>
              <div className="bg-gradient-to-br from-teal-900/20 via-teal-800/10 to-gray-900/50 backdrop-blur-lg border border-teal-700/30 rounded-2xl shadow-2xl p-6 hover:border-teal-500/50 transition-all duration-300 transform hover:-translate-y-1">
                <h3 className="text-xl font-bold text-white mb-4 bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  IoT Dashboard
                </h3>
                <AdvancedIoTDashboard />
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-900/20 via-amber-800/10 to-gray-900/50 backdrop-blur-lg border border-amber-700/30 rounded-2xl shadow-2xl p-6 hover:border-amber-500/50 transition-all duration-300 transform hover:-translate-y-1">
              <h3 className="text-xl font-bold text-white mb-4 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                Shipment Tracking Map
              </h3>
              <div className="h-96 rounded-xl overflow-hidden border border-gray-700/50">
                <ProductTrackingMap />
              </div>
            </div>
          </div>
        );

      case "retailer":
        return (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Inventory"
                value={dashboardStats.totalProducts}
                icon="📦"
                color="blue"
              />
              <StatCard
                title="New Arrivals"
                value="24"
                icon="📥"
                color="green"
              />
              <StatCard
                title="Sold Today"
                value="18"
                icon="💰"
                color="purple"
              />
              <StatCard title="Low Stock" value="3" icon="⚠️" color="red" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-purple-900/20 via-purple-800/10 to-gray-900/50 backdrop-blur-lg border border-purple-700/30 rounded-2xl shadow-2xl p-6 hover:border-purple-500/50 transition-all duration-300 transform hover:-translate-y-1">
                <h3 className="text-xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Retailer Dashboard
                </h3>
                <RetailerDashboard />
              </div>
              <div className="bg-gradient-to-br from-indigo-900/20 via-indigo-800/10 to-gray-900/50 backdrop-blur-lg border border-indigo-700/30 rounded-2xl shadow-2xl p-6 hover:border-indigo-500/50 transition-all duration-300 transform hover:-translate-y-1">
                <h3 className="text-xl font-bold text-white mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Product Verification
                </h3>
                <EnhancedProductVerification />
              </div>
            </div>

            <div className="bg-gradient-to-br from-fuchsia-900/20 via-fuchsia-800/10 to-gray-900/50 backdrop-blur-lg border border-fuchsia-700/30 rounded-2xl shadow-2xl p-6 hover:border-fuchsia-500/50 transition-all duration-300 transform hover:-translate-y-1">
              <h3 className="text-xl font-bold text-white mb-4 bg-gradient-to-r from-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                Store Locations Map
              </h3>
              <div className="h-96 rounded-xl overflow-hidden border border-gray-700/50">
                <ProductTrackingMap />
              </div>
            </div>
          </div>
        );

      case "inspector":
        return (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Inspections" value="42" icon="🔍" color="blue" />
              <StatCard title="Pending" value="8" icon="⏳" color="yellow" />
              <StatCard title="Approved" value="32" icon="✅" color="green" />
              <StatCard title="Issues Found" value="2" icon="⚠️" color="red" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-gradient-to-br from-blue-900/20 via-blue-800/10 to-gray-900/50 backdrop-blur-lg border border-blue-700/30 rounded-2xl shadow-2xl hover:border-blue-500/50 transition-all duration-300 transform hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="text-xl text-white bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    Quality Inspections
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-5">
                    <div className="border border-gray-700 rounded-xl p-5 bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 transform hover:scale-[1.02]">
                      <h4 className="font-bold text-lg text-white">
                        Product Batch #SCM-2023-001
                      </h4>
                      <p className="text-sm text-gray-400 mt-1">
                        Status: Pending Inspection
                      </p>
                      <div className="mt-4 flex space-x-3">
                        <Button
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700/50 transition-all duration-300"
                        >
                          View Details
                        </Button>
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
                          Approve
                        </Button>
                      </div>
                    </div>
                    <div className="border border-gray-700 rounded-xl p-5 bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm hover:border-green-500/50 transition-all duration-300 transform hover:scale-[1.02]">
                      <h4 className="font-bold text-lg text-white">
                        Product Batch #SCM-2023-002
                      </h4>
                      <p className="text-sm text-gray-400 mt-1">
                        Status: Approved
                      </p>
                      <div className="mt-4 flex space-x-3">
                        <Button
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700/50 transition-all duration-300"
                        >
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700/50 transition-all duration-300 transform hover:scale-105"
                        >
                          Revoke
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-900/20 via-green-800/10 to-gray-900/50 backdrop-blur-lg border border-green-700/30 rounded-2xl shadow-2xl hover:border-green-500/50 transition-all duration-300 transform hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="text-xl text-white bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    Compliance Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-5">
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-900/20 to-blue-800/20 rounded-xl border border-blue-700/30 hover:shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all duration-300">
                      <span className="text-gray-300">
                        Temperature Compliance
                      </span>
                      <span className="font-bold text-green-400">98.5%</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-900/20 to-green-800/20 rounded-xl border border-green-700/30 hover:shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all duration-300">
                      <span className="text-gray-300">Humidity Compliance</span>
                      <span className="font-bold text-green-400">96.2%</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-yellow-900/20 to-yellow-800/20 rounded-xl border border-yellow-700/30 hover:shadow-[0_0_10px_rgba(234,179,8,0.3)] transition-all duration-300">
                      <span className="text-gray-300">
                        Transport Compliance
                      </span>
                      <span className="font-bold text-yellow-400">87.3%</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-900/20 to-purple-800/20 rounded-xl border border-purple-700/30 hover:shadow-[0_0_10px_rgba(139,92,246,0.3)] transition-all duration-300">
                      <span className="text-gray-300">Storage Compliance</span>
                      <span className="font-bold text-green-400">99.1%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-gradient-to-br from-amber-900/20 via-amber-800/10 to-gray-900/50 backdrop-blur-lg border border-amber-700/30 rounded-2xl shadow-2xl p-6 hover:border-amber-500/50 transition-all duration-300 transform hover:-translate-y-1">
              <h3 className="text-xl font-bold text-white mb-4 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                Inspection Map
              </h3>
              <div className="h-96 rounded-xl overflow-hidden border border-gray-700/50">
                <ProductTrackingMap />
              </div>
            </div>
          </div>
        );

      case "admin":
        return (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Products"
                value={dashboardStats.totalProducts}
                icon="📦"
                color="blue"
              />
              <StatCard
                title="Active Shipments"
                value={dashboardStats.activeShipments}
                icon="🚚"
                color="green"
              />
              <StatCard
                title="Completed"
                value={dashboardStats.completedDeliveries}
                icon="✅"
                color="purple"
              />
              <StatCard
                title="Alerts"
                value={dashboardStats.alerts}
                icon="⚠️"
                color="red"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-blue-900/20 via-blue-800/10 to-gray-900/50 backdrop-blur-lg border border-blue-700/30 rounded-2xl shadow-2xl p-6 hover:border-blue-500/50 transition-all duration-300 transform hover:-translate-y-1">
                <h3 className="text-xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Supply Chain Dashboard
                </h3>
                <EnhancedSupplyChainDashboard />
              </div>
              <div className="bg-gradient-to-br from-green-900/20 via-green-800/10 to-gray-900/50 backdrop-blur-lg border border-green-700/30 rounded-2xl shadow-2xl p-6 hover:border-green-500/50 transition-all duration-300 transform hover:-translate-y-1">
                <h3 className="text-xl font-bold text-white mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  IoT Dashboard
                </h3>
                <AdvancedIoTDashboard />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-purple-900/20 via-purple-800/10 to-gray-900/50 backdrop-blur-lg border border-purple-700/30 rounded-2xl shadow-2xl p-6 hover:border-purple-500/50 transition-all duration-300 transform hover:-translate-y-1">
                <h3 className="text-xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  MPC Wallet Manager
                </h3>
                <MPCWalletManager />
              </div>
              <div className="bg-gradient-to-br from-indigo-900/20 via-indigo-800/10 to-gray-900/50 backdrop-blur-lg border border-indigo-700/30 rounded-2xl shadow-2xl p-6 hover:border-indigo-500/50 transition-all duration-300 transform hover:-translate-y-1">
                <h3 className="text-xl font-bold text-white mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  MPC Approvals
                </h3>
                <EnhancedMPCApprovals />
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-900/20 via-amber-800/10 to-gray-900/50 backdrop-blur-lg border border-amber-700/30 rounded-2xl shadow-2xl p-6 hover:border-amber-500/50 transition-all duration-300 transform hover:-translate-y-1">
              <h3 className="text-xl font-bold text-white mb-4 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                Global Supply Chain Map
              </h3>
              <div className="h-96 rounded-xl overflow-hidden border border-gray-700/50">
                <ProductTrackingMap />
              </div>
            </div>
          </div>
        );

      default: // consumer
        return (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-gradient-to-br from-purple-900/20 via-purple-800/10 to-gray-900/50 backdrop-blur-lg border border-purple-700/30 rounded-2xl shadow-2xl p-6 hover:border-purple-500/50 transition-all duration-300 transform hover:-translate-y-1">
              <h2 className="text-3xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Consumer Dashboard
              </h2>
              <p className="text-gray-300 mb-6 text-lg">
                Welcome to the ProTrack platform. Verify product authenticity
                and track product history.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-indigo-900/20 via-indigo-800/10 to-gray-900/30 border border-indigo-700/30 rounded-xl p-6 backdrop-blur-sm hover:border-indigo-500/50 transition-all duration-300 transform hover:scale-[1.02]">
                  <h3 className="text-xl font-bold text-white mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    Product Verification
                  </h3>
                  <EnhancedProductVerification />
                </div>
                <div className="bg-gradient-to-br from-fuchsia-900/20 via-fuchsia-800/10 to-gray-900/30 border border-fuchsia-700/30 rounded-xl p-6 backdrop-blur-sm hover:border-fuchsia-500/50 transition-all duration-300 transform hover:scale-[1.02]">
                  <h3 className="text-xl font-bold text-white mb-4 bg-gradient-to-r from-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                    Product Tracking Map
                  </h3>
                  <div className="h-80 rounded-xl overflow-hidden border border-gray-700/50">
                    <ProductTrackingMap />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 text-white">
      <style>{style}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 p-6 bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl shadow-xl">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
              Unified Supply Chain Dashboard
            </h1>
            <p className="text-gray-300 mt-3 text-lg">
              Track products through the supply chain with cryptographic
              tokenization
            </p>
          </div>
          <div className="flex items-center space-x-4 bg-gradient-to-r from-gray-800/70 to-gray-900/70 backdrop-blur-sm border border-gray-600 rounded-xl p-4 shadow-lg">
            <label
              htmlFor="role-select"
              className="text-sm font-medium text-gray-200"
            >
              Switch Role:
            </label>
            <select
              id="role-select"
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as UserRole)}
              className="px-4 py-2 rounded-lg border bg-gradient-to-r from-gray-700 to-gray-800 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
            >
              <option value="manufacturer">Manufacturer</option>
              <option value="transporter">Transporter</option>
              <option value="retailer">Retailer</option>
              <option value="consumer">Consumer</option>
              <option value="inspector">Inspector</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        {renderDashboardByRole()}
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: string;
  color: string;
}> = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: "bg-gradient-to-br from-blue-500/30 to-cyan-500/30 text-blue-300 border border-blue-500/50",
    green:
      "bg-gradient-to-br from-green-500/30 to-emerald-500/30 text-green-300 border border-green-500/50",
    purple:
      "bg-gradient-to-br from-purple-500/30 to-pink-500/30 text-purple-300 border border-purple-500/50",
    red: "bg-gradient-to-br from-red-500/30 to-orange-500/30 text-red-300 border border-red-500/50",
    yellow:
      "bg-gradient-to-br from-yellow-500/30 to-amber-500/30 text-yellow-300 border border-yellow-500/50",
  };

  const glowClasses = {
    blue: "hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]",
    green: "hover:shadow-[0_0_15px_rgba(16,185,129,0.5)]",
    purple: "hover:shadow-[0_0_15px_rgba(139,92,246,0.5)]",
    red: "hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]",
    yellow: "hover:shadow-[0_0_15px_rgba(234,179,8,0.5)]",
  };

  return (
    <div
      className={`bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-6 shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
        glowClasses[color as keyof typeof glowClasses]
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-300 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-1 animate-pulse">
            {value}
          </p>
        </div>
        <div
          className={`p-4 rounded-xl text-2xl ${
            colorClasses[color as keyof typeof colorClasses]
          }`}
        >
          {icon}
        </div>
      </div>
      <div className="mt-4 h-1 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${
            colorClasses[color as keyof typeof colorClasses].split(" ")[0]
          } rounded-full`}
          style={{ width: `${Math.min(100, (Number(value) || 0) * 10)}%` }}
        ></div>
      </div>
    </div>
  );
};

export default UnifiedDashboard;
