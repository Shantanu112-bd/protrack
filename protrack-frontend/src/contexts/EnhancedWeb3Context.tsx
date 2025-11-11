import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import Web3 from "web3";
import { Contract } from "web3-eth-contract";
import {
  CONTRACT_ADDRESSES,
  NETWORK_CONFIG,
  isCorrectNetwork,
} from "../config/contractConfig";

// Enhanced Contract ABIs
const MPC_WALLET_ABI = [
  {
    inputs: [
      { internalType: "address[]", name: "signers", type: "address[]" },
      { internalType: "uint256", name: "threshold", type: "uint256" },
    ],
    name: "createMPCWallet",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "productId", type: "uint256" },
      { internalType: "address[]", name: "authorizedUsers", type: "address[]" },
      { internalType: "bool", name: "enablePrivacy", type: "bool" },
    ],
    name: "generateProductKeys",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "productId", type: "uint256" },
      { internalType: "address", name: "user", type: "address" },
    ],
    name: "getUserDecryptionKey",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
];

const RFID_TOKENIZER_ABI = [
  {
    inputs: [
      { internalType: "string", name: "rfidData", type: "string" },
      { internalType: "string", name: "gpsLocation", type: "string" },
      { internalType: "bytes32[]", name: "merkleProof", type: "bytes32[]" },
      { internalType: "bytes32", name: "merkleRoot", type: "bytes32" },
    ],
    name: "scanRFID",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "rfidHash", type: "string" },
      { internalType: "string", name: "productName", type: "string" },
      { internalType: "string", name: "batchNumber", type: "string" },
      { internalType: "uint256", name: "expiryDate", type: "uint256" },
      { internalType: "string", name: "encryptedMetadata", type: "string" },
      { internalType: "string", name: "ipfsHash", type: "string" },
      { internalType: "address[]", name: "authorizedUsers", type: "address[]" },
    ],
    name: "tokenizeRFID",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const ADVANCED_IOT_ABI = [
  {
    inputs: [
      { internalType: "address", name: "deviceAddress", type: "address" },
      { internalType: "string", name: "deviceId", type: "string" },
      { internalType: "string", name: "deviceType", type: "string" },
      { internalType: "string", name: "protocol", type: "string" },
      { internalType: "string", name: "firmwareVersion", type: "string" },
      { internalType: "bool", name: "enableEncryption", type: "bool" },
    ],
    name: "registerAdvancedDevice",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "sensorType", type: "string" },
      { internalType: "int256", name: "minThreshold", type: "int256" },
      { internalType: "int256", name: "maxThreshold", type: "int256" },
      { internalType: "uint256", name: "timeWindow", type: "uint256" },
      {
        internalType: "address[]",
        name: "notificationTargets",
        type: "address[]",
      },
      { internalType: "string", name: "alertMessage", type: "string" },
      { internalType: "uint256", name: "cooldownPeriod", type: "uint256" },
    ],
    name: "createAlertRule",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
];

interface EnhancedNetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
  supplyChainAddress: string;
  oracleAddress: string;
  mpcWalletAddress: string;
  rfidTokenizerAddress: string;
  advancedIoTAddress: string;
}

interface MPCWalletInfo {
  walletId: number;
  threshold: number;
  totalSigners: number;
  isActive: boolean;
  nonce: number;
}

interface IoTDevice {
  deviceAddress: string;
  deviceId: string;
  deviceType: string;
  protocol: string;
  isActive: boolean;
  batteryLevel: number;
  lastHeartbeat: number;
}

interface EnhancedWeb3ContextType {
  // Basic Web3 functionality
  web3: Web3 | null;
  account: string | null;
  isConnected: boolean;
  chainId: number | null;
  balance: string | null;
  networkConfig: EnhancedNetworkConfig | null;

  // Contract instances
  supplyChainContract: Contract<any> | null;
  oracleContract: Contract<any> | null;
  mpcWalletContract: Contract<any> | null;
  rfidTokenizerContract: Contract<any> | null;
  advancedIoTContract: Contract<any> | null;

  // Basic wallet functions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
  signMessage: (message: string) => Promise<string>;
  sendTransaction: (transaction: any) => Promise<string>;

  // MPC Wallet functions
  createMPCWallet: (signers: string[], threshold: number) => Promise<number>;
  getMPCWalletInfo: (walletId: number) => Promise<MPCWalletInfo>;
  proposeTransaction: (
    walletId: number,
    to: string,
    value: number,
    data: string,
    operation: string
  ) => Promise<string>;
  signMPCTransaction: (walletId: number, txHash: string) => Promise<void>;

