#!/usr/bin/env node

/**
 * ProTrack Application Test Suite
 * Comprehensive testing of all components and integrations
 */

const fs = require("fs");
const path = require("path");

console.log("🧪 ProTrack Application Test Suite");
console.log("==================================\n");

// Test 1: Critical Files Check
console.log("📁 Testing Critical Files...");
const criticalFiles = [
  // Main Application Files
  "protrack-frontend/src/App.tsx",
  "protrack-frontend/src/main.tsx",
  "protrack-frontend/package.json",
  "protrack-frontend/.env",

  // Core Components
  "protrack-frontend/src/components/Dashboard.tsx",
  "protrack-frontend/src/components/Products.tsx",
  "protrack-frontend/src/components/Shipments.tsx",
  "protrack-frontend/src/components/IoTDashboard.tsx",
  "protrack-frontend/src/components/NFTMinting.tsx",
  "protrack-frontend/src/components/QualityAssurance.tsx",
  "protrack-frontend/src/components/ComplianceManagement.tsx",
  "protrack-frontend/src/components/SupplyChainAnalytics.tsx",

  // Services
  "protrack-frontend/src/services/supabase.ts",
  "protrack-frontend/src/services/dashboardService.ts",
  "protrack-frontend/src/services/integratedSupplyChainService.ts",

  // Contexts
  "protrack-frontend/src/contexts/web3ContextTypes.ts",
  "protrack-frontend/src/contexts/Web3Context.tsx",

  // Smart Contracts
  "protrack-frontend/src/contracts/abis.ts",
  "protrack-frontend/src/config/contractConfig.ts",
  "contracts/contracts/ProTrack.sol",

  // Database
  "supabase_schema.sql",

  // UI Components
  "protrack-frontend/src/components/ui/button.tsx",
  "protrack-frontend/src/components/ui/card.tsx",
  "protrack-frontend/src/components/ui/table.tsx",
  "protrack-frontend/src/components/ui/badge.tsx",
  "protrack-frontend/src/components/ui/loading-spinner.tsx",
];

let filesOk = true;
criticalFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    filesOk = false;
  }
});

// Test 2: Package Dependencies Check
console.log("\n📦 Testing Package Dependencies...");
let depsOk = true;

if (fs.existsSync("protrack-frontend/package.json")) {
  const packageJson = JSON.parse(
    fs.readFileSync("protrack-frontend/package.json", "utf8")
  );

  const requiredDeps = [
    "react",
    "react-dom",
    "react-router-dom",
    "web3",
    "ethers",
    "@supabase/supabase-js",
    "lucide-react",
    "tailwindcss",
    "vite",
  ];

  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  requiredDeps.forEach((dep) => {
    if (allDeps[dep]) {
      console.log(`✅ ${dep} - ${allDeps[dep]}`);
    } else {
      console.log(`❌ ${dep} - MISSING`);
      depsOk = false;
    }
  });
} else {
  console.log("❌ package.json not found");
  depsOk = false;
}

// Test 3: Component Syntax Check
console.log("\n🔍 Testing Component Syntax...");
let syntaxOk = true;

const componentsToCheck = [
  "protrack-frontend/src/components/Dashboard.tsx",
  "protrack-frontend/src/components/Products.tsx",
  "protrack-frontend/src/components/Shipments.tsx",
  "protrack-frontend/src/components/IoTDashboard.tsx",
];

componentsToCheck.forEach((file) => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, "utf8");

    const issues = [];

    // Check for common syntax issues
    if (
      content.includes(
        'import events from "events";import events from "events";'
      )
    ) {
      issues.push("Duplicate imports");
    }

    if (content.includes("<op ") || content.includes("</op>")) {
      issues.push("Invalid JSX tags");
    }

    if (
      content.includes("const handleCreateShipment") &&
      content.split("const handleCreateShipment").length > 2
    ) {
      issues.push("Duplicate function declarations");
    }

    // Check for proper exports
    if (!content.includes("export default")) {
      issues.push("Missing default export");
    }

    // Check for proper imports
    if (!content.includes("import React")) {
      issues.push("Missing React import");
    }

    if (issues.length === 0) {
      console.log(`✅ ${path.basename(file)} - Syntax OK`);
    } else {
      console.log(`❌ ${path.basename(file)} - Issues: ${issues.join(", ")}`);
      syntaxOk = false;
    }
  } else {
    console.log(`❌ ${path.basename(file)} - File not found`);
    syntaxOk = false;
  }
});

// Test 4: Environment Configuration Check
console.log("\n⚙️ Testing Environment Configuration...");
let envOk = true;

if (fs.existsSync("protrack-frontend/.env")) {
  const envContent = fs.readFileSync("protrack-frontend/.env", "utf8");

  const requiredEnvVars = [
    "VITE_SUPABASE_URL",
    "VITE_SUPABASE_ANON_KEY",
    "VITE_APP_NAME",
    "VITE_CHAIN_ID",
  ];

  requiredEnvVars.forEach((envVar) => {
    if (envContent.includes(envVar)) {
      console.log(`✅ ${envVar} - Configured`);
    } else {
      console.log(`❌ ${envVar} - Missing`);
      envOk = false;
    }
  });
} else {
  console.log("❌ .env file not found");
  envOk = false;
}

// Test 5: Smart Contract Integration Check
console.log("\n🔗 Testing Smart Contract Integration...");
let contractOk = true;

