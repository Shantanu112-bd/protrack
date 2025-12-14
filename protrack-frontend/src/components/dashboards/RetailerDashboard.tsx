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
import { useWeb3 } from "../../contexts/web3ContextTypes";
import { useToast } from "../ui/use-toast";

const RetailerDashboard: React.FC = () => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanInput, setScanInput] = useState("");
  const [scannedProduct, setScannedProduct] = useState<any>(null);
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

  const markAsSold = async (productId: string) => {
    try {
      await trackingService.updateProductStatus(productId, "sold");
      toast({
        title: "Product Sold",
        description: "Product marked as sold",
      });
      loadInventory();
    } catch (error) {
      console.error("Error marking product as sold:", error);
      toast({
        title: "Error",
        description: "Failed to update product status",
        variant: "destructive",
      });
    }
  };

  const receiveProduct = async (productId: string) => {
    try {
      await trackingService.updateProductStatus(productId, "at_retailer");
      toast({
        title: "Product Received",
        description: "Product marked as received",
      });
      loadInventory();
    } catch (error) {
      console.error("Error receiving product:", error);
      toast({
        title: "Error",
        description: "Failed to update product status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Retailer Dashboard</h1>

      <Tabs defaultValue="inventory">
        <TabsList className="mb-4">
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="scan">Scan Product</TabsTrigger>
          <TabsTrigger value="incoming">Incoming</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Current Inventory</CardTitle>
              <CardDescription>Manage your in-store products</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading inventory...</p>
              ) : inventory.filter((item) => item.status === "at_retailer")
                  .length === 0 ? (
                <p>No products in inventory.</p>
              ) : (
                <div className="grid gap-4">
                  {inventory
                    .filter((item) => item.status === "at_retailer")
                    .map((product) => (
                      <Card key={product.id} className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">
                              {product.product_name || "Product"}
                            </h3>
                            <p className="text-sm text-gray-500">
                              RFID: {product.rfid_tag}
                            </p>
                            <p className="text-sm text-gray-500">
                              Batch: {product.batch_id}
                            </p>
                            <p className="text-sm text-gray-500">
                              Expiry:{" "}
                              {new Date(
                                product.expiry_date
                              ).toLocaleDateString()}
                            </p>
                            <div className="mt-2">
                              <Badge>{product.status}</Badge>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => markAsSold(product.id)}
                              className="w-full"
                            >
                              Mark as Sold
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // View product details
                              }}
                              className="w-full"
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
          <Card>
            <CardHeader>
              <CardTitle>Scan Product</CardTitle>
              <CardDescription>
                Scan a product RFID tag to verify authenticity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleScanSubmit} className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                    placeholder="Enter RFID tag"
                    className="flex-1"
                  />
                  <Button type="submit" disabled={loading}>
                    {loading ? "Scanning..." : "Scan"}
                  </Button>
                </div>
              </form>

              {scannedProduct && (
                <Card className="mt-4 p-4">
                  <CardTitle className="text-lg mb-2">
                    Product Information
                  </CardTitle>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2">
                      <span className="text-sm font-medium">RFID Tag:</span>
                      <span className="text-sm">{scannedProduct.rfid_tag}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm font-medium">Batch ID:</span>
                      <span className="text-sm">{scannedProduct.batch_id}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm font-medium">Status:</span>
                      <span className="text-sm">
                        <Badge>{scannedProduct.status}</Badge>
                      </span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm font-medium">Manufacturer:</span>
                      <span className="text-sm">
                        {scannedProduct.manufacturer?.name || "Unknown"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm font-medium">Expiry Date:</span>
                      <span className="text-sm">
                        {new Date(
                          scannedProduct.expiry_date
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm font-medium">Token ID:</span>
                      <span className="text-sm">{scannedProduct.token_id}</span>
                    </div>
                  </div>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incoming">
          <Card>
            <CardHeader>
              <CardTitle>Incoming Shipments</CardTitle>
              <CardDescription>
                Receive and verify incoming products
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading shipments...</p>
              ) : inventory.filter((item) => item.status === "in_transit")
                  .length === 0 ? (
                <p>No incoming shipments.</p>
              ) : (
                <div className="grid gap-4">
                  {inventory
                    .filter((item) => item.status === "in_transit")
                    .map((product) => (
                      <Card key={product.id} className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">
                              {product.product_name || "Product"}
                            </h3>
                            <p className="text-sm text-gray-500">
                              RFID: {product.rfid_tag}
                            </p>
                            <p className="text-sm text-gray-500">
                              From: {product.manufacturer?.name || "Unknown"}
                            </p>
                            <p className="text-sm text-gray-500">
                              Expected:{" "}
                              {product.expected_arrival
                                ? new Date(
                                    product.expected_arrival
                                  ).toLocaleDateString()
                                : "Unknown"}
                            </p>
                            <div className="mt-2">
                              <Badge variant="outline">In Transit</Badge>
                            </div>
                          </div>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => receiveProduct(product.id)}
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
      </Tabs>
    </div>
  );
};

export default RetailerDashboard;
