import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useEnhancedWeb3 } from "../contexts/EnhancedWeb3Context";
import IoTOracleService, {
  SensorReading,
  GPSLocation,
  SensorAlert,
} from "../services/IoTOracleService";
import ProductTrackingMap from "./map/ProductTrackingMap";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface IoTVisualizationProps {
  tokenId?: number;
  isDark?: boolean;
}

interface ChartDataPoint {
  timestamp: string;
  value: number;
  time: number;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const IoTVisualization: React.FC<IoTVisualizationProps> = ({
  tokenId,
  isDark = false,
}) => {
  const { isConnected, oracleContract } = useEnhancedWeb3();
  const [sensorData, setSensorData] = useState<SensorReading[]>([]);
  const [gpsHistory, setGpsHistory] = useState<GPSLocation[]>([]);
  const [alerts, setAlerts] = useState<SensorAlert[]>([]);
  const [selectedTokenId, setSelectedTokenId] = useState<number>(tokenId || 1);
  const [isLoading, setIsLoading] = useState(false);
  const [simulationActive, setSimulationActive] = useState(false);
  const [timeRange, setTimeRange] = useState<"1h" | "6h" | "24h" | "7d">("24h");

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
  }, [selectedTokenId, timeRange]);

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

  // Filter data based on time range
  const filterDataByTimeRange = (data: ChartDataPoint[], range: string) => {
    const now = Date.now();
    let timeThreshold = now;

    switch (range) {
      case "1h":
        timeThreshold = now - 60 * 60 * 1000;
        break;
      case "6h":
        timeThreshold = now - 6 * 60 * 60 * 1000;
        break;
      case "24h":
        timeThreshold = now - 24 * 60 * 60 * 1000;
        break;
      case "7d":
        timeThreshold = now - 7 * 24 * 60 * 60 * 1000;
        break;
    }

    return data.filter((item) => item.time >= timeThreshold);
  };

  // Process sensor data for charts
  const temperatureChartData: ChartDataPoint[] = sensorData
    .filter((reading) => reading.sensorType === "temperature")
    .map((reading) => ({
      timestamp: new Date(reading.timestamp).toLocaleTimeString(),
      value: reading.value,
      time: reading.timestamp,
    }))
    .sort((a, b) => a.time - b.time);

  const humidityChartData: ChartDataPoint[] = sensorData
    .filter((reading) => reading.sensorType === "humidity")
    .map((reading) => ({
      timestamp: new Date(reading.timestamp).toLocaleTimeString(),
      value: reading.value,
      time: reading.timestamp,
    }))
    .sort((a, b) => a.time - b.time);

  const vibrationChartData: ChartDataPoint[] = sensorData
    .filter((reading) => reading.sensorType === "vibration")
    .map((reading) => ({
      timestamp: new Date(reading.timestamp).toLocaleTimeString(),
      value: reading.value,
      time: reading.timestamp,
    }))
    .sort((a, b) => a.time - b.time);

  const temperatureData: ChartDataPoint[] = filterDataByTimeRange(
    temperatureChartData,
    timeRange
  ) as ChartDataPoint[];

  const humidityData: ChartDataPoint[] = filterDataByTimeRange(
    humidityChartData,
    timeRange
  ) as ChartDataPoint[];

  const vibrationData: ChartDataPoint[] = filterDataByTimeRange(
    vibrationChartData,
    timeRange
  ) as ChartDataPoint[];

  // Sensor type distribution data
  const sensorTypeData = [
    { name: "Temperature", value: temperatureData.length },
    { name: "Humidity", value: humidityData.length },
    { name: "Vibration", value: vibrationData.length },
  ];

  // Get latest sensor values
  const latestTemperature =
    (temperatureData as ChartDataPoint[])[temperatureData.length - 1]?.value ||
    0;
  const latestHumidity =
    (humidityData as ChartDataPoint[])[humidityData.length - 1]?.value || 0;
  const latestVibration =
    (vibrationData as ChartDataPoint[])[vibrationData.length - 1]?.value || 0;
  const latestGPS = gpsHistory[gpsHistory.length - 1];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1
            className={`text-3xl font-bold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            IoT Visualization Dashboard
          </h1>
          <p className={`${isDark ? "text-gray-300" : "text-gray-600"} mt-1`}>
            Real-time monitoring of product conditions and location tracking
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Label
              className={`text-sm font-medium ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Token ID
            </Label>
            <Input
              type="number"
              value={selectedTokenId}
              onChange={(e) =>
                setSelectedTokenId(parseInt(e.target.value) || 1)
              }
              className={`w-24 ${
                isDark
                  ? "bg-gray-800 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
              min="1"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Label
              className={`text-sm font-medium ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Time Range
            </Label>
            <Select
              value={timeRange}
              onValueChange={(value: "1h" | "6h" | "24h" | "7d") =>
                setTimeRange(value)
              }
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1 Hour</SelectItem>
                <SelectItem value="6h">6 Hours</SelectItem>
                <SelectItem value="24h">24 Hours</SelectItem>
                <SelectItem value="7d">7 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={simulationActive ? stopSimulation : startSimulation}
              variant={simulationActive ? "destructive" : "default"}
            >
              {simulationActive ? "Stop Simulation" : "Start Simulation"}
            </Button>

            <Button
              onClick={loadSensorData}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? "Loading..." : "Refresh"}
            </Button>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      <div
        className={`p-4 rounded-lg ${isDark ? "bg-gray-800" : "bg-gray-50"}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <span
              className={`font-medium ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Blockchain Connection:{" "}
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <div
              className={`w-3 h-3 rounded-full ${
                simulationActive ? "bg-green-500 animate-pulse" : "bg-gray-400"
              }`}
            ></div>
            <span
              className={`font-medium ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              IoT Simulation: {simulationActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className={isDark ? "bg-gray-800 border-gray-700" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className={isDark ? "text-white" : "text-gray-900"}>
              Temperature
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-3xl font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {latestTemperature.toFixed(1)}°C
                </p>
                <p
                  className={`text-sm ${
                    latestTemperature < -20 || latestTemperature > 40
                      ? "text-red-500"
                      : "text-green-500"
                  }`}
                >
                  {latestTemperature < -20 || latestTemperature > 40
                    ? "Out of range"
                    : "Normal range"}
                </p>
              </div>
              <div
                className={`p-3 rounded-full ${
                  latestTemperature < -20 || latestTemperature > 40
                    ? "bg-red-100 text-red-600"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                🌡️
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={isDark ? "bg-gray-800 border-gray-700" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className={isDark ? "text-white" : "text-gray-900"}>
              Humidity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-3xl font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {latestHumidity.toFixed(1)}%
                </p>
                <p
                  className={`text-sm ${
                    latestHumidity < 0 || latestHumidity > 95
                      ? "text-red-500"
                      : "text-green-500"
                  }`}
                >
                  {latestHumidity < 0 || latestHumidity > 95
                    ? "Out of range"
                    : "Normal range"}
                </p>
              </div>
              <div
                className={`p-3 rounded-full ${
                  latestHumidity < 0 || latestHumidity > 95
                    ? "bg-red-100 text-red-600"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                💧
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={isDark ? "bg-gray-800 border-gray-700" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className={isDark ? "text-white" : "text-gray-900"}>
              Vibration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-3xl font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {latestVibration.toFixed(0)}
                </p>
                <p
                  className={`text-sm ${
                    latestVibration > 100 ? "text-red-500" : "text-green-500"
                  }`}
                >
                  {latestVibration > 100 ? "High vibration" : "Normal"}
                </p>
              </div>
              <div
                className={`p-3 rounded-full ${
                  latestVibration > 100
                    ? "bg-red-100 text-red-600"
                    : "bg-green-100 text-green-600"
                }`}
              >
                📳
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={isDark ? "bg-gray-800 border-gray-700" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className={isDark ? "text-white" : "text-gray-900"}>
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-lg font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {latestGPS
                    ? `${latestGPS.latitude.toFixed(
                        4
                      )}, ${latestGPS.longitude.toFixed(4)}`
                    : "No GPS data"}
                </p>
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {latestGPS
                    ? `Accuracy: ${latestGPS.accuracy}m`
                    : "GPS not available"}
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                📍
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map and Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Tracking Map */}
        <Card className={isDark ? "bg-gray-800 border-gray-700" : ""}>
          <CardHeader>
            <CardTitle className={isDark ? "text-white" : "text-gray-900"}>
              Product Location Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ProductTrackingMap />
            </div>
          </CardContent>
        </Card>

        {/* Sensor Type Distribution */}
        <Card className={isDark ? "bg-gray-800 border-gray-700" : ""}>
          <CardHeader>
            <CardTitle className={isDark ? "text-white" : "text-gray-900"}>
              Sensor Data Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sensorTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {sensorTypeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Charts */}
      <Tabs defaultValue="temperature" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="temperature">Temperature</TabsTrigger>
          <TabsTrigger value="humidity">Humidity</TabsTrigger>
          <TabsTrigger value="vibration">Vibration</TabsTrigger>
        </TabsList>

        <TabsContent value="temperature">
          <Card className={isDark ? "bg-gray-800 border-gray-700" : ""}>
            <CardHeader>
              <CardTitle className={isDark ? "text-white" : "text-gray-900"}>
                Temperature Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={temperatureData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? "#374151" : "#e5e7eb"}
                  />
                  <XAxis
                    dataKey="timestamp"
                    stroke={isDark ? "#9ca3af" : "#6b7280"}
                    fontSize={12}
                  />
                  <YAxis
                    stroke={isDark ? "#9ca3af" : "#6b7280"}
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? "#1f2937" : "#ffffff",
                      border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                      borderRadius: "8px",
                      color: isDark ? "#ffffff" : "#000000",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                    name="Temperature (°C)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="humidity">
          <Card className={isDark ? "bg-gray-800 border-gray-700" : ""}>
            <CardHeader>
              <CardTitle className={isDark ? "text-white" : "text-gray-900"}>
                Humidity Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={humidityData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? "#374151" : "#e5e7eb"}
                  />
                  <XAxis
                    dataKey="timestamp"
                    stroke={isDark ? "#9ca3af" : "#6b7280"}
                    fontSize={12}
                  />
                  <YAxis
                    stroke={isDark ? "#9ca3af" : "#6b7280"}
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? "#1f2937" : "#ffffff",
                      border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                      borderRadius: "8px",
                      color: isDark ? "#ffffff" : "#000000",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                    strokeWidth={2}
                    name="Humidity (%)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vibration">
          <Card className={isDark ? "bg-gray-800 border-gray-700" : ""}>
            <CardHeader>
              <CardTitle className={isDark ? "text-white" : "text-gray-900"}>
                Vibration Levels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={vibrationData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? "#374151" : "#e5e7eb"}
                  />
                  <XAxis
                    dataKey="timestamp"
                    stroke={isDark ? "#9ca3af" : "#6b7280"}
                    fontSize={12}
                  />
                  <YAxis
                    stroke={isDark ? "#9ca3af" : "#6b7280"}
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? "#1f2937" : "#ffffff",
                      border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                      borderRadius: "8px",
                      color: isDark ? "#ffffff" : "#000000",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="value" fill="#f59e0b" name="Vibration Level" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Alerts Panel */}
      {alerts.length > 0 && (
        <Card className={isDark ? "bg-gray-800 border-gray-700" : ""}>
          <CardHeader>
            <CardTitle className={isDark ? "text-white" : "text-gray-900"}>
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    alert.severity === "critical"
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : alert.severity === "high"
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                      : alert.severity === "medium"
                      ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                      : "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  } ${alert.acknowledged ? "opacity-50" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`font-semibold ${
                            alert.severity === "critical"
                              ? "text-red-700 dark:text-red-300"
                              : alert.severity === "high"
                              ? "text-orange-700 dark:text-orange-300"
                              : alert.severity === "medium"
                              ? "text-yellow-700 dark:text-yellow-300"
                              : "text-blue-700 dark:text-blue-300"
                          }`}
                        >
                          {alert.alertType.replace("_", " ")}
                        </span>
                        <Badge
                          variant={
                            alert.severity === "critical"
                              ? "destructive"
                              : alert.severity === "high"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {alert.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <p
                        className={`text-sm mt-1 ${
                          isDark ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {alert.message}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>

                    {!alert.acknowledged && (
                      <Button
                        onClick={() => acknowledgeAlert(index)}
                        variant="outline"
                        size="sm"
                      >
                        Acknowledge
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IoTVisualization;
