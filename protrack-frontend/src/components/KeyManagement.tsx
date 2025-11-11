import React, { useState, useEffect } from "react";
import {
  useProTrackMPCMock as useProTrackMPC,
  Key,
} from "../hooks/useProTrackMPCMock";
import { keccak256, toUtf8Bytes } from "ethers";

interface KeyManagementProps {
  contractAddress: string;
}

export const KeyManagement: React.FC<KeyManagementProps> = ({
  contractAddress,
}) => {
  const { userRoles, userKeys, loading, createKey, getKey } =
    useProTrackMPC(contractAddress);

  const [keys, setKeys] = useState<Record<string, Key>>({});
  const [newKeyData, setNewKeyData] = useState({
    publicKey: "",
    threshold: 2,
    parties: [""],
    purpose: "",
  });
  const [isAdmin, setIsAdmin] = useState(false);

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

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const keyId = keccak256(toUtf8Bytes(`key_${Date.now()}`));
      const purposeHash = keccak256(toUtf8Bytes(newKeyData.purpose));

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
      <h2 className="text-2xl font-bold mb-4">Key Management</h2>

      {/* Key List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Your Keys</h3>
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
          <h3 className="text-xl font-semibold">Create New Key</h3>

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
            Create Key
          </button>
        </form>
      )}
    </div>
  );
};
