/**
 * Wallet-related interfaces for ProTrack components
 */

// Basic wallet connection state
export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  chainId: number | null;
  isLoading: boolean;
  error: string | null;
}

// Wallet connection button props
export interface WalletConnectButtonProps {
  onSuccess?: (address: string) => void;
  onError?: (error: Error) => void;
  className?: string;
  buttonText?: string;
  connectedText?: string;
  showAddress?: boolean;
  showBalance?: boolean;
  showChainId?: boolean;
  showDisconnect?: boolean;
  isDark?: boolean;
}

// Wallet connection component props
export interface WalletConnectionProps {
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
  showNetworkSelector?: boolean;
  isDark?: boolean;
}

// Network configuration
export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
  symbol: string;
  supplyChainAddress: string;
  oracleAddress: string;
}

// Transaction request
export interface TransactionRequest {
  to: string;
  value?: string;
  data?: string;
  gas?: number;
}

// Wallet service interface
export interface WalletService {
  connect(): Promise<WalletState>;
  disconnect(): void;
  getAccount(): Promise<string | null>;
  getBalance(address: string): Promise<string>;
  signMessage(message: string): Promise<string>;
  sendTransaction(transaction: TransactionRequest): Promise<string>;
  switchNetwork(chainId: number): Promise<void>;
}