import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Package,
  Truck,
  MapPin,
  User,
  Calendar,
  CheckCircle,
  Clock,
} from "lucide-react";

const SupplyChainTracker = () => {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  // Mock supply chain data
  const products = [
    {
      id: "1",
      name: "Organic Coffee Beans",
      rfid: "RFID-001-ABC",
      status: "In Transit",
      currentLocation: "Warehouse A, New York",
      lastUpdate: "2023-12-01 14:30:00",
      custodian: "Distributor B",
      timeline: [
        {
          id: 1,
          status: "Manufactured",
          location: "Manufacturer A, Guatemala",
          date: "2023-11-15",
          time: "09:00",
          completed: true,
        },
        {
          id: 2,
          status: "Packaged",
          location: "Packaging Facility B, Guatemala",
          date: "2023-11-16",
          time: "14:30",
          completed: true,
        },
        {
          id: 3,
          status: "In Transit",
          location: "Port of Guatemala",
          date: "2023-11-18",
          time: "08:15",
          completed: true,
        },
        {
          id: 4,
          status: "Customs Clearance",
          location: "Customs Office, New York",
          date: "2023-11-25",
          time: "16:45",
          completed: true,
        },
        {
          id: 5,
          status: "In Transit",
          location: "Distribution Center, New York",
          date: "2023-11-27",
          time: "10:30",
          completed: true,
        },
        {
          id: 6,
          status: "Delivered",
          location: "Warehouse A, New York",
          date: "2023-12-01",
          time: "14:30",
          completed: true,
        },
        {
          id: 7,
          status: "In Transit",
          location: "Warehouse A → Retailer C",
          date: "2023-12-05",
          time: "09:00",
          completed: false,
        },
        {
          id: 8,
          status: "Delivered",
          location: "Retailer C, Boston",
          date: "2023-12-07",
          time: "11:00",
          completed: false,
        },
      ],
    },
    {
      id: "2",
      name: "Premium Chocolate",
      rfid: "RFID-002-DEF",
      status: "Received",
      currentLocation: "Store B, Los Angeles",
      lastUpdate: "2023-12-02 09:15:00",
      custodian: "Retailer C",
      timeline: [
        {
          id: 1,
          status: "Manufactured",
          location: "Manufacturer D, Switzerland",
          date: "2023-10-20",
          time: "11:00",
          completed: true,
        },
        {
          id: 2,
          status: "Packaged",
          location: "Packaging Facility E, Switzerland",
          date: "2023-10-22",
          time: "15:45",
          completed: true,
        },
        {
          id: 3,
          status: "In Transit",
          location: "Port of Geneva",
          date: "2023-10-25",
          time: "07:30",
          completed: true,
        },
        {
          id: 4,
          status: "Customs Clearance",
          location: "Customs Office, Los Angeles",
          date: "2023-11-05",
          time: "13:20",
          completed: true,
        },
        {
          id: 5,
          status: "In Transit",
          location: "Distribution Center, Los Angeles",
          date: "2023-11-08",
          time: "09:15",
          completed: true,
        },
        {
          id: 6,
          status: "Delivered",
          location: "Store B, Los Angeles",
          date: "2023-12-02",
          time: "09:15",
          completed: true,
        },
      ],
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Manufactured":
        return <Package className="h-4 w-4" />;
      case "Packaged":
        return <Package className="h-4 w-4" />;
      case "In Transit":
        return <Truck className="h-4 w-4" />;
      case "Customs Clearance":
        return <MapPin className="h-4 w-4" />;
      case "Delivered":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Manufactured":
        return <Badge className="bg-blue-500">Manufactured</Badge>;
      case "Packaged":
        return <Badge className="bg-purple-500">Packaged</Badge>;
      case "In Transit":
        return <Badge className="bg-yellow-500">In Transit</Badge>;
      case "Customs Clearance":
        return <Badge className="bg-indigo-500">Customs</Badge>;
      case "Delivered":
        return <Badge className="bg-green-500">Delivered</Badge>;
      default:
        return <Badge className="bg-gray-300">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Supply Chain Tracker</h1>
        <p className="text-muted-foreground">
          Track products through the supply chain
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-semibold">Products</h2>
          {products.map((product) => (
            <Card
              key={product.id}
              className={`cursor-pointer hover:shadow-md transition-shadow ${
                selectedProduct === product.id ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => setSelectedProduct(product.id)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {product.rfid}
                    </p>
                  </div>
                  {getStatusBadge(product.status)}
                </div>
                <div className="mt-2 flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{product.currentLocation}</span>
                </div>
                <div className="mt-1 flex items-center text-sm text-muted-foreground">
                  <User className="h-4 w-4 mr-1" />
                  <span>{product.custodian}</span>
                </div>
                <div className="mt-1 flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{product.lastUpdate}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Timeline */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Supply Chain Timeline</h2>
          {selectedProduct ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  {products.find((p) => p.id === selectedProduct)?.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products
                    .find((p) => p.id === selectedProduct)
                    ?.timeline.map((event, index) => (
                      <div key={event.id} className="flex">
                        <div className="flex flex-col items-center mr-4">
                          <div
                            className={`rounded-full p-2 ${
                              event.completed
                                ? "bg-green-500 text-white"
                                : "bg-gray-200 text-gray-500"
                            }`}
                          >
                            {event.completed ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <Clock className="h-4 w-4" />
                            )}
                          </div>
                          {index <
                            (products.find((p) => p.id === selectedProduct)
                              ?.timeline.length || 0) -
                              1 && (
                            <div
                              className={`h-full w-0.5 ${
                                event.completed ? "bg-green-500" : "bg-gray-200"
                              }`}
                            ></div>
                          )}
                        </div>
                        <div
                          className={`pb-4 ${
                            index <
                            (products.find((p) => p.id === selectedProduct)
                              ?.timeline.length || 0) -
                              1
                              ? "flex-1"
                              : ""
                          }`}
                        >
                          <div className="flex items-center">
                            <div
                              className={`p-2 rounded mr-2 ${
                                event.completed
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {getStatusIcon(event.status)}
                            </div>
                            <h3 className="font-medium">{event.status}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground ml-10">
                            {event.location}
                          </p>
                          <p className="text-xs text-muted-foreground ml-10 mt-1">
                            {event.date} at {event.time}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  Select a product to view its supply chain timeline
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplyChainTracker;
