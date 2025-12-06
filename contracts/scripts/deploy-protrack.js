const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying ProTrack contract...");

  // Get the contract factory
  const ProTrack = await ethers.getContractFactory("ProTrack");

  // Deploy the contract
  const proTrack = await ProTrack.deploy();

  await proTrack.deployed();

  console.log("ProTrack deployed to:", proTrack.address);

  // Grant roles to deployer
  const [deployer] = await ethers.getSigners();
  console.log("Granting roles to deployer:", deployer.address);

  // Grant all roles to deployer for testing
  const ADMIN_ROLE = await proTrack.ADMIN_ROLE();
  const MANUFACTURER_ROLE = await proTrack.MANUFACTURER_ROLE();
  const PACKAGER_ROLE = await proTrack.PACKAGER_ROLE();
  const TRANSPORTER_ROLE = await proTrack.TRANSPORTER_ROLE();
  const WHOLESALER_ROLE = await proTrack.WHOLESALER_ROLE();
  const RETAILER_ROLE = await proTrack.RETAILER_ROLE();
  const CUSTOMER_ROLE = await proTrack.CUSTOMER_ROLE();
  const ORACLE_ROLE = await proTrack.ORACLE_ROLE();
  const INSPECTOR_ROLE = await proTrack.INSPECTOR_ROLE();

  await proTrack.grantRole(ADMIN_ROLE, deployer.address);
  await proTrack.grantRole(MANUFACTURER_ROLE, deployer.address);
  await proTrack.grantRole(PACKAGER_ROLE, deployer.address);
  await proTrack.grantRole(TRANSPORTER_ROLE, deployer.address);
  await proTrack.grantRole(WHOLESALER_ROLE, deployer.address);
  await proTrack.grantRole(RETAILER_ROLE, deployer.address);
  await proTrack.grantRole(CUSTOMER_ROLE, deployer.address);
  await proTrack.grantRole(ORACLE_ROLE, deployer.address);
  await proTrack.grantRole(INSPECTOR_ROLE, deployer.address);

  console.log("Roles granted successfully!");

  // Save the contract address
  const fs = require("fs");
  const deploymentInfo = {
    contractAddress: proTrack.address,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync("deployments.json", JSON.stringify(deploymentInfo, null, 2));

  console.log("Deployment info saved to deployments.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
