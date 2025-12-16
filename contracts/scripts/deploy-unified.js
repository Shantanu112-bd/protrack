// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  // Deploy the unified ProTrack contract
  const ProTrack = await hre.ethers.getContractFactory("UnifiedProTrack");
  const proTrack = await ProTrack.deploy();
  await proTrack.waitForDeployment();
  const proTrackAddress = await proTrack.getAddress();
  console.log("Unified ProTrack deployed to:", proTrackAddress);

  // Save deployment information
  const fs = require("fs");
  const deploymentInfo = {
    network: {
      name: "localhost",
      chainId: 1337,
      rpcUrl: "http://127.0.0.1:8545",
    },
    contracts: {
      ProTrack: {
        address: proTrackAddress,
        deployBlock: 1,
      },
    },
    demo: {
      testTokenId: 1,
      testRfid: "RFID-TEST-001",
      testBarcode: "BARCODE-TEST-12345",
      testProductName: "Test Organic Coffee Beans",
      devices: ["TEMP_SENSOR_001", "HUM_SENSOR_002", "GPS_TRACKER_003"],
    },
  };

  fs.writeFileSync(
    "../protrack-frontend/src/config/contracts.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("Deployment information saved to contracts.json");

  // Grant roles
  const [deployer] = await hre.ethers.getSigners();

  // Define role constants (must match the contract)
  const ADMIN_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("ADMIN_ROLE"));
  const MANUFACTURER_ROLE = hre.ethers.keccak256(
    hre.ethers.toUtf8Bytes("MANUFACTURER_ROLE")
  );
  const PACKAGER_ROLE = hre.ethers.keccak256(
    hre.ethers.toUtf8Bytes("PACKAGER_ROLE")
  );
  const TRANSPORTER_ROLE = hre.ethers.keccak256(
    hre.ethers.toUtf8Bytes("TRANSPORTER_ROLE")
  );
  const WHOLESALER_ROLE = hre.ethers.keccak256(
    hre.ethers.toUtf8Bytes("WHOLESALER_ROLE")
  );
  const RETAILER_ROLE = hre.ethers.keccak256(
    hre.ethers.toUtf8Bytes("RETAILER_ROLE")
  );
  const CUSTOMER_ROLE = hre.ethers.keccak256(
    hre.ethers.toUtf8Bytes("CUSTOMER_ROLE")
  );
  const ORACLE_ROLE = hre.ethers.keccak256(
    hre.ethers.toUtf8Bytes("ORACLE_ROLE")
  );
  const INSPECTOR_ROLE = hre.ethers.keccak256(
    hre.ethers.toUtf8Bytes("INSPECTOR_ROLE")
  );

  // Grant all roles to deployer for testing
  await proTrack.grantRole(ADMIN_ROLE, deployer.address);
  await proTrack.grantRole(MANUFACTURER_ROLE, deployer.address);
  await proTrack.grantRole(PACKAGER_ROLE, deployer.address);
  await proTrack.grantRole(TRANSPORTER_ROLE, deployer.address);
  await proTrack.grantRole(WHOLESALER_ROLE, deployer.address);
  await proTrack.grantRole(RETAILER_ROLE, deployer.address);
  await proTrack.grantRole(CUSTOMER_ROLE, deployer.address);
  await proTrack.grantRole(ORACLE_ROLE, deployer.address);
  await proTrack.grantRole(INSPECTOR_ROLE, deployer.address);

  console.log("All roles granted successfully");

  console.log("Unified ProTrack deployment completed successfully!");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
