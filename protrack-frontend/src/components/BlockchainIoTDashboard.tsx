import React, { useState, useEffect } from "react";
import { useBlockchain } from "../contexts/BlockchainContext";
import { useWeb3 } from "../contexts/web3ContextTypes";
import OracleService from "../services/oracleService";

interface BlockchainIoTDashboardProps {
  isDark: boolean;
}

const BlockchainIoTDashboard: React.FC<BlockchainIoTDashboardProps> = ({
  isDark,
}) => {
  const { submitIoTData, submitGPSData, verifyIoTData, monitorSLA } =
    useBlockchain();
  const { isActive: isConnected } = useWeb3();
  const [iotData, setIoTData] = useState<any[]>([]);
  const [gpsData, setGpsData] = useState<any[]>([]);
  const [slaStatus, setSlaStatus] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Generate demo IoT data with blockchain verification
    const generateDemoData = () => {
      const devices = ["TEMP-001", "HUM-002", "GPS-003", "VIB-004"];
      const sensorTypes = [
        "temperature",
        "humidity",
        "pressure",
        "vibration",
      ] as const;

      const newIoTData = devices.map((deviceId, index) =>
        OracleService.generateDemoIoTData(deviceId, sensorTypes[index])
      );

      const newGpsData = Array.from({ length: 3 }, (_, i) =>
        OracleService.generateDemoGPSData(`SHIP-${i + 1}`)
      );

      setIoTData(newIoTData);
      setGpsData(newGpsData);
    };

    generateDemoData();
    const interval = setInterval(generateDemoData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleSubmitIoTData = async (
    deviceId: string,
    sensorType: string,
    value: number
  ) => {
    if (!isConnected) return;

    try {
      setIsSubmitting(true);
      await submitIoTData({
        deviceId,
        sensorType: sensorType as any,
        value,
        unit: getUnit(sensorType),
        timestamp: Math.floor(Date.now() / 1000),
      });
    } catch (error) {
      console.error("Error submitting IoT data:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMonitorSLA = async () => {
    if (!isConnected) return;

    try {
      const result = await monitorSLA("SHIP-001", {
        maxTemperature: 8,
        minTemperature: 2,
        maxDeliveryTime: 86400, // 24 hours
        requiredLocation: { lat: 40.7128, lon: -74.006, radius: 10 },
      });
      setSlaStatus(result);
    } catch (error) {
      console.error("Error monitoring SLA:", error);
    }
  };

  const getUnit = (sensorType: string) => {
    const units: Record<string, string> = {
      temperature: "°C",
      humidity: "%",
      pressure: "hPa",
      vibration: "g",
      light: "lux",
    };
    return units[sensorType] || "";
  };

  const getSensorIcon = (sensorType: string) => {
    const icons: Record<string, string> = {
      temperature: "🌡️",
      humidity: "💧",
      pressure: "🔘",
      vibration: "📳",
      light: "💡",
    };
    return icons[sensorType] || "📡";
  };

  const getValueColor = (
    sensorType: string,
    value: number,
    verified: boolean
  ) => {
    if (!verified) return "text-red-500";

    // Define safe ranges
    const ranges: Record<string, { min: number; max: number }> = {
      temperature: { min: 2, max: 8 },
      humidity: { min: 40, max: 70 },
      pressure: { min: 1000, max: 1030 },
      vibration: { min: 0, max: 5 },
    };

    const range = ranges[sensorType];
    if (!range) return "text-blue-500";

    if (value < range.min || value > range.max) return "text-red-500";
    return "text-green-500";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2
            className={`text-3xl font-bold ${
              isDark ? "text-white" : "text-gray-900"
            } mb-2`}
          >
            🔗 Blockchain IoT Dashboard
          </h2>
          <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
            Real-time sensor data with blockchain verification and oracle
            integration
          </p>
        </div>
        <button
          onClick={handleMonitorSLA}
          disabled={!isConnected}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
        >
          <span>⚡</span>
          <span>Monitor SLA</span>
        </button>
      </div>

      {!isConnected && (
        <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
          <p
            className={`${
              isDark ? "text-yellow-200" : "text-yellow-800"
            } text-center`}
          >
            Connect your wallet to submit IoT data to the blockchain
          </p>
        </div>
      )}

      {/* IoT Sensors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {iotData.map((sensor, index) => (
          <div
            key={sensor.deviceId}
            className={`${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } rounded-xl p-6 shadow-sm border`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">
                  {getSensorIcon(sensor.sensorType)}
                </span>
                <div>
                  <h3
                    className={`font-semibold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {sensor.sensorType.charAt(0).toUpperCase() +
                      sensor.sensorType.slice(1)}
                  </h3>
                  <p
                    className={`text-xs ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {sensor.deviceId}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    sensor.verified ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <span
                  className={`text-xs ${
                    sensor.verified ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {sensor.verified ? "Verified" : "Unverified"}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <span
                className={`text-3xl font-bold ${getValueColor(
                  sensor.sensorType,
                  sensor.value,
                  sensor.verified
                )}`}
              >
                {sensor.value}
              </span>
              <span
                className={`text-lg ${
                  isDark ? "text-gray-400" : "text-gray-500"
                } ml-1`}
              >
                {sensor.unit}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className={isDark ? "text-gray-400" : "text-gray-500"}>
                  Last Update:
                </span>
                <span className={isDark ? "text-white" : "text-gray-900"}>
                  {new Date(sensor.timestamp * 1000).toLocaleTimeString()}
                </span>
              </div>
              {sensor.verified && sensor.txHash && (
                <div className="flex justify-between">
                  <span className={isDark ? "text-gray-400" : "text-gray-500"}>
                    Tx Hash:
                  </span>
                  <span
                    className={`font-mono ${
                      isDark ? "text-blue-400" : "text-blue-600"
                    }`}
                  >
                    {sensor.txHash.slice(0, 8)}...
                  </span>
                </div>
              )}
              {sensor.verified && sensor.blockNumber && (
                <div className="flex justify-between">
                  <span className={isDark ? "text-gray-400" : "text-gray-500"}>
                    Block:
                  </span>
                  <span className={isDark ? "text-white" : "text-gray-900"}>
                    #{sensor.blockNumber.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() =>
                handleSubmitIoTData(
                  sensor.deviceId,
                  sensor.sensorType,
                  sensor.value
                )
              }
              disabled={!isConnected || isSubmitting}
              className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit to Blockchain"}
            </button>
          </div>
        ))}
      </div>

      {/* GPS Tracking */}
      <div
        className={`${
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } rounded-xl p-6 shadow-sm border mb-8`}
      >
        <div className="flex items-center justify-between mb-6">
          <h3
            className={`text-xl font-semibold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            🗺️ GPS Tracking with Blockchain Verification
          </h3>
          <span className="text-2xl">🛰️</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {gpsData.map((gps, index) => (
            <div
              key={gps.shipmentId}
              className={`${
                isDark ? "bg-gray-700" : "bg-gray-50"
              } rounded-lg p-4`}
            >
              <div className="flex items-center justify-between mb-3">
                <h4
                  className={`font-semibold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {gps.shipmentId}
                </h4>
                <div
                  className={`w-3 h-3 rounded-full ${
                    gps.verified ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={isDark ? "text-gray-400" : "text-gray-500"}>
                    Latitude:
                  </span>
                  <span
                    className={`font-mono ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {gps.latitude.toFixed(6)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? "text-gray-400" : "text-gray-500"}>
                    Longitude:
                  </span>
                  <span
                    className={`font-mono ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {gps.longitude.toFixed(6)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? "text-gray-400" : "text-gray-500"}>
                    Status:
                  </span>
                  <span
                    className={`${
                      gps.verified ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {gps.verified
                      ? "Blockchain Verified"
                      : "Pending Verification"}
                  </span>
                </div>
                {gps.verified && gps.txHash && (
                  <div className="flex justify-between">
                    <span
                      className={isDark ? "text-gray-400" : "text-gray-500"}
                    >
                      Tx:
                    </span>
                    <span
                      className={`font-mono text-xs ${
                        isDark ? "text-blue-400" : "text-blue-600"
                      }`}
                    >
                      {gps.txHash.slice(0, 12)}...
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SLA Monitoring Results */}
      {slaStatus && (
        <div
          className={`${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          } rounded-xl p-6 shadow-sm border`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className={`text-xl font-semibold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              📋 Smart Contract SLA Monitoring
            </h3>
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                slaStatus.compliant
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {slaStatus.compliant ? "Compliant" : "Violations Detected"}
            </div>
          </div>

          {slaStatus.violations.length > 0 && (
            <div className="space-y-2 mb-4">
              <h4
                className={`font-medium ${
                  isDark ? "text-red-400" : "text-red-600"
                }`}
              >
                Violations:
              </h4>
              {slaStatus.violations.map((violation: string, index: number) => (
                <div
                  key={index}
                  className={`flex items-center space-x-2 ${
                    isDark ? "text-red-300" : "text-red-700"
                  }`}
                >
                  <span>⚠️</span>
                  <span className="text-sm">{violation}</span>
                </div>
              ))}
            </div>
          )}

          {slaStatus.penaltyAmount && (
            <div
              className={`${
                isDark
                  ? "bg-red-900/20 border-red-700"
                  : "bg-red-50 border-red-200"
              } border rounded-lg p-4`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`font-medium ${
                    isDark ? "text-red-400" : "text-red-800"
                  }`}
                >
                  Penalty Amount:
                </span>
                <span
                  className={`text-lg font-bold ${
                    isDark ? "text-red-400" : "text-red-800"
                  }`}
                >
                  {slaStatus.penaltyAmount} ETH
                </span>
              </div>
              <p
                className={`text-sm mt-2 ${
                  isDark ? "text-red-300" : "text-red-700"
                }`}
              >
                Smart contract will automatically deduct penalty from escrow
              </p>
            </div>
          )}

          {slaStatus.compliant && (
            <div
              className={`${
                isDark
                  ? "bg-green-900/20 border-green-700"
                  : "bg-green-50 border-green-200"
              } border rounded-lg p-4`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✅</span>
                <span
                  className={`font-medium ${
                    isDark ? "text-green-400" : "text-green-800"
                  }`}
                >
                  All SLA conditions are being met
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BlockchainIoTDashboard;
