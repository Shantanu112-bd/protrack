import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import { LoadingSpinner } from "./components/ui/loading-spinner";
import NetworkTest from "./components/NetworkTest";
import SensorDashboard from "./components/SensorDashboard";
import "./App.css";

// Lazy load components that actually exist
const Dashboard = lazy(() => import("./components/Dashboard"));
const Products = lazy(() => import("./components/Products"));
const Shipments = lazy(() => import("./components/Shipments"));
const NFTMinting = lazy(() => import("./components/NFTMinting"));
const Scan = lazy(() => import("./components/ScanRFID"));
const IoTMonitoring = lazy(() => import("./components/IoTDashboard"));
const Analytics = lazy(() => import("./components/SupplyChainAnalytics"));
const Optimization = lazy(() => import("./components/SupplyChainOptimization"));
const QualityControl = lazy(() => import("./components/QualityAssurance"));
const Compliance = lazy(() => import("./components/ComplianceManagement"));
const Notifications = lazy(() => import("./components/NotificationCenter"));
const UserProfile = lazy(() => import("./components/WalletConnection"));

function App() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* <Sidebar /> - Removed as it doesn't exist */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 bg-gray-100">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="shipments" element={<Shipments />} />
              <Route path="mint" element={<NFTMinting />} />
              <Route path="scan" element={<Scan />} />
              <Route path="iot" element={<IoTMonitoring />} />
              <Route path="sensors" element={<SensorDashboard />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="optimization" element={<Optimization />} />
              <Route path="quality" element={<QualityControl />} />
              <Route path="compliance" element={<Compliance />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="profile" element={<UserProfile />} />
              <Route path="network-test" element={<NetworkTest />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </main>
        {/* <Footer /> - Removed as it doesn't exist */}
      </div>
    </div>
  );
}

export default App;
