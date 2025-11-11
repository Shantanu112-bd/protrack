// Health check utility to verify system status
import { CONTRACT_ADDRESSES, NETWORK_CONFIG } from '../config/contractConfig';

export interface HealthStatus {
  frontend: boolean;
  contracts: boolean;
  blockchain: boolean;
  configuration: boolean;
  overall: 'healthy' | 'warning' | 'error';
}

export function performHealthCheck(): HealthStatus {
  const status: HealthStatus = {
    frontend: true, // If this code runs, frontend is working
    contracts: false,
    blockchain: false,
    configuration: false,
    overall: 'error'
  };

  try {
    // Check if contract addresses are loaded
    status.contracts = !!(
      CONTRACT_ADDRESSES.SUPPLY_CHAIN &&
      CONTRACT_ADDRESSES.MPC_WALLET &&
      CONTRACT_ADDRESSES.RFID_TOKENIZER &&
      CONTRACT_ADDRESSES.ADVANCED_IOT &&
      CONTRACT_ADDRESSES.ORACLE
    );

    // Check if network configuration is loaded
    status.configuration = !!(
      NETWORK_CONFIG.chainId &&
      NETWORK_CONFIG.rpcUrl &&
      NETWORK_CONFIG.name
    );

    // Check if we can access Web3 (MetaMask detection)
    status.blockchain = typeof window !== 'undefined' && 
                       typeof (window as any).ethereum !== 'undefined';

    // Determine overall status
    if (status.frontend && status.contracts && status.configuration) {
      status.overall = status.blockchain ? 'healthy' : 'warning';
    } else {
      status.overall = 'error';
    }

  } catch (error) {
    console.error('Health check failed:', error);
    status.overall = 'error';
  }

  return status;
}

export function getHealthSummary(): string {
  const status = performHealthCheck();
  
  const messages = [];
  if (status.frontend) messages.push('✅ Frontend: Running');
  if (status.contracts) messages.push('✅ Smart Contracts: Deployed');
  if (status.configuration) messages.push('✅ Configuration: Loaded');
  if (status.blockchain) messages.push('✅ MetaMask: Available');
  else messages.push('⚠️ MetaMask: Not detected');

  return `ProTrack Health Status: ${status.overall.toUpperCase()}\n${messages.join('\n')}`;
}

// Log health status on import (for debugging)
if (typeof window !== 'undefined') {
  console.log(getHealthSummary());
}
