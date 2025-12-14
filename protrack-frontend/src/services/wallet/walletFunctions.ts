/**
 * Individual wallet functions for reuse across components
 */
import Web3 from "web3";
import {
  TransactionRequest,
  NetworkConfig,
} from "../../interfaces/WalletInterfaces";

// Type definition for Ethereum provider
interface EthereumProvider {
  request(args: { method: string; params?: any[] }): Promise<any>;
  on(event: string, callback: (...args: any[]) => void): void;
  removeListener(event: string, callback: (...args: any[]) => void): void;
}

// Disconnect wallet function
export const disconnectWallet = async (): Promise<void> => {
  // Reset local state - actual disconnection happens at the context level
  console.log("Wallet disconnected");
  return Promise.resolve();
};

// Check if MetaMask is installed
export const isMetaMaskInstalled = (): boolean => {
  return (
    typeof window !== "undefined" && typeof window.ethereum !== "undefined"
  );
};

// Connect to wallet
export const connectWallet = async (): Promise<{
  address: string;
  balance: string;
  chainId: number;
}> => {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed");
  }

  // Type assertion to ensure compatibility
  const ethereum = window.ethereum as EthereumProvider;

  try {
    const accounts = await ethereum.request({
      method: "eth_requestAccounts",
    });

    if (accounts.length === 0) {
      throw new Error("No accounts found");
    }

    const web3 = new Web3(ethereum as any);
    const address = accounts[0];
    const chainId = await ethereum.request({ method: "eth_chainId" });
    const balance = await web3.eth.getBalance(address);
    const balanceInEth = web3.utils.fromWei(balance, "ether");

    return {
      address,
      balance: balanceInEth,
      chainId: parseInt(chainId, 16),
    };
  } catch (error) {
    console.error("Wallet connection failed:", error);
    throw error;
  }
};

// Get account
export const getAccount = async (): Promise<string | null> => {
  if (!isMetaMaskInstalled()) {
    return null;
  }

  // Type assertion to ensure compatibility
  const ethereum = window.ethereum as EthereumProvider;

  try {
    const accounts = await ethereum.request({
      method: "eth_accounts",
    });
    return accounts.length > 0 ? accounts[0] : null;
  } catch (error) {
    console.error("Error getting account:", error);
    return null;
  }
};

// Get balance
export const getBalance = async (address: string): Promise<string> => {
  if (!isMetaMaskInstalled() || !address) {
    return "0";
  }

  // Type assertion to ensure compatibility
  const ethereum = window.ethereum as EthereumProvider;

  try {
    const web3 = new Web3(ethereum as any);
    const balance = await web3.eth.getBalance(address);
    return web3.utils.fromWei(balance, "ether");
  } catch (error) {
    console.error("Error getting balance:", error);
    return "0";
  }
};

// Sign message
export const signMessage = async (message: string): Promise<string> => {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed");
  }

  const account = await getAccount();
  if (!account) {
    throw new Error("No account connected");
  }

  // Type assertion to ensure compatibility
  const ethereum = window.ethereum as EthereumProvider;

  try {
    const web3 = new Web3(ethereum as any);
    const signature = await web3.eth.personal.sign(message, account, "");
    return signature;
  } catch (error) {
    console.error("Error signing message:", error);
    throw error;
  }
};

// Send transaction
export const sendTransaction = async (
  transaction: TransactionRequest
): Promise<string> => {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed");
  }

  const account = await getAccount();
  if (!account) {
    throw new Error("No account connected");
  }

  // Type assertion to ensure compatibility
  const ethereum = window.ethereum as EthereumProvider;

  try {
    const web3 = new Web3(ethereum as any);
    const txHash = await web3.eth.sendTransaction({
      from: account,
      to: transaction.to,
      value: transaction.value
        ? web3.utils.toWei(transaction.value, "ether")
        : "0",
      data: transaction.data || "",
      gas: transaction.gas || undefined,
    });
    return txHash.transactionHash?.toString() || "";
  } catch (error) {
    console.error("Error sending transaction:", error);
    throw error;
  }
};

// Switch network
export const switchNetwork = async (chainId: number): Promise<void> => {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed");
  }

  // Type assertion to ensure compatibility
  const ethereum = window.ethereum as EthereumProvider;

  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
  } catch (error: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (error.code === 4902) {
      throw new Error(
        "This network is not available in your MetaMask, please add it first"
      );
    }
    console.error("Error switching network:", error);
    throw error;
  }
};

// Get network name
export const getNetworkName = (chainId: number): string => {
  const networks: Record<number, string> = {
    1: "Ethereum Mainnet",
    3: "Ropsten Testnet",
    4: "Rinkeby Testnet",
    5: "Goerli Testnet",
    42: "Kovan Testnet",
    56: "Binance Smart Chain",
    137: "Polygon Mainnet",
    31337: "Hardhat Local",
    1337: "Local Network",
  };

  return networks[chainId] || `Chain ID: ${chainId}`;
};

// Format address
export const formatAddress = (address: string): string => {
  if (!address || address.length < 10) return address;
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;
};
