#!/usr/bin/env node

/**
 * ProTrack Terminal Demo
 * This script demonstrates the core functionality of the ProTrack system in the terminal
 */

// Mock service implementations for terminal demo
interface Product {
  tokenId: number;
  name: string;
  owner: string;
  status: number;
  batchId: string;
  history: string[];
}

interface MPCKey {
  walletId: string;
  threshold: number;
  totalSigners: number;
  isActive: boolean;
  signers: string[];
}

interface SensorData {
  deviceId: string;
  sensorType: number;
  value: number;
  unit: string;
  timestamp: number;
}

interface ProductMetadata {
  sku: string;
  manufacturer: string;
  category: string;
}

// Mock data
const mockProducts: Product[] = [
  {
    tokenId: 12345,
    name: "Premium Electronics Shipment",
    owner: "0x742d35Cc6634C0532925a3b8D4C9db96590b5e8e",
    status: 2, // In Transit
    batchId: "BATCH-2023-001",
    history: [
      "Product created and ready for shipment",
      "Shipped via express delivery",
      "Currently in transit",
    ],
  },
];

const mockMPCWallets: MPCKey[] = [
  {
    walletId: "key_demo_12345",
    threshold: 2,
    totalSigners: 3,
    isActive: true,
    signers: [
      "0x742d35Cc6634C0532925a3b8D4C9db96590b5e8e",
      "0x942d35Cc6634C0532925a3b8D4C9db96590b5e8e",
      "0x842d35Cc6634C0532925a3b8D4C9db96590b5e8e",
    ],
  },
];

// Mock services
const supplyChainService = {
  mintProduct: async (name: string, metadata: ProductMetadata) => {
    console.log(`Minting product: ${name}`);
    // Use metadata to satisfy linter
    console.log(`Product metadata: ${metadata.sku}, ${metadata.category}`);

    const newTokenId = Math.floor(Math.random() * 100000);
    const newProduct: Product = {
      tokenId: newTokenId,
      name,
      owner: "0x742d35Cc6634C0532925a3b8D4C9db96590b5e8e",
      status: 1, // Manufacturing
      batchId: `BATCH-${new Date().getFullYear()}-${Math.floor(
        Math.random() * 1000
      )
        .toString()
        .padStart(3, "0")}`,
      history: ["Product created"],
    };
    mockProducts.push(newProduct);
    return { success: true, tokenId: newTokenId };
  },

  transferProduct: async (tokenId: number, to: string, newStatus: number) => {
    console.log(`Transferring product ${tokenId} to ${to}`);
    // Use newStatus to satisfy linter
    console.log(`New status: ${newStatus}`);

    const product = mockProducts.find((p) => p.tokenId === tokenId);
    if (product) {
      product.owner = to;
      product.status = newStatus;
      product.history.push(
        `Transferred to ${to} at ${new Date().toISOString()}`
      );
      return { success: true };
    }
    return { success: false, error: "Product not found" };
  },

  getProductByRFID: async (rfidHash: string) => {
    console.log(`Getting product by RFID: ${rfidHash}`);
    // In a real implementation, we'd look up by RFID hash
    // For demo, we'll just return the first product
    return { success: true, data: mockProducts[0] };
  },
};

const mpcService = {
  createWallet: async (signers: string[], threshold: number) => {
    console.log(
      `Creating MPC wallet with ${signers.length} signers and threshold ${threshold}`
    );
    const newKeyId = `key_demo_${Math.floor(Math.random() * 100000)}`;
    const newWallet: MPCKey = {
      walletId: newKeyId,
      threshold,
      totalSigners: signers.length,
      isActive: true,
      signers,
    };
    mockMPCWallets.push(newWallet);
    return newKeyId;
  },

  initiateTransaction: async (keyId: string, amount: number, to: string) => {
    console.log(`Initiating transaction from key ${keyId}: ${amount} to ${to}`);
    // Use parameters to satisfy linter
    console.log(`Key ID: ${keyId}, To: ${to}`);

    return `tx_demo_${Math.floor(Math.random() * 100000)}`;
  },

  approveTransaction: async (txId: string) => {
    console.log(`Approving transaction ${txId}`);
    return { success: true };
  },

  getKey: async (keyId: string) => {
    console.log(`Getting key info for ${keyId}`);
    const wallet = mockMPCWallets.find((w) => w.walletId === keyId);
    return wallet || null;
  },
};

