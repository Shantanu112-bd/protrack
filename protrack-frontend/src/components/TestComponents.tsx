import React from "react";
import { Link } from "react-router-dom";

const TestComponents = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Component Tests</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Products</h2>
          <p className="text-gray-600 mb-4">
            Test the Products component functionality
          </p>
          <Link
            to="/dashboard/products"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
          >
            Test Products
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Shipments</h2>
          <p className="text-gray-600 mb-4">
            Test the Shipments component functionality
          </p>
          <Link
            to="/dashboard/shipments"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
          >
            Test Shipments
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Mint Product</h2>
          <p className="text-gray-600 mb-4">
            Test the Mint Product component functionality
          </p>
          <Link
            to="/dashboard/mint"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
          >
            Test Mint
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Scan RFID</h2>
          <p className="text-gray-600 mb-4">
            Test the Scan RFID component functionality
          </p>
          <Link
            to="/dashboard/scan"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
          >
            Test Scan
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">IoT Monitor</h2>
          <p className="text-gray-600 mb-4">
            Test the IoT Monitor component functionality
          </p>
          <Link
            to="/dashboard/iot"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
          >
            Test IoT
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Analytics</h2>
          <p className="text-gray-600 mb-4">
            Test the Analytics component functionality
          </p>
          <Link
            to="/dashboard/analytics"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
          >
            Test Analytics
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Optimization</h2>
          <p className="text-gray-600 mb-4">
            Test the Optimization component functionality
          </p>
          <Link
            to="/dashboard/optimization"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
          >
            Test Optimization
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Quality Assurance</h2>
          <p className="text-gray-600 mb-4">
            Test the Quality Assurance component functionality
          </p>
          <Link
            to="/dashboard/quality"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
          >
            Test Quality
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Compliance</h2>
          <p className="text-gray-600 mb-4">
            Test the Compliance Management component functionality
          </p>
          <Link
            to="/dashboard/compliance"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
          >
            Test Compliance
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Sensors</h2>
          <p className="text-gray-600 mb-4">
            Test the Sensor Management component functionality
          </p>
          <Link
            to="/dashboard/sensors"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
          >
            Test Sensors
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TestComponents;
