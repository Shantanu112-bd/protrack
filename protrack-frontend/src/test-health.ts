#!/usr/bin/env node

// Simple health check script to verify the application loads correctly
import * as http from "http";

const checkHealth = () => {
  const options = {
    hostname: "localhost",
    port: 5173,
    path: "/health",
    method: "GET",
    timeout: 5000,
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    if (res.statusCode === 200) {
      console.log("✅ Application health check passed");
    } else {
      console.log("❌ Application health check failed");
    }
    process.exit(0);
  });

  req.on("error", () => {
    console.log("❌ Application is not running or not accessible");
    console.log(
      "Please make sure the development server is running on port 5173"
    );
    process.exit(1);
  });

  req.on("timeout", () => {
    console.log("❌ Request timeout - application may not be responding");
    req.destroy();
    process.exit(1);
  });

  req.end();
};

checkHealth();
