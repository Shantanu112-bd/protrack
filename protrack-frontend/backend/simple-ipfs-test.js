const { create } = require("ipfs-http-client");

// Connect to IPFS node
const ipfs = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
});

async function testIPFS() {
  try {
    console.log("Testing IPFS connection...");

    // Create a simple test file
    const testContent = "Hello IPFS World from ProTrack!";
    const buffer = Buffer.from(testContent);

    // Upload to IPFS
    const result = await ipfs.add({
      content: buffer,
      path: "test.txt",
    });

    console.log("Upload successful!");
    console.log("CID:", result.cid.toString());
    console.log("URL:", `https://ipfs.io/ipfs/${result.cid.toString()}`);

    // Test retrieval
    console.log("\nTesting retrieval...");
    const chunks = [];
    for await (const chunk of ipfs.cat(result.cid)) {
      chunks.push(chunk);
    }
    const retrievedContent = Buffer.concat(chunks).toString();
    console.log("Retrieved content:", retrievedContent);
  } catch (error) {
    console.error("Error:", error.message || error);
  }
}

testIPFS();
