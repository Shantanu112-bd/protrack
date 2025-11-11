import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Home,
  Package,
  Scan,
  MapPin,
  Cpu,
  BarChart3,
  AlertTriangle,
  Settings,
  LogOut,
  User,
  Wallet,
  Moon,
  Sun,
  Globe,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useWeb3 } from "../hooks/useWeb3";
import { useTheme } from "../contexts/ThemeContext";
import NotificationCenter from "../components/NotificationCenter";
import { EnhancedNavigation } from "../components/ui/enhanced-navigation";
import { FloatingActionMenu } from "../components/ui/floating-action-menu";
import { KeyboardShortcuts } from "../components/ui/keyboard-shortcuts";
import WalletConnection from "../components/WalletConnection";
import { formatAddress } from "../lib/utils";
import { Link, useLocation } from "react-router-dom";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Overview", href: "/dashboard/overview", icon: Home },
  { name: "Products", href: "/dashboard/products", icon: Package },
  { name: "Scan & Verify", href: "/dashboard/products/scan", icon: Scan },
  { name: "Tracking", href: "/dashboard/tracking", icon: MapPin },
  { name: "IoT Dashboard", href: "/dashboard/iot", icon: Cpu },
  { name: "Blockchain", href: "/dashboard/blockchain", icon: Wallet },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Recalls", href: "/dashboard/recalls", icon: AlertTriangle },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [useEnhancedNav, setUseEnhancedNav] = useState(true);
  const { user, profile, signOut } = useAuth();
  const { account, isActive, connectWallet, disconnectWallet } = useWeb3();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    if (isActive) {
      disconnectWallet();
    }
  };

  const getRoleColor = (role: string) => {
    const colors = {
      manufacturer:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      packager:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      wholesaler:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      seller:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      inspector: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      customer: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
      admin:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
    };
    return colors[role as keyof typeof colors] || colors.customer;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div
              className="fixed inset-0 bg-gray-600 bg-opacity-75"
              onClick={() => setSidebarOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -320 }}
        className="fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-800 shadow-xl lg:translate-x-0 lg:static lg:inset-0"
      >
        {useEnhancedNav ? (
          <EnhancedNavigation />
        ) : (
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Pro<span className="text-blockchain-500">Track</span>
              </h1>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* User Profile */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blockchain-500 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user?.email}
                  </p>
                  {profile && (
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
                        profile.role
                      )}`}
                    >
                      {profile.role}
                    </span>
                  )}
                </div>
              </div>

              {/* Wallet Connection */}
              <div className="mt-4">
                {isActive ? (
                  <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Wallet className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-green-700 dark:text-green-300">
                        {formatAddress(account || "")}
                      </span>
                    </div>
                    <button
                      onClick={disconnectWallet}
                      className="text-xs text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={connectWallet}
                    className="w-full flex items-center justify-center space-x-2 p-2 bg-blockchain-500 text-white rounded-lg hover:bg-blockchain-600 transition-colors"
                  >
                    <Wallet className="w-4 h-4" />
                    <span className="text-sm">Connect Wallet</span>
                  </button>
                )}
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-6 py-4 space-y-1 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? "bg-blockchain-100 text-blockchain-700 dark:bg-blockchain-900 dark:text-blockchain-300"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 ${
                        isActive
                          ? "text-blockchain-500"
                          : "text-gray-400 group-hover:text-gray-500"
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Footer Actions */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 space-y-2">
              <div className="flex items-center justify-between">
                <button
                  onClick={toggleTheme}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  {theme === "light" ? (
                    <Moon className="w-5 h-5" />
                  ) : (
                    <Sun className="w-5 h-5" />
                  )}
                  <span className="text-sm">
                    {theme === "light" ? "Dark" : "Light"} Mode
                  </span>
                </button>
                <button className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                  <Globe className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center space-x-2 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Main content */}
      <div className="lg:pl-80">
        {/* Top navigation */}
        <div className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-300 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1" />
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <WalletConnection />
              <NotificationCenter />
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>

      {/* Enhanced UI Components */}
      <FloatingActionMenu />
      <KeyboardShortcuts />

      {/* Navigation Toggle (for demo) */}
      <div className="fixed bottom-4 left-4 z-40">
        <button
          onClick={() => setUseEnhancedNav(!useEnhancedNav)}
          className="px-3 py-2 bg-blue-600 text-white text-xs rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
        >
          {useEnhancedNav ? "Classic Nav" : "Enhanced Nav"}
        </button>
      </div>
    </div>
  );
};

export default DashboardLayout;
