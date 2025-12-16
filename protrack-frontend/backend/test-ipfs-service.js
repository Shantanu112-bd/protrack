const { uploadToIPFS } = require("./dist/services/ipfsService");

async function testIPFSService() {
  try {
    console.log("Testing IPFS service...");

    // Create a simple test file
    const testContent = "Hello IPFS World from ProTrack!";
    const buffer = Buffer.from(testContent);

    console.log("Uploading test file...");

    // Upload file using our service
    const result = await uploadToIPFS(buffer, "test.txt");

    console.log("Upload successful!");
    console.log("CID:", result.cid);
    console.log("URL:", result.url);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

testIPFSService();
