// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title ProTrackOracle
 * @dev Contract for validating IoT and GPS data using Chainlink oracles
 */
contract ProTrackOracle is ChainlinkClient, AccessControl {
    using Chainlink for Chainlink.Request;
    
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant DATA_PROVIDER_ROLE = keccak256("DATA_PROVIDER_ROLE");
    
    // Oracle parameters
    address private oracle;
    bytes32 private jobId;
    uint256 private fee;
    
    // Mapping from request ID to token ID
    mapping(bytes32 => uint256) private _requestToToken;
    
    // Mapping from token ID to latest validated data
    mapping(uint256 => mapping(string => bytes)) private _validatedData;
    
    // Events
    event DataRequested(bytes32 requestId, uint256 tokenId, string dataType);
    event DataValidated(uint256 tokenId, string dataType, bytes data);
    
    /**
     * @dev Constructor
     * @param _link Chainlink token address
     * @param _oracle Oracle address
     * @param _jobId Job ID for Chainlink oracle
     * @param _fee Fee for oracle requests
     */
    constructor(
        address _link,
        address _oracle,
        bytes32 _jobId,
        uint256 _fee
    ) {
        setChainlinkToken(_link);
        oracle = _oracle;
        jobId = _jobId;
        fee = _fee;
        
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ORACLE_ROLE, msg.sender);
    }
    
    /**
     * @dev Request validation of IoT data
     * @param tokenId Token ID
     * @param dataType Type of data (temperature, humidity, etc.)
     * @param data Raw data to validate
     * @param source Source of data (IoT device ID)
     */
    function requestIoTValidation(
        uint256 tokenId,
        string memory dataType,
        bytes memory data,
        string memory source
    ) 
        public 
        onlyRole(DATA_PROVIDER_ROLE) 
        returns (bytes32) 
    {
        Chainlink.Request memory request = buildChainlinkRequest(
            jobId,
            address(this),
            this.fulfillIoTValidation.selector
        );
        
        // Add parameters to the request
        request.add("tokenId", uint2str(tokenId));
        request.add("dataType", dataType);
        request.addBytes("data", data);
        request.add("source", source);
        
        // Send the request
        bytes32 requestId = sendChainlinkRequestTo(oracle, request, fee);
        _requestToToken[requestId] = tokenId;
        
        emit DataRequested(requestId, tokenId, dataType);
        
        return requestId;
    }
    
    /**
     * @dev Request validation of GPS data
     * @param tokenId Token ID
     * @param latitude Latitude
     * @param longitude Longitude
     * @param timestamp Timestamp of GPS reading
     * @param source Source of data (GPS device ID)
     */
    function requestGPSValidation(
        uint256 tokenId,
        string memory latitude,
        string memory longitude,
        uint256 timestamp,
        string memory source
    ) 
        public 
        onlyRole(DATA_PROVIDER_ROLE) 
        returns (bytes32) 
    {
        Chainlink.Request memory request = buildChainlinkRequest(
            jobId,
            address(this),
            this.fulfillGPSValidation.selector
        );
        
        // Add parameters to the request
        request.add("tokenId", uint2str(tokenId));
        request.add("latitude", latitude);
        request.add("longitude", longitude);
        request.add("timestamp", uint2str(timestamp));
        request.add("source", source);
        
        // Send the request
        bytes32 requestId = sendChainlinkRequestTo(oracle, request, fee);
        _requestToToken[requestId] = tokenId;
        
        emit DataRequested(requestId, tokenId, "GPS");
        
        return requestId;
    }
    
    /**
     * @dev Callback function for IoT data validation
     * @param _requestId Request ID
     * @param _validationResult Validation result (1 for valid, 0 for invalid)
     * @param _dataType Type of data
     * @param _data Validated data
     */
    function fulfillIoTValidation(
        bytes32 _requestId,
        uint256 _validationResult,
        string memory _dataType,
        bytes memory _data
    ) 
        public 
        recordChainlinkFulfillment(_requestId) 
    {
        require(_validationResult == 1, "Data validation failed");
        
        uint256 tokenId = _requestToToken[_requestId];
        _validatedData[tokenId][_dataType] = _data;
        
        emit DataValidated(tokenId, _dataType, _data);
    }
    
    /**
     * @dev Callback function for GPS data validation
     * @param _requestId Request ID
     * @param _validationResult Validation result (1 for valid, 0 for invalid)
     * @param _latitude Validated latitude
     * @param _longitude Validated longitude
     */
    function fulfillGPSValidation(
        bytes32 _requestId,
        uint256 _validationResult,
        string memory _latitude,
        string memory _longitude
    ) 
        public 
        recordChainlinkFulfillment(_requestId) 
    {
        require(_validationResult == 1, "GPS validation failed");
        
        uint256 tokenId = _requestToToken[_requestId];
        bytes memory gpsData = abi.encode(_latitude, _longitude);
        _validatedData[tokenId]["GPS"] = gpsData;
        
        emit DataValidated(tokenId, "GPS", gpsData);
    }
    
    /**
     * @dev Get validated data for a token
     * @param tokenId Token ID
     * @param dataType Type of data
     */
    function getValidatedData(uint256 tokenId, string memory dataType) 
        public 
        view 
        returns (bytes memory) 
    {
        return _validatedData[tokenId][dataType];
    }
    
    /**
     * @dev Update oracle parameters
     * @param _oracle New oracle address
     * @param _jobId New job ID
     * @param _fee New fee
     */
    function updateOracleParams(
        address _oracle,
        bytes32 _jobId,
        uint256 _fee
    ) 
        public 
        onlyRole(ORACLE_ROLE) 
    {
        oracle = _oracle;
        jobId = _jobId;
        fee = _fee;
    }
    
    /**
     * @dev Convert uint to string
     * @param _i Integer to convert
     */
    function uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        while (_i != 0) {
            k = k-1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
}