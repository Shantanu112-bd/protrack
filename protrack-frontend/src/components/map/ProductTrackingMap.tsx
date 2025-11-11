import React from "react";

interface ProductTrackingMapProps {
  productId?: string;
  height?: string;
  width?: string;
}

const ProductTrackingMap: React.FC<ProductTrackingMapProps> = ({
  height = "500px",
  width = "100%",
}) => {
  return (
    <div
      className="bg-gradient-to-br from-blue-900/30 via-purple-900/20 to-indigo-900/30 rounded-2xl border border-gray-700/50 flex items-center justify-center backdrop-blur-sm shadow-2xl"
      style={{ height, width }}
    >
      <div className="text-center p-8 max-w-md">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
          <div className="relative text-5xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            🌍
          </div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-3 bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
          Supply Chain Map
        </h3>
        <p className="text-gray-300 mb-6">
          Interactive map showing product locations and shipment routes
        </p>
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bg-gray-800/60 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 transform hover:scale-105">
            <div className="text-blue-400 text-2xl mb-2">🏭</div>
            <div className="text-white font-medium text-sm">Manufacturing</div>
            <div className="text-gray-400 text-xs mt-1">Seattle, WA</div>
          </div>
          <div className="bg-gray-800/60 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50 hover:border-green-500/50 transition-all duration-300 transform hover:scale-105">
            <div className="text-green-400 text-2xl mb-2">🚚</div>
            <div className="text-white font-medium text-sm">In Transit</div>
            <div className="text-gray-400 text-xs mt-1">Chicago, IL</div>
          </div>
          <div className="bg-gray-800/60 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 transform hover:scale-105">
            <div className="text-purple-400 text-2xl mb-2">🏪</div>
            <div className="text-white font-medium text-sm">Retail</div>
            <div className="text-gray-400 text-xs mt-1">New York, NY</div>
          </div>
        </div>
        <div className="mt-8 flex justify-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <span className="text-gray-300 text-sm">Product Location</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span className="text-gray-300 text-sm">Route</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductTrackingMap;
