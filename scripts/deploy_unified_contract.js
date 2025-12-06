const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying Unified ProTrack Supply Chain System...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log(
    "Account balance:",
    (await deployer.getBalance()).toString(),
    "wei\n"
  );

  // Deploy the unified ProTrack contract
  console.log("1️⃣ Deploying Unified ProTrack contract...");
  const ProTrack = await hre.ethers.getContractFactory("ProTrack");
  const proTrack = await ProTrack.deploy();
  await proTrack.deployed();
  console.log("✅ Unified ProTrack deployed to:", proTrack.address);

  // Setup roles for the unified contract
  console.log("\n2️⃣ Setting up roles for ProTrack...");

  // Define role constants (must match the contract)
  const ADMIN_ROLE = hre.ethers.utils.keccak256(
    hre.ethers.utils.toUtf8Bytes("ADMIN_ROLE")
  );
  const MANUFACTURER_ROLE = hre.ethers.utils.keccak256(
    hre.ethers.utils.toUtf8Bytes("MANUFACTURER_ROLE")
  );
  const PACKAGER_ROLE = hre.ethers.utils.keccak256(
    hre.ethers.utils.toUtf8Bytes("PACKAGER_ROLE")
  );
  const TRANSPORTER_ROLE = hre.ethers.utils.keccak256(
    hre.ethers.utils.toUtf8Bytes("TRANSPORTER_ROLE")
  );
  const WHOLESALER_ROLE = hre.ethers.utils.keccak256(
    hre.ethers.utils.toUtf8Bytes("WHOLESALER_ROLE")
  );
  const RETAILER_ROLE = hre.ethers.utils.keccak256(
    hre.ethers.utils.toUtf8Bytes("RETAILER_ROLE")
  );
  const CUSTOMER_ROLE = hre.ethers.utils.keccak256(
    hre.ethers.utils.toUtf8Bytes("CUSTOMER_ROLE")
  );
  const ORACLE_ROLE = hre.ethers.utils.keccak256(
    hre.ethers.utils.toUtf8Bytes("ORACLE_ROLE")
  );
  const INSPECTOR_ROLE = hre.ethers.utils.keccak256(
    hre.ethers.utils.toUtf8Bytes("INSPECTOR_ROLE")
  );

  // Grant all roles to deployer for testing
  await proTrack.grantRole(ADMIN_ROLE, deployer.address);
  console.log("✅ Granted ADMIN_ROLE to:", deployer.address);

  await proTrack.grantRole(MANUFACTURER_ROLE, deployer.address);
  console.log("✅ Granted MANUFACTURER_ROLE to:", deployer.address);

  await proTrack.grantRole(PACKAGER_ROLE, deployer.address);
  console.log("✅ Granted PACKAGER_ROLE to:", deployer.address);

  await proTrack.grantRole(TRANSPORTER_ROLE, deployer.address);
  console.log("✅ Granted TRANSPORTER_ROLE to:", deployer.address);

  await proTrack.grantRole(WHOLESALER_ROLE, deployer.address);
  console.log("✅ Granted WHOLESALER_ROLE to:", deployer.address);

  await proTrack.grantRole(RETAILER_ROLE, deployer.address);
  console.log("✅ Granted RETAILER_ROLE to:", deployer.address);

  await proTrack.grantRole(CUSTOMER_ROLE, deployer.address);
  console.log("✅ Granted CUSTOMER_ROLE to:", deployer.address);

  await proTrack.grantRole(ORACLE_ROLE, deployer.address);
  console.log("✅ Granted ORACLE_ROLE to:", deployer.address);

  await proTrack.grantRole(INSPECTOR_ROLE, deployer.address);
  console.log("✅ Granted INSPECTOR_ROLE to:", deployer.address);

  // Create initial test product
  console.log("\n3️⃣ Creating initial test product...");

  const testRfid = "RFID-TEST-001";
  const testBarcode = "BARCODE-TEST-12345";
  const testProductName = "Test Organic Coffee Beans";
  const testBatchId = "BATCH-2023-TEST";
  const testExpiryDate = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60; // 1 year from now
  const testIpfsMetadata = "QmTestMetadataCIDForProduct1";

  const mintTx = await proTrack.mintProduct(
    testRfid,
    testBarcode,
    testProductName,
    testBatchId,
    testExpiryDate,
    testIpfsMetadata,
    deployer.address
  );

  const mintReceipt = await mintTx.wait();
  const productMintedEvent = mintReceipt.events.find(
    (e) => e.event === "ProductMinted"
  );

  const testTokenId = productMintedEvent.args.tokenId;
  console.log("✅ Test product minted with Token ID:", testTokenId.toString());
  console.log("   RFID:", testRfid);
  console.log("   Product Name:", testProductName);

  // Log packaging for the test product
  console.log("\n4️⃣ Logging packaging for test product...");
  const packagingTx = await proTrack.logPackaging(testTokenId, testBatchId);
  await packagingTx.wait();
  console.log("✅ Product packaging logged");

  // Create deployment configuration file
  console.log("\n5️⃣ Creating deployment configuration...");
  const fs = require("fs");
  const path = require("path");

  const deploymentConfig = {
    network: {
      name: hre.network.name,
      chainId: (await hre.ethers.provider.getNetwork()).chainId,
    },
    contracts: {
      ProTrack: {
        address: proTrack.address,
        deployBlock: (await proTrack.deployTransaction.wait()).blockNumber,
      },
    },
    demo: {
      testTokenId: testTokenId.toString(),
      testRfid: testRfid,
      testBarcode: testBarcode,
      testProductName: testProductName,
      devices: ["TEMP_SENSOR_001", "HUM_SENSOR_002", "GPS_TRACKER_003"],
    },
  };

  const configPath = path.join(
    __dirname,
    "..",
    "protrack-frontend",
    "src",
    "config",
    "contracts.json"
  );
  fs.writeFileSync(configPath, JSON.stringify(deploymentConfig, null, 2));
  console.log("✅ Deployment configuration saved to:", configPath);

  // Verify contract on Etherscan (if on a supported network)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n6️⃣ Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: proTrack.address,
        constructorArguments: [],
      });

      console.log("✅ Contract verified on Etherscan");
    } catch (error) {
      console.log("⚠️  Contract verification failed:", error.message);
    }
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 UNIFIED PROTRACK SYSTEM DEPLOYMENT SUCCESSFUL!");
  console.log("=".repeat(60));
  console.log("📅 Deployment Timestamp:", new Date().toISOString());
  console.log("📍 Network:", hre.network.name);
  console.log("💰 Deployer Account:", deployer.address);
  console.log(
    "📊 Deployer Balance:",
    hre.ethers.utils.formatEther(await deployer.getBalance()),
    "ETH"
  );
  console.log("\n📦 Deployed Contracts:");
  console.log("   - Unified ProTrack:", proTrack.address);
  console.log("\n🏷️  Test Product Token ID:", testTokenId.toString());
  console.log("   RFID:", testRfid);
  console.log("   Product Name:", testProductName);
  console.log("\n📁 Configuration saved to:", configPath);
  console.log(
    "\n🚀 The Unified ProTrack Supply Chain System is now ready for use!"
  );
  console.log("   You can start the frontend with: npm run dev");
  console.log(
    "   Make sure to update the contract addresses in your frontend configuration."
  );
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
