import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { useNavigate, Link } from "react-router-dom";
import { useWeb3 } from "../../hooks/useWeb3";
import { useToast } from "../ui/use-toast";
import { supabase } from "../../services/supabase";

type UserRole =
  | "manufacturer"
  | "transporter"
  | "retailer"
  | "consumer"
  | "wholesaler"
  | "admin"
  | "unknown";

const MainDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { account, disconnectWallet } = useWeb3();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<UserRole>("unknown");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!account) {
        setLoading(false);
        return;
      }

      try {
        // Get user role from Supabase
        const { data, error } = await supabase
          .from("users")
          .select("role")
          .eq("wallet_address", account.toLowerCase())
          .single();

        if (error) {
          console.error("Error fetching user role:", error);
          setUserRole("unknown");
        } else if (data) {
          setUserRole(data.role as UserRole);
        } else {
          // Default to unknown if no role found
          setUserRole("unknown");
        }
      } catch (error) {
        console.error("Failed to fetch user role:", error);
        toast({
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [account, toast]);

  const handleSignOut = () => {
    disconnectWallet();
    navigate("/signin");
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-6"></div>
          <p className="text-xl text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="container mx-auto p-4">
        <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Connect Wallet
            </CardTitle>
            <CardDescription className="text-gray-400">
              Please connect your wallet to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4 text-gray-300">
              You need to connect your wallet to view your dashboard
            </p>
            <Button onClick={() => navigate("/signin")}>Go to Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 text-white flex">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-gray-800/50 backdrop-blur-lg border-r border-gray-700 p-4 flex flex-col">
        <div className="flex items-center mb-8 p-3 bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-lg">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-8 h-8 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm">PT</span>
          </div>
          <h2 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            ProTrack
          </h2>
        </div>

        <nav className="flex-1">
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
              Core Features
            </h3>
            <ul className="space-y-1">
              <li>
                <Link to="/rfid-scanner">
                  <div className="w-full text-left px-3 py-2 rounded-lg transition-all duration-200 text-gray-300 hover:bg-gray-700/50 cursor-pointer">
                    RFID Scanner
                  </div>
                </Link>
              </li>
              <li>
                <Link to="/iot-data">
                  <div className="w-full text-left px-3 py-2 rounded-lg transition-all duration-200 text-gray-300 hover:bg-gray-700/50 cursor-pointer">
                    IoT Data
                  </div>
                </Link>
              </li>
              <li>
                <Link to="/tracking-map">
                  <div className="w-full text-left px-3 py-2 rounded-lg transition-all duration-200 text-gray-300 hover:bg-gray-700/50 cursor-pointer">
                    Tracking Map
                  </div>
                </Link>
              </li>
              <li>
                <Link to="/mpc-wallet">
                  <div className="w-full text-left px-3 py-2 rounded-lg transition-all duration-200 text-gray-300 hover:bg-gray-700/50 cursor-pointer">
                    MPC Wallet
                  </div>
                </Link>
              </li>
              <li>
                <Link to="/verify">
                  <div className="w-full text-left px-3 py-2 rounded-lg transition-all duration-200 text-gray-300 hover:bg-gray-700/50 cursor-pointer">
                    Verify
                  </div>
                </Link>
              </li>
              <li>
                <Link to="/analytics">
                  <div className="w-full text-left px-3 py-2 rounded-lg transition-all duration-200 text-gray-300 hover:bg-gray-700/50 cursor-pointer">
                    Analytics
                  </div>
                </Link>
              </li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
              Advanced Features
            </h3>
            <ul className="space-y-1">
              <li>
                <Link to="/ar-scanner">
                  <div className="w-full text-left px-3 py-2 rounded-lg transition-all duration-200 text-gray-300 hover:bg-gray-700/50 cursor-pointer">
                    AR Scanner
                  </div>
                </Link>
              </li>
              <li>
                <Link to="/ai-assistant">
                  <div className="w-full text-left px-3 py-2 rounded-lg transition-all duration-200 text-gray-300 hover:bg-gray-700/50 cursor-pointer">
                    AI Assistant
                  </div>
                </Link>
              </li>
              <li>
                <Link to="/nft-creation">
                  <div className="w-full text-left px-3 py-2 rounded-lg transition-all duration-200 text-gray-300 hover:bg-gray-700/50 cursor-pointer">
                    NFT Creation
                  </div>
                </Link>
              </li>
              <li>
                <Link to="/key-management">
                  <div className="w-full text-left px-3 py-2 rounded-lg transition-all duration-200 text-gray-300 hover:bg-gray-700/50 cursor-pointer">
                    Key Management
                  </div>
                </Link>
              </li>
              <li>
                <Link to="/iot-visualization">
                  <div className="w-full text-left px-3 py-2 rounded-lg transition-all duration-200 text-gray-300 hover:bg-gray-700/50 cursor-pointer">
                    IoT Visualization
                  </div>
                </Link>
              </li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
              Role Dashboards
            </h3>
            <ul className="space-y-1">
              <li>
                <Link to="/manufacturer">
                  <div className="w-full text-left px-3 py-2 rounded-lg transition-all duration-200 text-gray-300 hover:bg-gray-700/50 cursor-pointer">
                    Manufacturer
                  </div>
                </Link>
              </li>
              <li>
                <Link to="/transporter">
                  <div className="w-full text-left px-3 py-2 rounded-lg transition-all duration-200 text-gray-300 hover:bg-gray-700/50 cursor-pointer">
                    Transporter
                  </div>
                </Link>
              </li>
              <li>
                <Link to="/retailer">
                  <div className="w-full text-left px-3 py-2 rounded-lg transition-all duration-200 text-gray-300 hover:bg-gray-700/50 cursor-pointer">
                    Retailer
                  </div>
                </Link>
              </li>
              <li>
                <Link to="/admin">
                  <div className="w-full text-left px-3 py-2 rounded-lg transition-all duration-200 text-gray-300 hover:bg-gray-700/50 cursor-pointer">
                    Admin
                  </div>
                </Link>
              </li>
              <li>
                <Link to="/consumer">
                  <div className="w-full text-left px-3 py-2 rounded-lg transition-all duration-200 text-gray-300 hover:bg-gray-700/50 cursor-pointer">
                    Consumer
                  </div>
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        <div className="pt-4 border-t border-gray-700">
          <div className="text-sm px-3">
            <div className="text-gray-400 mb-1">Connected as</div>
            <div className="font-mono text-gray-200 truncate">
              {account.slice(0, 6)}...{account.slice(-4)}
            </div>
          </div>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="w-full mt-3 border-gray-600 text-gray-300 hover:bg-gray-700/50"
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gray-800/30 backdrop-blur-lg border-b border-gray-700 p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Supply Chain Dashboard
            </h1>
            <div className="text-sm bg-gray-800/50 px-3 py-1 rounded-lg">
              Role: <span className="font-medium capitalize">{userRole}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                Welcome to ProTrack
              </CardTitle>
              <CardDescription className="text-gray-400">
                Select an option from the sidebar to navigate to different
                interfaces
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link to="/rfid-scanner">
                  <div className="p-6 bg-gradient-to-br from-blue-900/30 to-blue-800/30 backdrop-blur-lg border border-blue-700/50 rounded-2xl shadow-xl hover:from-blue-800/40 hover:to-blue-700/40 transition-all cursor-pointer">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">
                        RFID Scanner
                      </h3>
                      <div className="p-2 bg-blue-500/20 rounded-lg text-xl text-blue-400">
                        🔍
                      </div>
                    </div>
                    <p className="text-gray-400 mt-2">
                      Scan and tokenize products
                    </p>
                  </div>
                </Link>

                <Link to="/iot-data">
                  <div className="p-6 bg-gradient-to-br from-green-900/30 to-green-800/30 backdrop-blur-lg border border-green-700/50 rounded-2xl shadow-xl hover:from-green-800/40 hover:to-green-700/40 transition-all cursor-pointer">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">
                        IoT Data
                      </h3>
                      <div className="p-2 bg-green-500/20 rounded-lg text-xl text-green-400">
                        📊
                      </div>
                    </div>
                    <p className="text-gray-400 mt-2">Monitor sensor data</p>
                  </div>
                </Link>

                <Link to="/tracking-map">
                  <div className="p-6 bg-gradient-to-br from-purple-900/30 to-purple-800/30 backdrop-blur-lg border border-purple-700/50 rounded-2xl shadow-xl hover:from-purple-800/40 hover:to-purple-700/40 transition-all cursor-pointer">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">
                        Tracking Map
                      </h3>
                      <div className="p-2 bg-purple-500/20 rounded-lg text-xl text-purple-400">
                        🌍
                      </div>
                    </div>
                    <p className="text-gray-400 mt-2">
                      Visualize product locations
                    </p>
                  </div>
                </Link>

                <Link to="/mpc-wallet">
                  <div className="p-6 bg-gradient-to-br from-indigo-900/30 to-indigo-800/30 backdrop-blur-lg border border-indigo-700/50 rounded-2xl shadow-xl hover:from-indigo-800/40 hover:to-indigo-700/40 transition-all cursor-pointer">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">
                        MPC Wallet
                      </h3>
                      <div className="p-2 bg-indigo-500/20 rounded-lg text-xl text-indigo-400">
                        💼
                      </div>
                    </div>
                    <p className="text-gray-400 mt-2">
                      Manage wallet and transactions
                    </p>
                  </div>
                </Link>

                <Link to="/verify">
                  <div className="p-6 bg-gradient-to-br from-amber-900/30 to-amber-800/30 backdrop-blur-lg border border-amber-700/50 rounded-2xl shadow-xl hover:from-amber-800/40 hover:to-amber-700/40 transition-all cursor-pointer">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">
                        Verify
                      </h3>
                      <div className="p-2 bg-amber-500/20 rounded-lg text-xl text-amber-400">
                        ✅
                      </div>
                    </div>
                    <p className="text-gray-400 mt-2">
                      Verify product authenticity
                    </p>
                  </div>
                </Link>

                <Link to="/analytics">
                  <div className="p-6 bg-gradient-to-br from-red-900/30 to-red-800/30 backdrop-blur-lg border border-red-700/50 rounded-2xl shadow-xl hover:from-red-800/40 hover:to-red-700/40 transition-all cursor-pointer">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">
                        Analytics
                      </h3>
                      <div className="p-2 bg-red-500/20 rounded-lg text-xl text-red-400">
                        📈
                      </div>
                    </div>
                    <p className="text-gray-400 mt-2">Supply chain insights</p>
                  </div>
                </Link>

                <Link to="/ar-scanner">
                  <div className="p-6 bg-gradient-to-br from-cyan-900/30 to-cyan-800/30 backdrop-blur-lg border border-cyan-700/50 rounded-2xl shadow-xl hover:from-cyan-800/40 hover:to-cyan-700/40 transition-all cursor-pointer">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">
                        AR Scanner
                      </h3>
                      <div className="p-2 bg-cyan-500/20 rounded-lg text-xl text-cyan-400">
                        📷
                      </div>
                    </div>
                    <p className="text-gray-400 mt-2">
                      Augmented reality scanning
                    </p>
                  </div>
                </Link>

                <Link to="/ai-assistant">
                  <div className="p-6 bg-gradient-to-br from-violet-900/30 to-violet-800/30 backdrop-blur-lg border border-violet-700/50 rounded-2xl shadow-xl hover:from-violet-800/40 hover:to-violet-700/40 transition-all cursor-pointer">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">
                        AI Assistant
                      </h3>
                      <div className="p-2 bg-violet-500/20 rounded-lg text-xl text-violet-400">
                        🤖
                      </div>
                    </div>
                    <p className="text-gray-400 mt-2">Intelligent assistance</p>
                  </div>
                </Link>

                <Link to="/nft-creation">
                  <div className="p-6 bg-gradient-to-br from-emerald-900/30 to-emerald-800/30 backdrop-blur-lg border border-emerald-700/50 rounded-2xl shadow-xl hover:from-emerald-800/40 hover:to-emerald-700/40 transition-all cursor-pointer">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">
                        NFT Creation
                      </h3>
                      <div className="p-2 bg-emerald-500/20 rounded-lg text-xl text-emerald-400">
                        🖼️
                      </div>
                    </div>
                    <p className="text-gray-400 mt-2">Create product NFTs</p>
                  </div>
                </Link>
              </div>

              <div className="mt-8">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Role Dashboards
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Link to="/manufacturer">
                    <div className="p-6 bg-gradient-to-br from-cyan-900/30 to-cyan-800/30 backdrop-blur-lg border border-cyan-700/50 rounded-2xl shadow-xl hover:from-cyan-800/40 hover:to-cyan-700/40 transition-all cursor-pointer">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">
                          Manufacturer
                        </h3>
                        <div className="p-2 bg-cyan-500/20 rounded-lg text-xl text-cyan-400">
                          🏭
                        </div>
                      </div>
                      <p className="text-gray-400 mt-2">Manage production</p>
                    </div>
                  </Link>

                  <Link to="/transporter">
                    <div className="p-6 bg-gradient-to-br from-teal-900/30 to-teal-800/30 backdrop-blur-lg border border-teal-700/50 rounded-2xl shadow-xl hover:from-teal-800/40 hover:to-teal-700/40 transition-all cursor-pointer">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">
                          Transporter
                        </h3>
                        <div className="p-2 bg-teal-500/20 rounded-lg text-xl text-teal-400">
                          🚚
                        </div>
                      </div>
                      <p className="text-gray-400 mt-2">Manage shipments</p>
                    </div>
                  </Link>

                  <Link to="/retailer">
                    <div className="p-6 bg-gradient-to-br from-pink-900/30 to-pink-800/30 backdrop-blur-lg border border-pink-700/50 rounded-2xl shadow-xl hover:from-pink-800/40 hover:to-pink-700/40 transition-all cursor-pointer">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">
                          Retailer
                        </h3>
                        <div className="p-2 bg-pink-500/20 rounded-lg text-xl text-pink-400">
                          🛒
                        </div>
                      </div>
                      <p className="text-gray-400 mt-2">Manage inventory</p>
                    </div>
                  </Link>

                  <Link to="/admin">
                    <div className="p-6 bg-gradient-to-br from-violet-900/30 to-violet-800/30 backdrop-blur-lg border border-violet-700/50 rounded-2xl shadow-xl hover:from-violet-800/40 hover:to-violet-700/40 transition-all cursor-pointer">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">
                          Admin
                        </h3>
                        <div className="p-2 bg-violet-500/20 rounded-lg text-xl text-violet-400">
                          ⚙️
                        </div>
                      </div>
                      <p className="text-gray-400 mt-2">System management</p>
                    </div>
                  </Link>

                  <Link to="/consumer">
                    <div className="p-6 bg-gradient-to-br from-orange-900/30 to-orange-800/30 backdrop-blur-lg border border-orange-700/50 rounded-2xl shadow-xl hover:from-orange-800/40 hover:to-orange-700/40 transition-all cursor-pointer">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">
                          Consumer
                        </h3>
                        <div className="p-2 bg-orange-500/20 rounded-lg text-xl text-orange-400">
                          👤
                        </div>
                      </div>
                      <p className="text-gray-400 mt-2">Verify products</p>
                    </div>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default MainDashboard;