  // RFID Tokenization functions
  scanRFID: (rfidData: string, gpsLocation: string) => Promise<string>;
  tokenizeRFID: (
    rfidHash: string,
    productData: any,
    authorizedUsers: string[]
  ) => Promise<number>;
  getDecryptedMetadata: (
    tokenId: number,
    decryptionKey: string
  ) => Promise<string>;

  // Advanced IoT functions
  registerIoTDevice: (deviceData: any) => Promise<void>;
  submitEncryptedSensorData: (sensorData: any) => Promise<void>;
  createAlertRule: (alertRule: any) => Promise<number>;
  getIoTDashboard: () => Promise<any>;

  // Privacy functions
  generateProductKeys: (
    productId: number,
    authorizedUsers: string[]
  ) => Promise<void>;
  rotateEncryptionKeys: (
    productId: number,
    newUsers: string[]
  ) => Promise<void>;
  getUserDecryptionKey: (productId: number) => Promise<string>;
}

const EnhancedWeb3Context = createContext<EnhancedWeb3ContextType | undefined>(
  undefined
);

export const useEnhancedWeb3 = () => {
  const context = useContext(EnhancedWeb3Context);
  if (!context) {
    throw new Error(
      "useEnhancedWeb3 must be used within an EnhancedWeb3Provider"
    );
  }
  return context;
};

interface EnhancedWeb3ProviderProps {
  children: ReactNode;
}

