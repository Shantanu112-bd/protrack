const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying SimpleProTrack contract...");
  
  // Get the contract factory
  const SimpleProTrack = await ethers.getContractFactory("SimpleProTrack");
  
  // Deploy the contract
  const simpleProTrack = await SimpleProTrack.deploy();
  await simpleProTrack.waitForDeployment();
  
  // Get the contract address
  const simpleProTrackAddress = await simpleProTrack.getAddress();
  
  console.log(`SimpleProTrack deployed to: ${simpleProTrackAddress}`);
  
  // Save deployment information
  const deployments = {
    SimpleProTrack: simpleProTrackAddress
  };
  
  fs.writeFileSync(
    path.join(__dirname, "../deployments.json"),
    JSON.stringify(deployments, null, 2)
  );
  
  console.log("Deployment addresses saved to deployments.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });