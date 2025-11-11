# 🚀 ProTrack - Blockchain Supply Chain Management

A comprehensive Web3-enabled supply chain management application with advanced blockchain features, IoT integration, and modern React development.

## ✨ Features

### 🔗 Blockchain Integration
- **MetaMask Wallet Connection** - Secure Web3 authentication
- **ERC-721 NFT Minting** - Individual product tokenization
- **ERC-1155 Multi-Tokens** - Products, batches, and certificates
- **Smart Contract Escrow** - Automated payment systems
- **Oracle Integration** - IoT data verification
- **RFID Tracking System** - Advanced product tracking

### 📊 Dashboard Features
- **Blockchain Overview** - Real-time statistics and transaction history
- **NFT Product Creation** - Complete minting interface with metadata
- **IoT Dashboard** - Sensor monitoring with blockchain verification
- **Product Scanner** - QR/NFC/manual verification system
- **Multi-Token Manager** - ERC-1155 token management interface

### 🛠️ Technical Features
- **React 18 + TypeScript** - Modern development with type safety
- **Vite** - Lightning-fast development server
- **Tailwind CSS** - Utility-first styling with custom design system
- **Web3.js** - Ethereum blockchain integration
- **Responsive Design** - Mobile-first approach
- **Dark/Light Theme** - User preference support

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MetaMask browser extension

### Installation

1. **Clone and navigate to project**
   ```bash
   cd "/Users/macbook/Desktop/Pro Track/protrack-frontend"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - Navigate to `http://localhost:5173`
   - Connect your MetaMask wallet
   - Explore blockchain features!

## 🔧 VS Code Setup

For the best development experience in VS Code:

```bash
# Run automated setup
npm run setup-vscode

# Or manually
code .
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
