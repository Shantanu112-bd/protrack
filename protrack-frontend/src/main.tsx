import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import DemoRunner from "./DemoRunner";
import BrowserDemo from "./BrowserDemo";
import IntegratedDemo from "./components/IntegratedDemo";
import SignInPage from "./components/SignInPage";
import ProTrackUnifiedDashboard from "./components/ProTrackUnifiedDashboard";
import ComponentTestPage from "./components/ComponentTestPage";
import { EnhancedWeb3Provider } from "./contexts/EnhancedWeb3Context";
import { Web3Provider } from "./contexts/Web3Context";
import { WalletProvider } from "./contexts/WalletContext";
import MainLayout from "./layouts/MainLayout";
// Import our new interface components
import RFIDScannerInterface from "./components/interfaces/RFIDScannerInterface";
import IoTDataInterface from "./components/interfaces/IoTDataInterface";
import TrackingMapInterface from "./components/interfaces/TrackingMapInterface";
import MPCWalletInterface from "./components/interfaces/MPCWalletInterface";
import VerifyInterface from "./components/interfaces/VerifyInterface";
import AnalyticsInterface from "./components/interfaces/AnalyticsInterface";
import ManufacturerInterface from "./components/interfaces/ManufacturerInterface";
import TransporterInterface from "./components/interfaces/TransporterInterface";
import RetailerInterface from "./components/interfaces/RetailerInterface";
import AdminInterface from "./components/interfaces/AdminInterface";
import ConsumerInterface from "./components/interfaces/ConsumerInterface";
// New interface components
import ARScannerInterface from "./components/interfaces/ARScannerInterface";
import AIAssistantInterface from "./components/interfaces/AIAssistantInterface";
import NFTProductCreationInterface from "./components/interfaces/NFTProductCreationInterface";
import KeyManagementInterface from "./components/interfaces/KeyManagementInterface";
import IoTVisualizationInterface from "./components/interfaces/IoTVisualizationInterface";
import "./index.css";

// Check if we're in demo mode (for browser functionality without blockchain)
const isDemoMode = window.location.search.includes("demo=true");
const isBrowserDemo = window.location.search.includes("browser-demo=true");
const isIntegratedDemo = window.location.pathname === "/integrated-demo";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Web3Provider>
      <WalletProvider>
        {isIntegratedDemo ? (
          <EnhancedWeb3Provider>
            <IntegratedDemo />
          </EnhancedWeb3Provider>
        ) : isBrowserDemo ? (
          <BrowserDemo />
        ) : isDemoMode ? (
          <DemoRunner />
        ) : (
          <BrowserRouter>
            <EnhancedWeb3Provider>
              <Routes>
                <Route path="/" element={<App />} />
                <Route
                  path="/signin"
                  element={
                    <MainLayout>
                      <SignInPage />
                    </MainLayout>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <MainLayout>
                      <ProTrackUnifiedDashboard />
                    </MainLayout>
                  }
                />
                <Route
                  path="/unified-dashboard"
                  element={
                    <MainLayout>
                      <ProTrackUnifiedDashboard />
                    </MainLayout>
                  }
                />
                {/* Individual Interface Routes */}
                <Route
                  path="/rfid-scanner"
                  element={
                    <MainLayout>
                      <RFIDScannerInterface />
                    </MainLayout>
                  }
                />
                <Route
                  path="/iot-data"
                  element={
                    <MainLayout>
                      <IoTDataInterface />
                    </MainLayout>
                  }
                />
                <Route
                  path="/tracking-map"
                  element={
                    <MainLayout>
                      <TrackingMapInterface />
                    </MainLayout>
                  }
                />
                <Route
                  path="/mpc-wallet"
                  element={
                    <MainLayout>
                      <MPCWalletInterface />
                    </MainLayout>
                  }
                />
                <Route
                  path="/verify"
                  element={
                    <MainLayout>
                      <VerifyInterface />
                    </MainLayout>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <MainLayout>
                      <AnalyticsInterface />
                    </MainLayout>
                  }
                />
                {/* New Individual Interface Routes */}
                <Route
                  path="/ar-scanner"
                  element={
                    <MainLayout>
                      <ARScannerInterface />
                    </MainLayout>
                  }
                />
                <Route
                  path="/ai-assistant"
                  element={
                    <MainLayout>
                      <AIAssistantInterface />
                    </MainLayout>
                  }
                />
                <Route
                  path="/nft-creation"
                  element={
                    <MainLayout>
                      <NFTProductCreationInterface />
                    </MainLayout>
                  }
                />
                <Route
                  path="/key-management"
                  element={
                    <MainLayout>
                      <KeyManagementInterface />
                    </MainLayout>
                  }
                />
                <Route
                  path="/iot-visualization"
                  element={
                    <MainLayout>
                      <IoTVisualizationInterface />
                    </MainLayout>
                  }
                />
                {/* Role-based Interface Routes */}
                <Route
                  path="/manufacturer"
                  element={
                    <MainLayout>
                      <ManufacturerInterface />
                    </MainLayout>
                  }
                />
                <Route
                  path="/transporter"
                  element={
                    <MainLayout>
                      <TransporterInterface />
                    </MainLayout>
                  }
                />
                <Route
                  path="/retailer"
                  element={
                    <MainLayout>
                      <RetailerInterface />
                    </MainLayout>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <MainLayout>
                      <AdminInterface />
                    </MainLayout>
                  }
                />
                <Route
                  path="/consumer"
                  element={
                    <MainLayout>
                      <ConsumerInterface />
                    </MainLayout>
                  }
                />
                <Route path="/integrated-demo" element={<IntegratedDemo />} />
                <Route
                  path="/test-components"
                  element={
                    <MainLayout>
                      <ComponentTestPage />
                    </MainLayout>
                  }
                />
              </Routes>
            </EnhancedWeb3Provider>
          </BrowserRouter>
        )}
      </WalletProvider>
    </Web3Provider>
  </React.StrictMode>
);
