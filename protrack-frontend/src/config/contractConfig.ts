import contractsData from './contracts.json';

export interface ContractConfig {
  address: string;
  deployBlock: number;
}

export interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
}

export interface DemoConfig {
  mpcWalletId: number;
  signers: string[];
  devices: string[];
}

export interface ContractsConfig {
  network: NetworkConfig;
  contracts: {
    ProTrackSupplyChain: ContractConfig;
    ProTrackOracle: ContractConfig;
    ProTrackMPCWallet: ContractConfig;
    ProTrackRFIDTokenizer: ContractConfig;
    ProTrackAdvancedIoT: ContractConfig;
  };
  demo: DemoConfig;
}

// Load the deployed contract configuration
export const contractsConfig: ContractsConfig = contractsData as ContractsConfig;

// Export individual contract addresses for easy access
export const CONTRACT_ADDRESSES = {
  SUPPLY_CHAIN: contractsConfig.contracts.ProTrackSupplyChain.address,
  ORACLE: contractsConfig.contracts.ProTrackOracle.address,
  MPC_WALLET: contractsConfig.contracts.ProTrackMPCWallet.address,
  RFID_TOKENIZER: contractsConfig.contracts.ProTrackRFIDTokenizer.address,
  ADVANCED_IOT: contractsConfig.contracts.ProTrackAdvancedIoT.address,
};

// Export network configuration
export const NETWORK_CONFIG = contractsConfig.network;

// Export demo configuration
export const DEMO_CONFIG = contractsConfig.demo;

// Helper function to get contract address by name
export function getContractAddress(contractName: keyof typeof contractsConfig.contracts): string {
  return contractsConfig.contracts[contractName].address;
}

// Helper function to check if we're on the correct network
export function isCorrectNetwork(chainId: number): boolean {
  return chainId === contractsConfig.network.chainId;
}

// Helper function to get network display name
export function getNetworkName(): string {
  return contractsConfig.network.name;
}

export default contractsConfig;
