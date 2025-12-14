import React, { useState } from "react";
import { useWeb3 } from "../contexts/web3ContextTypes";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  ShieldCheck,
  Gavel,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  Download,
  Eye,
} from "lucide-react";

// Define types
interface ComplianceProfile {
  id: number;
  name: string;
  region: string;
  description: string;
  requirements: string[];
  lastUpdated: string;
}

interface AuditLog {
  id: number;
  productId: string;
  productName: string;
  profileId: number;
  timestamp: string;
  status: string;
  findings: string[];
  auditor: string;
  signature?: string;
}

interface Recall {
  id: number;
  productId: string;
  productName: string;
  batchId: string;
  reason: string;
  initiatedBy: string;
  initiatedAt: string;
  status: string;
  affectedUnits: number;
  resolution?: string;
}

const ComplianceManagement = () => {
  const { isActive } = useWeb3();
  const [profiles] = useState<ComplianceProfile[]>([
    {
      id: 1,
      name: "FDA Food Safety",
      region: "United States",
      description:
        "Food safety regulations for food manufacturers and distributors",
      requirements: [
        "HACCP Plan",
        "Good Manufacturing Practices",
        "Traceability Requirements",
        "Labeling Standards",
      ],
      lastUpdated: "2023-11-15",
    },
    {
      id: 2,
      name: "EU GDPR",
      region: "European Union",
      description: "General Data Protection Regulation for data handling",
      requirements: [
        "Data Consent",
        "Right to Access",
        "Data Portability",
        "Breach Notification",
      ],
      lastUpdated: "2023-10-22",
    },
    {
      id: 3,
      name: "ISO 22000",
      region: "Global",
      description: "International standard for food safety management",
      requirements: [
        "Hazard Analysis",
        "Prerequisite Programs",
        "Management System",
        "Traceability",
      ],
      lastUpdated: "2023-09-30",
    },
  ]);
  const [auditLogs] = useState<AuditLog[]>([
    {
      id: 1,
      productId: "PROD-101",
      productName: "Organic Coffee Beans",
      profileId: 1,
      timestamp: "2023-12-01 10:30:00",
      status: "passed",
      findings: ["All HACCP requirements met", "Traceability records complete"],
      auditor: "AUDITOR-001",
      signature: "0x742d...a3b8",
    },
    {
      id: 2,
      productId: "PROD-102",
      productName: "Premium Chocolate",
      profileId: 1,
      timestamp: "2023-12-02 14:15:00",
      status: "failed",
      findings: [
        "Missing temperature logs",
        "Incomplete traceability records",
        "Labeling discrepancies",
      ],
      auditor: "AUDITOR-002",
    },
  ]);
  const [recalls, setRecalls] = useState<Recall[]>([
    {
      id: 1,
      productId: "PROD-103",
      productName: "Organic Honey",
      batchId: "BATCH-2023-003",
      reason: "Potential contamination detected",
      initiatedBy: "QA Department",
      initiatedAt: "2023-12-03 09:45:00",
      status: "active",
      affectedUnits: 1250,
    },
  ]);
  const [showRecallForm, setShowRecallForm] = useState(false);
  const [newRecall, setNewRecall] = useState({
    productId: "",
    productName: "",
    batchId: "",
    reason: "",
  });

  // Handle new recall change
  const handleRecallChange = (field: keyof typeof newRecall, value: string) => {
    setNewRecall({
      ...newRecall,
      [field]: value,
    });
  };

  // Submit new recall
  const submitRecall = () => {
    if (!newRecall.productId || !newRecall.reason) {
      alert("Please fill in required fields");
      return;
    }

    // In a real app, this would interact with the blockchain
    console.log("Submitting recall:", newRecall);
    alert("Recall initiated successfully!");

    // Add to recalls
    const newRecallEntry: Recall = {
      id: recalls.length + 1,
      productId: newRecall.productId,
      productName: newRecall.productName,
      batchId: newRecall.batchId,
      reason: newRecall.reason,
      initiatedBy: "CURRENT_USER",
      initiatedAt: new Date().toISOString().replace("T", " ").substring(0, 19),
      status: "active",
      affectedUnits: 0, // Would be calculated in real app
    };

    setRecalls([...recalls, newRecallEntry]);

    // Reset form
    setNewRecall({
      productId: "",
      productName: "",
      batchId: "",
      reason: "",
    });
    setShowRecallForm(false);
  };

  // Resolve recall
  const resolveRecall = (id: number) => {
    setRecalls(
      recalls.map((recall) =>
        recall.id === id
          ? {
              ...recall,
              status: "resolved",
              resolution: "Issue addressed and verified",
            }
          : recall
      )
    );
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "passed":
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Passed
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      case "active":
        return (
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case "resolved":
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Resolved
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

  // Get profile name by ID
  const getProfileName = (profileId: number) => {
    const profile = profiles.find((p) => p.id === profileId);
    return profile ? profile.name : "Unknown Profile";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Compliance Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage regulatory compliance, audits, and product recalls
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button
            onClick={() => setShowRecallForm(!showRecallForm)}
            className="flex items-center bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <AlertTriangle className="h-5 w-5 mr-2" />
            {showRecallForm ? "Cancel" : "Initiate Recall"}
          </Button>
        </div>
      </div>

      {/* Wallet connection warning */}
      {!isActive && (
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-4 text-center shadow-lg">
          <div className="flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800 font-medium">
              Wallet not connected - Connect for blockchain-verified compliance
            </span>
          </div>
        </div>
      )}

      {/* Compliance Profiles */}
      <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <Gavel className="h-5 w-5 mr-2 text-blue-500" />
            Compliance Profiles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <Card key={profile.id} className="border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <ShieldCheck className="h-5 w-5 mr-2 text-blue-500" />
                    {profile.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        Region:
                      </span>
                      <p className="text-sm text-gray-900">{profile.region}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        Description:
                      </span>
                      <p className="text-sm text-gray-900">
                        {profile.description}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        Requirements:
                      </span>
                      <ul className="mt-1 space-y-1">
                        {profile.requirements.map((req, index) => (
                          <li key={index} className="text-sm text-gray-900">
                            • {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <span className="text-xs text-gray-500">
                        Last Updated: {profile.lastUpdated}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Initiate Recall Form */}
      {showRecallForm && (
        <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
              Initiate Product Recall
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="productId" className="text-gray-700">
                  Product ID *
                </Label>
                <Input
                  id="productId"
                  value={newRecall.productId}
                  onChange={(e) =>
                    handleRecallChange("productId", e.target.value)
                  }
                  placeholder="Enter product ID"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="productName" className="text-gray-700">
                  Product Name
                </Label>
                <Input
                  id="productName"
                  value={newRecall.productName}
                  onChange={(e) =>
                    handleRecallChange("productName", e.target.value)
                  }
                  placeholder="Enter product name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="batchId" className="text-gray-700">
                  Batch ID
                </Label>
                <Input
                  id="batchId"
                  value={newRecall.batchId}
                  onChange={(e) =>
                    handleRecallChange("batchId", e.target.value)
                  }
                  placeholder="Enter batch ID"
                  className="mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="reason" className="text-gray-700">
                  Reason for Recall *
                </Label>
                <Textarea
                  id="reason"
                  value={newRecall.reason}
                  onChange={(e) => handleRecallChange("reason", e.target.value)}
                  placeholder="Describe the reason for initiating this recall"
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="mt-6">
              <Button
                onClick={submitRecall}
                className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white py-3"
              >
                Initiate Recall
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Recalls */}
      <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
            Active Recalls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Batch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Initiated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Affected Units
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recalls.map((recall) => (
                  <tr key={recall.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {recall.productName}
                      </div>
                      <div className="text-sm text-gray-500">
                        #{recall.productId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {recall.batchId}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {recall.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {recall.initiatedAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {recall.affectedUnits}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(recall.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {recall.status === "active" ? (
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => resolveRecall(recall.id)}
                            size="sm"
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                          >
                            Resolve
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Audit Logs */}
      <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <FileText className="h-5 w-5 mr-2 text-blue-500" />
            Recent Audit Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Compliance Profile
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Auditor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Findings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {log.productName}
                      </div>
                      <div className="text-sm text-gray-500">
                        #{log.productId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getProfileName(log.profileId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.auditor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.timestamp}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(log.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                      <ul className="space-y-1">
                        {log.findings.slice(0, 2).map((finding, index) => (
                          <li key={index} className="truncate">
                            • {finding}
                          </li>
                        ))}
                        {log.findings.length > 2 && (
                          <li className="text-gray-500">
                            +{log.findings.length - 2} more
                          </li>
                        )}
                      </ul>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Report
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplianceManagement;
