import React, { useState, useEffect } from "react";
import { useWeb3 } from "../../contexts/web3ContextTypes";
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

type UserRole =
  | "manufacturer"
  | "transporter"
  | "retailer"
  | "consumer"
  | "admin";

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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    switch (userRole) {
      case "manufacturer":
        return (
          <div className="space-y-6">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ManufacturerDashboard />
              <AdvancedIoTDashboard />
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Global Supply Chain Map
              </h3>
              <div className="h-96 rounded-lg overflow-hidden">
                <ProductTrackingMap />
              </div>
            </div>
          </div>
        );

      case "transporter":
        return (
          <div className="space-y-6">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TransporterDashboard />
              <AdvancedIoTDashboard />
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Shipment Tracking Map
              </h3>
              <div className="h-96 rounded-lg overflow-hidden">
                <ProductTrackingMap />
              </div>
            </div>
          </div>
        );

      case "retailer":
        return (
          <div className="space-y-6">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RetailerDashboard />
              <EnhancedProductVerification />
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Store Locations Map
              </h3>
              <div className="h-96 rounded-lg overflow-hidden">
                <ProductTrackingMap />
              </div>
            </div>
          </div>
        );

      case "admin":
        return (
          <div className="space-y-6">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EnhancedSupplyChainDashboard />
              <AdvancedIoTDashboard />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MPCWalletManager />
              <EnhancedMPCApprovals />
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Global Supply Chain Map
              </h3>
              <div className="h-96 rounded-lg overflow-hidden">
                <ProductTrackingMap />
              </div>
            </div>
          </div>
        );

      default: // consumer
        return (
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">
                Consumer Dashboard
              </h2>
              <p className="text-gray-300 mb-6">
                Welcome to the ProTrack platform. Verify product authenticity
                and track product history.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EnhancedProductVerification />
                <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Product Tracking Map
                  </h3>
                  <div className="h-64 rounded-lg overflow-hidden">
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
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Unified Supply Chain Dashboard</h1>
          <div className="flex items-center space-x-4">
            <label htmlFor="role-select" className="text-sm font-medium">
              Switch Role:
            </label>
            <select
              id="role-select"
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as UserRole)}
              className="px-3 py-2 rounded-lg border bg-gray-800 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="manufacturer">Manufacturer</option>
              <option value="transporter">Transporter</option>
              <option value="retailer">Retailer</option>
              <option value="consumer">Consumer</option>
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
    blue: "bg-blue-500/20 text-blue-400",
    green: "bg-green-500/20 text-green-400",
    purple: "bg-purple-500/20 text-purple-400",
    red: "bg-red-500/20 text-red-400",
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <div
          className={`p-3 rounded-lg ${
            colorClasses[color as keyof typeof colorClasses]
          }`}
        >
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );
};

export default UnifiedDashboard;
