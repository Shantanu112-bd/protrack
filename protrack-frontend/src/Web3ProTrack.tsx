import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import Web3 from "web3";
import NFTService from "./services/nftService";

// Web3 Enhanced ProTrack Dashboard
const Web3ProTrack = () => {
  // Existing state
  const [currentPage, setCurrentPage] = useState("login");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState("Checking...");
  const [loginData, setLoginData] = useState({
    email: "admin@protrack.com",
    password: "password",
  });

  // Web3 state
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [walletBalance, setWalletBalance] = useState("0");
  const [provider, setProvider] = useState<any>(null);
  const [signer, setSigner] = useState<any>(null);
  const [nftService, setNftService] = useState<any>(null);
  const [nftProducts, setNftProducts] = useState<any[]>([]);
  const [blockchainStatus, setBlockchainStatus] = useState("Disconnected");

  // API Configuration
  const API_BASE_URL = "http://localhost:3001/api/v1";

  // Check API status on component mount
  useEffect(() => {
    checkApiStatus();
    loadProducts();
    checkBlockchainStatus();
  }, []);

  // Check if backend API is running
  const checkApiStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/status`);
      const data = await response.json();
      setApiStatus(data.success ? "Connected ✅" : "Error ❌");
    } catch (error) {
      setApiStatus("Disconnected ❌");
    }
  };

  // Check blockchain status
  const checkBlockchainStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/blockchain/status`);
      const data = await response.json();
      setBlockchainStatus(data.success ? "Connected ✅" : "Disconnected ❌");
    } catch (error) {
      setBlockchainStatus("Disconnected ❌");
    }
  };

  // Connect Web3 wallet
  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== "undefined") {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const balance = await provider.getBalance(accounts[0]);

        // Initialize NFT Service
        const web3 = new Web3(window.ethereum);
        const nftServiceInstance = new NFTService(web3, accounts[0]);

        setProvider(provider);
        setSigner(signer);
        setNftService(nftServiceInstance);
        setWalletAddress(accounts[0]);
        setWalletBalance(ethers.formatEther(balance));
        setWalletConnected(true);

        // Load NFT products after wallet connection
        loadNftProducts();
      } else {
        alert("Please install MetaMask to connect your wallet");
      }
    } catch (error) {
      console.error("Wallet connection failed:", error);
      alert("Failed to connect wallet");
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress("");
    setWalletBalance("0");
    setProvider(null);
    setSigner(null);
    setNftProducts([]);
  };

  // Load NFT products
  const loadNftProducts = async () => {
    if (!walletConnected || !nftService) return;

    setLoading(true);
    try {
      // For now, we'll create some demo NFTs since we can't query all NFTs easily
      // In a real app, you'd query the blockchain for owned NFTs
      const demoNfts = [
        {
          id: "NFT-001",
          name: "Demo Coffee Bean NFT",
          image: "☕",
          tokenId: 1,
          owner: walletAddress,
          metadata: { origin: "Colombia", batch: "2024-A" },
        },
        {
          id: "NFT-002",
          name: "Demo Tea Leaf NFT",
          image: "🍃",
          tokenId: 2,
          owner: walletAddress,
          metadata: { origin: "India", batch: "2024-B" },
        },
      ];
      setNftProducts(demoNfts);
    } catch (error) {
      console.error("Failed to load NFT products:", error);
      alert("Failed to load NFT products");
    }
    setLoading(false);
  };

  // Mint new NFT product
  const mintNftProduct = async (productData) => {
    if (!walletConnected || !nftService) {
      alert("Please connect your wallet first");
      return;
    }

    setLoading(true);
    try {
      // Create product data for NFT
      const nftData = NFTService.generateDemoNFTData(productData.name);

      // Mint the NFT on the blockchain
      const result = await nftService.mintProductNFT(nftData);

      // Add to local state
      const newNft = {
        id: `NFT-${result.tokenId}`,
        name: productData.name,
        image: "📦",
        tokenId: result.tokenId,
        owner: walletAddress,
        metadata: productData,
        txHash: result.txHash,
      };

      setNftProducts([...nftProducts, newNft]);
      alert(`NFT Product minted successfully! Token ID: ${result.tokenId}`);
    } catch (error) {
      console.error("Failed to mint NFT:", error);
      alert("Failed to mint NFT product: " + error.message);
    }
    setLoading(false);
  };

  // Transfer NFT
  const transferNft = async (nftId, toAddress) => {
    if (!walletConnected || !nftService) {
      alert("Please connect your wallet first");
      return;
    }

    setLoading(true);
    try {
      // Extract tokenId from nftId (format: NFT-{tokenId})
      const tokenId = parseInt(nftId.split('-')[1]);

      // Note: The NFTService doesn't have a transfer method yet
      // For now, we'll show a message that transfer is not implemented
      alert(`Transfer functionality is being implemented. Token ID: ${tokenId}, To: ${toAddress}`);

      // TODO: Implement transfer in NFTService and call it here
      // const result = await nftService.transferNFT(tokenId, toAddress);
      // Remove from local state or update ownership
      // setNftProducts(nftProducts.filter((nft) => nft.id !== nftId));

    } catch (error) {
      console.error("Transfer failed:", error);
      alert("Transfer failed: " + error.message);
    }
    setLoading(false);
  };

  // Load products from backend
  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      const data = await response.json();
      if (data.success) {
        setProducts(data.data.products || []);
      }
    } catch (error) {
      console.error("Failed to load products:", error);
    }
    setLoading(false);
  };

  // Login function with API call
  const login = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });
      const data = await response.json();
      if (data.success) {
        setCurrentPage("dashboard");
        loadProducts();
      } else {
        alert("Login failed: " + data.message);
      }
    } catch (error) {
      alert("Login error: " + error.message);
    }
    setLoading(false);
  };

  // Create a new product
  const createProduct = async (productData) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });
      const data = await response.json();
      if (data.success) {
        loadProducts();
        alert("Product created successfully!");
      } else {
        alert("Failed to create product: " + data.message);
      }
    } catch (error) {
      alert("Error creating product: " + error.message);
    }
    setLoading(false);
  };

  const logout = () => setCurrentPage("login");
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Theme classes
  const theme = {
    bg: isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900",
    card: isDarkMode
      ? "bg-gray-800 border-gray-700"
      : "bg-white border-gray-200",
    input: isDarkMode
      ? "bg-gray-700 border-gray-600 text-white"
      : "bg-white border-gray-300 text-gray-900",
  };

  // Login Page Component
  if (currentPage === "login") {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${theme.bg}`}
      >
        <div className={`w-96 p-8 rounded-2xl border shadow-xl ${theme.card}`}>
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">
              Pro<span className="text-blue-500">Track</span>
            </h1>
            <p className="text-gray-500 mt-2">Web3 Supply Chain Management</p>
          </div>

          {/* Status Indicators */}
          <div className="text-center mb-4 space-y-2">
            <div>
              <span className="text-sm">Backend API: </span>
              <span
                className={`text-sm font-semibold ${
                  apiStatus.includes("✅") ? "text-green-500" : "text-red-500"
                }`}
              >
                {apiStatus}
              </span>
            </div>
            <div>
              <span className="text-sm">Blockchain: </span>
              <span
                className={`text-sm font-semibold ${
                  blockchainStatus.includes("✅")
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {blockchainStatus}
              </span>
            </div>
          </div>

          {/* Wallet Connection */}
          <div className="mb-6">
            {!walletConnected ? (
              <button
                onClick={connectWallet}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                🔗 Connect Web3 Wallet
              </button>
            ) : (
              <div className={`p-3 rounded-lg ${theme.card}`}>
                <div className="text-sm text-green-500 mb-1">
                  ✅ Wallet Connected
                </div>
                <div className="text-xs text-gray-500 break-all">
                  {walletAddress}
                </div>
                <div className="text-xs text-gray-500">
                  Balance: {parseFloat(walletBalance).toFixed(4)} ETH
                </div>
                <button
                  onClick={disconnectWallet}
                  className="mt-2 text-xs text-red-500 hover:text-red-600"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>

          {/* Login Form */}
          <div className="space-y-4">
            <input
              type="email"
              placeholder="admin@protrack.com"
              value={loginData.email}
              onChange={(e) =>
                setLoginData({ ...loginData, email: e.target.value })
              }
              className={`w-full px-4 py-3 rounded-lg border ${theme.input}`}
            />
            <input
              type="password"
              placeholder="password"
              value={loginData.password}
              onChange={(e) =>
                setLoginData({ ...loginData, password: e.target.value })
              }
              className={`w-full px-4 py-3 rounded-lg border ${theme.input}`}
            />
            <button
              onClick={login}
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white rounded-lg font-medium transition-colors"
            >
              {loading ? "Logging in..." : "Login to Dashboard"}
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="mt-4 w-full py-2 text-sm text-blue-500 hover:text-blue-600"
          >
            Switch to {isDarkMode ? "Light" : "Dark"} Mode
          </button>
        </div>
      </div>
    );
  }

  // Dashboard Page
  return (
    <div className={`min-h-screen ${theme.bg}`}>
      {/* Header */}
      <header className={`border-b p-4 ${theme.card}`}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">ProTrack Web3 Dashboard</h1>
            <div className="flex items-center space-x-4 mt-1">
              <span className="text-sm">API: </span>
              <span
                className={`text-sm font-semibold ${
                  apiStatus.includes("✅") ? "text-green-500" : "text-red-500"
                }`}
              >
                {apiStatus}
              </span>
              <span className="text-sm">Blockchain: </span>
              <span
                className={`text-sm font-semibold ${
                  blockchainStatus.includes("✅")
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {blockchainStatus}
              </span>
              <button
                onClick={checkApiStatus}
                className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Refresh
              </button>
            </div>
          </div>
          <div className="flex space-x-4">
            {walletConnected && (
              <div className="text-sm">
                <div className="text-green-500">
                  🔗 {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </div>
                <div className="text-xs text-gray-500">
                  {parseFloat(walletBalance).toFixed(4)} ETH
                </div>
              </div>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-600"
            >
              {isDarkMode ? "☀️" : "🌙"}
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="p-4">
        <div className="flex space-x-4">
          {["Overview", "NFT Products", "Blockchain", "Analytics"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() =>
                  setCurrentPage(tab.toLowerCase().replace(" ", ""))
                }
                className={`px-4 py-2 rounded-lg ${
                  currentPage === tab.toLowerCase().replace(" ", "")
                    ? "bg-blue-600 text-white"
                    : "bg-gray-600 text-gray-300"
                }`}
              >
                {tab}
              </button>
            )
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6">
        {currentPage === "overview" && (
          <OverviewPage theme={theme} walletConnected={walletConnected} />
        )}
        {currentPage === "nftproducts" && (
          <NftProductsPage
            nftProducts={nftProducts}
            theme={theme}
            walletConnected={walletConnected}
            mintNftProduct={mintNftProduct}
            transferNft={transferNft}
            loading={loading}
          />
        )}
        {currentPage === "blockchain" && (
          <BlockchainPage
            theme={theme}
            walletConnected={walletConnected}
            walletAddress={walletAddress}
            walletBalance={walletBalance}
          />
        )}
        {currentPage === "analytics" && <AnalyticsPage theme={theme} />}
      </main>
    </div>
  );
};

// Web3 Overview Component
const OverviewPage = ({ theme, walletConnected }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold">Web3 Dashboard Overview</h2>

    {/* Web3 Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[
        { title: "NFT Products", value: "12", color: "purple", icon: "🎨" },
        { title: "Active Transfers", value: "5", color: "blue", icon: "🔄" },
        { title: "Blockchain Events", value: "47", color: "green", icon: "⛓️" },
        { title: "Smart Contracts", value: "3", color: "orange", icon: "📜" },
      ].map((stat, i) => (
        <div key={i} className={`p-6 rounded-xl border ${theme.card}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{stat.title}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
            <div className="text-3xl">{stat.icon}</div>
          </div>
        </div>
      ))}
    </div>

    {/* Web3 Quick Actions */}
    <div className={`p-6 rounded-xl border ${theme.card}`}>
      <h3 className="text-lg font-semibold mb-4">Web3 Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {["Mint NFT", "Transfer Token", "View Contract", "Deploy NFT"].map(
          (action) => (
            <button
              key={action}
              className="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-500"
              disabled={!walletConnected}
            >
              {action}
            </button>
          )
        )}
      </div>
    </div>
  </div>
);

