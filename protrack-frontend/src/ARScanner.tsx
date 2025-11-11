import React, { useState } from 'react';

const ARScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<null | {
    productId: string;
    name: string;
    manufacturer: string;
    did: string;
    zkProof: string;
    depinValidation: boolean;
  }>(null);

  const startScan = () => {
    setScanning(true);
    // Simulate scanning process
    setTimeout(() => {
      setScanning(false);
      setScanResult({
        productId: 'PRD-2023-04-15-789',
        name: 'Premium Organic Coffee',
        manufacturer: 'EcoBean Industries',
        did: 'did:ethr:0x1234...5678',
        zkProof: 'zk-snark-proof-valid-x9y8z7',
        depinValidation: true
      });
    }, 2000);
  };

  const resetScan = () => {
    setScanResult(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-lg w-full max-w-md overflow-hidden">
        <div className="bg-purple-600 p-3 flex justify-between items-center">
          <h3 className="font-medium text-white">AR Product Scanner</h3>
          <button className="text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div className="p-4">
          {!scanResult ? (
            <div className="text-center">
              <div className="bg-gray-700 rounded-lg p-8 mb-4 flex items-center justify-center">
                {scanning ? (
                  <div className="text-center">
                    <div className="animate-pulse flex space-x-4 mb-4">
                      <div className="h-12 w-12 bg-purple-500 rounded-full animate-bounce mx-auto"></div>
                    </div>
                    <p className="text-white">Scanning product...</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    <p className="text-white mb-4">Point your camera at the product QR code</p>
                  </div>
                )}
              </div>
              <button 
                onClick={startScan}
                disabled={scanning}
                className={`w-full py-2 px-4 rounded-md ${scanning ? 'bg-gray-600' : 'bg-purple-600'} text-white font-medium`}
              >
                {scanning ? 'Scanning...' : 'Start Scanning'}
              </button>
            </div>
          ) : (
            <div>
              <div className="bg-green-100 border-l-4 border-green-500 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">
                      Product verified successfully
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="text-lg font-medium text-white mb-2">Product Details</h4>
                <div className="bg-gray-700 rounded-md p-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-gray-400">Product ID:</div>
                    <div className="text-white">{scanResult.productId}</div>
                    <div className="text-gray-400">Name:</div>
                    <div className="text-white">{scanResult.name}</div>
                    <div className="text-gray-400">Manufacturer:</div>
                    <div className="text-white">{scanResult.manufacturer}</div>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="text-lg font-medium text-white mb-2">Verification Details</h4>
                <div className="bg-gray-700 rounded-md p-4">
                  <div className="mb-2">
                    <div className="text-gray-400 mb-1">DID Verification</div>
                    <div className="flex items-center">
                      <div className="bg-green-500 rounded-full h-3 w-3 mr-2"></div>
                      <div className="text-white text-sm truncate">{scanResult.did}</div>
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="text-gray-400 mb-1">ZK-Proof</div>
                    <div className="flex items-center">
                      <div className="bg-green-500 rounded-full h-3 w-3 mr-2"></div>
                      <div className="text-white text-sm">{scanResult.zkProof}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">DePIN Validation</div>
                    <div className="flex items-center">
                      <div className={`rounded-full h-3 w-3 mr-2 ${scanResult.depinValidation ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div className="text-white text-sm">{scanResult.depinValidation ? 'Validated' : 'Not Validated'}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={resetScan}
                className="w-full py-2 px-4 rounded-md bg-purple-600 text-white font-medium"
              >
                Scan Another Product
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ARScanner;