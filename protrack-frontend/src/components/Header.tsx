import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWeb3 } from "../contexts/web3ContextTypes";
import { Button } from "./ui/button";
import {
  Package,
  Truck,
  QrCode,
  Activity,
  Wallet,
  Home,
  PlusCircle,
  LogOut,
  BarChart3,
  Shield,
  CheckCircle,
  TrendingUp,
} from "lucide-react";

const Header = () => {
  const { account, connectWallet, disconnectWallet } = useWeb3();
  const navigate = useNavigate();

  const handleDisconnect = () => {
    disconnectWallet();
    navigate("/signin");
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50 w-full">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center py-4 gap-4">
          <div className="flex items-center space-x-2">
            <Link to="/dashboard" className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-800 ml-2">
                ProTrack
              </h1>
            </Link>
          </div>

          <nav className="flex flex-wrap justify-center gap-4 md:gap-8">
            <Link
              to="/dashboard"
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              <Home className="h-5 w-5 mr-1" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <Link
              to="/dashboard/products"
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              <Package className="h-5 w-5 mr-1" />
              <span className="hidden sm:inline">Products</span>
            </Link>
            <Link
              to="/dashboard/shipments"
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              <Truck className="h-5 w-5 mr-1" />
              <span className="hidden sm:inline">Shipments</span>
            </Link>
            <Link
              to="/dashboard/mint"
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              <PlusCircle className="h-5 w-5 mr-1" />
              <span className="hidden sm:inline">Mint</span>
            </Link>
            <Link
              to="/dashboard/scan"
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              <QrCode className="h-5 w-5 mr-1" />
              <span className="hidden sm:inline">Scan</span>
            </Link>
            <Link
              to="/dashboard/iot"
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              <Activity className="h-5 w-5 mr-1" />
              <span className="hidden sm:inline">IoT</span>
            </Link>
            <Link
              to="/dashboard/analytics"
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              <BarChart3 className="h-5 w-5 mr-1" />
              <span className="hidden sm:inline">Analytics</span>
            </Link>
            <Link
              to="/dashboard/optimization"
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              <TrendingUp className="h-5 w-5 mr-1" />
              <span className="hidden sm:inline">Optimization</span>
            </Link>
            <Link
              to="/dashboard/quality"
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              <CheckCircle className="h-5 w-5 mr-1" />
              <span className="hidden sm:inline">Quality</span>
            </Link>
            <Link
              to="/dashboard/compliance"
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              <Shield className="h-5 w-5 mr-1" />
              <span className="hidden sm:inline">Compliance</span>
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            {account ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700 hidden md:inline bg-gray-100 px-3 py-1 rounded-full">
                  {account.substring(0, 6)}...
                  {account.substring(account.length - 4)}
                </span>
                <Button
                  variant="outline"
                  onClick={handleDisconnect}
                  className="flex items-center text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">Disconnect</span>
                </Button>
              </div>
            ) : (
              <Button
                onClick={connectWallet}
                className="flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
