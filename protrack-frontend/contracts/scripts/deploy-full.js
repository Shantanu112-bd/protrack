const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting Full ProTrack Smart Contracts Deployment...\n");

  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("📋 Deployment Details:");
  console.log("- Network:", network.name, `(Chain ID: ${network.chainId})`);
  console.log("- Deployer:", deployer.address);
  console.log(
    "- Balance:",
    ethers.formatEther(await deployer.provider.getBalance(deployer.address)),
    "ETH\n"
  );

  const deploymentData = {
    network: {
      name: network.name,
      chainId: Number(network.chainId),
      rpcUrl: "http://127.0.0.1:8545", // Default for local
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {},
  };

  try {
    // 1. Deploy ProTrackNFT Contract
    console.log("📦 Deploying ProTrackNFT...");
    const ProTrackNFT = await ethers.getContractFactory("ProTrackNFT");
    const proTrackNFT = await ProTrackNFT.deploy();
    await proTrackNFT.waitForDeployment();

    console.log("✅ ProTrackNFT deployed to:", await proTrackNFT.getAddress());
    deploymentData.contracts.ProTrackNFT = {
      address: await proTrackNFT.getAddress(),
      deployBlock: proTrackNFT.deploymentTransaction().blockNumber,
    };

    // 2. Deploy SupplyChainEscrow Contract
    console.log("\n📦 Deploying SupplyChainEscrow...");
    const SupplyChainEscrow = await ethers.getContractFactory(
      "SupplyChainEscrow"
    );
    const supplyChainEscrow = await SupplyChainEscrow.deploy(
      await proTrackNFT.getAddress()
    );
    await supplyChainEscrow.waitForDeployment();

    console.log(
      "✅ SupplyChainEscrow deployed to:",
      await supplyChainEscrow.getAddress()
    );
    deploymentData.contracts.SupplyChainEscrow = {
      address: await supplyChainEscrow.getAddress(),
      deployBlock: supplyChainEscrow.deploymentTransaction().blockNumber,
    };

    // 3. Deploy IoTOracle Contract
    console.log("\n📦 Deploying IoTOracle...");
    const IoTOracle = await ethers.getContractFactory("IoTOracle");
    const iotOracle = await IoTOracle.deploy(
      await supplyChainEscrow.getAddress()
    );
    await iotOracle.waitForDeployment();

    console.log("✅ IoTOracle deployed to:", await iotOracle.getAddress());
    deploymentData.contracts.IoTOracle = {
      address: await iotOracle.getAddress(),
      deployBlock: iotOracle.deploymentTransaction().blockNumber,
    };

    // 4. Deploy ProTrackSupplyChain Contract
    console.log("\n📦 Deploying ProTrackSupplyChain...");
    const ProTrackSupplyChain = await ethers.getContractFactory(
      "ProTrackSupplyChain"
    );
    const proTrackSupplyChain = await ProTrackSupplyChain.deploy();
    await proTrackSupplyChain.waitForDeployment();

    console.log(
      "✅ ProTrackSupplyChain deployed to:",
      await proTrackSupplyChain.getAddress()
    );
    deploymentData.contracts.ProTrackSupplyChain = {
      address: await proTrackSupplyChain.getAddress(),
      deployBlock: proTrackSupplyChain.deploymentTransaction().blockNumber,
    };

    // 5. Deploy ProTrackMPCWallet Contract
    console.log("\n📦 Deploying ProTrackMPCWallet...");
    const ProTrackMPCWallet = await ethers.getContractFactory(
      "ProTrackMPCWallet"
    );
    const proTrackMPCWallet = await ProTrackMPCWallet.deploy();
    await proTrackMPCWallet.waitForDeployment();

    console.log(
      "✅ ProTrackMPCWallet deployed to:",
      await proTrackMPCWallet.getAddress()
    );
    deploymentData.contracts.ProTrackMPCWallet = {
      address: await proTrackMPCWallet.getAddress(),
      deployBlock: proTrackMPCWallet.deploymentTransaction().blockNumber,
    };

    // 6. Deploy ProTrackRFIDTokenizer Contract
    console.log("\n📦 Deploying ProTrackRFIDTokenizer...");
    const ProTrackRFIDTokenizer = await ethers.getContractFactory(
      "ProTrackRFIDTokenizer"
    );
    const proTrackRFIDTokenizer = await ProTrackRFIDTokenizer.deploy();
    await proTrackRFIDTokenizer.waitForDeployment();

    console.log(
      "✅ ProTrackRFIDTokenizer deployed to:",
      await proTrackRFIDTokenizer.getAddress()
    );
    deploymentData.contracts.ProTrackRFIDTokenizer = {
      address: await proTrackRFIDTokenizer.getAddress(),
      deployBlock: proTrackRFIDTokenizer.deploymentTransaction().blockNumber,
    };

    // 7. Deploy ProTrackAdvancedIoT Contract
    console.log("\n📦 Deploying ProTrackAdvancedIoT...");
    const ProTrackAdvancedIoT = await ethers.getContractFactory(
      "ProTrackAdvancedIoT"
    );
    const proTrackAdvancedIoT = await ProTrackAdvancedIoT.deploy(
      await proTrackSupplyChain.getAddress()
    );
    await proTrackAdvancedIoT.waitForDeployment();

    console.log(
      "✅ ProTrackAdvancedIoT deployed to:",
      await proTrackAdvancedIoT.getAddress()
    );
    deploymentData.contracts.ProTrackAdvancedIoT = {
      address: await proTrackAdvancedIoT.getAddress(),
      deployBlock: proTrackAdvancedIoT.deploymentTransaction().blockNumber,
    };

    // 8. Setup Contract Permissions
    console.log("\n🔐 Setting up contract permissions...");

    // Grant roles to supply chain contract
    await proTrackNFT.grantRole(
      await proTrackNFT.SUPPLY_CHAIN_ROLE(),
      await proTrackSupplyChain.getAddress()
    );
    console.log("✅ Granted SUPPLY_CHAIN_ROLE to ProTrackSupplyChain");

    // Grant roles to oracle contract
    await proTrackSupplyChain.grantRole(
      await proTrackSupplyChain.ORACLE_ROLE(),
      await iotOracle.getAddress()
    );
    console.log("✅ Granted ORACLE_ROLE to IoTOracle");

    // Grant roles to MPC wallet
    await proTrackSupplyChain.grantRole(
      await proTrackSupplyChain.MANUFACTURER_ROLE(),
      await proTrackMPCWallet.getAddress()
    );
    await proTrackSupplyChain.grantRole(
      await proTrackSupplyChain.PACKAGER_ROLE(),
      await proTrackMPCWallet.getAddress()
    );
    await proTrackSupplyChain.grantRole(
      await proTrackSupplyChain.TRANSPORTER_ROLE(),
      await proTrackMPCWallet.getAddress()
    );
    await proTrackSupplyChain.grantRole(
      await proTrackSupplyChain.WHOLESALER_ROLE(),
      await proTrackMPCWallet.getAddress()
    );
    await proTrackSupplyChain.grantRole(
      await proTrackSupplyChain.RETAILER_ROLE(),
      await proTrackMPCWallet.getAddress()
    );
    await proTrackSupplyChain.grantRole(
      await proTrackSupplyChain.INSPECTOR_ROLE(),
      await proTrackMPCWallet.getAddress()
    );
    console.log("✅ Granted supply chain roles to ProTrackMPCWallet");

    // Grant roles to advanced IoT
    await proTrackSupplyChain.grantRole(
      await proTrackSupplyChain.ORACLE_ROLE(),
      await proTrackAdvancedIoT.getAddress()
    );
    console.log("✅ Granted ORACLE_ROLE to ProTrackAdvancedIoT");

    // Grant roles to escrow contract
    await proTrackNFT.grantRole(
      await proTrackNFT.SUPPLY_CHAIN_ROLE(),
      await supplyChainEscrow.getAddress()
    );
    console.log("✅ Granted SUPPLY_CHAIN_ROLE to SupplyChainEscrow");

    // Grant roles to oracle contract
    await supplyChainEscrow.grantRole(
      await supplyChainEscrow.ORACLE_ROLE(),
      await iotOracle.getAddress()
    );
    console.log("✅ Granted ORACLE_ROLE to IoTOracle (Escrow)");

    // Grant MPC roles
    await proTrackMPCWallet.grantRole(
      await proTrackMPCWallet.SUPPLY_CHAIN_ROLE(),
      await proTrackSupplyChain.getAddress()
    );
    await proTrackMPCWallet.grantRole(
      await proTrackMPCWallet.MPC_OPERATOR_ROLE(),
      deployer.address
    );
    console.log("✅ Granted MPC roles");

    // 9. Setup Demo Data (for testnets only)
    if (network.chainId !== 1 && network.chainId !== 137) {
      console.log("\n🎭 Setting up demo data...");
      await setupDemoData(
        proTrackNFT,
        proTrackSupplyChain,
        iotOracle,
        proTrackMPCWallet,
        proTrackRFIDTokenizer,
        deployer
      );
    }

    // 10. Save deployment data
    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const deploymentFile = path.join(
      deploymentsDir,
      `localhost-${network.chainId}.json`
    );
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentData, null, 2));
    console.log(`\n💾 Deployment data saved to: ${deploymentFile}`);

    // 11. Generate frontend configuration
    await generateFrontendConfig(deploymentData);

    // 12. Display summary
    console.log("\n🎉 Deployment Summary:");
    console.log("=".repeat(50));
    console.log(
      `ProTrackNFT:           ${deploymentData.contracts.ProTrackNFT.address}`
    );
    console.log(
      `SupplyChainEscrow:     ${deploymentData.contracts.SupplyChainEscrow.address}`
    );
    console.log(
      `IoTOracle:             ${deploymentData.contracts.IoTOracle.address}`
    );
    console.log(
      `ProTrackSupplyChain:   ${deploymentData.contracts.ProTrackSupplyChain.address}`
    );
    console.log(
      `ProTrackMPCWallet:     ${deploymentData.contracts.ProTrackMPCWallet.address}`
    );
    console.log(
      `ProTrackRFIDTokenizer: ${deploymentData.contracts.ProTrackRFIDTokenizer.address}`
    );
    console.log(
      `ProTrackAdvancedIoT:   ${deploymentData.contracts.ProTrackAdvancedIoT.address}`
    );
    console.log("=".repeat(50));
    console.log("✅ All contracts deployed successfully!");
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

