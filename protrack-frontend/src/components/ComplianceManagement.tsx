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
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Plus,
  Eye,
  FileText,
  Calendar,
  Clock,
  Loader2,
  Download,
  Upload,
} from "lucide-react";

interface ComplianceRecord {
  id: string;
  product_id: string;
  regulation_type: string;
  compliance_status: "compliant" | "non_compliant" | "pending" | "expired";
  certificate_number?: string;
  issued_date: string;
  expiry_date?: string;
  issuing_authority: string;
  document_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  products?: {
    id: string;
    product_name: string;
    rfid_tag: string;
    batch_no: string;
  };
}

const ComplianceManagement = () => {
  const { account, isActive } = useWeb3();
  const [records, setRecords] = useState<ComplianceRecord[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [newRecord, setNewRecord] = useState({
    product_id: "",
    regulation_type: "",
    compliance_status: "compliant" as const,
    certificate_number: "",
    issued_date: "",
    expiry_date: "",
    issuing_authority: "",
    notes: "",
  });

  // Load compliance records
  const loadRecords = async () => {
    try {
      setLoading(true);

      // Check connection status
      const connectionStatus = fallbackService.getConnectionStatus();

      if (connectionStatus.supabaseConnected) {
        console.log("✅ Loading compliance records with full connectivity");

        try {
          const { data, error } = await supabase
            .from("compliance_records")
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
            console.warn(
              "Compliance records table might not exist, using fallback"
            );
            setRecords([]);
          } else {
            // Check for expired records
            const currentDate = new Date();
            const updatedRecords = (data || []).map((record) => {
              if (
                record.expiry_date &&
                new Date(record.expiry_date) < currentDate &&
                record.compliance_status === "compliant"
              ) {
                return { ...record, compliance_status: "expired" };
              }
              return record;
            });

            setRecords(updatedRecords);
          }
        } catch (dbError) {
          console.warn("Database error, using fallback:", dbError);
          setRecords([]);
        }
      } else {
        console.log("📱 Loading compliance records in offline mode");

        // Load from localStorage or create mock data
        const storedRecords = localStorage.getItem(
          "protrack_compliance_records"
        );
        if (storedRecords) {
          setRecords(JSON.parse(storedRecords));
        } else {
          // Create some mock compliance data
          const mockRecords = [
            {
              id: "compliance-mock-1",
              product_id: "mock-1",
              regulation_type: "fda_approval",
              compliance_status: "compliant" as const,
              certificate_number: "FDA-2024-001",
              issued_date: "2024-01-15",
              expiry_date: "2025-01-15",
              issuing_authority: "FDA",
              notes: "Full FDA approval for food safety",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              products: {
                id: "mock-1",
                product_name: "Organic Apples",
                rfid_tag: "RFID_MOCK_001",
                batch_no: "BATCH_001",
              },
            },
          ];
          setRecords(mockRecords);
          localStorage.setItem(
            "protrack_compliance_records",
            JSON.stringify(mockRecords)
          );
        }
      }
    } catch (error) {
      console.error("Error loading compliance records:", error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // Load products with fallback support
  const loadProducts = async () => {
    try {
      // Use the enhanced tracking service with fallback
      const data = await trackingService.getAllProducts();
      setProducts(data || []);

      console.log(`Loaded ${data.length} products for compliance management`);
    } catch (error) {
      console.error("Error loading products:", error);

      // Fallback to mock products if everything fails
      const mockProducts = fallbackService.getMockProducts();
      setProducts(mockProducts);
      console.log("Using fallback mock products for compliance management");
    }
  };

  useEffect(() => {
    loadRecords();
    loadProducts();
  }, []);

  // Create compliance record
  const handleCreateRecord = async () => {
    if (!newRecord.product_id) {
      alert("Please select a product");
      return;
    }

    if (
      !newRecord.regulation_type ||
      !newRecord.issuing_authority ||
      !newRecord.issued_date
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setCreating(true);

      // Determine compliance status based on expiry
      let status: "compliant" | "non_compliant" | "pending" | "expired" =
        newRecord.compliance_status;
      if (
        newRecord.expiry_date &&
        new Date(newRecord.expiry_date) < new Date()
      ) {
        status = "expired";
      }

      const complianceRecord = {
        id: `compliance-${Date.now()}`,
        product_id: newRecord.product_id,
        regulation_type: newRecord.regulation_type,
        compliance_status: status,
        certificate_number: newRecord.certificate_number || null,
        issued_date: newRecord.issued_date,
        expiry_date: newRecord.expiry_date || null,
        issuing_authority: newRecord.issuing_authority,
        notes: newRecord.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Check connection status and use appropriate method
      const connectionStatus = fallbackService.getConnectionStatus();

      if (connectionStatus.supabaseConnected) {
        console.log("✅ Creating compliance record with full connectivity");

        try {
          const { error } = await supabase
            .from("compliance_records")
            .insert(complianceRecord);

          if (error) {
            console.warn(
              "Compliance records table might not exist, storing offline:",
              error
            );
            throw new Error("Database table not available");
          }
        } catch (dbError) {
          console.warn("Database operation failed, storing offline:", dbError);

          // Store offline
          const storedRecords = localStorage.getItem(
            "protrack_compliance_records"
          );
          const existingRecords = storedRecords
            ? JSON.parse(storedRecords)
            : [];

          // Add product info for display
          const product = products.find((p) => p.id === newRecord.product_id);
          if (product) {
            (complianceRecord as any).products = {
              id: product.id,
              product_name: product.product_name,
              rfid_tag: product.rfid_tag,
              batch_no: product.batch_no || product.batch_id,
            };
          }

          existingRecords.unshift(complianceRecord);
          localStorage.setItem(
            "protrack_compliance_records",
            JSON.stringify(existingRecords)
          );

          // Add to pending operations
          fallbackService.addPendingOperation({
            id: `compliance-${complianceRecord.id}`,
            type: "CREATE_COMPLIANCE_RECORD",
            data: complianceRecord,
            timestamp: new Date().toISOString(),
            retryCount: 0,
          });
        }
      } else {
        console.log("📱 Creating compliance record in offline mode");

        // Store offline
        const storedRecords = localStorage.getItem(
          "protrack_compliance_records"
        );
        const existingRecords = storedRecords ? JSON.parse(storedRecords) : [];

        // Add product info for display
        const product = products.find((p) => p.id === newRecord.product_id);
        if (product) {
          (complianceRecord as any).products = {
            id: product.id,
            product_name: product.product_name,
            rfid_tag: product.rfid_tag,
            batch_no: product.batch_no || product.batch_id,
          };
        }

        existingRecords.unshift(complianceRecord);
        localStorage.setItem(
          "protrack_compliance_records",
          JSON.stringify(existingRecords)
        );

        // Add to pending operations
        fallbackService.addPendingOperation({
          id: `compliance-${complianceRecord.id}`,
          type: "CREATE_COMPLIANCE_RECORD",
          data: complianceRecord,
          timestamp: new Date().toISOString(),
          retryCount: 0,
        });
      }

      // Refresh records
      await loadRecords();

      // Reset form and close modal
      setShowRecordModal(false);
      setNewRecord({
        product_id: "",
        regulation_type: "",
        compliance_status: "compliant",
        certificate_number: "",
        issued_date: "",
        expiry_date: "",
        issuing_authority: "",
        notes: "",
      });

      const statusMessage = connectionStatus.supabaseConnected
        ? "Compliance record created successfully!"
        : "Compliance record created offline - will sync when connection restored";

      alert(statusMessage);
    } catch (error) {
      console.error("Error creating record:", error);

      // Enhanced error handling
      let errorMessage = "Failed to create compliance record. ";
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
      setCreating(false);
    }
  };

  // Get status badge
  const getStatusBadge = (status: string, expiryDate?: string) => {
    const isExpiringSoon =
      expiryDate &&
      new Date(expiryDate) > new Date() &&
      new Date(expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    switch (status) {
      case "compliant":
        return (
          <Badge
            className={`${
              isExpiringSoon
                ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                : "bg-gradient-to-r from-green-500 to-emerald-500"
            }`}
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            {isExpiringSoon ? "EXPIRING SOON" : "COMPLIANT"}
          </Badge>
        );
      case "non_compliant":
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-rose-500">
            <XCircle className="h-3 w-3 mr-1" />
            NON-COMPLIANT
          </Badge>
        );
      case "expired":
        return (
          <Badge className="bg-gradient-to-r from-gray-500 to-gray-700">
            <Clock className="h-3 w-3 mr-1" />
            EXPIRED
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

  // Filter records
  const filteredRecords = records.filter((record) => {
    if (filterStatus === "all") return true;
    return record.compliance_status === filterStatus;
  });

  // Calculate statistics
  const stats = {
    totalRecords: records.length,
    compliantRecords: records.filter((r) => r.compliance_status === "compliant")
      .length,
    expiredRecords: records.filter((r) => r.compliance_status === "expired")
      .length,
    pendingRecords: records.filter((r) => r.compliance_status === "pending")
      .length,
  };

  const complianceRate =
    stats.totalRecords > 0
      ? (stats.compliantRecords / stats.totalRecords) * 100
      : 0;

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
            Compliance Management
          </h1>
          <p className="text-gray-600 mt-2">
            Track regulatory compliance and certifications
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="compliant">Compliant</option>
            <option value="non_compliant">Non-Compliant</option>
            <option value="expired">Expired</option>
            <option value="pending">Pending</option>
          </select>
          <Button
            onClick={() => setShowRecordModal(true)}
            className="flex items-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Record
          </Button>
          <Button
            onClick={loadRecords}
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
                <p className="text-sm font-medium text-gray-600">
                  Total Records
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalRecords}
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Compliant</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.compliantRecords}
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <ShieldCheck className="h-4 w-4 mr-1" />
              <span>{complianceRate.toFixed(1)}% compliance rate</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expired</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.expiredRecords}
                </p>
              </div>
              <div className="rounded-full bg-red-100 p-3">
                <Clock className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.pendingRecords}
                </p>
              </div>
              <div className="rounded-full bg-yellow-100 p-3">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Records Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShieldCheck className="h-5 w-5 mr-2 text-blue-500" />
            Compliance Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Regulation Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Certificate</TableHead>
                  <TableHead>Issuing Authority</TableHead>
                  <TableHead>Issued Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record) => (
                    <TableRow key={record.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {record.products?.product_name || "Unknown Product"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {record.products?.rfid_tag} • Batch:{" "}
                            {record.products?.batch_no}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-gradient-to-r from-gray-500 to-gray-700 capitalize">
                          {record.regulation_type.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(
                          record.compliance_status,
                          record.expiry_date
                        )}
                      </TableCell>
                      <TableCell>
                        {record.certificate_number ? (
                          <span className="font-mono text-sm">
                            {record.certificate_number}
                          </span>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>{record.issuing_authority}</TableCell>
                      <TableCell>
                        {new Date(record.issued_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {record.expiry_date ? (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                            {new Date(record.expiry_date).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-gray-400">No expiry</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            alert(
                              `Compliance Details:\n\nRegulation: ${
                                record.regulation_type
                              }\nStatus: ${
                                record.compliance_status
                              }\nCertificate: ${
                                record.certificate_number || "N/A"
                              }\nAuthority: ${
                                record.issuing_authority
                              }\n\nNotes: ${record.notes || "None"}`
                            );
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-gray-500"
                    >
                      No compliance records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Record Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="flex items-center">
                  <Plus className="h-6 w-6 mr-2 text-blue-500" />
                  Add Compliance Record
                </CardTitle>
                <Button
                  variant="ghost"
                  onClick={() => setShowRecordModal(false)}
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
                    value={newRecord.product_id}
                    onChange={(e) =>
                      setNewRecord({ ...newRecord, product_id: e.target.value })
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
                      compliance management.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="regulation_type">Regulation Type</Label>
                    <select
                      id="regulation_type"
                      value={newRecord.regulation_type}
                      onChange={(e) =>
                        setNewRecord({
                          ...newRecord,
                          regulation_type: e.target.value,
                        })
                      }
                      className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select regulation</option>
                      <option value="fda_approval">FDA Approval</option>
                      <option value="organic_certification">
                        Organic Certification
                      </option>
                      <option value="iso_certification">
                        ISO Certification
                      </option>
                      <option value="haccp_compliance">HACCP Compliance</option>
                      <option value="gmp_certification">
                        GMP Certification
                      </option>
                      <option value="halal_certification">
                        Halal Certification
                      </option>
                      <option value="kosher_certification">
                        Kosher Certification
                      </option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="compliance_status">Status</Label>
                    <select
                      id="compliance_status"
                      value={newRecord.compliance_status}
                      onChange={(e) =>
                        setNewRecord({
                          ...newRecord,
                          compliance_status: e.target.value as any,
                        })
                      }
                      className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="compliant">Compliant</option>
                      <option value="non_compliant">Non-Compliant</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="certificate_number">
                      Certificate Number
                    </Label>
                    <Input
                      id="certificate_number"
                      value={newRecord.certificate_number}
                      onChange={(e) =>
                        setNewRecord({
                          ...newRecord,
                          certificate_number: e.target.value,
                        })
                      }
                      placeholder="e.g., CERT-2024-001"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="issuing_authority">Issuing Authority</Label>
                    <Input
                      id="issuing_authority"
                      value={newRecord.issuing_authority}
                      onChange={(e) =>
                        setNewRecord({
                          ...newRecord,
                          issuing_authority: e.target.value,
                        })
                      }
                      placeholder="e.g., FDA, ISO, etc."
                      className="mt-1"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="issued_date">Issued Date</Label>
                    <Input
                      id="issued_date"
                      type="date"
                      value={newRecord.issued_date}
                      onChange={(e) =>
                        setNewRecord({
                          ...newRecord,
                          issued_date: e.target.value,
                        })
                      }
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiry_date">Expiry Date (Optional)</Label>
                    <Input
                      id="expiry_date"
                      type="date"
                      value={newRecord.expiry_date}
                      onChange={(e) =>
                        setNewRecord({
                          ...newRecord,
                          expiry_date: e.target.value,
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <textarea
                    id="notes"
                    value={newRecord.notes}
                    onChange={(e) =>
                      setNewRecord({ ...newRecord, notes: e.target.value })
                    }
                    placeholder="Additional compliance notes..."
                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowRecordModal(false)}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateRecord}
                  disabled={
                    creating ||
                    !newRecord.product_id ||
                    !newRecord.regulation_type ||
                    !newRecord.issuing_authority
                  }
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      Create Record
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

export default ComplianceManagement;
