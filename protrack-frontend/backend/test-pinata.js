const pinataSDK = require("@pinata/sdk");
require("dotenv").config();

async function testPinataUpload() {
  try {
    console.log("Testing Pinata upload...");

    // Get JWT token
    const jwtToken = process.env.PINATA_JWT;
    console.log("JWT Token exists:", !!jwtToken);

    if (!jwtToken) {
      console.error("PINATA_JWT not found in environment variables");
      return;
    }

    // Initialize Pinata SDK
    const pinata = new pinataSDK({
      pinataJWTKey: jwtToken,
    });

    // Create a simple test file
    const testContent = "Hello IPFS World!";
    const buffer = Buffer.from(testContent);

    // Convert buffer to a readable stream
    const { Readable } = require("stream");
    const stream = Readable.from(buffer);

    console.log("Sending request to Pinata...");

    // Upload file using Pinata SDK
    const result = await pinata.pinFileToIPFS(stream, {
      pinataMetadata: {
        name: "test.txt",
      },
    });

    console.log("Upload successful!");
    console.log("CID:", result.IpfsHash);
    console.log(
      "URL:",
      `https://magenta-key-primate-764.mypinata.cloud/ipfs/${result.IpfsHash}`
    );
  } catch (error) {
    console.error("Error:", error.message);
  }
}

testPinataUpload();
