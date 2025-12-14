import React from "react";

const TestWhiteScreen = () => {
  console.log("TestWhiteScreen component rendering");

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-red-600">Test Component</h1>
      <p className="text-gray-600 mt-4">
        If you can see this, the routing and component loading is working
        correctly.
      </p>
      <p className="text-gray-600 mt-2">
        If you're still seeing a white screen, the issue is likely with the
        other components.
      </p>
    </div>
  );
};

export default TestWhiteScreen;
