import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import SignInPage from "./SignInPage";
import HealthCheck from "./components/HealthCheck";
import { Web3Provider } from "./contexts/Web3Context";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Web3Provider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SignInPage />} />
          <Route path="/dashboard/*" element={<App />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/health" element={<HealthCheck />} />
          {/* Redirect any unknown routes to dashboard if authenticated, otherwise to sign in */}
          <Route path="*" element={<SignInPage />} />
        </Routes>
      </BrowserRouter>
    </Web3Provider>
  </React.StrictMode>
);
