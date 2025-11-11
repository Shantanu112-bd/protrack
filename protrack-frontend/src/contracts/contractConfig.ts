import { ethers } from "ethers";
import { BrowserProvider } from "ethers";
import { Contract } from "ethers";

export const CHAIN_ID = 1337; // Local network
export const RPC_URL = "http://localhost:8545";

// Contract Addresses
export const PROTRACK_NFT_ADDRESS =
  "0x5FbDB2315678afecb367f032d93F642f64180aa3";
export const PROTRACK_SUPPLY_CHAIN_ADDRESS =
  "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
export const PROTRACK_ORACLE_ADDRESS =
  "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
export const PROTRACK_RFID_TOKENIZER_ADDRESS =
  "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
export const PROTRACK_MPC_ADDRESS =
  "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"; // Update this with your deployed contract address

// Contract ABIs
export const PROTRACK_NFT_ABI = [
  /* ... */
];
export const PROTRACK_SUPPLY_CHAIN_ABI = [
  /* ... */
];
export const PROTRACK_ORACLE_ABI = [
  /* ... */
];
export const PROTRACK_RFID_TOKENIZER_ABI = [
  /* ... */
];

// Provider and Signer
export const getProvider = () => {
  // Type assertion to ensure compatibility with ethers v6
  return new BrowserProvider(window.ethereum);
};

export const getSigner = async () => {
  const provider = getProvider();
  await provider.send("eth_requestAccounts", []);
  return await provider.getSigner();
};

// Contract Instances
export const getProTrackNFTContract = (
  signerOrProvider: ethers.Signer | ethers.Provider
) => {
  return new Contract(PROTRACK_NFT_ADDRESS, PROTRACK_NFT_ABI, signerOrProvider);
};

export const getProTrackSupplyChainContract = (
  signerOrProvider: ethers.Signer | ethers.Provider
) => {
  return new Contract(
    PROTRACK_SUPPLY_CHAIN_ADDRESS,
    PROTRACK_SUPPLY_CHAIN_ABI,
    signerOrProvider
  );
};

export const getProTrackOracleContract = (
  signerOrProvider: ethers.Signer | ethers.Provider
) => {
  return new Contract(
    PROTRACK_ORACLE_ADDRESS,
    PROTRACK_ORACLE_ABI,
    signerOrProvider
  );
};

export const getProTrackRFIDTokenizerContract = (
  signerOrProvider: ethers.Signer | ethers.Provider
) => {
  return new Contract(
    PROTRACK_RFID_TOKENIZER_ADDRESS,
    PROTRACK_RFID_TOKENIZER_ABI,
    signerOrProvider
  );
};

// Import ProTrackMPC ABI
import ProTrackMPCABI from "./ProTrackMPC.json";

export const getProTrackMPCContract = (
  signerOrProvider: ethers.Signer | ethers.Provider
) => {
  return new Contract(
    PROTRACK_MPC_ADDRESS,
    ProTrackMPCABI.abi,
    signerOrProvider
  );
};

// Role Constants
export const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
export const MANUFACTURER_ROLE = ethers.keccak256(
  ethers.toUtf8Bytes("MANUFACTURER_ROLE")
);
export const SUPPLIER_ROLE = ethers.keccak256(
  ethers.toUtf8Bytes("SUPPLIER_ROLE")
);
export const DISTRIBUTOR_ROLE = ethers.keccak256(
  ethers.toUtf8Bytes("DISTRIBUTOR_ROLE")
);
export const ORACLE_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ORACLE_ROLE"));

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
