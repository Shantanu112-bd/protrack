const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ProTrack", function () {
  let proTrack;
  let owner,
    manufacturer,
    packager,
    transporter,
    wholesaler,
    retailer,
    customer,
    oracle,
    inspector;
  let ADMIN_ROLE,
    MANUFACTURER_ROLE,
    PACKAGER_ROLE,
    TRANSPORTER_ROLE,
    WHOLESALER_ROLE,
    RETAILER_ROLE,
    CUSTOMER_ROLE,
    ORACLE_ROLE,
    INSPECTOR_ROLE;

  beforeEach(async function () {
    [
      owner,
      manufacturer,
      packager,
      transporter,
      wholesaler,
      retailer,
      customer,
      oracle,
      inspector,
    ] = await ethers.getSigners();

    const ProTrack = await ethers.getContractFactory("ProTrack");
    proTrack = await ProTrack.deploy();
    await proTrack.waitForDeployment();

    // Get role constants
    ADMIN_ROLE = await proTrack.ADMIN_ROLE();
    MANUFACTURER_ROLE = await proTrack.MANUFACTURER_ROLE();
    PACKAGER_ROLE = await proTrack.PACKAGER_ROLE();
    TRANSPORTER_ROLE = await proTrack.TRANSPORTER_ROLE();
    WHOLESALER_ROLE = await proTrack.WHOLESALER_ROLE();
    RETAILER_ROLE = await proTrack.RETAILER_ROLE();
    CUSTOMER_ROLE = await proTrack.CUSTOMER_ROLE();
    ORACLE_ROLE = await proTrack.ORACLE_ROLE();
    INSPECTOR_ROLE = await proTrack.INSPECTOR_ROLE();

    // Grant roles
    await proTrack.grantRole(ADMIN_ROLE, owner.address);
    await proTrack.grantRole(MANUFACTURER_ROLE, manufacturer.address);
    await proTrack.grantRole(PACKAGER_ROLE, packager.address);
    await proTrack.grantRole(TRANSPORTER_ROLE, transporter.address);
    await proTrack.grantRole(WHOLESALER_ROLE, wholesaler.address);
    await proTrack.grantRole(RETAILER_ROLE, retailer.address);
    await proTrack.grantRole(CUSTOMER_ROLE, customer.address);
    await proTrack.grantRole(ORACLE_ROLE, oracle.address);
    await proTrack.grantRole(INSPECTOR_ROLE, inspector.address);
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(await proTrack.getAddress()).to.properAddress;
    });

    it("Should set the right owner", async function () {
      expect(await proTrack.hasRole(ADMIN_ROLE, owner.address)).to.be.true;
    });
  });

  describe("Product Management", function () {
    it("Should mint a new product", async function () {
      const tokenId = await proTrack
        .connect(manufacturer)
        .callStatic.mintProduct(
          "RFID123",
          "BARCODE123",
          "Test Product",
          "BATCH001",
          Math.floor(Date.now() / 1000) + 86400 * 365, // 1 year from now
          "ipfs://metadata",
          manufacturer.address
        );

      await proTrack
        .connect(manufacturer)
        .mintProduct(
          "RFID123",
          "BARCODE123",
          "Test Product",
          "BATCH001",
          Math.floor(Date.now() / 1000) + 86400 * 365,
          "ipfs://metadata",
          manufacturer.address
        );

      expect(tokenId).to.equal(1);

      const product = await proTrack.getProduct(1);
      expect(product.rfidHash).to.equal("RFID123");
      expect(product.barcode).to.equal("BARCODE123");
      expect(product.productName).to.equal("Test Product");
      expect(product.manufacturer).to.equal(manufacturer.address);
    });

    it("Should fail to mint product with existing RFID", async function () {
      await proTrack
        .connect(manufacturer)
        .mintProduct(
          "RFID123",
          "BARCODE123",
          "Test Product",
          "BATCH001",
          Math.floor(Date.now() / 1000) + 86400 * 365,
          "ipfs://metadata",
          manufacturer.address
        );

      await expect(
        proTrack
          .connect(manufacturer)
          .mintProduct(
            "RFID123",
            "BARCODE124",
            "Test Product 2",
            "BATCH002",
            Math.floor(Date.now() / 1000) + 86400 * 365,
            "ipfs://metadata2",
            manufacturer.address
          )
      ).to.be.revertedWith("Product with this RFID already exists");
    });
  });

  describe("Supply Chain Operations", function () {
    let tokenId;

    beforeEach(async function () {
      tokenId = await proTrack
        .connect(manufacturer)
        .callStatic.mintProduct(
          "RFID123",
          "BARCODE123",
          "Test Product",
          "BATCH001",
          Math.floor(Date.now() / 1000) + 86400 * 365,
          "ipfs://metadata",
          manufacturer.address
        );

      await proTrack
        .connect(manufacturer)
        .mintProduct(
          "RFID123",
          "BARCODE123",
          "Test Product",
          "BATCH001",
          Math.floor(Date.now() / 1000) + 86400 * 365,
          "ipfs://metadata",
          manufacturer.address
        );
    });

    it("Should log packaging", async function () {
      await proTrack.connect(packager).logPackaging(tokenId, "PACK001");

      const product = await proTrack.getProduct(tokenId);
      expect(product.status).to.equal(1); // PACKAGED
    });

    it("Should request shipment", async function () {
      await proTrack.connect(packager).logPackaging(tokenId, "PACK001");

      const shipmentId = await proTrack
        .connect(transporter)
        .callStatic.requestShipment(
          tokenId,
          wholesaler.address,
          "TEMPKEY123",
          "TRACK123"
        );

      await proTrack
        .connect(transporter)
        .requestShipment(tokenId, wholesaler.address, "TEMPKEY123", "TRACK123");

      expect(shipmentId).to.equal(1);

      const shipment = await proTrack.getShipment(shipmentId);
      expect(shipment.toParty).to.equal(wholesaler.address);
      expect(shipment.status).to.equal(0); // REQUESTED
    });
  });

  describe("IoT Data", function () {
    let tokenId;

    beforeEach(async function () {
      tokenId = await proTrack
        .connect(manufacturer)
        .callStatic.mintProduct(
          "RFID123",
          "BARCODE123",
          "Test Product",
          "BATCH001",
          Math.floor(Date.now() / 1000) + 86400 * 365,
          "ipfs://metadata",
          manufacturer.address
        );

      await proTrack
        .connect(manufacturer)
        .mintProduct(
          "RFID123",
          "BARCODE123",
          "Test Product",
          "BATCH001",
          Math.floor(Date.now() / 1000) + 86400 * 365,
          "ipfs://metadata",
          manufacturer.address
        );
    });

    it("Should record IoT data", async function () {
      await proTrack.connect(oracle).recordIoT(
        tokenId,
        0, // TEMPERATURE
        25,
        "°C",
        "40.7128,-74.0060",
        "ipfs://iotdata"
      );

      const iotData = await proTrack.getIoTData(tokenId);
      expect(iotData.length).to.equal(1);
      expect(iotData[0].sensorType).to.equal(0); // TEMPERATURE
      expect(iotData[0].value).to.equal(25);
    });
  });

  describe("Access Control", function () {
    it("Should only allow manufacturer to mint products", async function () {
      await expect(
        proTrack
          .connect(packager)
          .mintProduct(
            "RFID123",
            "BARCODE123",
            "Test Product",
            "BATCH001",
            Math.floor(Date.now() / 1000) + 86400 * 365,
            "ipfs://metadata",
            manufacturer.address
          )
      ).to.be.reverted;

      // But manufacturer should be able to do it
      await expect(
        proTrack
          .connect(manufacturer)
          .mintProduct(
            "RFID123",
            "BARCODE123",
            "Test Product",
            "BATCH001",
            Math.floor(Date.now() / 1000) + 86400 * 365,
            "ipfs://metadata",
            manufacturer.address
          )
      ).to.not.be.reverted;
    });
  });
});
