import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";
import { useWeb3 } from "../contexts/web3ContextTypes";
import IoTOracleService, {
  SensorReading,
  GPSLocation,
  SensorAlert,
} from "../services/IoTOracleService";

// Define types
interface IoTDashboardProps {
  tokenId?: number;
  isDark?: boolean;
}

interface Device {
  id: string;
  name: string;
  type: string;
  status: "online" | "offline" | "maintenance" | "error";
  firmwareVersion: string;
  publicKey: string;
  lastSeen: number;
  batteryLevel: number;
  signalStrength: number;
  location?: {
    latitude: number;
    longitude: number;
    timestamp: number;
  };
}

interface TelemetryData {
  id: string;
  deviceId: string;
  sensorType: string;
  value: number;
  unit: string;
  timestamp: number;
  signed: boolean;
  signature?: string;
}

interface AlertRule {
  id: string;
  name: string;
  sensorType: string;
  condition: string;
  threshold: number;
  severity: "low" | "medium" | "high" | "critical";
  enabled: boolean;
  notificationMethod: string[];
}

interface EdgeDevice {
  id: string;
  name: string;
  type: string;
  status: "online" | "offline" | "maintenance" | "error";
  firmwareVersion: string;
  publicKey: string;
  lastSeen: number;
  batteryLevel: number;
  signalStrength: number;
  location?: {
    latitude: number;
    longitude: number;
    timestamp: number;
  };
  processingCapacity: number;
  queuedData: number;
}

interface Gateway {
  id: string;
  name: string;
  ipAddress: string;
  status: "online" | "offline" | "maintenance" | "error";
  firmwareVersion: string;
  publicKey: string;
  lastSeen: number;
  connectedDevices: number;
  dataThroughput: number;
  queuedMessages: number;
}

