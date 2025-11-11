const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ProTrackRegistry", function () {
  let proTrackRegistry;
  let owner;
  let manufacturer;
  let packager;
  let transporter;
  let retailer;
  let oracle;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [
      owner,
      manufacturer,
      packager,
      transporter,
      retailer,
      oracle,
      addr1,
      addr2,
    ] = await ethers.getSigners();

    const ProTrackRegistry = await ethers.getContractFactory(
      "ProTrackRegistry"
    );
    proTrackRegistry = await ProTrackRegistry.deploy();
    await proTrackRegistry.deployed();

    // Grant roles
    const MANUFACTURER_ROLE = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes("MANUFACTURER_ROLE")
    );
    const PACKAGER_ROLE = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes("PACKAGER_ROLE")
    );
    const TRANSPORTER_ROLE = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes("TRANSPORTER_ROLE")
    );
    const RETAILER_ROLE = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes("RETAILER_ROLE")
    );
    const ORACLE_ROLE = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes("ORACLE_ROLE")
    );

    await proTrackRegistry
      .connect(owner)
      .grantRole(MANUFACTURER_ROLE, manufacturer.address);
    await proTrackRegistry
      .connect(owner)
      .grantRole(PACKAGER_ROLE, packager.address);
    await proTrackRegistry
      .connect(owner)
      .grantRole(TRANSPORTER_ROLE, transporter.address);
    await proTrackRegistry
      .connect(owner)
      .grantRole(RETAILER_ROLE, retailer.address);
    await proTrackRegistry
      .connect(owner)
      .grantRole(ORACLE_ROLE, oracle.address);
  });

  describe("Product Management", function () {
    it("Should mint a new product", async function () {
      const rfidHash = "RFID123456789";
      const productName = "Test Product";
      const batchId = "BATCH001";
      const expiryDate = Math.floor(Date.now() / 1000) + 86400 * 365; // 1 year from now
      const metadataURI = "ipfs://QmTest123";

      await expect(
        proTrackRegistry
          .connect(manufacturer)
          .mintProduct(
            rfidHash,
            productName,
            batchId,
            expiryDate,
            metadataURI,
            manufacturer.address
          )
      )
        .to.emit(proTrackRegistry, "ProductMinted")
        .withArgs(1, rfidHash, manufacturer.address, productName);

      const product = await proTrackRegistry.getProduct(1);
      expect(product.rfidHash).to.equal(rfidHash);
      expect(product.productName).to.equal(productName);
      expect(product.batchId).to.equal(batchId);
      expect(product.manufacturer).to.equal(manufacturer.address);
    });

    it("Should fail to mint product with existing RFID", async function () {
      const rfidHash = "RFID123456789";
      const productName = "Test Product";
      const batchId = "BATCH001";
      const expiryDate = Math.floor(Date.now() / 1000) + 86400 * 365;
      const metadataURI = "ipfs://QmTest123";

      await proTrackRegistry
        .connect(manufacturer)
        .mintProduct(
          rfidHash,
          productName,
          batchId,
          expiryDate,
          metadataURI,
          manufacturer.address
        );

      await expect(
        proTrackRegistry
          .connect(manufacturer)
          .mintProduct(
            rfidHash,
            "Another Product",
            "BATCH002",
            expiryDate,
            metadataURI,
            manufacturer.address
          )
      ).to.be.revertedWith("Product with this RFID already exists");
    });
  });

  describe("Product Lifecycle", function () {
    let tokenId;

    beforeEach(async function () {
      const rfidHash = "RFID123456789";
      const productName = "Test Product";
      const batchId = "BATCH001";
      const expiryDate = Math.floor(Date.now() / 1000) + 86400 * 365;
      const metadataURI = "ipfs://QmTest123";

      const tx = await proTrackRegistry
        .connect(manufacturer)
        .mintProduct(
          rfidHash,
          productName,
          batchId,
          expiryDate,
          metadataURI,
          manufacturer.address
        );

      const receipt = await tx.wait();
      tokenId = receipt.events.find((event) => event.event === "ProductMinted")
        .args.tokenId;
    });

    it("Should log packaging event", async function () {
      const batchURI = "ipfs://QmBatch123";

      await expect(
        proTrackRegistry.connect(packager).logPackaging(tokenId, batchURI)
      )
        .to.emit(proTrackRegistry, "ProductPackaged")
        .withArgs(tokenId, batchURI);

      const product = await proTrackRegistry.getProduct(tokenId);
      expect(product.status).to.equal(1); // PACKAGED
    });

    it("Should request shipment", async function () {
      // First package the product
      await proTrackRegistry
        .connect(packager)
        .logPackaging(tokenId, "ipfs://QmBatch123");

      const tempKeyId = "TEMP_KEY_001";

      await expect(
        proTrackRegistry
          .connect(transporter)
          .requestShipment(tokenId, retailer.address, tempKeyId)
      ).to.emit(proTrackRegistry, "ShipmentRequested");

      const shipmentId = 1;
      const shipment = await proTrackRegistry.getShipment(shipmentId);
      expect(shipment.productId).to.equal(tokenId);
      expect(shipment.toParty).to.equal(retailer.address);
      expect(shipment.tempKeyId).to.equal(tempKeyId);
    });
  });

  describe("IoT Data", function () {
    let tokenId;

    beforeEach(async function () {
      const rfidHash = "RFID123456789";
      const productName = "Test Product";
      const batchId = "BATCH001";
      const expiryDate = Math.floor(Date.now() / 1000) + 86400 * 365;
      const metadataURI = "ipfs://QmTest123";

      const tx = await proTrackRegistry
        .connect(manufacturer)
        .mintProduct(
          rfidHash,
          productName,
          batchId,
          expiryDate,
          metadataURI,
          manufacturer.address
        );

      const receipt = await tx.wait();
      tokenId = receipt.events.find((event) => event.event === "ProductMinted")
        .args.tokenId;
    });

    it("Should record IoT data", async function () {
      const ipfsCID = "QmIoTData123";

      await expect(proTrackRegistry.connect(oracle).recordIoT(tokenId, ipfsCID))
        .to.emit(proTrackRegistry, "IoTDataRecorded")
        .withArgs(tokenId, ipfsCID, await ethers.provider.getBlockNumber());

      const iotData = await proTrackRegistry.getIoTData(tokenId);
      expect(iotData.length).to.equal(1);
      expect(iotData[0].ipfsCID).to.equal(ipfsCID);
    });
  });

  describe("Custody Transfer", function () {
    let tokenId;

    beforeEach(async function () {
      const rfidHash = "RFID123456789";
      const productName = "Test Product";
      const batchId = "BATCH001";
      const expiryDate = Math.floor(Date.now() / 1000) + 86400 * 365;
      const metadataURI = "ipfs://QmTest123";

      const tx = await proTrackRegistry
        .connect(manufacturer)
        .mintProduct(
          rfidHash,
          productName,
          batchId,
          expiryDate,
          metadataURI,
          manufacturer.address
        );

      const receipt = await tx.wait();
      tokenId = receipt.events.find((event) => event.event === "ProductMinted")
        .args.tokenId;
    });

    it("Should transfer custody", async function () {
      const newLocation = "Warehouse A";

      await expect(
        proTrackRegistry
          .connect(manufacturer)
          .transferCustody(tokenId, addr1.address, newLocation)
      )
        .to.emit(proTrackRegistry, "CustodyTransferred")
        .withArgs(tokenId, manufacturer.address, addr1.address, newLocation);

      const product = await proTrackRegistry.getProduct(tokenId);
      expect(product.currentCustodian).to.equal(addr1.address);
      expect(product.currentLocation).to.equal(newLocation);
    });
  });
});
