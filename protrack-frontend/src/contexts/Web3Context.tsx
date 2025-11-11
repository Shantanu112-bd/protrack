import React, { useEffect } from "react";
import { Web3ReactProvider, useWeb3React } from "@web3-react/core";
import { CHAIN_ID } from "../contracts/contractConfig";
import { metaMask, metaMaskHooks } from "./connectors";
import { Web3Context, Web3ContextType } from "./web3ContextTypes";

// Type for Ethereum provider
interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}

export const Web3ContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { account, chainId, isActive } = useWeb3React();

  // Connect wallet
  const connectWallet = async () => {
    try {
      await metaMask.activate();
      localStorage.setItem("isWalletConnected", "true");
    } catch (error) {
      console.error("Failed to connect to wallet:", error);
    }
  };

  // Disconnect wallet
  const disconnectWallet = async () => {
    try {
      await metaMask.deactivate();
      localStorage.removeItem("isWalletConnected");
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    }
  };

  // Auto connect if previously connected
  useEffect(() => {
    const connectWalletOnPageLoad = async () => {
      if (localStorage.getItem("isWalletConnected") === "true") {
        try {
          await metaMask.connectEagerly();
        } catch (error) {
          console.error("Failed to auto-connect wallet:", error);
        }
      }
    };
    connectWalletOnPageLoad();
  }, []);

  // Switch network if wrong network
  useEffect(() => {
    if (chainId && chainId !== CHAIN_ID) {
      (async () => {
        try {
          if (
            typeof window !== "undefined" &&
            (window.ethereum as EthereumProvider)
          ) {
            await (window.ethereum as EthereumProvider).request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: `0x${CHAIN_ID.toString(16)}` }],
            });
          }
        } catch (error) {
          console.error("Failed to switch network:", error);
        }
      })();
    }
  }, [chainId]);

  const value: Web3ContextType = {
    account,
    chainId,
    isActive,
    connectWallet,
    disconnectWallet,
  };

  // Always render children, even if not initialized
  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <Web3ReactProvider connectors={[[metaMask, metaMaskHooks]]}>
      <Web3ContextProvider>{children}</Web3ContextProvider>
    </Web3ReactProvider>
  );
};
