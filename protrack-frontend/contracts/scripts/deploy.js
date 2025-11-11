const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting ProTrack Smart Contracts Deployment...\n");

  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  
  console.log("📋 Deployment Details:");
  console.log("- Network:", network.name, `(Chain ID: ${network.chainId})`);
  console.log("- Deployer:", deployer.address);
  console.log("- Balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH\n");

  const deploymentData = {
    network: network.name,
    chainId: Number(network.chainId),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {}
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
      txHash: proTrackNFT.deploymentTransaction().hash
    };

    // 2. Deploy SupplyChainEscrow Contract
    console.log("\n📦 Deploying SupplyChainEscrow...");
    const SupplyChainEscrow = await ethers.getContractFactory("SupplyChainEscrow");
    const supplyChainEscrow = await SupplyChainEscrow.deploy(await proTrackNFT.getAddress());
    await supplyChainEscrow.waitForDeployment();
    
    console.log("✅ SupplyChainEscrow deployed to:", await supplyChainEscrow.getAddress());
    deploymentData.contracts.SupplyChainEscrow = {
      address: await supplyChainEscrow.getAddress(),
      txHash: supplyChainEscrow.deploymentTransaction().hash
    };

    // 3. Deploy IoTOracle Contract
    console.log("\n📦 Deploying IoTOracle...");
    const IoTOracle = await ethers.getContractFactory("IoTOracle");
    const iotOracle = await IoTOracle.deploy(await supplyChainEscrow.getAddress());
    await iotOracle.waitForDeployment();
    
    console.log("✅ IoTOracle deployed to:", await iotOracle.getAddress());
    deploymentData.contracts.IoTOracle = {
      address: await iotOracle.getAddress(),
      txHash: iotOracle.deploymentTransaction().hash
    };

    // 4. Deploy SupplyChainGovernance Contract
    console.log("\n📦 Deploying SupplyChainGovernance...");
    const SupplyChainGovernance = await ethers.getContractFactory("SupplyChainGovernance");
    const supplyChainGovernance = await SupplyChainGovernance.deploy(await proTrackNFT.getAddress());
    await supplyChainGovernance.waitForDeployment();
    
    console.log("✅ SupplyChainGovernance deployed to:", await supplyChainGovernance.getAddress());
    deploymentData.contracts.SupplyChainGovernance = {
      address: await supplyChainGovernance.getAddress(),
      txHash: supplyChainGovernance.deploymentTransaction().hash
    };

    // 5. Setup Contract Permissions
    console.log("\n🔐 Setting up contract permissions...");
    
    // Grant roles to escrow contract
    await proTrackNFT.grantRole(await proTrackNFT.SUPPLY_CHAIN_ROLE(), await supplyChainEscrow.getAddress());
    console.log("✅ Granted SUPPLY_CHAIN_ROLE to SupplyChainEscrow");
    
    // Grant roles to oracle contract
    await supplyChainEscrow.grantRole(await supplyChainEscrow.ORACLE_ROLE(), await iotOracle.getAddress());
    console.log("✅ Granted ORACLE_ROLE to IoTOracle");
    
    // Grant roles to governance contract
    await proTrackNFT.grantRole(await proTrackNFT.INSPECTOR_ROLE(), await supplyChainGovernance.getAddress());
    console.log("✅ Granted INSPECTOR_ROLE to SupplyChainGovernance");

    // 6. Initialize Demo Data (for testnets only)
    if (network.chainId !== 1 && network.chainId !== 137) {
      console.log("\n🎭 Setting up demo data...");
      await setupDemoData(proTrackNFT, iotOracle, deployer);
    }

    // 7. Save deployment data
    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const deploymentFile = path.join(deploymentsDir, `${network.name}-${network.chainId}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentData, null, 2));
    console.log(`\n💾 Deployment data saved to: ${deploymentFile}`);

    // 8. Generate frontend configuration
    await generateFrontendConfig(deploymentData);

    // 9. Display summary
    console.log("\n🎉 Deployment Summary:");
    console.log("=" .repeat(50));
    console.log(`ProTrackNFT:           ${deploymentData.contracts.ProTrackNFT.address}`);
    console.log(`SupplyChainEscrow:     ${deploymentData.contracts.SupplyChainEscrow.address}`);
    console.log(`IoTOracle:             ${deploymentData.contracts.IoTOracle.address}`);
    console.log(`SupplyChainGovernance: ${deploymentData.contracts.SupplyChainGovernance.address}`);
    console.log("=" .repeat(50));
    console.log("✅ All contracts deployed successfully!");

    // 10. Verification instructions
    if (process.env.DEPLOY_VERIFY === "true" && network.chainId !== 1337) {
      console.log("\n🔍 To verify contracts, run:");
      console.log(`npx hardhat run scripts/verify.js --network ${network.name}`);
    }

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

async function setupDemoData(proTrackNFT, iotOracle, deployer) {
  try {
    // Register demo IoT devices
    const demoDevices = [
      {
        deviceId: "TEMP_SENSOR_001",
        supportedSensors: [0], // TEMPERATURE
        location: "Warehouse A",
        metadata: "Temperature monitoring for cold storage"
      },
      {
        deviceId: "GPS_TRACKER_001", 
        supportedSensors: [5], // GPS
        location: "Delivery Truck 1",
        metadata: "GPS tracking for shipments"
      },
      {
        deviceId: "MULTI_SENSOR_001",
        supportedSensors: [0, 1, 3], // TEMPERATURE, HUMIDITY, VIBRATION
        location: "Production Line",
        metadata: "Multi-sensor monitoring"
      }
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
        expiryDate: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
        currentValue: "0.1",
        currentLocation: "Farm A"
      },
      {
        name: "Premium Cheese Batch #002",
        sku: "PREM-CHEESE-002", 
        category: "Dairy",
        batchId: "BATCH-CHEESE-002",
        expiryDate: Math.floor(Date.now() / 1000) + (60 * 24 * 60 * 60), // 60 days
        currentValue: "0.2",
        currentLocation: "Processing Plant B"
      }
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
        currentLocation: product.currentLocation
      });
      console.log(`✅ Minted NFT: ${product.name}`);
    }

  } catch (error) {
    console.warn("⚠️  Demo data setup failed:", error.message);
  }
}

async function generateFrontendConfig(deploymentData) {
  const config = {
    contracts: {
      ProTrackNFT: {
        address: deploymentData.contracts.ProTrackNFT.address,
        abi: "ProTrackNFT" // Reference to ABI file
      },
      SupplyChainEscrow: {
        address: deploymentData.contracts.SupplyChainEscrow.address,
        abi: "SupplyChainEscrow"
      },
      IoTOracle: {
        address: deploymentData.contracts.IoTOracle.address,
        abi: "IoTOracle"
      },
      SupplyChainGovernance: {
        address: deploymentData.contracts.SupplyChainGovernance.address,
        abi: "SupplyChainGovernance"
      }
    },
    network: {
      name: deploymentData.network,
      chainId: deploymentData.chainId
    },
    deployment: {
      timestamp: deploymentData.timestamp,
      deployer: deploymentData.deployer
    }
  };

  const configDir = path.join(__dirname, "../../src/contracts");
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  const configFile = path.join(configDir, `${deploymentData.network}-config.json`);
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
  console.log(`📝 Frontend config generated: ${configFile}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
