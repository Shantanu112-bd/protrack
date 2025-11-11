import React, { useState, useEffect } from "react";
import { useWeb3 } from "../hooks/useWeb3";

interface DashboardProps {
  theme: {
    bg: string;
    text: string;
    card: string;
    border: string;
    button: string;
    buttonHover: string;
  };
}

const DarkDashboard: React.FC<DashboardProps> = ({ theme }) => {
  const { connectWallet, disconnectWallet, isActive, account, chainId } =
    useWeb3();
  const [totalProducts, setTotalProducts] = useState(1892);
  const [verifiedItems, setVerifiedItems] = useState(1198);
  const [activeShipments, setActiveShipments] = useState(23);
  const [alerts, setAlerts] = useState(5);
  const [temperature, setTemperature] = useState("23°C");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recentActivity, setRecentActivity] = useState([
    {
      type: "success",
      message: "Product batch verified successfully",
      time: "2 min ago",
    },
    {
      type: "info",
      message: "New shipment started tracking",
      time: "15 min ago",
    },
    {
      type: "warning",
      message: "Temperature alert triggered",
      time: "1 hour ago",
    },
    { type: "info", message: "IoT sensor connected", time: "2 hours ago" },
  ]);

  // Fetch blockchain data when connected
  useEffect(() => {
    if (isActive && supplyChainContract) {
      fetchBlockchainData();
    }
  }, [isActive, supplyChainContract]);

  const fetchBlockchainData = async () => {
    setIsLoading(true);
    try {
      // This is a placeholder for actual contract calls
      // In a real implementation, you would call specific contract methods
      if (web3 && supplyChainContract) {
        // Example: Get total products count from contract
        // const count = await supplyChainContract.methods.getTotalProducts().call();
        // setTotalProducts(parseInt(count));

        // For demo purposes, we'll use random data
        setTotalProducts(Math.floor(1800 + Math.random() * 200));
        setVerifiedItems(Math.floor(1100 + Math.random() * 150));
        setActiveShipments(Math.floor(20 + Math.random() * 10));

        // Update temperature with random value
        const temp = (20 + Math.random() * 5).toFixed(1);
        setTemperature(`${temp}°C`);

        // Generate alerts based on temperature
        const newAlerts = parseInt(temp) > 23 ? 5 : 0;
        setAlerts(newAlerts);

        // Update activity feed with blockchain timestamp
        const timestamp = await web3.eth
          .getBlock("latest")
          .then((block) => block.timestamp);
        const date = new Date(timestamp * 1000);
        const timeString = `${date.getHours()}:${date
          .getMinutes()
          .toString()
          .padStart(2, "0")}`;

        // Add new activity if connected
        if (isActive) {
          setRecentActivity((prev) => [
            {
              type: "success",
              message: `Wallet ${account?.substring(
                0,
                6
              )}...${account?.substring(account.length - 4)} connected`,
              time: "just now",
            },
            ...prev.slice(0, 3),
          ]);
        }
      }
    } catch (error) {
      console.error("Error fetching blockchain data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle product creation
  const handleCreateProduct = async () => {
    if (!isActive || !supplyChainContract) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      setRecentActivity((prev) => [
        { type: "info", message: "Creating new product...", time: "just now" },
        ...prev.slice(0, 3),
      ]);

      // Navigate to product creation page or open modal
      window.location.href = "#/create-product";
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  // Handle scan & verify
  const handleScanVerify = () => {
    if (!isActive) {
      alert("Please connect your wallet first");
      return;
    }

    setRecentActivity((prev) => [
      { type: "info", message: "Opening scanner...", time: "just now" },
      ...prev.slice(0, 3),
    ]);

    // Navigate to scan page or open modal
    window.location.href = "#/scan";
  };

  // Handle shipment tracking
  const handleTrackShipment = () => {
    if (!isActive) {
      alert("Please connect your wallet first");
      return;
    }

    setRecentActivity((prev) => [
      {
        type: "info",
        message: "Opening shipment tracker...",
        time: "just now",
      },
      ...prev.slice(0, 3),
    ]);

    // Navigate to tracking page
    window.location.href = "#/track";
  };

  // Handle IoT monitoring
  const handleIoTMonitor = () => {
    if (!isActive) {
      alert("Please connect your wallet first");
      return;
    }

    setRecentActivity((prev) => [
      { type: "info", message: "Opening IoT monitor...", time: "just now" },
      ...prev.slice(0, 3),
    ]);

    // Navigate to IoT dashboard
    window.location.href = "#/iot";
  };

  return (
    <div className="p-6 min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            <span className="text-blue-500">Pro</span>
            <span className="text-white">Track</span>
            <span className="text-blue-500"> Dashboard</span>
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products, batches..."
              className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <button className="text-gray-400 hover:text-white">
              <span className="text-xl">🌐</span>
            </button>
            <button className="text-gray-400 hover:text-white">
              <span className="text-xl">🔔</span>
              <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
                3
              </span>
            </button>
            <button className="text-gray-400 hover:text-white">
              <span className="text-xl">☀️</span>
            </button>
          </div>
          {!isActive ? (
            <button
              onClick={async () => {
                setIsConnecting(true);
                try {
                  await connectWallet();
                } catch (error) {
                  console.error("Failed to connect wallet:", error);
                } finally {
                  setIsConnecting(false);
                }
              }}
              disabled={isConnecting}
              className={`${
                isConnecting ? "bg-blue-800" : "bg-blue-600 hover:bg-blue-700"
              } text-white px-4 py-2 rounded-lg font-medium flex items-center`}
            >
              {isConnecting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Connecting...
                </>
              ) : (
                "Connect Wallet"
              )}
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="bg-gray-800 px-3 py-1 rounded-lg text-sm flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                {account?.substring(0, 6)}...
                {account?.substring(account.length - 4)}
                {chainId && (
                  <span className="ml-2 text-xs bg-blue-900 px-2 py-0.5 rounded">
                    {networkConfig?.name || `Chain: ${chainId}`}
                  </span>
                )}
              </div>
              <button
                onClick={disconnectWallet}
                className="text-gray-400 hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm5 4a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zm0 4a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center space-x-6 mb-8 border-b border-gray-800 pb-2">
        <a
          href="#/"
          className="text-blue-500 border-b-2 border-blue-500 pb-2 font-medium"
        >
          <span className="mr-1">🏠</span> Overview
        </a>
        <a
          href="#/products"
          className="text-gray-400 hover:text-white pb-2"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = "#/products";
            setRecentActivity((prev) => [
              {
                type: "info",
                message: "Viewing products list",
                time: "just now",
              },
              ...prev.slice(0, 3),
            ]);
          }}
        >
          <span className="mr-1">📦</span> Products
        </a>
        <a
          href="#/create-product"
          className="text-gray-400 hover:text-white pb-2"
          onClick={(e) => {
            e.preventDefault();
            handleCreateProduct();
          }}
        >
          <span className="mr-1">✅</span> Create Product
        </a>
        <a
          href="#/scan"
          className="text-gray-400 hover:text-white pb-2"
          onClick={(e) => {
            e.preventDefault();
            handleScanVerify();
          }}
        >
          <span className="mr-1">🔍</span> Scan & Verify
        </a>
        <a
          href="#/track"
          className="text-gray-400 hover:text-white pb-2"
          onClick={(e) => {
            e.preventDefault();
            handleTrackShipment();
          }}
        >
          <span className="mr-1">🌎</span> GPS Tracking
        </a>
        <a
          href="#/iot"
          className="text-gray-400 hover:text-white pb-2"
          onClick={(e) => {
            e.preventDefault();
            handleIoTMonitor();
          }}
        >
          <span className="mr-1">🌡️</span> IoT Dashboard
        </a>
        <a
          href="#/analytics"
          className="text-gray-400 hover:text-white pb-2"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = "#/analytics";
            setRecentActivity((prev) => [
              {
                type: "info",
                message: "Viewing analytics dashboard",
                time: "just now",
              },
              ...prev.slice(0, 3),
            ]);
          }}
        >
          <span className="mr-1">📊</span> Analytics
        </a>
        <a
          href="#/recalls"
          className="text-gray-400 hover:text-white pb-2"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = "#/recalls";
            setRecentActivity((prev) => [
              {
                type: "info",
                message: "Checking product recalls",
                time: "just now",
              },
              ...prev.slice(0, 3),
            ]);
          }}
        >
          <span className="mr-1">⚠️</span> Recalls
        </a>
        <a
          href="#/notifications"
          className="text-gray-400 hover:text-white pb-2"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = "#/notifications";
            setRecentActivity((prev) => [
              {
                type: "info",
                message: "Viewing notifications",
                time: "just now",
              },
              ...prev.slice(0, 3),
            ]);
          }}
        >
          <span className="mr-1">🔔</span> Notifications
        </a>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div
          className={`bg-gray-800 rounded-xl p-6 border border-gray-700 ${
            isLoading ? "animate-pulse" : ""
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 mb-1">Total Products</p>
              <h3 className="text-3xl font-bold text-white">
                {totalProducts.toLocaleString()}
              </h3>
              <p className="text-green-500 text-sm">+12%</p>
            </div>
            <div className="bg-blue-900/30 p-3 rounded-lg">
              <span className="text-2xl">📦</span>
            </div>
          </div>
        </div>

        <div
          className={`bg-gray-800 rounded-xl p-6 border border-gray-700 ${
            isLoading ? "animate-pulse" : ""
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 mb-1">Verified Items</p>
              <h3 className="text-3xl font-bold text-white">
                {verifiedItems.toLocaleString()}
              </h3>
              <p className="text-green-500 text-sm">
                {Math.round((verifiedItems / totalProducts) * 100)}%
              </p>
            </div>
            <div className="bg-green-900/30 p-3 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div
          className={`bg-gray-800 rounded-xl p-6 border border-gray-700 ${
            isLoading ? "animate-pulse" : ""
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 mb-1">Active Shipments</p>
              <h3 className="text-3xl font-bold text-white">
                {activeShipments}
              </h3>
              <p className="text-red-500 text-sm">2 today</p>
            </div>
            <div className="bg-orange-900/30 p-3 rounded-lg">
              <span className="text-2xl">🚚</span>
            </div>
          </div>
        </div>

        <div
          className={`bg-gray-800 rounded-xl p-6 border border-gray-700 ${
            isLoading ? "animate-pulse" : ""
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 mb-1">Temperature</p>
              <h3 className="text-3xl font-bold text-white">{temperature}</h3>
              <p className="text-red-500 text-sm">
                {alerts > 0 ? `${alerts} Alerts` : "Normal"}
              </p>
            </div>
            <div className="bg-red-900/30 p-3 rounded-lg">
              <span className="text-2xl">🌡️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="col-span-2 bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start">
                <div
                  className={`mt-1 mr-3 ${
                    activity.type === "success"
                      ? "text-green-500"
                      : activity.type === "warning"
                      ? "text-yellow-500"
                      : "text-blue-500"
                  }`}
                >
                  {activity.type === "success"
                    ? "●"
                    : activity.type === "warning"
                    ? "●"
                    : activity.type === "info"
                    ? "●"
                    : "●"}
                </div>
                <div className="flex-1">
                  <p className="text-white">{activity.message}</p>
                  <p className="text-gray-400 text-sm">{activity.time}</p>
                </div>
                {index === 0 && (
                  <button
                    onClick={() => {
                      // Handle action based on activity type
                      if (activity.message.includes("scanner")) {
                        handleScanVerify();
                      } else if (activity.message.includes("shipment")) {
                        handleTrackShipment();
                      } else if (activity.message.includes("IoT")) {
                        handleIoTMonitor();
                      } else if (activity.message.includes("product")) {
                        handleCreateProduct();
                      }
                    }}
                    className="text-blue-500 hover:text-blue-400 text-sm"
                  >
                    View
                  </button>
                )}
              </div>
            ))}
            {isActive && (
              <button
                onClick={() => {
                  // Simulate new activity
                  const activities = [
                    {
                      type: "info",
                      message: "New temperature reading received",
                      time: "just now",
                    },
                    {
                      type: "success",
                      message: "Blockchain transaction confirmed",
                      time: "just now",
                    },
                    {
                      type: "warning",
                      message: "Shipment delay detected",
                      time: "just now",
                    },
                  ];
                  const randomActivity =
                    activities[Math.floor(Math.random() * activities.length)];
                  setRecentActivity((prev) => [
                    randomActivity,
                    ...prev.slice(0, 3),
                  ]);
                }}
                className="w-full mt-2 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-center text-sm"
              >
                Refresh Activity
              </button>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleCreateProduct}
              className="bg-gray-900 hover:bg-gray-700 transition-colors p-4 rounded-xl border border-gray-700 flex flex-col items-center justify-center"
            >
              <div className="bg-orange-900/20 p-3 rounded-lg mb-2">
                <span className="text-2xl">📦</span>
              </div>
              <span className="text-sm">Create Product</span>
            </button>

            <button
              onClick={handleScanVerify}
              className="bg-gray-900 hover:bg-gray-700 transition-colors p-4 rounded-xl border border-gray-700 flex flex-col items-center justify-center"
            >
              <div className="bg-blue-900/20 p-3 rounded-lg mb-2">
                <span className="text-2xl">🔍</span>
              </div>
              <span className="text-sm">Scan & Verify</span>
            </button>

            <button
              onClick={handleTrackShipment}
              className="bg-gray-900 hover:bg-gray-700 transition-colors p-4 rounded-xl border border-gray-700 flex flex-col items-center justify-center"
            >
              <div className="bg-green-900/20 p-3 rounded-lg mb-2">
                <span className="text-2xl">🚚</span>
              </div>
              <span className="text-sm">Track Shipment</span>
            </button>

            <button
              onClick={handleIoTMonitor}
              className="bg-gray-900 hover:bg-gray-700 transition-colors p-4 rounded-xl border border-gray-700 flex flex-col items-center justify-center"
            >
              <div className="bg-purple-900/20 p-3 rounded-lg mb-2">
                <span className="text-2xl">🌡️</span>
              </div>
              <span className="text-sm">IoT Monitor</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DarkDashboard;
