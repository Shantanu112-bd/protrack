// Script to demonstrate Chainlink Functions for IoT data validation
// This would typically be implemented as a Chainlink Functions script

/**
 * @dev Chainlink Functions script for validating IoT data
 * This script would run off-chain but is called by the smart contract
 * @param args Array of arguments passed from the smart contract
 * @return Result of the validation
 */
const processIoTData = async (args) => {
  // In a real implementation, this would:
  // 1. Receive IoT data from the smart contract
  // 2. Validate the digital signature of the IoT device
  // 3. Verify GPS coordinates are within expected zones
  // 4. Check timestamp is recent
  // 5. Validate sensor readings against expected ranges
  // 6. Return validation result to the smart contract

  const tokenId = args[0];
  const sensorType = args[1];
  const value = args[2];
  const gpsCoordinates = args[3];
  const timestamp = args[4];
  const deviceSignature = args[5];

  // Example validation logic (simplified)
  const currentTime = Math.floor(Date.now() / 1000);
  const timeDiff = currentTime - timestamp;

  // Check if data is recent (within 5 minutes)
  if (timeDiff > 300) {
    return "STALE_DATA";
  }

  // Validate sensor type and value ranges
  switch (sensorType) {
    case "TEMPERATURE":
      const temp = parseInt(value);
      if (temp < -20 || temp > 40) {
        return "OUT_OF_RANGE";
      }
      break;
    case "HUMIDITY":
      const humidity = parseInt(value);
      if (humidity < 0 || humidity > 95) {
        return "OUT_OF_RANGE";
      }
      break;
    case "VIBRATION":
      const vibration = parseInt(value);
      if (vibration < 0 || vibration > 100) {
        return "OUT_OF_RANGE";
      }
      break;
    default:
      return "INVALID_SENSOR_TYPE";
  }

  // In a real implementation, we would also:
  // - Verify the device signature using cryptographic verification
  // - Check GPS coordinates against expected zones
  // - Cross-reference with device registry

  return "VALID";
};

// Export for use in Chainlink Functions
// module.exports = processIoTData;

// For demonstration purposes, we'll also include a mock implementation
// that could be used in testing environments

/**
 * @dev Mock Chainlink Functions source for testing
 */
const mockChainlinkSource = `
const processIoTData = async (args) => {
  const tokenId = args[0];
  const sensorType = args[1];
  const value = args[2];
  const gpsCoordinates = args[3];
  const timestamp = args[4];
  const deviceSignature = args[5];

  const currentTime = Math.floor(Date.now() / 1000);
  const timeDiff = currentTime - timestamp;

  if (timeDiff > 300) {
    return "STALE_DATA";
  }

  switch (sensorType) {
    case "TEMPERATURE":
      const temp = parseInt(value);
      if (temp < -20 || temp > 40) {
        return "OUT_OF_RANGE";
      }
      break;
    case "HUMIDITY":
      const humidity = parseInt(value);
      if (humidity < 0 || humidity > 95) {
        return "OUT_OF_RANGE";
      }
      break;
    case "VIBRATION":
      const vibration = parseInt(value);
      if (vibration < 0 || vibration > 100) {
        return "OUT_OF_RANGE";
      }
      break;
    default:
      return "INVALID_SENSOR_TYPE";
  }

  return "VALID";
};

processIoTData(args);
`;

console.log("Chainlink Functions source for IoT data validation:");
console.log(mockChainlinkSource);

// Example of how this would be called from the smart contract
const exampleCallData = [
  "1", // tokenId
  "TEMPERATURE", // sensorType
  "25", // value
  "40.7128,-74.0060", // gpsCoordinates
  Math.floor(Date.now() / 1000).toString(), // timestamp
  "0x1234567890abcdef", // deviceSignature (mock)
];

console.log("\nExample call data:", exampleCallData);
