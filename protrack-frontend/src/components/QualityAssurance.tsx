import React, { useState } from "react";
import { useWeb3 } from "../contexts/web3ContextTypes";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  ClipboardCheck,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  Download,
} from "lucide-react";

// Define types
interface TestCase {
  id: number;
  name: string;
  description: string;
  category: string;
  required: boolean;
  frequency: string;
}

interface TestExecution {
  id: number;
  testCaseId: number;
  productName: string;
  batchId: string;
  inspectorId: string;
  timestamp: string;
  status: string;
  results: TestResult[];
  attachments: string[];
  notes: string;
}

interface TestResult {
  id: number;
  name: string;
  value: string | number | boolean;
  unit?: string;
  pass: boolean;
  threshold?: string;
}

interface Certificate {
  id: number;
  testExecutionId: number;
  certificateId: string;
  issuedTo: string;
  issuedBy: string;
  issueDate: string;
  expiryDate: string;
  status: string;
}

const QualityAssurance = () => {
  const { isActive } = useWeb3();
  const [testCases] = useState<TestCase[]>([
    {
      id: 1,
      name: "Visual Inspection",
      description: "Check for physical defects, discoloration, or damage",
      category: "Visual",
      required: true,
      frequency: "per_batch",
    },
    {
      id: 2,
      name: "Chemical Analysis",
      description: "Verify chemical composition and purity",
      category: "Chemical",
      required: true,
      frequency: "per_batch",
    },
    {
      id: 3,
      name: "Microbiological Test",
      description: "Check for harmful bacteria and pathogens",
      category: "Microbiological",
      required: true,
      frequency: "per_batch",
    },
    {
      id: 4,
      name: "Weight Verification",
      description: "Ensure product weight meets specifications",
      category: "Physical",
      required: false,
      frequency: "spot_check",
    },
  ]);
  const [testExecutions, setTestExecutions] = useState<TestExecution[]>([
    {
      id: 1,
      testCaseId: 1,
      productName: "Organic Coffee Beans",
      batchId: "BATCH-2023-001",
      inspectorId: "INSPECTOR-001",
      timestamp: "2023-12-01 10:30:00",
      status: "passed",
      results: [
        {
          id: 1,
          name: "Color Consistency",
          value: "Good",
          pass: true,
        },
        {
          id: 2,
          name: "Foreign Particles",
          value: "None detected",
          pass: true,
        },
      ],
      attachments: ["report_001.pdf", "photo_001.jpg"],
      notes: "All visual standards met",
    },
    {
      id: 2,
      testCaseId: 2,
      productName: "Premium Chocolate",
      batchId: "BATCH-2023-002",
      inspectorId: "INSPECTOR-002",
      timestamp: "2023-12-02 14:15:00",
      status: "failed",
      results: [
        {
          id: 1,
          name: "Cocoa Content",
          value: "72%",
          unit: "%",
          pass: true,
          threshold: "≥70%",
        },
        {
          id: 2,
          name: "Sugar Content",
          value: "22%",
          unit: "%",
          pass: false,
          threshold: "≤20%",
        },
      ],
      attachments: ["lab_report_002.pdf"],
      notes: "Sugar content exceeds specification limit",
    },
  ]);
  const [certificates] = useState<Certificate[]>([
    {
      id: 1,
      testExecutionId: 1,
      certificateId: "CERT-QA-2023-001",
      issuedTo: "Organic Coffee Co.",
      issuedBy: "QA Lab #1",
      issueDate: "2023-12-01",
      expiryDate: "2024-12-01",
      status: "active",
    },
  ]);
  const [showTestForm, setShowTestForm] = useState(false);
  const [newTestExecution, setNewTestExecution] = useState({
    testCaseId: 1,
    productName: "",
    batchId: "",
    inspectorId: "",
    notes: "",
  });

  // Handle new test execution change
  const handleTestExecutionChange = (
    field: keyof typeof newTestExecution,
    value: string
  ) => {
    setNewTestExecution({
      ...newTestExecution,
      [field]: value,
    });
  };

  // Submit new test execution
  const submitTestExecution = () => {
    if (!newTestExecution.productName || !newTestExecution.batchId) {
      alert("Please fill in required fields");
      return;
    }

    // In a real app, this would interact with the blockchain
    console.log("Submitting test execution:", newTestExecution);
    alert("Test execution submitted successfully!");

    // Add to test executions
    const newExecution: TestExecution = {
      id: testExecutions.length + 1,
      testCaseId: newTestExecution.testCaseId,
      productName: newTestExecution.productName,
      batchId: newTestExecution.batchId,
      inspectorId: newTestExecution.inspectorId || "CURRENT_USER",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      status: "pending",
      results: [],
      attachments: [],
      notes: newTestExecution.notes,
    };

    setTestExecutions([...testExecutions, newExecution]);

    // Reset form
    setNewTestExecution({
      testCaseId: 1,
      productName: "",
      batchId: "",
      inspectorId: "",
      notes: "",
    });
    setShowTestForm(false);
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
      case "pending":
        return (
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
            <Clock className="h-3 w-3 mr-1" />
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

  // Get certificate status badge
  const getCertificateStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500">
            Active
          </Badge>
        );
      case "expired":
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-rose-500">
            Expired
          </Badge>
        );
      case "revoked":
        return (
          <Badge className="bg-gradient-to-r from-gray-500 to-gray-700">
            Revoked
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gradient-to-r from-gray-300 to-gray-500">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Quality Assurance
          </h1>
          <p className="text-gray-600 mt-2">
            Manage quality tests, inspections, and certifications
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button
            onClick={() => setShowTestForm(!showTestForm)}
            className="flex items-center bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <ClipboardCheck className="h-5 w-5 mr-2" />
            {showTestForm ? "Cancel" : "New Test Execution"}
          </Button>
        </div>
      </div>

      {/* Wallet connection warning */}
      {!isActive && (
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-4 text-center shadow-lg">
          <div className="flex items-center justify-center">
            <ClipboardCheck className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800 font-medium">
              Wallet not connected - Connect for blockchain-certified QA
            </span>
          </div>
        </div>
      )}

      {/* Test Case Library */}
      <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <FileText className="h-5 w-5 mr-2 text-blue-500" />
            Test Case Library
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Test Case
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Frequency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Required
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {testCases.map((testCase) => (
                  <tr key={testCase.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {testCase.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {testCase.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500">
                        {testCase.category}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {testCase.frequency.replace("_", " ")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {testCase.required ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-400" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* New Test Execution Form */}
      {showTestForm && (
        <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800">
              <ClipboardCheck className="h-5 w-5 mr-2 text-blue-500" />
              New Test Execution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="testCaseId" className="text-gray-700">
                  Test Case
                </Label>
                <select
                  id="testCaseId"
                  value={newTestExecution.testCaseId}
                  onChange={(e) =>
                    handleTestExecutionChange("testCaseId", e.target.value)
                  }
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {testCases.map((testCase) => (
                    <option key={testCase.id} value={testCase.id}>
                      {testCase.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="productName" className="text-gray-700">
                  Product Name *
                </Label>
                <Input
                  id="productName"
                  value={newTestExecution.productName}
                  onChange={(e) =>
                    handleTestExecutionChange("productName", e.target.value)
                  }
                  placeholder="Enter product name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="batchId" className="text-gray-700">
                  Batch ID *
                </Label>
                <Input
                  id="batchId"
                  value={newTestExecution.batchId}
                  onChange={(e) =>
                    handleTestExecutionChange("batchId", e.target.value)
                  }
                  placeholder="Enter batch ID"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="inspectorId" className="text-gray-700">
                  Inspector ID
                </Label>
                <Input
                  id="inspectorId"
                  value={newTestExecution.inspectorId}
                  onChange={(e) =>
                    handleTestExecutionChange("inspectorId", e.target.value)
                  }
                  placeholder="Enter inspector ID"
                  className="mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="notes" className="text-gray-700">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={newTestExecution.notes}
                  onChange={(e) =>
                    handleTestExecutionChange("notes", e.target.value)
                  }
                  placeholder="Add any additional notes"
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="mt-6">
              <Button
                onClick={submitTestExecution}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3"
              >
                Submit Test Execution
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Test Executions */}
      <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <ClipboardCheck className="h-5 w-5 mr-2 text-blue-500" />
            Recent Test Executions
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
                    Test Case
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Batch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Inspector
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Timestamp
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
                {testExecutions.map((execution) => {
                  const testCase = testCases.find(
                    (tc) => tc.id === execution.testCaseId
                  );
                  return (
                    <tr key={execution.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {execution.productName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {testCase?.name || "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {execution.batchId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-500 mr-1" />
                          {execution.inspectorId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                          {execution.timestamp}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(execution.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <FileText className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-1" />
                            Report
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Certificates */}
      <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <FileText className="h-5 w-5 mr-2 text-blue-500" />
            Quality Certificates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Certificate ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Issued To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Issued By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Issue Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Expiry Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {certificates.map((certificate) => {
                  const execution = testExecutions.find(
                    (te) => te.id === certificate.testExecutionId
                  );
                  return (
                    <tr key={certificate.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {certificate.certificateId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {execution?.productName || "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {certificate.issuedTo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {certificate.issuedBy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {certificate.issueDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {certificate.expiryDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getCertificateStatusBadge(certificate.status)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QualityAssurance;
