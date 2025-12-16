const axios = require("axios");
const FormData = require("form-data");
require("dotenv").config();

async function testJWTAPI() {
  try {
    console.log("Testing Pinata JWT API...");
    console.log("JWT Token:", process.env.PINATA_JWT ? "Present" : "Missing");

    // Create a simple test file
    const testContent = "Hello IPFS World from ProTrack JWT API!";
    const buffer = Buffer.from(testContent);

    // Create FormData
    const formData = new FormData();
    formData.append("file", buffer, {
      filename: "test-jwt.txt",
      contentType: "text/plain",
    });

    console.log("Sending request to Pinata with JWT...");

    // Send request using JWT token
    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        headers: {
          Authorization: `Bearer ${process.env.PINATA_JWT}`,
          ...formData.getHeaders(),
        },
      }
    );

    console.log("Upload successful!");
    console.log("CID:", response.data.IpfsHash);
    console.log(
      "URL:",
      `https://magenta-key-primate-764.mypinata.cloud/ipfs/${response.data.IpfsHash}`
    );
  } catch (error) {
    if (error.response) {
      console.error("Error Response:", error.response.data);
      console.error("Status:", error.response.status);
      console.error("Headers:", error.response.headers);
    } else {
      console.error("Error:", error.message);
    }
  }
}

testJWTAPI();
