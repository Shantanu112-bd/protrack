import React, { useState, useEffect } from "react";
import { useProTrackMPC, Key } from "../hooks/useProTrackMPC";
import {
  EncryptionService,
  EncryptionKey,
} from "../services/encryptionService";
import { ethers } from "ethers";

interface EnhancedKeyManagementProps {
  contractAddress: string;
  productId?: string;
  currentUser: string;
}

export const EnhancedKeyManagement: React.FC<EnhancedKeyManagementProps> = ({
  contractAddress,
  productId,
  currentUser,
}) => {
  const { userRoles, userKeys, loading, createKey, getKey } =
    useProTrackMPC(contractAddress);

  const [keys, setKeys] = useState<Record<string, Key>>({});
  const [accessKeys, setAccessKeys] = useState<EncryptionKey[]>([]);
  const [newKeyData, setNewKeyData] = useState({
    publicKey: "",
    threshold: 2,
    parties: [""],
    purpose: "",
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [tempKeyId, setTempKeyId] = useState<string>("");
  const [senderAddress, setSenderAddress] = useState<string>("");
  const [receiverAddress, setReceiverAddress] = useState<string>("");

  useEffect(() => {
    setIsAdmin(userRoles.includes("ADMIN_ROLE"));
  }, [userRoles]);

  useEffect(() => {
    const loadKeys = async () => {
      const keyDetails: Record<string, Key> = {};
      for (const keyId of userKeys) {
        try {
          const keyInfo = await getKey(keyId);
          keyDetails[keyId] = keyInfo;
        } catch (error) {
          console.error(`Error loading key ${keyId}:`, error);
        }
      }
      setKeys(keyDetails);
    };

    if (userKeys.length > 0) {
      loadKeys();
    }
  }, [userKeys, getKey]);

  useEffect(() => {
    const loadAccessKeys = async () => {
      if (!currentUser) return;

      try {
        const userKeys = await EncryptionService.getUserKeyShares(
          currentUser,
          productId
        );
        setAccessKeys(userKeys);
      } catch (error) {
        console.error("Error loading access keys:", error);
      }
    };

    loadAccessKeys();
  }, [currentUser, productId]);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const keyId = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(`key_${Date.now()}`)
      );
      const purposeHash = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(newKeyData.purpose)
      );

      await createKey(
        keyId,
        newKeyData.publicKey,
        newKeyData.threshold,
        newKeyData.parties.filter((p) => p !== ""),
        purposeHash
      );

      setNewKeyData({
        publicKey: "",
        threshold: 2,
        parties: [""],
        purpose: "",
      });
    } catch (error) {
      console.error("Error creating key:", error);
    }
  };

  const handleGenerateTempKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !senderAddress || !receiverAddress) {
      alert("Please provide product ID, sender address, and receiver address");
      return;
    }

    try {
      const keyId = await EncryptionService.generateTempAccessKey(
        productId,
        senderAddress,
        receiverAddress
      );
      setTempKeyId(keyId);
      alert(`Temporary access key generated: ${keyId}`);
    } catch (error) {
      console.error("Error generating temporary access key:", error);
      alert("Failed to generate temporary access key");
    }
  };

  const addParty = () => {
    setNewKeyData((prev) => ({
      ...prev,
      parties: [...prev.parties, ""],
    }));
  };

  const updateParty = (index: number, value: string) => {
    setNewKeyData((prev) => ({
      ...prev,
      parties: prev.parties.map((p, i) => (i === index ? value : p)),
    }));
  };

  if (loading) {
    return <div className="p-4">Loading key management...</div>;
  }

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold mb-4">Enhanced Key Management</h2>

      {/* Temporary Access Key Generation */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">
          Generate Temporary Access Key
        </h3>
        <form onSubmit={handleGenerateTempKey} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Product ID</label>
            <input
              type="text"
              value={productId || ""}
              onChange={() => {}}
              className="w-full p-2 border rounded dark:bg-gray-700"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Sender Address
            </label>
            <input
              type="text"
              value={senderAddress}
              onChange={(e) => setSenderAddress(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700"
              placeholder="0x..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Receiver Address
            </label>
            <input
              type="text"
              value={receiverAddress}
              onChange={(e) => setReceiverAddress(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700"
              placeholder="0x..."
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            Generate Temporary Access Key
          </button>

          {tempKeyId && (
            <div className="mt-4 p-3 bg-green-100 dark:bg-green-900 rounded">
              <p className="font-medium">Generated Key ID:</p>
              <p className="font-mono text-sm break-all">{tempKeyId}</p>
            </div>
          )}
        </form>
      </div>

      {/* Access Keys List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Your Access Keys</h3>
        {accessKeys.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            No access keys found
          </p>
        ) : (
          accessKeys.map((key) => (
            <div
              key={key.id}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
            >
              <h4 className="font-medium text-lg mb-2">
                Key ID: {key.keyId.slice(0, 10)}...
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p>
                    <span className="font-medium">Product:</span>{" "}
                    {key.productId.slice(0, 10)}...
                  </p>
                  <p>
                    <span className="font-medium">Status:</span>{" "}
                    {key.active ? "Active" : "Inactive"}
                  </p>
                </div>
                <div>
                  <p>
                    <span className="font-medium">Created:</span>{" "}
                    {new Date(key.createdAt).toLocaleString()}
                  </p>
                  {key.expiresAt && (
                    <p>
                      <span className="font-medium">Expires:</span>{" "}
                      {new Date(key.expiresAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-2">
                <p className="font-medium">Public Key:</p>
                <p className="font-mono text-xs break-all mt-1">
                  {key.publicKey}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MPC Keys List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">MPC Keys</h3>
        {Object.entries(keys).map(([keyId, keyInfo]) => (
          <div
            key={keyId}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
          >
            <h4 className="font-medium text-lg mb-2">
              Key ID: {keyId.slice(0, 10)}...
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p>
                  <span className="font-medium">Threshold:</span>{" "}
                  {keyInfo.threshold}
                </p>
                <p>
                  <span className="font-medium">Status:</span>{" "}
                  {keyInfo.isActive ? "Active" : "Inactive"}
                </p>
                <p>
                  <span className="font-medium">Purpose:</span>{" "}
                  {keyInfo.purpose}
                </p>
              </div>
              <div>
                <p>
                  <span className="font-medium">Signatures:</span>{" "}
                  {keyInfo.currentSignatures}
                </p>
                <p>
                  <span className="font-medium">Last Used:</span>{" "}
                  {new Date(keyInfo.lastUsed * 1000).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-2">
              <p className="font-medium">Authorized Parties:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {keyInfo.authorizedParties.map((party, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm"
                  >
                    {party.slice(0, 6)}...{party.slice(-4)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Key Form */}
      {isAdmin && (
        <form
          onSubmit={handleCreateKey}
          className="space-y-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
        >
          <h3 className="text-xl font-semibold">Create New MPC Key</h3>

          <div>
            <label className="block text-sm font-medium mb-1">Public Key</label>
            <input
              type="text"
              value={newKeyData.publicKey}
              onChange={(e) =>
                setNewKeyData((prev) => ({
                  ...prev,
                  publicKey: e.target.value,
                }))
              }
              className="w-full p-2 border rounded dark:bg-gray-700"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Threshold</label>
            <input
              type="number"
              value={newKeyData.threshold}
              onChange={(e) =>
                setNewKeyData((prev) => ({
                  ...prev,
                  threshold: parseInt(e.target.value),
                }))
              }
              min="1"
              className="w-full p-2 border rounded dark:bg-gray-700"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Purpose</label>
            <input
              type="text"
              value={newKeyData.purpose}
              onChange={(e) =>
                setNewKeyData((prev) => ({ ...prev, purpose: e.target.value }))
              }
              className="w-full p-2 border rounded dark:bg-gray-700"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Authorized Parties
            </label>
            {newKeyData.parties.map((party, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={party}
                  onChange={(e) => updateParty(index, e.target.value)}
                  placeholder="Ethereum address"
                  className="flex-1 p-2 border rounded dark:bg-gray-700"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addParty}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              + Add Party
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            Create MPC Key
          </button>
        </form>
      )}
    </div>
  );
};
