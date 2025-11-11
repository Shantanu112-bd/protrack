import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { trackingService } from "../../services/supabase";
import { Database } from "../../types/supabase";
import { useEnhancedWeb3 } from "../../contexts/EnhancedWeb3Context";
import { supplyChainService } from "../../services/supplyChainService";
import { useToast } from "../ui/use-toast";
import EnhancedRFIDScanner from "../EnhancedRFIDScanner";
import ProductTrackingMap from "../map/ProductTrackingMap";

const ManufacturerDashboard: React.FC = () => {
  const [products, setProducts] = useState<
    Database["public"]["Tables"]["products"]["Row"][]
  >([]);
  const [loading, setLoading] = useState(true);
  const [newProduct, setNewProduct] = useState({
    rfid_tag: "",
    batch_id: "",
    product_name: "",
    expiry_date: "",
  });
  const { account: address } = useEnhancedWeb3();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("products");

  useEffect(() => {
    loadProducts();
  }, [address]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // Get products manufactured by this user
      const data = await trackingService.getProductsByStatus("manufactured");
      setProducts(data || []);
    } catch (error) {
      console.error("Error loading products:", error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const mintNewProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Create metadata hash
      const metadata = {
        name: newProduct.product_name,
        rfid: newProduct.rfid_tag,
        batchId: newProduct.batch_id,
        expiryDate: newProduct.expiry_date,
        manufacturer: address,
        createdAt: new Date().toISOString(),
      };

      // Convert metadata to JSON string and then to hash
      const metadataString = JSON.stringify(metadata);
      const encoder = new TextEncoder();
      const data = encoder.encode(metadataString);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const metadataHash = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      // Mint token on blockchain using supplyChainService
      const result = await supplyChainService.mintProduct(
        newProduct.rfid_tag,
        newProduct.product_name,
        newProduct.batch_id,
        Math.floor(new Date(newProduct.expiry_date).getTime() / 1000),
        metadataHash,
        address || ""
      );

      if (result.success) {
        toast({
          title: "Success",
          description: "Product created and token minted successfully",
        });

        // Create product in Supabase
        await trackingService.createProduct({
          rfid_tag: newProduct.rfid_tag,
          batch_id: newProduct.batch_id,
          token_id: "1", // This would be retrieved from the blockchain event in a real implementation
          manufacturer_id: address || "",
          expiry_date: newProduct.expiry_date,
          status: "manufactured",
        });

        // Reset form and reload products
        setNewProduct({
          rfid_tag: "",
          batch_id: "",
          product_name: "",
          expiry_date: "",
        });

        loadProducts();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error minting product:", error);
      toast({
        title: "Error",
        description:
          "Failed to mint product token: " + (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const initiateTransfer = async (productId: string) => {
    try {
      // In a real implementation, we would use the productId to initiate a transfer
      console.log("Initiating transfer for product:", productId);

      // This would open a modal to select recipient and initiate transfer
      // For now, we'll just show a toast
      toast({
        title: "Transfer Initiated",
        description:
          "Transfer functionality will be implemented in the next phase",
      });
    } catch (error) {
      console.error("Error initiating transfer:", error);
      toast({
        title: "Error",
        description: "Failed to initiate transfer",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-gray-700 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Manufacturer Dashboard
        </h2>
        <p className="text-gray-300">
          Manage your products and track them through the supply chain
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-1 mb-6">
          <TabsTrigger
            value="products"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg transition-all duration-300"
          >
            My Products
          </TabsTrigger>
          <TabsTrigger
            value="create"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg transition-all duration-300"
          >
            Create Product
          </TabsTrigger>
          <TabsTrigger
            value="tracking"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg transition-all duration-300"
          >
            Product Tracking
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg transition-all duration-300"
          >
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl text-white">My Products</CardTitle>
              <CardDescription className="text-gray-400">
                Manage and track products you've manufactured
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">📦</div>
                  <h3 className="text-xl font-medium text-gray-300 mb-2">
                    No Products Found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Create your first product in the "Create Product" tab.
                  </p>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Create Product
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {products.map((product) => (
                    <Card
                      key={product.id}
                      className="p-5 bg-gray-800/30 border border-gray-700 hover:border-blue-500/50 transition-all duration-300 backdrop-blur-sm"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-white mb-1">
                            {product.product_name || "Unnamed Product"}
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
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
                            <div className="text-gray-400">
                              Status:{" "}
                              <span className="text-green-400 capitalize">
                                {product.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              initiateTransfer(product.id.toString())
                            }
                            className="border-gray-600 text-gray-300 hover:bg-gray-700/50"
                          >
                            Transfer
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

        <TabsContent value="create">
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                Create New Product
              </CardTitle>
              <CardDescription className="text-gray-400">
                Mint a new product token and register it in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={mintNewProduct} className="space-y-5">
                <div className="grid gap-2">
                  <Label htmlFor="rfid_tag" className="text-gray-300">
                    RFID Tag
                  </Label>
                  <Input
                    id="rfid_tag"
                    name="rfid_tag"
                    value={newProduct.rfid_tag}
                    onChange={handleInputChange}
                    placeholder="Enter RFID tag"
                    required
                    className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="batch_id" className="text-gray-300">
                    Batch ID
                  </Label>
                  <Input
                    id="batch_id"
                    name="batch_id"
                    value={newProduct.batch_id}
                    onChange={handleInputChange}
                    placeholder="Enter batch ID"
                    required
                    className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="product_name" className="text-gray-300">
                    Product Name
                  </Label>
                  <Input
                    id="product_name"
                    name="product_name"
                    value={newProduct.product_name}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                    required
                    className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="expiry_date" className="text-gray-300">
                    Expiry Date
                  </Label>
                  <Input
                    id="expiry_date"
                    name="expiry_date"
                    type="date"
                    value={newProduct.expiry_date}
                    onChange={handleInputChange}
                    required
                    className="bg-gray-800/50 border-gray-700 text-white focus:border-blue-500"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-3 text-lg font-medium transition-all duration-300 shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    "Mint Product Token"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking">
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                Product Tracking
              </CardTitle>
              <CardDescription className="text-gray-400">
                Track products through the supply chain with RFID and IoT data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    RFID Scanning & Tokenization
                  </h3>
                  <EnhancedRFIDScanner />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Geographic Tracking
                  </h3>
                  <div className="h-96 rounded-xl overflow-hidden border border-gray-600">
                    <ProductTrackingMap />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analytics">
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl text-white">Analytics</CardTitle>
              <CardDescription className="text-gray-400">
                View analytics for your manufactured products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Card className="p-5 bg-gradient-to-br from-blue-900/20 to-blue-800/20 border border-blue-700/30 backdrop-blur-sm">
                  <h3 className="font-medium text-lg text-blue-300 mb-2">
                    Total Products
                  </h3>
                  <p className="text-3xl font-bold text-white">
                    {products.length}
                  </p>
                  <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                      style={{
                        width: `${Math.min(100, products.length * 10)}%`,
                      }}
                    ></div>
                  </div>
                </Card>
                <Card className="p-5 bg-gradient-to-br from-green-900/20 to-green-800/20 border border-green-700/30 backdrop-blur-sm">
                  <h3 className="font-medium text-lg text-green-300 mb-2">
                    This Month
                  </h3>
                  <p className="text-3xl font-bold text-white">24</p>
                  <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                      style={{ width: "75%" }}
                    ></div>
                  </div>
                </Card>
                <Card className="p-5 bg-gradient-to-br from-purple-900/20 to-purple-800/20 border border-purple-700/30 backdrop-blur-sm">
                  <h3 className="font-medium text-lg text-purple-300 mb-2">
                    Quality Score
                  </h3>
                  <p className="text-3xl font-bold text-white">98.5%</p>
                  <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      style={{ width: "98.5%" }}
                    ></div>
                  </div>
                </Card>
              </div>

              <div className="mt-6 bg-gray-800/30 border border-gray-700 rounded-xl p-5">
                <h3 className="text-lg font-medium text-white mb-4">
                  Production Trends
                </h3>
                <div className="h-64 flex items-end justify-between space-x-2">
                  {[65, 78, 90, 85, 95, 88, 92, 100, 96, 89, 93, 97].map(
                    (value, index) => (
                      <div
                        key={index}
                        className="flex flex-col items-center flex-1"
                      >
                        <div
                          className="w-full bg-gradient-to-t from-blue-600 to-purple-600 rounded-t-lg transition-all duration-500 hover:from-blue-500 hover:to-purple-500"
                          style={{ height: `${value}%` }}
                        ></div>
                        <div className="text-xs text-gray-400 mt-2">
                          {
                            [
                              "J",
                              "F",
                              "M",
                              "A",
                              "M",
                              "J",
                              "J",
                              "A",
                              "S",
                              "O",
                              "N",
                              "D",
                            ][index]
                          }
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManufacturerDashboard;
