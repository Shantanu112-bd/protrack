import React, { useState, useEffect } from "react";
import { useWeb3 } from "../hooks/useWeb3";
import { supabase } from "../services/supabase";
import ProductTrackingMap from "./map/ProductTrackingMap";
import EnhancedSupplyChainDashboard from "./EnhancedSupplyChainDashboard";
import AdvancedIoTDashboard from "./AdvancedIoTDashboard";
import EnhancedProductVerification from "./EnhancedProductVerification";
import ManufacturerDashboard from "./dashboards/ManufacturerDashboard";
import TransporterDashboard from "./dashboards/TransporterDashboard";
import RetailerDashboard from "./dashboards/RetailerDashboard";

type UserRole =
  | "manufacturer"
  | "transporter"
  | "retailer"
  | "consumer"
  | "admin";

const ComprehensiveDashboard: React.FC = () => {
  const { account } = useWeb3();
  // const { getIoTDashboard } = useEnhancedWeb3();
  const [userRole, setUserRole] = useState<UserRole>("consumer");
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    totalProducts: 124,
    activeShipments: 12,
    completedDeliveries: 120,
    alerts: 3,
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

    // Mock dashboard stats instead of calling getIoTDashboard
    const fetchDashboardStats = async () => {
      // Use mock data as fallback
      setDashboardStats({
        totalProducts: 124,
        activeShipments: 12,
        completedDeliveries: 120,
        alerts: 3,
      });
    };

    fetchUserRole();
    fetchDashboardStats();
  }, [account]);

  // Simple stat card component
  const StatCard = ({
    title,
    value,
    icon,
  }: {
    title: string;
    value: string | number;
    icon: string;
  }) => (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  );

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
              />
              <StatCard
                title="Active Shipments"
                value={dashboardStats.activeShipments}
                icon="🚚"
              />
              <StatCard
                title="Completed"
                value={dashboardStats.completedDeliveries}
                icon="✅"
              />
              <StatCard
                title="Alerts"
                value={dashboardStats.alerts}
                icon="⚠️"
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
              />
              <StatCard
                title="Completed"
                value={dashboardStats.completedDeliveries}
                icon="✅"
              />
              <StatCard
                title="Alerts"
                value={dashboardStats.alerts}
                icon="⚠️"
              />
              <StatCard title="On Time" value="98%" icon="⏱️" />
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
              />
              <StatCard
                title="New Orders"
                value={dashboardStats.activeShipments}
                icon="🛒"
              />
              <StatCard
                title="Completed"
                value={dashboardStats.completedDeliveries}
                icon="✅"
              />
              <StatCard
                title="Low Stock"
                value={dashboardStats.alerts}
                icon="⚠️"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RetailerDashboard />
              <AdvancedIoTDashboard />
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Store Performance
              </h3>
              <div className="h-96 rounded-lg overflow-hidden">
                <ProductTrackingMap />
              </div>
            </div>
          </div>
        );

      case "consumer":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Verified Products"
                value={dashboardStats.totalProducts}
                icon="✅"
              />
              <StatCard
                title="Purchases"
                value={dashboardStats.completedDeliveries}
                icon="💳"
              />
              <StatCard title="Favorites" value="24" icon="❤️" />
              <StatCard title="Reviews" value="8" icon="⭐" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EnhancedProductVerification />
              <AdvancedIoTDashboard />
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Product Recommendations
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
              <StatCard title="Total Users" value="1,247" icon="👥" />
              <StatCard
                title="Active Devices"
                value={dashboardStats.activeShipments}
                icon="📱"
              />
              <StatCard title="Transactions" value="12,420" icon="📊" />
              <StatCard
                title="System Alerts"
                value={dashboardStats.alerts}
                icon="⚠️"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EnhancedSupplyChainDashboard />
              <AdvancedIoTDashboard />
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Network Overview
              </h3>
              <div className="h-96 rounded-lg overflow-hidden">
                <ProductTrackingMap />
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Welcome" value="ProTrack" icon="👋" />
              <StatCard title="Connect Wallet" value="To Start" icon="💳" />
              <StatCard title="Explore" value="Features" icon="🔍" />
              <StatCard title="Learn More" value="About Us" icon="📚" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EnhancedProductVerification />
              <AdvancedIoTDashboard />
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Getting Started
              </h3>
              <div className="h-96 rounded-lg overflow-hidden">
                <ProductTrackingMap />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          {userRole === "manufacturer"
            ? "Manufacturer Dashboard"
            : userRole === "transporter"
            ? "Transporter Dashboard"
            : userRole === "retailer"
            ? "Retailer Dashboard"
            : userRole === "consumer"
            ? "Consumer Dashboard"
            : userRole === "admin"
            ? "Admin Dashboard"
            : "Dashboard"}
        </h2>
        <div className="text-sm text-gray-400">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      {renderDashboardByRole()}
    </div>
  );
};

export default ComprehensiveDashboard;
