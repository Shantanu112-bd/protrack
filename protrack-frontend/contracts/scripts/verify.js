const { run, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🔍 Starting contract verification...\n");

  // Load deployment data
  const deploymentFile = path.join(__dirname, `../deployments/${network.name}-${network.config.chainId}.json`);
  
  if (!fs.existsSync(deploymentFile)) {
    console.error(`❌ Deployment file not found: ${deploymentFile}`);
    console.log("Please run deployment first: npm run deploy");
    process.exit(1);
  }

  const deploymentData = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  console.log(`📋 Verifying contracts on ${network.name} (Chain ID: ${network.config.chainId})\n`);

  try {
    // Verify ProTrackNFT
    console.log("🔍 Verifying ProTrackNFT...");
    await verifyContract(
      deploymentData.contracts.ProTrackNFT.address,
      []
    );

    // Verify SupplyChainEscrow
    console.log("\n🔍 Verifying SupplyChainEscrow...");
    await verifyContract(
      deploymentData.contracts.SupplyChainEscrow.address,
      [deploymentData.contracts.ProTrackNFT.address]
    );

    // Verify IoTOracle
    console.log("\n🔍 Verifying IoTOracle...");
    await verifyContract(
      deploymentData.contracts.IoTOracle.address,
      [deploymentData.contracts.SupplyChainEscrow.address]
    );

    // Verify SupplyChainGovernance
    console.log("\n🔍 Verifying SupplyChainGovernance...");
    await verifyContract(
      deploymentData.contracts.SupplyChainGovernance.address,
      [deploymentData.contracts.ProTrackNFT.address]
    );

    console.log("\n✅ All contracts verified successfully!");

  } catch (error) {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  }
}

async function verifyContract(contractAddress, constructorArguments) {
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: constructorArguments,
    });
    console.log(`✅ Contract verified: ${contractAddress}`);
  } catch (error) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log(`ℹ️  Contract already verified: ${contractAddress}`);
    } else {
      console.error(`❌ Verification failed for ${contractAddress}:`, error.message);
      throw error;
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
