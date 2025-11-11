import React, { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useWeb3 } from "../hooks/useWeb3";
import NFTService from "../services/nftService";
import type { ProductNFTData, SupplyChainEvent } from "../services/nftService";
import OracleService from "../services/oracleService";
import type { IoTDataPoint, GPSDataPoint } from "../services/oracleService";

interface BlockchainContextType {
  // NFT Functions
  mintProductNFT: (
    productData: ProductNFTData
  ) => Promise<{ tokenId: number; txHash: string }>;
  getProductData: (tokenId: number) => Promise<ProductNFTData>;
  addSupplyChainEvent: (
    tokenId: number,
    event: string,
    data: Record<string, unknown>
  ) => Promise<string>;
  getSupplyChainHistory: (tokenId: number) => Promise<SupplyChainEvent[]>;

  // Escrow Functions
  createEscrow: (
    tokenId: number,
    seller: string,
    amount: string,
    deliveryLocation?: string
  ) => Promise<{ escrowId: number; txHash: string }>;
  releaseEscrowPayment: (escrowId: number) => Promise<string>;
  triggerPenalty: (escrowId: number, reason: string) => Promise<string>;

  // Oracle Functions
  submitIoTData: (
    data: Omit<IoTDataPoint, "verified" | "txHash" | "blockNumber">
  ) => Promise<string>;
  submitGPSData: (
    data: Omit<GPSDataPoint, "verified" | "txHash" | "blockNumber">
  ) => Promise<string>;
  verifyIoTData: (deviceId: string, timestamp: number) => Promise<boolean>;
  monitorSLA: (
    shipmentId: string,
    conditions: Record<string, unknown>
  ) => Promise<Record<string, unknown>>;

  // State
  totalNFTs: number;
  recentTransactions: BlockchainTransaction[];
  isLoading: boolean;
  error: string | null;
}

interface BlockchainTransaction {
  id: string;
  type:
    | "mint"
    | "transfer"
    | "escrow"
    | "iot_data"
    | "gps_data"
    | "sla_violation";
  txHash: string;
  timestamp: number;
  description: string;
  status: "pending" | "confirmed" | "failed";
  blockNumber?: number;
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(
  undefined
);

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error("useBlockchain must be used within a BlockchainProvider");
  }
  return context;
};

interface BlockchainProviderProps {
  children: ReactNode;
}

