import "./polyfills";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import SignInPage from "./SignInPage";
import LandingPage from "./components/LandingPage";
import IntegratedDemo from "./components/IntegratedDemo";
import HealthCheck from "./components/HealthCheck";
import { Web3Provider } from "./contexts/Web3Context";
import { BlockchainProvider } from "./contexts/BlockchainContext";
import ErrorBoundary from "./components/ErrorBoundary";
import "./index.css";

console.log("main.tsx: Starting to render app");

// Temporarily disable StrictMode to avoid CSP issues with eval
const rootElement = document.getElementById("root");
console.log("main.tsx: Root element:", rootElement);

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <ErrorBoundary>
      <Web3Provider>
        <BlockchainProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/integrated-demo" element={<IntegratedDemo />} />
              <Route path="/dashboard/*" element={<App />} />
              <Route path="/health" element={<HealthCheck />} />
              {/* Redirect any unknown routes to landing page */}
              <Route path="*" element={<LandingPage />} />
            </Routes>
          </BrowserRouter>
        </BlockchainProvider>
      </Web3Provider>
    </ErrorBoundary>
  );
  console.log("main.tsx: Finished rendering app");
} else {
  console.error("main.tsx: Root element not found");
}
