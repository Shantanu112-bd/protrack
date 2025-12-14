import React, { useEffect, useState } from "react";

const TestBuffer: React.FC = () => {
  const [bufferTest, setBufferTest] = useState<string>("");

  useEffect(() => {
    try {
      // Test if Buffer is available
      if (typeof Buffer !== "undefined") {
        const testBuffer = Buffer.from("Hello ProTrack!");
        setBufferTest(`Buffer test successful: ${testBuffer.toString()}`);
      } else {
        setBufferTest("Buffer is not available");
      }
    } catch (error) {
      setBufferTest(
        `Buffer test failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }, []);

  return (
    <div className="p-4 bg-blue-100 rounded-lg">
      <h2 className="text-xl font-bold mb-2">Buffer Test</h2>
      <p className="text-gray-800">{bufferTest}</p>
    </div>
  );
};

export default TestBuffer;
