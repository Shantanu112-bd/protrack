// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./ProTrackSupplyChain.sol";

/**
 * @title ProTrackOracle
 * @dev Oracle contract for IoT data validation and GPS tracking
 */
contract ProTrackOracle is AccessControl, ReentrancyGuard {
    
    bytes32 public constant ORACLE_OPERATOR_ROLE = keccak256("ORACLE_OPERATOR_ROLE");
    bytes32 public constant IOT_DEVICE_ROLE = keccak256("IOT_DEVICE_ROLE");
    
    ProTrackSupplyChain public supplyChainContract;
    
    struct IoTDevice {
        address deviceAddress;
        string deviceId;
        string deviceType; // "temperature", "gps", "humidity", "vibration"
        bool isActive;
        uint256 lastUpdate;
        address assignedProduct;
    }
    
    struct SensorReading {
        string deviceId;
        uint256 tokenId;
        string sensorType;
        int256 value;
        string unit;
        string gpsCoordinates;
        uint256 timestamp;
        bytes32 dataHash;
        bool verified;
    }
    
    struct GPSLocation {
        string latitude;
        string longitude;
        uint256 timestamp;
        string address_location;
        uint256 accuracy; // in meters
    }
    
    // Mappings
    mapping(address => IoTDevice) public iotDevices;
    mapping(string => address) public deviceIdToAddress;
    mapping(uint256 => SensorReading[]) public tokenSensorData;
    mapping(uint256 => GPSLocation[]) public tokenGPSHistory;
    mapping(bytes32 => bool) public processedDataHashes;
    
    // Events
    event IoTDeviceRegistered(
        address indexed deviceAddress,
        string deviceId,
        string deviceType
    );
    
    event SensorDataReceived(
        string indexed deviceId,
        uint256 indexed tokenId,
        string sensorType,
        int256 value
    );
    
    event GPSLocationUpdated(
        uint256 indexed tokenId,
        string latitude,
        string longitude,
        uint256 timestamp
    );
    
    event AlertTriggered(
        uint256 indexed tokenId,
        string alertType,
        string message,
        uint256 timestamp
    );
    
    constructor(address _supplyChainContract) {
        supplyChainContract = ProTrackSupplyChain(_supplyChainContract);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ORACLE_OPERATOR_ROLE, msg.sender);
    }
    
    /**
     * @dev Register a new IoT device
     */
    function registerIoTDevice(
        address deviceAddress,
        string memory deviceId,
        string memory deviceType
    ) public onlyRole(ORACLE_OPERATOR_ROLE) {
        require(deviceAddress != address(0), "Invalid device address");
        require(bytes(deviceId).length > 0, "Device ID cannot be empty");
        require(deviceIdToAddress[deviceId] == address(0), "Device ID already exists");
        
        IoTDevice memory newDevice = IoTDevice({
            deviceAddress: deviceAddress,
            deviceId: deviceId,
            deviceType: deviceType,
            isActive: true,
            lastUpdate: block.timestamp,
            assignedProduct: address(0)
        });
        
        iotDevices[deviceAddress] = newDevice;
        deviceIdToAddress[deviceId] = deviceAddress;
        
        // Grant IoT device role
        _grantRole(IOT_DEVICE_ROLE, deviceAddress);
        
        emit IoTDeviceRegistered(deviceAddress, deviceId, deviceType);
    }
    
    /**
     * @dev Submit sensor data from IoT device
     */
    function submitSensorData(
        string memory deviceId,
        uint256 tokenId,
        string memory sensorType,
        int256 value,
        string memory unit,
        string memory gpsCoordinates,
        bytes32 dataHash
    ) public onlyRole(IOT_DEVICE_ROLE) nonReentrant {
        require(deviceIdToAddress[deviceId] == msg.sender, "Unauthorized device");
        require(!processedDataHashes[dataHash], "Data already processed");
        require(iotDevices[msg.sender].isActive, "Device not active");
        
        // Verify data integrity
        bytes32 expectedHash = keccak256(abi.encodePacked(
            deviceId,
            tokenId,
            sensorType,
            value,
            unit,
            gpsCoordinates,
            block.timestamp
        ));
        
        require(dataHash == expectedHash, "Data integrity check failed");
        
        // Create sensor reading
        SensorReading memory reading = SensorReading({
            deviceId: deviceId,
            tokenId: tokenId,
            sensorType: sensorType,
            value: value,
            unit: unit,
            gpsCoordinates: gpsCoordinates,
            timestamp: block.timestamp,
            dataHash: dataHash,
            verified: true
        });
        
        tokenSensorData[tokenId].push(reading);
        processedDataHashes[dataHash] = true;
        iotDevices[msg.sender].lastUpdate = block.timestamp;
        
        // Submit to main supply chain contract
        ProTrackSupplyChain.SensorType contractSensorType = _mapSensorType(sensorType);
        supplyChainContract.addIoTData(tokenId, contractSensorType, value, gpsCoordinates);
        
        emit SensorDataReceived(deviceId, tokenId, sensorType, value);
        
        // Check for alerts
        _checkAlerts(tokenId, sensorType, value);
    }
    
    /**
     * @dev Update GPS location for a product
     */
    function updateGPSLocation(
        uint256 tokenId,
        string memory latitude,
        string memory longitude,
        string memory address_location,
        uint256 accuracy
    ) public onlyRole(IOT_DEVICE_ROLE) {
        require(iotDevices[msg.sender].isActive, "Device not active");
        
        GPSLocation memory location = GPSLocation({
            latitude: latitude,
            longitude: longitude,
            timestamp: block.timestamp,
            address_location: address_location,
            accuracy: accuracy
        });
        
        tokenGPSHistory[tokenId].push(location);
        iotDevices[msg.sender].lastUpdate = block.timestamp;
        
        // Format coordinates for supply chain contract
        string memory coordinates = string(abi.encodePacked(latitude, ",", longitude));
        supplyChainContract.addIoTData(
            tokenId, 
            ProTrackSupplyChain.SensorType.GPS, 
            int256(accuracy), 
            coordinates
        );
        
        emit GPSLocationUpdated(tokenId, latitude, longitude, block.timestamp);
    }
    
    /**
     * @dev Batch submit multiple sensor readings
     */
    function batchSubmitSensorData(
        string[] memory deviceIds,
        uint256[] memory tokenIds,
        string[] memory sensorTypes,
        int256[] memory values,
        string[] memory units,
        string[] memory gpsCoordinates,
        bytes32[] memory dataHashes
    ) public onlyRole(IOT_DEVICE_ROLE) nonReentrant {
        require(deviceIds.length == tokenIds.length, "Array length mismatch");
        require(tokenIds.length == sensorTypes.length, "Array length mismatch");
        require(sensorTypes.length == values.length, "Array length mismatch");
        
        for (uint256 i = 0; i < deviceIds.length; i++) {
            if (!processedDataHashes[dataHashes[i]]) {
                submitSensorData(
                    deviceIds[i],
                    tokenIds[i],
                    sensorTypes[i],
                    values[i],
                    units[i],
                    gpsCoordinates[i],
                    dataHashes[i]
                );
            }
        }
    }
    
    /**
     * @dev Get sensor data for a token
     */
    function getTokenSensorData(uint256 tokenId) 
        public 
        view 
        returns (SensorReading[] memory) 
    {
        return tokenSensorData[tokenId];
    }
    
    /**
     * @dev Get GPS history for a token
     */
    function getTokenGPSHistory(uint256 tokenId) 
        public 
        view 
        returns (GPSLocation[] memory) 
    {
        return tokenGPSHistory[tokenId];
    }
    
    /**
     * @dev Get latest GPS location for a token
     */
    function getLatestGPSLocation(uint256 tokenId) 
        public 
        view 
        returns (GPSLocation memory) 
    {
        GPSLocation[] memory history = tokenGPSHistory[tokenId];
        require(history.length > 0, "No GPS data available");
        return history[history.length - 1];
    }
    
    /**
     * @dev Deactivate an IoT device
     */
    function deactivateDevice(address deviceAddress) 
        public 
        onlyRole(ORACLE_OPERATOR_ROLE) 
    {
        iotDevices[deviceAddress].isActive = false;
        _revokeRole(IOT_DEVICE_ROLE, deviceAddress);
    }
    
    /**
     * @dev Internal function to map sensor types
     */
    function _mapSensorType(string memory sensorType) 
        internal 
        pure 
        returns (ProTrackSupplyChain.SensorType) 
    {
        bytes32 typeHash = keccak256(abi.encodePacked(sensorType));
        
        if (typeHash == keccak256(abi.encodePacked("temperature"))) {
            return ProTrackSupplyChain.SensorType.Temperature;
        } else if (typeHash == keccak256(abi.encodePacked("humidity"))) {
            return ProTrackSupplyChain.SensorType.Humidity;
        } else if (typeHash == keccak256(abi.encodePacked("vibration"))) {
            return ProTrackSupplyChain.SensorType.Vibration;
        } else if (typeHash == keccak256(abi.encodePacked("gps"))) {
            return ProTrackSupplyChain.SensorType.GPS;
        } else if (typeHash == keccak256(abi.encodePacked("tamper"))) {
            return ProTrackSupplyChain.SensorType.Tamper;
        } else {
            return ProTrackSupplyChain.SensorType.Temperature; // Default
        }
    }
    
    /**
     * @dev Internal function to check for alerts
     */
    function _checkAlerts(
        uint256 tokenId,
        string memory sensorType,
        int256 value
    ) internal {
        bytes32 typeHash = keccak256(abi.encodePacked(sensorType));
        
        // Temperature alerts
        if (typeHash == keccak256(abi.encodePacked("temperature"))) {
            if (value < -20 || value > 40) {
                emit AlertTriggered(
                    tokenId,
                    "TEMPERATURE_ALERT",
                    "Temperature out of safe range",
                    block.timestamp
                );
            }
        }
        
        // Humidity alerts
        if (typeHash == keccak256(abi.encodePacked("humidity"))) {
            if (value < 0 || value > 95) {
                emit AlertTriggered(
                    tokenId,
                    "HUMIDITY_ALERT",
                    "Humidity out of safe range",
                    block.timestamp
                );
            }
        }
        
        // Vibration alerts
        if (typeHash == keccak256(abi.encodePacked("vibration"))) {
            if (value > 100) { // Assuming vibration scale 0-100
                emit AlertTriggered(
                    tokenId,
                    "VIBRATION_ALERT",
                    "Excessive vibration detected",
                    block.timestamp
                );
            }
        }
        
        // Tamper alerts
        if (typeHash == keccak256(abi.encodePacked("tamper"))) {
            if (value > 0) {
                emit AlertTriggered(
                    tokenId,
                    "TAMPER_ALERT",
                    "Product tampering detected",
                    block.timestamp
                );
            }
        }
    }
    
    /**
     * @dev Emergency function to trigger manual alert
     */
    function triggerManualAlert(
        uint256 tokenId,
        string memory alertType,
        string memory message
    ) public onlyRole(ORACLE_OPERATOR_ROLE) {
        emit AlertTriggered(tokenId, alertType, message, block.timestamp);
    }
}
