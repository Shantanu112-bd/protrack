import React, { useEffect, useState } from "react";
import { Web3ReactProvider, useWeb3React } from "@web3-react/core";
import { CHAIN_ID } from "../contracts/contractConfig";
import { metaMask, metaMaskHooks } from "./connectors";
import { Web3Context, Web3ContextType } from "./web3ContextTypes";
import { switchNetwork } from "../utils/switchNetwork";

export const Web3ContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { account, chainId, isActive, provider } = useWeb3React();
  const [balance, setBalance] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get account balance
  const fetchBalance = async () => {
    if (account && provider) {
      try {
        const balance = await provider.getBalance(account);
        setBalance(balance.toString());
      } catch (err) {
        console.error("Failed to get balance:", err);
        setBalance(null);
      }
    }
  };

  // Update balance when account or provider changes
  useEffect(() => {
    fetchBalance();
  }, [account, provider]);

  // Connect wallet
  const connectWallet = async () => {
    try {
      setError(null);

      // First activate MetaMask
      await metaMask.activate();

      // Then switch to the correct network
      await switchNetwork(CHAIN_ID);

      localStorage.setItem("isWalletConnected", "true");
    } catch (error: unknown) {
      console.error("Failed to connect to wallet:", error);
      setError(
        error instanceof Error ? error.message : "Failed to connect wallet"
      );
    }
  };

  // Disconnect wallet
  const disconnectWallet = async () => {
    try {
      metaMask.deactivate();
      localStorage.removeItem("isWalletConnected");
    } catch (error: unknown) {
      console.error("Failed to disconnect wallet:", error);
      setError(
        error instanceof Error ? error.message : "Failed to disconnect wallet"
      );
    }
  };

  // Check wallet connection on mount
  useEffect(() => {
    const isWalletConnected = localStorage.getItem("isWalletConnected");
    if (isWalletConnected === "true") {
      connectWallet();
    }
  }, []);

  // Get account balance
  const getBalance = async () => {
    if (account && provider) {
      try {
        const balance = await provider.getBalance(account);
        setBalance(balance.toString());
      } catch (err) {
        console.error("Failed to get balance:", err);
        setBalance(null);
      }
    }
  };

  // Switch network if wrong network
  useEffect(() => {
    if (chainId && chainId !== CHAIN_ID) {
      (async () => {
        try {
          // Use our enhanced network switching utility
          await switchNetwork(CHAIN_ID);
        } catch (switchError: unknown) {
          // Only log error, don't set error state for network switching
          // This prevents annoying error messages when user rejects network switch
          console.log("Network switch not completed:", switchError);

          // Only set error if it's not a user rejection
          if (
            switchError instanceof Error &&
            !switchError.message.includes("User rejected") &&
            !switchError.message.includes("User denied")
          ) {
            setError("Please switch to the correct network in your wallet");
          }
        }
      })();
    }
  }, [chainId]);

  // Listen for account and chain changes
  useEffect(() => {
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        // Account changed, update balance
        getBalance();
      }
    };

    const handleChainChanged = () => {
      // Chain changed, reload the page to refresh all data
      // window.location.reload(); // Removed to prevent full page refresh
      // Instead, we'll let the app handle network changes gracefully
    };

    const handleDisconnect = () => {
      disconnectWallet();
    };

    // Check if ethereum is available
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ethereum = window.ethereum as any;
    if (typeof window !== "undefined" && ethereum) {
      try {
        ethereum.on("accountsChanged", handleAccountsChanged);
        ethereum.on("chainChanged", handleChainChanged);
        ethereum.on("disconnect", handleDisconnect);
      } catch (error) {
        console.warn("Could not attach Ethereum event listeners:", error);
      }

      return () => {
        try {
          if (ethereum.removeListener) {
            ethereum.removeListener("accountsChanged", handleAccountsChanged);
            ethereum.removeListener("chainChanged", handleChainChanged);
            ethereum.removeListener("disconnect", handleDisconnect);
          }
        } catch (error) {
          console.warn("Could not remove Ethereum event listeners:", error);
        }
      };
    }
  }, []);

  const value: Web3ContextType = {
    account,
    chainId,
    isActive,
    connectWallet,
    disconnectWallet,
    balance,
    error,
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
