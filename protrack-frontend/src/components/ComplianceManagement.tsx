import React, { useState, useEffect } from "react";
import { useWeb3 } from "../contexts/web3ContextTypes";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import {
  CheckCircle,
  XCircle,
  Search,
  Eye,
  FileText,
  Download,
  RefreshCw,
  AlertTriangle,
  Shield,
  Gavel,
} from "lucide-react";

// Define types
interface ComplianceRecord {
  id: number;
  productId: number;
  productName: string;
  regulation: string;
  status: string;
  lastChecked: string;
  nextReview: string;
  complianceOfficer: string;
  notes: string;
}

interface AuditTrail {
  id: number;
  recordId: number;
  action: string;
  timestamp: string;
  user: string;
  details: string;
}

const ComplianceManagement = () => {
  const { isActive } = useWeb3();
  const [complianceRecords, setComplianceRecords] = useState<
    ComplianceRecord[]
  >([]);
  const [auditTrails, setAuditTrails] = useState<AuditTrail[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("records");
  const [userRole, setUserRole] = useState("admin"); // Add user role state

  // Mock data for demonstration
  useEffect(() => {
    const mockComplianceRecords: ComplianceRecord[] = [
      {
        id: 1,
        productId: 101,
        productName: "Organic Coffee Beans",
        regulation: "FDA Organic Standards",
        status: "compliant",
        lastChecked: "2023-11-15",
        nextReview: "2024-05-15",
        complianceOfficer: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
        notes: "All tests passed, documentation complete",
      },
      {
        id: 2,
        productId: 102,
        productName: "Premium Chocolate",
        regulation: "EU Food Safety Regulations",
        status: "non-compliant",
        lastChecked: "2023-11-20",
        nextReview: "2023-12-20",
        complianceOfficer: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
        notes: "Missing allergen declaration on packaging",
      },
      {
        id: 3,
        productId: 103,
        productName: "Organic Honey",
        regulation: "USDA Organic Certification",
        status: "pending-review",
        lastChecked: "2023-11-25",
        nextReview: "2023-12-10",
        complianceOfficer: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
        notes: "Awaiting laboratory results",
      },
      {
        id: 4,
        productId: 104,
        productName: "Artisanal Cheese",
        regulation: "EU Dairy Regulations",
        status: "compliant",
        lastChecked: "2023-11-30",
        nextReview: "2024-05-30",
        complianceOfficer: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
        notes: "Certification renewed, all standards met",
      },
      {
        id: 5,
        productId: 105,
        productName: "Cold-Pressed Olive Oil",
        regulation: "ISO 22000 Food Safety",
        status: "under-audit",
        lastChecked: "2023-12-01",
        nextReview: "2023-12-15",
        complianceOfficer: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
        notes: "Internal audit in progress",
      },
    ];

    const mockAuditTrails: AuditTrail[] = [
      {
        id: 1,
        recordId: 1,
        action: "Compliance Check",
        timestamp: "2023-11-15 10:30:00",
        user: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
        details: "Verified organic certification documents",
      },
      {
        id: 2,
        recordId: 2,
        action: "Non-Compliance Report",
        timestamp: "2023-11-20 14:15:00",
        user: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
        details: "Identified missing allergen information",
      },
      {
        id: 3,
        recordId: 3,
        action: "Document Submission",
        timestamp: "2023-11-25 09:45:00",
        user: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
        details: "Submitted laboratory test results",
      },
      {
        id: 4,
        recordId: 4,
        action: "Certification Renewal",
        timestamp: "2023-11-30 16:20:00",
        user: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
        details: "Renewed EU dairy certification",
      },
      {
        id: 5,
        recordId: 5,
        action: "Audit Initiated",
        timestamp: "2023-12-01 11:00:00",
        user: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
        details: "Started internal ISO 22000 audit",
      },
    ];

    setComplianceRecords(mockComplianceRecords);
    setAuditTrails(mockAuditTrails);
  }, []);

  // Refresh compliance data
  const refreshComplianceData = async () => {
    if (!isActive) {
      console.log("Wallet not connected");
      return;
    }

    try {
      // In a real implementation, you'd fetch actual compliance data from the blockchain
      console.log("Refreshing compliance data...");
    } catch (error) {
      console.error("Error refreshing compliance data:", error);
    }
  };

  // Export compliance data
  const exportComplianceData = () => {
    // In a real app, this would export data to CSV/PDF
    console.log("Exporting compliance data...");
  };

  // Filter compliance records based on search term and status
  const filteredRecords = complianceRecords.filter((record) => {
    const matchesSearch =
      record.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.regulation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      record.status.toLowerCase().replace("-", "") ===
        statusFilter.toLowerCase().replace("-", "");

    return matchesSearch && matchesStatus;
  });

  // Filter audit trails based on search term
  const filteredAuditTrails = auditTrails.filter((trail) => {
    return (
      trail.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trail.user.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Format status badge for compliance records
  const getComplianceStatusBadge = (status: string) => {
    switch (status.toLowerCase().replace("-", " ")) {
      case "compliant":
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
            <CheckCircle className="h-4 w-4 mr-1" />
            Compliant
          </Badge>
        );
      case "non compliant":
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600">
            <XCircle className="h-4 w-4 mr-1" />
            Non-Compliant
          </Badge>
        );
      case "pending review":
        return (
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
            <AlertTriangle className="h-4 w-4 mr-1" />
            Pending Review
          </Badge>
        );
      case "under audit":
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
            <Gavel className="h-4 w-4 mr-1" />
            Under Audit
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gradient-to-r from-gray-300 to-gray-500 hover:from-gray-400 hover:to-gray-600">
            {status}
          </Badge>
        );
    }
  };

  // View compliance record details
  const viewRecordDetails = (record: ComplianceRecord) => {
    // In a real implementation, this would open a modal with record details
    console.log("Viewing record details:", record);
  };

  // View audit trail details
  const viewAuditTrailDetails = (trail: AuditTrail) => {
    // In a real implementation, this would open a modal with audit trail details
    console.log("Viewing audit trail details:", trail);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Compliance Management
          </h1>
          <p className="text-gray-600 mt-2">
            Track and manage regulatory compliance for your supply chain
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <select
            value={userRole}
            onChange={(e) => setUserRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="admin">Admin</option>
            <option value="manufacturer">Manufacturer</option>
            <option value="transporter">Transporter</option>
            <option value="retailer">Retailer</option>
            <option value="consumer">Consumer</option>
          </select>
          <Button
            onClick={refreshComplianceData}
            className="flex items-center bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={exportComplianceData}
            className="flex items-center bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Download className="h-5 w-5 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Wallet connection warning */}
      {!isActive && (
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-4 text-center shadow-lg">
          <div className="flex items-center justify-center">
            <Shield className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800 font-medium">
              Wallet not connected - Connect to interact with blockchain
              features
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("records")}
          className={`py-3 px-6 font-medium text-sm ${
            activeTab === "records"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Compliance Records
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`py-3 px-6 font-medium text-sm ${
            activeTab === "audit"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Audit Trail
        </button>
      </div>

      {/* Search and Filter Section */}
      <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <Search className="h-5 w-5 mr-2 text-blue-500" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search" className="text-gray-700">
                Search
              </Label>
              <div className="relative mt-1">
                <Input
                  id="search"
                  type="text"
                  placeholder="Search by product, regulation, or action..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>
            <div>
              <Label htmlFor="status" className="text-gray-700">
                Filter by Status
              </Label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="compliant">Compliant</option>
                <option value="non-compliant">Non-Compliant</option>
                <option value="pending-review">Pending Review</option>
                <option value="under-audit">Under Audit</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Records Tab */}
      {activeTab === "records" && (
        <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800">
              <FileText className="h-5 w-5 mr-2 text-blue-500" />
              Compliance Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="text-gray-700 font-bold">
                      ID
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Product
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Regulation
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Status
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Last Checked
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Next Review
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Officer
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((record) => (
                      <TableRow key={record.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {record.id}
                        </TableCell>
                        <TableCell>{record.productName}</TableCell>
                        <TableCell>{record.regulation}</TableCell>
                        <TableCell>
                          {getComplianceStatusBadge(record.status)}
                        </TableCell>
                        <TableCell>{record.lastChecked}</TableCell>
                        <TableCell>{record.nextReview}</TableCell>
                        <TableCell>
                          <div className="font-mono text-sm">
                            {record.complianceOfficer.substring(0, 6)}...
                            {record.complianceOfficer.substring(
                              record.complianceOfficer.length - 4
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            onClick={() => viewRecordDetails(record)}
                            variant="outline"
                            size="sm"
                            className="flex items-center"
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
                        No compliance records found matching your criteria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Trail Tab */}
      {activeTab === "audit" && (
        <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800">
              <Gavel className="h-5 w-5 mr-2 text-blue-500" />
              Audit Trail
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="text-gray-700 font-bold">
                      ID
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Record ID
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Action
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Timestamp
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      User
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Details
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAuditTrails.length > 0 ? (
                    filteredAuditTrails.map((trail) => (
                      <TableRow key={trail.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {trail.id}
                        </TableCell>
                        <TableCell>{trail.recordId}</TableCell>
                        <TableCell className="font-medium">
                          {trail.action}
                        </TableCell>
                        <TableCell>{trail.timestamp}</TableCell>
                        <TableCell>
                          <div className="font-mono text-sm">
                            {trail.user.substring(0, 6)}...
                            {trail.user.substring(trail.user.length - 4)}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {trail.details}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            onClick={() => viewAuditTrailDetails(trail)}
                            variant="outline"
                            size="sm"
                            className="flex items-center"
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
                        colSpan={7}
                        className="text-center py-8 text-gray-500"
                      >
                        No audit trail entries found matching your criteria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ComplianceManagement;
