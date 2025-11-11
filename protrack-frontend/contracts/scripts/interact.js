const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🔧 ProTrack Smart Contracts Interaction Script\n");

  const [deployer, user1, user2] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  // Load deployment data
  const deploymentFile = path.join(__dirname, `../deployments/${network.name}-${network.chainId}.json`);
  
  if (!fs.existsSync(deploymentFile)) {
    console.error(`❌ Deployment file not found: ${deploymentFile}`);
    console.log("Please run deployment first: npm run deploy");
    process.exit(1);
  }

  const deploymentData = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  
  // Get contract instances
  const proTrackNFT = await ethers.getContractAt("ProTrackNFT", deploymentData.contracts.ProTrackNFT.address);
  const supplyChainEscrow = await ethers.getContractAt("SupplyChainEscrow", deploymentData.contracts.SupplyChainEscrow.address);
  const iotOracle = await ethers.getContractAt("IoTOracle", deploymentData.contracts.IoTOracle.address);
  const supplyChainGovernance = await ethers.getContractAt("SupplyChainGovernance", deploymentData.contracts.SupplyChainGovernance.address);

  console.log("📋 Contract Addresses:");
  console.log(`ProTrackNFT: ${await proTrackNFT.getAddress()}`);
  console.log(`SupplyChainEscrow: ${await supplyChainEscrow.getAddress()}`);
  console.log(`IoTOracle: ${await iotOracle.getAddress()}`);
  console.log(`SupplyChainGovernance: ${await supplyChainGovernance.getAddress()}\n`);

  try {
    // Demo 1: Mint a product NFT
    console.log("🎯 Demo 1: Minting Product NFT");
    const productData = {
      name: "Premium Coffee Beans",
      sku: "COFFEE-PREM-001",
      manufacturer: deployer.address,
      createdAt: Math.floor(Date.now() / 1000),
      batchId: `BATCH-${Date.now()}`,
      category: "Food",
      expiryDate: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // 1 year
      isActive: true,
      currentValue: ethers.parseEther("0.5"),
      currentLocation: "Coffee Farm, Colombia"
    };

    const tokenURI = `https://ipfs.io/ipfs/QmDemo${productData.batchId}`;
    const mintTx = await proTrackNFT.mintProduct(deployer.address, tokenURI, productData);
    const mintReceipt = await mintTx.wait();
    
    // Extract token ID from events
    const mintEvent = mintReceipt.logs?.find(log => {
      try {
        const parsed = proTrackNFT.interface.parseLog(log);
        return parsed.name === 'ProductMinted';
      } catch {
        return false;
      }
    });
    const tokenId = mintEvent ? proTrackNFT.interface.parseLog(mintEvent).args.tokenId : 1n;
    
    console.log(`✅ Minted NFT with Token ID: ${tokenId}`);
    console.log(`   Batch ID: ${productData.batchId}`);
    console.log(`   Transaction: ${mintTx.hash}\n`);

    // Demo 2: Add supply chain events
    console.log("🎯 Demo 2: Adding Supply Chain Events");
    const events = [
      {
        eventType: "HARVESTED",
        description: "Coffee beans harvested from organic farm",
        location: "Coffee Farm, Colombia",
        data: JSON.stringify({ quality: "Premium", weight: "1000kg" })
      },
      {
        eventType: "PROCESSED",
        description: "Beans processed and roasted",
        location: "Processing Plant, Colombia",
        data: JSON.stringify({ roastLevel: "Medium", temperature: "220C" })
      },
      {
        eventType: "SHIPPED",
        description: "Shipped to distribution center",
        location: "Port of Cartagena",
        data: JSON.stringify({ vessel: "MV Coffee Express", eta: "2024-01-15" })
      }
    ];

    for (const event of events) {
      const eventTx = await proTrackNFT.addSupplyChainEvent(
        tokenId,
        event.eventType,
        event.description,
        event.location,
        event.data
      );
      await eventTx.wait();
      console.log(`✅ Added event: ${event.eventType} at ${event.location}`);
    }
    console.log();

    // Demo 3: Register IoT device and submit data
    console.log("🎯 Demo 3: IoT Data Submission");
    const deviceId = `IOT_DEVICE_${Date.now()}`;
    
    // Register device
    await iotOracle.registerDevice(
      deviceId,
      deployer.address,
      [0, 1], // TEMPERATURE, HUMIDITY
      "Shipping Container",
      "Temperature and humidity monitoring during transport"
    );
    console.log(`✅ Registered IoT device: ${deviceId}`);

    // Submit sensor data
    const sensorData = [
      { sensorType: 0, value: 18, unit: "°C", location: "Container A1" }, // TEMPERATURE
      { sensorType: 1, value: 65, unit: "%", location: "Container A1" },  // HUMIDITY
      { sensorType: 0, value: 19, unit: "°C", location: "Container A1" }, // TEMPERATURE
    ];

    for (const data of sensorData) {
      const dataTx = await iotOracle.submitDataPoint(
        deviceId,
        data.sensorType,
        data.value,
        data.unit,
        data.location,
        `Sensor reading at ${new Date().toISOString()}`
      );
      const dataReceipt = await dataTx.wait();
      console.log(`✅ Submitted ${data.sensorType === 0 ? 'temperature' : 'humidity'} data: ${data.value}${data.unit}`);
    }
    console.log();

    // Demo 4: Create escrow with SLA conditions
    console.log("🎯 Demo 4: Creating Escrow with SLA");
    const escrowAmount = ethers.parseEther("1.0");
    const expectedDeliveryTime = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days
    
    const escrowTx = await supplyChainEscrow.connect(user1).createEscrow(
      tokenId,
      deployer.address, // seller
      expectedDeliveryTime,
      "New York Distribution Center",
      true, // auto-release
      { value: escrowAmount }
    );
    const escrowReceipt = await escrowTx.wait();
    
    // Extract escrow ID from events
    const escrowEvent = escrowReceipt.logs?.find(log => {
      try {
        const parsed = supplyChainEscrow.interface.parseLog(log);
        return parsed.name === 'EscrowCreated';
      } catch {
        return false;
      }
    });
    const escrowId = escrowEvent ? supplyChainEscrow.interface.parseLog(escrowEvent).args.escrowId : 1n;
    
    console.log(`✅ Created escrow with ID: ${escrowId}`);
    console.log(`   Amount: ${ethers.formatEther(escrowAmount)} ETH`);
    console.log(`   Buyer: ${user1.address}`);
    console.log(`   Seller: ${deployer.address}\n`);

    // Add SLA conditions
    await supplyChainEscrow.connect(user1).addSLACondition(
      escrowId,
      "temperature",
      -5, // min -5°C
      25, // max 25°C
      500 // 5% penalty
    );
    console.log("✅ Added temperature SLA condition (-5°C to 25°C, 5% penalty)");

    await supplyChainEscrow.connect(user1).addSLACondition(
      escrowId,
      "humidity",
      30, // min 30%
      80, // max 80%
      300 // 3% penalty
    );
    console.log("✅ Added humidity SLA condition (30% to 80%, 3% penalty)\n");

    // Demo 5: Quality check
    console.log("🎯 Demo 5: Quality Check");
    const qualityCheckTx = await proTrackNFT.addQualityCheck(
      tokenId,
      "Organic Certification",
      true, // passed
      "Product meets all organic certification requirements",
      ["pH: 6.5", "Moisture: 12%", "Defects: <2%"]
    );
    await qualityCheckTx.wait();
    console.log("✅ Added quality check: Organic Certification (PASSED)\n");

    // Demo 6: Create governance proposal
    console.log("🎯 Demo 6: Governance Proposal");
    const proposalTx = await supplyChainGovernance.proposeQualityStandardUpdate(
      "Organic Coffee Standard",
      "Updated requirements for organic coffee certification including new sustainability metrics",
      Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // effective in 30 days
      ["Coffee", "Beverages"]
    );
    const proposalReceipt = await proposalTx.wait();
    
    const proposalEvent = proposalReceipt.logs?.find(log => {
      try {
        const parsed = supplyChainGovernance.interface.parseLog(log);
        return parsed.name === 'ProposalCreated';
      } catch {
        return false;
      }
    });
    const proposalId = proposalEvent ? supplyChainGovernance.interface.parseLog(proposalEvent).args.proposalId : 1n;
    
    console.log(`✅ Created governance proposal with ID: ${proposalId}`);
    console.log("   Type: Quality Standard Update");
    console.log("   Standard: Organic Coffee Standard\n");

    // Demo 7: Display contract statistics
    console.log("📊 Contract Statistics:");
    console.log("=" .repeat(40));
    
    const totalNFTs = await proTrackNFT.getCurrentTokenId ? await proTrackNFT.getCurrentTokenId() : "N/A";
    const totalDevices = await iotOracle.getDeviceCount();
    const totalDataPoints = await iotOracle.getTotalDataPoints();
    const currentEscrowId = await supplyChainEscrow.getCurrentEscrowId();
    const currentProposalId = await supplyChainGovernance.getCurrentProposalId();
    
    console.log(`Total NFTs minted: ${totalNFTs}`);
    console.log(`IoT devices registered: ${totalDevices}`);
    console.log(`Data points submitted: ${totalDataPoints}`);
    console.log(`Escrows created: ${currentEscrowId}`);
    console.log(`Governance proposals: ${currentProposalId}`);
    console.log("=" .repeat(40));

    console.log("\n✅ All demos completed successfully!");
    console.log("🎉 ProTrack smart contracts are fully functional!");

  } catch (error) {
    console.error("❌ Demo failed:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
