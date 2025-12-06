import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { trackingService } from '../../services/supabase';
import { iotService } from '../../services/IoTService';
import { useWeb3 } from '../../contexts/Web3Context';
import { useToast } from '../ui/use-toast';

const TransporterDashboard: React.FC = () => {
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { address } = useWeb3();
  const { toast } = useToast();

  useEffect(() => {
    loadShipments();
  }, [address]);

  const loadShipments = async () => {
    try {
      setLoading(true);
      // Get products in transit assigned to this transporter
      const data = await trackingService.getProductsByCustodian(address || '');
      setShipments(data || []);
    } catch (error) {
      console.error('Error loading shipments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load shipments',
        variant: 'destructive',
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
        title: 'Location Updated',
        description: `Updated location for product ${rfidTag}`,
      });
    } catch (error) {
      console.error('Error updating location:', error);
      toast({
        title: 'Error',
        description: 'Failed to update location',
        variant: 'destructive',
      });
    }
  };

  const scanProduct = async (rfidTag: string) => {
    try {
      const result = await iotService.scanRFID(rfidTag);
      
      if (result.success) {
        toast({
          title: 'Product Scanned',
          description: `Product ${rfidTag} scanned successfully`,
        });
      } else {
        throw new Error('Scan failed');
      }
    } catch (error) {
      console.error('Error scanning product:', error);
      toast({
        title: 'Error',
        description: 'Failed to scan product',
        variant: 'destructive',
      });
    }
  };

  const completeDelivery = async (productId: string) => {
    try {
      await trackingService.updateProductStatus(productId, 'delivered');
      toast({
        title: 'Delivery Completed',
        description: 'Product marked as delivered',
      });
      loadShipments();
    } catch (error) {
      console.error('Error completing delivery:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete delivery',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Transporter Dashboard</h1>
      
      <Tabs defaultValue="active">
        <TabsList className="mb-4">
          <TabsTrigger value="active">Active Shipments</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="map">Map View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Shipments</CardTitle>
              <CardDescription>
                Manage your current shipments in transit
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading shipments...</p>
              ) : shipments.length === 0 ? (
                <p>No active shipments found.</p>
              ) : (
                <div className="grid gap-4">
                  {shipments.filter(s => s.status === 'in_transit').map((shipment) => (
                    <Card key={shipment.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{shipment.product_name || 'Product'}</h3>
                          <p className="text-sm text-gray-500">RFID: {shipment.rfid_tag}</p>
                          <p className="text-sm text-gray-500">From: {shipment.manufacturer?.name || 'Unknown'}</p>
                          <p className="text-sm text-gray-500">To: {shipment.destination || 'Unknown'}</p>
                          <div className="mt-2">
                            <Badge>{shipment.status}</Badge>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => scanProduct(shipment.rfid_tag)}
                            className="w-full"
                          >
                            Scan
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updateLocation(shipment.id, shipment.rfid_tag)}
                            className="w-full"
                          >
                            Update Location
                          </Button>
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => completeDelivery(shipment.id)}
                            className="w-full"
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
          <Card>
            <CardHeader>
              <CardTitle>Completed Shipments</CardTitle>
              <CardDescription>
                View your delivery history
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading shipments...</p>
              ) : shipments.filter(s => s.status === 'delivered').length === 0 ? (
                <p>No completed shipments found.</p>
              ) : (
                <div className="grid gap-4">
                  {shipments.filter(s => s.status === 'delivered').map((shipment) => (
                    <Card key={shipment.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{shipment.product_name || 'Product'}</h3>
                          <p className="text-sm text-gray-500">RFID: {shipment.rfid_tag}</p>
                          <p className="text-sm text-gray-500">From: {shipment.manufacturer?.name || 'Unknown'}</p>
                          <p className="text-sm text-gray-500">To: {shipment.destination || 'Unknown'}</p>
                          <p className="text-sm text-gray-500">
                            Delivered: {new Date(shipment.updated_at).toLocaleDateString()}
                          </p>
                          <div className="mt-2">
                            <Badge variant="outline">Completed</Badge>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            // View delivery details
                          }}
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
        
        <TabsContent value="map">
          <Card>
            <CardHeader>
              <CardTitle>Shipment Map</CardTitle>
              <CardDescription>
                View all your shipments on a map
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 rounded-md p-4 text-center h-[400px] flex items-center justify-center">
                <p>Map view will be implemented with Mapbox in the next phase.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TransporterDashboard;