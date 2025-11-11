const { expect } = require("chai");
const { ethers } = require("hardhat");
const { utils } = ethers;

describe("ProTrackMPC", function () {
    let ProTrackMPC;
    let contract;
    let owner;
    let manufacturer;
    let supplier;
    let distributor;
    let oracle;
    let addrs;

    beforeEach(async function () {
        [owner, manufacturer, supplier, distributor, oracle, ...addrs] = await ethers.getSigners();
        
        ProTrackMPC = await ethers.getContractFactory("ProTrackMPC");
        contract = await ProTrackMPC.deploy();
        await contract.deployed();

        // Setup roles
        const MANUFACTURER_ROLE = utils.keccak256(utils.toUtf8Bytes("MANUFACTURER_ROLE"));
        const SUPPLIER_ROLE = utils.keccak256(utils.toUtf8Bytes("SUPPLIER_ROLE"));
        const DISTRIBUTOR_ROLE = utils.keccak256(utils.toUtf8Bytes("DISTRIBUTOR_ROLE"));
        const ORACLE_ROLE = utils.keccak256(utils.toUtf8Bytes("ORACLE_ROLE"));

        await contract.grantRole(MANUFACTURER_ROLE, manufacturer.address);
        await contract.grantRole(SUPPLIER_ROLE, supplier.address);
        await contract.grantRole(DISTRIBUTOR_ROLE, distributor.address);
        await contract.grantRole(ORACLE_ROLE, oracle.address);
    });

    describe("Key Management", function () {
        it("Should create a key with valid parameters", async function () {
            const keyId = utils.keccak256(utils.toUtf8Bytes("test_key"));
            const publicKey = "0x1234";
            const threshold = 2;
            const parties = [manufacturer.address, supplier.address];
            const purpose = utils.keccak256(utils.toUtf8Bytes("product_verification"));

            await contract.createKey(keyId, publicKey, threshold, parties, purpose);

            const key = await contract.getKey(keyId);
            expect(key.publicKey).to.equal(publicKey);
            expect(key.threshold).to.equal(threshold);
            expect(key.authorizedParties).to.deep.equal(parties);
            expect(key.isActive).to.equal(true);
            expect(key.purpose).to.equal(purpose);
        });

        it("Should not create a key with invalid threshold", async function () {
            const keyId = utils.keccak256(utils.toUtf8Bytes("test_key"));
            const publicKey = "0x1234";
            const threshold = 3;
            const parties = [manufacturer.address, supplier.address];
            const purpose = utils.keccak256(utils.toUtf8Bytes("product_verification"));

            await expect(
                contract.createKey(keyId, publicKey, threshold, parties, purpose)
            ).to.be.revertedWith("Threshold exceeds party count");
        });
    });

    describe("Transaction Management", function () {
        let keyId;
        let publicKey;
        let operationHash;

        beforeEach(async function () {
            keyId = utils.keccak256(utils.toUtf8Bytes("test_key"));
            publicKey = "0x1234";
            const threshold = 2;
            const parties = [manufacturer.address, supplier.address];
            const purpose = utils.keccak256(utils.toUtf8Bytes("product_verification"));
            operationHash = utils.keccak256(utils.toUtf8Bytes("test_operation"));

            await contract.createKey(keyId, publicKey, threshold, parties, purpose);
        });

        it("Should initiate a transaction", async function () {
            const tx = await contract.connect(manufacturer).initiateTransaction(keyId, operationHash);
            const receipt = await tx.wait();
            
            const event = receipt.events.find(e => e.event === "TransactionInitiated");
            expect(event).to.not.be.undefined;
            
            const txId = event.args.txId;
            const txInfo = await contract.getTransaction(txId);
            
            expect(txInfo.keyId).to.equal(keyId);
            expect(txInfo.operationHash).to.equal(operationHash);
            expect(txInfo.initiator).to.equal(manufacturer.address);
            expect(txInfo.isExecuted).to.equal(false);
        });

        it("Should approve transaction with valid signature", async function () {
            const tx = await contract.connect(manufacturer).initiateTransaction(keyId, operationHash);
            const receipt = await tx.wait();
            const txId = receipt.events.find(e => e.event === "TransactionInitiated").args.txId;

            const messageHash = utils.keccak256(
                utils.defaultAbiCoder.encode(
                    ["bytes32", "uint256"],
                    [operationHash, (await ethers.provider.getBlock(receipt.blockNumber)).timestamp]
                )
            );
            const signature = await supplier.signMessage(utils.arrayify(messageHash));

            await contract.connect(supplier).approveTransaction(txId, signature);
            
            const txInfo = await contract.getTransaction(txId);
            expect(txInfo.approvalCount).to.equal(1);
        });
    });

    describe("Product Verification", function () {
        let keyId;
        let productId;

        beforeEach(async function () {
            keyId = utils.keccak256(utils.toUtf8Bytes("test_key"));
            productId = utils.keccak256(utils.toUtf8Bytes("test_product"));
            const publicKey = "0x1234";
            const threshold = 2;
            const parties = [manufacturer.address, supplier.address];
            const purpose = utils.keccak256(utils.toUtf8Bytes("product_verification"));

            await contract.createKey(keyId, publicKey, threshold, parties, purpose);
        });

        it("Should verify product with valid signature", async function () {
            const messageHash = utils.keccak256(
                utils.defaultAbiCoder.encode(
                    ["bytes32", "uint256"],
                    [productId, Math.floor(Date.now() / 1000)]
                )
            );
            const signature = await manufacturer.signMessage(utils.arrayify(messageHash));

            const result = await contract.connect(manufacturer).verifyProduct(productId, keyId, signature);
            expect(result).to.be.true;

            const isVerified = await contract.isProductVerified(keyId, productId);
            expect(isVerified).to.be.true;
        });

        it("Should not verify product with invalid signature", async function () {
            const messageHash = utils.keccak256(
                utils.defaultAbiCoder.encode(
                    ["bytes32", "uint256"],
                    [productId, Math.floor(Date.now() / 1000)]
                )
            );
            const signature = await addrs[0].signMessage(utils.arrayify(messageHash));

            await expect(
                contract.connect(manufacturer).verifyProduct(productId, keyId, signature)
            ).to.be.revertedWith("Invalid signature");
        });
    });

    describe("Access Control", function () {
        it("Should manage roles correctly", async function () {
            const MANUFACTURER_ROLE = utils.keccak256(utils.toUtf8Bytes("MANUFACTURER_ROLE"));
            const SUPPLIER_ROLE = utils.keccak256(utils.toUtf8Bytes("SUPPLIER_ROLE"));

            expect(await contract.hasRole(MANUFACTURER_ROLE, manufacturer.address)).to.be.true;
            expect(await contract.hasRole(SUPPLIER_ROLE, supplier.address)).to.be.true;
            
            await contract.revokeRole(MANUFACTURER_ROLE, manufacturer.address);
            expect(await contract.hasRole(MANUFACTURER_ROLE, manufacturer.address)).to.be.false;
        });

        it("Should restrict key creation to admin", async function () {
            const keyId = utils.keccak256(utils.toUtf8Bytes("test_key"));
            const publicKey = "0x1234";
            const threshold = 2;
            const parties = [manufacturer.address, supplier.address];
            const purpose = utils.keccak256(utils.toUtf8Bytes("product_verification"));

            await expect(
                contract.connect(manufacturer).createKey(keyId, publicKey, threshold, parties, purpose)
            ).to.be.revertedWith("AccessControl:");
        });
    });
});