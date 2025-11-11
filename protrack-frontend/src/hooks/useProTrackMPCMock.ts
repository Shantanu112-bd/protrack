import { useState, useEffect } from "react";

export interface Key {
  publicKey: string;
  threshold: number;
  authorizedParties: string[];
  currentSignatures: number;
  isActive: boolean;
  lastUsed: number;
  purpose: string;
}

export interface Transaction {
  keyId: string;
  operationHash: string;
  initiator: string;
  timestamp: number;
  isExecuted: boolean;
  approvalCount: number;
}

// Mock data for demonstration
const mockKeys: Record<string, Key> = {
  "0x1234567890123456789012345678901234567890123456789012345678901234": {
    publicKey:
      "0x04fdd57adec9d7e0f1d9c4e2f8f4d4d4f8f4d4d4f8f4d4d4f8f4d4d4f8f4d4d4f8f4d4d4f8f4d4d4f8f4d4d4f8f4d4d4f8f4d4d4f8f4d4d4f8f4d4d4f8f4d4d4",
    threshold: 2,
    authorizedParties: [
      "0x742d35Cc6634C0532925a3b8D4C9db96590b5e8e",
      "0x942d35Cc6634C0532925a3b8D4C9db96590b5e8e",
      "0x842d35Cc6634C0532925a3b8D4C9db96590b5e8e",
    ],
    currentSignatures: 1,
    isActive: true,
    lastUsed: Math.floor(Date.now() / 1000) - 3600,
    purpose: "Product Verification",
  },
  "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef": {
    publicKey:
      "0x04abcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
    threshold: 3,
    authorizedParties: [
      "0x742d35Cc6634C0532925a3b8D4C9db96590b5e8e",
      "0x942d35Cc6634C0532925a3b8D4C9db96590b5e8e",
      "0x842d35Cc6634C0532925a3b8D4C9db96590b5e8e",
      "0x642d35Cc6634C0532925a3b8D4C9db96590b5e8e",
    ],
    currentSignatures: 2,
    isActive: true,
    lastUsed: Math.floor(Date.now() / 1000) - 7200,
    purpose: "Supply Chain Transfer",
  },
};

const mockTransactions: Record<string, Transaction> = {
  "0x1111111111111111111111111111111111111111111111111111111111111111": {
    keyId: "0x1234567890123456789012345678901234567890123456789012345678901234",
    operationHash:
      "0x2222222222222222222222222222222222222222222222222222222222222222",
    initiator: "0x742d35Cc6634C0532925a3b8D4C9db96590b5e8e",
    timestamp: Math.floor(Date.now() / 1000) - 1800,
    isExecuted: false,
    approvalCount: 1,
  },
  "0x3333333333333333333333333333333333333333333333333333333333333333": {
    keyId:
      "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
    operationHash:
      "0x4444444444444444444444444444444444444444444444444444444444444444",
    initiator: "0x942d35Cc6634C0532925a3b8D4C9db96590b5e8e",
    timestamp: Math.floor(Date.now() / 1000) - 3600,
    isExecuted: true,
    approvalCount: 3,
  },
};

export const useProTrackMPCMock = (contractAddress: string) => {
  // Use the contractAddress parameter to avoid unused variable warning
  console.log("Contract address:", contractAddress);
  const [userRoles] = useState<string[]>(["MANUFACTURER_ROLE", "ADMIN_ROLE"]);
  const [userKeys] = useState<string[]>([
    "0x1234567890123456789012345678901234567890123456789012345678901234",
    "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
  ]);
  const [loading, setLoading] = useState(true);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Key Management
  const createKey = async (
    keyId: string,
    publicKey: string,
    threshold: number,
    parties: string[],
    purpose: string
  ) => {
    console.log("Creating key:", {
      keyId,
      publicKey,
      threshold,
      parties,
      purpose,
    });
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const getKey = async (keyId: string): Promise<Key> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockKeys[keyId] || Object.values(mockKeys)[0];
  };

  // Transaction Management
  const initiateTransaction = async (keyId: string, operationHash: string) => {
    console.log("Initiating transaction:", { keyId, operationHash });
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return "0x1111111111111111111111111111111111111111111111111111111111111111";
  };

  const approveTransaction = async (txId: string, signature: string) => {
    console.log("Approving transaction:", { txId, signature });
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const getTransaction = async (txId: string): Promise<Transaction> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockTransactions[txId] || Object.values(mockTransactions)[0];
  };

  // Product Verification
  const verifyProduct = async (
    productId: string,
    keyId: string,
    signature: string
  ) => {
    console.log("Verifying product:", { productId, keyId, signature });
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return true;
  };

  const isProductVerified = async (keyId: string, productId: string) => {
    // Use the parameters to avoid unused variable warning
    console.log("Checking verification for key:", keyId, "product:", productId);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    return true;
  };

  return {
    userRoles,
    userKeys,
    loading,
    createKey,
    getKey,
    initiateTransaction,
    approveTransaction,
    getTransaction,
    verifyProduct,
    isProductVerified,
  };
};
