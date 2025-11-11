import React, { useState, useEffect } from "react";
import { useWeb3 } from "./hooks/useWeb3";
import MainDashboard from "./components/MainDashboard";
import SupplyChainCoreDashboard from "./components/dashboards/SupplyChainCoreDashboard";
import EnhancedSupplyChainDashboard from "./components/EnhancedSupplyChainDashboard";
import EnhancedProductVerification from "./components/EnhancedProductVerification";
import AdvancedIoTDashboard from "./components/AdvancedIoTDashboard";
import MPCWalletManager from "./components/MPCWalletManager";
import EnhancedMPCApprovals from "./components/EnhancedMPCApprovals";
import SupplyChainLifecycle from "./components/SupplyChainLifecycle";
import IntegrationTestDashboard from "./components/IntegrationTestDashboard";
import WalletConnection from "./components/WalletConnection";
import { supabase } from "./services/supabase";

const ProTrackV2: React.FC = () => {
  const { account, isActive, disconnectWallet } = useWeb3();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [userRole, setUserRole] = useState("consumer");

  useEffect(() => {
    // Set dark theme as default
    document.documentElement.classList.add("dark");

    // Fetch user role
    const fetchUserRole = async () => {
      if (account) {
        try {
          const { data, error } = await supabase
            .from("users")
            .select("role")
            .eq("wallet_address", account)
            .single();

          if (!error && data) {
            setUserRole(data.role);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      }
    };

    fetchUserRole();
  }, [account]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
    document.documentElement.classList.toggle("dark");
  };

  const handleSignOut = () => {
    disconnectWallet();
    window.location.hash = "";
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900/80 to-gray-900/50 backdrop-blur-xl border-b border-gray-700/30 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                ProTrack Supply Chain
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-3 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-300 transform hover:scale-105 border border-gray-600/50 shadow-lg"
              >
                {theme === "light" ? (
                  <span className="text-yellow-400 text-xl">☀️</span>
                ) : (
                  <span className="text-blue-400 text-xl">🌙</span>
                )}
              </button>
              {!isActive ? (
                <WalletConnection />
              ) : (
                <div className="flex items-center space-x-4 bg-gradient-to-r from-green-800/50 to-emerald-800/50 px-6 py-3 rounded-xl border border-green-700/50 shadow-lg hover:shadow-green-500/10 transition-all duration-300">
                  <div className="flex items-center space-x-2">
                    <span className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-green-100 font-medium">
                      {account?.slice(0, 6)}...{account?.slice(-4)}
                    </span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="text-xs text-gray-300 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 px-3 py-1.5 rounded-lg transition-colors border border-gray-600/50"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Role Selection */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-3 overflow-x-auto pb-3 scrollbar-hide">
            {[
              "dashboard",
              "core",
              "supplychain",
              "verification",
              "mpc",
              "iot",
              "lifecycle",
              "integration",
            ].map((tab, index) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3.5 rounded-2xl transition-all duration-300 transform hover:scale-105 whitespace-nowrap font-semibold text-sm ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-xl shadow-purple-500/20"
                    : "bg-gray-800/60 text-gray-300 hover:bg-gray-700/60 border border-gray-700/50 hover:border-gray-600/50 hover:shadow-lg"
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {tab === "supplychain"
                  ? "Supply Chain"
                  : tab === "verification"
                  ? "Product Verification"
                  : tab === "mpc"
                  ? "MPC Wallet"
                  : tab === "iot"
                  ? "IoT Dashboard"
                  : tab === "lifecycle"
                  ? "Lifecycle Demo"
                  : tab === "core"
                  ? "Core Concept"
                  : tab === "integration"
                  ? "Integration Test"
                  : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3 bg-gray-800/50 px-4 py-2 rounded-xl border border-gray-700/50">
            <span className="text-sm text-gray-400 font-medium">Role:</span>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              className="bg-transparent text-white px-3 py-1 rounded-lg text-sm border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              <option value="manufacturer">Manufacturer</option>
              <option value="transporter">Transporter</option>
              <option value="retailer">Retailer</option>
              <option value="consumer">Consumer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Dashboard Content */}
        {activeTab === "dashboard" && (
          <div className="animate-fade-in">
            <MainDashboard />
          </div>
        )}

        {/* Core Supply Chain Dashboard */}
        {activeTab === "core" && (
          <div className="space-y-8 animate-fade-in">
            <SupplyChainCoreDashboard />
          </div>
        )}

        {/* Supply Chain Dashboard */}
        {activeTab === "supplychain" && (
          <div className="space-y-8 animate-fade-in">
            <EnhancedSupplyChainDashboard />
          </div>
        )}

        {/* Product Verification */}
        {activeTab === "verification" && (
          <div className="space-y-8 animate-fade-in">
            <EnhancedProductVerification />
          </div>
        )}

        {/* MPC Wallet */}
        {activeTab === "mpc" && (
          <div className="space-y-8 animate-fade-in">
            <MPCWalletManager />
            <EnhancedMPCApprovals />
          </div>
        )}

        {/* IoT Dashboard */}
        {activeTab === "iot" && (
          <div className="space-y-8 animate-fade-in">
            <AdvancedIoTDashboard />
          </div>
        )}

        {/* Supply Chain Lifecycle */}
        {activeTab === "lifecycle" && (
          <div className="space-y-8 animate-fade-in">
            <SupplyChainLifecycle />
          </div>
        )}

        {/* Integration Test Dashboard */}
        {activeTab === "integration" && (
          <div className="space-y-8 animate-fade-in">
            <IntegrationTestDashboard />
          </div>
        )}
      </main>
    </div>
  );
};

export default ProTrackV2;
