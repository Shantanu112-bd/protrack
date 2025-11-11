import React, { useState } from 'react';

interface ARScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (result: string) => void;
}

const ARScanner: React.FC<ARScannerProps> = ({ isOpen, onClose, onScanComplete }) => {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const handleStartScan = () => {
    setScanning(true);
    // Simulate scanning process
    setTimeout(() => {
      const mockResult = 'PROD-' + Math.floor(Math.random() * 10000);
      setScanResult(mockResult);
      setScanning(false);
      onScanComplete(mockResult);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-full max-w-lg bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-lg font-medium">AR Product Scanner</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="aspect-video bg-gray-800 relative">
          {/* AR Camera View */}
          <div className="absolute inset-0 flex items-center justify-center">
            {scanning ? (
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-blue-400">Scanning...</p>
              </div>
            ) : scanResult ? (
              <div className="text-center bg-black/50 backdrop-blur-sm p-6 rounded-xl">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-xl font-bold text-white mb-2">Product Verified!</p>
                <p className="text-gray-300 mb-4">ID: {scanResult}</p>
                <div className="flex space-x-2 justify-center">
                  <button 
                    onClick={() => {
                      setScanResult(null);
                      handleStartScan();
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
                  >
                    Scan Again
                  </button>
                  <button 
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-64 h-64 border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <button 
                  onClick={handleStartScan}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium"
                >
                  Start AR Scanning
                </button>
              </div>
            )}
          </div>
          
          {/* AR Overlay Elements */}
          <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-xs text-white">
            AR Mode Active
          </div>
          
          <div className="absolute bottom-4 right-4 flex space-x-2">
            <button className="p-2 bg-black/50 backdrop-blur-sm rounded-full">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
            <button className="p-2 bg-black/50 backdrop-blur-sm rounded-full">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Verification Status</h4>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm">DID Verification: Valid</span>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm">ZK-Proof: Valid</span>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm">DePIN Validation: 5/5 Nodes</span>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
            >
              Close Scanner
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ARScanner;