// NFT Products Component
const NftProductsPage = ({
  nftProducts,
  theme,
  walletConnected,
  mintNftProduct,
  transferNft,
  loading,
}) => {
  const [showMintForm, setShowMintForm] = useState(false);
  const [mintData, setMintData] = useState({ name: "", description: "" });

  const handleMint = () => {
    if (mintData.name) {
      mintNftProduct(mintData);
      setMintData({ name: "", description: "" });
      setShowMintForm(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">NFT Products</h2>
        <button
          onClick={() => setShowMintForm(!showMintForm)}
          disabled={!walletConnected}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-500"
        >
          {showMintForm ? "Cancel" : "Mint New NFT"}
        </button>
      </div>

      {/* Mint Form */}
      {showMintForm && (
        <div className={`p-6 rounded-xl border ${theme.card}`}>
          <h3 className="text-lg font-semibold mb-4">Mint New NFT Product</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Product Name"
              value={mintData.name}
              onChange={(e) =>
                setMintData({ ...mintData, name: e.target.value })
              }
              className={`w-full px-4 py-3 rounded-lg border ${theme.input}`}
            />
            <input
              type="text"
              placeholder="Description"
              value={mintData.description}
              onChange={(e) =>
                setMintData({ ...mintData, description: e.target.value })
              }
              className={`w-full px-4 py-3 rounded-lg border ${theme.input}`}
            />
            <button
              onClick={handleMint}
              disabled={loading || !mintData.name}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-500"
            >
              {loading ? "Minting..." : "Mint NFT"}
            </button>
          </div>
        </div>
      )}

      {/* NFT Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nftProducts.map((nft) => (
          <div key={nft.id} className={`p-6 rounded-xl border ${theme.card}`}>
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">{nft.image}</div>
              <h3 className="text-lg font-semibold">{nft.name}</h3>
              <p className="text-sm text-gray-500">Token ID: {nft.tokenId}</p>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Owner:</strong> {nft.owner.slice(0, 6)}...
                {nft.owner.slice(-4)}
              </div>
              <div>
                <strong>Origin:</strong> {nft.metadata.origin}
              </div>
              <div>
                <strong>Batch:</strong> {nft.metadata.batch}
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <button
                onClick={() => {
                  const toAddress = prompt("Enter recipient address:");
                  if (toAddress) transferNft(nft.id, toAddress);
                }}
                disabled={!walletConnected}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-500"
              >
                Transfer NFT
              </button>
            </div>
          </div>
        ))}
      </div>

      {nftProducts.length === 0 && (
        <div className={`p-8 rounded-xl border ${theme.card} text-center`}>
          <div className="text-4xl mb-4">🎨</div>
          <h3 className="text-lg font-semibold mb-2">No NFT Products</h3>
          <p className="text-gray-500">
            Connect your wallet and mint your first NFT product!
          </p>
        </div>
      )}
    </div>
  );
};

// Blockchain Component
const BlockchainPage = ({
  theme,
  walletConnected,
  walletAddress,
  walletBalance,
}) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold">Blockchain Explorer</h2>

    {/* Wallet Info */}
    <div className={`p-6 rounded-xl border ${theme.card}`}>
      <h3 className="text-lg font-semibold mb-4">Wallet Information</h3>
      {walletConnected ? (
        <div className="space-y-3">
          <div>
            <strong>Address:</strong> {walletAddress}
          </div>
          <div>
            <strong>Balance:</strong> {parseFloat(walletBalance).toFixed(4)} ETH
          </div>
          <div>
            <strong>Network:</strong> Ethereum Mainnet
          </div>
        </div>
      ) : (
        <p className="text-gray-500">
          Please connect your wallet to view blockchain information
        </p>
      )}
    </div>

    {/* Recent Transactions */}
    <div className={`p-6 rounded-xl border ${theme.card}`}>
      <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
      <div className="space-y-3">
        {[
          {
            hash: "0x1234...5678",
            type: "NFT Mint",
            status: "Confirmed",
            time: "2 min ago",
          },
          {
            hash: "0xabcd...efgh",
            type: "Transfer",
            status: "Pending",
            time: "5 min ago",
          },
          {
            hash: "0x9876...5432",
            type: "Contract Call",
            status: "Confirmed",
            time: "10 min ago",
          },
        ].map((tx, i) => (
          <div
            key={i}
            className="flex justify-between items-center py-2 border-b last:border-b-0"
          >
            <div>
              <div className="font-medium">{tx.type}</div>
              <div className="text-sm text-gray-500">{tx.hash}</div>
            </div>
            <div className="text-right">
              <div
                className={`text-sm ${
                  tx.status === "Confirmed"
                    ? "text-green-500"
                    : "text-yellow-500"
                }`}
              >
                {tx.status}
              </div>
              <div className="text-xs text-gray-500">{tx.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Analytics Component (keeping existing)
const AnalyticsPage = ({ theme }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold">Web3 Analytics & Reports</h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className={`p-6 rounded-xl border ${theme.card}`}>
        <h3 className="text-lg font-semibold mb-4">NFT Activity</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Total NFTs Minted</span>
            <span className="font-semibold">12</span>
          </div>
          <div className="flex justify-between">
            <span>NFTs Transferred</span>
            <span className="font-semibold">8</span>
          </div>
          <div className="flex justify-between">
            <span>Active Holders</span>
            <span className="font-semibold">5</span>
          </div>
        </div>
      </div>

      <div className={`p-6 rounded-xl border ${theme.card}`}>
        <h3 className="text-lg font-semibold mb-4">Blockchain Metrics</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Gas Used</span>
            <span className="font-semibold">2.4 ETH</span>
          </div>
          <div className="flex justify-between">
            <span>Contract Calls</span>
            <span className="font-semibold">47</span>
          </div>
          <div className="flex justify-between">
            <span>Success Rate</span>
            <span className="font-semibold text-green-500">98.5%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Web3ProTrack;
