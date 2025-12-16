// Mock test for IPFS service
const { uploadToIPFS } = require("./dist/services/ipfsService");

// Mock the pinata SDK
jest.mock("@pinata/sdk", () => {
  return jest.fn().mockImplementation(() => {
    return {
      pinFileToIPFS: jest.fn().mockResolvedValue({
        IpfsHash: "QmTest1234567890",
        PinSize: 12345,
        Timestamp: "2025-12-15T10:00:00Z",
      }),
    };
  });
});

async function testIPFSUpload() {
  try {
    // Create a mock file buffer
    const mockBuffer = Buffer.from("Test file content for IPFS");

    // Call the upload function
    const result = await uploadToIPFS(mockBuffer, "test-file.txt");

    console.log("Upload successful!");
    console.log("CID:", result.cid);
    console.log("URL:", result.url);

    // Verify the result format
    if (result.cid && result.url) {
      console.log("✓ Service is working correctly");
    } else {
      console.log("✗ Service returned incorrect format");
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

testIPFSUpload();
