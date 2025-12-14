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
  Cpu,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Settings,
} from "lucide-react";

// Define types
interface SensorType {
  id: string;
  name: string;
  icon: JSX.Element;
  description: string;
  unit: string;
  category: string;
}

interface SensorDevice {
  id: string;
  name: string;
  type: string;
  status: string;
  batteryLevel: number;
  firmwareVersion: string;
  lastSeen: string;
  location: string;
  publicKey?: string;
  connectivity: string;
  alerts: number;
}

interface SensorReading {
  id: number;
  deviceId: string;
  deviceName: string;
  sensorType: string;
  value: number;
  unit: string;
  timestamp: string;
  location: string;
  alert?: boolean;
}

const SensorManagement = () => {
  const { isActive } = useWeb3();
  const [sensorTypes] = useState<SensorType[]>([
    {
      id: "temperature",
      name: "Temperature",
      icon: <Thermometer className="h-5 w-5 text-blue-500" />,
      description: "Measures ambient temperature",
      unit: "°C",
      category: "Environmental",
    },
    {
      id: "humidity",
      name: "Humidity",
      icon: <Droplets className="h-5 w-5 text-blue-400" />,
      description: "Measures relative humidity",
      unit: "%",
      category: "Environmental",
    },
    {
      id: "light",
      name: "Light Exposure",
      icon: <Sun className="h-5 w-5 text-yellow-500" />,
      description: "Measures light intensity",
      unit: "lux",
      category: "Environmental",
    },
    {
      id: "pressure",
      name: "Pressure",
      icon: <Weight className="h-5 w-5 text-gray-500" />,
      description: "Measures atmospheric pressure",
      unit: "kPa",
      category: "Environmental",
    },
    {
      id: "shock",
      name: "Shock/Vibration",
      icon: <Activity className="h-5 w-5 text-red-500" />,
      description: "Detects impacts and vibrations",
      unit: "g",
      category: "Motion",
    },
    {
      id: "tilt",
      name: "Tilt Angle",
      icon: <Activity className="h-5 w-5 text-purple-500" />,
      description: "Measures device orientation",
      unit: "degrees",
      category: "Motion",
    },
    {
      id: "gas",
      name: "Gas Detection",
      icon: <Activity className="h-5 w-5 text-green-500" />,
      description: "Detects flammable/toxic gases",
      unit: "ppm",
      category: "Specialized",
    },
    {
      id: "ph",
      name: "pH Sensor",
      icon: <Activity className="h-5 w-5 text-orange-500" />,
      description: "Measures acidity/alkalinity",
      unit: "pH",
      category: "Specialized",
    },
  ]);
  const [devices] = useState<SensorDevice[]>([
    {
      id: "DEV-TEMP-001",
      name: "Temperature Sensor #1",
      type: "temperature",
      status: "online",
      batteryLevel: 85,
      firmwareVersion: "v2.1.4",
      lastSeen: "2023-12-01 14:30:00",
      location: "Warehouse A, Bay 3",
      publicKey: "0x742d...a3b8",
      connectivity: "MQTT",
      alerts: 0,
    },
    {
      id: "DEV-HUM-001",
      name: "Humidity Sensor #1",
      type: "humidity",
      status: "online",
      batteryLevel: 92,
      firmwareVersion: "v1.9.2",
      lastSeen: "2023-12-01 14:29:45",
      location: "Warehouse A, Bay 3",
      publicKey: "0x35Cc...5329",
      connectivity: "HTTPS",
      alerts: 1,
    },
    {
      id: "DEV-SHOCK-001",
      name: "Shock Sensor #1",
      type: "shock",
      status: "offline",
      batteryLevel: 45,
      firmwareVersion: "v3.0.1",
      lastSeen: "2023-12-01 10:15:30",
      location: "Truck #12, Compartment 2",
      connectivity: "WebSocket",
      alerts: 3,
    },
  ]);
  const [sensorReadings] = useState<SensorReading[]>([
    {
      id: 1,
      deviceId: "DEV-TEMP-001",
      deviceName: "Temperature Sensor #1",
      sensorType: "temperature",
      value: 22.5,
      unit: "°C",
      timestamp: "2023-12-01 14:30:00",
      location: "Warehouse A, Bay 3",
    },
    {
      id: 2,
      deviceId: "DEV-HUM-001",
      deviceName: "Humidity Sensor #1",
      sensorType: "humidity",
      value: 45.2,
      unit: "%",
      timestamp: "2023-12-01 14:29:45",
      location: "Warehouse A, Bay 3",
      alert: true,
    },
    {
      id: 3,
      deviceId: "DEV-SHOCK-001",
      deviceName: "Shock Sensor #1",
      sensorType: "shock",
      value: 0.2,
      unit: "g",
      timestamp: "2023-12-01 10:15:30",
      location: "Truck #12, Compartment 2",
    },
  ]);

  // Refresh sensor data
  const refreshData = () => {
    // In a real app, this would fetch fresh data from IoT devices or backend
    console.log("Refreshing sensor data...");
    alert("Sensor data refreshed!");
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
            <AlertTriangle className="h-3 w-3 mr-1" />
            Offline
          </Badge>
        );
      case "maintenance":
        return (
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
            <Settings className="h-3 w-3 mr-1" />
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

  // Get sensor type icon
  const getSensorTypeIcon = (typeId: string) => {
    const sensorType = sensorTypes.find((st) => st.id === typeId);
    return sensorType ? (
      sensorType.icon
    ) : (
      <Cpu className="h-5 w-5 text-gray-500" />
    );
  };

  // Get sensor type name
  const getSensorTypeName = (typeId: string) => {
    const sensorType = sensorTypes.find((st) => st.id === typeId);
    return sensorType ? sensorType.name : "Unknown";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Sensor Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage IoT sensors and monitor environmental conditions
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
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
              Wallet not connected - Connect for full sensor integration
            </span>
          </div>
        </div>
      )}

      {/* Sensor Types Overview */}
      <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <Cpu className="h-5 w-5 mr-2 text-blue-500" />
            Supported Sensor Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {sensorTypes.map((sensorType) => (
              <Card
                key={sensorType.id}
                className="border border-gray-200 hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                      {sensorType.icon}
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">
                        {sensorType.name}
                      </h3>
                      <p className="text-xs text-gray-500">{sensorType.unit}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-600">
                    {sensorType.description}
                  </p>
                  <Badge className="mt-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-xs">
                    {sensorType.category}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sensor Devices */}
      <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <Wifi className="h-5 w-5 mr-2 text-blue-500" />
            Sensor Devices
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
                    Firmware
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Connectivity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Alerts
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {devices.map((device) => (
                  <tr key={device.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          {getSensorTypeIcon(device.type)}
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
                      {getSensorTypeName(device.type)}
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
                      v{device.firmwareVersion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {device.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
                        {device.connectivity}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {device.alerts > 0 ? (
                        <span className="font-bold text-red-600">
                          {device.alerts}
                        </span>
                      ) : (
                        <span className="text-gray-500">0</span>
                      )}
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
                    Sensor Type
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
                      {reading.deviceName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getSensorTypeName(reading.sensorType)}
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
                      {reading.alert ? (
                        <Badge className="bg-gradient-to-r from-red-500 to-rose-500">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Alert
                        </Badge>
                      ) : (
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Normal
                        </Badge>
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

export default SensorManagement;
