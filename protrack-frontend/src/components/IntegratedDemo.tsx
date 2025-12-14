import React from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";

const IntegratedDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            ProTrack
          </span>
        </div>
        <div className="flex space-x-4">
          <Link to="/signin">
            <Button
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700/50"
            >
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      {/* Demo Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Integrated Demo
          </h1>
          <p className="text-xl text-gray-300 mb-10">
            Experience the full functionality of ProTrack with this interactive
            demo. All features are simulated for demonstration purposes.
          </p>
        </div>

        {/* Demo Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-blue-500/50 transition-all duration-300">
            <div className="text-blue-500 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Product Tracking</h3>
            <p className="text-gray-400 mb-4">
              Track products through the entire supply chain with blockchain
              verification.
            </p>
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Product #12345</span>
                <span className="text-green-400">Verified</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: "75%" }}
                ></div>
              </div>
              <div className="flex justify-between text-xs mt-2 text-gray-400">
                <span>Manufacturing</span>
                <span>Shipping</span>
                <span>Retail</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-green-500/50 transition-all duration-300">
            <div className="text-green-500 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">IoT Monitoring</h3>
            <p className="text-gray-400 mb-4">
              Real-time sensor data for temperature, humidity, and location
              tracking.
            </p>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Temperature</span>
                <span className="text-green-400">22.5°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Humidity</span>
                <span className="text-green-400">45%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Location</span>
                <span className="text-blue-400">40.7128° N, 74.0060° W</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all duration-300">
            <div className="text-purple-500 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Analytics Dashboard</h3>
            <p className="text-gray-400 mb-4">
              Comprehensive analytics and insights for supply chain
              optimization.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-400">98%</div>
                <div className="text-xs text-gray-400">On-Time Delivery</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-400">1240</div>
                <div className="text-xs text-gray-400">Products Tracked</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Experience the full power of ProTrack with real blockchain
            integration and live IoT data.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signin">
              <Button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg font-medium rounded-xl transition-all duration-300 transform hover:scale-105">
                Sign In to Full Version
              </Button>
            </Link>
            <Link to="/">
              <Button
                variant="outline"
                className="px-8 py-3 text-lg font-medium rounded-xl border-gray-600 text-gray-300 hover:bg-gray-700/50 transition-all duration-300"
              >
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t border-gray-800">
        <div className="text-center text-gray-500 text-sm">
          <p>© 2023 ProTrack Supply Chain. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default IntegratedDemo;
