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
  Award,
} from "lucide-react";

// Define types
interface QualityCheck {
  id: number;
  productId: number;
  productName: string;
  checkType: string;
  status: string;
  inspector: string;
  timestamp: string;
  result: string;
  notes: string;
}

interface Certification {
  id: number;
  productId: number;
  productName: string;
  certType: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  status: string;
}

const QualityAssurance = () => {
  const { isActive } = useWeb3();
  const [qualityChecks, setQualityChecks] = useState<QualityCheck[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("checks");
  const [userRole, setUserRole] = useState("admin"); // Add user role state

  // Mock data for demonstration
  useEffect(() => {
    const mockQualityChecks: QualityCheck[] = [
      {
        id: 1,
        productId: 101,
        productName: "Organic Coffee Beans",
        checkType: "Organic Certification",
        status: "passed",
        inspector: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
        timestamp: "2023-12-01 14:30:00",
        result: "Passed all organic standards",
        notes: "Sample tested for pesticide residues - none detected",
      },
      {
        id: 2,
        productId: 102,
        productName: "Premium Chocolate",
        checkType: "Food Safety",
        status: "passed",
        inspector: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
        timestamp: "2023-12-01 14:45:00",
        result: "Passed microbiological testing",
        notes: "All bacterial counts within acceptable limits",
      },
      {
        id: 3,
        productId: 103,
        productName: "Organic Honey",
        checkType: "Contamination Test",
        status: "failed",
        inspector: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
        timestamp: "2023-12-01 15:00:00",
        result: "Detected foreign particles",
        notes: "Further investigation required",
      },
      {
        id: 4,
        productId: 104,
        productName: "Artisanal Cheese",
        checkType: "Quality Grade",
        status: "passed",
        inspector: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
        timestamp: "2023-12-01 15:15:00",
        result: "Grade A quality",
        notes: "Excellent texture and flavor profile",
      },
      {
        id: 5,
        productId: 105,
        productName: "Cold-Pressed Olive Oil",
        checkType: "Chemical Analysis",
        status: "pending",
        inspector: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
        timestamp: "2023-12-01 15:30:00",
        result: "Awaiting lab results",
        notes: "Sample sent to external lab",
      },
    ];

    const mockCertifications: Certification[] = [
      {
        id: 1,
        productId: 101,
        productName: "Organic Coffee Beans",
        certType: "Organic Certification",
        issuer: "USDA Organic",
        issueDate: "2023-01-15",
        expiryDate: "2024-01-15",
        status: "active",
      },
      {
        id: 2,
        productId: 102,
        productName: "Premium Chocolate",
        certType: "Food Safety Certificate",
        issuer: "FDA",
        issueDate: "2023-02-20",
        expiryDate: "2024-02-20",
        status: "active",
      },
      {
        id: 3,
        productId: 101,
        productName: "Organic Coffee Beans",
        certType: "Fair Trade",
        issuer: "Fair Trade International",
        issueDate: "2023-03-10",
        expiryDate: "2024-03-10",
        status: "active",
      },
      {
        id: 4,
        productId: 104,
        productName: "Artisanal Cheese",
        certType: "Quality Assurance",
        issuer: "European Cheese Board",
        issueDate: "2023-04-05",
        expiryDate: "2024-04-05",
        status: "active",
      },
      {
        id: 5,
        productId: 105,
        productName: "Cold-Pressed Olive Oil",
        certType: "Organic Certification",
        issuer: "ECOCERT",
        issueDate: "2023-05-12",
        expiryDate: "2024-05-12",
        status: "expired",
      },
    ];

    setQualityChecks(mockQualityChecks);
    setCertifications(mockCertifications);
  }, []);

  // Refresh quality data
  const refreshQualityData = async () => {
    if (!isActive) {
      console.log("Wallet not connected");
      return;
    }

    try {
      // In a real implementation, you'd fetch actual quality data from the blockchain
      console.log("Refreshing quality data...");
    } catch (error) {
      console.error("Error refreshing quality data:", error);
    }
  };

  // Export quality data
  const exportQualityData = () => {
    // In a real app, this would export data to CSV/PDF
    console.log("Exporting quality data...");
  };

  // Filter quality checks based on search term and status
  const filteredChecks = qualityChecks.filter((check) => {
    const matchesSearch =
      check.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      check.checkType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      check.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Filter certifications based on search term and status
  const filteredCertifications = certifications.filter((cert) => {
    const matchesSearch =
      cert.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.certType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      cert.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Format status badge for quality checks
  const getCheckStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "passed":
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
            <CheckCircle className="h-4 w-4 mr-1" />
            Passed
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600">
            <XCircle className="h-4 w-4 mr-1" />
            Failed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
            <AlertTriangle className="h-4 w-4 mr-1" />
            Pending
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

  // Format status badge for certifications
  const getCertStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
            <CheckCircle className="h-4 w-4 mr-1" />
            Active
          </Badge>
        );
      case "expired":
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600">
            <XCircle className="h-4 w-4 mr-1" />
            Expired
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
            <AlertTriangle className="h-4 w-4 mr-1" />
            Pending
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

  // View quality check details
  const viewCheckDetails = (check: QualityCheck) => {
    // In a real implementation, this would open a modal with check details
    console.log("Viewing check details:", check);
  };

  // View certification details
  const viewCertDetails = (cert: Certification) => {
    // In a real implementation, this would open a modal with certification details
    console.log("Viewing certification details:", cert);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Quality Assurance
          </h1>
          <p className="text-gray-600 mt-2">
            Manage quality checks and certifications for your products
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
            onClick={refreshQualityData}
            className="flex items-center bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={exportQualityData}
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
          onClick={() => setActiveTab("checks")}
          className={`py-3 px-6 font-medium text-sm ${
            activeTab === "checks"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Quality Checks
        </button>
        <button
          onClick={() => setActiveTab("certifications")}
          className={`py-3 px-6 font-medium text-sm ${
            activeTab === "certifications"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Certifications
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
                  placeholder="Search by product or check type..."
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
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
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

      {/* Quality Checks Tab */}
      {activeTab === "checks" && (
        <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800">
              <Award className="h-5 w-5 mr-2 text-blue-500" />
              Quality Checks
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
                      Check Type
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Status
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Inspector
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Timestamp
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredChecks.length > 0 ? (
                    filteredChecks.map((check) => (
                      <TableRow key={check.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {check.id}
                        </TableCell>
                        <TableCell>{check.productName}</TableCell>
                        <TableCell>{check.checkType}</TableCell>
                        <TableCell>
                          {getCheckStatusBadge(check.status)}
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-sm">
                            {check.inspector.substring(0, 6)}...
                            {check.inspector.substring(
                              check.inspector.length - 4
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{check.timestamp}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            onClick={() => viewCheckDetails(check)}
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
                        No quality checks found matching your criteria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certifications Tab */}
      {activeTab === "certifications" && (
        <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800">
              <FileText className="h-5 w-5 mr-2 text-blue-500" />
              Certifications
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
                      Certification
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Issuer
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Issue Date
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Expiry Date
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold">
                      Status
                    </TableHead>
                    <TableHead className="text-gray-700 font-bold text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCertifications.length > 0 ? (
                    filteredCertifications.map((cert) => (
                      <TableRow key={cert.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{cert.id}</TableCell>
                        <TableCell>{cert.productName}</TableCell>
                        <TableCell>{cert.certType}</TableCell>
                        <TableCell>{cert.issuer}</TableCell>
                        <TableCell>{cert.issueDate}</TableCell>
                        <TableCell>{cert.expiryDate}</TableCell>
                        <TableCell>{getCertStatusBadge(cert.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            onClick={() => viewCertDetails(cert)}
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
                        No certifications found matching your criteria
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

export default QualityAssurance;
