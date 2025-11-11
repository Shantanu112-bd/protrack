const hre = require("hardhat");

async function main() {
    console.log("Deploying ProTrackMPC contract...");

    // Deploy ProTrackMPC
    const ProTrackMPC = await hre.ethers.getContractFactory("ProTrackMPC");
    const proTrackMPC = await ProTrackMPC.deploy();
    await proTrackMPC.deployed();

    console.log("ProTrackMPC deployed to:", proTrackMPC.address);

    // Setup roles
    const [deployer] = await hre.ethers.getSigners();
    
    const MANUFACTURER_ROLE = hre.ethers.utils.keccak256(
        hre.ethers.utils.toUtf8Bytes("MANUFACTURER_ROLE")
    );
    const SUPPLIER_ROLE = hre.ethers.utils.keccak256(
        hre.ethers.utils.toUtf8Bytes("SUPPLIER_ROLE")
    );
    const DISTRIBUTOR_ROLE = hre.ethers.utils.keccak256(
        hre.ethers.utils.toUtf8Bytes("DISTRIBUTOR_ROLE")
    );
    const ORACLE_ROLE = hre.ethers.utils.keccak256(
        hre.ethers.utils.toUtf8Bytes("ORACLE_ROLE")
    );

    // For testing purposes, we'll add the deployer as all roles
    // In production, you would add specific addresses for each role
    console.log("Setting up roles...");
    
    await proTrackMPC.grantRole(MANUFACTURER_ROLE, deployer.address);
    console.log("Granted MANUFACTURER_ROLE to:", deployer.address);
    
    await proTrackMPC.grantRole(SUPPLIER_ROLE, deployer.address);
    console.log("Granted SUPPLIER_ROLE to:", deployer.address);
    
    await proTrackMPC.grantRole(DISTRIBUTOR_ROLE, deployer.address);
    console.log("Granted DISTRIBUTOR_ROLE to:", deployer.address);
    
    await proTrackMPC.grantRole(ORACLE_ROLE, deployer.address);
    console.log("Granted ORACLE_ROLE to:", deployer.address);

    // Create initial test key
    const TEST_KEY_ID = hre.ethers.utils.keccak256(
        hre.ethers.utils.toUtf8Bytes("test_key")
    );
    const TEST_PUBLIC_KEY = "0x1234"; // Replace with actual public key in production
    const TEST_THRESHOLD = 1;
    const TEST_PURPOSE = hre.ethers.utils.keccak256(
        hre.ethers.utils.toUtf8Bytes("product_verification")
    );

    console.log("Creating test key...");
    await proTrackMPC.createKey(
        TEST_KEY_ID,
        TEST_PUBLIC_KEY,
        TEST_THRESHOLD,
        [deployer.address],
        TEST_PURPOSE
    );
    console.log("Test key created with ID:", TEST_KEY_ID);

    console.log("Deployment and setup completed successfully!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });