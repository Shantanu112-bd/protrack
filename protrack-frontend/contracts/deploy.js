const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying ProTrack NFT Contract...");

  // Get the contract factory
  const ProTrackNFT = await ethers.getContractFactory("ProTrackNFT");

  // Deploy the contract
  const protrackNFT = await ProTrackNFT.deploy();
  await protrackNFT.waitForDeployment();

  const contractAddress = await protrackNFT.getAddress();
  console.log("✅ ProTrack NFT Contract deployed to:", contractAddress);

  // Verify deployment
  const totalSupply = await protrackNFT.getTotalSupply();
  console.log("📊 Initial total supply:", totalSupply.toString());

  // Mint a sample product
  console.log("🎨 Minting sample product...");
  const mintTx = await protrackNFT.mintProduct(
    await ethers.provider.getSigner().getAddress(),
    "Coffee Beans Premium",
    "Colombia",
    "BATCH-2024-001",
    "QmSampleHash123"
  );
  await mintTx.wait();

  const newTotalSupply = await protrackNFT.getTotalSupply();
  console.log("📊 New total supply:", newTotalSupply.toString());

  // Get product info
  const productInfo = await protrackNFT.getProductInfo(1);
  console.log("📦 Sample product info:", {
    name: productInfo.name,
    origin: productInfo.origin,
    batchId: productInfo.batchId,
    manufacturer: productInfo.manufacturer,
  });

  console.log("\n🎉 Deployment completed successfully!");
  console.log("📋 Contract Details:");
  console.log("   Address:", contractAddress);
  console.log(
    "   Network:",
    await ethers.provider.getNetwork().then((n) => n.name)
  );
  console.log("   Chain ID:", (await ethers.provider.getNetwork()).chainId);

  return {
    contractAddress,
    contract: protrackNFT,
  };
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
