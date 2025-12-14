import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Truck,
  Shield,
  CheckCircle,
  Thermometer,
  Zap,
  Globe,
  Cpu,
  Database,
  Lock,
  Wifi,
  QrCode,
  Coins,
  BarChart3,
  TrendingUp,
  Factory,
  Home,
} from "lucide-react";

const ProjectOverviewDashboard = () => {
  const [activeModule, setActiveModule] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);

  // Rotate through modules for demo
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveModule((prev) => (prev + 1) % 10);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Refresh animations periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationKey((prev) => prev + 1);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const modules = [
    {
      id: 0,
      name: "Products",
      icon: Package,
      color: "from-blue-500 to-cyan-500",
      description:
        "Product master data, identity & hashing, metadata storage, tokenization",
      features: [
        "Product Master: productId, SKU, name, description",
        "Identity & Hashing: generate productHash",
        "QR Code and RFID Payload exposure",
        "Metadata Store: images, spec sheets, certificates",
        "Tokenization: NFT / SBT minting option",
      ],
    },
    {
      id: 1,
      name: "Shipments",
      icon: Truck,
      color: "from-green-500 to-emerald-500",
      description: "Shipment records, packing lists, GPS tracking, checkpoints",
      features: [
        "Shipment Record: shipmentId, origin, destination",
        "Packing List: productIds with quantities",
        "GPS Tracker Link: device assignments",
        "Checkpoints & Events: arrival, departure, customs",
        "Insurance / SLA: delivery guarantees",
      ],
    },
    {
      id: 2,
      name: "Mint",
      icon: Coins,
      color: "from-purple-500 to-pink-500",
      description:
        "Minting policies, batch/unit NFTs, MPC approvals, metadata URI",
      features: [
        "Minting Policy: triggers (manufacture, QA pass)",
        "Mint types: Batch NFT vs Unit NFT vs SBT",
        "MPC Multisig Approval: threshold signers",
        "Metadata URI Generation: IPFS/Supabase storage",
        "On-chain Events: minted productHash, tokenId",
      ],
    },
    {
      id: 3,
      name: "Scan",
      icon: QrCode,
      color: "from-yellow-500 to-orange-500",
      description:
        "Barcode/QR scanner, RFID gateway, verification, offline mode",
      features: [
        "Barcode/QR Scanner: mobile reading",
        "RFID/NFC Gateway: edge device reading",
        "Verification: hash vs Supabase/on-chain",
        "Quick Actions: mark received, start QA",
        "Offline Mode: queue scans, sync when online",
      ],
    },
    {
      id: 4,
      name: "IoT",
      icon: Cpu,
      color: "from-red-500 to-rose-500",
      description: "Edge devices, device registry, telemetry, alerting, OTA",
      features: [
        "Edge Devices: RFID readers, GPS trackers",
        "Device Registry: deviceId, firmware, owner",
        "Telemetry Ingest: real-time data streaming",
        "Alerting: rules engine for thresholds",
        "OTA & Security: firmware updates, attestation",
      ],
    },
    {
      id: 5,
      name: "Analytics",
      icon: BarChart3,
      color: "from-indigo-500 to-blue-500",
      description:
        "Time-series DB, dashboards, root-cause analysis, predictions",
      features: [
        "Time-series DB: materialized views",
        "Dashboards: delivery KPIs, cold-chain breaches",
        "Root-cause analysis: correlate QA failures",
        "Prediction Models: ETA, demand, spoilage risk",
        "Export & Reports: CSV, PDF, auditor view",
      ],
    },
    {
      id: 6,
      name: "Optimization",
      icon: TrendingUp,
      color: "from-teal-500 to-cyan-500",
      description:
        "Route engine, inventory optimization, gas savings, scheduler",
      features: [
        "Route Optimization: shipment grouping",
        "Inventory Optimization: reorder suggestions",
        "Batching & Gas: transaction grouping",
        "Scheduler: recurring checks, alerts",
        "Cost Optimization: shipping simulations",
      ],
    },
    {
      id: 7,
      name: "Quality",
      icon: CheckCircle,
      color: "from-lime-500 to-green-500",
      description:
        "QA test cases, execution records, certifications, expiry management",
      features: [
        "QA Test Cases: per product type suites",
        "Test Execution Records: inspector results",
        "Certification Issuance: signed certificates",
        "Traceable Samples: lab results linkage",
        "Expiry Management: reminders, sales blocking",
      ],
    },
    {
      id: 8,
      name: "Compliance",
      icon: Shield,
      color: "from-amber-500 to-yellow-500",
      description:
        "Profiles, audit trails, automated checks, digital signatures",
      features: [
        "Compliance Profiles: per-market rules",
        "Audit Trail: immutable event log",
        "Automated Checks: QA certificate validation",
        "Digital Signatures: regulator reports",
        "Recall Management: affected product identification",
      ],
    },
    {
      id: 9,
      name: "Sensors",
      icon: Thermometer,
      color: "from-fuchsia-500 to-purple-500",
      description:
        "Environmental, motion, security, specialized sensor support",
      features: [
        "Environmental: Temperature, Humidity, Light",
        "Motion: Shock/vibration, Tilt, Free-fall",
        "Security: Tamper-evident, Seal break detection",
        "Specialized: Gas, pH, Moisture, CO₂ sensors",
        "Location: GPS, GNSS, Cell triangulation",
      ],
    },
  ];

  const stats = [
    { name: "Active Products", value: "1,247", change: "+12%", icon: Package },
    { name: "Shipments Tracked", value: "843", change: "+8%", icon: Truck },
    { name: "NFTs Minted", value: "2,109", change: "+15%", icon: Coins },
    { name: "IoT Devices", value: "156", change: "+5%", icon: Cpu },
    { name: "Verified Scans", value: "5,672", change: "+22%", icon: QrCode },
    {
      name: "Quality Tests",
      value: "3,421",
      change: "+18%",
      icon: CheckCircle,
    },
  ];

  const techStack = [
    {
      name: "Blockchain",
      tech: "Solidity (Hardhat), Polygon/Arbitrum",
      icon: Lock,
    },
    {
      name: "Frontend",
      tech: "React + TypeScript + Tailwind CSS",
      icon: Globe,
    },
    {
      name: "Backend",
      tech: "Supabase (Postgres, Realtime, Auth)",
      icon: Database,
    },
    { name: "Wallets", tech: "MPC Multisig (Fireblocks/Safe)", icon: Shield },
    { name: "IoT Layer", tech: "LoRa/MQTT gateways for RFID/GPS", icon: Wifi },
    { name: "AI & Security", tech: "ML + Zero-Knowledge Proofs", icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-6">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-20"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, ${
                ["#3B82F6", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B"][
                  Math.floor(Math.random() * 5)
                ]
              } 0%, transparent 70%)`,
            }}
            animate={{
              x: [0, (Math.random() - 0.5) * 100],
              y: [0, (Math.random() - 0.5) * 100],
              scale: [1, Math.random() * 2 + 0.5],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          key={`header-${animationKey}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <motion.h1
            className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 mb-4"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            ProTrack Supply Chain
          </motion.h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            End-to-end blockchain-powered supply chain transparency with IoT
            integration, NFT tokenization, and real-time analytics
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          key={`stats-${animationKey}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.name}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl p-4 border border-gray-700/50 shadow-xl"
                whileHover={{ scale: 1.05, y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 300,
                }}
              >
                <div className="flex items-center justify-between">
                  <Icon className="h-8 w-8 text-blue-400" />
                  <span className="text-green-400 text-sm font-bold">
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-2xl font-bold mt-2">{stat.value}</h3>
                <p className="text-gray-400 text-sm mt-1">{stat.name}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Main Feature Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Active Module Highlight */}
          <motion.div
            key={`module-${activeModule}-${animationKey}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-3xl p-8 border border-gray-700/50 shadow-2xl"
          >
            <div className="flex items-center mb-6">
              <div
                className={`p-4 rounded-2xl bg-gradient-to-r ${modules[activeModule].color}`}
              >
                {React.createElement(modules[activeModule].icon, {
                  className: "h-10 w-10 text-white",
                })}
              </div>
              <div className="ml-4">
                <h2 className="text-3xl font-bold">
                  {modules[activeModule].name}
                </h2>
                <p className="text-gray-400">
                  {modules[activeModule].description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {modules[activeModule].features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  className="flex items-start p-4 bg-gray-800/30 rounded-xl border border-gray-700/30"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div
                    className={`flex-shrink-0 mt-1 w-3 h-3 rounded-full bg-gradient-to-r ${modules[activeModule].color}`}
                  />
                  <p className="ml-3 text-gray-300">{feature}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Module Selector */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold mb-4">System Modules</h3>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {modules.map((module, index) => {
                const Icon = module.icon;
                return (
                  <motion.div
                    key={module.id}
                    className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 ${
                      activeModule === index
                        ? `bg-gradient-to-r ${module.color} shadow-lg`
                        : "bg-gray-800/50 hover:bg-gray-800/70"
                    }`}
                    onClick={() => setActiveModule(index)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <div className="flex items-center">
                      <Icon
                        className={`h-6 w-6 ${
                          activeModule === index
                            ? "text-white"
                            : "text-gray-400"
                        }`}
                      />
                      <span
                        className={`ml-3 font-medium ${
                          activeModule === index
                            ? "text-white"
                            : "text-gray-300"
                        }`}
                      >
                        {module.name}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <motion.div
          key={`tech-${animationKey}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-3xl p-8 border border-gray-700/50 shadow-2xl mb-12"
        >
          <h3 className="text-2xl font-bold mb-6 text-center">
            Technology Stack
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {techStack.map((tech, index) => {
              const Icon = tech.icon;
              return (
                <motion.div
                  key={tech.name}
                  className="flex items-start p-4 bg-gray-800/30 rounded-xl border border-gray-700/30"
                  whileHover={{ scale: 1.03, y: -3 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold text-lg">{tech.name}</h4>
                    <p className="text-gray-400">{tech.tech}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Integration Flow */}
        <motion.div
          key={`flow-${animationKey}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-3xl p-8 border border-gray-700/50 shadow-2xl"
        >
          <h3 className="text-2xl font-bold mb-6 text-center">
            Supply Chain Integration Flow
          </h3>

          <div className="relative">
            {/* Flow Diagram */}
            <div className="flex flex-col md:flex-row justify-between items-center pt-8 pb-8">
              {[
                {
                  icon: Factory,
                  label: "Create Product",
                  color: "text-blue-400",
                },
                {
                  icon: Package,
                  label: "Assign to Shipment",
                  color: "text-green-400",
                },
                { icon: Coins, label: "Mint NFT", color: "text-purple-400" },
                { icon: Cpu, label: "IoT Monitoring", color: "text-red-400" },
                {
                  icon: QrCode,
                  label: "Scan & Verify",
                  color: "text-yellow-400",
                },
                {
                  icon: CheckCircle,
                  label: "QA Testing",
                  color: "text-lime-400",
                },
                {
                  icon: Shield,
                  label: "Compliance Check",
                  color: "text-amber-400",
                },
                { icon: Home, label: "Delivery", color: "text-cyan-400" },
              ].map((step, index) => {
                const Icon = step.icon;
                return (
                  <React.Fragment key={index}>
                    <motion.div
                      className="flex flex-col items-center z-10"
                      whileHover={{ scale: 1.1 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div
                        className={`p-4 rounded-full bg-gray-800 border-2 ${step.color.replace(
                          "text-",
                          "border-"
                        )} mb-2`}
                      >
                        <Icon className={`h-8 w-8 ${step.color}`} />
                      </div>
                      <span className="text-center text-sm font-medium text-gray-300 max-w-[100px]">
                        {step.label}
                      </span>
                    </motion.div>

                    {index < 7 && (
                      <motion.div
                        className="hidden md:block h-1 w-full bg-gradient-to-r from-blue-500 to-purple-500 my-6"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Animated Arrows */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute top-1/2 left-0 w-full h-1"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    x: [-50, window.innerWidth + 50],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <div className="absolute right-0 top-0 w-4 h-4 border-t-2 border-r-2 border-blue-400 transform rotate-45"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          key={`footer-${animationKey}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center mt-12 pt-8 border-t border-gray-800"
        >
          <p className="text-gray-500">
            ProTrack Supply Chain Management System • Blockchain • IoT • NFT
            Tokenization
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ProjectOverviewDashboard;