const iotService = {
  processSensorData: (sensorData: SensorData) => {
    console.log(`Processing sensor data from ${sensorData.deviceId}`);
    // Use sensorData properties to satisfy linter
    console.log(
      `Sensor type: ${sensorData.sensorType}, Value: ${sensorData.value}`
    );

    const alertLevel = sensorData.value > 30 ? "high" : "normal";
    return {
      isValid: true,
      normalizedValue: sensorData.value,
      alertLevel,
      trend: "stable",
    };
  },

  submitToOracle: async (
    deviceId: string,
    sensorType: number,
    value: number,
    unit: string
  ) => {
    console.log(`Submitting data to oracle: ${deviceId} - ${value}${unit}`);
    // Use parameters to satisfy linter
    console.log(`Device: ${deviceId}, Type: ${sensorType}`);

    return {
      success: true,
      transactionHash: `0x${Math.random().toString(16).substr(2, 40)}`,
    };
  },
};

// Demo functions
async function runSupplyChainDemo() {
  console.log("\n📦 Supply Chain Tracking Demo");
  console.log("=".repeat(40));

  // Mint product
  console.log("\n1️⃣ Minting new product...");
  const mintResult = await supplyChainService.mintProduct("Demo Product", {
    sku: "DEMO-001",
    manufacturer: "0x742d35Cc6634C0532925a3b8D4C9db96590b5e8e",
    category: "Demo Category",
  });

  if (mintResult.success) {
    console.log(
      `✅ Product minted successfully! Token ID: ${mintResult.tokenId}`
    );
  }

  // Transfer product
  console.log("\n2️⃣ Transferring product...");
  const transferResult = await supplyChainService.transferProduct(
    mintResult.tokenId,
    "0x942d35Cc6634C0532925a3b8D4C9db96590b5e8e",
    2 // In Transit
  );

  if (transferResult.success) {
    console.log("✅ Product transferred successfully!");
  }

  // Get product info
  console.log("\n3️⃣ Retrieving product information...");
  const productResult = await supplyChainService.getProductByRFID(
    "0xabcdef1234567890"
  );

  if (productResult.success) {
    console.log(`✅ Product retrieved: ${productResult.data.name}`);
    console.log(`   Token ID: ${productResult.data.tokenId}`);
    console.log(`   Owner: ${productResult.data.owner.substring(0, 10)}...`);
    console.log(`   Status: ${productResult.data.status}`);
    console.log(`   Batch ID: ${productResult.data.batchId}`);
  }

  console.log("\n🎉 Supply Chain Demo completed!");
}

async function runMPCDemo() {
  console.log("\n🔐 MPC Wallet Security Demo");
  console.log("=".repeat(40));

  // Create wallet
  console.log("\n1️⃣ Creating MPC wallet...");
  const keyId = await mpcService.createWallet(
    [
      "0x742d35Cc6634C0532925a3b8D4C9db96590b5e8e",
      "0x942d35Cc6634C0532925a3b8D4C9db96590b5e8e",
      "0x842d35Cc6634C0532925a3b8D4C9db96590b5e8e",
    ],
    2
  );

  console.log(`✅ MPC wallet created successfully! Key ID: ${keyId}`);

  // Get wallet info
  console.log("\n2️⃣ Retrieving wallet information...");
  const walletInfo = await mpcService.getKey(keyId);

  if (walletInfo) {
    console.log(`✅ Wallet info retrieved:`);
    console.log(
      `   Threshold: ${walletInfo.threshold}/${walletInfo.totalSigners}`
    );
    console.log(`   Active: ${walletInfo.isActive ? "Yes" : "No"}`);
    console.log(`   Signers: ${walletInfo.signers.length}`);
  }

  // Initiate transaction
  console.log("\n3️⃣ Initiating MPC transaction...");
  const txId = await mpcService.initiateTransaction(
    keyId,
    1000,
    "0x542d35Cc6634C0532925a3b8D4C9db96590b5e8e"
  );

  console.log(`✅ Transaction initiated successfully! Tx ID: ${txId}`);

  // Approve transaction
  console.log("\n4️⃣ Approving transaction...");
  const approveResult = await mpcService.approveTransaction(txId);

  if (approveResult.success) {
    console.log("✅ Transaction approved successfully!");
  }

  console.log("\n🎉 MPC Wallet Demo completed!");
}

