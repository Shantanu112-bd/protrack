import React, { useState, useCallback } from "react";
import { useEnhancedWeb3 } from "../contexts/EnhancedWeb3Context";
import RFIDScannerService from "../services/RFIDScannerService";
// supabase import removed as it's not currently used
import { generateRandomKey } from "../utils/crypto";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface ScanResult {
  rfidHash: string;
  barcodeHash: string;
  rawData: string;
  timestamp: number;
  isValid: boolean;
  productExists: boolean;
  tokenId?: number;
  productData?: Record<string, unknown>;
}

interface ProductMetadata {
  name: string;
  description: string;
  manufacturer: string;
  batchNumber: string;
  manufacturingDate: number;
  expiryDate: number;
  category: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  certifications: string[];
  images: string[];
}

interface TokenizationRequest {
  rfidHash: string;
  productMetadata: ProductMetadata;
  manufacturerAddress: string;
  ipfsHash?: string;
}

interface Shipment {
  id: string;
  from: string;
  to: string;
  status: string;
  createdAt: string;
}

interface IoTDataPoint {
  id: string;
  temperature: number;
  humidity: number;
  timestamp: string;
  location: {
    lat: number;
    lng: number;
  };
}

const EnhancedRFIDScanner: React.FC = () => {
  const { account, isConnected, connectWallet } = useEnhancedWeb3();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isTokenizing, setIsTokenizing] = useState(false);
  const [showTokenizationForm, setShowTokenizationForm] = useState(false);
  const [productMetadata, setProductMetadata] = useState<ProductMetadata>({
    name: "",
    description: "",
    manufacturer: "",
    batchNumber: "",
    manufacturingDate: Date.now(),
    expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
    category: "",
    certifications: [],
    images: [],
  });
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [iotData, setIotData] = useState<IoTDataPoint[]>([]);
  const [activeTab, setActiveTab] = useState("scan");
  const [alert, setAlert] = useState<{
    type: "success" | "error" | "warning" | "info";
    message: string;
  } | null>(null);

  // Handle scan completion
  const handleScanComplete = useCallback((result: ScanResult) => {
    setScanResult(result);
    if (result.productExists && result.tokenId) {
      // Fetch product history
      fetchProductHistory(result.tokenId);
    }
  }, []);

  // Fetch product history including shipments and IoT data
  const fetchProductHistory = async (tokenId: number) => {
    try {
      const history = await RFIDScannerService.getProductHistory(tokenId);
      console.log("Product history:", history);

      // For demo purposes, we'll create mock data
      const mockShipments: Shipment[] = [
        {
          id: "1",
          from: "Manufacturer A",
          to: "Warehouse B",
          status: "In Transit",
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          from: "Warehouse B",
          to: "Retailer C",
          status: "Delivered",
          createdAt: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      ];

      const mockIoTData: IoTDataPoint[] = [
        {
          id: "1",
          temperature: 22.5,
          humidity: 45.2,
          timestamp: new Date().toISOString(),
          location: { lat: 40.7128, lng: -74.006 },
        },
        {
          id: "2",
          temperature: 21.8,
          humidity: 44.7,
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          location: { lat: 40.7215, lng: -74.0025 },
        },
      ];

      setShipments(mockShipments);
      setIotData(mockIoTData);
    } catch (error) {
      console.error("Error fetching product history:", error);
      setAlert({ type: "error", message: "Failed to fetch product history" });
    }
  };

  // Handle RFID scan
  const handleScan = async () => {
    if (!isConnected) {
      setAlert({
        type: "warning",
        message: "Please connect your wallet first",
      });
      return;
    }

    setIsScanning(true);
    setAlert(null);

    try {
      const result = await RFIDScannerService.scanRFID();
      handleScanComplete({
        ...result,
        barcodeHash: result.rfidHash, // For demo, we'll use the same hash for both
      });
      setAlert({
        type: "success",
        message: result.isValid
          ? result.productExists
            ? "Product found! Authenticity verified."
            : "New product detected. Ready for tokenization."
          : "Invalid RFID data",
      });
    } catch (error) {
      console.error("Scan failed:", error);
      setAlert({ type: "error", message: "Scan failed. Please try again." });
    } finally {
      setIsScanning(false);
    }
  };

  // Handle product tokenization
  const handleTokenizeProduct = async () => {
    if (!scanResult || !account) return;

    setIsTokenizing(true);
    setAlert(null);

    try {
      // Generate encryption key for MPC (not used in this simplified version)
      const encryptionKey = generateRandomKey();
      // In a full implementation, we would use the encrypted metadata
      // For now, we'll just log it for demonstration
      console.log("Encryption key generated:", encryptionKey);

      const request: TokenizationRequest = {
        rfidHash: scanResult.rfidHash,
        productMetadata: {
          ...productMetadata,
          manufacturingDate: Date.now(),
          expiryDate: productMetadata.expiryDate,
        },
        manufacturerAddress: account,
        ipfsHash: undefined, // Will be generated by the service
      };

      const result = await RFIDScannerService.tokenizeProduct(request, account);

      if (result.success && result.tokenId) {
        setAlert({
          type: "success",
          message: `Product tokenized successfully! Token ID: ${result.tokenId}`,
        });
        setShowTokenizationForm(false);
        // Reset form
        setProductMetadata({
          name: "",
          description: "",
          manufacturer: "",
          batchNumber: "",
          manufacturingDate: Date.now(),
          expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
          category: "",
          certifications: [],
          images: [],
        });
        // Refresh scan result to show product exists
        if (scanResult) {
          handleScanComplete({
            ...scanResult,
            productExists: true,
            tokenId: result.tokenId,
          });
        }
      } else {
        setAlert({
          type: "error",
          message: `Tokenization failed: ${result.error || "Unknown error"}`,
        });
      }
    } catch (error) {
      console.error("Tokenization failed:", error);
      setAlert({
        type: "error",
        message: "Tokenization failed. Please try again.",
      });
    } finally {
      setIsTokenizing(false);
    }
  };

  // Handle product verification
  const handleVerifyProduct = async () => {
    if (!scanResult) return;

    try {
      const verification = await RFIDScannerService.verifyProduct(
        scanResult.rfidHash
      );

      if (verification.isAuthentic) {
        setAlert({
          type: "success",
          message: "Product is authentic!",
        });
        console.log("Product details:", verification.product);
        console.log("IoT data:", verification.iotData);
      } else {
        setAlert({
          type: "error",
          message: "Product is not authentic or not found in the system.",
        });
      }
    } catch (error) {
      console.error("Verification failed:", error);
      setAlert({
        type: "error",
        message: "Verification failed. Please try again.",
      });
    }
  };

  // Reset scanner
  const resetScanner = () => {
    setScanResult(null);
    setShowTokenizationForm(false);
    setAlert(null);
    setShipments([]);
    setIotData([]);
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProductMetadata((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setProductMetadata((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Enhanced RFID Scanner
          </CardTitle>
          <p className="text-muted-foreground">
            Scan RFID tags to verify authenticity or tokenize new products in
            the supply chain
          </p>
        </CardHeader>
        <CardContent>
          {alert && (
            <Alert
              className="mb-4"
              variant={alert.type === "error" ? "destructive" : "default"}
            >
              <AlertTitle>
                {alert.type === "success" && "Success!"}
                {alert.type === "error" && "Error!"}
                {alert.type === "warning" && "Warning!"}
                {alert.type === "info" && "Info"}
              </AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          )}

          {!isConnected ? (
            <div className="text-center py-8">
              <p className="mb-4">
                Connect your wallet to use the RFID scanner
              </p>
              <Button onClick={connectWallet}>Connect Wallet</Button>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="scan">Scan</TabsTrigger>
                <TabsTrigger value="product">Product Info</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="tracking">Tracking</TabsTrigger>
              </TabsList>

              <TabsContent value="scan">
                <div className="text-center mb-8">
                  <div className="relative inline-block p-8 rounded-full bg-gray-100 dark:bg-gray-800 mb-6">
                    <div
                      className={`w-32 h-32 rounded-full border-4 ${
                        isScanning
                          ? "border-blue-500 animate-pulse"
                          : "border-gray-300 dark:border-gray-600"
                      } flex items-center justify-center`}
                    >
                      {isScanning ? (
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                      ) : (
                        <svg
                          className="w-16 h-16 text-gray-500 dark:text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        </svg>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={handleScan}
                    disabled={isScanning}
                    className="px-8 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    {isScanning ? "Scanning..." : "Start RFID Scan"}
                  </Button>
                </div>

                {scanResult && (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Scan Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label className="text-sm font-medium">
                            RFID Hash
                          </Label>
                          <p className="text-sm font-mono break-all bg-gray-100 dark:bg-gray-800 p-2 rounded">
                            {scanResult.rfidHash}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">
                            Barcode Hash
                          </Label>
                          <p className="text-sm font-mono break-all bg-gray-100 dark:bg-gray-800 p-2 rounded">
                            {scanResult.barcodeHash || "N/A"}
                          </p>
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Status</Label>
                          <div className="flex items-center space-x-2">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                scanResult.isValid
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              }`}
                            ></div>
                            <span className="text-sm">
                              {scanResult.isValid
                                ? "Valid RFID"
                                : "Invalid RFID"}
                            </span>
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium">
                            Product Status
                          </Label>
                          <div className="flex items-center space-x-2">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                scanResult.productExists
                                  ? "bg-blue-500"
                                  : "bg-yellow-500"
                              }`}
                            ></div>
                            <span className="text-sm">
                              {scanResult.productExists
                                ? "Existing Product"
                                : "New Product"}
                            </span>
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium">
                            Scan Time
                          </Label>
                          <p className="text-sm">
                            {new Date(scanResult.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4">
                        {scanResult.productExists ? (
                          <Button
                            onClick={handleVerifyProduct}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Verify Product
                          </Button>
                        ) : (
                          <Button
                            onClick={() => setShowTokenizationForm(true)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Tokenize Product
                          </Button>
                        )}
                        <Button onClick={resetScanner} variant="outline">
                          New Scan
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Tokenization Form Dialog */}
                <Dialog
                  open={showTokenizationForm}
                  onOpenChange={setShowTokenizationForm}
                >
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Product Information</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Product Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={productMetadata.name}
                          onChange={handleInputChange}
                          placeholder="Enter product name"
                        />
                      </div>

                      <div>
                        <Label htmlFor="batchNumber">Batch Number *</Label>
                        <Input
                          id="batchNumber"
                          name="batchNumber"
                          value={productMetadata.batchNumber}
                          onChange={handleInputChange}
                          placeholder="Enter batch number"
                        />
                      </div>

                      <div>
                        <Label htmlFor="manufacturer">Manufacturer *</Label>
                        <Input
                          id="manufacturer"
                          name="manufacturer"
                          value={productMetadata.manufacturer}
                          onChange={handleInputChange}
                          placeholder="Enter manufacturer name"
                        />
                      </div>

                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={productMetadata.category}
                          onValueChange={(value) =>
                            handleSelectChange("category", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="food">
                              Food & Beverages
                            </SelectItem>
                            <SelectItem value="electronics">
                              Electronics
                            </SelectItem>
                            <SelectItem value="pharmaceuticals">
                              Pharmaceuticals
                            </SelectItem>
                            <SelectItem value="textiles">Textiles</SelectItem>
                            <SelectItem value="automotive">
                              Automotive
                            </SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="expiryDate">Expiry Date *</Label>
                        <Input
                          id="expiryDate"
                          name="expiryDate"
                          type="datetime-local"
                          value={new Date(productMetadata.expiryDate)
                            .toISOString()
                            .slice(0, 16)}
                          onChange={(e) =>
                            setProductMetadata({
                              ...productMetadata,
                              expiryDate: new Date(e.target.value).getTime(),
                            })
                          }
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          name="description"
                          value={productMetadata.description}
                          onChange={handleInputChange}
                          placeholder="Enter product description"
                          rows={3}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4 mt-6">
                      <Button
                        onClick={() => setShowTokenizationForm(false)}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleTokenizeProduct}
                        disabled={
                          isTokenizing ||
                          !productMetadata.name ||
                          !productMetadata.batchNumber ||
                          !productMetadata.manufacturer
                        }
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isTokenizing ? "Tokenizing..." : "Create Product NFT"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </TabsContent>

              <TabsContent value="product">
                {scanResult && scanResult.productExists ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Product Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">
                            Token ID
                          </Label>
                          <p className="text-lg font-semibold">
                            {scanResult.tokenId}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">
                            Product Name
                          </Label>
                          <p className="text-lg">
                            {scanResult.productData
                              ? (
                                  scanResult.productData as Record<
                                    string,
                                    string
                                  >
                                ).productName || "N/A"
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">
                            Batch Number
                          </Label>
                          <p className="text-lg">
                            {scanResult.productData
                              ? (
                                  scanResult.productData as Record<
                                    string,
                                    string
                                  >
                                ).batchId || "N/A"
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Status</Label>
                          <Badge variant="secondary">
                            {scanResult.productData
                              ? (
                                  scanResult.productData as Record<
                                    string,
                                    string
                                  >
                                ).status || "Unknown"
                              : "Unknown"}
                          </Badge>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">
                            Manufacturer
                          </Label>
                          <p className="text-lg">
                            {scanResult.productData
                              ? (
                                  scanResult.productData as Record<
                                    string,
                                    string
                                  >
                                ).manufacturer || "N/A"
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">
                            Expiry Date
                          </Label>
                          <p className="text-lg">
                            {scanResult.productData &&
                            (scanResult.productData as Record<string, string>)
                              .expiryDate
                              ? new Date(
                                  parseInt(
                                    (
                                      scanResult.productData as Record<
                                        string,
                                        string
                                      >
                                    ).expiryDate as string
                                  ) * 1000
                                ).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No product information available. Scan a product to view
                      details.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Shipment History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {shipments.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>From</TableHead>
                              <TableHead>To</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {shipments.map((shipment) => (
                              <TableRow key={shipment.id}>
                                <TableCell>{shipment.from}</TableCell>
                                <TableCell>{shipment.to}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      shipment.status === "Delivered"
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {shipment.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {new Date(
                                    shipment.createdAt
                                  ).toLocaleDateString()}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <p className="text-muted-foreground text-center py-4">
                          No shipment history available
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>IoT Sensor Data</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {iotData.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Temperature (°C)</TableHead>
                              <TableHead>Humidity (%)</TableHead>
                              <TableHead>Time</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {iotData.map((data) => (
                              <TableRow key={data.id}>
                                <TableCell>{data.temperature}</TableCell>
                                <TableCell>{data.humidity}</TableCell>
                                <TableCell>
                                  {new Date(
                                    data.timestamp
                                  ).toLocaleTimeString()}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <p className="text-muted-foreground text-center py-4">
                          No IoT data available
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="tracking">
                <Card>
                  <CardHeader>
                    <CardTitle>Product Tracking</CardTitle>
                    <CardDescription>
                      Track this product through the supply chain with IoT data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 rounded-lg bg-gray-800/50 border border-gray-700 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl mb-4">🌍</div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                          Supply Chain Tracking
                        </h3>
                        <p className="text-gray-400">
                          Real-time tracking with temperature, humidity, and GPS
                          data
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedRFIDScanner;
