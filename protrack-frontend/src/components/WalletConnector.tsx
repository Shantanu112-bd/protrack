import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Wallet, Copy, Check, ExternalLink, AlertCircle } from "lucide-react";

const WalletConnector = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("0.0");
  const [chainId, setChainId] = useState<string>("Unknown");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if wallet is already connected
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });

          if (accounts.length > 0) {
            setAccount(accounts[0]);
            await fetchAccountData(accounts[0]);
          }

          // Listen for account changes
          window.ethereum.on("accountsChanged", handleAccountsChanged);
          window.ethereum.on("chainChanged", handleChainChanged);
        } catch (err) {
          console.error("Error checking connection:", err);
        }
      }
    };

    checkConnection();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      // Disconnected
      setAccount(null);
      setBalance("0.0");
    } else {
      // Connected or switched accounts
      setAccount(accounts[0]);
      fetchAccountData(accounts[0]);
    }
  };

  const handleChainChanged = (_chainId: string) => {
    // Refresh the page or update chain info
    window.location.reload();
  };

  const fetchAccountData = async (address: string) => {
    try {
      // Get balance
      const balanceWei = await window.ethereum.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      });

      // Convert wei to ETH
      const balanceEth = (parseInt(balanceWei, 16) / 1e18).toFixed(4);
      setBalance(balanceEth);

      // Get chain ID
      const chainIdHex = await window.ethereum.request({
        method: "eth_chainId",
      });

      const chainIdDecimal = parseInt(chainIdHex, 16);
      setChainId(getChainName(chainIdDecimal));
    } catch (err) {
      console.error("Error fetching account data:", err);
    }
  };

  const getChainName = (chainId: number) => {
    switch (chainId) {
      case 1:
        return "Ethereum Mainnet";
      case 5:
        return "Goerli Testnet";
      case 137:
        return "Polygon";
      case 80001:
        return "Mumbai Testnet";
      case 1337:
        return "Local Hardhat";
      default:
        return `Chain ID: ${chainId}`;
    }
  };

  const connectWallet = async () => {
    setError(null);

    if (typeof window.ethereum === "undefined") {
      setError("MetaMask is not installed. Please install it to continue.");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      setAccount(accounts[0]);
      await fetchAccountData(accounts[0]);
    } catch (err: any) {
      if (err.code === 4001) {
        setError("Connection rejected by user");
      } else {
        setError("Failed to connect wallet");
        console.error("Error connecting wallet:", err);
      }
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setBalance("0.0");
    setChainId("Unknown");
  };

  const copyToClipboard = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const viewOnExplorer = () => {
    if (account) {
      // Open in block explorer (example for Ethereum mainnet)
      window.open(`https://etherscan.io/address/${account}`, "_blank");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wallet className="mr-2 h-5 w-5" />
          Wallet Connection
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </div>
        )}

        {!account ? (
          <div className="text-center py-8">
            <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Connect Your Wallet</h3>
            <p className="text-muted-foreground mb-4">
              Connect with MetaMask or another Web3 wallet to interact with
              ProTrack
            </p>
            <Button onClick={connectWallet} size="lg">
              Connect Wallet
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Connected Account</h3>
                <div className="flex items-center mt-1">
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {account.substring(0, 6)}...
                    {account.substring(account.length - 4)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyToClipboard}
                    className="ml-2"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={viewOnExplorer}
                    className="ml-1"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Badge variant="secondary">{chainId}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm text-blue-700">Balance</p>
                <p className="font-medium">{balance} ETH</p>
              </div>
              <div className="bg-green-50 p-3 rounded-md">
                <p className="text-sm text-green-700">Status</p>
                <p className="font-medium text-green-600">Connected</p>
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <Button
                onClick={disconnectWallet}
                variant="outline"
                className="flex-1"
              >
                Disconnect
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletConnector;
