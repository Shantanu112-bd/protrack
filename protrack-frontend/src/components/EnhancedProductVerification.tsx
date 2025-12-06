import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scan,
  Search,
  Shield,
  CheckCircle,
  XCircle,
  Package,
  Calendar,
  MapPin,
  Lock,
  Hash,
  User,
  Check,
  FileText,
  Key,
} from "lucide-react";
import {
  VerificationService,
  VerificationResult,
} from "../services/verificationService";
import { useEnhancedWeb3 } from "../contexts/EnhancedWeb3Context";
import { CONTRACT_ADDRESSES } from "../config/contractConfig";
import { ethers } from "ethers";

interface ProductVerificationProps {
  initialRFID?: string;
}

export const EnhancedProductVerification: React.FC<
  ProductVerificationProps
> = ({ initialRFID }) => {
  const { web3, isConnected } = useEnhancedWeb3();

  const [scanInput, setScanInput] = useState(initialRFID || "");
  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanMode, setScanMode] = useState<"qr" | "manual">("qr");
  const [verificationService, setVerificationService] =
    useState<VerificationService | null>(null);
  const [certificate, setCertificate] = useState<string | null>(null);

  useEffect(() => {
    if (web3 && isConnected) {
      const service = new VerificationService(
        CONTRACT_ADDRESSES.SUPPLY_CHAIN,
        CONTRACT_ADDRESSES.MPC_WALLET,
        CONTRACT_ADDRESSES.ORACLE
      );

      // Initialize the service (mock implementation)
      // In a real implementation, we would initialize with a proper provider
      service.initialize(null as unknown as ethers.providers.Web3Provider);
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
    } catch (error) {
      console.error("Verification failed:", error);
      setVerificationResult({
        verified: false,
        error: error instanceof Error ? error.message : "Verification failed",
      });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blockchain-50 via-white to-supply-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Enhanced Product Verification
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Verify product authenticity with blockchain proof and zero-knowledge
            verification
          </p>
        </motion.div>

        {/* Verification Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
            {/* Scan Mode Toggle */}
            <div className="flex justify-center mb-6">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1 flex">
                <button
                  onClick={() => setScanMode("qr")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    scanMode === "qr"
                      ? "bg-white dark:bg-gray-600 text-blockchain-600 dark:text-blockchain-400 shadow-sm"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  <Scan className="w-4 h-4 inline mr-2" />
                  QR Code
                </button>
                <button
                  onClick={() => setScanMode("manual")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    scanMode === "manual"
                      ? "bg-white dark:bg-gray-600 text-blockchain-600 dark:text-blockchain-400 shadow-sm"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  <Search className="w-4 h-4 inline mr-2" />
                  Manual Entry
                </button>
              </div>
            </div>

            {scanMode === "qr" ? (
              <div className="text-center">
                <div className="w-64 h-64 mx-auto bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center mb-6">
                  <div className="text-center">
                    <Scan className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Position QR code within the frame
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleVerify()}
                  disabled={loading}
                  className="w-full bg-blockchain-600 text-white py-3 px-6 rounded-lg hover:bg-blockchain-700 disabled:opacity-50 transition-colors font-medium"
                >
                  {loading ? "Scanning..." : "Start Camera Scan"}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Product RFID or Identifier
                  </label>
                  <input
                    type="text"
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blockchain-500"
                    placeholder="Enter RFID hash or product identifier"
                  />
                </div>
                <button
                  onClick={() => handleVerify()}
                  disabled={loading || !scanInput.trim()}
                  className="w-full bg-blockchain-600 text-white py-3 px-6 rounded-lg hover:bg-blockchain-700 disabled:opacity-50 transition-colors font-medium"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Verifying...
                    </div>
                  ) : (
                    "Verify Product"
                  )}
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Verification Result */}
        <AnimatePresence>
          {verificationResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="max-w-6xl mx-auto"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
                {/* Verification Status */}
                <div className="text-center mb-8">
                  <div
                    className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-semibold ${
                      verificationResult.verified
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                    }`}
                  >
                    {verificationResult.verified ? (
                      <CheckCircle className="w-6 h-6 mr-2" />
                    ) : (
                      <XCircle className="w-6 h-6 mr-2" />
                    )}
                    {verificationResult.verified
                      ? "Authentic Product"
                      : "Product Not Verified"}
                  </div>

                  {verificationResult.error && (
                    <p className="mt-4 text-red-600 dark:text-red-400">
                      {verificationResult.error}
                    </p>
                  )}
                </div>

                {verificationResult.verified && verificationResult.product && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Product Information */}
                    <div className="lg:col-span-2">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                        <Package className="w-6 h-6 mr-2 text-blockchain-500" />
                        Product Information
                      </h3>

                      <div className="space-y-6">
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                          <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {verificationResult.product.name}
                          </h4>
                          <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                            {verificationResult.product.description}
                          </p>

                          <div className="flex flex-wrap gap-2">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                verificationResult.product.status
                              )}`}
                            >
                              <div className="w-2 h-2 rounded-full bg-current mr-2"></div>
                              {verificationResult.product.status}
                            </span>

                            {verificationResult.product.certifications.map(
                              (cert, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-supply-100 text-supply-800 dark:bg-supply-900/20 dark:text-supply-400"
                                >
                                  <Shield className="w-3 h-3 mr-1" />
                                  {cert}
                                </span>
                              )
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                            <div className="flex items-center text-gray-500 dark:text-gray-400 mb-2">
                              <Hash className="w-4 h-4 mr-2" />
                              <span className="text-sm font-medium">
                                Token ID
                              </span>
                            </div>
                            <p className="font-mono text-gray-900 dark:text-white">
                              #{verificationResult.product.tokenId}
                            </p>
                          </div>

                          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                            <div className="flex items-center text-gray-500 dark:text-gray-400 mb-2">
                              <User className="w-4 h-4 mr-2" />
                              <span className="text-sm font-medium">
                                Manufacturer
                              </span>
                            </div>
                            <p className="font-mono text-gray-900 dark:text-white">
                              {formatAddress(
                                verificationResult.product.manufacturer
                              )}
                            </p>
                          </div>

                          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                            <div className="flex items-center text-gray-500 dark:text-gray-400 mb-2">
                              <Calendar className="w-4 h-4 mr-2" />
                              <span className="text-sm font-medium">
                                Manufacture Date
                              </span>
                            </div>
                            <p className="text-gray-900 dark:text-white">
                              {formatDate(
                                verificationResult.product.manufactureDate
                              )}
                            </p>
                          </div>

                          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                            <div className="flex items-center text-gray-500 dark:text-gray-400 mb-2">
                              <MapPin className="w-4 h-4 mr-2" />
                              <span className="text-sm font-medium">
                                Current Location
                              </span>
                            </div>
                            <p className="text-gray-900 dark:text-white">
                              {verificationResult.product.location || "Unknown"}
                            </p>
                          </div>
                        </div>

                        {/* Blockchain Proof */}
                        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                          <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4 flex items-center">
                            <Lock className="w-5 h-5 mr-2" />
                            Blockchain Proof
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">
                                Transaction Hash
                              </div>
                              <div className="font-mono text-sm text-blue-800 dark:text-blue-200 break-all">
                                {
                                  verificationResult.product.blockchainProof
                                    .transactionHash
                                }
                              </div>
                            </div>

                            <div>
                              <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">
                                Block Number
                              </div>
                              <div className="font-mono text-sm text-blue-800 dark:text-blue-200">
                                #
                                {
                                  verificationResult.product.blockchainProof
                                    .blockNumber
                                }
                              </div>
                            </div>

                            <div>
                              <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">
                                Timestamp
                              </div>
                              <div className="text-sm text-blue-800 dark:text-blue-200">
                                {new Date(
                                  verificationResult.product.blockchainProof
                                    .timestamp * 1000
                                ).toLocaleString()}
                              </div>
                            </div>

                            <div>
                              <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">
                                Validator
                              </div>
                              <div className="font-mono text-sm text-blue-800 dark:text-blue-200">
                                {formatAddress(
                                  verificationResult.product.blockchainProof
                                    .validator
                                )}
                              </div>
                            </div>
                          </div>

                          {verificationResult.proofDetails && (
                            <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
                              <div className="flex items-center text-blue-700 dark:text-blue-300">
                                <Check className="w-4 h-4 mr-2" />
                                <span className="text-sm font-medium">
                                  On-chain data:{" "}
                                  {verificationResult.proofDetails.onChainData
                                    ? "Verified"
                                    : "Not verified"}
                                </span>
                              </div>
                              <div className="flex items-center text-blue-700 dark:text-blue-300 mt-1">
                                <Check className="w-4 h-4 mr-2" />
                                <span className="text-sm font-medium">
                                  Off-chain data:{" "}
                                  {verificationResult.proofDetails.offChainData
                                    ? "Verified"
                                    : "Not verified"}
                                </span>
                              </div>
                              {verificationResult.proofDetails.zkProofValid !==
                                undefined && (
                                <div className="flex items-center text-blue-700 dark:text-blue-300 mt-1">
                                  <Check className="w-4 h-4 mr-2" />
                                  <span className="text-sm font-medium">
                                    Zero-knowledge proof:{" "}
                                    {verificationResult.proofDetails
                                      .zkProofValid
                                      ? "Valid"
                                      : "Invalid"}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* ZK Proof (if available) */}
                        {verificationResult.product.zkProof && (
                          <div className="bg-purple-50 dark:bg-purple-900/10 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
                            <h4 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-4 flex items-center">
                              <Key className="w-5 h-5 mr-2" />
                              Zero-Knowledge Proof
                            </h4>

                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm text-purple-600 dark:text-purple-400 mb-1">
                                  Proof Status
                                </div>
                                <div
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    verificationResult.product.zkProof.isValid
                                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                                  }`}
                                >
                                  {verificationResult.product.zkProof
                                    .isValid ? (
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                  ) : (
                                    <XCircle className="w-4 h-4 mr-1" />
                                  )}
                                  {verificationResult.product.zkProof.isValid
                                    ? "Valid"
                                    : "Invalid"}
                                </div>
                              </div>

                              <button
                                onClick={() => {
                                  // In a real implementation, this would download or display the proof
                                  alert(
                                    "ZK proof details would be displayed here"
                                  );
                                }}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                              >
                                View Proof
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Supply Chain Journey & Certificate */}
                    <div className="space-y-8">
                      {/* Supply Chain Journey */}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                          <MapPin className="w-6 h-6 mr-2 text-supply-500" />
                          Supply Chain Journey
                        </h3>

                        <div className="space-y-4">
                          {verificationResult.product.history.map(
                            (step, index) => (
                              <div
                                key={step.id}
                                className="flex items-start space-x-4"
                              >
                                <div className="flex flex-col items-center">
                                  <div className="w-4 h-4 bg-blockchain-500 rounded-full" />
                                  {index <
                                    verificationResult.product!.history.length -
                                      1 && (
                                    <div className="w-0.5 h-8 bg-gray-300 dark:bg-gray-600 mt-2" />
                                  )}
                                </div>
                                <div className="flex-1 pb-4">
                                  <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                      {step.event}
                                    </h4>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                      {new Date(
                                        step.timestamp * 1000
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                  {step.location && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {step.location}
                                    </p>
                                  )}
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    Actor: {formatAddress(step.actor)}
                                  </p>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {/* Verification Certificate */}
                      {certificate && (
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                            <FileText className="w-6 h-6 mr-2 text-green-500" />
                            Verification Certificate
                          </h3>

                          <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-6 border border-green-200 dark:border-green-800">
                            <div className="text-center mb-4">
                              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                              <h4 className="text-lg font-semibold text-green-800 dark:text-green-200 mt-2">
                                Product Verified
                              </h4>
                              <p className="text-sm text-green-600 dark:text-green-400">
                                Certificate ID:{" "}
                                {verificationResult.product!.tokenId}
                              </p>
                            </div>

                            <div className="space-y-3 text-sm">
                              <div className="flex justify-between">
                                <span className="text-green-600 dark:text-green-400">
                                  Product:
                                </span>
                                <span className="text-green-800 dark:text-green-200 font-medium">
                                  {verificationResult.product!.name}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-green-600 dark:text-green-400">
                                  Manufacturer:
                                </span>
                                <span className="text-green-800 dark:text-green-200 font-medium">
                                  {formatAddress(
                                    verificationResult.product!.manufacturer
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-green-600 dark:text-green-400">
                                  Verification Date:
                                </span>
                                <span className="text-green-800 dark:text-green-200 font-medium">
                                  {new Date().toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-green-600 dark:text-green-400">
                                  Blockchain Verified:
                                </span>
                                <span className="text-green-800 dark:text-green-200 font-medium">
                                  Yes
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                // In a real implementation, this would download the certificate
                                const blob = new Blob([certificate], {
                                  type: "application/json",
                                });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = `verification-certificate-${
                                  verificationResult.product!.tokenId
                                }.json`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                              }}
                              className="w-full mt-6 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              Download Certificate
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-blockchain-100 dark:bg-blockchain-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blockchain-600 dark:text-blockchain-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Blockchain Verified
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Every product is verified on the blockchain for immutable
              authenticity
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Key className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Zero-Knowledge Proof
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Privacy-preserving verification without revealing sensitive data
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Instant Verification
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Get immediate results with our advanced verification system
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EnhancedProductVerification;