export const EnhancedWeb3Provider: React.FC<EnhancedWeb3ProviderProps> = ({
  children,
}) => {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [chainId, setChainId] = useState<number | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [networkConfig, setNetworkConfig] =
    useState<EnhancedNetworkConfig | null>(null);

  // Contract states
  const [supplyChainContract, setSupplyChainContract] =
    useState<Contract<any> | null>(null);
  const [oracleContract, setOracleContract] = useState<Contract<any> | null>(
    null
  );
  const [mpcWalletContract, setMpcWalletContract] =
    useState<Contract<any> | null>(null);
  const [rfidTokenizerContract, setRfidTokenizerContract] =
    useState<Contract<any> | null>(null);
  const [advancedIoTContract, setAdvancedIoTContract] =
    useState<Contract<any> | null>(null);

  // Enhanced network configurations
  const networks: { [key: number]: EnhancedNetworkConfig } = {
    1337: {
      chainId: 1337,
      name: "Hardhat Local",
      rpcUrl: "http://127.0.0.1:8545",
      blockExplorer: "http://localhost:8545",
      supplyChainAddress: "0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82",
      oracleAddress: "0x9A676e781A523b5d0C0e43731313A708CB607508",
      mpcWalletAddress: "0x70e0bA845a1A0F2DA3359C97E0285013525FFC49",
      rfidTokenizerAddress: "0x4826533B4897376654Bb4d4AD88B7faFD0C98528",
      advancedIoTAddress: "0x99bbA657f2BbC93c02D617f8bA121cB8Fc104Acf",
    },
    11155111: {
      chainId: 11155111,
      name: "Sepolia Testnet",
      rpcUrl: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
      blockExplorer: "https://sepolia.etherscan.io",
      supplyChainAddress: "0x0000000000000000000000000000000000000000",
      oracleAddress: "0x0000000000000000000000000000000000000000",
      mpcWalletAddress: "0x0000000000000000000000000000000000000000",
      rfidTokenizerAddress: "0x0000000000000000000000000000000000000000",
      advancedIoTAddress: "0x0000000000000000000000000000000000000000",
    },
    137: {
      chainId: 137,
      name: "Polygon Mainnet",
      rpcUrl: "https://polygon-rpc.com",
      blockExplorer: "https://polygonscan.com",
      supplyChainAddress: "0x0000000000000000000000000000000000000000",
      oracleAddress: "0x0000000000000000000000000000000000000000",
      mpcWalletAddress: "0x0000000000000000000000000000000000000000",
      rfidTokenizerAddress: "0x0000000000000000000000000000000000000000",
      advancedIoTAddress: "0x0000000000000000000000000000000000000000",
    },
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (
      typeof window !== "undefined" &&
      typeof window.ethereum !== "undefined"
    ) {
      try {
        const web3Instance = new Web3(window.ethereum);
        const accounts = await web3Instance.eth.getAccounts();

        if (accounts.length > 0) {
          setWeb3(web3Instance);
          setAccount(accounts[0]);
          setIsConnected(true);

          const chainId = await web3Instance.eth.getChainId();
          const chainIdNumber = Number(chainId);
          setChainId(chainIdNumber);

          const balance = await web3Instance.eth.getBalance(accounts[0]);
          setBalance(web3Instance.utils.fromWei(balance, "ether"));

          // Initialize contracts only when needed
          // await initializeContracts(web3Instance, chainIdNumber)
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    }
  };

  const initializeContracts = async (web3Instance: Web3, chainId: number) => {
    const config = networks[chainId];
    if (!config) return;

    setNetworkConfig(config);

    try {
      // Initialize all contracts
      if (
        config.supplyChainAddress !==
        "0x0000000000000000000000000000000000000000"
      ) {
        const supplyContract = new web3Instance.eth.Contract(
          [],
          config.supplyChainAddress
        );
        setSupplyChainContract(supplyContract);
      }

      if (
        config.mpcWalletAddress !== "0x0000000000000000000000000000000000000000"
      ) {
        const mpcContract = new web3Instance.eth.Contract(
          MPC_WALLET_ABI,
          config.mpcWalletAddress
        );
        setMpcWalletContract(mpcContract);
      }

      if (
        config.rfidTokenizerAddress !==
        "0x0000000000000000000000000000000000000000"
      ) {
        const rfidContract = new web3Instance.eth.Contract(
          RFID_TOKENIZER_ABI,
          config.rfidTokenizerAddress
        );
        setRfidTokenizerContract(rfidContract);
      }

      if (
        config.advancedIoTAddress !==
        "0x0000000000000000000000000000000000000000"
      ) {
        const iotContract = new web3Instance.eth.Contract(
          ADVANCED_IOT_ABI,
          config.advancedIoTAddress
        );
        setAdvancedIoTContract(iotContract);
      }
    } catch (error) {
      console.error("Error initializing contracts:", error);
    }
  };

  const connectWallet = async () => {
    if (
      typeof window !== "undefined" &&
      typeof window.ethereum !== "undefined"
    ) {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });

        const web3Instance = new Web3(window.ethereum);
        const accounts = await web3Instance.eth.getAccounts();

        setWeb3(web3Instance);
        setAccount(accounts[0]);
        setIsConnected(true);

        const currentChainId = await web3Instance.eth.getChainId();
        const chainIdNumber = Number(currentChainId);
        setChainId(chainIdNumber);

        const balance = await web3Instance.eth.getBalance(accounts[0]);
        setBalance(web3Instance.utils.fromWei(balance, "ether"));

        // Initialize contracts only when needed
        // await initializeContracts(web3Instance, chainIdNumber)

        // Add event listeners
        if (window.ethereum.on) {
          window.ethereum.on("accountsChanged", handleAccountsChanged);
          window.ethereum.on("chainChanged", handleChainChanged);
        }

        localStorage.setItem("walletConnected", "true");
      } catch (error) {
        console.error("Error connecting wallet:", error);
        throw error;
      }
    } else {
      throw new Error("MetaMask is not installed");
    }
  };

  const disconnectWallet = () => {
    setWeb3(null);
    setAccount(null);
    setIsConnected(false);
    setChainId(null);
    setBalance(null);
    setNetworkConfig(null);

    // Clear contracts
    setSupplyChainContract(null);
    setOracleContract(null);
    setMpcWalletContract(null);
    setRfidTokenizerContract(null);
    setAdvancedIoTContract(null);

    // Remove event listeners
    if (window.ethereum && window.ethereum.removeListener) {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    }

    localStorage.removeItem("walletConnected");
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setAccount(accounts[0]);
      if (web3) {
        web3.eth.getBalance(accounts[0]).then((balance) => {
          setBalance(web3.utils.fromWei(balance, "ether"));
        });
      }
    }
  };

  const handleChainChanged = (chainId: string) => {
    const newChainId = parseInt(chainId, 16);
    setChainId(newChainId);
    if (web3) {
      initializeContracts(web3, newChainId);
    }
  };

  const switchNetwork = async (targetChainId: number) => {
    if (!window.ethereum) throw new Error("MetaMask is not installed");

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        throw new Error("Please add this network to MetaMask first");
      }
      throw error;
    }
  };

  const signMessage = async (message: string): Promise<string> => {
    if (!web3 || !account) throw new Error("Wallet not connected");

    try {
      const signature = await web3.eth.personal.sign(message, account, "");
      return String(signature);
    } catch (error) {
      console.error("Error signing message:", error);
      throw error;
    }
  };

  const sendTransaction = async (transaction: any): Promise<string> => {
    if (!web3 || !account) throw new Error("Wallet not connected");

    try {
      const txHash = await web3.eth.sendTransaction({
        from: account,
        ...transaction,
      });
      return String(txHash);
    } catch (error) {
      console.error("Error sending transaction:", error);
      throw error;
    }
  };

  // MPC Wallet Functions
  const createMPCWallet = async (
    signers: string[],
    threshold: number
  ): Promise<number> => {
    if (!mpcWalletContract || !account)
      throw new Error("MPC Wallet contract not available");

    try {
      const result = await mpcWalletContract.methods
        .createMPCWallet(signers, threshold)
        .send({ from: account });
      return result.events.MPCWalletCreated.returnValues.walletId;
    } catch (error) {
      console.error("Error creating MPC wallet:", error);
      throw error;
    }
  };

  const getMPCWalletInfo = async (walletId: number): Promise<MPCWalletInfo> => {
    if (!mpcWalletContract)
      throw new Error("MPC Wallet contract not available");

    try {
      const result = await mpcWalletContract.methods
        .getWalletInfo(walletId)
        .call();
      return {
        walletId,
        threshold: Number(result.threshold),
        totalSigners: Number(result.totalSigners),
        isActive: result.isActive,
        nonce: Number(result.nonce),
      };
    } catch (error) {
      console.error("Error getting MPC wallet info:", error);
      throw error;
    }
  };

  const proposeTransaction = async (
    walletId: number,
    to: string,
    value: number,
    data: string,
    operation: string
  ): Promise<string> => {
    if (!mpcWalletContract || !account)
      throw new Error("MPC Wallet contract not available");

    try {
      const result = await mpcWalletContract.methods
        .proposeTransaction(walletId, to, value, data, operation)
        .send({ from: account });
      return result.events.TransactionProposed.returnValues.txHash;
    } catch (error) {
      console.error("Error proposing transaction:", error);
      throw error;
    }
  };

  const signMPCTransaction = async (
    walletId: number,
    txHash: string
  ): Promise<void> => {
    if (!mpcWalletContract || !account)
      throw new Error("MPC Wallet contract not available");

    try {
      await mpcWalletContract.methods
        .signTransaction(walletId, txHash)
        .send({ from: account });
    } catch (error) {
      console.error("Error signing MPC transaction:", error);
      throw error;
    }
  };

  // RFID Tokenization Functions
  const scanRFID = async (
    rfidData: string,
    gpsLocation: string
  ): Promise<string> => {
    if (!rfidTokenizerContract || !account)
      throw new Error("RFID Tokenizer contract not available");

    try {
      const result = await rfidTokenizerContract.methods
        .scanRFID(
          rfidData,
          gpsLocation,
          [],
          "0x0000000000000000000000000000000000000000000000000000000000000000"
        )
        .send({ from: account });
      return result.events.RFIDScanned.returnValues.rfidHash;
    } catch (error) {
      console.error("Error scanning RFID:", error);
      throw error;
    }
  };

  const tokenizeRFID = async (
    rfidHash: string,
    productData: any,
    authorizedUsers: string[]
  ): Promise<number> => {
    if (!rfidTokenizerContract || !account)
      throw new Error("RFID Tokenizer contract not available");

    try {
      const result = await rfidTokenizerContract.methods
        .tokenizeRFID(
          rfidHash,
          productData.productName,
          productData.batchNumber,
          productData.expiryDate,
          productData.encryptedMetadata,
          productData.ipfsHash,
          authorizedUsers
        )
        .send({ from: account });
      return Number(result.events.RFIDTokenized.returnValues.tokenId);
    } catch (error) {
      console.error("Error tokenizing RFID:", error);
      throw error;
    }
  };

  const getDecryptedMetadata = async (
    tokenId: number,
    decryptionKey: string
  ): Promise<string> => {
    if (!rfidTokenizerContract || !account)
      throw new Error("RFID Tokenizer contract not available");

    try {
      const result = await rfidTokenizerContract.methods
        .getDecryptedMetadata(tokenId, decryptionKey)
        .call({ from: account });
      return result;
    } catch (error) {
      console.error("Error getting decrypted metadata:", error);
      throw error;
    }
  };

  // Advanced IoT Functions
  const registerIoTDevice = async (deviceData: any): Promise<void> => {
    if (!advancedIoTContract || !account)
      throw new Error("Advanced IoT contract not available");

    try {
      await advancedIoTContract.methods
        .registerAdvancedDevice(
          deviceData.deviceAddress,
          deviceData.deviceId,
          deviceData.deviceType,
          deviceData.protocol,
          deviceData.firmwareVersion,
          deviceData.enableEncryption
        )
        .send({ from: account });
    } catch (error) {
      console.error("Error registering IoT device:", error);
      throw error;
    }
  };

  const submitEncryptedSensorData = async (sensorData: any): Promise<void> => {
    if (!advancedIoTContract || !account)
      throw new Error("Advanced IoT contract not available");

    try {
      await advancedIoTContract.methods
        .submitEncryptedSensorData(
          sensorData.deviceId,
          sensorData.tokenId,
          sensorData.sensorType,
          sensorData.encryptedValue,
          sensorData.encryptedMetadata,
          sensorData.unit,
          sensorData.gpsCoordinates,
          sensorData.sequenceNumber,
          sensorData.dataHash,
          sensorData.signature
        )
        .send({ from: account });
    } catch (error) {
      console.error("Error submitting encrypted sensor data:", error);
      throw error;
    }
  };

  const createAlertRule = async (alertRule: any): Promise<number> => {
    if (!advancedIoTContract || !account)
      throw new Error("Advanced IoT contract not available");

    try {
      const result = await advancedIoTContract.methods
        .createAlertRule(
          alertRule.sensorType,
          alertRule.minThreshold,
          alertRule.maxThreshold,
          alertRule.timeWindow,
          alertRule.notificationTargets,
          alertRule.alertMessage,
          alertRule.cooldownPeriod
        )
        .send({ from: account });
      return Number(result.events.AlertRuleCreated.returnValues.ruleId);
    } catch (error) {
      console.error("Error creating alert rule:", error);
      throw error;
    }
  };

  const getIoTDashboard = async (): Promise<any> => {
    if (!advancedIoTContract)
      throw new Error("Advanced IoT contract not available");

    try {
      const result = await advancedIoTContract.methods
        .getDashboardData()
        .call();
      return {
        totalDevices: Number(result.totalDevices),
        activeDevices: Number(result.activeDevices),
        alertsLast24h: Number(result.alertsLast24h),
        dataPointsToday: Number(result.dataPointsToday),
      };
    } catch (error) {
      console.error("Error getting IoT dashboard:", error);
      throw error;
    }
  };

  // Privacy Functions
  const generateProductKeys = async (
    productId: number,
    authorizedUsers: string[]
  ): Promise<void> => {
    if (!mpcWalletContract || !account)
      throw new Error("MPC Wallet contract not available");

    try {
      await mpcWalletContract.methods
        .generateProductKeys(productId, authorizedUsers, true)
        .send({ from: account });
    } catch (error) {
      console.error("Error generating product keys:", error);
      throw error;
    }
  };

  const rotateEncryptionKeys = async (
    productId: number,
    newUsers: string[]
  ): Promise<void> => {
    if (!mpcWalletContract || !account)
      throw new Error("MPC Wallet contract not available");

    try {
      await mpcWalletContract.methods
        .rotateProductKeys(productId, newUsers)
        .send({ from: account });
    } catch (error) {
      console.error("Error rotating encryption keys:", error);
      throw error;
    }
  };

  const getUserDecryptionKey = async (productId: number): Promise<string> => {
    if (!mpcWalletContract || !account)
      throw new Error("MPC Wallet contract not available");

    try {
      const result = await mpcWalletContract.methods
        .getUserDecryptionKey(productId, account)
        .call();
      return result;
    } catch (error) {
      console.error("Error getting user decryption key:", error);
      throw error;
    }
  };

  const value: EnhancedWeb3ContextType = {
    // Basic Web3
    web3,
    account,
    isConnected,
    chainId,
    balance,
    networkConfig,

    // Contracts
    supplyChainContract,
    oracleContract,
    mpcWalletContract,
    rfidTokenizerContract,
    advancedIoTContract,

    // Basic functions
    connectWallet,
    disconnectWallet,
    switchNetwork,
    signMessage,
    sendTransaction,

    // MPC functions
    createMPCWallet,
    getMPCWalletInfo,
    proposeTransaction,
    signMPCTransaction,

    // RFID functions
    scanRFID,
    tokenizeRFID,
    getDecryptedMetadata,

    // IoT functions
    registerIoTDevice,
    submitEncryptedSensorData,
    createAlertRule,
    getIoTDashboard,

    // Privacy functions
    generateProductKeys,
    rotateEncryptionKeys,
    getUserDecryptionKey,
  };

  return (
    <EnhancedWeb3Context.Provider value={value}>
      {children}
    </EnhancedWeb3Context.Provider>
  );
};
