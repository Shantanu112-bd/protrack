import React, { useState } from "react";
import { useWeb3 } from "../contexts/web3ContextTypes";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Thermometer,
  Droplets,
  Sun,
  Weight,
  Activity,
  Wifi,
  Battery,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MapPin,
  Cpu,
} from "lucide-react";

// Define types
interface SensorReading {
  id: number;
  deviceId: string;
  deviceType: string;
  timestamp: string;
  value: number;
  unit: string;
  location: string;
  status: string;
  alert?: string;
}

interface Device {
  id: string;
  name: string;
  type: string;
  status: string;
  lastSeen: string;
  batteryLevel: number;
  firmwareVersion: string;
  location: string;
}

interface Alert {
  id: number;
  deviceId: string;
  timestamp: string;
  type: string;
  message: string;
  severity: string;
  resolved: boolean;
}

const IoTMonitor = () => {
  const { isActive } = useWeb3();
  const [devices] = useState<Device[]>([
    {
      id: "DEV-TEMP-001",
      name: "Temperature Sensor #1",
      type: "Temperature",
      status: "online",
      lastSeen: "2023-12-01 14:30:00",
      batteryLevel: 85,
      firmwareVersion: "v2.1.4",
      location: "Warehouse A, Bay 3",
    },
    {
      id: "DEV-HUM-001",
      name: "Humidity Sensor #1",
      type: "Humidity",
      status: "online",
      lastSeen: "2023-12-01 14:29:45",
      batteryLevel: 92,
      firmwareVersion: "v1.9.2",
      location: "Warehouse A, Bay 3",
    },
    {
      id: "DEV-PRESS-001",
      name: "Pressure Sensor #1",
      type: "Pressure",
      status: "offline",
      lastSeen: "2023-12-01 10:15:30",
      batteryLevel: 45,
      firmwareVersion: "v3.0.1",
      location: "Truck #12, Compartment 2",
    },
    {
      id: "DEV-SHOCK-001",
      name: "Shock Sensor #1",
      type: "Shock",
      status: "online",
      lastSeen: "2023-12-01 14:30:15",
      batteryLevel: 78,
      firmwareVersion: "v2.5.0",
      location: "Container XYZ, Shelf 2",
    },
  ]);
  const [sensorReadings] = useState<SensorReading[]>([
    {
      id: 1,
      deviceId: "DEV-TEMP-001",
      deviceType: "Temperature",
      timestamp: "2023-12-01 14:30:00",
      value: 22.5,
      unit: "°C",
      location: "Warehouse A, Bay 3",
      status: "normal",
    },
    {
      id: 2,
      deviceId: "DEV-HUM-001",
      deviceType: "Humidity",
      timestamp: "2023-12-01 14:29:45",
      value: 45.2,
      unit: "%",
      location: "Warehouse A, Bay 3",
      status: "normal",
    },
    {
      id: 3,
      deviceId: "DEV-PRESS-001",
      deviceType: "Pressure",
      timestamp: "2023-12-01 10:15:30",
      value: 101.3,
      unit: "kPa",
      location: "Truck #12, Compartment 2",
      status: "offline",
    },
    {
      id: 4,
      deviceId: "DEV-SHOCK-001",
      deviceType: "Shock",
      timestamp: "2023-12-01 14:30:15",
      value: 0.2,
      unit: "g",
      location: "Container XYZ, Shelf 2",
      status: "normal",
    },
  ]);
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: 1,
      deviceId: "DEV-TEMP-002",
      timestamp: "2023-12-01 13:45:22",
      type: "Temperature",
      message: "Temperature exceeded threshold (32.5°C)",
      severity: "high",
      resolved: false,
    },
    {
      id: 2,
      deviceId: "DEV-HUM-003",
      timestamp: "2023-12-01 11:20:15",
      type: "Humidity",
      message: "Humidity dropped below minimum (25%)",
      severity: "medium",
      resolved: true,
    },
  ]);
  const [timeRange, setTimeRange] = useState("1h");

  // Refresh sensor data
  const refreshData = () => {
    // In a real app, this would fetch fresh data from IoT devices or backend
    console.log("Refreshing IoT data...");
    alert("IoT data refreshed!");
  };

  // Get device status badge
  const getDeviceStatusBadge = (status: string) => {
    switch (status) {
      case "online":
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Online
          </Badge>
        );
      case "offline":
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600">
            <XCircle className="h-3 w-3 mr-1" />
            Offline
          </Badge>
        );
      case "maintenance":
        return (
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
            <Activity className="h-3 w-3 mr-1" />
            Maintenance
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gradient-to-r from-gray-300 to-gray-500 hover:from-gray-400 hover:to-gray-600">
            {status}
          </Badge>
        );
    }
  };

  // Get alert severity badge
  const getAlertSeverityBadge = (severity: string) => {
    switch (severity) {
      case "low":
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500">
            Low
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
            Medium
          </Badge>
        );
      case "high":
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-rose-500">
            High
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gradient-to-r from-gray-300 to-gray-500">
            {severity}
          </Badge>
        );
    }
  };

  // Get sensor icon
  const getSensorIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "temperature":
        return <Thermometer className="h-5 w-5 text-blue-500" />;
      case "humidity":
        return <Droplets className="h-5 w-5 text-blue-400" />;
      case "light":
        return <Sun className="h-5 w-5 text-yellow-500" />;
      case "pressure":
        return <Weight className="h-5 w-5 text-gray-500" />;
      case "shock":
        return <Activity className="h-5 w-5 text-red-500" />;
      default:
        return <Cpu className="h-5 w-5 text-gray-500" />;
    }
  };

  // Resolve alert
  const resolveAlert = (id: number) => {
    setAlerts(
      alerts.map((alert) =>
        alert.id === id ? { ...alert, resolved: true } : alert
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            IoT Monitoring
          </h1>
          <p className="text-gray-600 mt-2">
            Real-time monitoring of environmental sensors and device status
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
          <Button
            onClick={refreshData}
            className="flex items-center bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Wallet connection warning */}
      {!isActive && (
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-4 text-center shadow-lg">
          <div className="flex items-center justify-center">
            <Wifi className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800 font-medium">
              Wallet not connected - Connect for full IoT integration features
            </span>
          </div>
        </div>
      )}

      {/* Sensor Dashboard Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-3">
                <Thermometer className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-600">
                  Avg Temperature
                </p>
                <p className="text-2xl font-bold text-gray-900">22.5°C</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-3">
                <Droplets className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-600">
                  Avg Humidity
                </p>
                <p className="text-2xl font-bold text-gray-900">45.2%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-600">
                  Online Devices
                </p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-red-100 p-3">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-red-600">
                  Active Alerts
                </p>
                <p className="text-2xl font-bold text-gray-900">1</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Device Status */}
      <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <Cpu className="h-5 w-5 mr-2 text-blue-500" />
            Device Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Device
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Battery
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Last Seen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {devices.map((device) => (
                  <tr key={device.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          {getSensorIcon(device.type)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {device.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {device.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {device.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getDeviceStatusBadge(device.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Battery className="h-4 w-4 text-gray-500 mr-1" />
                        <span className="text-sm text-gray-900">
                          {device.batteryLevel}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                        {device.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {device.lastSeen}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Sensor Readings */}
      <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <Activity className="h-5 w-5 mr-2 text-blue-500" />
            Recent Sensor Readings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Device
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sensorReadings.map((reading) => (
                  <tr key={reading.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {reading.deviceId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {reading.deviceType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reading.value} {reading.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {reading.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {reading.timestamp}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getDeviceStatusBadge(reading.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <AlertTriangle className="h-5 w-5 mr-2 text-blue-500" />
            Active Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Device
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {alerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {alert.deviceId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {alert.type}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {alert.message}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getAlertSeverityBadge(alert.severity)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {alert.timestamp}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {alert.resolved ? (
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500">
                          Resolved
                        </Badge>
                      ) : (
                        <div className="flex space-x-2">
                          <Badge className="bg-gradient-to-r from-red-500 to-rose-500">
                            Active
                          </Badge>
                          <Button
                            onClick={() => resolveAlert(alert.id)}
                            size="sm"
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                          >
                            Resolve
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IoTMonitor;
