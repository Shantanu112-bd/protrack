import React, { useState, useEffect } from "react";
import { useWeb3 } from "../contexts/web3ContextTypes";
import {
  Thermometer,
  Droplets,
  MapPin,
  Battery,
  Wifi,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Sun,
  Lock,
} from "lucide-react";

interface SensorData {
  id: string;
  name: string;
  type:
    | "temperature"
    | "humidity"
    | "location"
    | "battery"
    | "pressure"
    | "light"
    | "shock"
    | "tilt"
    | "freeFall"
    | "nfc"
    | "seal"
    | "magnetic"
    | "gas"
    | "ph"
    | "moisture"
    | "co2"
    | "oxygen"
    | "gps"
    | "gnss"
    | "cell";
  value: number;
  unit: string;
  status: "normal" | "warning" | "critical";
  lastUpdated: Date;
  deviceId: string;
  firmwareVersion: string;
  publicKey: string;
  signed: boolean;
  signature?: string;
  minValue?: number;
  maxValue?: number;
  threshold?: number;
}

interface Device {
  id: string;
  name: string;
  type: string;
  status: "online" | "offline" | "maintenance";
  batteryLevel: number;
  signalStrength: number;
  lastSeen: Date;
  firmwareVersion: string;
  publicKey: string;
  location?: {
    latitude: number;
    longitude: number;
    timestamp: Date;
  };
  health: "good" | "degraded" | "critical";
  lastSync: Date;
  violationTimeline: ViolationEvent[];
}

interface ViolationEvent {
  id: string;
  timestamp: Date;
  type: string;
  value: number;
  threshold: number;
  severity: "low" | "medium" | "high" | "critical";
}

interface SensorHealth {
  batteryLife: number;
  lastSync: Date;
  firmwareVersion: string;
  violationTimeline: ViolationEvent[];
}

