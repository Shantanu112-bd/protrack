import React, { useState, useEffect } from "react";
import { useWeb3 } from "../contexts/web3ContextTypes";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { LoadingSpinner } from "./ui/loading-spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { supabase, trackingService } from "../services/supabase";
import { fallbackService } from "../services/fallbackService";
import {
  ClipboardCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Plus,
  Eye,
  Thermometer,
  Droplets,
  Package,
  Loader2,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface QualityTest {
  id: string;
  product_id: string;
  test_type: string;
  test_parameters: any;
  result: "pass" | "fail" | "pending";
  score: number;
  notes?: string;
  tested_by: string;
  tested_at: string;
  created_at: string;
  // Joined data
  products?: {
    id: string;
    product_name: string;
    rfid_tag: string;
    batch_no: string;
  };
}

const QualityAssurance = () => {
  const { account, isActive } = useWeb3();
  const [tests, setTests] = useState<QualityTest[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [newTest, setNewTest] = useState({
    product_id: "",
    test_type: "",
    temperature_check: "",
    humidity_check: "",
    visual_inspection: "",
    packaging_integrity: "",
    notes: "",
  });

  // Load quality tests
  const loadTests = async () => {
    try {
      setLoading(true);

      // Check connection status
      const connectionStatus = fallbackService.getConnectionStatus();

      if (connectionStatus.supabaseConnected) {
        console.log("✅ Loading quality tests with full connectivity");

        try {
          const { data, error } = await supabase
            .from("quality_tests")
            .select(
              `
              *,
              products (
                id,
                product_name,
                rfid_tag,
                batch_no
              )
            `
            )
            .order("created_at", { ascending: false });

          if (error && error.code !== "PGRST116") {
            console.warn("Quality tests table might not exist, using fallback");
            setTests([]);
          } else {
            setTests(data || []);
          }
        } catch (dbError) {
          console.warn("Database error, using fallback:", dbError);
          setTests([]);
        }
      } else {
        console.log("📱 Loading quality tests in offline mode");

        // Load from localStorage or create mock data
        const storedTests = localStorage.getItem("protrack_quality_tests");
        if (storedTests) {
          setTests(JSON.parse(storedTests));
        } else {
          // Create some mock test data
          const mockTests = [
            {
              id: "test-mock-1",
              product_id: "mock-1",
              test_type: "comprehensive",
              test_parameters: {
                temperature: 22.5,
                humidity: 65,
                visual_inspection: "pass",
                packaging_integrity: "intact",
              },
              result: "pass" as const,
              score: 95,
              notes: "All parameters within acceptable range",
              tested_by: "0x1234...5678",
              tested_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              products: {
                id: "mock-1",
                product_name: "Organic Apples",
                rfid_tag: "RFID_MOCK_001",
                batch_no: "BATCH_001",
              },
            },
          ];
          setTests(mockTests);
          localStorage.setItem(
            "protrack_quality_tests",
            JSON.stringify(mockTests)
          );
        }
      }
    } catch (error) {
      console.error("Error loading quality tests:", error);
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  // Load products for testing with fallback support
  const loadProducts = async () => {
    try {
      // Use the enhanced tracking service with fallback
      const data = await trackingService.getAllProducts();
      setProducts(data || []);

      console.log(`Loaded ${data.length} products for quality testing`);
    } catch (error) {
      console.error("Error loading products:", error);

      // Fallback to mock products if everything fails
      const mockProducts = fallbackService.getMockProducts();
      setProducts(mockProducts);
      console.log("Using fallback mock products for quality testing");
    }
  };

  useEffect(() => {
    loadTests();
    loadProducts();
  }, []);

  // Run quality test
  const handleRunTest = async () => {
    if (!newTest.product_id) {
      alert("Please select a product");
      return;
    }

    try {
      setTesting(true);

      // Calculate test score based on parameters
      let score = 100;
      const testParams: any = {};

      if (newTest.temperature_check) {
        const temp = parseFloat(newTest.temperature_check);
        testParams.temperature = temp;
        if (temp > 25 || temp < 2) score -= 20;
        else if (temp > 20 || temp < 5) score -= 10;
      }

      if (newTest.humidity_check) {
        const humidity = parseFloat(newTest.humidity_check);
        testParams.humidity = humidity;
        if (humidity > 80 || humidity < 20) score -= 15;
        else if (humidity > 70 || humidity < 30) score -= 5;
      }

      if (newTest.visual_inspection) {
        testParams.visual_inspection = newTest.visual_inspection;
        if (newTest.visual_inspection === "fail") score -= 30;
        else if (newTest.visual_inspection === "warning") score -= 15;
      }

      if (newTest.packaging_integrity) {
        testParams.packaging_integrity = newTest.packaging_integrity;
        if (newTest.packaging_integrity === "damaged") score -= 25;
        else if (newTest.packaging_integrity === "minor_damage") score -= 10;
      }

      const result = score >= 80 ? "pass" : score >= 60 ? "warning" : "fail";

      const testRecord = {
        id: `test-${Date.now()}`,
        product_id: newTest.product_id,
        test_type: newTest.test_type || "comprehensive",
        test_parameters: testParams,
        result: result === "warning" ? "pass" : result,
        score: Math.max(0, score),
        notes: newTest.notes,
        tested_by: account || "offline-user",
        tested_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      // Check connection status and use appropriate method
      const connectionStatus = fallbackService.getConnectionStatus();

      if (connectionStatus.supabaseConnected) {
        console.log("✅ Running quality test with full connectivity");

        try {
          // Insert test result
          const { error } = await supabase
            .from("quality_tests")
            .insert(testRecord);

          if (error) {
            console.warn(
              "Quality tests table might not exist, storing offline:",
              error
            );
            throw new Error("Database table not available");
          }

          // Update product quality score in metadata
          const product = products.find((p) => p.id === newTest.product_id);
          if (product) {
            try {
              const { error: updateError } = await supabase
                .from("products")
                .update({
                  metadata: {
                    ...product.metadata,
                    qualityScore: Math.max(0, score),
                    lastQualityTest: new Date().toISOString(),
                  },
                })
                .eq("id", newTest.product_id);

              if (updateError)
                console.warn("Could not update product metadata:", updateError);
            } catch (updateErr) {
              console.warn("Product update failed:", updateErr);
            }
          }
        } catch (dbError) {
          console.warn("Database operation failed, storing offline:", dbError);

          // Store offline
          const storedTests = localStorage.getItem("protrack_quality_tests");
          const existingTests = storedTests ? JSON.parse(storedTests) : [];

          // Add product info for display
          const product = products.find((p) => p.id === newTest.product_id);
          if (product) {
            (testRecord as any).products = {
              id: product.id,
              product_name: product.product_name,
              rfid_tag: product.rfid_tag,
              batch_no: product.batch_no || product.batch_id,
            };
          }

          existingTests.unshift(testRecord);
          localStorage.setItem(
            "protrack_quality_tests",
            JSON.stringify(existingTests)
          );

          // Add to pending operations
          fallbackService.addPendingOperation({
            id: `quality-test-${testRecord.id}`,
            type: "CREATE_QUALITY_TEST",
            data: testRecord,
            timestamp: new Date().toISOString(),
            retryCount: 0,
          });
        }
      } else {
        console.log("📱 Running quality test in offline mode");

        // Store offline
        const storedTests = localStorage.getItem("protrack_quality_tests");
        const existingTests = storedTests ? JSON.parse(storedTests) : [];

        // Add product info for display
        const product = products.find((p) => p.id === newTest.product_id);
        if (product) {
          (testRecord as any).products = {
            id: product.id,
            product_name: product.product_name,
            rfid_tag: product.rfid_tag,
            batch_no: product.batch_no || product.batch_id,
          };
        }

        existingTests.unshift(testRecord);
        localStorage.setItem(
          "protrack_quality_tests",
          JSON.stringify(existingTests)
        );

        // Add to pending operations
        fallbackService.addPendingOperation({
          id: `quality-test-${testRecord.id}`,
          type: "CREATE_QUALITY_TEST",
          data: testRecord,
          timestamp: new Date().toISOString(),
          retryCount: 0,
        });
      }

      // Refresh tests
      await loadTests();

      // Reset form and close modal
      setShowTestModal(false);
      setNewTest({
        product_id: "",
        test_type: "",
        temperature_check: "",
        humidity_check: "",
        visual_inspection: "",
        packaging_integrity: "",
        notes: "",
      });

      const statusMessage = connectionStatus.supabaseConnected
        ? `Quality test completed! Score: ${Math.max(
            0,
            score
          )}/100 (${result.toUpperCase()})`
        : `Quality test completed offline! Score: ${Math.max(
            0,
            score
          )}/100 (${result.toUpperCase()}) - will sync when connection restored`;

      alert(statusMessage);
    } catch (error) {
      console.error("Error running test:", error);

      // Enhanced error handling
      let errorMessage = "Failed to run quality test. ";
      if (error instanceof Error) {
        if (error.message.includes("Network")) {
          errorMessage +=
            "Please check your internet connection and try again.";
        } else if (error.message.includes("product_id")) {
          errorMessage += "Please select a valid product.";
        } else {
          errorMessage += error.message;
        }
      } else {
        errorMessage += "Please try again.";
      }

      alert(errorMessage);
    } finally {
      setTesting(false);
    }
  };

  // Get result badge
  const getResultBadge = (result: string, score: number) => {
    switch (result) {
      case "pass":
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            PASS ({score})
          </Badge>
        );
      case "fail":
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-rose-500">
            <XCircle className="h-3 w-3 mr-1" />
            FAIL ({score})
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
            <AlertTriangle className="h-3 w-3 mr-1" />
            PENDING
          </Badge>
        );
    }
  };

  // Calculate statistics
  const stats = {
    totalTests: tests.length,
    passedTests: tests.filter((t) => t.result === "pass").length,
    failedTests: tests.filter((t) => t.result === "fail").length,
    averageScore:
      tests.length > 0
        ? tests.reduce((sum, t) => sum + t.score, 0) / tests.length
        : 0,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Quality Assurance
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive quality testing and compliance monitoring
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Button
            onClick={() => setShowTestModal(true)}
            className="flex items-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Run Test
          </Button>
          <Button
            onClick={loadTests}
            className="flex items-center bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tests</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalTests}
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <ClipboardCheck className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Passed Tests
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.passedTests}
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>
                {stats.totalTests > 0
                  ? ((stats.passedTests / stats.totalTests) * 100).toFixed(1)
                  : 0}
                % pass rate
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Failed Tests
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.failedTests}
                </p>
              </div>
              <div className="rounded-full bg-red-100 p-3">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Average Score
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.averageScore.toFixed(1)}
                </p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quality Tests Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ClipboardCheck className="h-5 w-5 mr-2 text-blue-500" />
            Quality Test Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Test Type</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Tested By</TableHead>
                  <TableHead>Test Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tests.length > 0 ? (
                  tests.map((test) => (
                    <TableRow key={test.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {test.products?.product_name || "Unknown Product"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {test.products?.rfid_tag} • Batch:{" "}
                            {test.products?.batch_no}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-gradient-to-r from-gray-500 to-gray-700 capitalize">
                          {test.test_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getResultBadge(test.result, test.score)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className={`h-2 rounded-full ${
                                test.score >= 80
                                  ? "bg-green-500"
                                  : test.score >= 60
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${test.score}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">
                            {test.score}/100
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">
                          {test.tested_by?.substring(0, 6)}...
                          {test.tested_by?.substring(test.tested_by.length - 4)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(test.tested_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            alert(
                              `Test Details:\n${JSON.stringify(
                                test.test_parameters,
                                null,
                                2
                              )}\n\nNotes: ${test.notes || "None"}`
                            );
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-gray-500"
                    >
                      No quality tests performed yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Run Test Modal */}
      {showTestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="flex items-center">
                  <Plus className="h-6 w-6 mr-2 text-blue-500" />
                  Run Quality Test
                </CardTitle>
                <Button
                  variant="ghost"
                  onClick={() => setShowTestModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="product_id">Product</Label>
                  <select
                    id="product_id"
                    value={newTest.product_id}
                    onChange={(e) =>
                      setNewTest({ ...newTest, product_id: e.target.value })
                    }
                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">
                      {products.length === 0
                        ? "Loading products..."
                        : `Select a product (${products.length} available)`}
                    </option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.product_name} ({product.rfid_tag}) -{" "}
                        {product.batch_no || product.batch_id}
                      </option>
                    ))}
                  </select>
                  {products.length === 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      No products available. Create a product first to enable
                      quality testing.
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="test_type">Test Type</Label>
                  <select
                    id="test_type"
                    value={newTest.test_type}
                    onChange={(e) =>
                      setNewTest({ ...newTest, test_type: e.target.value })
                    }
                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="comprehensive">Comprehensive Test</option>
                    <option value="temperature">Temperature Check</option>
                    <option value="visual">Visual Inspection</option>
                    <option value="packaging">Packaging Integrity</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="temperature_check">Temperature (°C)</Label>
                    <Input
                      id="temperature_check"
                      type="number"
                      step="0.1"
                      value={newTest.temperature_check}
                      onChange={(e) =>
                        setNewTest({
                          ...newTest,
                          temperature_check: e.target.value,
                        })
                      }
                      placeholder="e.g., 22.5"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="humidity_check">Humidity (%)</Label>
                    <Input
                      id="humidity_check"
                      type="number"
                      step="0.1"
                      value={newTest.humidity_check}
                      onChange={(e) =>
                        setNewTest({
                          ...newTest,
                          humidity_check: e.target.value,
                        })
                      }
                      placeholder="e.g., 65.0"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="visual_inspection">Visual Inspection</Label>
                    <select
                      id="visual_inspection"
                      value={newTest.visual_inspection}
                      onChange={(e) =>
                        setNewTest({
                          ...newTest,
                          visual_inspection: e.target.value,
                        })
                      }
                      className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select result</option>
                      <option value="pass">Pass</option>
                      <option value="warning">Warning</option>
                      <option value="fail">Fail</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="packaging_integrity">
                      Packaging Integrity
                    </Label>
                    <select
                      id="packaging_integrity"
                      value={newTest.packaging_integrity}
                      onChange={(e) =>
                        setNewTest({
                          ...newTest,
                          packaging_integrity: e.target.value,
                        })
                      }
                      className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select condition</option>
                      <option value="intact">Intact</option>
                      <option value="minor_damage">Minor Damage</option>
                      <option value="damaged">Damaged</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <textarea
                    id="notes"
                    value={newTest.notes}
                    onChange={(e) =>
                      setNewTest({ ...newTest, notes: e.target.value })
                    }
                    placeholder="Additional test notes..."
                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowTestModal(false)}
                  disabled={testing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRunTest}
                  disabled={testing || !newTest.product_id}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  {testing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Running Test...
                    </>
                  ) : (
                    <>
                      <ClipboardCheck className="h-4 w-4 mr-2" />
                      Run Test
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default QualityAssurance;
