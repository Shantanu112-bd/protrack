# ProTrack - Complete User Guide

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **MetaMask Browser Extension** - [Install here](https://metamask.io/)
- **Modern Web Browser** (Chrome, Firefox, Safari, Edge)

### Installation & Startup

1. **Navigate to the frontend directory:**

   ```bash
   cd protrack-frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the application:**

   ```bash
   npm run dev
   ```

4. **Open your browser:**
   - Landing Page: http://localhost:5173/
   - Dashboard: http://localhost:5173/dashboard

## 🎯 Application Features

### 1. **Dashboard** 📊

- **Real-time Analytics**: Live supply chain metrics
- **System Overview**: Products, shipments, and IoT data
- **Performance Metrics**: Quality scores and compliance status
- **Quick Actions**: Access to all major features

### 2. **Product Management** 📦

- **Create Products**: Add new products with RFID tags
- **NFT Minting**: Tokenize products on blockchain
- **Batch Management**: Track manufacturing batches
- **Quality Control**: Set temperature and humidity limits
- **Product Lifecycle**: Track from creation to delivery

### 3. **Shipment Tracking** 🚚

- **Create Shipments**: Request product transfers
- **Status Management**: Track approval → shipping → delivery
- **Real-time Updates**: Live shipment status
- **Multi-party Approvals**: Secure blockchain-based approvals
- **Route Visualization**: Interactive maps (coming soon)

### 4. **IoT Monitoring** 🌡️

- **Sensor Data**: Temperature, humidity, GPS tracking
- **Real-time Alerts**: Threshold violations
- **Environmental Conditions**: Monitor product safety
- **Device Management**: Register and manage IoT devices
- **Data Visualization**: Charts and graphs

### 5. **NFT Minting** 🎨

- **Product Tokenization**: Create blockchain NFTs for products
- **Metadata Management**: Store product information on IPFS
- **Ownership Transfer**: Secure blockchain-based transfers
- **Smart Contract Integration**: Automated processes

### 6. **Quality Assurance** ✅

- **Quality Checks**: Perform product inspections
- **Test Results**: Record and track quality metrics
- **Compliance Reports**: Generate compliance documentation
- **Batch Testing**: Quality control for entire batches

### 7. **Compliance Management** 📋

- **Regulatory Compliance**: Track regulatory requirements
- **Certification Management**: Store and verify certificates
- **Audit Trails**: Complete transaction history
- **Reporting**: Generate compliance reports

### 8. **Supply Chain Analytics** 📈

- **Performance Metrics**: Analyze supply chain efficiency
- **Trend Analysis**: Historical data visualization
- **Cost Optimization**: Track and optimize costs
- **Predictive Analytics**: Forecast supply chain needs

## 🔗 Wallet Connection

### Setting up MetaMask

1. **Install MetaMask** browser extension
2. **Create or Import** a wallet
3. **Connect to Local Network** (for development):
   - Network Name: `Localhost 8545`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`

### Connecting to ProTrack

1. **Click "Connect Wallet"** in the top-right corner
2. **Select MetaMask** from the options
3. **Approve the connection** in MetaMask popup
4. **Your wallet address** will appear in the header

## 📱 Using the Application

### Creating Your First Product

1. **Navigate to Products** page
2. **Click "Create Product"**
3. **Fill in product details:**
   - Product Name
   - RFID Tag (unique identifier)
   - Batch Number
   - Manufacturing Date
   - Expiry Date
   - Current Location
4. **Set environmental limits** (temperature, humidity)
5. **Click "Create Product"**

### Creating a Shipment

1. **Go to Shipments** page
2. **Click "New Shipment"**
3. **Select a product** from your inventory
4. **Choose recipient** from user list
5. **Set destination** address
6. **Set expected arrival** date
7. **Click "Create Shipment"**

### Monitoring IoT Data

1. **Visit IoT Dashboard**
2. **Register IoT devices** if needed
3. **View real-time sensor data**
4. **Set up alerts** for threshold violations
5. **Monitor environmental conditions**

## 🔧 Configuration

### Environment Variables

The application uses these key environment variables:

```env
# Supabase Database
VITE_SUPABASE_URL=https://ouryqfovixxanihagodt.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_key

# Blockchain Configuration
VITE_CHAIN_ID=31337
VITE_RPC_URL=http://127.0.0.1:8545

# Feature Flags
VITE_ENABLE_TESTNET=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_ANALYTICS=true
```

### Database Setup

The application connects to a Supabase database with the following tables:

- `users` - User accounts and wallet addresses
- `products` - Product inventory and metadata
- `shipments` - Shipment requests and tracking
- `iot_data` - Sensor readings and IoT data
- `roles` - User roles and permissions

## 🚨 Troubleshooting

### Common Issues

**1. Wallet Connection Failed**

- Ensure MetaMask is installed and unlocked
- Check network configuration
- Refresh the page and try again

**2. Transaction Failed**

- Check wallet balance (need ETH for gas)
- Ensure correct network is selected
- Try increasing gas limit

**3. Data Not Loading**

- Check internet connection
- Verify Supabase configuration
- Check browser console for errors

**4. Component Not Rendering**

- Clear browser cache
- Check for JavaScript errors in console
- Ensure all dependencies are installed

### Getting Help

1. **Check Browser Console** for error messages
2. **Verify Network Connection** and wallet setup
3. **Review Environment Variables** in `.env` file
4. **Check Component Status** in developer tools

## 🎯 Best Practices

### Security

- **Never share private keys** or seed phrases
- **Use test networks** for development
- **Verify contract addresses** before transactions
- **Keep software updated**

### Performance

- **Use modern browsers** for best performance
- **Clear cache** if experiencing issues
- **Monitor network usage** for large datasets
- **Optimize queries** for better response times

### Data Management

- **Regular backups** of important data
- **Validate input data** before submission
- **Monitor storage usage** in database
- **Clean up old records** periodically

## 📊 System Architecture

### Frontend Stack

- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Lucide React** for icons

### Backend Integration

- **Supabase** for database and real-time features
- **Web3.js** for blockchain interaction
- **Ethers.js** for smart contract integration

### Blockchain Layer

- **ProTrack.sol** - Main smart contract
- **ERC-721** NFT standard for products
- **Multi-Party Computation** for secure approvals

## 🔄 Development Workflow

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run type checking
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview
```

### Code Quality

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Development linting (more permissive)
npm run lint:dev
```

## 🎉 Success! You're Ready to Use ProTrack

Your ProTrack supply chain management system is now fully operational with:

✅ **Complete Frontend Application**
✅ **Blockchain Integration**
✅ **Database Connectivity**
✅ **Real-time Features**
✅ **IoT Monitoring**
✅ **NFT Capabilities**
✅ **Quality Assurance**
✅ **Compliance Management**

**Start exploring the features and building your supply chain solution!**

---

_For technical support or feature requests, please refer to the project documentation or contact the development team._
