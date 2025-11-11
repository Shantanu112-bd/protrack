const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ProTrackToken", function () {
  let ProTrackToken;
  let contract;
  let owner;
  let manufacturer;
  let minter;
  let admin;
  let addrs;

  beforeEach(async function () {
    [owner, manufacturer, minter, admin, ...addrs] = await ethers.getSigners();

    ProTrackToken = await ethers.getContractFactory("ProTrackToken");
    contract = await ProTrackToken.deploy();
    await contract.deployed();

    // Setup roles
    const MINTER_ROLE = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes("MINTER_ROLE")
    );
    const ADMIN_ROLE = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes("ADMIN_ROLE")
    );

    await contract.grantRole(MINTER_ROLE, minter.address);
    await contract.grantRole(ADMIN_ROLE, admin.address);
  });

  describe("Product Management", function () {
    it("Should create a product with valid parameters", async function () {
      const name = "Test Product";
      const description = "Test Description";
      const tokenURI = "https://example.com/token/1";

      const tx = await contract
        .connect(minter)
        .createProduct(name, description, tokenURI);
      const receipt = await tx.wait();

      const event = receipt.events.find((e) => e.event === "ProductCreated");
      expect(event).to.not.be.undefined;

      const tokenId = event.args.tokenId;
      expect(tokenId).to.equal(1);

      // Verify product details
      const product = await contract.getProduct(tokenId);
      expect(product.name).to.equal(name);
      expect(product.description).to.equal(description);
      expect(product.manufacturer).to.equal(minter.address);
    });

    it("Should not create a product with empty name", async function () {
      const name = "";
      const description = "Test Description";
      const tokenURI = "https://example.com/token/1";

      await expect(
        contract.connect(minter).createProduct(name, description, tokenURI)
      ).to.be.revertedWith("Name cannot be empty");
    });

    it("Should not create a product with empty description", async function () {
      const name = "Test Product";
      const description = "";
      const tokenURI = "https://example.com/token/1";

      await expect(
        contract.connect(minter).createProduct(name, description, tokenURI)
      ).to.be.revertedWith("Description cannot be empty");
    });

    it("Should update product status", async function () {
      // First create a product
      const tx = await contract
        .connect(minter)
        .createProduct(
          "Test Product",
          "Test Description",
          "https://example.com/token/1"
        );
      const receipt = await tx.wait();
      const tokenId = receipt.events.find((e) => e.event === "ProductCreated")
        .args.tokenId;

      // Update status
      await contract.connect(minter).updateProductStatus(tokenId, 1); // InTransit

      const product = await contract.getProduct(tokenId);
      expect(product.status).to.equal(1);
    });

    it("Should update product location", async function () {
      // First create a product
      const tx = await contract
        .connect(minter)
        .createProduct(
          "Test Product",
          "Test Description",
          "https://example.com/token/1"
        );
      const receipt = await tx.wait();
      const tokenId = receipt.events.find((e) => e.event === "ProductCreated")
        .args.tokenId;

      // Update location
      const newLocation = "Warehouse A";
      await contract
        .connect(minter)
        .updateProductLocation(tokenId, newLocation);

      const product = await contract.getProduct(tokenId);
      expect(product.location).to.equal(newLocation);
    });

    it("Should not update location with empty string", async function () {
      // First create a product
      const tx = await contract
        .connect(minter)
        .createProduct(
          "Test Product",
          "Test Description",
          "https://example.com/token/1"
        );
      const receipt = await tx.wait();
      const tokenId = receipt.events.find((e) => e.event === "ProductCreated")
        .args.tokenId;

      // Try to update with empty location
      await expect(
        contract.connect(minter).updateProductLocation(tokenId, "")
      ).to.be.revertedWith("Location cannot be empty");
    });
  });

  describe("Product History", function () {
    it("Should add to product history", async function () {
      // First create a product
      const tx = await contract
        .connect(minter)
        .createProduct(
          "Test Product",
          "Test Description",
          "https://example.com/token/1"
        );
      const receipt = await tx.wait();
      const tokenId = receipt.events.find((e) => e.event === "ProductCreated")
        .args.tokenId;

      // Add to history
      const historyItem = "Product packaged";
      await contract.connect(minter).addToProductHistory(tokenId, historyItem);

      // Verify history count
      const historyCount = await contract.getProductHistoryCount(tokenId);
      expect(historyCount).to.equal(1);

      // Verify history item
      const retrievedItem = await contract.getProductHistoryItem(tokenId, 0);
      expect(retrievedItem).to.equal(historyItem);
    });

    it("Should not add empty history item", async function () {
      // First create a product
      const tx = await contract
        .connect(minter)
        .createProduct(
          "Test Product",
          "Test Description",
          "https://example.com/token/1"
        );
      const receipt = await tx.wait();
      const tokenId = receipt.events.find((e) => e.event === "ProductCreated")
        .args.tokenId;

      // Try to add empty history item
      await expect(
        contract.connect(minter).addToProductHistory(tokenId, "")
      ).to.be.revertedWith("History item cannot be empty");
    });
  });

  describe("Manufacturer Management", function () {
    it("Should authorize a manufacturer", async function () {
      await contract.connect(admin).authorizeManufacturer(manufacturer.address);

      const isAuthorized = await contract.isManufacturerAuthorized(
        manufacturer.address
      );
      expect(isAuthorized).to.be.true;

      // Check event was emitted
      // Note: We can't easily check events from role management in this test setup
    });

    it("Should not authorize already authorized manufacturer", async function () {
      await contract.connect(admin).authorizeManufacturer(manufacturer.address);

      await expect(
        contract.connect(admin).authorizeManufacturer(manufacturer.address)
      ).to.be.revertedWith("Manufacturer already authorized");
    });

    it("Should revoke manufacturer authorization", async function () {
      // First authorize
      await contract.connect(admin).authorizeManufacturer(manufacturer.address);

      // Then revoke
      await contract.connect(admin).revokeManufacturer(manufacturer.address);

      const isAuthorized = await contract.isManufacturerAuthorized(
        manufacturer.address
      );
      expect(isAuthorized).to.be.false;
    });

    it("Should not revoke non-authorized manufacturer", async function () {
      await expect(
        contract.connect(admin).revokeManufacturer(manufacturer.address)
      ).to.be.revertedWith("Manufacturer not authorized");
    });

    it("Should restrict manufacturer authorization to admin role", async function () {
      await expect(
        contract.connect(minter).authorizeManufacturer(manufacturer.address)
      ).to.be.reverted;
    });
  });

  describe("Access Control", function () {
    it("Should restrict product creation to minter role", async function () {
      await expect(
        contract
          .connect(manufacturer)
          .createProduct(
            "Test Product",
            "Test Description",
            "https://example.com/token/1"
          )
      ).to.be.reverted;
    });

    it("Should restrict product status updates to minter role", async function () {
      // First create a product with minter
      const tx = await contract
        .connect(minter)
        .createProduct(
          "Test Product",
          "Test Description",
          "https://example.com/token/1"
        );
      const receipt = await tx.wait();
      const tokenId = receipt.events.find((e) => e.event === "ProductCreated")
        .args.tokenId;

      // Try to update with non-minter
      await expect(
        contract.connect(manufacturer).updateProductStatus(tokenId, 1)
      ).to.be.reverted;
    });
  });
});
