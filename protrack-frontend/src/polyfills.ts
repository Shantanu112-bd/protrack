// Polyfills for browser compatibility without using eval (to comply with CSP)
import { Buffer } from "buffer";

// Make Buffer globally available for Web3 libraries
globalThis.Buffer = Buffer;

// Export for module systems
export { Buffer };
