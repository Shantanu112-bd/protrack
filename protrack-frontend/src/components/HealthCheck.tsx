import React from "react";
import { Link } from "react-router-dom";

const HealthCheck: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 text-center">
        <div className="text-5xl mb-6">✅</div>
        <h1 className="text-3xl font-bold text-white mb-4">
          Application is Running
        </h1>
        <p className="text-gray-300 mb-8">
          ProTrack Supply Chain Management System is working correctly.
        </p>
        <div className="space-y-4">
          <Link
            to="/dashboard"
            className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            Go to Dashboard
          </Link>
          <Link
            to="/signin"
            className="block w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300"
          >
            Sign In Page
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HealthCheck;
