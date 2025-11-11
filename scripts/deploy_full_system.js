const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying Complete ProTrack Supply Chain System...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log(
    "Account balance:",
    (await deployer.getBalance()).toString(),
    "wei\n"
  );

  // Deploy ProTrackToken (NFT contract)
  console.log("1️⃣ Deploying ProTrackToken (NFT) contract...");
  const ProTrackToken = await hre.ethers.getContractFactory("ProTrackToken");
  const proTrackToken = await ProTrackToken.deploy();
  await proTrackToken.deployed();
  console.log("✅ ProTrackToken deployed to:", proTrackToken.address);

  // Deploy ProTrackMPC (Multi-Party Computation) contract
  console.log("\n2️⃣ Deploying ProTrackMPC contract...");
  const ProTrackMPC = await hre.ethers.getContractFactory("ProTrackMPC");
  const proTrackMPC = await ProTrackMPC.deploy();
  await proTrackMPC.deployed();
  console.log("✅ ProTrackMPC deployed to:", proTrackMPC.address);

  // Deploy ProTrackOracle contract
  console.log("\n3️⃣ Deploying ProTrackOracle contract...");
  // Note: For testing, we'll use mock addresses. In production, use real Chainlink addresses.
  const MOCK_LINK_TOKEN = "0x514910771AF9Ca656af840dff83E8264EcF986CA"; // Mock LINK token
  const MOCK_ORACLE_ADDRESS = "0xCC7bb2d219a0FC08033E130629C2B854b74A5f36"; // Mock oracle
  const MOCK_JOB_ID = "0x12345678901234567890123456789012"; // Mock job ID
  const MOCK_FEE = hre.ethers.utils.parseEther("0.1"); // 0.1 LINK

  const ProTrackOracle = await hre.ethers.getContractFactory("ProTrackOracle");
  const proTrackOracle = await ProTrackOracle.deploy(
    MOCK_LINK_TOKEN,
    MOCK_ORACLE_ADDRESS,
    MOCK_JOB_ID,
    MOCK_FEE
  );
  await proTrackOracle.deployed();
  console.log("✅ ProTrackOracle deployed to:", proTrackOracle.address);

  // Setup roles for ProTrackToken
  console.log("\n4️⃣ Setting up roles for ProTrackToken...");
  const MINTER_ROLE = hre.ethers.utils.keccak256(
    hre.ethers.utils.toUtf8Bytes("MINTER_ROLE")
  );
  const ADMIN_ROLE = hre.ethers.utils.keccak256(
    hre.ethers.utils.toUtf8Bytes("ADMIN_ROLE")
  );

  await proTrackToken.grantRole(MINTER_ROLE, deployer.address);
  console.log("✅ Granted MINTER_ROLE to:", deployer.address);

  await proTrackToken.grantRole(ADMIN_ROLE, deployer.address);
  console.log("✅ Granted ADMIN_ROLE to:", deployer.address);

  // Setup roles for ProTrackMPC
  console.log("\n5️⃣ Setting up roles for ProTrackMPC...");
  const MANUFACTURER_ROLE = hre.ethers.utils.keccak256(
    hre.ethers.utils.toUtf8Bytes("MANUFACTURER_ROLE")
  );
  const SUPPLIER_ROLE = hre.ethers.utils.keccak256(
    hre.ethers.utils.toUtf8Bytes("SUPPLIER_ROLE")
  );
  const DISTRIBUTOR_ROLE = hre.ethers.utils.keccak256(
    hre.ethers.utils.toUtf8Bytes("DISTRIBUTOR_ROLE")
  );
  const ORACLE_ROLE_MPC = hre.ethers.utils.keccak256(
    hre.ethers.utils.toUtf8Bytes("ORACLE_ROLE")
  );

  await proTrackMPC.grantRole(MANUFACTURER_ROLE, deployer.address);
  console.log("✅ Granted MANUFACTURER_ROLE to:", deployer.address);

  await proTrackMPC.grantRole(SUPPLIER_ROLE, deployer.address);
  console.log("✅ Granted SUPPLIER_ROLE to:", deployer.address);

  await proTrackMPC.grantRole(DISTRIBUTOR_ROLE, deployer.address);
  console.log("✅ Granted DISTRIBUTOR_ROLE to:", deployer.address);

  await proTrackMPC.grantRole(ORACLE_ROLE_MPC, deployer.address);
  console.log("✅ Granted ORACLE_ROLE to:", deployer.address);

  // Setup roles for ProTrackOracle
  console.log("\n6️⃣ Setting up roles for ProTrackOracle...");
  const ORACLE_ROLE = hre.ethers.utils.keccak256(
    hre.ethers.utils.toUtf8Bytes("ORACLE_ROLE")
  );
  const DATA_PROVIDER_ROLE = hre.ethers.utils.keccak256(
    hre.ethers.utils.toUtf8Bytes("DATA_PROVIDER_ROLE")
  );

  await proTrackOracle.grantRole(ORACLE_ROLE, deployer.address);
  console.log("✅ Granted ORACLE_ROLE to:", deployer.address);

  await proTrackOracle.grantRole(DATA_PROVIDER_ROLE, deployer.address);
  console.log("✅ Granted DATA_PROVIDER_ROLE to:", deployer.address);

  // Create initial test keys for MPC
  console.log("\n7️⃣ Creating initial test MPC keys...");
  const TEST_KEY_ID_1 = hre.ethers.utils.keccak256(
    hre.ethers.utils.toUtf8Bytes("test_key_1")
  );
  const TEST_PUBLIC_KEY = "0x"; // Empty for testing
  const TEST_THRESHOLD = 2;
  const TEST_PURPOSE = hre.ethers.utils.keccak256(
    hre.ethers.utils.toUtf8Bytes("supply_chain")
  );

  await proTrackMPC.createKey(
    TEST_KEY_ID_1,
    TEST_PUBLIC_KEY,
    TEST_THRESHOLD,
    [deployer.address, deployer.address, deployer.address], // Same address for testing
    TEST_PURPOSE
  );
  console.log("✅ Test MPC key created with ID:", TEST_KEY_ID_1);

  // Create initial test product in ProTrackToken
  console.log("\n8️⃣ Creating initial test product...");
  const testProductTx = await proTrackToken.createProduct(
    "Test Product",
    "This is a test product for the ProTrack system",
    "https://example.com/token/1"
  );
  const testProductReceipt = await testProductTx.wait();
  const productCreatedEvent = testProductReceipt.events.find(
    (e) => e.event === "ProductCreated"
  );
  const testTokenId = productCreatedEvent.args.tokenId;
  console.log("✅ Test product created with Token ID:", testTokenId.toString());

  // Update the product status
  await proTrackToken.updateProductStatus(testTokenId, 1); // In Transit
  console.log("✅ Product status updated to In Transit");

  // Add product to history
  await proTrackToken.addToProductHistory(
    testTokenId,
    "Product created and ready for shipment"
  );
  console.log("✅ Product history updated");

  // Create deployment configuration file
  console.log("\n9️⃣ Creating deployment configuration...");
  const fs = require("fs");
  const path = require("path");

  const deploymentConfig = {
    network: {
      name: hre.network.name,
      chainId: (await hre.ethers.provider.getNetwork()).chainId,
    },
    contracts: {
      ProTrackToken: {
        address: proTrackToken.address,
        deployBlock: (await proTrackToken.deployTransaction.wait()).blockNumber,
      },
      ProTrackMPC: {
        address: proTrackMPC.address,
        deployBlock: (await proTrackMPC.deployTransaction.wait()).blockNumber,
      },
      ProTrackOracle: {
        address: proTrackOracle.address,
        deployBlock: (await proTrackOracle.deployTransaction.wait())
          .blockNumber,
      },
    },
    demo: {
      mpcWalletId: TEST_KEY_ID_1,
      signers: [deployer.address, deployer.address, deployer.address],
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

  // Verify contracts on Etherscan (if on a supported network)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n🔟 Verifying contracts on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: proTrackToken.address,
        constructorArguments: [],
      });

      await hre.run("verify:verify", {
        address: proTrackMPC.address,
        constructorArguments: [],
      });

      await hre.run("verify:verify", {
        address: proTrackOracle.address,
        constructorArguments: [
          MOCK_LINK_TOKEN,
          MOCK_ORACLE_ADDRESS,
          MOCK_JOB_ID,
          MOCK_FEE,
        ],
      });

      console.log("✅ All contracts verified on Etherscan");
    } catch (error) {
      console.log("⚠️  Contract verification failed:", error.message);
    }
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 COMPLETE PROTRACK SYSTEM DEPLOYMENT SUCCESSFUL!");
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
  console.log("   - ProTrackToken (NFT):", proTrackToken.address);
  console.log("   - ProTrackMPC (Wallet):", proTrackMPC.address);
  console.log("   - ProTrackOracle:", proTrackOracle.address);
  console.log("\n🔑 Test MPC Key ID:", TEST_KEY_ID_1);
  console.log("🏷️  Test Product Token ID:", testTokenId.toString());
  console.log("\n📁 Configuration saved to:", configPath);
  console.log("\n🚀 The ProTrack Supply Chain System is now ready for use!");
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