const IoTDashboard: React.FC<IoTDashboardProps> = ({ tokenId }) => {
  // const { isActive, account } = useWeb3() // Not used in current implementation
  const oracleContract = null; // Placeholder for now
  const [sensorData, setSensorData] = useState<SensorReading[]>([]);
  // const [gpsHistory, setGpsHistory] = useState<GPSLocation[]>([]) // Not used in current implementation
  const [alerts, setAlerts] = useState<SensorAlert[]>([]);
  const [selectedTokenId, setSelectedTokenId] = useState<number>(tokenId || 1);
  // const [isLoading, setIsLoading] = useState(false) // Not used in current implementation
  const [simulationActive, setSimulationActive] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [devices, setDevices] = useState<Device[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetryData[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [edgeDevices, setEdgeDevices] = useState<EdgeDevice[]>([]);
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [userRole, setUserRole] = useState("admin");

  useEffect(() => {
    if (oracleContract) {
      IoTOracleService.initializeContracts(
        oracleContract.options.address,
        oracleContract.options.jsonInterface,
        "", // Supply chain address would be passed here
        []
      );
    }
  }, [oracleContract]);

  useEffect(() => {
    // Add alert listener
    const handleAlert = (alert: SensorAlert) => {
      setAlerts((prev) => [alert, ...prev].slice(0, 10)); // Keep only last 10 alerts
    };

    IoTOracleService.addAlertListener(handleAlert);

    return () => {
      IoTOracleService.removeAlertListener(handleAlert);
    };
  }, []);

  useEffect(() => {
    if (selectedTokenId) {
      loadSensorData();
    }

    // Load mock data for all IoT components
    loadMockIoTData();
  }, [selectedTokenId]);

  const loadMockIoTData = () => {
    // Mock devices
    setDevices([
      {
        id: "DEV-001",
        name: "Temperature Sensor #1",
        type: "temperature",
        status: "online",
        firmwareVersion: "v2.1.4",
        publicKey: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
        lastSeen: Date.now() - 300000, // 5 minutes ago
        batteryLevel: 85,
        signalStrength: 92,
        location: {
          latitude: 40.7128,
          longitude: -74.006,
          timestamp: Date.now(),
        },
      },
      {
        id: "DEV-002",
        name: "Humidity Sensor #1",
        type: "humidity",
        status: "online",
        firmwareVersion: "v1.9.2",
        publicKey: "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
        lastSeen: Date.now() - 120000, // 2 minutes ago
        batteryLevel: 72,
        signalStrength: 88,
      },
      {
        id: "DEV-003",
        name: "GPS Tracker #1",
        type: "gps",
        status: "offline",
        firmwareVersion: "v3.0.1",
        publicKey: "0x4 AfC13187D905C3B3A9b4C5E6F7G8H9I0J1K2L3M4",
        lastSeen: Date.now() - 3600000, // 1 hour ago
        batteryLevel: 45,
        signalStrength: 65,
        location: {
          latitude: 34.0522,
          longitude: -118.2437,
          timestamp: Date.now() - 3600000,
        },
      },
    ]);

    // Mock telemetry data
    const mockTelemetry: TelemetryData[] = [];
    for (let i = 0; i < 50; i++) {
      const timestamp = Date.now() - (50 - i) * 60000; // Every minute for last 50 minutes
      mockTelemetry.push({
        id: `TEL-${i}`,
        deviceId: `DEV-00${Math.floor(i % 3) + 1}`,
        sensorType: i % 2 === 0 ? "temperature" : "humidity",
        value: i % 2 === 0 ? 20 + Math.random() * 10 : 40 + Math.random() * 20,
        unit: i % 2 === 0 ? "°C" : "%",
        timestamp: timestamp,
        signed: Math.random() > 0.2,
        signature:
          Math.random() > 0.2
            ? `0x${Math.random().toString(16).substr(2, 64)}`
            : undefined,
      });
    }
    setTelemetry(mockTelemetry);

    // Mock alert rules
    setAlertRules([
      {
        id: "ALERT-001",
        name: "Temperature Threshold",
        sensorType: "temperature",
        condition: ">",
        threshold: 25,
        severity: "high",
        enabled: true,
        notificationMethod: ["email", "sms"],
      },
      {
        id: "ALERT-002",
        name: "Humidity Threshold",
        sensorType: "humidity",
        condition: ">",
        threshold: 70,
        severity: "medium",
        enabled: true,
        notificationMethod: ["email"],
      },
      {
        id: "ALERT-003",
        name: "Device Offline",
        sensorType: "connectivity",
        condition: "offline",
        threshold: 0,
        severity: "critical",
        enabled: true,
        notificationMethod: ["email", "sms", "webhook"],
      },
    ]);

    // Mock edge devices
    setEdgeDevices([
      {
        id: "EDGE-001",
        name: "Edge Gateway #1",
        type: "gateway",
        status: "online",
        firmwareVersion: "v1.2.3",
        publicKey: "0x1234567890123456789012345678901234567890",
        lastSeen: Date.now() - 60000, // 1 minute ago
        batteryLevel: 95,
        signalStrength: 98,
        location: {
          latitude: 40.7128,
          longitude: -74.006,
          timestamp: Date.now(),
        },
        processingCapacity: 85,
        queuedData: 12,
      },
      {
        id: "EDGE-002",
        name: "Edge Processor #1",
        type: "processor",
        status: "online",
        firmwareVersion: "v2.0.1",
        publicKey: "0x0987654321098765432109876543210987654321",
        lastSeen: Date.now() - 180000, // 3 minutes ago
        batteryLevel: 78,
        signalStrength: 91,
        processingCapacity: 65,
        queuedData: 8,
      },
    ]);

    // Mock gateways
    setGateways([
      {
        id: "GATE-001",
        name: "Main IoT Gateway",
        ipAddress: "192.168.1.100",
        status: "online",
        firmwareVersion: "v3.1.0",
        publicKey: "0xabcdef1234567890abcdef1234567890abcdef12",
        lastSeen: Date.now() - 30000, // 30 seconds ago
        connectedDevices: 42,
        dataThroughput: 1250,
        queuedMessages: 3,
      },
      {
        id: "GATE-002",
        name: "Backup IoT Gateway",
        ipAddress: "192.168.1.101",
        status: "maintenance",
        firmwareVersion: "v3.0.5",
        publicKey: "0xfedcba0987654321fedcba0987654321fedcba09",
        lastSeen: Date.now() - 7200000, // 2 hours ago
        connectedDevices: 0,
        dataThroughput: 0,
        queuedMessages: 0,
      },
    ]);
  };

  const loadSensorData = async () => {
    setIsLoading(true);
    try {
      const [sensorReadings, gpsData] = await Promise.all([
        IoTOracleService.getTokenSensorData(selectedTokenId),
        IoTOracleService.getTokenGPSHistory(selectedTokenId),
      ]);

      setSensorData(sensorReadings);
      setGpsHistory(gpsData);
    } catch (error) {
      console.error("Failed to load sensor data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const startSimulation = () => {
    setSimulationActive(true);
    IoTOracleService.simulateDeviceData(
      `device-${selectedTokenId}`,
      selectedTokenId
    );
  };

  const stopSimulation = () => {
    setSimulationActive(false);
    IoTOracleService.disconnectAllDevices();
  };

  const acknowledgeAlert = (index: number) => {
    setAlerts((prev) =>
      prev.map((alert, i) =>
        i === index ? { ...alert, acknowledged: true } : alert
      )
    );
  };

  // Process sensor data for charts
  const temperatureData = sensorData
    .filter((reading) => reading.sensorType === "temperature")
    .map((reading) => ({
      timestamp: new Date(reading.timestamp).toLocaleTimeString(),
      value: reading.value,
      time: reading.timestamp,
    }))
    .sort((a, b) => a.time - b.time)
    .slice(-20); // Last 20 readings

  const humidityData = sensorData
    .filter((reading) => reading.sensorType === "humidity")
    .map((reading) => ({
      timestamp: new Date(reading.timestamp).toLocaleTimeString(),
      value: reading.value,
      time: reading.timestamp,
    }))
    .sort((a, b) => a.time - b.time)
    .slice(-20); // Last 20 readings

  // Render dashboard tab
  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Device Status Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
              <svg
                className="w-6 h-6 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Devices
              </h3>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {devices.length}
              </p>
            </div>
          </div>
        </div>

        {/* Online Devices */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
              <svg
                className="w-6 h-6 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Online
              </h3>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {devices.filter((d) => d.status === "online").length}
              </p>
            </div>
          </div>
        </div>

        {/* Active Alerts */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900">
              <svg
                className="w-6 h-6 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Active Alerts
              </h3>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {alerts.filter((a) => !a.acknowledged).length}
              </p>
            </div>
          </div>
        </div>

        {/* Data Points */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
              <svg
                className="w-6 h-6 text-purple-600 dark:text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Data Points
              </h3>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {telemetry.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Temperature Readings
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={temperatureData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Humidity Readings
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={humidityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Recent Alerts
          </h3>
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
            View All
          </button>
        </div>
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Alert
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Device
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Severity
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Time
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {alerts.slice(0, 5).map((alert, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {alert.message}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {alert.message.includes("device")
                      ? "Device-001"
                      : "Sensor-001"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        alert.severity === "critical"
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          : alert.severity === "high"
                          ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                          : alert.severity === "medium"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {alert.acknowledged ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Acknowledged
                      </span>
                    ) : (
                      <button
                        onClick={() => acknowledgeAlert(index)}
                        className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800"
                      >
                        Acknowledge
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {alerts.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No recent alerts
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Render devices tab
  const renderDevices = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          IoT Devices
        </h3>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <svg
            className="-ml-1 mr-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Add Device
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map((device) => (
          <div
            key={device.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {device.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {device.type}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    device.status === "online"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : device.status === "offline"
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      : device.status === "maintenance"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  {device.status}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <svg
                    className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Last seen: {new Date(device.lastSeen).toLocaleString()}
                </div>

                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <svg
                    className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zM12.12 13.88a3 3 0 00-4.242 0 1 1 0 01-1.415-1.415 5 5 0 017.072 0 1 1 0 01-1.415 1.415zM9 16a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Firmware: {device.firmwareVersion}
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Battery
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {device.batteryLevel}%
                    </span>
                  </div>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div
                      className={`h-2 rounded-full ${
                        device.batteryLevel > 70
                          ? "bg-green-600"
                          : device.batteryLevel > 30
                          ? "bg-yellow-500"
                          : "bg-red-600"
                      }`}
                      style={{ width: `${device.batteryLevel}%` }}
                    ></div>
                  </div>
                </div>

                <div className="pt-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Signal
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {device.signalStrength}%
                    </span>
                  </div>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div
                      className={`h-2 rounded-full ${
                        device.signalStrength > 70
                          ? "bg-green-600"
                          : device.signalStrength > 30
                          ? "bg-yellow-500"
                          : "bg-red-600"
                      }`}
                      style={{ width: `${device.signalStrength}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <button className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <svg
                    className="-ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  View
                </button>
                <button className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <svg
                    className="-ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Configure
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render telemetry tab
  const renderTelemetry = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Telemetry Data
        </h3>
        <div className="flex space-x-3">
          <select className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option>All Devices</option>
            <option>Temperature Sensors</option>
            <option>Humidity Sensors</option>
            <option>GPS Trackers</option>
          </select>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <svg
              className="-ml-1 mr-2 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Device
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Sensor Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Value
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Timestamp
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Signed
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {telemetry.slice(0, 20).map((data) => (
                <tr
                  key={data.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {data.deviceId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {data.sensorType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {data.value.toFixed(2)} {data.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(data.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {data.signed ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Yes
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        No
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {telemetry.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No telemetry data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Telemetry Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Telemetry Trends
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={telemetry.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="deviceId" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name="Sensor Value" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  // Render alerting tab
  const renderAlerting = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Alert Rules
        </h3>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <svg
            className="-ml-1 mr-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Create Rule
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {alertRules.map((rule) => (
          <div
            key={rule.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {rule.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    When {rule.sensorType} {rule.condition} {rule.threshold}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      rule.severity === "critical"
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        : rule.severity === "high"
                        ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                        : rule.severity === "medium"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    }`}
                  >
                    {rule.severity}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={rule.enabled}
                      onChange={() => {}}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {rule.notificationMethod.map((method) => (
                  <span
                    key={method}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    {method}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex space-x-3">
                <button className="inline-flex justify-center items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <svg
                    className="-ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Edit
                </button>
                <button className="inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                  <svg
                    className="-ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render edge devices tab
  const renderEdgeDevices = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Edge Devices & Gateways
        </h3>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <svg
            className="-ml-1 mr-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Add Edge Device
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Edge Devices */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Edge Devices
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {edgeDevices.map((device) => (
              <div key={device.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-white">
                      {device.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {device.type}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      device.status === "online"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : device.status === "offline"
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        : device.status === "maintenance"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {device.status}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Firmware
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {device.firmwareVersion}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Last Seen
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(device.lastSeen).toLocaleTimeString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Battery
                    </p>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 mr-2">
                        <div
                          className={`h-2 rounded-full ${
                            device.batteryLevel > 70
                              ? "bg-green-600"
                              : device.batteryLevel > 30
                              ? "bg-yellow-500"
                              : "bg-red-600"
                          }`}
                          style={{ width: `${device.batteryLevel}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {device.batteryLevel}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Processing
                    </p>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 mr-2">
                        <div
                          className={`h-2 rounded-full ${
                            device.processingCapacity > 70
                              ? "bg-green-600"
                              : device.processingCapacity > 30
                              ? "bg-yellow-500"
                              : "bg-red-600"
                          }`}
                          style={{ width: `${device.processingCapacity}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {device.processingCapacity}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gateways */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Gateways
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {gateways.map((gateway) => (
              <div key={gateway.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-white">
                      {gateway.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {gateway.ipAddress}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      gateway.status === "online"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : gateway.status === "offline"
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        : gateway.status === "maintenance"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {gateway.status}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Firmware
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {gateway.firmwareVersion}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Last Seen
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(gateway.lastSeen).toLocaleTimeString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Devices
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {gateway.connectedDevices}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Throughput
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {gateway.dataThroughput} KB/s
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              IoT Dashboard
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Monitor and manage your IoT devices and sensor data
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="admin">Admin</option>
              <option value="manufacturer">Manufacturer</option>
              <option value="transporter">Transporter</option>
              <option value="retailer">Retailer</option>
              <option value="consumer">Consumer</option>
            </select>
            <button
              onClick={() => {
                setSelectedTokenId(tokenId || 1);
                loadSensorData();
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg
                className="-ml-1 mr-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "dashboard"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <svg
                className="inline-block w-5 h-5 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("devices")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "devices"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <svg
                className="inline-block w-5 h-5 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Devices
            </button>
            <button
              onClick={() => setActiveTab("telemetry")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "telemetry"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <svg
                className="inline-block w-5 h-5 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Telemetry
            </button>
            <button
              onClick={() => setActiveTab("alerting")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "alerting"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <svg
                className="inline-block w-5 h-5 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              Alerting
            </button>
            <button
              onClick={() => setActiveTab("edge")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "edge"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <svg
                className="inline-block w-5 h-5 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                />
              </svg>
              Edge & Gateways
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "dashboard" && renderDashboard()}
        {activeTab === "devices" && renderDevices()}
        {activeTab === "telemetry" && renderTelemetry()}
        {activeTab === "alerting" && renderAlerting()}
        {activeTab === "edge" && renderEdgeDevices()}

        {/* Simulation Controls */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Device Simulation
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {simulationActive
                  ? "Simulation is currently running. Sensor data is being generated."
                  : "Start simulation to generate mock sensor data."}
              </p>
            </div>
            <div className="flex space-x-3">
              {simulationActive ? (
                <button
                  onClick={stopSimulation}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <svg
                    className="-ml-1 mr-2 h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Stop Simulation
                </button>
              ) : (
                <button
                  onClick={startSimulation}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <svg
                    className="-ml-1 mr-2 h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Start Simulation
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IoTDashboard;
