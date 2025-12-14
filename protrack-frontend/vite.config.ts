import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5174,
    strictPort: true,
    // Enable CORS for development
    cors: true,
    // Add headers to bypass CSP restrictions in development
    headers: {
      "Content-Security-Policy":
        "default-src 'self' http://localhost:8545 http://127.0.0.1:8545; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' http://localhost:8545 http://127.0.0.1:8545 ws://localhost:5174; img-src 'self' data:;",
    },
  },
  // Handle buffer module for Web3 libraries
  resolve: {
    alias: {
      buffer: "buffer",
    },
  },
  define: {
    global: "globalThis",
  },
  // Polyfill buffer for browser compatibility
  optimizeDeps: {
    include: ["buffer"],
  },
  build: {
    rollupOptions: {
      external: [], // Don't externalize buffer
      output: {
        globals: {
          buffer: "Buffer",
        },
      },
    },
  },
});
