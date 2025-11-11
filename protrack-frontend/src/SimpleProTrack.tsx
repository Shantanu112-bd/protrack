import React, { useState, useEffect } from "react";

// Simple ProTrack Dashboard - Easy to understand and explain
const SimpleProTrack = () => {
  // Basic state management - easy to explain
  const [currentPage, setCurrentPage] = useState("login");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState("Checking...");
  const [loginData, setLoginData] = useState({
    email: "admin@protrack.com",
    password: "password",
  });

  // API Configuration
  const API_BASE_URL = "http://localhost:3001/api/v1";

  // Check API status on component mount
  useEffect(() => {
    checkApiStatus();
    loadProducts();
  }, []);

  // Check if backend API is running
  const checkApiStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/status`);
      const data = await response.json();
      setApiStatus(data.success ? "Connected ✅" : "Error ❌");
    } catch (error) {
      setApiStatus("Disconnected ❌");
    }
  };

  // Load products from backend
  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      const data = await response.json();
      if (data.success) {
        setProducts(data.data.products || []);
      }
    } catch (error) {
      console.error("Failed to load products:", error);
    }
    setLoading(false);
  };

  // Login function with API call
  const login = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });
      const data = await response.json();
      if (data.success) {
        setCurrentPage("dashboard");
        loadProducts(); // Load products after login
      } else {
        alert("Login failed: " + data.message);
      }
    } catch (error) {
      alert("Login error: " + error.message);
    }
    setLoading(false);
  };

  // Create a new product
  const createProduct = async (productData) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });
      const data = await response.json();
      if (data.success) {
        loadProducts(); // Reload products
        alert("Product created successfully!");
      } else {
        alert("Failed to create product: " + data.message);
      }
    } catch (error) {
      alert("Error creating product: " + error.message);
    }
    setLoading(false);
  };

  const logout = () => setCurrentPage("login");
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Theme classes - simple conditional styling
  const theme = {
    bg: isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900",
    card: isDarkMode
      ? "bg-gray-800 border-gray-700"
      : "bg-white border-gray-200",
    input: isDarkMode
      ? "bg-gray-700 border-gray-600 text-white"
      : "bg-white border-gray-300 text-gray-900",
  };

  // Login Page Component
  if (currentPage === "login") {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${theme.bg}`}
      >
        <div className={`w-96 p-8 rounded-2xl border shadow-xl ${theme.card}`}>
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">
              Pro<span className="text-blue-500">Track</span>
            </h1>
            <p className="text-gray-500 mt-2">Supply Chain Management</p>
          </div>

          {/* API Status */}
          <div className="text-center mb-4">
            <span className="text-sm">Backend API: </span>
            <span
              className={`text-sm font-semibold ${
                apiStatus.includes("✅") ? "text-green-500" : "text-red-500"
              }`}
            >
              {apiStatus}
            </span>
          </div>

          {/* Login Form */}
          <div className="space-y-4">
            <input
              type="email"
              placeholder="admin@protrack.com"
              value={loginData.email}
              onChange={(e) =>
                setLoginData({ ...loginData, email: e.target.value })
              }
              className={`w-full px-4 py-3 rounded-lg border ${theme.input}`}
            />
            <input
              type="password"
              placeholder="password"
              value={loginData.password}
              onChange={(e) =>
                setLoginData({ ...loginData, password: e.target.value })
              }
              className={`w-full px-4 py-3 rounded-lg border ${theme.input}`}
            />
            <button
              onClick={login}
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white rounded-lg font-medium transition-colors"
            >
              {loading ? "Logging in..." : "Login to Dashboard"}
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="mt-4 w-full py-2 text-sm text-blue-500 hover:text-blue-600"
          >
            Switch to {isDarkMode ? "Light" : "Dark"} Mode
          </button>
        </div>
      </div>
    );
  }

  // Dashboard Page
  return (
    <div className={`min-h-screen ${theme.bg}`}>
      {/* Header */}
      <header className={`border-b p-4 ${theme.card}`}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">ProTrack Dashboard</h1>
            <div className="flex items-center space-x-4 mt-1">
              <span className="text-sm">API Status: </span>
              <span
                className={`text-sm font-semibold ${
                  apiStatus.includes("✅") ? "text-green-500" : "text-red-500"
                }`}
              >
                {apiStatus}
              </span>
              <button
                onClick={checkApiStatus}
                className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Refresh
              </button>
            </div>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-600"
            >
              {isDarkMode ? "☀️" : "🌙"}
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="p-4">
        <div className="flex space-x-4">
          {["Overview", "Products", "Tracking", "Analytics"].map((tab) => (
            <button
              key={tab}
              onClick={() => setCurrentPage(tab.toLowerCase())}
              className={`px-4 py-2 rounded-lg ${
                currentPage === tab.toLowerCase()
                  ? "bg-blue-600 text-white"
                  : "bg-gray-600 text-gray-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6">
        {currentPage === "overview" && <OverviewPage theme={theme} />}
        {currentPage === "products" && (
          <ProductsPage products={products} theme={theme} />
        )}
        {currentPage === "tracking" && <TrackingPage theme={theme} />}
        {currentPage === "analytics" && <AnalyticsPage theme={theme} />}
      </main>
    </div>
  );
};

// Simple Overview Component
const OverviewPage = ({ theme }: any) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold">Dashboard Overview</h2>

    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[
        { title: "Total Products", value: "1,247", color: "blue" },
        { title: "Active Shipments", value: "89", color: "green" },
        { title: "Verified Items", value: "1,156", color: "purple" },
        { title: "Alerts", value: "3", color: "red" },
      ].map((stat, i) => (
        <div key={i} className={`p-6 rounded-xl border ${theme.card}`}>
          <h3 className="text-sm text-gray-500">{stat.title}</h3>
          <p className="text-3xl font-bold mt-2">{stat.value}</p>
        </div>
      ))}
    </div>

    {/* Quick Actions */}
    <div className={`p-6 rounded-xl border ${theme.card}`}>
      <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {["Add Product", "Scan QR", "Track Shipment", "View Reports"].map(
          (action) => (
            <button
              key={action}
              className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {action}
            </button>
          )
        )}
      </div>
    </div>
  </div>
);

// Simple Products Component
const ProductsPage = ({ products, theme }: any) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold">Products Management</h2>

    <div className={`rounded-xl border ${theme.card}`}>
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Product List</h3>
      </div>
      <div className="p-4">
        {products.map((product: any) => (
          <div
            key={product.id}
            className="flex justify-between items-center py-3 border-b last:border-b-0"
          >
            <div>
              <h4 className="font-medium">{product.name}</h4>
              <p className="text-sm text-gray-500">{product.id}</p>
            </div>
            <div className="text-right">
              <span
                className={`px-3 py-1 rounded-full text-xs ${
                  product.status === "Active"
                    ? "bg-green-100 text-green-800"
                    : product.status === "Shipped"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-purple-100 text-purple-800"
                }`}
              >
                {product.status}
              </span>
              <p className="text-sm text-gray-500 mt-1">{product.location}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Simple Tracking Component
const TrackingPage = ({ theme }: any) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold">GPS Tracking</h2>

    <div className={`p-6 rounded-xl border ${theme.card}`}>
      <h3 className="text-lg font-semibold mb-4">Live Map</h3>
      <div className="h-64 bg-gray-600 rounded-lg flex items-center justify-center">
        <p className="text-white">🗺️ Interactive Map View</p>
      </div>
    </div>

    <div className={`p-6 rounded-xl border ${theme.card}`}>
      <h3 className="text-lg font-semibold mb-4">Active Shipments</h3>
      {[
        "Coffee → Mumbai → Delhi (75%)",
        "Tea → Bangalore → Chennai (45%)",
        "Chocolate → Pune → Kolkata (90%)",
      ].map((shipment, i) => (
        <div key={i} className="py-2 border-b last:border-b-0">
          <p className="font-medium">{shipment}</p>
        </div>
      ))}
    </div>
  </div>
);

// Simple Analytics Component
const AnalyticsPage = ({ theme }: any) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold">Analytics & Reports</h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className={`p-6 rounded-xl border ${theme.card}`}>
        <h3 className="text-lg font-semibold mb-4">Production Chart</h3>
        <div className="h-48 bg-gray-600 rounded-lg flex items-center justify-center">
          <p className="text-white">📊 Production Analytics</p>
        </div>
      </div>

      <div className={`p-6 rounded-xl border ${theme.card}`}>
        <h3 className="text-lg font-semibold mb-4">Supply Chain Flow</h3>
        <div className="h-48 bg-gray-600 rounded-lg flex items-center justify-center">
          <p className="text-white">🔄 Flow Diagram</p>
        </div>
      </div>
    </div>
  </div>
);

export default SimpleProTrack;
