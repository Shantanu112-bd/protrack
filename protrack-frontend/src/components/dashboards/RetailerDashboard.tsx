import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import { trackingService } from "../../services/supabase";
import { iotService } from "../../services/IoTService";
import { useWeb3 } from "../../hooks/useWeb3";
import { supplyChainService } from "../../services/supplyChainService";
import { useToast } from "../ui/use-toast";
import EnhancedRFIDScanner from "../EnhancedRFIDScanner";
import EnhancedSupplyChainDashboard from "../EnhancedSupplyChainDashboard";

// Define a type for product data
interface Product {
  id: string;
  product_name?: string;
  rfid_tag: string;
  batch_id?: string;
  expiry_date: string;
  status: string;
  manufacturer?: {
    name?: string;
  };
  expected_arrival?: string;
  token_id?: string;
}

const RetailerDashboard: React.FC = () => {
  const [inventory, setInventory] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanInput, setScanInput] = useState("");
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const { account: address } = useWeb3();
  const { toast } = useToast();

  useEffect(() => {
    loadInventory();
  }, [address]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      // Get products at retailer assigned to this user
      const data = await trackingService.getProductsByCustodian(address || "");
      setInventory(data || []);
    } catch (error) {
      console.error("Error loading inventory:", error);
      toast({
        title: "Error",
        description: "Failed to load inventory",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput.trim()) return;

    try {
      setLoading(true);
      const result = await iotService.scanRFID(scanInput);

      if (result.success) {
        setScannedProduct(result.product);
        toast({
          title: "Product Scanned",
          description: `Product ${scanInput} scanned successfully`,
        });
      } else {
        throw new Error("Scan failed");
      }
    } catch (error) {
      console.error("Error scanning product:", error);
      toast({
        title: "Error",
        description: "Failed to scan product or product not found",
        variant: "destructive",
      });
      setScannedProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const markAsSold = async (productId: string, tokenId: number) => {
    try {
      // Update status on blockchain using supplyChainService
      const result = await supplyChainService.transferProduct(
        tokenId,
        "0x0000000000000000000000000000000000000000", // Consumer address (0x0 for sold)
        4, // Status: Sold
        "Product sold to consumer", // Location
        "Product sold at retail location" // Notes
      );

      if (result.success) {
        // Update status in Supabase
        await trackingService.updateProductStatus(productId, "sold");

        toast({
          title: "Product Sold",
          description: "Product marked as sold",
        });

        loadInventory();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error marking product as sold:", error);
      toast({
        title: "Error",
        description:
          "Failed to update product status: " + (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const receiveProduct = async (productId: string, tokenId: number) => {
    try {
      // Update status on blockchain using supplyChainService
      const result = await supplyChainService.transferProduct(
        tokenId,
        address || "", // Retailer's address
        2, // Status: At Retailer
        "Product received at retail location", // Location
        "Product received from transporter" // Notes
      );

      if (result.success) {
        // Update status in Supabase
        await trackingService.updateProductStatus(productId, "at_retailer");

        toast({
          title: "Product Received",
          description: "Product marked as received",
        });

        loadInventory();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error receiving product:", error);
      toast({
        title: "Error",
        description:
          "Failed to update product status: " + (error as Error).message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-gray-700 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Retailer Dashboard
        </h2>
        <p className="text-gray-300">
          Manage your inventory and verify product authenticity
        </p>
      </div>

      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-1 mb-6">
          <TabsTrigger
            value="inventory"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-lg transition-all duration-300"
          >
            Inventory
          </TabsTrigger>
          <TabsTrigger
            value="scan"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-lg transition-all duration-300"
          >
            Scan Product
          </TabsTrigger>
          <TabsTrigger
            value="incoming"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-lg transition-all duration-300"
          >
            Incoming
          </TabsTrigger>
          <TabsTrigger
            value="tracking"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-lg transition-all duration-300"
          >
            Supply Chain
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                Current Inventory
              </CardTitle>
              <CardDescription className="text-gray-400">
                Manage your in-store products
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-500"></div>
                </div>
              ) : inventory.filter((item) => item.status === "at_retailer")
                  .length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">📦</div>
                  <h3 className="text-xl font-medium text-gray-300 mb-2">
                    No Inventory Items
                  </h3>
                  <p className="text-gray-500">
                    You don't have any products in your inventory yet.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {inventory
                    .filter((item) => item.status === "at_retailer")
                    .map((product) => (
                      <Card
                        key={product.id}
                        className="p-5 bg-gray-800/30 border border-gray-700 hover:border-purple-500/50 transition-all duration-300 backdrop-blur-sm"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-white mb-1">
                              {product.product_name || "Product"}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                              <div className="text-gray-400">
                                RFID:{" "}
                                <span className="text-gray-200">
                                  {product.rfid_tag}
                                </span>
                              </div>
                              <div className="text-gray-400">
                                Batch:{" "}
                                <span className="text-gray-200">
                                  {product.batch_id}
                                </span>
                              </div>
                              <div className="text-gray-400">
                                Expiry:{" "}
                                <span className="text-gray-200">
                                  {new Date(
                                    product.expiry_date
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="mt-3">
                              <Badge className="bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                At Retailer
                              </Badge>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                markAsSold(
                                  product.id,
                                  parseInt(product.token_id || "0")
                                )
                              }
                              className="border-gray-600 text-gray-300 hover:bg-gray-700/50"
                            >
                              Mark as Sold
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // View product details
                              }}
                              className="border-gray-600 text-gray-300 hover:bg-gray-700/50"
                            >
                              Details
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scan">
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl text-white">Scan Product</CardTitle>
              <CardDescription className="text-gray-400">
                Scan a product RFID tag to verify authenticity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleScanSubmit} className="space-y-5">
                <div className="flex space-x-3">
                  <Input
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                    placeholder="Enter RFID tag"
                    className="flex-1 bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500"
                  />
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6"
                  >
                    {loading ? "Scanning..." : "Scan"}
                  </Button>
                </div>
              </form>

              {scannedProduct && (
                <Card className="mt-6 p-5 bg-gray-800/30 border border-gray-700 backdrop-blur-sm">
                  <CardTitle className="text-lg mb-4 text-white">
                    Product Information
                  </CardTitle>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="text-gray-400">
                        RFID Tag:{" "}
                        <span className="text-white font-medium">
                          {scannedProduct.rfid_tag}
                        </span>
                      </div>
                      <div className="text-gray-400">
                        Batch ID:{" "}
                        <span className="text-white font-medium">
                          {scannedProduct.batch_id}
                        </span>
                      </div>
                      <div className="text-gray-400">
                        Status:{" "}
                        <span className="text-white font-medium">
                          <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">
                            {scannedProduct.status}
                          </Badge>
                        </span>
                      </div>
                      <div className="text-gray-400">
                        Manufacturer:{" "}
                        <span className="text-white font-medium">
                          {scannedProduct.manufacturer?.name || "Unknown"}
                        </span>
                      </div>
                      <div className="text-gray-400">
                        Expiry Date:{" "}
                        <span className="text-white font-medium">
                          {new Date(
                            scannedProduct.expiry_date
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-gray-400">
                        Token ID:{" "}
                        <span className="text-white font-medium">
                          {scannedProduct.token_id}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                        Verify on Blockchain
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incoming">
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                Incoming Shipments
              </CardTitle>
              <CardDescription className="text-gray-400">
                Receive and verify incoming products
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-500"></div>
                </div>
              ) : inventory.filter((item) => item.status === "in_transit")
                  .length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">🚚</div>
                  <h3 className="text-xl font-medium text-gray-300 mb-2">
                    No Incoming Shipments
                  </h3>
                  <p className="text-gray-500">
                    You don't have any incoming shipments at the moment.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {inventory
                    .filter((item) => item.status === "in_transit")
                    .map((product) => (
                      <Card
                        key={product.id}
                        className="p-5 bg-gray-800/30 border border-gray-700 hover:border-purple-500/50 transition-all duration-300 backdrop-blur-sm"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-white mb-1">
                              {product.product_name || "Product"}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                              <div className="text-gray-400">
                                RFID:{" "}
                                <span className="text-gray-200">
                                  {product.rfid_tag}
                                </span>
                              </div>
                              <div className="text-gray-400">
                                From:{" "}
                                <span className="text-gray-200">
                                  {product.manufacturer?.name || "Unknown"}
                                </span>
                              </div>
                              <div className="text-gray-400">
                                Expected:{" "}
                                <span className="text-gray-200">
                                  {product.expected_arrival
                                    ? new Date(
                                        product.expected_arrival
                                      ).toLocaleDateString()
                                    : "Unknown"}
                                </span>
                              </div>
                            </div>
                            <div className="mt-3">
                              <Badge
                                variant="outline"
                                className="border-purple-500/30 text-purple-400"
                              >
                                In Transit
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() =>
                              receiveProduct(
                                product.id,
                                parseInt(product.token_id || "0")
                              )
                            }
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          >
                            Receive
                          </Button>
                        </div>
                      </Card>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tracking">
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                Supply Chain Tracking
              </CardTitle>
              <CardDescription className="text-gray-400">
                Complete product journey from manufacturer to retailer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    RFID Verification
                  </h3>
                  <EnhancedRFIDScanner />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Product Journey
                  </h3>
                  <EnhancedSupplyChainDashboard />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tracking">
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                Supply Chain Tracking
              </CardTitle>
              <CardDescription className="text-gray-400">
                Complete product journey from manufacturer to retailer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    RFID Verification
                  </h3>
                  <EnhancedRFIDScanner />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Product Journey
                  </h3>
                  <EnhancedSupplyChainDashboard />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RetailerDashboard;
