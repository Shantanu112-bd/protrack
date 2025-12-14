import React, { useState } from "react";
import { useWeb3 } from "../../contexts/web3ContextTypes";
import ProductTrackingMap from "../map/ProductTrackingMap";

// Define types for our data
type Product = {
  id: string;
  name: string;
  status: string;
  owner: string;
  currentLocation: string;
  nextDestination: string;
  manufacturingDate: string;
  expiryDate: string;
  batchNumber: string;
  gpsOrigin: string;
  temperature: string;
  humidity: string;
  tokenId: string;
  rfid: string;
  privateKeyAccess: boolean;
};

type ScanResult = {
  productId: string;
  name: string;
  tokenId: string;
  rfid: string;
  barcode: string;
  manufacturingDate: string;
  expiryDate: string;
  batchNumber: string;
  gpsOrigin: string;
  temperature: string;
  humidity: string;
  vibration: string;
  privateKey: string;
  ownership: string;
  custodyHistory: {
    date: string;
    location: string;
    owner: string;
  }[];
};

type CustodyEvent = {
  date: string;
  location: string;
  owner: string;
};

const SupplyChainCoreDashboard: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { account } = useWeb3();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeTab, setActiveTab] = useState("overview");
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  // Mock data for demonstration
  const mockProducts: Product[] = [
    {
      id: "PRD-2023-001",
      name: "Organic Coffee Beans",
      status: "In Transit",
      owner: "EcoBean Industries",
      currentLocation: "Port of Rotterdam",
      nextDestination: "Distribution Center Amsterdam",
      manufacturingDate: "2023-10-15",
      expiryDate: "2024-10-15",
      batchNumber: "BATCH-2023-10-15-001",
      gpsOrigin: "Quindío, Colombia",
      temperature: "22°C",
      humidity: "65%",
      tokenId: "NFT-001",
      rfid: "RFID-123456789",
      privateKeyAccess: true,
    },
    {
      id: "PRD-2023-002",
      name: "Premium Chocolate Bars",
      status: "At Retailer",
      owner: "ChocoDeluxe BV",
      currentLocation: "Store Amsterdam",
      nextDestination: "End Consumer",
      manufacturingDate: "2023-09-20",
      expiryDate: "2024-03-20",
      batchNumber: "BATCH-2023-09-20-002",
      gpsOrigin: "Brussels, Belgium",
      temperature: "18°C",
      humidity: "55%",
      tokenId: "NFT-002",
      rfid: "RFID-987654321",
      privateKeyAccess: true,
    },
  ];

  const handleScan = () => {
    setScanning(true);
    // Simulate scanning process
    setTimeout(() => {
      setScanning(false);
      setScanResult({
        productId: "PRD-2023-001",
        name: "Organic Coffee Beans",
        tokenId: "NFT-001",
        rfid: "RFID-123456789",
        barcode: "BARCODE-123456789012",
        manufacturingDate: "2023-10-15",
        expiryDate: "2024-10-15",
        batchNumber: "BATCH-2023-10-15-001",
        gpsOrigin: "Quindío, Colombia",
        temperature: "22°C",
        humidity: "65%",
        vibration: "0.2g",
        privateKey: "0x789456123abcdef...",
        ownership: "Current owner: Distribution Center Amsterdam",
        custodyHistory: [
          {
            date: "2023-10-15",
            location: "Farm Quindío",
            owner: "EcoBean Industries",
          },
          {
            date: "2023-10-20",
            location: "Processing Plant",
            owner: "EcoBean Industries",
          },
          {
            date: "2023-10-25",
            location: "Port of Cartagena",
            owner: "EcoBean Industries",
          },
          {
            date: "2023-11-05",
            location: "Port of Rotterdam",
            owner: "Global Logistics BV",
          },
          {
            date: "2023-11-10",
            location: "Distribution Center Amsterdam",
            owner: "Global Logistics BV",
          },
        ],
      });
    }, 2000);
  };

  const handleTransfer = (productId: string) => {
    // Add animation effect
    const button = event?.target as HTMLButtonElement;
    if (button) {
      button.classList.add("animate-pulse");
      setTimeout(() => {
        button.classList.remove("animate-pulse");
      }, 1000);
    }

    alert(
      `Initiating transfer for product ${productId}. This would open the MPC approval workflow.`
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Supply Chain Core Dashboard
          </h1>
          <p className="text-gray-400 text-lg">
            Track products through the supply chain with cryptographic
            tokenization and privacy controls
          </p>
        </div>

        {/* Core Concept Explanation */}
        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-gray-700 rounded-2xl p-6 mb-8 shadow-xl transform transition-all duration-500 hover:scale-[1.01]">
          <h2 className="text-2xl font-bold text-white mb-4">
            Core Supply Chain Concept
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700 hover:border-purple-500 transition-all duration-300">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-purple-300 text-xl">
                  Product Tokenization
                </h3>
              </div>
              <ul className="text-gray-300 space-y-2">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3"></div>
                  <span>Every product has an RFID tag + barcode</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3"></div>
                  <span>
                    Scanner event converts RFID data to cryptographic token
                    (NFT/SBT)
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3"></div>
                  <span>
                    Token contains product hash, metadata, and ownership
                    credentials
                  </span>
                </li>
              </ul>
            </div>
            <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700 hover:border-blue-500 transition-all duration-300">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-blue-300 text-xl">
                  Privacy & Security
                </h3>
              </div>
              <ul className="text-gray-300 space-y-2">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                  <span>
                    Each token generates private keys for sender/receiver
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                  <span>Multiple parties get unique decryption keys</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                  <span>
                    Token transfer represents physical custody transfer
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Scanner Section */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 mb-8 shadow-xl transform transition-all duration-500 hover:scale-[1.01]">
          <h2 className="text-2xl font-bold text-white mb-4">
            RFID/Barcode Scanner
          </h2>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg">
                <div className="flex flex-col items-center justify-center h-64">
                  {scanning ? (
                    <div className="text-center animate-pulse">
                      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-white text-lg">Scanning product...</p>
                      <p className="text-gray-400 text-sm mt-2">
                        Converting RFID to cryptographic token
                      </p>
                    </div>
                  ) : scanResult ? (
                    <div className="text-center">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 rounded-full inline-block mb-4 animate-bounce">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-12 w-12 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-white">
                        Scan Successful
                      </h3>
                      <p className="text-gray-400 mt-2">
                        Product data retrieved
                      </p>
                      <div className="mt-4 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg inline-block">
                        Token: {scanResult.tokenId}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="bg-gradient-to-r from-gray-700 to-gray-800 p-5 rounded-2xl inline-block mb-4 shadow-lg">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-16 w-16 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-white">
                        Ready to Scan
                      </h3>
                      <p className="text-gray-400 mb-4">
                        Point camera at product RFID or barcode
                      </p>
                    </div>
                  )}
                </div>
                <button
                  onClick={scanResult ? () => setScanResult(null) : handleScan}
                  disabled={scanning}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                    scanning
                      ? "bg-gray-600 cursor-not-allowed"
                      : scanResult
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                  } shadow-lg`}
                >
                  {scanning ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      Scanning...
                    </div>
                  ) : scanResult ? (
                    "Scan Another Product"
                  ) : (
                    "Start Scan"
                  )}
                </button>
              </div>
            </div>

            {scanResult && (
              <div className="flex-1">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 h-full border border-gray-700 shadow-lg">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Product Details
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between border-b border-gray-700 pb-3">
                      <span className="text-gray-400">Product ID:</span>
                      <span className="text-white font-bold">
                        {scanResult.productId}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-gray-700 pb-3">
                      <span className="text-gray-400">Name:</span>
                      <span className="text-white font-bold">
                        {scanResult.name}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-gray-700 pb-3">
                      <span className="text-gray-400">Token ID:</span>
                      <span className="text-white font-bold">
                        {scanResult.tokenId}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-gray-700 pb-3">
                      <span className="text-gray-400">RFID:</span>
                      <span className="text-white font-bold">
                        {scanResult.rfid}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-gray-700 pb-3">
                      <span className="text-gray-400">Barcode:</span>
                      <span className="text-white font-bold">
                        {scanResult.barcode}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-gray-700 pb-3">
                      <span className="text-gray-400">Manufacturing Date:</span>
                      <span className="text-white font-bold">
                        {scanResult.manufacturingDate}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-gray-700 pb-3">
                      <span className="text-gray-400">Expiry Date:</span>
                      <span className="text-white font-bold">
                        {scanResult.expiryDate}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-gray-700 pb-3">
                      <span className="text-gray-400">Batch Number:</span>
                      <span className="text-white font-bold">
                        {scanResult.batchNumber}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-gray-700 pb-3">
                      <span className="text-gray-400">GPS Origin:</span>
                      <span className="text-white font-bold">
                        {scanResult.gpsOrigin}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 p-3 rounded-xl text-center border border-blue-700/50">
                        <div className="text-xs text-gray-400 mb-1">
                          Temperature
                        </div>
                        <div className="text-white font-bold text-lg">
                          {scanResult.temperature}
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-cyan-900/50 to-cyan-800/50 p-3 rounded-xl text-center border border-cyan-700/50">
                        <div className="text-xs text-gray-400 mb-1">
                          Humidity
                        </div>
                        <div className="text-white font-bold text-lg">
                          {scanResult.humidity}
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 p-3 rounded-xl text-center border border-purple-700/50">
                        <div className="text-xs text-gray-400 mb-1">
                          Vibration
                        </div>
                        <div className="text-white font-bold text-lg">
                          {scanResult.vibration}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-700">
                    <h4 className="font-bold text-white text-lg mb-3">
                      Ownership & Custody
                    </h4>
                    <p className="text-gray-300 mb-4">{scanResult.ownership}</p>
                    <button
                      onClick={() => handleTransfer(scanResult.productId)}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 py-3 px-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      Initiate Transfer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Tracking */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product List */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-xl transform transition-all duration-500 hover:scale-[1.01]">
            <h2 className="text-2xl font-bold text-white mb-4">
              Active Products
            </h2>
            <div className="space-y-4">
              {mockProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-4 hover:border-blue-500 transition-all duration-300 transform hover:scale-[1.02]"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-white text-lg">
                        {product.name}
                      </h3>
                      <p className="text-gray-400">{product.id}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-bold ${
                        product.status === "In Transit"
                          ? "bg-gradient-to-r from-yellow-500/30 to-amber-500/30 text-yellow-400 border border-yellow-500/50"
                          : product.status === "At Retailer"
                          ? "bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-green-400 border border-green-500/50"
                          : "bg-gradient-to-r from-blue-500/30 to-cyan-500/30 text-blue-400 border border-blue-500/50"
                      }`}
                    >
                      {product.status}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      <span className="text-gray-400">Owner:</span>
                      <span className="text-white font-medium ml-1">
                        {product.owner}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                      <span className="text-gray-400">Token:</span>
                      <span className="text-white font-medium ml-1">
                        {product.tokenId}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></div>
                      <span className="text-gray-400">Location:</span>
                      <span className="text-white font-medium ml-1">
                        {product.currentLocation}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                      <span className="text-gray-400">RFID:</span>
                      <span className="text-white font-medium ml-1">
                        {product.rfid}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      Exp: {product.expiryDate}
                    </div>
                    <button
                      onClick={() => handleTransfer(product.id)}
                      className="text-sm bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 px-4 py-2 rounded-lg font-bold transition-all duration-300 transform hover:scale-105"
                    >
                      Transfer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tracking Map */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-xl transform transition-all duration-500 hover:scale-[1.01]">
            <h2 className="text-2xl font-bold text-white mb-4">
              Supply Chain Map
            </h2>
            <div className="h-96 rounded-xl overflow-hidden bg-gray-900 border border-gray-700">
              <ProductTrackingMap />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 p-3 rounded-lg text-center">
                <div className="text-blue-400 font-bold">Real-time</div>
                <div className="text-xs text-gray-400">Tracking</div>
              </div>
              <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 p-3 rounded-lg text-center">
                <div className="text-purple-400 font-bold">IoT Data</div>
                <div className="text-xs text-gray-400">Visualization</div>
              </div>
              <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-800/30 p-3 rounded-lg text-center">
                <div className="text-cyan-400 font-bold">Custody</div>
                <div className="text-xs text-gray-400">History</div>
              </div>
            </div>
          </div>
        </div>

        {/* Custody History */}
        {scanResult && (
          <div className="mt-8 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-xl transform transition-all duration-500 hover:scale-[1.01]">
            <h2 className="text-2xl font-bold text-white mb-4">
              Custody Transfer History
            </h2>
            <div className="relative">
              {/* Timeline */}
              <div className="absolute left-5 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500/30 to-blue-500/30 rounded-full"></div>

              <div className="space-y-6 pl-16">
                {scanResult.custodyHistory.map(
                  (event: CustodyEvent, index: number) => (
                    <div
                      key={index}
                      className="relative animate-fade-in"
                      style={{ animationDelay: `${index * 200}ms` }}
                    >
                      <div className="absolute -left-16 top-0 w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center border-4 border-gray-900">
                        <div className="w-3 h-3 rounded-full bg-white"></div>
                      </div>
                      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="flex justify-between items-center">
                          <h3 className="font-bold text-white text-lg">
                            {event.location}
                          </h3>
                          <span className="text-sm bg-gray-700 px-3 py-1 rounded-full text-gray-300">
                            {event.date}
                          </span>
                        </div>
                        <p className="text-gray-400 mt-2">
                          Owner:{" "}
                          <span className="text-white font-medium">
                            {event.owner}
                          </span>
                        </p>
                        <div className="mt-3 flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-xs text-green-400">
                            Blockchain Verified
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* Privacy & Security Info */}
        <div className="mt-8 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-gray-700 rounded-2xl p-6 shadow-xl transform transition-all duration-500 hover:scale-[1.01]">
          <h2 className="text-2xl font-bold text-white mb-4">
            Privacy & Security Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-5 rounded-xl border border-gray-700 hover:border-blue-500 transition-all duration-300 transform hover:scale-105">
              <div className="text-blue-400 mb-3">
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="font-bold text-white text-lg mb-2">
                Private Key Access
              </h3>
              <p className="text-gray-400 text-sm">
                Each transfer generates unique keys for sender and receiver only
              </p>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-5 rounded-xl border border-gray-700 hover:border-purple-500 transition-all duration-300 transform hover:scale-105">
              <div className="text-purple-400 mb-3">
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="font-bold text-white text-lg mb-2">
                Multi-Party Control
              </h3>
              <p className="text-gray-400 text-sm">
                Multiple parties receive unique decryption keys for their data
              </p>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-5 rounded-xl border border-gray-700 hover:border-green-500 transition-all duration-300 transform hover:scale-105">
              <div className="text-green-400 mb-3">
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="font-bold text-white text-lg mb-2">
                Immutable Records
              </h3>
              <p className="text-gray-400 text-sm">
                All transfers and data updates recorded on blockchain
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplyChainCoreDashboard;
