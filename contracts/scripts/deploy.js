// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  // Deploy ProductToken contract
  const ProductToken = await hre.ethers.getContractFactory("ProductToken");
  const productToken = await ProductToken.deploy();
  await productToken.deployed();
  console.log("ProductToken deployed to:", productToken.address);

  // Deploy ProTrackRegistry contract
  const ProTrackRegistry = await hre.ethers.getContractFactory(
    "ProTrackRegistry"
  );
  const proTrackRegistry = await ProTrackRegistry.deploy();
  await proTrackRegistry.deployed();
  console.log("ProTrackRegistry deployed to:", proTrackRegistry.address);

  // Deploy MultisigGuard contract
  const MultisigGuard = await hre.ethers.getContractFactory("MultisigGuard");
  const multisigGuard = await MultisigGuard.deploy();
  await multisigGuard.deployed();
  console.log("MultisigGuard deployed to:", multisigGuard.address);

  // Deploy ProTrackOracle contract
  const ProTrackOracle = await hre.ethers.getContractFactory("ProTrackOracle");
  const proTrackOracle = await ProTrackOracle.deploy(
    "0x5FbDB2315678afecb367f032d93F642f64180aa3", // LINK token address (mock)
    "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", // Oracle address (mock)
    "0x0000000000000000000000000000000000000000000000000000000000000001", // Job ID (mock)
    hre.ethers.utils.parseEther("0.1") // Fee
  );
  await proTrackOracle.deployed();
  console.log("ProTrackOracle deployed to:", proTrackOracle.address);

  // Deploy ProTrackMPC contract
  const ProTrackMPC = await hre.ethers.getContractFactory("ProTrackMPC");
  const proTrackMPC = await ProTrackMPC.deploy();
  await proTrackMPC.deployed();
  console.log("ProTrackMPC deployed to:", proTrackMPC.address);

  // Save deployment information
  const fs = require("fs");
  const deploymentInfo = {
    network: {
      name: "localhost",
      chainId: 1337,
      rpcUrl: "http://127.0.0.1:8545",
    },
    contracts: {
      ProductToken: {
        address: productToken.address,
        deployBlock: 1,
      },
      ProTrackRegistry: {
        address: proTrackRegistry.address,
        deployBlock: 2,
      },
      MultisigGuard: {
        address: multisigGuard.address,
        deployBlock: 3,
      },
      ProTrackOracle: {
        address: proTrackOracle.address,
        deployBlock: 4,
      },
      ProTrackMPC: {
        address: proTrackMPC.address,
        deployBlock: 5,
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

  fs.writeFileSync(
    "../protrack-frontend/src/config/contracts.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("Deployment information saved to contracts.json");

  // Grant roles
  const [deployer] = await hre.ethers.getSigners();

  // Grant roles in ProTrackRegistry
  const MANUFACTURER_ROLE = hre.ethers.utils.keccak256(
    hre.ethers.utils.toUtf8Bytes("MANUFACTURER_ROLE")
  );
  const PACKAGER_ROLE = hre.ethers.utils.keccak256(
    hre.ethers.utils.toUtf8Bytes("PACKAGER_ROLE")
  );
  const TRANSPORTER_ROLE = hre.ethers.utils.keccak256(
    hre.ethers.utils.toUtf8Bytes("TRANSPORTER_ROLE")
  );
  const RETAILER_ROLE = hre.ethers.utils.keccak256(
    hre.ethers.utils.toUtf8Bytes("RETAILER_ROLE")
  );
  const ORACLE_ROLE = hre.ethers.utils.keccak256(
    hre.ethers.utils.toUtf8Bytes("ORACLE_ROLE")
  );

  await proTrackRegistry.grantRole(MANUFACTURER_ROLE, deployer.address);
  await proTrackRegistry.grantRole(PACKAGER_ROLE, deployer.address);
  await proTrackRegistry.grantRole(TRANSPORTER_ROLE, deployer.address);
  await proTrackRegistry.grantRole(RETAILER_ROLE, deployer.address);
  await proTrackRegistry.grantRole(ORACLE_ROLE, proTrackOracle.address);

  console.log("Roles granted successfully");

  console.log("Deployment completed successfully!");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
