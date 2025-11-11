import React, { useState, useEffect } from "react";
import { useWeb3 } from "./hooks/useWeb3";
import SupplyChainService from "./services/supplyChainService";
import Web3 from "web3";

const AIAssistant = ({ onClose }: { onClose: () => void }) => {
  const { account, isActive } = useWeb3();
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your ProTrack AI Assistant. I can help you with supply chain management, product tracking, IoT data analysis, and blockchain verification. How can I assist you today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [supplyChainService, setSupplyChainService] =
    useState<SupplyChainService | null>(null);

  // Initialize supply chain service
  useEffect(() => {
    if (account && isActive && window.ethereum) {
      const web3 = new Web3(window.ethereum as unknown as string);
      const service = new SupplyChainService(web3, account);
      setSupplyChainService(service);
    }
  }, [account, isActive]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputText,
      sender: "user",
      timestamp: new Date(),
    };

    // Add user message
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsThinking(true);

    // Process AI response
    try {
      const aiResponse = await processAIRequest(inputText);
      const aiMessage = {
        id: messages.length + 2,
        text: aiResponse,
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI Assistant error:", error);
      const errorMessage = {
        id: messages.length + 2,
        text: "Sorry, I encountered an error processing your request. Please try again.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  const processAIRequest = async (request: string): Promise<string> => {
    // Simulate AI processing with different responses based on request content
    return new Promise((resolve) => {
      setTimeout(() => {
        const lowerRequest = request.toLowerCase();

        // Supply chain queries
        if (
          lowerRequest.includes("track") ||
          lowerRequest.includes("product") ||
          lowerRequest.includes("token")
        ) {
          resolve(
            `I can help you track products in the supply chain. You can search by token ID, RFID, or batch number. For example, try asking "Show me product with token ID 1001" or "Track batch BATCH-2023-12-001".`
          );
        }

        // IoT data queries
        else if (
          lowerRequest.includes("iot") ||
          lowerRequest.includes("sensor") ||
          lowerRequest.includes("temperature") ||
          lowerRequest.includes("humidity")
        ) {
          resolve(
            `I can analyze IoT sensor data for your products. You can ask about temperature readings, humidity levels, or vibration data. For example, try "Show temperature data for product 1001" or "Are there any sensor anomalies?"`
          );
        }

        // Blockchain verification
        else if (
          lowerRequest.includes("verify") ||
          lowerRequest.includes("authentic") ||
          lowerRequest.includes("blockchain")
        ) {
          resolve(
            `I can verify product authenticity using blockchain technology. You can ask me to verify a product by its RFID or token ID. For example, try "Verify product with RFID RF123456" or "Is token 1001 authentic?"`
          );
        }

        // Risk analysis
        else if (
          lowerRequest.includes("risk") ||
          lowerRequest.includes("delay") ||
          lowerRequest.includes("spoil")
        ) {
          resolve(
            `I can analyze supply chain risks including potential delays, spoilage predictions, and counterfeit detection. For example, try "Analyze risk for shipment 1001" or "Predict spoilage for perishable goods"`
          );
        }

        // Help
        else if (
          lowerRequest.includes("help") ||
          lowerRequest.includes("command") ||
          lowerRequest.includes("function")
        ) {
          resolve(`I can help you with:
• Tracking products through the supply chain
• Analyzing IoT sensor data
• Verifying product authenticity
• Predicting supply chain risks
• Managing smart contracts

Try asking specific questions like "Track product 1001" or "Show IoT data"`);
        }

        // Default response
        else {
          resolve(
            `I understand you're asking about "${request}". I can help with supply chain management, IoT data analysis, product tracking, and blockchain verification. Could you be more specific about what you need help with?`
          );
        }
      }, 1500);
    });
  };

  const quickActions = [
    { label: "Track Product", query: "Track product with token ID 1001" },
    { label: "Verify Authenticity", query: "Verify product authenticity" },
    { label: "IoT Data", query: "Show IoT sensor data" },
    { label: "Risk Analysis", query: "Analyze supply chain risks" },
  ];

  const handleQuickAction = (query: string) => {
    setInputText(query);
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[32rem] bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-2xl overflow-hidden flex flex-col z-50 animate-fade-in border border-gray-700">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <h3 className="font-medium text-white">AI Assistant</h3>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:bg-white/10 rounded-full p-1 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto bg-gray-900">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-3 ${
              message.sender === "user" ? "flex justify-end" : ""
            }`}
          >
            <div
              className={`p-3 rounded-lg ${
                message.sender === "user"
                  ? "bg-blue-600 text-white rounded-br-none max-w-xs"
                  : "bg-purple-600 text-white rounded-bl-none max-w-xs"
              }`}
            >
              {message.text}
              <div className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="mb-3">
            <div className="bg-purple-600 text-white rounded-bl-none max-w-xs p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-white rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-white rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {messages.length === 1 && (
          <div className="mt-4">
            <div className="text-xs text-gray-400 mb-2">Quick Actions:</div>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.query)}
                  className="text-xs bg-gray-700 hover:bg-gray-600 text-white p-2 rounded text-left transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-3 bg-gray-800 border-t border-gray-700">
        <div className="flex">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Ask me anything about supply chain..."
            className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={isThinking || !inputText.trim()}
            className={`px-4 py-2 rounded-r-md ${
              isThinking || !inputText.trim()
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700"
            } text-white transition-colors`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-2 text-center">
          Connected to ProTrack AI v2.0
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
