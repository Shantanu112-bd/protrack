import { useEffect, useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import ProTrackMPCABI from '../contracts/ProTrackMPC.json';

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

export const useProTrackMPC = (contractAddress: string) => {
  const { account, library } = useWeb3React();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [userKeys, setUserKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize contract
  useEffect(() => {
    if (library && account) {
      const signer = library.getSigner();
      const mpcContract = new ethers.Contract(contractAddress, ProTrackMPCABI, signer);
      setContract(mpcContract);
      loadUserInfo();
    }
  }, [library, account, contractAddress]);

  // Load user roles and keys
  const loadUserInfo = useCallback(async () => {
    if (!contract || !account) return;
    
    try {
      setLoading(true);
      const roles = [];
      const ROLES = [
        'MANUFACTURER_ROLE',
        'SUPPLIER_ROLE',
        'DISTRIBUTOR_ROLE',
        'ORACLE_ROLE',
        'ADMIN_ROLE'
      ];

      for (const role of ROLES) {
        const roleHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(role));
        const hasRole = await contract.hasRole(roleHash, account);
        if (hasRole) roles.push(role);
      }

      const keys = await contract.getUserKeys(account);
      
      setUserRoles(roles);
      setUserKeys(keys);
    } catch (error) {
      console.error('Error loading user info:', error);
    } finally {
      setLoading(false);
    }
  }, [contract, account]);

  // Key Management
  const createKey = async (
    keyId: string,
    publicKey: string,
    threshold: number,
    parties: string[],
    purpose: string
  ) => {
    if (!contract) throw new Error('Contract not initialized');
    const tx = await contract.createKey(keyId, publicKey, threshold, parties, purpose);
    await tx.wait();
  };

  const getKey = async (keyId: string): Promise<Key> => {
    if (!contract) throw new Error('Contract not initialized');
    const key = await contract.getKey(keyId);
    return {
      publicKey: key.publicKey,
      threshold: key.threshold.toNumber(),
      authorizedParties: key.authorizedParties,
      currentSignatures: key.currentSignatures.toNumber(),
      isActive: key.isActive,
      lastUsed: key.lastUsed.toNumber(),
      purpose: key.purpose
    };
  };

  // Transaction Management
  const initiateTransaction = async (keyId: string, operationHash: string) => {
    if (!contract) throw new Error('Contract not initialized');
    const tx = await contract.initiateTransaction(keyId, operationHash);
    const receipt = await tx.wait();
    const event = receipt.events?.find(e => e.event === 'TransactionInitiated');
    return event?.args?.txId;
  };

  const approveTransaction = async (txId: string, signature: string) => {
    if (!contract) throw new Error('Contract not initialized');
    const tx = await contract.approveTransaction(txId, signature);
    await tx.wait();
  };

  const getTransaction = async (txId: string): Promise<Transaction> => {
    if (!contract) throw new Error('Contract not initialized');
    const tx = await contract.getTransaction(txId);
    return {
      keyId: tx.keyId,
      operationHash: tx.operationHash,
      initiator: tx.initiator,
      timestamp: tx.timestamp.toNumber(),
      isExecuted: tx.isExecuted,
      approvalCount: tx.approvalCount.toNumber()
    };
  };

  // Product Verification
  const verifyProduct = async (productId: string, keyId: string, signature: string) => {
    if (!contract) throw new Error('Contract not initialized');
    const tx = await contract.verifyProduct(productId, keyId, signature);
    const receipt = await tx.wait();
    const event = receipt.events?.find(e => e.event === 'ProductVerified');
    return event?.args?.success;
  };

  const isProductVerified = async (keyId: string, productId: string) => {
    if (!contract) throw new Error('Contract not initialized');
    return await contract.isProductVerified(keyId, productId);
  };

  // Event Listeners
  useEffect(() => {
    if (!contract) return;

    const keyCreatedFilter = contract.filters.KeyCreated();
    const transactionInitiatedFilter = contract.filters.TransactionInitiated();
    const productVerifiedFilter = contract.filters.ProductVerified();

    const handleKeyCreated = (...args) => {
      console.log('Key Created:', args);
      loadUserInfo();
    };

    const handleTransactionInitiated = (...args) => {
      console.log('Transaction Initiated:', args);
    };

    const handleProductVerified = (...args) => {
      console.log('Product Verified:', args);
    };

    contract.on(keyCreatedFilter, handleKeyCreated);
    contract.on(transactionInitiatedFilter, handleTransactionInitiated);
    contract.on(productVerifiedFilter, handleProductVerified);

    return () => {
      contract.off(keyCreatedFilter, handleKeyCreated);
      contract.off(transactionInitiatedFilter, handleTransactionInitiated);
      contract.off(productVerifiedFilter, handleProductVerified);
    };
  }, [contract]);

  return {
    contract,
    userRoles,
    userKeys,
    loading,
    createKey,
    getKey,
    initiateTransaction,
    approveTransaction,
    getTransaction,
    verifyProduct,
    isProductVerified
  };
};