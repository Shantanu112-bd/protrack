import { createContext } from "react";

export interface Web3ContextType {
  account: string | undefined;
  chainId: number | undefined;
  isActive: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
}

export const Web3Context = createContext<Web3ContextType>({
  account: undefined,
  chainId: undefined,
  isActive: false,
  connectWallet: async () => {},
  disconnectWallet: async () => {},
});
