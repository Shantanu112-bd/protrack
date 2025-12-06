import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import WalletConnect from "./components/WalletConnect";
import HealthCheck from "./components/HealthCheck";
import "./App.css";

// Lazy load components for better performance
const LazyProducts = lazy(() => import("./components/Products"));
const LazyShipments = lazy(() => import("./components/Shipments"));
const LazyMintProduct = lazy(() => import("./components/MintProduct"));
const LazyScanRFID = lazy(() => import("./components/ScanRFID"));
const LazyIoTMonitor = lazy(() => import("./components/IoTMonitor"));
const LazySupplyChainAnalytics = lazy(
  () => import("./components/SupplyChainAnalytics")
);
const LazySupplyChainOptimization = lazy(
  () => import("./components/SupplyChainOptimization")
);
const LazyQualityAssurance = lazy(
  () => import("./components/QualityAssurance")
);
const LazyComplianceManagement = lazy(
  () => import("./components/ComplianceManagement")
);

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 w-full h-full">
      <Header />
      <main className="w-full h-full pt-20">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/dashboard/products"
            element={
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-full">
                    Loading...
                  </div>
                }
              >
                <LazyProducts />
              </Suspense>
            }
          />
          <Route
            path="/dashboard/shipments"
            element={
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-full">
                    Loading...
                  </div>
                }
              >
                <LazyShipments />
              </Suspense>
            }
          />
          <Route
            path="/dashboard/mint"
            element={
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-full">
                    Loading...
                  </div>
                }
              >
                <LazyMintProduct />
              </Suspense>
            }
          />
          <Route
            path="/dashboard/scan"
            element={
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-full">
                    Loading...
                  </div>
                }
              >
                <LazyScanRFID />
              </Suspense>
            }
          />
          <Route
            path="/dashboard/iot"
            element={
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-full">
                    Loading...
                  </div>
                }
              >
                <LazyIoTMonitor />
              </Suspense>
            }
          />
          <Route
            path="/dashboard/analytics"
            element={
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-full">
                    Loading...
                  </div>
                }
              >
                <LazySupplyChainAnalytics />
              </Suspense>
            }
          />
          <Route
            path="/dashboard/optimization"
            element={
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-full">
                    Loading...
                  </div>
                }
              >
                <LazySupplyChainOptimization />
              </Suspense>
            }
          />
          <Route
            path="/dashboard/quality"
            element={
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-full">
                    Loading...
                  </div>
                }
              >
                <LazyQualityAssurance />
              </Suspense>
            }
          />
          <Route
            path="/dashboard/compliance"
            element={
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-full">
                    Loading...
                  </div>
                }
              >
                <LazyComplianceManagement />
              </Suspense>
            }
          />
          <Route path="/connect" element={<WalletConnect />} />
          <Route path="/health" element={<HealthCheck />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
