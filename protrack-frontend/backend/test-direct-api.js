const axios = require("axios");
const FormData = require("form-data");
require("dotenv").config();

async function testDirectAPI() {
  try {
    console.log("Testing Pinata Direct API...");
    console.log("API Key:", process.env.PINATA_API_KEY ? "Present" : "Missing");
    console.log(
      "Secret Key:",
      process.env.PINATA_SECRET_KEY ? "Present" : "Missing"
    );

    // Create a simple test file
    const testContent = "Hello IPFS World from ProTrack Direct API!";
    const buffer = Buffer.from(testContent);

    // Create FormData
    const formData = new FormData();
    formData.append("file", buffer, {
      filename: "test-direct.txt",
      contentType: "text/plain",
    });

    console.log("Sending request to Pinata...");

    // Send request using API key and secret
    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        headers: {
          pinata_api_key: process.env.PINATA_API_KEY,
          pinata_secret_api_key: process.env.PINATA_SECRET_KEY,
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
    } else {
      console.error("Error:", error.message);
    }
  }
}

testDirectAPI();
