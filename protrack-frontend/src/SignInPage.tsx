import React, { useState } from "react";
import { useWeb3 } from "./hooks/useWeb3";
import WalletConnection from "./components/WalletConnection";

type UserType =
  | "manufacturer"
  | "transporter"
  | "retailer"
  | "consumer"
  | "admin";

const SignInPage: React.FC = () => {
  const { isActive, account } = useWeb3();
  const [userType, setUserType] = useState<UserType>("consumer");

  const userTypeOptions: {
    id: UserType;
    label: string;
    icon: string;
    color: string;
  }[] = [
    {
      id: "manufacturer",
      label: "Manufacturer",
      icon: "🏭",
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "transporter",
      label: "Transporter",
      icon: "🚚",
      color: "from-green-500 to-emerald-500",
    },
    {
      id: "retailer",
      label: "Retailer",
      icon: "🏪",
      color: "from-purple-500 to-fuchsia-500",
    },
    {
      id: "consumer",
      label: "Consumer",
      icon: "👤",
      color: "from-orange-500 to-amber-500",
    },
    {
      id: "admin",
      label: "Administrator",
      icon: "👑",
      color: "from-red-500 to-pink-500",
    },
  ];

  const handleSignIn = () => {
    // In a real app, this would authenticate with a backend
    // For now, we'll just redirect to the main dashboard
    window.location.hash = "/dashboard";
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjAuNSIgZmlsbD0iI2ZmZmZmZiIgZmlsbC1vcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjcGF0dGVybikiLz48L3N2Zz4=')] opacity-20"></div>

      <div className="relative z-10 max-w-4xl w-full bg-gray-800/30 backdrop-blur-xl rounded-3xl border border-gray-700/50 shadow-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Left Panel - Branding */}
          <div className="lg:w-1/2 bg-gradient-to-br from-purple-600/20 to-blue-600/20 p-8 lg:p-12 flex flex-col justify-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white"
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
              <h1 className="text-4xl font-bold text-white mb-4">ProTrack</h1>
              <p className="text-xl text-gray-300 mb-6">
                Supply Chain Transparency
              </p>
              <p className="text-gray-400 mb-8">
                Connect your wallet to access the decentralized supply chain
                tracking platform. Verify product authenticity, track shipments,
                and ensure transparency at every step.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-gray-300 text-sm">
                    Blockchain Verified
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-gray-300 text-sm">IoT Integrated</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-gray-300 text-sm">MPC Secured</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Sign In Form */}
          <div className="lg:w-1/2 p-8 lg:p-12 bg-gray-900/50">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-400">Sign in to your ProTrack account</p>
            </div>

            {/* User Type Selection */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">
                Select Your Role
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {userTypeOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setUserType(option.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                      userType === option.id
                        ? `bg-gradient-to-r ${option.color} border-transparent text-white shadow-lg`
                        : "bg-gray-800/50 border-gray-700 text-gray-300 hover:border-gray-600"
                    }`}
                  >
                    <div className="text-2xl mb-2">{option.icon}</div>
                    <div className="font-medium">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Wallet Connection */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">
                Connect Your Wallet
              </h3>
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                {isActive ? (
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-green-400 font-medium mb-2">
                      Wallet Connected
                    </p>
                    <p className="text-gray-400 text-sm mb-4">
                      {account?.slice(0, 6)}...{account?.slice(-4)}
                    </p>
                    <button
                      onClick={handleSignIn}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      Enter Dashboard
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-blue-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-400 mb-6">
                      Connect your wallet to continue
                    </p>
                    <WalletConnection />
                  </div>
                )}
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-gray-800/30 p-3 rounded-lg">
                <div className="text-blue-400 mb-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mx-auto"
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
                <p className="text-xs text-gray-400">Secure</p>
              </div>
              <div className="bg-gray-800/30 p-3 rounded-lg">
                <div className="text-green-400 mb-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mx-auto"
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
                <p className="text-xs text-gray-400">Fast</p>
              </div>
              <div className="bg-gray-800/30 p-3 rounded-lg">
                <div className="text-purple-400 mb-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <p className="text-xs text-gray-400">Insights</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
