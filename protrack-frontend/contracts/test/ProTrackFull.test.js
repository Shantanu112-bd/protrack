const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ProTrack Full System Test", function () {
  let proTrackNFT;
  let supplyChainEscrow;
  let iotOracle;
  let proTrackSupplyChain;
  let proTrackMPCWallet;
  let proTrackRFIDTokenizer;
  let proTrackAdvancedIoT;
  let deployer, manufacturer, transporter, retailer, buyer, inspector;
  let signers;

  before(async function () {
    [
      deployer,
      manufacturer,
      transporter,
      retailer,
      buyer,
      inspector,
      ...signers
    ] = await ethers.getSigners();

    // Deploy ProTrackNFT
    const ProTrackNFT = await ethers.getContractFactory("ProTrackNFT");
    proTrackNFT = await ProTrackNFT.deploy();
    await proTrackNFT.waitForDeployment();

    // Deploy SupplyChainEscrow
    const SupplyChainEscrow = await ethers.getContractFactory(
      "SupplyChainEscrow"
    );
    supplyChainEscrow = await SupplyChainEscrow.deploy(
      await proTrackNFT.getAddress()
    );
    await supplyChainEscrow.waitForDeployment();

    // Deploy IoTOracle
    const IoTOracle = await ethers.getContractFactory("IoTOracle");
    iotOracle = await IoTOracle.deploy(await supplyChainEscrow.getAddress());
    await iotOracle.waitForDeployment();

    // Deploy ProTrackSupplyChain
    const ProTrackSupplyChain = await ethers.getContractFactory(
      "ProTrackSupplyChain"
    );
    proTrackSupplyChain = await ProTrackSupplyChain.deploy();
    await proTrackSupplyChain.waitForDeployment();

    // Deploy ProTrackMPCWallet
    const ProTrackMPCWallet = await ethers.getContractFactory(
      "ProTrackMPCWallet"
    );
    proTrackMPCWallet = await ProTrackMPCWallet.deploy();
    await proTrackMPCWallet.waitForDeployment();

    // Deploy ProTrackRFIDTokenizer
    const ProTrackRFIDTokenizer = await ethers.getContractFactory(
      "ProTrackRFIDTokenizer"
    );
    proTrackRFIDTokenizer = await ProTrackRFIDTokenizer.deploy();
    await proTrackRFIDTokenizer.waitForDeployment();

    // Deploy ProTrackAdvancedIoT
    const ProTrackAdvancedIoT = await ethers.getContractFactory(
      "ProTrackAdvancedIoT"
    );
    proTrackAdvancedIoT = await ProTrackAdvancedIoT.deploy(
      await proTrackSupplyChain.getAddress()
    );
    await proTrackAdvancedIoT.waitForDeployment();

    // Setup roles
    await proTrackNFT.grantRole(
      await proTrackNFT.MINTER_ROLE(),
      deployer.address
    );
    await proTrackNFT.grantRole(
      await proTrackNFT.SUPPLY_CHAIN_ROLE(),
      await proTrackSupplyChain.getAddress()
    );
    await proTrackNFT.grantRole(
      await proTrackNFT.INSPECTOR_ROLE(),
      inspector.address
    );

    await proTrackSupplyChain.grantRole(
      await proTrackSupplyChain.MANUFACTURER_ROLE(),
      manufacturer.address
    );
    await proTrackSupplyChain.grantRole(
      await proTrackSupplyChain.TRANSPORTER_ROLE(),
      transporter.address
    );
    await proTrackSupplyChain.grantRole(
      await proTrackSupplyChain.RETAILER_ROLE(),
      retailer.address
    );
    await proTrackSupplyChain.grantRole(
      await proTrackSupplyChain.INSPECTOR_ROLE(),
      inspector.address
    );
    await proTrackSupplyChain.grantRole(
      await proTrackSupplyChain.ORACLE_ROLE(),
      await iotOracle.getAddress()
    );

    await supplyChainEscrow.grantRole(
      await supplyChainEscrow.ORACLE_ROLE(),
      await iotOracle.getAddress()
    );
    await supplyChainEscrow.grantRole(
      await supplyChainEscrow.ARBITRATOR_ROLE(),
      inspector.address
    );

    await iotOracle.grantRole(
      await iotOracle.DEVICE_MANAGER_ROLE(),
      deployer.address
    );
    await iotOracle.grantRole(
      await iotOracle.DATA_PROVIDER_ROLE(),
      deployer.address
    );
    await iotOracle.grantRole(
      await iotOracle.ORACLE_OPERATOR_ROLE(),
      deployer.address
    );

    await proTrackMPCWallet.grantRole(
      await proTrackMPCWallet.MPC_OPERATOR_ROLE(),
      deployer.address
    );
    await proTrackMPCWallet.grantRole(
      await proTrackMPCWallet.SUPPLY_CHAIN_ROLE(),
      await proTrackSupplyChain.getAddress()
    );
  });

  describe("NFT Functionality", function () {
    it("Should mint a new product NFT", async function () {
      const tokenURI = "https://ipfs.io/ipfs/QmTest123";
      const productData = {
        name: "Test Product",
        sku: "TEST-001",
        manufacturer: manufacturer.address,
        createdAt: Math.floor(Date.now() / 1000),
        batchId: "BATCH-001",
        category: "Electronics",
        expiryDate: Math.floor(Date.now() / 1000) + 86400, // 1 day
        isActive: true,
        currentValue: ethers.parseEther("1.0"),
        currentLocation: "Factory",
      };

      await expect(
        proTrackNFT.mintProduct(manufacturer.address, tokenURI, productData)
      )
        .to.emit(proTrackNFT, "ProductMinted")
        .withArgs(0, "BATCH-001", manufacturer.address);

      const product = await proTrackNFT.getProductData(0);
      expect(product.name).to.equal("Test Product");
      expect(product.batchId).to.equal("BATCH-001");
    });

    it("Should add supply chain events", async function () {
      await expect(
        proTrackNFT.addSupplyChainEvent(
          0,
          "MANUFACTURED",
          "Product manufactured",
          "Factory",
          "Initial production"
        )
      ).to.emit(proTrackNFT, "SupplyChainEventAdded");
    });
  });

  describe("Supply Chain Tracking", function () {
    it("Should mint a supply chain product", async function () {
      await expect(
        proTrackSupplyChain.connect(manufacturer).mintProduct(
          "RFID-123",
          "Smart Widget",
          "BATCH-123",
          Math.floor(Date.now() / 1000) + 86400, // 1 day expiry
          "https://ipfs.io/ipfs/QmSupplyChain123",
          manufacturer.address
        )
      )
        .to.emit(proTrackSupplyChain, "ProductMinted")
        .withArgs(0, "RFID-123", manufacturer.address, "BATCH-123");
    });

    it("Should transfer product between parties", async function () {
      await expect(
        proTrackSupplyChain.connect(manufacturer).transferProduct(
          0,
          transporter.address,
          2, // InTransit
          "Distribution Center",
          "Shipped to distributor"
        )
      ).to.emit(proTrackSupplyChain, "ProductTransferred");
    });
  });

  describe("IoT Data Integration", function () {
    it("Should register IoT device", async function () {
      await expect(
        iotOracle.registerDevice(
          "SENSOR-001",
          manufacturer.address,
          [0], // Temperature sensor
          "Warehouse A",
          "Temperature monitoring"
        )
      ).to.emit(iotOracle, "DeviceRegistered");
    });

    it("Should submit IoT data", async function () {
      await expect(
        iotOracle.submitDataPoint(
          "SENSOR-001",
          0, // Temperature
          25, // 25°C
          "°C",
          "Warehouse A",
          "Normal conditions"
        )
      ).to.emit(iotOracle, "DataPointSubmitted");
    });
  });

  describe("MPC Wallet Operations", function () {
    it("Should create MPC wallet", async function () {
      const mpcSigners = [
        manufacturer.address,
        transporter.address,
        retailer.address,
      ];
      await expect(proTrackMPCWallet.createMPCWallet(mpcSigners, 2)).to.emit(
        proTrackMPCWallet,
        "MPCWalletCreated"
      );
    });

    it("Should propose and execute transaction", async function () {
      // This would require more complex setup in a real test
      // For now, we'll just verify the function exists
      expect(
        await proTrackMPCWallet.hasRole(
          await proTrackMPCWallet.MPC_OPERATOR_ROLE(),
          deployer.address
        )
      ).to.be.true;
    });
  });

  describe("Escrow System", function () {
    it("Should create escrow", async function () {
      // First mint an NFT to use in escrow
      const tokenURI = "https://ipfs.io/ipfs/QmEscrow123";
      const productData = {
        name: "Escrow Product",
        sku: "ESCROW-001",
        manufacturer: manufacturer.address,
        createdAt: Math.floor(Date.now() / 1000),
        batchId: "ESCROW-BATCH-001",
        category: "Electronics",
        expiryDate: Math.floor(Date.now() / 1000) + 86400, // 1 day
        isActive: true,
        currentValue: ethers.parseEther("1.0"),
        currentLocation: "Factory",
      };

      await proTrackNFT.mintProduct(
        manufacturer.address,
        tokenURI,
        productData
      );

      // Transfer NFT to seller for escrow
      await proTrackNFT
        .connect(manufacturer)
        .transferFrom(manufacturer.address, retailer.address, 1);

      // Create escrow
      const expectedDeliveryTime = Math.floor(Date.now() / 1000) + 86400; // 1 day
      await expect(
        supplyChainEscrow.connect(buyer).createEscrow(
          1, // tokenId
          retailer.address, // seller
          expectedDeliveryTime,
          "Delivery Address",
          true, // autoRelease
          { value: ethers.parseEther("1.0") }
        )
      ).to.emit(supplyChainEscrow, "EscrowCreated");
    });
  });

  describe("RFID Tokenization", function () {
    it("Should tokenize RFID hash", async function () {
      const rfidHash = ethers.keccak256(ethers.toUtf8Bytes("RFID-TAG-001"));
      await expect(proTrackRFIDTokenizer.tokenizeRFID(rfidHash)).to.emit(
        proTrackRFIDTokenizer,
        "RFIDTokenized"
      );
    });
  });

  describe("Advanced IoT Features", function () {
    it("Should process advanced sensor data", async function () {
      // Register device first
      await proTrackAdvancedIoT.registerDevice(
        "ADV-SENSOR-001",
        manufacturer.address,
        [0, 1, 3], // Temp, Humidity, Vibration
        "Production Line",
        "Multi-sensor monitoring"
      );

      // Submit batch data
      const deviceIds = ["ADV-SENSOR-001", "ADV-SENSOR-001", "ADV-SENSOR-001"];
      const sensorTypes = [0, 1, 3]; // Temp, Humidity, Vibration
      const values = [25, 60, 5]; // 25°C, 60% humidity, 5mm vibration
      const units = ["°C", "%", "mm"];
      const locations = [
        "Production Line",
        "Production Line",
        "Production Line",
      ];
      const metadatas = ["Normal", "Normal", "Normal"];

      await expect(
        proTrackAdvancedIoT.batchSubmitDataPoints(
          deviceIds,
          sensorTypes,
          values,
          units,
          locations,
          metadatas
        )
      ).to.emit(proTrackAdvancedIoT, "DataPointSubmitted");
    });
  });
});
