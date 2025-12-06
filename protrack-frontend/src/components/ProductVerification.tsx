import React, { useState, useEffect } from "react";
import { useProTrackMPCMock as useProTrackMPC } from "../hooks/useProTrackMPCMock";
import { ethers } from "ethers";

interface ProductVerificationProps {
  contractAddress: string;
}

export const ProductVerification: React.FC<ProductVerificationProps> = ({
  contractAddress,
}) => {
  const { userKeys, loading, verifyProduct, isProductVerified } =
    useProTrackMPC(contractAddress);

  const [selectedKey, setSelectedKey] = useState("");
  const [productId, setProductId] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<{
    status: "idle" | "loading" | "success" | "error";
    message: string;
  }>({ status: "idle", message: "" });
  const [verifiedProducts, setVerifiedProducts] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    const loadVerificationStatus = async () => {
      if (!selectedKey || !productId) return;

      try {
        const hashedProductId = ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes(productId)
        );
        const status = await isProductVerified(selectedKey, hashedProductId);
        setVerifiedProducts((prev) => ({
          ...prev,
          [productId]: status,
        }));
      } catch (error) {
        console.error("Error checking product verification:", error);
      }
    };

    loadVerificationStatus();
  }, [selectedKey, productId, isProductVerified]);

  const handleVerifyProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKey || !productId) return;

    setVerificationStatus({
      status: "loading",
      message: "Verifying product...",
    });

    try {
      const hashedProductId = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(productId)
      );

      // In a real implementation, this signature would come from the user's wallet
      // Here we're simulating it for demonstration
      const timestamp = Math.floor(Date.now() / 1000);
      // Generate message hash for signing (mocked for demo)
      const messageHash = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ["bytes32", "uint256"],
          [hashedProductId, timestamp]
        )
      );
      console.log("Message hash for signing:", messageHash);

      // This is a placeholder. In production, use actual wallet signing
      // For demo, we'll use a mock signature
      const signature =
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef00";

      const success = await verifyProduct(
        hashedProductId,
        selectedKey,
        signature
      );

      if (success) {
        setVerificationStatus({
          status: "success",
          message: "Product verified successfully!",
        });
        setVerifiedProducts((prev) => ({
          ...prev,
          [productId]: true,
        }));
      } else {
        setVerificationStatus({
          status: "error",
          message: "Product verification failed.",
        });
      }
    } catch (error) {
      console.error("Error verifying product:", error);
      setVerificationStatus({
        status: "error",
        message: "Error verifying product: " + (error as Error).message,
      });
    }
  };

  if (loading) {
    return <div className="p-4">Loading product verification...</div>;
  }

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold mb-4">Product Verification</h2>

      <form
        onSubmit={handleVerifyProduct}
        className="space-y-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Select Key</label>
          <select
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-700"
            required
          >
            <option value="">Select a key...</option>
            {userKeys.map((keyId) => (
              <option key={keyId} value={keyId}>
                {keyId.slice(0, 10)}...
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Product ID</label>
          <input
            type="text"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            placeholder="Enter product ID"
            className="w-full p-2 border rounded dark:bg-gray-700"
            required
          />
        </div>

        <button
          type="submit"
          disabled={verificationStatus.status === "loading"}
          className={`w-full py-2 px-4 rounded transition-colors ${
            verificationStatus.status === "loading"
              ? "bg-gray-400"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {verificationStatus.status === "loading"
            ? "Verifying..."
            : "Verify Product"}
        </button>

        {verificationStatus.message && (
          <div
            className={`p-3 rounded ${
              verificationStatus.status === "success"
                ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-100"
                : verificationStatus.status === "error"
                ? "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-100"
                : ""
            }`}
          >
            {verificationStatus.message}
          </div>
        )}
      </form>

      {/* Verified Products List */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Verified Products</h3>
        <div className="space-y-2">
          {Object.entries(verifiedProducts).map(([pid, status]) => (
            <div
              key={pid}
              className="flex justify-between items-center p-2 border-b dark:border-gray-700"
            >
              <span>{pid}</span>
              <span
                className={`px-2 py-1 rounded text-sm ${
                  status
                    ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-100"
                    : "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-100"
                }`}
              >
                {status ? "Verified" : "Not Verified"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
