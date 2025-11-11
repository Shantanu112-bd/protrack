# Running ProTrack Frontend

## Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)

## Installation

1. Navigate to the frontend directory:

   ```bash
   cd protrack-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Development Server

To start the development server:

```bash
npm run dev
```

The application will be available at: http://localhost:5173

### Different Modes

1. **Normal Mode**: http://localhost:5173

   - Landing page with sign-in and demo options

2. **Sign In Page**: http://localhost:5173/signin

   - User authentication and role selection

3. **Dashboard**: http://localhost:5173/dashboard

   - Main application dashboard (requires wallet connection)

4. **Integrated Demo**: http://localhost:5173/integrated-demo

   - Full functionality demo without blockchain dependencies

5. **Browser Demo**: http://localhost:5173/?browser-demo=true

   - Browser-only demo with simulated blockchain interactions

6. **Simple Demo**: http://localhost:5173/?demo=true
   - Simplified demo mode

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - Run TypeScript type checking

## Wallet Connection

To use the full application features, you'll need to connect a wallet:

1. Install MetaMask browser extension
2. Create or import a wallet
3. Connect to the application when prompted
4. Select your role in the supply chain

For development, the application is configured to work with a local Hardhat network (Chain ID: 1337).
