import React, { useState, useEffect } from "react";
import { WalletConnectButtonProps } from "../interfaces/WalletInterfaces";
import {
  connectWallet,
  getAccount,
  getBalance,
  formatAddress,
  getNetworkName,
  disconnectWallet,
  isMetaMaskInstalled,
} from "../services/wallet/walletFunctions";

// Type definition for Ethereum provider
interface EthereumProvider {
  request(args: { method: string; params?: any[] }): Promise<any>;
  on(event: string, callback: (...args: any[]) => void): void;
  removeListener(event: string, callback: (...args: any[]) => void): void;
}

const WalletConnectButton: React.FC<WalletConnectButtonProps> = ({
  onSuccess,
  onError,
  className = "",
  buttonText = "Connect Wallet",
  connectedText = "Connected",
  showAddress = true,
  showBalance = true,
  showChainId = true,
  showDisconnect = true,
  isDark = false,
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);

  // Check if already connected on component mount
  useEffect(() => {
    const checkConnection = async () => {
      // Check if MetaMask is installed
      if (!isMetaMaskInstalled()) {
        console.warn("MetaMask is not installed");
        return;
      }

      const currentAccount = await getAccount();
      if (currentAccount) {
        setIsConnected(true);
        setAccount(currentAccount);

        // Get balance
        const accountBalance = await getBalance(currentAccount);
        setBalance(accountBalance);

        // Get chain ID
        try {
          // Type assertion to ensure compatibility
          const ethereum = window.ethereum as EthereumProvider;
          const chainId = await ethereum.request({ method: "eth_chainId" });
          setChainId(parseInt(chainId, 16));
        } catch (error) {
          console.error("Failed to get chain ID:", error);
        }
      }
    };

    checkConnection();

    // Setup event listeners
    if (isMetaMaskInstalled()) {
      // Type assertion to ensure compatibility
      const ethereum = window.ethereum as EthereumProvider;

      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected
          setIsConnected(false);
          setAccount(null);
          setBalance(null);
        } else {
          // Account changed
          setAccount(accounts[0]);
          const accountBalance = await getBalance(accounts[0]);
          setBalance(accountBalance);
        }
      };

      const handleChainChanged = (chainId: string) => {
        setChainId(parseInt(chainId, 16));
        window.location.reload();
      };

      ethereum.on("accountsChanged", handleAccountsChanged);
      ethereum.on("chainChanged", handleChainChanged);

      return () => {
        ethereum.removeListener("accountsChanged", handleAccountsChanged);
        ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, []);

  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected
      setIsConnected(false);
      setAccount(null);
      setBalance(null);
    } else {
      // Account changed
      setAccount(accounts[0]);
      const accountBalance = await getBalance(accounts[0]);
      setBalance(accountBalance);
    }
  };

  const handleChainChanged = (chainId: string) => {
    setChainId(parseInt(chainId, 16));
    window.location.reload();
  };

  const handleConnect = async () => {
    // Check if MetaMask is installed
    if (!isMetaMaskInstalled()) {
      const error = new Error(
        "MetaMask is not installed. Please install MetaMask to continue."
      );
      console.error("Failed to connect wallet:", error);
      if (onError) {
        onError(error);
      }
      return;
    }

    setIsConnecting(true);
    try {
      const { address, balance, chainId } = await connectWallet();
      setIsConnected(true);
      setAccount(address);
      setBalance(balance);
      setChainId(chainId);

      if (onSuccess) {
        onSuccess(address);
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      if (onError && error instanceof Error) {
        onError(error);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      // Try to use disconnectWallet function if available
      await disconnectWallet();
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
      if (onError && error instanceof Error) {
        onError(error);
      }
    } finally {
      // MetaMask doesn't always support programmatic disconnect
      // So we also clear our state
      setIsConnected(false);
      setAccount(null);
      setBalance(null);
      setChainId(null);
    }
  };

  return (
    <div
      className={`wallet-connect-container ${
        isDark ? "text-white" : "text-gray-900"
      }`}
    >
      {!isConnected ? (
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className={`flex items-center justify-center py-2 px-4 rounded-lg transition-all ${
            isDark
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          } ${
            isConnecting ? "opacity-70 cursor-not-allowed" : ""
          } ${className}`}
        >
          {isConnecting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Connecting...
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              {buttonText}
            </>
          )}
        </button>
      ) : (
        <div className="wallet-connected">
          <div
            className={`flex items-center ${
              isDark ? "bg-gray-800" : "bg-gray-100"
            } rounded-lg p-2`}
          >
            <div className="flex flex-col">
              <span className="font-medium">{connectedText}</span>

              {showAddress && account && (
                <span className="text-sm opacity-80">
                  {formatAddress(account)}
                </span>
              )}

              {showBalance && balance && (
                <span className="text-sm opacity-80">
                  {parseFloat(balance).toFixed(4)} ETH
                </span>
              )}

              {showChainId && chainId && (
                <span className="text-sm opacity-80">
                  {getNetworkName(chainId)}
                </span>
              )}
            </div>

            {showDisconnect && (
              <button
                onClick={handleDisconnect}
                className={`ml-3 text-sm py-1 px-2 rounded ${
                  isDark
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                Disconnect
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnectButton;