const SensorDashboard: React.FC = () => {
  const { isActive } = useWeb3();
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [sensorHealth, setSensorHealth] = useState<SensorHealth[]>([]);

  // Mock data for demonstration
  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setSensors([
        {
          id: "temp-001",
          name: "Warehouse Temperature",
          type: "temperature",
          value: 22.5,
          unit: "°C",
          status: "normal",
          lastUpdated: new Date(),
          deviceId: "dev-001",
          firmwareVersion: "v2.1.4",
          publicKey: "0x1234...5678",
          signed: true,
          minValue: 2.0,
          maxValue: 30.0,
          threshold: 25.0,
        },
        {
          id: "hum-001",
          name: "Storage Humidity",
          type: "humidity",
          value: 45.2,
          unit: "%",
          status: "normal",
          lastUpdated: new Date(),
          deviceId: "dev-002",
          firmwareVersion: "v1.9.2",
          publicKey: "0x2345...6789",
          signed: true,
          minValue: 30.0,
          maxValue: 70.0,
          threshold: 65.0,
        },
        {
          id: "press-001",
          name: "Pressure Sensor",
          type: "pressure",
          value: 101.3,
          unit: "kPa",
          status: "normal",
          lastUpdated: new Date(),
          deviceId: "dev-003",
          firmwareVersion: "v3.0.1",
          publicKey: "0x3456...7890",
          signed: true,
        },
        {
          id: "shock-001",
          name: "Shock Sensor",
          type: "shock",
          value: 0.2,
          unit: "g",
          status: "normal",
          lastUpdated: new Date(),
          deviceId: "dev-004",
          firmwareVersion: "v2.5.0",
          publicKey: "0x4567...8901",
          signed: true,
        },
        {
          id: "tilt-001",
          name: "Tilt Sensor",
          type: "tilt",
          value: 1.5,
          unit: "degrees",
          status: "normal",
          lastUpdated: new Date(),
          deviceId: "dev-005",
          firmwareVersion: "v1.8.3",
          publicKey: "0x5678...9012",
          signed: true,
        },
        {
          id: "gas-001",
          name: "Gas Detection",
          type: "gas",
          value: 0.0,
          unit: "ppm",
          status: "normal",
          lastUpdated: new Date(),
          deviceId: "dev-006",
          firmwareVersion: "v2.2.1",
          publicKey: "0x6789...0123",
          signed: true,
          threshold: 50.0,
        },
      ]);

      setDevices([
        {
          id: "dev-001",
          name: "Temperature Sensor #1",
          type: "Temperature",
          status: "online",
          batteryLevel: 87,
          signalStrength: 92,
          lastSeen: new Date(),
          firmwareVersion: "v2.1.4",
          publicKey: "0x1234...5678",
          health: "good",
          lastSync: new Date(),
          violationTimeline: [
            {
              id: "vt-001",
              timestamp: new Date(Date.now() - 86400000), // 1 day ago
              type: "temperature",
              value: 26.5,
              threshold: 25.0,
              severity: "medium",
            },
          ],
        },
        {
          id: "dev-002",
          name: "Humidity Sensor #1",
          type: "Humidity",
          status: "online",
          batteryLevel: 92,
          signalStrength: 88,
          lastSeen: new Date(),
          firmwareVersion: "v1.9.2",
          publicKey: "0x2345...6789",
          health: "good",
          lastSync: new Date(),
          violationTimeline: [],
        },
        {
          id: "dev-003",
          name: "Pressure Sensor #1",
          type: "Pressure",
          status: "offline",
          batteryLevel: 45,
          signalStrength: 0,
          lastSeen: new Date(Date.now() - 3600000), // 1 hour ago
          firmwareVersion: "v3.0.1",
          publicKey: "0x3456...7890",
          health: "critical",
          lastSync: new Date(Date.now() - 3600000),
          violationTimeline: [
            {
              id: "vt-002",
              timestamp: new Date(Date.now() - 7200000), // 2 hours ago
              type: "connection",
              value: 0,
              threshold: 1,
              severity: "high",
            },
          ],
        },
        {
          id: "dev-004",
          name: "Shock Sensor #1",
          type: "Shock",
          status: "online",
          batteryLevel: 78,
          signalStrength: 95,
          lastSeen: new Date(),
          firmwareVersion: "v2.5.0",
          publicKey: "0x4567...8901",
          health: "good",
          lastSync: new Date(),
          violationTimeline: [],
        },
        {
          id: "dev-005",
          name: "Tilt Sensor #1",
          type: "Tilt",
          status: "online",
          batteryLevel: 82,
          signalStrength: 89,
          lastSeen: new Date(),
          firmwareVersion: "v1.8.3",
          publicKey: "0x5678...9012",
          health: "good",
          lastSync: new Date(),
          violationTimeline: [],
        },
        {
          id: "dev-006",
          name: "Gas Sensor #1",
          type: "Gas",
          status: "online",
          batteryLevel: 95,
          signalStrength: 91,
          lastSeen: new Date(),
          firmwareVersion: "v2.2.1",
          publicKey: "0x6789...0123",
          health: "good",
          lastSync: new Date(),
          violationTimeline: [],
        },
      ]);

      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "normal":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "critical":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const getDeviceStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "offline":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "maintenance":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const getSensorIcon = (type: string) => {
    switch (type) {
      case "temperature":
        return <Thermometer className="w-6 h-6 text-blue-500" />;
      case "humidity":
        return <Droplets className="w-6 h-6 text-blue-400" />;
      case "location":
        return <MapPin className="w-6 h-6 text-green-500" />;
      case "battery":
        return <Battery className="w-6 h-6 text-yellow-500" />;
      case "pressure":
        return <Activity className="w-6 h-6 text-purple-500" />;
      case "light":
        return <Sun className="w-6 h-6 text-yellow-500" />;
      case "shock":
        return <Activity className="w-6 h-6 text-red-500" />;
      case "tilt":
        return <Activity className="w-6 h-6 text-orange-500" />;
      case "freeFall":
        return <Activity className="w-6 h-6 text-red-600" />;
      case "nfc":
        return <Wifi className="w-6 h-6 text-blue-600" />;
      case "seal":
        return <Lock className="w-6 h-6 text-gray-600" />;
      case "magnetic":
        return <Activity className="w-6 h-6 text-gray-700" />;
      case "gas":
        return <Activity className="w-6 h-6 text-red-400" />;
      case "ph":
        return <Activity className="w-6 h-6 text-green-600" />;
      case "moisture":
        return <Droplets className="w-6 h-6 text-blue-300" />;
      case "co2":
        return <Activity className="w-6 h-6 text-gray-500" />;
      case "oxygen":
        return <Droplets className="w-6 h-6 text-blue-200" />;
      case "gps":
      case "gnss":
      case "cell":
        return <MapPin className="w-6 h-6 text-green-600" />;
      default:
        return <Wifi className="w-6 h-6 text-gray-500" />;
    }
  };

  if (!isActive) {
    return (
      <div className="p-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mr-3" />
            <h3 className="text-lg font-medium text-yellow-800">
              Wallet Not Connected
            </h3>
          </div>
          <div className="mt-2 text-yellow-700">
            <p>Please connect your wallet to view IoT sensor data.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          IoT Sensor Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Monitor real-time sensor data from your supply chain
        </p>
      </div>

      {/* Sensor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {sensors.map((sensor) => (
          <div
            key={sensor.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              {getSensorIcon(sensor.type)}
              {getStatusIcon(sensor.status)}
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              {sensor.name}
            </h3>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {sensor.value}
              </span>
              <span className="ml-1 text-gray-500 dark:text-gray-400">
                {sensor.unit}
              </span>
            </div>
            {sensor.minValue !== undefined && sensor.maxValue !== undefined && (
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Range: {sensor.minValue} - {sensor.maxValue} {sensor.unit}
              </div>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Last updated: {sensor.lastUpdated.toLocaleTimeString()}
            </p>
          </div>
        ))}
      </div>

      {/* Device Status */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
          Device Status
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Device
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Battery
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Signal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Firmware
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Health
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Last Sync
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {devices.map((device) => (
                <tr key={device.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {device.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {device.id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {device.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getDeviceStatusIcon(device.status)}
                      <span className="ml-2 text-sm text-gray-900 dark:text-white capitalize">
                        {device.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Battery className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {device.batteryLevel}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Wifi className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {device.signalStrength}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    v{device.firmwareVersion}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {device.health === "good" && (
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      )}
                      {device.health === "degraded" && (
                        <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2" />
                      )}
                      {device.health === "critical" && (
                        <XCircle className="w-4 h-4 text-red-500 mr-2" />
                      )}
                      <span className="text-sm text-gray-900 dark:text-white capitalize">
                        {device.health}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {device.lastSync.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
          Recent Alerts
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                Violation Timeline
              </h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      <span className="font-medium">High Temperature</span> -
                      26.5°C exceeded threshold (25.0°C)
                    </p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400">
                      Device: dev-001 • 1 day ago
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <XCircle className="w-4 h-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      <span className="font-medium">Connection Lost</span> -
                      Device offline
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400">
                      Device: dev-003 • 2 hours ago
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <h3 className="font-medium text-green-800 dark:text-green-200 mb-2">
                Recent Events
              </h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      <span className="font-medium">Sensor Online</span> -
                      Temperature sensor reconnected
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      Device: dev-001 • 5 hours ago
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      <span className="font-medium">Data Synced</span> - All
                      sensors updated
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      10 minutes ago
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SensorDashboard;