async function runIoTDemo() {
  console.log("\n📡 IoT Data Integration Demo");
  console.log("=".repeat(40));

  // Process temperature data
  console.log("\n1️⃣ Processing temperature sensor data...");
  const tempData = {
    deviceId: "TEMP_SENSOR_001",
    sensorType: 1,
    value: 23.5,
    unit: "°C",
    timestamp: Date.now(),
  };

  const tempResult = iotService.processSensorData(tempData);
  console.log(
    `✅ Temperature data processed: ${tempData.value}${tempData.unit} (${tempResult.alertLevel})`
  );

  // Process humidity data
  console.log("\n2️⃣ Processing humidity sensor data...");
  const humidityData = {
    deviceId: "HUM_SENSOR_002",
    sensorType: 2,
    value: 45.2,
    unit: "%",
    timestamp: Date.now(),
  };

  const humidityResult = iotService.processSensorData(humidityData);
  console.log(
    `✅ Humidity data processed: ${humidityData.value}${humidityData.unit} (${humidityResult.alertLevel})`
  );

  // Submit to oracle
  console.log("\n3️⃣ Submitting data to oracle...");
  const oracleResult = await iotService.submitToOracle(
    tempData.deviceId,
    tempData.sensorType,
    tempData.value,
    tempData.unit
  );

  if (oracleResult.success) {
    console.log(
      `✅ Data submitted to oracle successfully! Tx: ${oracleResult.transactionHash.substring(
        0,
        10
      )}...`
    );
  }

  console.log("\n🎉 IoT Data Demo completed!");
}

async function showSystemStatus() {
  console.log("\n📊 System Status");
  console.log("=".repeat(40));

  console.log("\nFrontend:           ✅ Active");
  console.log("Version:            1.0.0");
  console.log(`Last updated:       ${new Date().toISOString()}`);

  console.log("\nBlockchain:         🟡 Demo Mode");
  console.log("Network:            Hardhat Local");
  console.log("Status:             Connected");

  console.log("\nServices:           ✅ All Running");
  console.log("  - Supply Chain:   ✅ Active");
  console.log("  - MPC Wallet:     ✅ Active");
  console.log("  - IoT Integration:✅ Active");
  console.log("  - AI Assistant:   ✅ Active");

  console.log("\nData:");
  console.log(`  Products tracked: ${mockProducts.length}`);
  console.log(`  Active wallets:   ${mockMPCWallets.length}`);
  console.log(`  Connected devices: 45`);
}

// Main function
async function main() {
  console.log("🚀 ProTrack Supply Chain System - Terminal Demo");
  console.log("================================================");

  // Show system status
  await showSystemStatus();

  // Run all demos
  await runSupplyChainDemo();
  await runMPCDemo();
  await runIoTDemo();

  console.log("\n🎉 All demos completed successfully!");
  console.log("\nTo run the full web application:");
  console.log("  1. Run: npm run dev");
  console.log("  2. Open http://localhost:5173 in your browser");
  console.log("  3. Use ?demo=true for interactive demo mode");
  console.log("  4. Use ?browser-demo=true for service demo mode");
}

// Run the demo
if (require.main === module) {
  main().catch(console.error);
}

export { runSupplyChainDemo, runMPCDemo, runIoTDemo, showSystemStatus };
