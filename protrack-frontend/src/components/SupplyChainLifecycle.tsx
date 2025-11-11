import React, { useState, useEffect } from "react";
import { useProTrackMPCMock as useProTrackMPC } from "../hooks/useProTrackMPCMock";
import { integratedSupplyChainService } from "../services/integratedSupplyChainService";
import { useWeb3 } from "../hooks/useWeb3";
import { useToast } from "../contexts/ToastContext";
import Web3 from "web3";
import notificationService from "../services/notificationService";

const SupplyChainLifecycle: React.FC = () => {
  const { userRoles, userKeys, loading } = useProTrackMPC(
    "0x0000000000000000000000000000000000000000"
  );
  const { account, isActive } = useWeb3();
  const { addToast } = useToast();
  const [activeStage, setActiveStage] = useState<
    "manufacture" | "packaging" | "shipping" | "receiving" | "customer"
  >("manufacture");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [productData, setProductData] = useState<Record<string, any> | null>(
    null
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [shipmentData, setShipmentData] = useState<Record<string, any> | null>(
    null
  );

  const [verificationResult, setVerificationResult] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [status, setStatus] = useState<string>(
    "Ready to start supply chain lifecycle"
  );
  const [supplyChainService, setSupplyChainService] = useState<
    typeof integratedSupplyChainService | null
  >(null);

  // Initialize supply chain service when web3 is ready
  useEffect(() => {
    if (account && isActive && window.ethereum) {
      try {
        const web3 = new Web3(window.ethereum as unknown as string);
        // Initialize the integrated service with web3
        integratedSupplyChainService.init(web3).then(() => {
          setSupplyChainService(integratedSupplyChainService);
        });
      } catch (error) {
        console.error("Failed to initialize supply chain service:", error);
        addToast({
          type: "error",
          title: "Initialization Error",
          message: "Failed to initialize supply chain service",
          duration: 5000,
        });
      }
    }
  }, [account, isActive, addToast]);

  // Generate demo data
  useEffect(() => {
    if (!loading) {
      // Initialize with demo data
      setProductData({
        name: "Premium Organic Coffee Beans",
        sku: "COF-2023-001",
        manufacturer: account || "0xManufacturerAddress",
        batchId: "BATCH-2023-12-001",
        category: "Food & Beverage",
        expiryDate: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
        currentValue: "25.99",
        currentLocation: "Roastery Facility",
      });
    }
  }, [loading, account]);

  // 🔗 Smart Contract Lifecycle Implementation

  const handleManufacture = async () => {
    if (!supplyChainService || !productData) {
      setStatus("Web3 not connected or product data missing");
      addToast({
        type: "error",
        title: "Connection Error",
        message: "Web3 not connected or product data missing",
        duration: 5000,
      });
      return;
    }

    setStatus("Manufacturing product and minting NFT...");
    try {
      // Prepare product data for contract
      const contractProductData = {
        name: productData.name,
        sku: productData.sku,
        manufacturer: productData.manufacturer,
        batchId: productData.batchId,
        category: productData.category,
        expiryDate: productData.expiryDate,
      };

      // Use the actual method from integratedSupplyChainService
      const result = await supplyChainService.createAndTrackProduct(
        contractProductData,
        "0xabcdef1234567890" // demo RFID hash
      );

      if (result.success) {
        setProductData({
          ...productData,
          tokenId: result.tokenId,
        });

        // Add notification
        notificationService.addNotification({
          type: "success",
          title: "Product Manufactured",
          message: `Product "${productData?.name}" minted as NFT with Token ID: ${result.tokenId}`,
          relatedTokenId: result.tokenId,
        });

        // Add toast notification
        addToast({
          type: "success",
          title: "Product Manufactured",
          message: `Product minted successfully with Token ID: ${result.tokenId}`,
          duration: 5000,
        });

        setStatus(
          "Product manufactured and NFT minted successfully! Token ID: " +
            result.tokenId
        );
        setActiveStage("packaging");
      } else {
        throw new Error(result.error || "Failed to create product");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setStatus("Error during manufacturing: " + errorMessage);
      addToast({
        type: "error",
        title: "Manufacturing Failed",
        message: errorMessage,
        duration: 5000,
      });
    }
  };

  const handlePackaging = async () => {
    if (!supplyChainService || !productData || !productData.tokenId) {
      setStatus("Supply chain service not initialized or product not minted");
      addToast({
        type: "error",
        title: "Packaging Error",
        message: "Supply chain service not initialized or product not minted",
        duration: 5000,
      });
      return;
    }

    setStatus("Packaging product with IoT verification...");
    try {
      // Generate demo IoT data
      const iotData = {
        temperature: 22.5 + (Math.random() - 0.5) * 2, // 22.5 ± 1°C
        humidity: 65.2 + (Math.random() - 0.5) * 10, // 65.2 ± 5%
        gps: {
          lat: 40.7128 + (Math.random() - 0.5) * 0.01,
          lng: -74.006 + (Math.random() - 0.5) * 0.01,
        },
        shock: Math.random() * 0.5, // 0-0.5g
        tamper: false,
      };

      // Use the actual method from integratedSupplyChainService
      const result = await supplyChainService.processIoTData(
        iotData,
        "SENSOR-001"
      );

      if (result.success) {
        // Add notification
        notificationService.addNotification({
          type: "info",
          title: "Product Packaged",
          message: `Product packaged with IoT verification completed for Token ID: ${productData?.tokenId}`,
          relatedTokenId: productData?.tokenId,
        });

        // Add toast notification
        addToast({
          type: "success",
          title: "Product Packaged",
          message: "Product packaged with IoT verification completed!",
          duration: 5000,
        });

        setStatus("Product packaged with IoT verification completed!");
        setActiveStage("shipping");
      } else {
        throw new Error(result.error || "Failed to process IoT data");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setStatus("Error during packaging: " + errorMessage);
      addToast({
        type: "error",
        title: "Packaging Failed",
        message: errorMessage,
        duration: 5000,
      });
    }
  };

  const handleShipping = async () => {
    if (!supplyChainService || !productData || !productData.tokenId) {
      setStatus("Supply chain service not initialized or product not minted");
      addToast({
        type: "error",
        title: "Shipping Error",
        message: "Supply chain service not initialized or product not minted",
        duration: 5000,
      });
      return;
    }

    setStatus("Initiating shipment with escrow...");
    try {
      // Use the actual method from integratedSupplyChainService
      const result = await supplyChainService.transferProductWithApproval(
        productData.tokenId,
        "0x942d35Cc6634C0532925a3b8D4C9db96590b5e8e", // demo transporter address
        "Distribution Center NYC",
        "Shipped via express delivery"
      );

      if (result.success) {
        setShipmentData({
          ...result,
          status: "In Transit",
          estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        });

        // Add notification
        notificationService.addNotification({
          type: "info",
          title: "Shipment Initiated",
          message: `Product shipped to ${result.to.substring(0, 10)}...`,
          relatedTokenId: productData?.tokenId,
        });

        // Add toast notification
        addToast({
          type: "success",
          title: "Shipment Initiated",
          message: "Product shipment has been initiated successfully!",
          duration: 5000,
        });

        setStatus("Shipment initiated successfully!");
        setActiveStage("receiving");
      } else {
        throw new Error(result.error || "Failed to initiate shipment");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setStatus("Error during shipping: " + errorMessage);
      addToast({
        type: "error",
        title: "Shipping Failed",
        message: errorMessage,
        duration: 5000,
      });
    }
  };

  const handleReceiving = async () => {
    if (!supplyChainService || !productData || !productData.tokenId) {
      setStatus("Supply chain service not initialized or product not minted");
      addToast({
        type: "error",
        title: "Receiving Error",
        message: "Supply chain service not initialized or product not minted",
        duration: 5000,
      });
      return;
    }

    setStatus("Receiving shipment and verifying authenticity...");
    try {
      // Use the actual method from integratedSupplyChainService
      const result = await supplyChainService.getProductInfo(
        productData.tokenId
      );

      if (result.success) {
        setVerificationResult(result.data);

        // Add notification
        notificationService.addNotification({
          type: "success",
          title: "Shipment Received",
          message: `Product received and verified successfully`,
          relatedTokenId: productData?.tokenId,
        });

        // Add toast notification
        addToast({
          type: "success",
          title: "Shipment Received",
          message: "Product received and verified successfully!",
          duration: 5000,
        });

        setStatus("Shipment received and verified successfully!");
        setActiveStage("customer");
      } else {
        throw new Error(result.error || "Failed to verify product");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setStatus("Error during receiving: " + errorMessage);
      addToast({
        type: "error",
        title: "Receiving Failed",
        message: errorMessage,
        duration: 5000,
      });
    }
  };

  const handleCustomerVerification = async () => {
    if (!supplyChainService || !productData || !productData.tokenId) {
      setStatus("Supply chain service not initialized or product not minted");
      addToast({
        type: "error",
        title: "Verification Error",
        message: "Supply chain service not initialized or product not minted",
        duration: 5000,
      });
      return;
    }

    setStatus("Verifying product authenticity for end customer...");
    try {
      // Use the actual method from integratedSupplyChainService
      const result = await supplyChainService.getProductInfo(
        productData.tokenId
      );

      if (result.success) {
        setVerificationResult(result.data);

        // Add notification
        notificationService.addNotification({
          type: "success",
          title: "Product Verified",
          message: `Product authenticity verified for customer`,
          relatedTokenId: productData?.tokenId,
        });

        // Add toast notification
        addToast({
          type: "success",
          title: "Product Verified",
          message: "Product authenticity verified successfully!",
          duration: 5000,
        });

        setStatus("Product authenticity verified successfully!");
      } else {
        throw new Error(result.error || "Failed to verify product");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setStatus("Error during verification: " + errorMessage);
      addToast({
        type: "error",
        title: "Verification Failed",
        message: errorMessage,
        duration: 5000,
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Loading supply chain data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Supply Chain Lifecycle
      </h2>

      {/* Status indicator */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
        <p className="text-blue-800 dark:text-blue-200 font-medium">{status}</p>
      </div>

      {/* Lifecycle stages */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        {(
          [
            "manufacture",
            "packaging",
            "shipping",
            "receiving",
            "customer",
          ] as const
        ).map((stage) => (
          <button
            key={stage}
            onClick={() => setActiveStage(stage)}
            className={`p-4 rounded-lg text-center transition-all ${
              activeStage === stage
                ? "bg-blue-600 text-white shadow-lg transform scale-105"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            <div className="font-medium capitalize">{stage}</div>
          </button>
        ))}
      </div>

      {/* Stage-specific content */}
      <div className="mb-8">
        {activeStage === "manufacture" && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Manufacture Stage
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              RFID scanned → hash minted → token created on-chain
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Product Information</h4>
              {productData && (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Name: {productData.name}</div>
                  <div>SKU: {productData.sku}</div>
                  <div>Batch ID: {productData.batchId}</div>
                  <div>Category: {productData.category}</div>
                  {productData.tokenId && (
                    <div>Token ID: {productData.tokenId}</div>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={handleManufacture}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Mint Product NFT
            </button>
          </div>
        )}

        {activeStage === "packaging" && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Packaging Stage
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              IoT verifies conditions; logs packaging proof → IPFS
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h4 className="font-medium mb-2">IoT Sensor Data</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Temperature:</span>
                  <span>22.5°C</span>
                </div>
                <div className="flex justify-between">
                  <span>Humidity:</span>
                  <span>45.2%</span>
                </div>
                <div className="flex justify-between">
                  <span>Location:</span>
                  <span>Packaging Facility</span>
                </div>
              </div>
            </div>
            <button
              onClick={handlePackaging}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Log Packaging Proof
            </button>
          </div>
        )}

        {activeStage === "shipping" && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Shipping Stage
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Each shipment generates new temp encryption key
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Shipment Information</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Sender: 0xManufacturer...</div>
                <div>Receiver: 0xDistributor...</div>
                <div>Location: Distribution Center</div>
                {shipmentData && (
                  <div>Shipment ID: {shipmentData.shipmentId}</div>
                )}
              </div>
            </div>
            <button
              onClick={handleShipping}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Initiate Shipment
            </button>
          </div>
        )}

        {activeStage === "receiving" && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Receiving Stage
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Receiver decrypts using private key; ownership transferred
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Decryption Information</h4>
              <div className="text-sm">
                <div>Decryption Key: 0xabcdef...123456</div>
                <div className="mt-2 text-xs text-gray-500">
                  Key will be decrypted locally using receiver's wallet
                </div>
              </div>
            </div>
            <button
              onClick={handleReceiving}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Receive Shipment
            </button>
          </div>
        )}

        {activeStage === "customer" && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Customer Verification
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Scans QR/RFID → blockchain verifies authenticity → display product
              history
            </p>
            {verificationResult ? (
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 dark:text-green-200">
                    Product Verified as Authentic
                  </h4>
                  <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                    <div>
                      Product:{" "}
                      {(verificationResult as Record<string, unknown>)
                        .productData
                        ? (
                            (verificationResult as Record<string, unknown>)
                              .productData as Record<string, string>
                          ).name
                        : "N/A"}
                    </div>
                    <div>
                      Token ID:{" "}
                      {String(
                        (verificationResult as Record<string, unknown>)
                          .tokenId || "N/A"
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Supply Chain History</h4>
                  <div className="space-y-2 text-sm">
                    {(
                      ((verificationResult as Record<string, unknown>)
                        .history as Array<Record<string, unknown>>) || []
                    ).map((event: Record<string, unknown>, index: number) => (
                      <div
                        key={index}
                        className="flex justify-between border-b border-gray-200 dark:border-gray-600 pb-2"
                      >
                        <span>{(event.event as string) || "N/A"}</span>
                        <span className="text-gray-500 dark:text-gray-400">
                          {event.timestamp
                            ? new Date(
                                (event.timestamp as number) * 1000
                              ).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <button
                  onClick={handleCustomerVerification}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Verify Product Authenticity
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Roles and Keys */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          User Access
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Your Roles</h4>
            <div className="flex flex-wrap gap-2">
              {userRoles.map((role, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-sm"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Your Keys</h4>
            <div className="text-sm">
              {userKeys.length > 0 ? (
                <div>
                  <div>{userKeys.length} encryption keys available</div>
                  <div className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                    Keys are used for secure data sharing
                  </div>
                </div>
              ) : (
                <div>No keys assigned</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplyChainLifecycle;
