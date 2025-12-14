import React from "react";

const ErrorFallback = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
        <h2 className="text-2xl font-bold text-red-800 mb-2">Something went wrong</h2>
        <p className="text-red-600 mb-4">
          An error occurred while loading this component.
        </p>
        <button
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          onClick={() => window.location.reload()}
        >
          Reload Page
        </button>
      </div>
    </div>
  );
};

export default ErrorFallback;