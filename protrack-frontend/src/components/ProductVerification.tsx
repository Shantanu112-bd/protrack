import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Scan,
  Search,
  Shield,
  CheckCircle,
  XCircle,
  FileText,
  QrCode,
  Camera,
  Download,
} from "lucide-react";
import { useEnhancedWeb3 } from "../contexts/EnhancedWeb3Context";
import {
  VerificationService,
  VerificationResult,
} from "../services/verificationService";
import { CONTRACT_ADDRESSES } from "../config/contractConfig";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
// Select components removed as they are not used in current implementation

interface ProductVerificationProps {
  initialRFID?: string;
}

export const ProductVerification: React.FC<ProductVerificationProps> = ({
  initialRFID,
}) => {
  const { web3, isConnected } = useEnhancedWeb3();
  const [scanInput, setScanInput] = useState(initialRFID || "");
  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanMode, setScanMode] = useState<"qr" | "rfid" | "manual">("qr");
  const [verificationService, setVerificationService] =
    useState<VerificationService | null>(null);
  const [certificate, setCertificate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => {
    if (web3 && isConnected) {
      const service = new VerificationService(
        CONTRACT_ADDRESSES.SUPPLY_CHAIN,
        CONTRACT_ADDRESSES.MPC_WALLET,
        CONTRACT_ADDRESSES.ORACLE
      );

      // Initialize the service (mock implementation)
      // In a real implementation, we would initialize with a proper provider
      // In a real implementation, we would initialize with a proper provider
      // For demo purposes, we're passing null
      service.initialize(null as unknown as any);
      setVerificationService(service);
    }
  }, [web3, isConnected]);

  useEffect(() => {
    if (initialRFID) {
      setScanInput(initialRFID);
      handleVerify(initialRFID);
    }
  }, [initialRFID]);

  const handleVerify = async (rfid?: string) => {
    if (!verificationService || (!rfid && !scanInput.trim())) return;

    setLoading(true);
    setCertificate(null);
    setError(null);

    try {
      const result = await verificationService.verifyProductByRFID(
        rfid || scanInput
      );
      setVerificationResult(result);

      // Generate certificate if verification is successful
      if (result.verified) {
        const cert = await verificationService.generateVerificationCertificate(
          result
        );
        setCertificate(cert);
      }
    } catch (err) {
      console.error("Verification failed:", err);
      setError("Verification failed. Please try again.");
      setVerificationResult({
        verified: false,
        error: err instanceof Error ? err.message : "Verification failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async () => {
    setLoading(true);
    setError(null);

    try {
      // In a real implementation, this would interface with RFID hardware or camera
      // For demo, we'll simulate a scan
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate mock RFID data
      const mockRFID = `RFID_${Math.floor(Math.random() * 1000000)}`;
      setScanInput(mockRFID);
      handleVerify(mockRFID);
    } catch (err) {
      setError("Scan failed. Please try again.");
      console.error("Scan failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "created":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "in transit":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400";
    }
  };

  const downloadCertificate = () => {
    if (!certificate) return;

    const element = document.createElement("a");
    const file = new Blob([certificate], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "product_verification_certificate.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl mb-6 shadow-lg">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">
          Product Verification
        </h1>
        <p className="text-lg text-gray-300 max-w-3xl mx-auto">
          Verify product authenticity with blockchain proof and zero-knowledge
          verification
        </p>
      </motion.div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Verification Interface */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Scan className="w-5 h-5 mr-2" />
            Scan Product
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Scan Mode Toggle */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-700 rounded-lg p-1 flex">
              <button
                onClick={() => setScanMode("qr")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  scanMode === "qr"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                <QrCode className="w-4 h-4 inline mr-2" />
                QR Code
              </button>
              <button
                onClick={() => setScanMode("rfid")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  scanMode === "rfid"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                <Scan className="w-4 h-4 inline mr-2" />
                RFID
              </button>
              <button
                onClick={() => setScanMode("manual")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  scanMode === "manual"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                <Search className="w-4 h-4 inline mr-2" />
                Manual Entry
              </button>
            </div>
          </div>

          {scanMode === "qr" && (
            <div className="text-center">
              <div className="w-64 h-64 mx-auto bg-gray-700 rounded-xl flex items-center justify-center mb-6 border-2 border-dashed border-gray-600">
                <div className="text-center">
                  <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">
                    Position QR code within the frame
                  </p>
                </div>
              </div>
              <Button
                onClick={handleScan}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Scanning...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 mr-2" />
                    Start Camera Scan
                  </>
                )}
              </Button>
            </div>
          )}

          {scanMode === "rfid" && (
            <div className="text-center">
              <div className="w-64 h-64 mx-auto bg-gray-700 rounded-xl flex items-center justify-center mb-6 border-2 border-dashed border-gray-600">
                <div className="text-center">
                  <Scan className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">Place RFID tag near scanner</p>
                </div>
              </div>
              <Button
                onClick={handleScan}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Scanning RFID...
                  </>
                ) : (
                  <>
                    <Scan className="w-4 h-4 mr-2" />
                    Scan RFID Tag
                  </>
                )}
              </Button>
            </div>
          )}

          {scanMode === "manual" && (
            <div className="space-y-4">
              <div>
                <Label className="block text-sm font-medium text-gray-300 mb-2">
                  Product RFID or Identifier
                </Label>
                <Input
                  type="text"
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  placeholder="Enter RFID, QR code data, or product ID"
                  className="w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>

              <Button
                onClick={() => handleVerify()}
                disabled={loading || !scanInput.trim()}
                className="w-full"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Verify Product
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verification Result */}
      {verificationResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                {verificationResult.verified ? (
                  <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 mr-2 text-red-400" />
                )}
                Verification Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              {verificationResult.verified && verificationResult.product ? (
                <div className="space-y-6">
                  {/* Product Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">
                        Product Details
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Name</span>
                          <span className="text-white font-medium">
                            {verificationResult.product.name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Token ID</span>
                          <span className="text-white font-medium">
                            #{verificationResult.product.tokenId}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Manufacturer</span>
                          <span className="text-white font-medium">
                            {formatAddress(
                              verificationResult.product.manufacturer
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Status</span>
                          <Badge
                            className={getStatusColor(
                              verificationResult.product.status
                            )}
                          >
                            {verificationResult.product.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">
                            Manufacture Date
                          </span>
                          <span className="text-white font-medium">
                            {formatDate(
                              verificationResult.product.manufactureDate
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">
                        Blockchain Proof
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">
                            Transaction Hash
                          </span>
                          <span className="text-white font-mono text-sm">
                            {verificationResult.product.blockchainProof.transactionHash.slice(
                              0,
                              10
                            )}
                            ...
                            {verificationResult.product.blockchainProof.transactionHash.slice(
                              -8
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Block Number</span>
                          <span className="text-white font-medium">
                            {
                              verificationResult.product.blockchainProof
                                .blockNumber
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Validator</span>
                          <span className="text-white font-medium">
                            {formatAddress(
                              verificationResult.product.blockchainProof
                                .validator
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">ZK Proof</span>
                          <Badge
                            variant={
                              verificationResult.product.zkProof?.isValid
                                ? "default"
                                : "secondary"
                            }
                          >
                            {verificationResult.product.zkProof?.isValid
                              ? "Valid"
                              : "Invalid"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Certifications */}
                  {verificationResult.product.certifications &&
                    verificationResult.product.certifications.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">
                          Certifications
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {verificationResult.product.certifications.map(
                            (cert: string, index: number) => (
                              <Badge key={index} variant="outline">
                                {cert}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-4">
                    <Button
                      onClick={() => setShowCertificate(true)}
                      variant="outline"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      View Certificate
                    </Button>
                    <Button onClick={downloadCertificate} variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download Certificate
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Verification Failed
                  </h3>
                  <p className="text-gray-400">
                    {verificationResult.error ||
                      "Product could not be verified"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Certificate Dialog */}
      <Dialog open={showCertificate} onOpenChange={setShowCertificate}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Verification Certificate</DialogTitle>
          </DialogHeader>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap">
            {certificate || "No certificate available"}
          </div>
          <div className="flex justify-end">
            <Button onClick={downloadCertificate}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductVerification;
