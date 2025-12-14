import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { useWeb3 } from "../../contexts/web3ContextTypes";
import { useToast } from "../ui/use-toast";
import { supabase } from "../../services/supabase";
import ManufacturerDashboard from "./ManufacturerDashboard";
import TransporterDashboard from "./TransporterDashboard";
import RetailerDashboard from "./RetailerDashboard";

type UserRole =
  | "manufacturer"
  | "transporter"
  | "retailer"
  | "consumer"
  | "unknown";

const MainDashboard: React.FC = () => {
  const { account } = useWeb3();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<UserRole>("unknown");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!account) {
        setLoading(false);
        return;
      }

      try {
        // Get user role from Supabase
        const { data, error } = await supabase
          .from("users")
          .select("role")
          .eq("wallet_address", account.toLowerCase())
          .single();

        if (error) {
          console.error("Error fetching user role:", error);
          setUserRole("unknown");
        } else if (data) {
          setUserRole(data.role as UserRole);
        } else {
          // Default to unknown if no role found
          setUserRole("unknown");
        }
      } catch (error) {
        console.error("Failed to fetch user role:", error);
        toast({
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [account, toast]);

  const handleRoleChange = async (role: UserRole) => {
    if (!account) return;

    try {
      // Update user role in Supabase
      const { error } = await supabase.from("users").upsert({
        wallet_address: account.toLowerCase(),
        role: role,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        throw error;
      }

      setUserRole(role);
      toast({
        title: "Role Updated",
        description: `You are now viewing as a ${role}`,
      });
    } catch (error) {
      console.error("Failed to update role:", error);
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Connect Wallet</CardTitle>
            <CardDescription>
              Please connect your wallet to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">
              You need to connect your wallet to view your dashboard
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">
        ProTrack Supply Chain Dashboard
      </h1>

      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Your Role</CardTitle>
            <CardDescription>
              Choose your role in the supply chain to view the appropriate
              dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={userRole === "manufacturer" ? "default" : "outline"}
                onClick={() => handleRoleChange("manufacturer")}
              >
                Manufacturer
              </Button>
              <Button
                variant={userRole === "transporter" ? "default" : "outline"}
                onClick={() => handleRoleChange("transporter")}
              >
                Transporter
              </Button>
              <Button
                variant={userRole === "retailer" ? "default" : "outline"}
                onClick={() => handleRoleChange("retailer")}
              >
                Retailer
              </Button>
              <Button
                variant={userRole === "consumer" ? "default" : "outline"}
                onClick={() => handleRoleChange("consumer")}
              >
                Consumer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {userRole === "manufacturer" && <ManufacturerDashboard />}
      {userRole === "transporter" && <TransporterDashboard />}
      {userRole === "retailer" && <RetailerDashboard />}
      {userRole === "consumer" && (
        <Card>
          <CardHeader>
            <CardTitle>Consumer Dashboard</CardTitle>
            <CardDescription>
              Verify products and view their journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Consumer dashboard will be implemented in the next phase.
            </p>
          </CardContent>
        </Card>
      )}
      {userRole === "unknown" && (
        <Card>
          <CardHeader>
            <CardTitle>Welcome to ProTrack</CardTitle>
            <CardDescription>
              Please select your role to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Select your role from the options above to view the appropriate
              dashboard.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Global Map View - Available to all roles */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Product Tracking Map</CardTitle>
            <CardDescription>
              View all products in the supply chain
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] bg-gray-100 rounded-md flex items-center justify-center">
              <p>Map view will be implemented with Mapbox integration.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MainDashboard;
