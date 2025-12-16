import React, { useState, useEffect } from "react";
import { trackingService } from "../services/supabase";
import { fallbackService } from "../services/fallbackService";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Loader, AlertCircle, CheckCircle, MapPin, Clock } from "lucide-react";

interface ShipmentTrackerProps {
  productId?: string;
}

// Supabase shipment interface
interface Shipment {
  id: string;
  product_id: string;
  from_party?: string;
  to_party?: string;
  status: "requested" | "approved" | "shipped" | "delivered" | "confirmed";
  destination?: string;
  origin?: string;
  current_location?: string;
  created_at: string;
  updated_at: string;
  products?: {
    id: string;
    product_name: string;
    rfid_tag: string;
    batch_no: string;
    current_location: string;
  };
}

const ShipmentTracker: React.FC<ShipmentTrackerProps> = ({ productId }) => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [newShipment, setNewShipment] = useState({
    product_id: productId || "",
    origin: "",
    destination: "",
  });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadShipments();
  }, []);

  const loadShipments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await trackingService.getAllShipments();
      // Map Supabase data to component format
      const mappedShipments = (data || []).map((shipment: any) => ({
        ...shipment,
        origin: shipment.from_party || shipment.products?.current_location || "Unknown",
        current_location: shipment.products?.current_location || shipment.destination || "Unknown",
      }));
      setShipments(mappedShipments);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load shipments");
      console.error("Error loading shipments:", err);
      // Try fallback
      const fallbackShipments = fallbackService.getMockShipments();
      setShipments(fallbackShipments as any);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShipment.product_id || !newShipment.origin || !newShipment.destination) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const shipmentData = {
        product_id: newShipment.product_id,
        destination: newShipment.destination,
        from_party: newShipment.origin, // Map origin to from_party
        status: "requested" as const,
      };

      const createdShipment = await trackingService.createShipment(shipmentData);
      
      // Map response to component format
      const mappedShipment = {
        ...createdShipment,
        origin: newShipment.origin,
        current_location: newShipment.origin,
      };

      setShipments((prev) => [mappedShipment, ...prev]);
      setNewShipment({ product_id: productId || "", origin: "", destination: "" });
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create shipment");
      console.error("Error creating shipment:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (shipmentId: string, newStatus: string) => {
    try {
      setError(null);
      // Map status values to Supabase format
      const supabaseStatus = newStatus === "in_transit" ? "shipped" : 
                            newStatus === "delivered" ? "delivered" : 
                            newStatus === "pending" ? "requested" : 
                            newStatus as any;

      const updatedShipment = await trackingService.updateShipmentStatus(shipmentId, supabaseStatus);
      
      setShipments((prev) =>
        prev.map((s) => (s.id === shipmentId ? { ...s, ...updatedShipment } : s))
      );
      setSelectedShipment({ ...selectedShipment, ...updatedShipment } as Shipment);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
      console.error("Error updating status:", err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
      case "requested":
        return "bg-yellow-100 text-yellow-800";
      case "in_transit":
      case "shipped":
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "delivered":
      case "confirmed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatStatus = (status: string) => {
    return status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Shipments</CardTitle>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            New Shipment
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {showForm && (
            <Card className="bg-gray-50">
              <CardContent className="pt-6">
                <form onSubmit={handleCreateShipment} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="product_id">Product ID *</Label>
                    <Input
                      id="product_id"
                      value={newShipment.product_id}
                      onChange={(e) =>
                        setNewShipment({ ...newShipment, product_id: e.target.value })
                      }
                      placeholder="Enter product ID"
                      disabled={loading || !!productId}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="origin">Origin *</Label>
                      <Input
                        id="origin"
                        value={newShipment.origin}
                        onChange={(e) =>
                          setNewShipment({ ...newShipment, origin: e.target.value })
                        }
                        placeholder="e.g., Warehouse A"
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="destination">Destination *</Label>
                      <Input
                        id="destination"
                        value={newShipment.destination}
                        onChange={(e) =>
                          setNewShipment({ ...newShipment, destination: e.target.value })
                        }
                        placeholder="e.g., Store B"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {loading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                      Create
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setShowForm(false)}
                      variant="outline"
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {loading && shipments.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <Loader className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : shipments.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No shipments yet</p>
          ) : (
            <div className="space-y-3">
              {shipments.map((shipment) => (
                <Card
                  key={shipment.id}
                  className={`cursor-pointer transition ${
                    selectedShipment?.id === shipment.id ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => setSelectedShipment(shipment)}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-600" />
                          <span className="font-medium">
                            {shipment.origin} → {shipment.destination}
                          </span>
                          <Badge className={getStatusColor(shipment.status)}>
                            {formatStatus(shipment.status)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>Current: {shipment.current_location}</span>
                        </div>
                        <p className="text-sm text-gray-500">
                          Product: {shipment.product_id}
                        </p>
                      </div>
                    </div>

                    {selectedShipment?.id === shipment.id && (
                      <div className="mt-4 pt-4 border-t space-y-3">
                        <p className="font-medium text-sm">Update Status:</p>
                        <div className="flex gap-2">
                          {["requested", "shipped", "delivered"].map((status) => (
                            <Button
                              key={status}
                              onClick={() => handleUpdateStatus(shipment.id, status)}
                              variant={
                                shipment.status === status ? "default" : "outline"
                              }
                              size="sm"
                              disabled={loading}
                            >
                              {formatStatus(status)}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ShipmentTracker;