async function setupDemoData(
  proTrackNFT,
  proTrackSupplyChain,
  iotOracle,
  proTrackMPCWallet,
  proTrackRFIDTokenizer,
  deployer
) {
  try {
    // Create MPC wallet for demo
    const signers = [
      deployer.address,
      "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    ];

    const walletId = await proTrackMPCWallet.createMPCWallet(signers, 2);
    console.log(`✅ Created MPC wallet with ID: ${walletId}`);

    // Register demo IoT devices
    const demoDevices = [
      {
        deviceId: "TEMP_SENSOR_001",
        supportedSensors: [0], // TEMPERATURE
        location: "Warehouse A",
        metadata: "Temperature monitoring for cold storage",
      },
      {
        deviceId: "GPS_TRACKER_001",
        supportedSensors: [5], // GPS
        location: "Delivery Truck 1",
        metadata: "GPS tracking for shipments",
      },
      {
        deviceId: "MULTI_SENSOR_001",
        supportedSensors: [0, 1, 3], // TEMPERATURE, HUMIDITY, VIBRATION
        location: "Production Line",
        metadata: "Multi-sensor monitoring",
      },
    ];

    for (const device of demoDevices) {
      await iotOracle.registerDevice(
        device.deviceId,
        deployer.address,
        device.supportedSensors,
        device.location,
        device.metadata
      );
      console.log(`✅ Registered device: ${device.deviceId}`);
    }

    // Mint demo NFTs
    const demoProducts = [
      {
        name: "Organic Milk Batch #001",
        sku: "ORG-MILK-001",
        category: "Dairy",
        batchId: "BATCH-MILK-001",
        expiryDate: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
        currentValue: "0.1",
        currentLocation: "Farm A",
      },
      {
        name: "Premium Cheese Batch #002",
        sku: "PREM-CHEESE-002",
        category: "Dairy",
        batchId: "BATCH-CHEESE-002",
        expiryDate: Math.floor(Date.now() / 1000) + 60 * 24 * 60 * 60, // 60 days
        currentValue: "0.2",
        currentLocation: "Processing Plant B",
      },
    ];

    for (const product of demoProducts) {
      const tokenURI = `https://ipfs.io/ipfs/QmDemo${product.batchId}`;
      await proTrackNFT.mintProduct(deployer.address, tokenURI, {
        name: product.name,
        sku: product.sku,
        manufacturer: deployer.address,
        createdAt: Math.floor(Date.now() / 1000),
        batchId: product.batchId,
        category: product.category,
        expiryDate: product.expiryDate,
        isActive: true,
        currentValue: ethers.parseEther(product.currentValue.toString()),
        currentLocation: product.currentLocation,
      });
      console.log(`✅ Minted NFT: ${product.name}`);
    }

    // Create demo supply chain products
    const rfidHashes = ["RFID-001", "RFID-002"];
    const productNames = ["Organic Milk", "Premium Cheese"];
    const batchNumbers = ["BATCH-001", "BATCH-002"];

    for (let i = 0; i < rfidHashes.length; i++) {
      await proTrackSupplyChain.mintProduct(
        rfidHashes[i],
        productNames[i],
        batchNumbers[i],
        Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days expiry
        `https://ipfs.io/ipfs/QmSupplyChain${i}`,
        deployer.address
      );
      console.log(`✅ Created supply chain product: ${productNames[i]}`);
    }
  } catch (error) {
    console.warn("⚠️  Demo data setup failed:", error.message);
  }
}

async function generateFrontendConfig(deploymentData) {
  const config = {
    network: deploymentData.network,
    contracts: {
      ProTrackSupplyChain: {
        address: deploymentData.contracts.ProTrackSupplyChain.address,
        deployBlock: deploymentData.contracts.ProTrackSupplyChain.deployBlock,
      },
      ProTrackOracle: {
        address: deploymentData.contracts.IoTOracle.address,
        deployBlock: deploymentData.contracts.IoTOracle.deployBlock,
      },
      ProTrackMPCWallet: {
        address: deploymentData.contracts.ProTrackMPCWallet.address,
        deployBlock: deploymentData.contracts.ProTrackMPCWallet.deployBlock,
      },
      ProTrackRFIDTokenizer: {
        address: deploymentData.contracts.ProTrackRFIDTokenizer.address,
        deployBlock: deploymentData.contracts.ProTrackRFIDTokenizer.deployBlock,
      },
      ProTrackAdvancedIoT: {
        address: deploymentData.contracts.ProTrackAdvancedIoT.address,
        deployBlock: deploymentData.contracts.ProTrackAdvancedIoT.deployBlock,
      },
      ProTrackNFT: {
        address: deploymentData.contracts.ProTrackNFT.address,
        deployBlock: deploymentData.contracts.ProTrackNFT.deployBlock,
      },
    },
    demo: {
      mpcWalletId: 0,
      signers: [
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      ],
      devices: ["TEMP_SENSOR_001", "HUM_SENSOR_002", "GPS_TRACKER_003"],
    },
  };

  // Save to frontend config directory
  const configDir = path.join(__dirname, "../../src/config");
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  const configFile = path.join(configDir, "contracts.json");
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
  console.log(`📝 Frontend config generated: ${configFile}`);

  // Also save to contracts directory for consistency
  const contractsConfigFile = path.join(__dirname, "../contracts.json");
  fs.writeFileSync(contractsConfigFile, JSON.stringify(config, null, 2));
  console.log(`📝 Contracts config generated: ${contractsConfigFile}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
