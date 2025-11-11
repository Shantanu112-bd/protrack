import React, { useState, useEffect } from "react";
import { useEnhancedWeb3 } from "../contexts/EnhancedWeb3Context";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
// Button import removed as it's not currently used
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { supabase } from "../services/supabase";
import { Json } from "../types/supabase";

interface Product {
  id: string;
  rfid_tag: string;
  batch_id: string;
  product_name: string;
  token_id: string;
  manufacturer_id: string;
  expiry_date: string;
  status: string;
  current_custodian_id: string | null;
  created_at: string;
  updated_at: string;
}

interface Shipment {
  id: string;
  product_id: string;
  from_party: string;
  to_party: string;
  status: string;
  requested_at: string;
  approved_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  confirmed_at: string | null;
}

interface IoTData {
  id: string;
  product_id: string;
  data: Json;
  timestamp: string;
  created_at: string;
}

const SupplyChainDashboard: React.FC = () => {
  const { account, isConnected } = useEnhancedWeb3();
  const [userRole, setUserRole] = useState<string>("manufacturer");
  const [products, setProducts] = useState<Product[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [iotData, setIotData] = useState<IoTData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch data based on user role
  useEffect(() => {
    if (isConnected && account) {
      fetchData();
    }
  }, [isConnected, account, userRole]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch products based on role
      let productsQuery = supabase.from("products").select("*");

      if (userRole === "manufacturer") {
        // Get products manufactured by this user
        const { data: manufacturerData } = await supabase
          .from("users")
          .select("id")
          .eq("wallet_address", account?.toLowerCase() || "");

        if (manufacturerData && manufacturerData.length > 0) {
          productsQuery = productsQuery.eq(
            "manufacturer_id",
            manufacturerData[0].id
          );
        }
      } else if (userRole === "transporter") {
        // Get products in transit
        productsQuery = productsQuery.eq("status", "in_transit");
      } else if (userRole === "retailer") {
        // Get products at retailer
        const { data: retailerData } = await supabase
          .from("users")
          .select("id")
          .eq("wallet_address", account?.toLowerCase() || "");

        if (retailerData && retailerData.length > 0) {
          productsQuery = productsQuery.eq(
            "current_custodian_id",
            retailerData[0].id
          );
        }
      }
      // For admin, get all products (no filter)

      const { data: productsData, error: productsError } = await productsQuery;
      if (productsError) throw productsError;
      setProducts(productsData || ([] as Product[]));

      // Fetch shipments
      let shipmentsQuery = supabase.from("shipments").select("*");

      if (userRole === "manufacturer") {
        const { data: manufacturerData } = await supabase
          .from("users")
          .select("id")
          .eq("wallet_address", account?.toLowerCase() || "");

        if (manufacturerData && manufacturerData.length > 0) {
          shipmentsQuery = shipmentsQuery.eq(
            "from_party",
            manufacturerData[0].id
          );
        }
      } else if (userRole === "transporter") {
        shipmentsQuery = shipmentsQuery.eq("status", "approved");
      } else if (userRole === "retailer") {
        const { data: retailerData } = await supabase
          .from("users")
          .select("id")
          .eq("wallet_address", account?.toLowerCase() || "");

        if (retailerData && retailerData.length > 0) {
          shipmentsQuery = shipmentsQuery.eq("to_party", retailerData[0].id);
        }
      }
      // For admin, get all shipments (no filter)

      const { data: shipmentsData, error: shipmentsError } =
        await shipmentsQuery;
      if (shipmentsError) throw shipmentsError;
      setShipments(shipmentsData || ([] as Shipment[]));

      // Fetch recent IoT data
      const { data: iotData, error: iotError } = await supabase
        .from("iot_data")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(10);

      if (iotError) throw iotError;
      setIotData(iotData || ([] as IoTData[]));
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle role change
  const handleRoleChange = (role: string) => {
    setUserRole(role);
  };

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "manufactured":
        return "default";
      case "packaged":
        return "secondary";
      case "in_transit":
        return "default";
      case "delivered":
        return "default";
      case "received":
        return "default";
      default:
        return "secondary";
    }
  };

  // Get shipment status badge variant
  const getShipmentStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "requested":
        return "secondary";
      case "approved":
        return "default";
      case "shipped":
        return "default";
      case "delivered":
        return "default";
      case "confirmed":
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Supply Chain Dashboard</h1>
          <p className="text-muted-foreground">
            Track products and shipments across the supply chain
          </p>
        </div>

        <div className="mt-4 md:mt-0">
          <Select value={userRole} onValueChange={handleRoleChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manufacturer">Manufacturer</SelectItem>
              <SelectItem value="transporter">Transporter</SelectItem>
              <SelectItem value="retailer">Retailer</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg">
          {error}
        </div>
      )}

      <Tabs defaultValue="products">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="shipments">Shipments</TabsTrigger>
          <TabsTrigger value="iot">IoT Data</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Batch ID</TableHead>
                      <TableHead>RFID Tag</TableHead>
                      <TableHead>Token ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expiry Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          {product.product_name}
                        </TableCell>
                        <TableCell>{product.batch_id}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {product.rfid_tag.substring(0, 10)}...
                        </TableCell>
                        <TableCell>{product.token_id}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(product.status)}>
                            {product.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(product.expiry_date).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                    {products.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-muted-foreground"
                        >
                          No products found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipments">
          <Card>
            <CardHeader>
              <CardTitle>Shipments</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Requested At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shipments.map((shipment) => (
                      <TableRow key={shipment.id}>
                        <TableCell>{shipment.product_id}</TableCell>
                        <TableCell>
                          {shipment.from_party.substring(0, 10)}...
                        </TableCell>
                        <TableCell>
                          {shipment.to_party.substring(0, 10)}...
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getShipmentStatusVariant(shipment.status)}
                          >
                            {shipment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(shipment.requested_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                    {shipments.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-muted-foreground"
                        >
                          No shipments found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="iot">
          <Card>
            <CardHeader>
              <CardTitle>IoT Sensor Data</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Temperature (°C)</TableHead>
                      <TableHead>Humidity (%)</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {iotData.map((data) => (
                      <TableRow key={data.id}>
                        <TableCell>{data.product_id}</TableCell>
                        <TableCell>
                          {typeof data.data === "object" &&
                          data.data !== null &&
                          "temperature" in data.data
                            ? (data.data as { temperature?: number })
                                .temperature || "N/A"
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          {typeof data.data === "object" &&
                          data.data !== null &&
                          "humidity" in data.data
                            ? (data.data as { humidity?: number }).humidity ||
                              "N/A"
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          {new Date(data.timestamp).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                    {iotData.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center text-muted-foreground"
                        >
                          No IoT data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupplyChainDashboard;
