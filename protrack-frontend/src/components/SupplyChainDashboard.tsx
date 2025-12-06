import React, { useState, useEffect } from "react";
import { useWeb3 } from "../contexts/Web3Context";
import SupplyChainService from "../services/supplyChainService";
import { SupplyChainEvent } from "../services/nftService";
import notificationService from "../services/notificationService";
import Web3 from "web3";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons in Leaflet
// @ts-expect-error Fix for Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface ProductData {
  tokenId: number;
  name: string;
  sku: string;
  manufacturer: string;
  batchId: string;
  currentLocation: string;
  expiryDate: number;
  currentValue: string;
}

interface ShipmentData {
  id: string;
  status: string;
  sender: string;
  receiver: string;
  location: string;
  timestamp: number;
}

const SupplyChainDashboard: React.FC = () => {
  const { account, isActive } = useWeb3();
  const [supplyChainService, setSupplyChainService] =
    useState<SupplyChainService | null>(null);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(
    null
  );
  const [productHistory, setProductHistory] = useState<SupplyChainEvent[]>([]);
  const [shipments, setShipments] = useState<ShipmentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Initialize supply chain service
  useEffect(() => {
    if (account && isActive && window.ethereum) {
      const web3 = new Web3(window.ethereum as unknown as string);
      const service = new SupplyChainService(web3, account);
      setSupplyChainService(service);
    }
  }, [account, isActive]);

  // Load sample data
  useEffect(() => {
    // In a real implementation, we would fetch actual data from the blockchain
    // For demo purposes, we'll use sample data
    const sampleProducts: ProductData[] = [
      {
        tokenId: 1001,
        name: "Premium Organic Coffee Beans",
        sku: "COF-2023-001",
        manufacturer: "EcoBean Industries",
        batchId: "BATCH-2023-12-001",
        currentLocation: "Roastery Facility, Seattle, WA",
        expiryDate: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
        currentValue: "25.99",
      },
      {
        tokenId: 1002,
        name: "Artisanal Dark Chocolate",
        sku: "CHOC-2023-002",
        manufacturer: "Cocoa Masters Ltd",
        batchId: "BATCH-2023-12-002",
        currentLocation: "Distribution Center, Chicago, IL",
        expiryDate: Math.floor(Date.now() / 1000) + 180 * 24 * 60 * 60,
        currentValue: "18.50",
      },
    ];

    const sampleShipments: ShipmentData[] = [
      {
        id: "SHIP-2023-12-001",
        status: "In Transit",
        sender: "EcoBean Industries",
        receiver: "Distributor Co.",
        location: "Seattle, WA → Chicago, IL",
        timestamp: Math.floor(Date.now() / 1000) - 86400,
      },
      {
        id: "SHIP-2023-12-002",
        status: "Delivered",
        sender: "Cocoa Masters Ltd",
        receiver: "Retail Chain Inc.",
        location: "Chicago, IL",
        timestamp: Math.floor(Date.now() / 1000) - 172800,
      },
    ];

    setProducts(sampleProducts);
    setShipments(sampleShipments);
  }, []);

  const handleProductSelect = async (product: ProductData) => {
    setSelectedProduct(product);
    setLoading(true);
    setError(null);

    try {
      // Add notification
      notificationService.addNotification({
        type: "info",
        title: "Product Selected",
        message: `Viewing details for "${product.name}" (Token #${product.tokenId})`,
        relatedTokenId: product.tokenId,
      });

      if (supplyChainService) {
        // In a real implementation, we would fetch the actual history
        // For demo, we'll use sample data
        const sampleHistory: SupplyChainEvent[] = [
          {
            event: "Manufactured",
            data: "Product manufactured at Roastery Facility",
            timestamp: Math.floor(Date.now() / 1000) - 86400 * 3,
            actor: "0xManufacturerAddress",
          },
          {
            event: "Packaged",
            data: "Packaged with IoT verification",
            timestamp: Math.floor(Date.now() / 1000) - 86400 * 2,
            actor: "0xManufacturerAddress",
          },
          {
            event: "Shipped",
            data: "Shipped to Distribution Center",
            timestamp: Math.floor(Date.now() / 1000) - 86400,
            actor: "0xManufacturerAddress",
          },
          {
            event: "Received",
            data: "Received at Distribution Center",
            timestamp: Math.floor(Date.now() / 1000) - 43200,
            actor: "0xDistributorAddress",
          },
        ];
        setProductHistory(sampleHistory);
      } else {
        // Fallback to sample data
        const sampleHistory: SupplyChainEvent[] = [
          {
            event: "Manufactured",
            data: "Product manufactured at Roastery Facility",
            timestamp: Math.floor(Date.now() / 1000) - 86400 * 3,
            actor: "0xManufacturerAddress",
          },
          {
            event: "Packaged",
            data: "Packaged with IoT verification",
            timestamp: Math.floor(Date.now() / 1000) - 86400 * 2,
            actor: "0xManufacturerAddress",
          },
          {
            event: "Shipped",
            data: "Shipped to Distribution Center",
            timestamp: Math.floor(Date.now() / 1000) - 86400,
            actor: "0xManufacturerAddress",
          },
          {
            event: "Received",
            data: "Received at Distribution Center",
            timestamp: Math.floor(Date.now() / 1000) - 43200,
            actor: "0xDistributorAddress",
          },
        ];
        setProductHistory(sampleHistory);
      }
    } catch (err) {
      setError("Failed to load product history");
      console.error(err);

      // Add error notification
      notificationService.addNotification({
        type: "error",
        title: "Load Failed",
        message: `Failed to load history for "${product.name}"`,
        relatedTokenId: product.tokenId,
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.batchId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Map positions for sample locations
  const locationPositions: Record<string, [number, number]> = {
    "Roastery Facility, Seattle, WA": [47.6062, -122.3321],
    "Distribution Center, Chicago, IL": [41.8781, -87.6298],
    "Seattle, WA": [47.6062, -122.3321],
    "Chicago, IL": [41.8781, -87.6298],
    "Seattle, WA → Chicago, IL": [44.7421, -104.481], // Midpoint
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Supply Chain Dashboard
      </h2>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search products by name, SKU, or batch ID..."
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
            Total Products
          </h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {products.length}
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
            Active Shipments
          </h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {shipments.filter((s) => s.status === "In Transit").length}
          </p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200">
            Delivered
          </h3>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {shipments.filter((s) => s.status === "Delivered").length}
          </p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
            In Production
          </h3>
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
            12
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Products List */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Products
          </h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredProducts.map((product) => (
              <div
                key={product.tokenId}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedProduct?.tokenId === product.tokenId
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                }`}
                onClick={() => handleProductSelect(product)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {product.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      SKU: {product.sku}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Batch: {product.batchId}
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200">
                    Token #{product.tokenId}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  <p>Location: {product.currentLocation}</p>
                  <p>Value: ${product.currentValue}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Product Details & History */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            {selectedProduct ? selectedProduct.name : "Product Details"}
          </h3>

          {selectedProduct ? (
            <div className="space-y-6">
              {/* Product Info */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium mb-2 text-gray-900 dark:text-white">
                  Product Information
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    Token ID:{" "}
                    <span className="font-medium">
                      #{selectedProduct.tokenId}
                    </span>
                  </div>
                  <div>
                    SKU:{" "}
                    <span className="font-medium">{selectedProduct.sku}</span>
                  </div>
                  <div>
                    Batch ID:{" "}
                    <span className="font-medium">
                      {selectedProduct.batchId}
                    </span>
                  </div>
                  <div>
                    Manufacturer:{" "}
                    <span className="font-medium">
                      {selectedProduct.manufacturer}
                    </span>
                  </div>
                  <div>
                    Current Value:{" "}
                    <span className="font-medium">
                      ${selectedProduct.currentValue}
                    </span>
                  </div>
                  <div>
                    Expiry Date:{" "}
                    <span className="font-medium">
                      {new Date(
                        selectedProduct.expiryDate * 1000
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Supply Chain History */}
              <div>
                <h4 className="font-medium mb-2 text-gray-900 dark:text-white">
                  Supply Chain History
                </h4>
                {loading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : error ? (
                  <div className="text-red-500 dark:text-red-400 p-4 bg-red-50 dark:bg-red-900 rounded-lg">
                    {error}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {productHistory.map((event, index) => (
                      <div key={index} className="flex items-start">
                        <div className="flex flex-col items-center mr-4">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          {index < productHistory.length - 1 && (
                            <div className="w-0.5 h-full bg-gray-300 dark:bg-gray-600"></div>
                          )}
                        </div>
                        <div className="pb-4">
                          <h5 className="font-medium text-gray-900 dark:text-white">
                            {event.event}
                          </h5>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {event.data as string}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(
                              (event.timestamp as number) * 1000
                            ).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Actor: {event.actor as string}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-lg text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Select a product to view its details and supply chain history
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Shipments */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Active Shipments
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shipments.map((shipment) => (
            <div
              key={shipment.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {shipment.id}
                </h4>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    shipment.status === "In Transit"
                      ? "bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200"
                      : "bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200"
                  }`}
                >
                  {shipment.status}
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <p>From: {shipment.sender}</p>
                <p>To: {shipment.receiver}</p>
                <p>Location: {shipment.location}</p>
                <p>
                  Shipped:{" "}
                  {new Date(shipment.timestamp * 1000).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Supply Chain Map */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Supply Chain Map
        </h3>
        <div className="h-96 rounded-lg overflow-hidden">
          <MapContainer
            center={[39.8283, -98.5795]}
            zoom={4}
            style={{ height: "100%", width: "100%" }}
            className="bg-gray-100 dark:bg-gray-900"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {Object.entries(locationPositions).map(([location, position]) => (
              <Marker key={location} position={position}>
                <Popup>
                  <div className="text-gray-900 dark:text-white">
                    <strong>{location}</strong>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Risk Indicators */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Risk Indicators
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
            <h4 className="font-medium text-red-800 dark:text-red-200">
              High Temperature
            </h4>
            <p className="text-sm text-red-600 dark:text-red-300">
              2 shipments exceed temperature thresholds
            </p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
              Delayed Shipments
            </h4>
            <p className="text-sm text-yellow-600 dark:text-yellow-300">
              3 shipments behind schedule
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
            <h4 className="font-medium text-green-800 dark:text-green-200">
              All Clear
            </h4>
            <p className="text-sm text-green-600 dark:text-green-300">
              98% of shipments on track
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplyChainDashboard;