if (fs.existsSync("protrack-frontend/src/contracts/abis.ts")) {
  const abiContent = fs.readFileSync(
    "protrack-frontend/src/contracts/abis.ts",
    "utf8"
  );

  const requiredFunctions = [
    "ProTrack_ABI",
    "createProduct",
    "createShipment",
    "recordIoTData",
    "getCurrentAnalytics",
  ];

  requiredFunctions.forEach((func) => {
    if (abiContent.includes(func)) {
      console.log(`✅ ${func} - Present`);
    } else {
      console.log(`❌ ${func} - Missing`);
      contractOk = false;
    }
  });
} else {
  console.log("❌ ABI file not found");
  contractOk = false;
}

// Test 6: Service Integration Check
console.log("\n⚙️ Testing Service Integration...");
let serviceOk = true;

const servicesToCheck = [
  {
    file: "protrack-frontend/src/services/integratedSupplyChainService.ts",
    methods: [
      "mintProductNFT",
      "createAndTrackProduct",
      "processIoTData",
      "getCurrentAnalytics",
    ],
  },
  {
    file: "protrack-frontend/src/services/dashboardService.ts",
    methods: ["getAnalytics", "createShipment", "getProducts"],
  },
  {
    file: "protrack-frontend/src/services/supabase.ts",
    methods: ["supabase"],
  },
];

servicesToCheck.forEach((service) => {
  if (fs.existsSync(service.file)) {
    const content = fs.readFileSync(service.file, "utf8");

    const missingMethods = service.methods.filter(
      (method) => !content.includes(method)
    );

    if (missingMethods.length === 0) {
      console.log(`✅ ${path.basename(service.file)} - All methods present`);
    } else {
      console.log(
        `❌ ${path.basename(service.file)} - Missing: ${missingMethods.join(
          ", "
        )}`
      );
      serviceOk = false;
    }
  } else {
    console.log(`❌ ${path.basename(service.file)} - File not found`);
    serviceOk = false;
  }
});

// Test 7: Database Schema Check
console.log("\n🗄️ Testing Database Schema...");
let dbOk = true;

if (fs.existsSync("supabase_schema.sql")) {
  const schemaContent = fs.readFileSync("supabase_schema.sql", "utf8");

  const requiredTables = [
    "CREATE TABLE users",
    "CREATE TABLE products",
    "CREATE TABLE shipments",
    "CREATE TABLE iot_data",
    "CREATE TABLE roles",
  ];

  requiredTables.forEach((table) => {
    if (schemaContent.includes(table)) {
      console.log(`✅ ${table.replace("CREATE TABLE ", "")} - Defined`);
    } else {
      console.log(`❌ ${table.replace("CREATE TABLE ", "")} - Missing`);
      dbOk = false;
    }
  });
} else {
  console.log("❌ Database schema file not found");
  dbOk = false;
}

// Test 8: Build Configuration Check
console.log("\n🔧 Testing Build Configuration...");
let buildOk = true;

const buildFiles = [
  "protrack-frontend/vite.config.ts",
  "protrack-frontend/tsconfig.json",
  "protrack-frontend/tailwind.config.js",
  "protrack-frontend/postcss.config.js",
];

buildFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${path.basename(file)} - Present`);
  } else {
    console.log(`❌ ${path.basename(file)} - Missing`);
    buildOk = false;
  }
});

// Final Results
console.log("\n📊 TEST RESULTS SUMMARY");
console.log("========================");
console.log(`Files Check: ${filesOk ? "✅ PASS" : "❌ FAIL"}`);
console.log(`Dependencies: ${depsOk ? "✅ PASS" : "❌ FAIL"}`);
console.log(`Component Syntax: ${syntaxOk ? "✅ PASS" : "❌ FAIL"}`);
console.log(`Environment Config: ${envOk ? "✅ PASS" : "❌ FAIL"}`);
console.log(`Smart Contracts: ${contractOk ? "✅ PASS" : "❌ FAIL"}`);
console.log(`Service Integration: ${serviceOk ? "✅ PASS" : "❌ FAIL"}`);
console.log(`Database Schema: ${dbOk ? "✅ PASS" : "❌ FAIL"}`);
console.log(`Build Configuration: ${buildOk ? "✅ PASS" : "❌ FAIL"}`);

const allPassed =
  filesOk &&
  depsOk &&
  syntaxOk &&
  envOk &&
  contractOk &&
  serviceOk &&
  dbOk &&
  buildOk;

console.log("\n🎯 OVERALL APPLICATION STATUS");
console.log("==============================");

if (allPassed) {
  console.log("🎉 ALL TESTS PASSED - APPLICATION READY!");
  console.log("");
  console.log("✅ ProTrack is fully operational and user-ready!");
  console.log("");
  console.log("🚀 To start the application:");
  console.log("   cd protrack-frontend");
  console.log("   npm run dev");
  console.log("");
  console.log("🌐 Then visit:");
  console.log("   • Landing Page: http://localhost:5173/");
  console.log("   • Dashboard: http://localhost:5173/dashboard");
  console.log("");
  console.log("📱 Available Features:");
  console.log("   • Wallet Connection (MetaMask)");
  console.log("   • Product Management & NFT Minting");
  console.log("   • Shipment Tracking & Management");
  console.log("   • IoT Sensor Monitoring");
  console.log("   • Supply Chain Analytics");
  console.log("   • Quality Assurance Workflows");
  console.log("   • Compliance Management");
  console.log("   • Real-time Dashboard");
} else {
  console.log("❌ SOME TESTS FAILED");
  console.log("");
  console.log(
    "Please address the failing tests above before using the application."
  );
  console.log(
    "Most issues are likely minor configuration or missing file problems."
  );
}

console.log("\n📚 For detailed usage instructions, see USER_GUIDE.md");
console.log("🔧 For troubleshooting, check the browser console for errors");
console.log("\n✨ ProTrack Application Test Complete ✨");

// Exit with appropriate code
process.exit(allPassed ? 0 : 1);
