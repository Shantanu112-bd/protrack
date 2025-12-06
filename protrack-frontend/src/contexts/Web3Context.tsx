import React, { useEffect, useState } from "react";
import { Web3ReactProvider, useWeb3React } from "@web3-react/core";
import { CHAIN_ID, RPC_URL } from "../contracts/contractConfig";
import { metaMask, metaMaskHooks } from "./connectors";
import { Web3Context, Web3ContextType } from "./web3ContextTypes";

export const Web3ContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { account, chainId, isActive } = useWeb3React();
  const [balance, setBalance] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Connect wallet
  const connectWallet = async () => {
    try {
      setError(null);
      await metaMask.activate();
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
      await metaMask.deactivate();
      localStorage.removeItem("isWalletConnected");
      setBalance(null);
      setError(null);
    } catch (error: unknown) {
      console.error("Failed to disconnect wallet:", error);
      setError(
        error instanceof Error ? error.message : "Failed to disconnect wallet"
      );
    }
  };

  // Get account balance
  const getBalance = async () => {
    if (
      account &&
      isActive &&
      typeof window !== "undefined" &&
      window.ethereum
    ) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ethereum = window.ethereum as any;
        if (!ethereum) return;

        const balance = await ethereum.request({
          method: "eth_getBalance",
          params: [account, "latest"],
        });
        // Convert from wei to ETH
        const balanceStr = String(balance);
        const balanceInEth = parseFloat(balanceStr) / 1e18;
        setBalance(balanceInEth.toFixed(4) + " ETH");
      } catch (error) {
        console.error("Failed to fetch balance:", error);
      }
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

  // Get balance when account changes
  useEffect(() => {
    if (account && isActive) {
      getBalance();
    } else {
      setBalance(null);
    }
  }, [account, isActive]);

  // Switch network if wrong network
  useEffect(() => {
    if (chainId && chainId !== CHAIN_ID) {
      (async () => {
        try {
          if (typeof window !== "undefined" && window.ethereum) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const ethereum = window.ethereum as any;
            if (!ethereum) return;

            await ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: `0x${CHAIN_ID.toString(16)}` }],
            });
          }
        } catch (switchError: unknown) {
          // This error code indicates that the chain has not been added to MetaMask
          if (
            switchError instanceof Error &&
            "code" in switchError &&
            (switchError as { code?: number }).code === 4902
          ) {
            try {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const ethereum = window.ethereum as any;
              if (!ethereum) return;

              await ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: `0x${CHAIN_ID.toString(16)}`,
                    chainName: "Hardhat Local",
                    rpcUrls: [RPC_URL],
                    nativeCurrency: {
                      name: "ETH",
                      symbol: "ETH",
                      decimals: 18,
                    },
                  },
                ],
              });
            } catch (addError) {
              console.error("Failed to add network:", addError);
              setError("Please manually add the network to your wallet");
            }
          } else {
            console.error("Failed to switch network:", switchError);
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
