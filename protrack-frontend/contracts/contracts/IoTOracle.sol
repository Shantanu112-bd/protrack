// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./SupplyChainEscrow.sol";

/**
 * @title IoTOracle
 * @dev Oracle contract for IoT sensor data verification and automated SLA monitoring
 */
contract IoTOracle is AccessControl, ReentrancyGuard {
    using Counters for Counters.Counter;

    bytes32 public constant ORACLE_OPERATOR_ROLE = keccak256("ORACLE_OPERATOR_ROLE");
    bytes32 public constant DEVICE_MANAGER_ROLE = keccak256("DEVICE_MANAGER_ROLE");
    bytes32 public constant DATA_PROVIDER_ROLE = keccak256("DATA_PROVIDER_ROLE");

    SupplyChainEscrow public immutable escrowContract;
    Counters.Counter private _dataPointIdCounter;

    enum SensorType {
        TEMPERATURE,
        HUMIDITY,
        PRESSURE,
        VIBRATION,
        LIGHT,
        GPS,
        RFID,
        CUSTOM
    }

    enum DataStatus {
        PENDING,
        VERIFIED,
        REJECTED,
        DISPUTED
    }

    struct IoTDevice {
        string deviceId;
        address owner;
        SensorType[] supportedSensors;
        bool isActive;
        uint256 registeredAt;
        string location;
        string metadata;
        uint256 lastDataSubmission;
    }

    struct IoTDataPoint {
        uint256 id;
        string deviceId;
        SensorType sensorType;
        int256 value;
        string unit;
        uint256 timestamp;
        string location;
        address submitter;
        DataStatus status;
        uint256 verifiedAt;
        address verifier;
        string metadata;
    }

    struct SLAMonitor {
        uint256 escrowId;
        string deviceId;
        SensorType sensorType;
        int256 minThreshold;
        int256 maxThreshold;
        uint256 checkInterval;
        uint256 lastCheck;
        bool isActive;
        uint256 violationCount;
    }

    struct AggregatedData {
        int256 minValue;
        int256 maxValue;
        int256 avgValue;
        uint256 dataPointCount;
        uint256 lastUpdated;
    }

    // Mappings
    mapping(string => IoTDevice) public devices;
    mapping(uint256 => IoTDataPoint) public dataPoints;
    mapping(string => uint256[]) public deviceDataPoints;
    mapping(uint256 => SLAMonitor[]) public escrowSLAMonitors;
    mapping(string => mapping(SensorType => AggregatedData)) public aggregatedData;
    mapping(string => mapping(uint256 => bool)) public dataPointExists;

    // Arrays for enumeration
    string[] public registeredDevices;
    uint256[] public allDataPoints;

    // Events
    event DeviceRegistered(string indexed deviceId, address indexed owner, SensorType[] supportedSensors);
    event DeviceStatusChanged(string indexed deviceId, bool isActive);
    event DataPointSubmitted(uint256 indexed dataPointId, string indexed deviceId, SensorType sensorType, int256 value);
    event DataPointVerified(uint256 indexed dataPointId, address indexed verifier, DataStatus status);
    event SLAMonitorCreated(uint256 indexed escrowId, string indexed deviceId, SensorType sensorType);
    event SLAViolationDetected(uint256 indexed escrowId, string indexed deviceId, SensorType sensorType, int256 value);
    event AggregatedDataUpdated(string indexed deviceId, SensorType sensorType, int256 avgValue);

    constructor(address _escrowContract) {
        escrowContract = SupplyChainEscrow(_escrowContract);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ORACLE_OPERATOR_ROLE, msg.sender);
        _grantRole(DEVICE_MANAGER_ROLE, msg.sender);
        _grantRole(DATA_PROVIDER_ROLE, msg.sender);
    }

    /**
     * @dev Register new IoT device
     */
    function registerDevice(
        string memory deviceId,
        address owner,
        SensorType[] memory supportedSensors,
        string memory location,
        string memory metadata
    ) external onlyRole(DEVICE_MANAGER_ROLE) {
        require(bytes(deviceId).length > 0, "Device ID cannot be empty");
        require(!devices[deviceId].isActive, "Device already registered");

        devices[deviceId] = IoTDevice({
            deviceId: deviceId,
            owner: owner,
            supportedSensors: supportedSensors,
            isActive: true,
            registeredAt: block.timestamp,
            location: location,
            metadata: metadata,
            lastDataSubmission: 0
        });

        registeredDevices.push(deviceId);

        emit DeviceRegistered(deviceId, owner, supportedSensors);
    }

    /**
     * @dev Update device status
     */
    function updateDeviceStatus(string memory deviceId, bool isActive) external {
        require(
            devices[deviceId].owner == msg.sender || 
            hasRole(DEVICE_MANAGER_ROLE, msg.sender),
            "Not authorized"
        );
        
        devices[deviceId].isActive = isActive;
        emit DeviceStatusChanged(deviceId, isActive);
    }

    /**
     * @dev Submit IoT data point
     */
    function submitDataPoint(
        string memory deviceId,
        SensorType sensorType,
        int256 value,
        string memory unit,
        string memory location,
        string memory metadata
    ) external onlyRole(DATA_PROVIDER_ROLE) returns (uint256) {
        require(devices[deviceId].isActive, "Device not active");
        require(_isSensorSupported(deviceId, sensorType), "Sensor type not supported");

        uint256 dataPointId = _dataPointIdCounter.current();
        _dataPointIdCounter.increment();

        dataPoints[dataPointId] = IoTDataPoint({
            id: dataPointId,
            deviceId: deviceId,
            sensorType: sensorType,
            value: value,
            unit: unit,
            timestamp: block.timestamp,
            location: location,
            submitter: msg.sender,
            status: DataStatus.PENDING,
            verifiedAt: 0,
            verifier: address(0),
            metadata: metadata
        });

        deviceDataPoints[deviceId].push(dataPointId);
        allDataPoints.push(dataPointId);
        dataPointExists[deviceId][dataPointId] = true;

        devices[deviceId].lastDataSubmission = block.timestamp;

        // Update aggregated data
        _updateAggregatedData(deviceId, sensorType, value);

        // Check SLA monitors
        _checkSLAMonitors(deviceId, sensorType, value);

        emit DataPointSubmitted(dataPointId, deviceId, sensorType, value);

        return dataPointId;
    }

    /**
     * @dev Verify data point
     */
    function verifyDataPoint(uint256 dataPointId, DataStatus status) external onlyRole(ORACLE_OPERATOR_ROLE) {
        require(dataPoints[dataPointId].status == DataStatus.PENDING, "Data point already processed");
        require(status == DataStatus.VERIFIED || status == DataStatus.REJECTED, "Invalid status");

        dataPoints[dataPointId].status = status;
        dataPoints[dataPointId].verifiedAt = block.timestamp;
        dataPoints[dataPointId].verifier = msg.sender;

        emit DataPointVerified(dataPointId, msg.sender, status);
    }

    /**
     * @dev Create SLA monitor for escrow
     */
    function createSLAMonitor(
        uint256 escrowId,
        string memory deviceId,
        SensorType sensorType,
        int256 minThreshold,
        int256 maxThreshold,
        uint256 checkInterval
    ) external onlyRole(ORACLE_OPERATOR_ROLE) {
        require(devices[deviceId].isActive, "Device not active");
        require(_isSensorSupported(deviceId, sensorType), "Sensor type not supported");

        escrowSLAMonitors[escrowId].push(SLAMonitor({
            escrowId: escrowId,
            deviceId: deviceId,
            sensorType: sensorType,
            minThreshold: minThreshold,
            maxThreshold: maxThreshold,
            checkInterval: checkInterval,
            lastCheck: block.timestamp,
            isActive: true,
            violationCount: 0
        }));

        emit SLAMonitorCreated(escrowId, deviceId, sensorType);
    }

    /**
     * @dev Batch submit multiple data points
     */
    function batchSubmitDataPoints(
        string[] memory deviceIds,
        SensorType[] memory sensorTypes,
        int256[] memory values,
        string[] memory units,
        string[] memory locations,
        string[] memory metadatas
    ) external onlyRole(DATA_PROVIDER_ROLE) returns (uint256[] memory) {
        require(
            deviceIds.length == sensorTypes.length &&
            sensorTypes.length == values.length &&
            values.length == units.length &&
            units.length == locations.length &&
            locations.length == metadatas.length,
            "Array length mismatch"
        );

        uint256[] memory dataPointIds = new uint256[](deviceIds.length);

        for (uint256 i = 0; i < deviceIds.length; i++) {
            dataPointIds[i] = this.submitDataPoint(
                deviceIds[i],
                sensorTypes[i],
                values[i],
                units[i],
                locations[i],
                metadatas[i]
            );
        }

        return dataPointIds;
    }

    /**
     * @dev Check SLA monitors and trigger violations
     */
    function _checkSLAMonitors(string memory deviceId, SensorType sensorType, int256 value) internal {
        // This would typically be called by a Chainlink Keeper or similar automation
        // For now, we check inline when data is submitted
        
        for (uint256 i = 0; i < registeredDevices.length; i++) {
            if (keccak256(bytes(registeredDevices[i])) == keccak256(bytes(deviceId))) {
                // Check all escrows that monitor this device/sensor combination
                _checkEscrowSLAMonitors(deviceId, sensorType, value);
                break;
            }
        }
    }

    /**
     * @dev Check specific escrow SLA monitors
     */
    function _checkEscrowSLAMonitors(string memory deviceId, SensorType sensorType, int256 value) internal {
        // This is a simplified version - in production, you'd iterate through active escrows
        // For demonstration, we'll emit events for violations
        
        // Check if value violates any thresholds
        bool violationDetected = false;
        
        // This would check against actual SLA monitors
        // For now, we'll use simple threshold checks
        if (sensorType == SensorType.TEMPERATURE) {
            if (value < -20 || value > 80) { // Example temperature thresholds
                violationDetected = true;
            }
        } else if (sensorType == SensorType.HUMIDITY) {
            if (value < 0 || value > 100) { // Example humidity thresholds
                violationDetected = true;
            }
        }

        if (violationDetected) {
            // In a real implementation, this would trigger escrow penalties
            emit SLAViolationDetected(0, deviceId, sensorType, value); // Using 0 as placeholder escrow ID
        }
    }

    /**
     * @dev Update aggregated data for device/sensor combination
     */
    function _updateAggregatedData(string memory deviceId, SensorType sensorType, int256 value) internal {
        AggregatedData storage aggData = aggregatedData[deviceId][sensorType];
        
        if (aggData.dataPointCount == 0) {
            aggData.minValue = value;
            aggData.maxValue = value;
            aggData.avgValue = value;
            aggData.dataPointCount = 1;
        } else {
            if (value < aggData.minValue) aggData.minValue = value;
            if (value > aggData.maxValue) aggData.maxValue = value;
            
            // Update average (simplified calculation)
            aggData.avgValue = (aggData.avgValue * int256(aggData.dataPointCount) + value) / int256(aggData.dataPointCount + 1);
            aggData.dataPointCount++;
        }
        
        aggData.lastUpdated = block.timestamp;

        emit AggregatedDataUpdated(deviceId, sensorType, aggData.avgValue);
    }

    /**
     * @dev Check if sensor type is supported by device
     */
    function _isSensorSupported(string memory deviceId, SensorType sensorType) internal view returns (bool) {
        SensorType[] memory supportedSensors = devices[deviceId].supportedSensors;
        for (uint256 i = 0; i < supportedSensors.length; i++) {
            if (supportedSensors[i] == sensorType) {
                return true;
            }
        }
        return false;
    }

    // View functions
    function getDevice(string memory deviceId) external view returns (IoTDevice memory) {
        return devices[deviceId];
    }

    function getDataPoint(uint256 dataPointId) external view returns (IoTDataPoint memory) {
        return dataPoints[dataPointId];
    }

    function getDeviceDataPoints(string memory deviceId) external view returns (uint256[] memory) {
        return deviceDataPoints[deviceId];
    }

    function getDeviceDataPointsInRange(
        string memory deviceId,
        uint256 startTime,
        uint256 endTime
    ) external view returns (uint256[] memory) {
        uint256[] memory allDeviceDataPoints = deviceDataPoints[deviceId];
        uint256 count = 0;

        // First pass: count matching data points
        for (uint256 i = 0; i < allDeviceDataPoints.length; i++) {
            uint256 timestamp = dataPoints[allDeviceDataPoints[i]].timestamp;
            if (timestamp >= startTime && timestamp <= endTime) {
                count++;
            }
        }

        // Second pass: collect matching data points
        uint256[] memory result = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < allDeviceDataPoints.length; i++) {
            uint256 timestamp = dataPoints[allDeviceDataPoints[i]].timestamp;
            if (timestamp >= startTime && timestamp <= endTime) {
                result[index] = allDeviceDataPoints[i];
                index++;
            }
        }

        return result;
    }

    function getEscrowSLAMonitors(uint256 escrowId) external view returns (SLAMonitor[] memory) {
        return escrowSLAMonitors[escrowId];
    }

    function getAggregatedData(string memory deviceId, SensorType sensorType) external view returns (AggregatedData memory) {
        return aggregatedData[deviceId][sensorType];
    }

    function getRegisteredDevices() external view returns (string[] memory) {
        return registeredDevices;
    }

    function getAllDataPoints() external view returns (uint256[] memory) {
        return allDataPoints;
    }

    function getCurrentDataPointId() external view returns (uint256) {
        return _dataPointIdCounter.current();
    }

    function getDeviceCount() external view returns (uint256) {
        return registeredDevices.length;
    }

    function getTotalDataPoints() external view returns (uint256) {
        return allDataPoints.length;
    }

    /**
     * @dev Get latest data point for device/sensor combination
     */
    function getLatestDataPoint(string memory deviceId, SensorType sensorType) external view returns (IoTDataPoint memory) {
        uint256[] memory deviceDataPointIds = deviceDataPoints[deviceId];
        
        for (int256 i = int256(deviceDataPointIds.length) - 1; i >= 0; i--) {
            uint256 dataPointId = deviceDataPointIds[uint256(i)];
            if (dataPoints[dataPointId].sensorType == sensorType) {
                return dataPoints[dataPointId];
            }
        }
        
        // Return empty struct if not found
        return IoTDataPoint({
            id: 0,
            deviceId: "",
            sensorType: SensorType.CUSTOM,
            value: 0,
            unit: "",
            timestamp: 0,
            location: "",
            submitter: address(0),
            status: DataStatus.PENDING,
            verifiedAt: 0,
            verifier: address(0),
            metadata: ""
        });
    }
}
