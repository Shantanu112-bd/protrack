const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying Enhanced ProTrack Contracts...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  // Deploy ProTrackSupplyChain first (existing contract)
  console.log("\n📦 Deploying ProTrackSupplyChain...");
  const ProTrackSupplyChain = await ethers.getContractFactory("ProTrackSupplyChain");
  const supplyChain = await ProTrackSupplyChain.deploy();
  await supplyChain.waitForDeployment();
  console.log("✅ ProTrackSupplyChain deployed to:", await supplyChain.getAddress());

  // Deploy ProTrackOracle (existing contract)
  console.log("\n🔮 Deploying ProTrackOracle...");
  const ProTrackOracle = await ethers.getContractFactory("ProTrackOracle");
  const oracle = await ProTrackOracle.deploy(await supplyChain.getAddress());
  await oracle.waitForDeployment();
  console.log("✅ ProTrackOracle deployed to:", await oracle.getAddress());

  // Deploy MPC Wallet
  console.log("\n🔐 Deploying ProTrackMPCWallet...");
  const ProTrackMPCWallet = await ethers.getContractFactory("ProTrackMPCWallet");
  const mpcWallet = await ProTrackMPCWallet.deploy();
  await mpcWallet.waitForDeployment();
  console.log("✅ ProTrackMPCWallet deployed to:", await mpcWallet.getAddress());

  // Deploy RFID Tokenizer
  console.log("\n📡 Deploying ProTrackRFIDTokenizer...");
  const ProTrackRFIDTokenizer = await ethers.getContractFactory("ProTrackRFIDTokenizer");
  const rfidTokenizer = await ProTrackRFIDTokenizer.deploy(
    await supplyChain.getAddress(),
    await mpcWallet.getAddress()
  );
  await rfidTokenizer.waitForDeployment();
  console.log("✅ ProTrackRFIDTokenizer deployed to:", await rfidTokenizer.getAddress());

  // Deploy Advanced IoT
  console.log("\n🌐 Deploying ProTrackAdvancedIoT...");
  const ProTrackAdvancedIoT = await ethers.getContractFactory("ProTrackAdvancedIoT");
  const advancedIoT = await ProTrackAdvancedIoT.deploy(
    await supplyChain.getAddress(),
    await mpcWallet.getAddress()
  );
  await advancedIoT.waitForDeployment();
  console.log("✅ ProTrackAdvancedIoT deployed to:", await advancedIoT.getAddress());

  // Setup roles and permissions
  console.log("\n⚙️ Setting up roles and permissions...");

  // Grant roles to deployer for testing
  await supplyChain.grantManufacturerRole(deployer.address);
  await supplyChain.grantOracleRole(await oracle.getAddress());
  await supplyChain.grantOracleRole(await advancedIoT.getAddress());

  // Grant MPC operator role
  await mpcWallet.grantRole(await mpcWallet.MPC_OPERATOR_ROLE(), deployer.address);

  // Grant RFID roles
  await rfidTokenizer.grantScannerRole(deployer.address);
  await rfidTokenizer.grantTokenizerRole(deployer.address);

  // Grant IoT roles
  await advancedIoT.grantRole(await advancedIoT.IOT_GATEWAY_ROLE(), deployer.address);
  await advancedIoT.grantRole(await advancedIoT.ANALYTICS_ROLE(), deployer.address);

  console.log("✅ Roles and permissions configured");

  // Create demo MPC wallet
  console.log("\n🔧 Creating demo MPC wallet...");
  // Get additional signers from Hardhat accounts
  const [, signer1, signer2] = await ethers.getSigners();
  const demoSigners = [
    deployer.address,
    signer1.address,
    signer2.address
  ];
  
  const createWalletTx = await mpcWallet.createMPCWallet(demoSigners, 2);
  const receipt = await createWalletTx.wait();
  console.log("✅ Demo MPC wallet created");

  // Register demo IoT devices
  console.log("\n📱 Registering demo IoT devices...");
  
  const devices = [
    {
      address: "0x1234567890123456789012345678901234567890",
      id: "TEMP_SENSOR_001",
      type: "temperature",
      protocol: "LoRa",
      firmware: "v1.2.3"
    },
    {
      address: "0x2345678901234567890123456789012345678901",
      id: "HUM_SENSOR_002", 
      type: "humidity",
      protocol: "MQTT",
      firmware: "v1.1.0"
    },
    {
      address: "0x3456789012345678901234567890123456789012",
      id: "GPS_TRACKER_003",
      type: "gps",
      protocol: "Cellular",
      firmware: "v2.0.1"
    }
  ];

  for (const device of devices) {
    await advancedIoT.registerAdvancedDevice(
      device.address,
      device.id,
      device.type,
      device.protocol,
      device.firmware,
      true // Enable encryption
    );
    console.log(`✅ Registered device: ${device.id}`);
  }

  // Create demo alert rules
  console.log("\n🚨 Creating demo alert rules...");
  
  const alertRules = [
    {
      sensorType: "temperature",
      minThreshold: -20,
      maxThreshold: 40,
      timeWindow: 300, // 5 minutes
      targets: [deployer.address],
      message: "Temperature out of safe range",
      cooldown: 1800 // 30 minutes
    },
    {
      sensorType: "humidity", 
      minThreshold: 0,
      maxThreshold: 95,
      timeWindow: 600, // 10 minutes
      targets: [deployer.address],
      message: "Humidity levels critical",
      cooldown: 3600 // 1 hour
    }
  ];

  for (const rule of alertRules) {
    await advancedIoT.createAlertRule(
      rule.sensorType,
      rule.minThreshold,
      rule.maxThreshold,
      rule.timeWindow,
      rule.targets,
      rule.message,
      rule.cooldown
    );
    console.log(`✅ Created alert rule for ${rule.sensorType}`);
  }

  // Generate frontend configuration
  const config = {
    network: {
      name: "localhost",
      chainId: 31337,
      rpcUrl: "http://127.0.0.1:8545"
    },
    contracts: {
      ProTrackSupplyChain: {
        address: await supplyChain.getAddress(),
        deployBlock: (await supplyChain.deploymentTransaction()).blockNumber
      },
      ProTrackOracle: {
        address: await oracle.getAddress(),
        deployBlock: (await oracle.deploymentTransaction()).blockNumber
      },
      ProTrackMPCWallet: {
        address: await mpcWallet.getAddress(),
        deployBlock: (await mpcWallet.deploymentTransaction()).blockNumber
      },
      ProTrackRFIDTokenizer: {
        address: await rfidTokenizer.getAddress(),
        deployBlock: (await rfidTokenizer.deploymentTransaction()).blockNumber
      },
      ProTrackAdvancedIoT: {
        address: await advancedIoT.getAddress(),
        deployBlock: (await advancedIoT.deploymentTransaction()).blockNumber
      }
    },
    demo: {
      mpcWalletId: 0,
      signers: demoSigners,
      devices: devices.map(d => d.id)
    }
  };

  // Save configuration
  const fs = require('fs');
  const path = require('path');
  
  const configPath = path.join(__dirname, '../src/config/contracts.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log("✅ Frontend configuration saved to:", configPath);

  // Summary
  console.log("\n🎉 Enhanced ProTrack Deployment Complete!");
  console.log("=".repeat(50));
  console.log("Contract Addresses:");
  console.log("- ProTrackSupplyChain:", await supplyChain.getAddress());
  console.log("- ProTrackOracle:", await oracle.getAddress());
  console.log("- ProTrackMPCWallet:", await mpcWallet.getAddress());
  console.log("- ProTrackRFIDTokenizer:", await rfidTokenizer.getAddress());
  console.log("- ProTrackAdvancedIoT:", await advancedIoT.getAddress());
  console.log("=" .repeat(50));
  console.log("🔧 Demo Setup:");
  console.log("- MPC Wallet with 3 signers (2/3 threshold)");
  console.log("- 3 IoT devices registered");
  console.log("- 2 alert rules configured");
  console.log("- All roles and permissions set");
  console.log("=" .repeat(50));
  console.log("🚀 Ready for frontend integration!");

  // Verify contracts on Etherscan (if not local network)
  const network = await ethers.provider.getNetwork();
  if (network.chainId !== 31337) {
    console.log("\n📋 Contract verification commands:");
    console.log(`npx hardhat verify --network ${network.name} ${supplyChain.address}`);
    console.log(`npx hardhat verify --network ${network.name} ${oracle.address} ${supplyChain.address}`);
    console.log(`npx hardhat verify --network ${network.name} ${mpcWallet.address}`);
    console.log(`npx hardhat verify --network ${network.name} ${rfidTokenizer.address} ${supplyChain.address} ${mpcWallet.address}`);
    console.log(`npx hardhat verify --network ${network.name} ${advancedIoT.address} ${supplyChain.address} ${mpcWallet.address}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
