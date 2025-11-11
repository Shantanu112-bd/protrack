import React, { useState, useEffect } from "react";
import ProTrackV2 from "./ProTrackV2";

// Mock Web3 provider for demo purposes
const MockWeb3Provider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Provide the mock context
  return <div>{children}</div>;
};

// Mock Toast Provider for demo purposes
const MockToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <div>{children}</div>;
};

// Mock Error Boundary for demo purposes
const MockErrorBoundary: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <div>{children}</div>;
};

const DemoRunner: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Loading ProTrack Demo</h2>
          <p className="text-gray-400 mt-1">
            Initializing supply chain system...
          </p>
        </div>
      </div>
    );
  }

  return (
    <MockErrorBoundary>
      <MockWeb3Provider>
        <MockToastProvider>
          <div className="min-h-screen bg-gray-900 text-white">
            <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 p-4 text-center border-b border-gray-700">
              <h1 className="text-2xl font-bold text-purple-400">
                🧪 ProTrack Demo Mode
              </h1>
              <p className="text-gray-400 mt-1">
                Fully functional frontend demo - blockchain interactions
                simulated
              </p>
            </div>
            <ProTrackV2 />
            <div className="fixed bottom-4 left-4 bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-lg text-sm text-gray-300 border border-gray-700">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span>Demo Mode Active</span>
              </div>
            </div>
          </div>
        </MockToastProvider>
      </MockWeb3Provider>
    </MockErrorBoundary>
  );
};

export default DemoRunner;
