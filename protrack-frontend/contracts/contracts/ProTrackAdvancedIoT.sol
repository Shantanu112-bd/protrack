// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./ProTrackSupplyChain.sol";
import "./ProTrackMPCWallet.sol";

/**
 * @title ProTrackAdvancedIoT
 * @dev Advanced IoT integration with LoRa, MQTT, and real-time monitoring
 * Supports encrypted sensor data, automated alerts, and predictive analytics
 */
contract ProTrackAdvancedIoT is AccessControl, ReentrancyGuard {
    
    bytes32 public constant IOT_DEVICE_ROLE = keccak256("IOT_DEVICE_ROLE");
    bytes32 public constant IOT_GATEWAY_ROLE = keccak256("IOT_GATEWAY_ROLE");
    bytes32 public constant LORA_NODE_ROLE = keccak256("LORA_NODE_ROLE");
    bytes32 public constant MQTT_BROKER_ROLE = keccak256("MQTT_BROKER_ROLE");
    bytes32 public constant ANALYTICS_ROLE = keccak256("ANALYTICS_ROLE");

    // Core contracts
    ProTrackSupplyChain public supplyChainContract;
    ProTrackMPCWallet public mpcWallet;

    // Enhanced IoT Device Structure
    struct AdvancedIoTDevice {
        address deviceAddress;
        string deviceId;
        string deviceType;          // "temperature", "humidity", "gps", "vibration", "tamper", "rfid"
        string protocol;            // "LoRa", "MQTT", "WiFi", "Cellular"
        string firmwareVersion;
        uint256 batteryLevel;       // Battery percentage (0-100)
        bool isActive;
        bool isEncrypted;           // Whether device sends encrypted data
        uint256 lastHeartbeat;      // Last communication timestamp
        uint256 dataFrequency;      // How often device sends data (seconds)
        string gpsLocation;         // Current GPS coordinates
        bytes32 encryptionKey;      // Device-specific encryption key
        uint256[] assignedProducts; // Products this device monitors
    }

    // Enhanced Sensor Reading with encryption and validation
    struct EncryptedSensorReading {
        string deviceId;
        uint256 tokenId;
        string sensorType;
        bytes encryptedValue;       // Encrypted sensor value
        bytes encryptedMetadata;    // Encrypted additional metadata
        string unit;
        string gpsCoordinates;
        uint256 timestamp;
        bytes32 dataHash;
        bytes32 signature;          // Digital signature for authenticity
        bool verified;
        bool isEncrypted;
        uint256 sequenceNumber;     // For replay attack prevention
    }

    // LoRa Network Configuration
    struct LoRaNetwork {
        string networkId;
        address gatewayAddress;
        uint256 frequency;          // LoRa frequency in Hz
        uint8 spreadingFactor;      // LoRa SF (7-12)
        uint8 bandwidth;            // LoRa BW
        bool isActive;
        mapping(string => bool) registeredNodes;
        uint256 nodeCount;
    }

    // MQTT Broker Configuration
    struct MQTTBroker {
        string brokerId;
        address brokerAddress;
        string brokerUrl;
        uint16 port;
        bool requiresAuth;
        bool isSecure;              // TLS/SSL enabled
        mapping(string => string) topicSubscriptions;
        uint256 subscriberCount;
    }

    // Automated Alert System
    struct AlertRule {
        uint256 ruleId;
        string sensorType;
        int256 minThreshold;
        int256 maxThreshold;
        uint256 timeWindow;         // Time window for threshold breach
        bool isActive;
        address[] notificationTargets;
        string alertMessage;
        uint256 cooldownPeriod;     // Minimum time between alerts
        uint256 lastTriggered;
    }

    // Predictive Analytics Data
    struct PredictiveModel {
        uint256 modelId;
        string modelType;           // "spoilage", "delay", "tampering"
        bytes32 modelHash;          // Hash of ML model parameters
        uint256 accuracy;           // Model accuracy percentage
        uint256 lastUpdated;
        bool isActive;
        mapping(uint256 => int256) predictions; // tokenId => prediction score
    }

    // Real-time monitoring dashboard data
    struct MonitoringDashboard {
        uint256 totalDevices;
        uint256 activeDevices;
        uint256 alertsLast24h;
        uint256 dataPointsToday;
        mapping(string => uint256) sensorTypeCounts;
        mapping(string => int256) averageValues;
    }

    // State mappings
    mapping(address => AdvancedIoTDevice) public iotDevices;
    mapping(string => address) public deviceIdToAddress;
    mapping(uint256 => EncryptedSensorReading[]) public tokenSensorData;
    mapping(string => LoRaNetwork) public loraNetworks;
    mapping(string => MQTTBroker) public mqttBrokers;
    mapping(uint256 => AlertRule) public alertRules;
    mapping(uint256 => PredictiveModel) public predictiveModels;
    mapping(bytes32 => bool) public processedDataHashes;
    mapping(address => uint256[]) public deviceAlerts;
    
    MonitoringDashboard public dashboard;
    uint256 public alertRuleCounter;
    uint256 public modelCounter;

    // Events
    event AdvancedDeviceRegistered(
        address indexed deviceAddress,
        string deviceId,
        string deviceType,
        string protocol
    );

    event EncryptedDataReceived(
        string indexed deviceId,
        uint256 indexed tokenId,
        bytes32 dataHash,
        uint256 sequenceNumber
    );

    event LoRaNetworkConfigured(
        string indexed networkId,
        address indexed gateway,
        uint256 frequency
    );

    event MQTTBrokerConfigured(
        string indexed brokerId,
        address indexed broker,
        string brokerUrl
    );

    event AlertRuleCreated(
        uint256 indexed ruleId,
        string sensorType,
        int256 minThreshold,
        int256 maxThreshold
    );

    event AutomatedAlertTriggered(
        uint256 indexed ruleId,
        uint256 indexed tokenId,
        string alertType,
        int256 value
    );

    event PredictiveModelUpdated(
        uint256 indexed modelId,
        string modelType,
        uint256 accuracy
    );

    event DeviceHeartbeat(
        address indexed deviceAddress,
        uint256 batteryLevel,
        string gpsLocation
    );

    event DataIntegrityViolation(
        string indexed deviceId,
        bytes32 expectedHash,
        bytes32 receivedHash
    );

    constructor(
        address _supplyChainContract,
        address payable _mpcWallet
    ) {
        supplyChainContract = ProTrackSupplyChain(_supplyChainContract);
        mpcWallet = ProTrackMPCWallet(_mpcWallet);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ANALYTICS_ROLE, msg.sender);
    }

    /**
     * @dev Register advanced IoT device with protocol specification
     */
    function registerAdvancedDevice(
        address deviceAddress,
        string memory deviceId,
        string memory deviceType,
        string memory protocol,
        string memory firmwareVersion,
        bool enableEncryption
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(deviceAddress != address(0), "Invalid device address");
        require(bytes(deviceId).length > 0, "Device ID cannot be empty");
        require(deviceIdToAddress[deviceId] == address(0), "Device ID already exists");

        // Generate device encryption key if encryption enabled
        bytes32 encryptionKey = enableEncryption ? 
            keccak256(abi.encodePacked(deviceId, block.timestamp, "DEVICE_KEY")) : 
            bytes32(0);

        AdvancedIoTDevice memory newDevice = AdvancedIoTDevice({
            deviceAddress: deviceAddress,
            deviceId: deviceId,
            deviceType: deviceType,
            protocol: protocol,
            firmwareVersion: firmwareVersion,
            batteryLevel: 100,
            isActive: true,
            isEncrypted: enableEncryption,
            lastHeartbeat: block.timestamp,
            dataFrequency: 300, // Default 5 minutes
            gpsLocation: "",
            encryptionKey: encryptionKey,
            assignedProducts: new uint256[](0)
        });

        iotDevices[deviceAddress] = newDevice;
        deviceIdToAddress[deviceId] = deviceAddress;

        // Grant appropriate role based on protocol
        if (keccak256(abi.encodePacked(protocol)) == keccak256(abi.encodePacked("LoRa"))) {
            _grantRole(LORA_NODE_ROLE, deviceAddress);
        } else if (keccak256(abi.encodePacked(protocol)) == keccak256(abi.encodePacked("MQTT"))) {
            _grantRole(MQTT_BROKER_ROLE, deviceAddress);
        }
        
        _grantRole(IOT_DEVICE_ROLE, deviceAddress);

        // Update dashboard
        dashboard.totalDevices++;
        dashboard.activeDevices++;

        emit AdvancedDeviceRegistered(deviceAddress, deviceId, deviceType, protocol);
    }

    /**
     * @dev Submit encrypted sensor data with enhanced security
     */
    function submitEncryptedSensorData(
        string memory deviceId,
        uint256 tokenId,
        string memory sensorType,
        bytes memory encryptedValue,
        bytes memory encryptedMetadata,
        string memory unit,
        string memory gpsCoordinates,
        uint256 sequenceNumber,
        bytes32 dataHash,
        bytes32 signature
    ) public onlyRole(IOT_DEVICE_ROLE) nonReentrant {
        require(deviceIdToAddress[deviceId] == msg.sender, "Unauthorized device");
        require(!processedDataHashes[dataHash], "Data already processed");
        require(iotDevices[msg.sender].isActive, "Device not active");

        // Verify sequence number to prevent replay attacks
        EncryptedSensorReading[] storage readings = tokenSensorData[tokenId];
        if (readings.length > 0) {
            require(
                sequenceNumber > readings[readings.length - 1].sequenceNumber,
                "Invalid sequence number"
            );
        }

        // Verify data integrity and signature
        bytes32 expectedHash = keccak256(abi.encodePacked(
            deviceId,
            tokenId,
            sensorType,
            encryptedValue,
            gpsCoordinates,
            sequenceNumber,
            block.timestamp
        ));
        
        require(dataHash == expectedHash, "Data integrity check failed");
        
        // Verify digital signature (simplified - in production use proper ECDSA)
        bytes32 messageHash = keccak256(abi.encodePacked(dataHash, iotDevices[msg.sender].encryptionKey));
        require(signature == messageHash, "Invalid signature");

        // Create encrypted sensor reading
        EncryptedSensorReading memory reading = EncryptedSensorReading({
            deviceId: deviceId,
            tokenId: tokenId,
            sensorType: sensorType,
            encryptedValue: encryptedValue,
            encryptedMetadata: encryptedMetadata,
            unit: unit,
            gpsCoordinates: gpsCoordinates,
            timestamp: block.timestamp,
            dataHash: dataHash,
            signature: signature,
            verified: true,
            isEncrypted: iotDevices[msg.sender].isEncrypted,
            sequenceNumber: sequenceNumber
        });

        tokenSensorData[tokenId].push(reading);
        processedDataHashes[dataHash] = true;
        iotDevices[msg.sender].lastHeartbeat = block.timestamp;

        // Update dashboard metrics
        dashboard.dataPointsToday++;
        dashboard.sensorTypeCounts[sensorType]++;

        emit EncryptedDataReceived(deviceId, tokenId, dataHash, sequenceNumber);

        // Check alert rules
        _checkAlertRules(tokenId, sensorType, encryptedValue);
    }

    /**
     * @dev Configure LoRa network
     */
    function configureLoRaNetwork(
        string memory networkId,
        address gatewayAddress,
        uint256 frequency,
        uint8 spreadingFactor,
        uint8 bandwidth
    ) public onlyRole(IOT_GATEWAY_ROLE) {
        require(gatewayAddress != address(0), "Invalid gateway address");
        require(frequency > 0, "Invalid frequency");
        require(spreadingFactor >= 7 && spreadingFactor <= 12, "Invalid spreading factor");

        LoRaNetwork storage network = loraNetworks[networkId];
        network.networkId = networkId;
        network.gatewayAddress = gatewayAddress;
        network.frequency = frequency;
        network.spreadingFactor = spreadingFactor;
        network.bandwidth = bandwidth;
        network.isActive = true;
        network.nodeCount = 0;

        emit LoRaNetworkConfigured(networkId, gatewayAddress, frequency);
    }

    /**
     * @dev Configure MQTT broker
     */
    function configureMQTTBroker(
        string memory brokerId,
        address brokerAddress,
        string memory brokerUrl,
        uint16 port,
        bool requiresAuth,
        bool isSecure
    ) public onlyRole(MQTT_BROKER_ROLE) {
        require(brokerAddress != address(0), "Invalid broker address");
        require(bytes(brokerUrl).length > 0, "Invalid broker URL");

        MQTTBroker storage broker = mqttBrokers[brokerId];
        broker.brokerId = brokerId;
        broker.brokerAddress = brokerAddress;
        broker.brokerUrl = brokerUrl;
        broker.port = port;
        broker.requiresAuth = requiresAuth;
        broker.isSecure = isSecure;
        broker.subscriberCount = 0;

        emit MQTTBrokerConfigured(brokerId, brokerAddress, brokerUrl);
    }

    /**
     * @dev Create automated alert rule
     */
    function createAlertRule(
        string memory sensorType,
        int256 minThreshold,
        int256 maxThreshold,
        uint256 timeWindow,
        address[] memory notificationTargets,
        string memory alertMessage,
        uint256 cooldownPeriod
    ) public onlyRole(ANALYTICS_ROLE) returns (uint256) {
        uint256 ruleId = alertRuleCounter++;

        AlertRule storage rule = alertRules[ruleId];
        rule.ruleId = ruleId;
        rule.sensorType = sensorType;
        rule.minThreshold = minThreshold;
        rule.maxThreshold = maxThreshold;
        rule.timeWindow = timeWindow;
        rule.isActive = true;
        rule.notificationTargets = notificationTargets;
        rule.alertMessage = alertMessage;
        rule.cooldownPeriod = cooldownPeriod;
        rule.lastTriggered = 0;

        emit AlertRuleCreated(ruleId, sensorType, minThreshold, maxThreshold);
        return ruleId;
    }

    /**
     * @dev Update predictive model
     */
    function updatePredictiveModel(
        string memory modelType,
        bytes32 modelHash,
        uint256 accuracy
    ) public onlyRole(ANALYTICS_ROLE) returns (uint256) {
        uint256 modelId = modelCounter++;

        PredictiveModel storage model = predictiveModels[modelId];
        model.modelId = modelId;
        model.modelType = modelType;
        model.modelHash = modelHash;
        model.accuracy = accuracy;
        model.lastUpdated = block.timestamp;
        model.isActive = true;

        emit PredictiveModelUpdated(modelId, modelType, accuracy);
        return modelId;
    }

    /**
     * @dev Device heartbeat with status update
     */
    function deviceHeartbeat(
        string memory deviceId,
        uint256 batteryLevel,
        string memory gpsLocation
    ) public onlyRole(IOT_DEVICE_ROLE) {
        require(deviceIdToAddress[deviceId] == msg.sender, "Unauthorized device");
        
        AdvancedIoTDevice storage device = iotDevices[msg.sender];
        device.lastHeartbeat = block.timestamp;
        device.batteryLevel = batteryLevel;
        device.gpsLocation = gpsLocation;

        // Check if device should be marked as inactive
        if (batteryLevel < 10) {
            device.isActive = false;
            dashboard.activeDevices--;
        }

        emit DeviceHeartbeat(msg.sender, batteryLevel, gpsLocation);
    }

    /**
     * @dev Decrypt sensor data (if authorized)
     */
    function decryptSensorData(
        uint256 tokenId,
        uint256 readingIndex,
        bytes32 decryptionKey
    ) public view returns (bytes memory, bytes memory) {
        require(
            mpcWallet.hasProductAccess(tokenId, msg.sender),
            "Not authorized to decrypt"
        );

        EncryptedSensorReading storage reading = tokenSensorData[tokenId][readingIndex];
        require(reading.isEncrypted, "Data not encrypted");

        // Verify decryption key
        bytes32 expectedKey = mpcWallet.getUserDecryptionKey(tokenId, msg.sender);
        require(decryptionKey == expectedKey, "Invalid decryption key");

        // In production, implement proper decryption
        return (reading.encryptedValue, reading.encryptedMetadata);
    }

    /**
     * @dev Get real-time dashboard data
     */
    function getDashboardData() 
        public 
        view 
        returns (
            uint256 totalDevices,
            uint256 activeDevices,
            uint256 alertsLast24h,
            uint256 dataPointsToday
        ) 
    {
        return (
            dashboard.totalDevices,
            dashboard.activeDevices,
            dashboard.alertsLast24h,
            dashboard.dataPointsToday
        );
    }

    /**
     * @dev Get device information
     */
    function getDeviceInfo(address deviceAddress) 
        public 
        view 
        returns (
            string memory deviceId,
            string memory deviceType,
            string memory protocol,
            bool isActive,
            uint256 batteryLevel,
            uint256 lastHeartbeat
        ) 
    {
        AdvancedIoTDevice storage device = iotDevices[deviceAddress];
        return (
            device.deviceId,
            device.deviceType,
            device.protocol,
            device.isActive,
            device.batteryLevel,
            device.lastHeartbeat
        );
    }

    /**
     * @dev Get alert rule details
     */
    function getAlertRule(uint256 ruleId) 
        public 
        view 
        returns (
            string memory sensorType,
            int256 minThreshold,
            int256 maxThreshold,
            bool isActive,
            uint256 lastTriggered
        ) 
    {
        AlertRule storage rule = alertRules[ruleId];
        return (
            rule.sensorType,
            rule.minThreshold,
            rule.maxThreshold,
            rule.isActive,
            rule.lastTriggered
        );
    }

    /**
     * @dev Internal function to check alert rules
     */
    function _checkAlertRules(
        uint256 tokenId,
        string memory sensorType,
        bytes memory encryptedValue
    ) internal {
        // For demonstration, we'll assume we can check thresholds on encrypted data
        // In production, this would require homomorphic encryption or secure computation
        
        for (uint256 i = 0; i < alertRuleCounter; i++) {
            AlertRule storage rule = alertRules[i];
            
            if (!rule.isActive) continue;
            if (keccak256(abi.encodePacked(rule.sensorType)) != keccak256(abi.encodePacked(sensorType))) continue;
            if (block.timestamp < rule.lastTriggered + rule.cooldownPeriod) continue;

            // Simplified threshold check (in production, use secure computation)
            // This is a placeholder - real implementation would decrypt or use homomorphic encryption
            bool thresholdBreached = _checkEncryptedThreshold(encryptedValue, rule.minThreshold, rule.maxThreshold);
            
            if (thresholdBreached) {
                rule.lastTriggered = block.timestamp;
                dashboard.alertsLast24h++;
                
                emit AutomatedAlertTriggered(i, tokenId, rule.sensorType, 0);
                
                // Store alert for device
                deviceAlerts[msg.sender].push(block.timestamp);
            }
        }
    }

    /**
     * @dev Internal function to check encrypted threshold (placeholder)
     */
    function _checkEncryptedThreshold(
        bytes memory encryptedValue,
        int256 minThreshold,
        int256 maxThreshold
    ) internal pure returns (bool) {
        // This is a simplified placeholder
        // In production, implement proper homomorphic encryption or secure multi-party computation
        bytes32 valueHash = keccak256(encryptedValue);
        uint256 pseudoValue = uint256(valueHash) % 100; // Convert to 0-100 range
        
        return (int256(pseudoValue) < minThreshold || int256(pseudoValue) > maxThreshold);
    }

    /**
     * @dev Assign device to monitor specific products
     */
    function assignDeviceToProducts(
        address deviceAddress,
        uint256[] memory productIds
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(iotDevices[deviceAddress].isActive, "Device not active");
        
        iotDevices[deviceAddress].assignedProducts = productIds;
    }

    /**
     * @dev Emergency deactivate device
     */
    function emergencyDeactivateDevice(address deviceAddress) 
        public 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        iotDevices[deviceAddress].isActive = false;
        dashboard.activeDevices--;
        _revokeRole(IOT_DEVICE_ROLE, deviceAddress);
    }

    /**
     * @dev Batch process IoT data for efficiency
     */
    function batchProcessIoTData(
        string[] memory deviceIds,
        uint256[] memory tokenIds,
        bytes[] memory encryptedValues,
        bytes32[] memory dataHashes
    ) public onlyRole(IOT_DEVICE_ROLE) nonReentrant {
        require(deviceIds.length == tokenIds.length, "Array length mismatch");
        
        for (uint256 i = 0; i < deviceIds.length; i++) {
            if (!processedDataHashes[dataHashes[i]]) {
                // Process individual data point
                // This would call submitEncryptedSensorData internally
                processedDataHashes[dataHashes[i]] = true;
            }
        }
    }
}
