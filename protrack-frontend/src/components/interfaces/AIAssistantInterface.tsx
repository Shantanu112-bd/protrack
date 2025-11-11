import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import AIAssistant from "../AIAssistant";

const AIAssistantInterface: React.FC = () => {
  const [isAssistantOpen, setIsAssistantOpen] = useState(true);

  const handleCloseAssistant = () => {
    setIsAssistantOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">AI Assistant</h1>
          <p className="text-gray-400">
            Intelligent supply chain insights and assistance
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl shadow-2xl">
              <CardHeader>
                <CardTitle className="text-xl text-white">
                  AI Chat Interface
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 flex items-center justify-center bg-gray-800/30 rounded-lg">
                  <AIAssistant
                    isOpen={isAssistantOpen}
                    onClose={handleCloseAssistant}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl shadow-2xl">
              <CardHeader>
                <CardTitle className="text-lg text-white">
                  AI Capabilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-800/30 rounded-lg">
                    <h4 className="font-medium text-white">
                      Supply Chain Optimization
                    </h4>
                    <p className="text-gray-400 text-sm mt-1">
                      Get recommendations for improving efficiency
                    </p>
                  </div>
                  <div className="p-3 bg-gray-800/30 rounded-lg">
                    <h4 className="font-medium text-white">Risk Assessment</h4>
                    <p className="text-gray-400 text-sm mt-1">
                      Identify potential supply chain disruptions
                    </p>
                  </div>
                  <div className="p-3 bg-gray-800/30 rounded-lg">
                    <h4 className="font-medium text-white">
                      Product Verification
                    </h4>
                    <p className="text-gray-400 text-sm mt-1">
                      Verify authenticity and trace origins
                    </p>
                  </div>
                  <div className="p-3 bg-gray-800/30 rounded-lg">
                    <h4 className="font-medium text-white">
                      IoT Data Analysis
                    </h4>
                    <p className="text-gray-400 text-sm mt-1">
                      Analyze sensor data for insights
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl shadow-2xl">
              <CardHeader>
                <CardTitle className="text-lg text-white">
                  Recent Interactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-800/30 rounded-lg">
                    <div className="text-white font-medium">
                      Optimize shipping routes
                    </div>
                    <div className="text-gray-400 text-sm mt-1">
                      2 hours ago
                    </div>
                  </div>
                  <div className="p-3 bg-gray-800/30 rounded-lg">
                    <div className="text-white font-medium">
                      Verify product authenticity
                    </div>
                    <div className="text-gray-400 text-sm mt-1">1 day ago</div>
                  </div>
                  <div className="p-3 bg-gray-800/30 rounded-lg">
                    <div className="text-white font-medium">
                      Analyze temperature data
                    </div>
                    <div className="text-gray-400 text-sm mt-1">2 days ago</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantInterface;
