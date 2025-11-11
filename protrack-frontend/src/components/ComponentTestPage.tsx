import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import EnhancedRFIDScanner from "./EnhancedRFIDScanner";
import SupplyChainDashboard from "./SupplyChainDashboard";
import IoTVisualization from "./IoTVisualization";
import MPCApprovalInterface from "./MPCApprovalInterface";
import ProductVerification from "./ProductVerification";
import AdminAnalytics from "./AdminAnalytics";
import EnhancedProductTrackingMap from "./EnhancedProductTrackingMap";

const ComponentTestPage: React.FC = () => {
  const [activeComponent, setActiveComponent] = React.useState<string | null>(
    null
  );

  const renderComponent = () => {
    switch (activeComponent) {
      case "rfid":
        return <EnhancedRFIDScanner />;
      case "supplychain":
        return <SupplyChainDashboard />;
      case "iot":
        return <IoTVisualization />;
      case "mpc":
        return <MPCApprovalInterface />;
      case "verification":
        return <ProductVerification />;
      case "analytics":
        return <AdminAnalytics />;
      case "map":
        return <EnhancedProductTrackingMap />;
      default:
        return (
          <div className="text-center py-10">
            <h2 className="text-2xl font-bold mb-4">Component Test Page</h2>
            <p className="text-gray-400 mb-6">
              Click on a component below to test it
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Component Test Page</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <Button
            onClick={() => setActiveComponent("rfid")}
            variant={activeComponent === "rfid" ? "default" : "outline"}
            className="w-full"
          >
            RFID Scanner
          </Button>
          <Button
            onClick={() => setActiveComponent("supplychain")}
            variant={activeComponent === "supplychain" ? "default" : "outline"}
            className="w-full"
          >
            Supply Chain
          </Button>
          <Button
            onClick={() => setActiveComponent("iot")}
            variant={activeComponent === "iot" ? "default" : "outline"}
            className="w-full"
          >
            IoT Visualization
          </Button>
          <Button
            onClick={() => setActiveComponent("mpc")}
            variant={activeComponent === "mpc" ? "default" : "outline"}
            className="w-full"
          >
            MPC Approval
          </Button>
          <Button
            onClick={() => setActiveComponent("verification")}
            variant={activeComponent === "verification" ? "default" : "outline"}
            className="w-full"
          >
            Verification
          </Button>
          <Button
            onClick={() => setActiveComponent("analytics")}
            variant={activeComponent === "analytics" ? "default" : "outline"}
            className="w-full"
          >
            Analytics
          </Button>
          <Button
            onClick={() => setActiveComponent("map")}
            variant={activeComponent === "map" ? "default" : "outline"}
            className="w-full"
          >
            Tracking Map
          </Button>
        </div>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>
              {activeComponent
                ? `${
                    activeComponent.charAt(0).toUpperCase() +
                    activeComponent.slice(1)
                  } Component`
                : "Select a Component"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="min-h-[500px]">{renderComponent()}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComponentTestPage;
