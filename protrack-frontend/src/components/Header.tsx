import React, { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Web3Context } from "../contexts/web3ContextTypes";
import { Wallet, LogOut, AlertCircle, Bot } from "lucide-react";
import AIAssistant from "../AIAssistant";

const Header = () => {
  const location = useLocation();
  const { account, isActive, connectWallet, disconnectWallet, error } =
    useContext(Web3Context);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);

  // Navigation items - using /dashboard/* paths to match main.tsx routing
  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Products", path: "/dashboard/products" },
    { name: "Shipments", path: "/dashboard/shipments" },
    { name: "Mint", path: "/dashboard/mint" },
    { name: "Scan", path: "/dashboard/scan" },
    { name: "IoT", path: "/dashboard/iot" },
    { name: "Analytics", path: "/dashboard/analytics" },
    { name: "Optimization", path: "/dashboard/optimization" },
    { name: "Quality", path: "/dashboard/quality" },
    { name: "Compliance", path: "/dashboard/compliance" },
    { name: "Sensors", path: "/dashboard/sensors" },
  ];

  // Truncate wallet address for display
  const truncateAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  return (
    <>
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <div className="bg-white text-blue-600 p-1 rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <span className="text-xl font-bold">ProTrack</span>
              </Link>
            </div>

            <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    location.pathname === item.path ||
                    (item.path === "/dashboard" &&
                      location.pathname === "/dashboard")
                      ? "bg-white text-blue-600"
                      : "text-white hover:bg-blue-500 hover:bg-opacity-50"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              {/* AI Assistant Button */}
              <button
                onClick={() => setIsAIAssistantOpen(true)}
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-colors duration-200 font-medium"
              >
                <Bot className="h-4 w-4" />
                <span className="hidden sm:inline">AI Assistant</span>
              </button>

              {isActive && account ? (
                <div className="flex items-center space-x-3 bg-white bg-opacity-20 rounded-lg px-3 py-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm font-medium hidden sm:inline-block">
                      {truncateAddress(account)}
                    </span>
                  </div>
                  <button
                    onClick={disconnectWallet}
                    className="text-white hover:text-gray-200 transition-colors"
                    aria-label="Disconnect wallet"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="flex items-center space-x-2 bg-white text-blue-600 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
                >
                  <Wallet className="h-4 w-4" />
                  <span>Connect Wallet</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile navigation */}
          <div className="md:hidden pb-4">
            <div className="flex flex-wrap gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-2 py-1 text-xs rounded transition-colors duration-200 ${
                    location.pathname === item.path ||
                    (item.path === "/dashboard" &&
                      location.pathname === "/dashboard")
                      ? "bg-white text-blue-600"
                      : "text-white hover:bg-blue-500 hover:bg-opacity-50"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className="bg-red-500 bg-opacity-80 rounded-lg p-2 mb-2 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span className="text-xs">{error}</span>
            </div>
          )}
        </div>
      </header>

      {/* AI Assistant Modal */}
      {isAIAssistantOpen && (
        <AIAssistant onClose={() => setIsAIAssistantOpen(false)} />
      )}
    </>
  );
};

export default Header;
