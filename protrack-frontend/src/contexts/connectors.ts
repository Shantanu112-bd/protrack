import { initializeConnector } from "@web3-react/core";
import { MetaMask } from "@web3-react/metamask";
import { CHAIN_ID } from "../contracts/contractConfig";

// Create MetaMask connector for web3-react v8
export const [metaMask, metaMaskHooks] = initializeConnector<MetaMask>(
  (actions) => new MetaMask({ actions })
);

// Export as injected for backward compatibility
export const injected = metaMask;
export const injectedHooks = metaMaskHooks;
