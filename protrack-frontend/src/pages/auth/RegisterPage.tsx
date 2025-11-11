import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, User, Mail, Lock, Building } from "lucide-react";
import { useAuth, UserRole } from "../../contexts/AuthContext";
import { useNotifications } from "../../contexts/NotificationContext";
import WalletConnectButton from "../../components/WalletConnectButton";

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: "customer" as UserRole,
    companyName: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { connectWallet, isConnected, account } = useWeb3();
  const { addNotification } = useNotifications();
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  const roles = [
    {
      value: "manufacturer",
      label: "Manufacturer",
      description: "Create and manage products",
    },
    {
      value: "packager",
      label: "Packager",
      description: "Package and process products",
    },
    {
      value: "wholesaler",
      label: "Wholesaler",
      description: "Distribute products in bulk",
    },
    {
      value: "seller",
      label: "Seller/Retailer",
      description: "Sell products to customers",
    },
    {
      value: "inspector",
      label: "Inspector/Regulator",
      description: "Verify and audit products",
    },
    {
      value: "customer",
      label: "Customer",
      description: "Verify product authenticity",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      addNotification({
        type: "error",
        title: "Password mismatch",
        message: "Passwords do not match. Please try again.",
      });
      return;
    }

    if (formData.password.length < 6) {
      addNotification({
        type: "error",
        title: "Weak password",
        message: "Password must be at least 6 characters long.",
      });
      return;
    }

    setLoading(true);

    try {
      await signUp(formData.email, formData.password, {
        role: formData.role,
        company_name: formData.companyName,
        wallet_address: account || undefined,
      });

      addNotification({
        type: "success",
        title: "Account created!",
        message:
          "Welcome to ProTrack. Please check your email to verify your account.",
      });
    } catch (error: any) {
      addNotification({
        type: "error",
        title: "Registration failed",
        message: error.message || "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWalletSuccess = (address: string) => {
    setIsWalletConnected(true);
    setWalletAddress(address);
    addNotification({
      type: "success",
      title: "Wallet Connected",
      message: `Successfully connected to ${address.substring(
        0,
        6
      )}...${address.substring(address.length - 4)}`,
    });
  };

  const handleWalletError = (error: Error) => {
    console.error("Error connecting wallet:", error);
    setIsWalletConnected(false);
    setWalletAddress("");
    addNotification({
      type: "error",
      title: "Connection Failed",
      message: "Failed to connect wallet. Please try again.",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Create your account
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Join the future of supply chain management
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Email address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blockchain-500 focus:border-transparent transition-colors"
              placeholder="Enter your email"
            />
          </div>
        </div>

        {/* Role Selection */}
        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Your role in the supply chain
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="role"
              name="role"
              required
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value as UserRole })
              }
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blockchain-500 focus:border-transparent transition-colors"
            >
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label} - {role.description}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Company Name (optional) */}
        {formData.role !== "customer" && (
          <div>
            <label
              htmlFor="companyName"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Company name (optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="companyName"
                name="companyName"
                type="text"
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blockchain-500 focus:border-transparent transition-colors"
                placeholder="Enter your company name"
              />
            </div>
          </div>
        )}

        {/* Password Field */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blockchain-500 focus:border-transparent transition-colors"
              placeholder="Create a password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password Field */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Confirm password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blockchain-500 focus:border-transparent transition-colors"
              placeholder="Confirm your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Wallet Connect (optional) */}
        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Web3 Wallet (Optional)
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
            Connect your wallet to enable blockchain features and
            multi-signature transactions.
          </p>
          <WalletConnectButton
            onSuccess={handleWalletSuccess}
            onError={handleWalletError}
            buttonText="Connect Wallet"
            connectedText="Wallet Connected"
            showAddress={true}
            showBalance={false}
            className="w-full"
          />
        </div>

        {/* Sign Up Button */}
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blockchain-600 hover:bg-blockchain-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blockchain-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "Create account"
          )}
        </motion.button>
      </form>

      {/* Sign In Link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            to="/auth/login"
            className="font-medium text-blockchain-600 hover:text-blockchain-500 dark:text-blockchain-400 dark:hover:text-blockchain-300"
          >
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default RegisterPage;
