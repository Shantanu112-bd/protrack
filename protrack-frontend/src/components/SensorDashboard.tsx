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
} from "lucide-react";

interface SensorData {
  id: string;
  name: string;
  type: "temperature" | "humidity" | "location" | "battery";
  value: number;
  unit: string;
  status: "normal" | "warning" | "critical";
  lastUpdated: Date;
}

interface Device {
  id: string;
  name: string;
  status: "online" | "offline" | "maintenance";
  batteryLevel: number;
  signalStrength: number;
  lastSeen: Date;
}

const SensorDashboard: React.FC = () => {
  const { isActive } = useWeb3();
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

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
        },
        {
          id: "hum-001",
          name: "Storage Humidity",
          type: "humidity",
          value: 45.2,
          unit: "%",
          status: "normal",
          lastUpdated: new Date(),
        },
        {
          id: "loc-001",
          name: "Asset Location",
          type: "location",
          value: 0,
          unit: "coordinates",
          status: "normal",
          lastUpdated: new Date(),
        },
        {
          id: "bat-001",
          name: "Device Battery",
          type: "battery",
          value: 87,
          unit: "%",
          status: "normal",
          lastUpdated: new Date(),
        },
      ]);

      setDevices([
        {
          id: "dev-001",
          name: "Temperature Sensor #1",
          status: "online",
          batteryLevel: 87,
          signalStrength: 92,
          lastSeen: new Date(),
        },
        {
          id: "dev-002",
          name: "Humidity Sensor #1",
          status: "online",
          batteryLevel: 92,
          signalStrength: 88,
          lastSeen: new Date(),
        },
        {
          id: "dev-003",
          name: "GPS Tracker #1",
          status: "offline",
          batteryLevel: 45,
          signalStrength: 0,
          lastSeen: new Date(Date.now() - 3600000), // 1 hour ago
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
            <h3 className="text-lg font-medium text-yellow-800">Wallet Not Connected</h3>
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
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">IoT Sensor Dashboard</h1>
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
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Battery
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Signal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Last Seen
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
                    {device.lastSeen.toLocaleString()}
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
          <div className="flex items-start p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
                High Temperature Alert
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Warehouse temperature exceeded threshold at 14:32
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                2 hours ago
              </p>
            </div>
          </div>
          <div className="flex items-start p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-green-800 dark:text-green-200">
                Sensor Online
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                Temperature sensor #1 reconnected successfully
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                5 hours ago
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SensorDashboard;