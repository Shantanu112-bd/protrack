/**
 * Utility functions for switching networks in MetaMask
 */

// Type definition for Ethereum provider
interface EthereumProvider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on(event: string, callback: (...args: unknown[]) => void): void;
  removeListener(event: string, callback: (...args: unknown[]) => void): void;
}

// Add Ethereum chain configuration for local network (chainId 1337 = 0x539)
const LOCAL_NETWORK_CONFIG = {
  chainId: "0x539", // 1337 in hex
  chainName: "Localhost 1337",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: ["http://127.0.0.1:8545", "http://localhost:8545"],
  blockExplorerUrls: null as string[] | null,
};

/**
 * Switch to the specified chain ID
 * @param chainId - The chain ID to switch to (in decimal)
 * @returns Promise<void>
 */
export const switchNetwork = async (chainId: number): Promise<void> => {
  // Check if MetaMask is installed
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  // Type assertion to ensure compatibility
  const ethereum = window.ethereum as EthereumProvider;

  try {
    // Try to switch to the network
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
  } catch (switchError: unknown) {
    console.log("Switch network error:", switchError);

    // Handle different error codes for adding network
    let shouldAddNetwork = false;

    if (switchError instanceof Error) {
      // Check for error code 4902 (standard code for network not found)
      if (
        "code" in switchError &&
        (switchError as { code?: number }).code === 4902
      ) {
        shouldAddNetwork = true;
      }
      // Sometimes the error code might be in a different property
      else if (
        "error" in switchError &&
        typeof switchError.error === "object" &&
        switchError.error !== null &&
        "code" in switchError.error &&
        (switchError.error as { code?: number }).code === 4902
      ) {
        shouldAddNetwork = true;
      }
      // Check error message for unrecognized chain ID
      else if (
        switchError.message.includes("Unrecognized chain ID") ||
        switchError.message.includes("Chain ID not found") ||
        switchError.message.includes("unknown chain")
      ) {
        shouldAddNetwork = true;
      }
    }

    if (shouldAddNetwork) {
      try {
        console.log("Attempting to add network:", chainId);
        // Add the network to MetaMask
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            chainId === 1337
              ? LOCAL_NETWORK_CONFIG
              : {
                  chainId: `0x${chainId.toString(16)}`,
                  chainName: `Chain ${chainId}`,
                  nativeCurrency: {
                    name: "ETH",
                    symbol: "ETH",
                    decimals: 18,
                  },
                  rpcUrls: [`http://localhost:${8545 + chainId}`], // Default RPC URL pattern
                  blockExplorerUrls: null as string[] | null,
                },
          ],
        });

        // Try switching again after adding
        console.log("Network added, attempting to switch again...");
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${chainId.toString(16)}` }],
        });
      } catch (addError) {
        console.error("Failed to add network:", addError);
        throw new Error(
          `Failed to add network. Please manually add chain ID ${chainId} to your wallet.`
        );
      }
    } else {
      // User rejected the request or other error occurred
      console.error("Failed to switch network:", switchError);

      // Check if user rejected the request
      if (switchError instanceof Error) {
        if (
          switchError.message.includes("User rejected") ||
          switchError.message.includes("User denied") ||
          ("code" in switchError && (switchError as any).code === 4001)
        ) {
          // User rejected - don't throw error, just log it
          console.log("User rejected network switch");
          return; // Silently return without error
        }
      }

      // For other errors, provide a helpful message
      const errorMessage =
        switchError instanceof Error
          ? switchError.message
          : "Please try again or switch network manually in MetaMask";

      throw new Error(`Failed to switch network: ${errorMessage}`);
    }
  }
};

/**
 * Ensure we're on the correct network (1337 for local development)
 * @returns Promise<boolean> - True if on correct network, false otherwise
 */
export const ensureCorrectNetwork = async (): Promise<boolean> => {
  // Check if MetaMask is installed
  if (typeof window === "undefined" || !window.ethereum) {
    console.warn("MetaMask is not installed");
    return false;
  }

  // Type assertion to ensure compatibility
  const ethereum = window.ethereum as EthereumProvider;

  try {
    // Get current chain ID
    const chainIdHex = (await ethereum.request({
      method: "eth_chainId",
    })) as string;
    const chainId = parseInt(chainIdHex, 16);

    // Check if we're on the correct network (1337 for local development)
    if (chainId === 1337) {
      return true;
    }

    // Try to switch to the correct network
    await switchNetwork(1337);
    return true;
  } catch (error) {
    console.error("Failed to ensure correct network:", error);
    return false;
  }
};

export default {
  switchNetwork,
  ensureCorrectNetwork,
};