export const BlockchainProvider: React.FC<BlockchainProviderProps> = ({
  children,
}) => {
  const { account, isActive: isConnected } = useWeb3();
  const [nftService, setNftService] = useState<NFTService | null>(null);
  const [oracleService, setOracleService] = useState<OracleService | null>(
    null
  );
  const [totalNFTs, setTotalNFTs] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<
    BlockchainTransaction[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize services when wallet is connected
  useEffect(() => {
    if (account && isConnected) {
      // For demo purposes, we'll use mock services
      console.log("Initializing blockchain services for account:", account);
      // In a real implementation, you would initialize web3 services here
      setNftService({} as NFTService); // Mock for now
      setOracleService({} as OracleService); // Mock for now
      loadInitialData();
    } else {
      setNftService(null);
      setOracleService(null);
      setTotalNFTs(0);
      setRecentTransactions([]);
    }
  }, [account, isConnected]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      // Load demo data
      setTotalNFTs(1247); // Demo value matching the UI
      setRecentTransactions(generateDemoTransactions());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const addTransaction = (
    transaction: Omit<BlockchainTransaction, "id" | "timestamp">
  ) => {
    const newTransaction: BlockchainTransaction = {
      ...transaction,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };
    setRecentTransactions((prev) => [newTransaction, ...prev.slice(0, 9)]); // Keep last 10
  };

  // NFT Functions
  const mintProductNFT = async (productData: ProductNFTData) => {
    if (!nftService) throw new Error("NFT service not initialized");

    try {
      setIsLoading(true);
      const result = await nftService.mintProductNFT(productData);

      addTransaction({
        type: "mint",
        txHash: result.txHash,
        description: `Minted NFT for ${productData.name}`,
        status: "confirmed",
      });

      setTotalNFTs((prev) => prev + 1);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mint NFT");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getProductData = async (tokenId: number) => {
    if (!nftService) throw new Error("NFT service not initialized");
    return await nftService.getProductData(tokenId);
  };

  const addSupplyChainEvent = async (
    tokenId: number,
    event: string,
    data: Record<string, unknown>
  ) => {
    if (!nftService) throw new Error("NFT service not initialized");

    try {
      const txHash = await nftService.addSupplyChainEvent(tokenId, event, data);

      addTransaction({
        type: "transfer",
        txHash,
        description: `Added ${event} event to token #${tokenId}`,
        status: "confirmed",
      });

      return txHash;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add supply chain event"
      );
      throw err;
    }
  };

  const getSupplyChainHistory = async (tokenId: number) => {
    if (!nftService) throw new Error("NFT service not initialized");
    return await nftService.getSupplyChainHistory(tokenId);
  };

  // Escrow Functions
  const createEscrow = async (
    tokenId: number,
    seller: string,
    amount: string,
    deliveryLocation?: string
  ) => {
    if (!nftService) throw new Error("NFT service not initialized");

    try {
      const result = await nftService.createEscrow(
        tokenId,
        seller,
        amount,
        deliveryLocation
      );

      addTransaction({
        type: "escrow",
        txHash: result.txHash,
        description: `Created escrow for ${amount} ETH`,
        status: "confirmed",
      });

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create escrow");
      throw err;
    }
  };

  const releaseEscrowPayment = async (escrowId: number) => {
    if (!nftService) throw new Error("NFT service not initialized");

    try {
      const txHash = await nftService.releaseEscrowPayment(escrowId);

      addTransaction({
        type: "escrow",
        txHash,
        description: `Released escrow payment #${escrowId}`,
        status: "confirmed",
      });

      return txHash;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to release escrow payment"
      );
      throw err;
    }
  };

  const triggerPenalty = async (escrowId: number, reason: string) => {
    if (!nftService) throw new Error("NFT service not initialized");

    try {
      const txHash = await nftService.triggerPenalty(escrowId, reason);

      addTransaction({
        type: "sla_violation",
        txHash,
        description: `Triggered penalty: ${reason}`,
        status: "confirmed",
      });

      return txHash;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to trigger penalty"
      );
      throw err;
    }
  };

  // Oracle Functions
  const submitIoTData = async (
    data: Omit<IoTDataPoint, "verified" | "txHash" | "blockNumber">
  ) => {
    if (!oracleService) throw new Error("Oracle service not initialized");

    try {
      const txHash = await oracleService.submitIoTData(data);

      addTransaction({
        type: "iot_data",
        txHash,
        description: `Submitted ${data.sensorType} data: ${data.value}${data.unit}`,
        status: "confirmed",
      });

      return txHash;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit IoT data"
      );
      throw err;
    }
  };

  const submitGPSData = async (
    data: Omit<GPSDataPoint, "verified" | "txHash" | "blockNumber">
  ) => {
    if (!oracleService) throw new Error("Oracle service not initialized");

    try {
      const txHash = await oracleService.submitGPSData(data);

      addTransaction({
        type: "gps_data",
        txHash,
        description: `Submitted GPS data for ${data.shipmentId}`,
        status: "confirmed",
      });

      return txHash;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit GPS data"
      );
      throw err;
    }
  };

  const verifyIoTData = async (deviceId: string, timestamp: number) => {
    if (!oracleService) throw new Error("Oracle service not initialized");
    return await oracleService.verifyIoTData(deviceId, timestamp);
  };

  const monitorSLA = async (
    shipmentId: string,
    conditions: Record<string, unknown>
  ) => {
    if (!oracleService) throw new Error("Oracle service not initialized");
    return await oracleService.monitorSLA(shipmentId, conditions);
  };

  const value: BlockchainContextType = {
    // NFT Functions
    mintProductNFT,
    getProductData,
    addSupplyChainEvent,
    getSupplyChainHistory,

    // Escrow Functions
    createEscrow,
    releaseEscrowPayment,
    triggerPenalty,

    // Oracle Functions
    submitIoTData,
    submitGPSData,
    verifyIoTData,
    monitorSLA,

    // State
    totalNFTs,
    recentTransactions,
    isLoading,
    error,
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
};

// Generate demo transactions for initial display
function generateDemoTransactions(): BlockchainTransaction[] {
  const types: BlockchainTransaction["type"][] = [
    "mint",
    "transfer",
    "escrow",
    "iot_data",
    "gps_data",
  ];
  const descriptions: Record<BlockchainTransaction["type"], string[]> = {
    mint: [
      "Minted Organic Milk NFT",
      "Minted Premium Cheese NFT",
      "Minted Farm Fresh Eggs NFT",
    ],
    transfer: [
      "Transferred to Distributor",
      "Quality check completed",
      "Shipped to retailer",
    ],
    escrow: [
      "Created escrow for $5000",
      "Released payment to farmer",
      "Penalty triggered for delay",
    ],
    iot_data: [
      "Temperature: 4.2°C recorded",
      "Humidity: 65% recorded",
      "Vibration: 2.1g recorded",
    ],
    gps_data: [
      "GPS location updated",
      "Shipment arrived at warehouse",
      "Route deviation detected",
    ],
    sla_violation: [
      "SLA violation detected",
      "Temperature threshold exceeded",
      "Delivery delay penalty",
    ],
  };

  return Array.from({ length: 8 }, (_, i) => {
    const type = types[Math.floor(Math.random() * types.length)];
    const typeDescriptions = descriptions[type];

    return {
      id: Math.random().toString(36).substr(2, 9),
      type,
      txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      timestamp: Date.now() - i * 15 * 60 * 1000, // 15 minutes apart
      description:
        typeDescriptions[Math.floor(Math.random() * typeDescriptions.length)],
      status: Math.random() > 0.1 ? "confirmed" : "pending",
      blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
    };
  });
}

export default BlockchainContext;
