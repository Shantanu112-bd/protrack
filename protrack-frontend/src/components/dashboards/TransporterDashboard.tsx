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
import { trackingService } from "../../services/supabase";
import { iotService } from "../../services/IoTService";
import { useWeb3 } from "../../hooks/useWeb3";
import { supplyChainService } from "../../services/supplyChainService";
import { useToast } from "../ui/use-toast";
import EnhancedSupplyChainDashboard from "../EnhancedSupplyChainDashboard";

// Define a type for shipment data
interface Shipment {
  id: string;
  product_name?: string;
  rfid_tag: string;
  manufacturer?: {
    name?: string;
  };
  destination?: string;
  status: string;
  updated_at?: string;
  token_id?: string;
}

const TransporterDashboard: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const { account: address } = useWeb3();
  const { toast } = useToast();

  useEffect(() => {
    loadShipments();
  }, [address]);

  const loadShipments = async () => {
    try {
      setLoading(true);
      // Get products in transit assigned to this transporter
      const data = await trackingService.getProductsByCustodian(address || "");
      setShipments(data || []);
    } catch (error) {
      console.error("Error loading shipments:", error);
      toast({
        title: "Error",
        description: "Failed to load shipments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateLocation = async (productId: string, rfidTag: string) => {
    try {
      // In a real app, this would get GPS from device
      // For demo, we'll use random coordinates near a major city
      const location = {
        latitude: 37.7749 + (Math.random() - 0.5) * 0.1, // San Francisco area
        longitude: -122.4194 + (Math.random() - 0.5) * 0.1,
        accuracy: Math.random() * 10 + 5, // 5-15m accuracy
      };

      await iotService.updateLocation(rfidTag, location);

      toast({
        title: "Location Updated",
        description: `Updated location for product ${rfidTag}`,
      });
    } catch (error) {
      console.error("Error updating location:", error);
      toast({
        title: "Error",
        description: "Failed to update location",
        variant: "destructive",
      });
    }
  };

  const scanProduct = async (rfidTag: string) => {
    try {
      const result = await iotService.scanRFID(rfidTag);

      if (result.success) {
        toast({
          title: "Product Scanned",
          description: `Product ${rfidTag} scanned successfully`,
        });
      } else {
        throw new Error("Scan failed");
      }
    } catch (error) {
      console.error("Error scanning product:", error);
      toast({
        title: "Error",
        description: "Failed to scan product",
        variant: "destructive",
      });
    }
  };

  const completeDelivery = async (productId: string, tokenId: number) => {
    try {
      // Update status on blockchain using supplyChainService
      const result = await supplyChainService.transferProduct(
        tokenId,
        address || "", // In a real implementation, this would be the retailer's address
        3, // Status: Delivered
        "Delivery completed", // Location
        "Product delivered to destination" // Notes
      );

      if (result.success) {
        // Update status in Supabase
        await trackingService.updateProductStatus(productId, "delivered");

        toast({
          title: "Delivery Completed",
          description: "Product marked as delivered",
        });

        loadShipments();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error completing delivery:", error);
      toast({
        title: "Error",
        description: "Failed to complete delivery: " + (error as Error).message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-900/30 to-teal-900/30 border border-gray-700 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-white mb-2 bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
          Transporter Dashboard
        </h2>
        <p className="text-gray-300">
          Manage your shipments and track products in transit
        </p>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-1 mb-6">
          <TabsTrigger
            value="active"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-teal-600 data-[state=active]:text-white rounded-lg transition-all duration-300"
          >
            Active Shipments
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-teal-600 data-[state=active]:text-white rounded-lg transition-all duration-300"
          >
            Completed
          </TabsTrigger>
          <TabsTrigger
            value="tracking"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-teal-600 data-[state=active]:text-white rounded-lg transition-all duration-300"
          >
            Live Tracking
          </TabsTrigger>
          <TabsTrigger
            value="map"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-teal-600 data-[state=active]:text-white rounded-lg transition-all duration-300"
          >
            Map View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                Active Shipments
              </CardTitle>
              <CardDescription className="text-gray-400">
                Manage your current shipments in transit
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-500"></div>
                </div>
              ) : shipments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">🚚</div>
                  <h3 className="text-xl font-medium text-gray-300 mb-2">
                    No Active Shipments
                  </h3>
                  <p className="text-gray-500">
                    You don't have any shipments in transit at the moment.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {shipments
                    .filter((s) => s.status === "in_transit")
                    .map((shipment) => (
                      <Card
                        key={shipment.id}
                        className="p-5 bg-gray-800/30 border border-gray-700 hover:border-green-500/50 transition-all duration-300 backdrop-blur-sm"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-white mb-1">
                              {shipment.product_name || "Product"}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                              <div className="text-gray-400">
                                RFID:{" "}
                                <span className="text-gray-200">
                                  {shipment.rfid_tag}
                                </span>
                              </div>
                              <div className="text-gray-400">
                                From:{" "}
                                <span className="text-gray-200">
                                  {shipment.manufacturer?.name || "Unknown"}
                                </span>
                              </div>
                              <div className="text-gray-400">
                                To:{" "}
                                <span className="text-gray-200">
                                  {shipment.destination || "Unknown"}
                                </span>
                              </div>
                            </div>
                            <div className="mt-3">
                              <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">
                                In Transit
                              </Badge>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => scanProduct(shipment.rfid_tag)}
                              className="border-gray-600 text-gray-300 hover:bg-gray-700/50"
                            >
                              Scan
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateLocation(shipment.id, shipment.rfid_tag)
                              }
                              className="border-gray-600 text-gray-300 hover:bg-gray-700/50"
                            >
                              Update Location
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() =>
                                completeDelivery(
                                  shipment.id,
                                  parseInt(shipment.token_id || "0")
                                )
                              }
                              className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                            >
                              Complete Delivery
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

        <TabsContent value="completed">
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                Completed Shipments
              </CardTitle>
              <CardDescription className="text-gray-400">
                View your delivery history
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-500"></div>
                </div>
              ) : shipments.filter((s) => s.status === "delivered").length ===
                0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">✅</div>
                  <h3 className="text-xl font-medium text-gray-300 mb-2">
                    No Completed Shipments
                  </h3>
                  <p className="text-gray-500">
                    You haven't completed any deliveries yet.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {shipments
                    .filter((s) => s.status === "delivered")
                    .map((shipment) => (
                      <Card
                        key={shipment.id}
                        className="p-5 bg-gray-800/30 border border-gray-700 hover:border-green-500/50 transition-all duration-300 backdrop-blur-sm"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-white mb-1">
                              {shipment.product_name || "Product"}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                              <div className="text-gray-400">
                                RFID:{" "}
                                <span className="text-gray-200">
                                  {shipment.rfid_tag}
                                </span>
                              </div>
                              <div className="text-gray-400">
                                From:{" "}
                                <span className="text-gray-200">
                                  {shipment.manufacturer?.name || "Unknown"}
                                </span>
                              </div>
                              <div className="text-gray-400">
                                Delivered:{" "}
                                <span className="text-gray-200">
                                  {new Date(
                                    shipment.updated_at ||
                                      new Date().toISOString()
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="mt-3">
                              <Badge
                                variant="outline"
                                className="border-green-500/30 text-green-400"
                              >
                                Completed
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // View delivery details
                            }}
                            className="border-gray-600 text-gray-300 hover:bg-gray-700/50"
                          >
                            Details
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
                Live Tracking
              </CardTitle>
              <CardDescription className="text-gray-400">
                Real-time tracking with IoT sensors and GPS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedSupplyChainDashboard />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="map">
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl text-white">Shipment Map</CardTitle>
              <CardDescription className="text-gray-400">
                View all your shipments on a map
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] rounded-xl overflow-hidden">
                <div className="bg-gradient-to-br from-blue-900/30 via-purple-900/20 to-indigo-900/30 rounded-xl border border-gray-700/50 flex items-center justify-center h-full">
                  <div className="text-center p-6">
                    <div className="text-4xl mb-4">🌍</div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Shipment Tracking Map
                    </h3>
                    <p className="text-gray-400">
                      Interactive map showing shipment locations and routes
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TransporterDashboard;
