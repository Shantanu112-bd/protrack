import { createContext, useContext } from "react";

export interface Web3ContextType {
  account: string | undefined;
  chainId: number | undefined;
  isActive: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  balance?: string | null;
  error?: string | null;
}

export const Web3Context = createContext<Web3ContextType>({
  account: undefined,
  chainId: undefined,
  isActive: false,
  connectWallet: async () => {},
  disconnectWallet: async () => {},
  balance: null,
  error: null,
});

export const useWeb3 = () => useContext(Web3Context);
