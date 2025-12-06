// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  // Deploy the ProTrack contract
  const ProTrack = await hre.ethers.getContractFactory("ProTrack");
  const proTrack = await ProTrack.deploy();
  await proTrack.waitForDeployment();

  console.log("ProTrack deployed to:", await proTrack.getAddress());

  // Test minting a product
  const [deployer] = await hre.ethers.getSigners();

  // Grant manufacturer role to deployer for testing
  const MANUFACTURER_ROLE = await proTrack.MANUFACTURER_ROLE();
  await proTrack.grantRole(MANUFACTURER_ROLE, deployer.address);

  // Mint a test product
  const tokenId = await proTrack.mintProduct(
    "RFID123",
    "BARCODE123",
    "Test Product",
    "BATCH001",
    Math.floor(Date.now() / 1000) + 86400 * 365, // 1 year from now
    "ipfs://metadata",
    deployer.address
  );

  console.log("Minted product with tokenId:", tokenId);

  // Get the product
  const product = await proTrack.getProduct(1);
  console.log("Product details:", product);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
