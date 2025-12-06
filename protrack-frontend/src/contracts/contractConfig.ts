import { ethers } from "ethers";
import { BrowserProvider } from "ethers";
import { Contract } from "ethers";

export const CHAIN_ID = 1337; // Local network
export const RPC_URL = "http://localhost:8545";

// Contract Addresses
export const PROTRACK_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Update with actual deployed address

// Import the unified ProTrack ABI
import ProTrackABI from "./ProTrack.json";

// Provider and Signer
export const getProvider = () => {
  // Type assertion to ensure compatibility with ethers v6
  return new BrowserProvider(window.ethereum as ethers.Eip1193Provider);
};

export const getSigner = async () => {
  const provider = getProvider();
  await provider.send("eth_requestAccounts", []);
  return await provider.getSigner();
};

// Contract Instances
export const getProTrackContract = (
  signerOrProvider: ethers.Signer | ethers.Provider
) => {
  return new Contract(PROTRACK_ADDRESS, ProTrackABI.abi, signerOrProvider);
};

// Re-export contract functions for backward compatibility
export const getProTrackNFTContract = getProTrackContract;
export const getProTrackSupplyChainContract = getProTrackContract;
export const getProTrackOracleContract = getProTrackContract;
export const getProTrackRFIDTokenizerContract = getProTrackContract;
export const getProTrackMPCContract = getProTrackContract;

// Role Constants
export const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
export const MANUFACTURER_ROLE = ethers.keccak256(
  ethers.toUtf8Bytes("MANUFACTURER_ROLE")
);
export const PACKAGER_ROLE = ethers.keccak256(
  ethers.toUtf8Bytes("PACKAGER_ROLE")
);
export const TRANSPORTER_ROLE = ethers.keccak256(
  ethers.toUtf8Bytes("TRANSPORTER_ROLE")
);
export const WHOLESALER_ROLE = ethers.keccak256(
  ethers.toUtf8Bytes("WHOLESALER_ROLE")
);
export const RETAILER_ROLE = ethers.keccak256(
  ethers.toUtf8Bytes("RETAILER_ROLE")
);
export const CUSTOMER_ROLE = ethers.keccak256(
  ethers.toUtf8Bytes("CUSTOMER_ROLE")
);
export const ORACLE_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ORACLE_ROLE"));
export const INSPECTOR_ROLE = ethers.keccak256(
  ethers.toUtf8Bytes("INSPECTOR_ROLE")
);

// Network information
export const SUPPORTED_NETWORKS = {
  1337: { name: "Localhost", chainId: 1337, rpcUrl: "http://127.0.0.1:8545" },
  11155111: {
    name: "Sepolia",
    chainId: 11155111,
    rpcUrl: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
  },
  1: {
    name: "Ethereum Mainnet",
    chainId: 1,
    rpcUrl: "https://mainnet.infura.io/v3/YOUR_INFURA_KEY",
  },
};

export const getSupportedNetwork = (chainId: number) => {
  return SUPPORTED_NETWORKS[chainId as keyof typeof SUPPORTED_NETWORKS];
};
