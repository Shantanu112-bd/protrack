import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

interface User {
  id: string;
  wallet_address: string;
  role: string;
  email?: string;
  created_at?: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  manufacturer: string;
  batch_number: string;
  ipfs_hash?: string;
  blockchain_hash?: string;
  created_at: string;
  updated_at: string;
}

interface Shipment {
  id: string;
  product_id: string;
  origin: string;
  destination: string;
  status: "pending" | "in_transit" | "delivered";
  current_location: string;
  blockchain_hash?: string;
  created_at: string;
  updated_at: string;
}

// In-memory storage for demo (replace with DB in production)
const users = new Map<string, User>();
const products = new Map<string, Product>();
const shipments = new Map<string, Shipment>();

class ProTrackServer {
  private app: express.Application;
  private server: any;
  private io: SocketIOServer;
  private port: number;

  constructor() {
    this.port = parseInt(process.env.PORT || "3001", 10);
    this.app = express();
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: process.env.FRONTEND_URL || ["http://localhost:5173", "http://localhost:5174"],
        methods: ["GET", "POST"],
      },
    });

    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeSocketIO();
  }

  private initializeMiddleware(): void {
    this.app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
          },
        },
      })
    );

    this.app.use(
      cors({
        origin: [
          process.env.FRONTEND_URL || "http://localhost:5173",
          "http://localhost:5174",
          "http://localhost:3000",
        ],
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
      })
    );

    this.app.use(compression());
    this.app.use(express.json({ limit: "50mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "50mb" }));
    this.app.use(morgan("combined"));
  }

  private initializeRoutes(): void {
    // ==================== HEALTH CHECK ====================
    this.app.get("/health", (req, res) => {
      res.json({ status: "healthy", timestamp: new Date().toISOString() });
    });

    this.app.get("/api/v1/status", (req, res) => {
      res.json({
        success: true,
        message: "ProTrack API is running",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
      });
    });

    // ==================== AUTH ROUTES ====================
    this.app.post("/api/v1/auth/login", (req, res) => {
      const { email, password } = req.body;
      res.status(501).json({
        success: false,
        message: "Email/password login not yet implemented. Use wallet login.",
      });
    });

    this.app.post("/api/v1/auth/register", (req, res) => {
      const { email, password, role } = req.body;
      res.status(501).json({
        success: false,
        message: "Email/password registration not yet implemented. Use wallet login.",
      });
    });

    this.app.post("/api/v1/auth/wallet-login", (req, res) => {
      try {
        const { wallet_address, role } = req.body;

        if (!wallet_address || !role) {
          return res.status(400).json({
            success: false,
            message: "Wallet address and role are required",
          });
        }

        // Create or fetch user
        let user = Array.from(users.values()).find((u) => u.wallet_address === wallet_address);

        if (!user) {
          user = {
            id: crypto.randomUUID(),
            wallet_address: wallet_address.toLowerCase(),
            role,
            email: `${wallet_address.toLowerCase()}@wallet.local`,
            created_at: new Date().toISOString(),
          };
          users.set(user.id, user);
        }

        const token = `wallet-${wallet_address}-${Date.now()}`;
        const refreshToken = `refresh-${wallet_address}-${Date.now()}`;

        res.json({
          success: true,
          message: "Wallet login successful",
          token,
          refreshToken,
          user: {
            id: user.id,
            wallet_address: user.wallet_address,
            role: user.role,
            email: user.email,
          },
        });
      } catch (err) {
        console.error("Wallet login error:", err);
        res.status(500).json({ success: false, message: "Authentication failed" });
      }
    });

    // ==================== PRODUCT ROUTES ====================
    this.app.get("/api/v1/products", (req, res) => {
      try {
        const productList = Array.from(products.values());
        res.json({
          success: true,
          data: {
            products: productList,
            pagination: {
              page: 1,
              limit: 20,
              total: productList.length,
              pages: Math.ceil(productList.length / 20),
            },
          },
        });
      } catch (err) {
        console.error("Get products error:", err);
        res.status(500).json({ success: false, message: "Failed to fetch products" });
      }
    });

    this.app.post("/api/v1/products", (req, res) => {
      try {
        const { name, description, manufacturer, batch_number } = req.body;

        if (!name || !manufacturer) {
          return res.status(400).json({
            success: false,
            message: "Name and manufacturer are required",
          });
        }

        const product: Product = {
          id: crypto.randomUUID(),
          name,
          description: description || "",
          manufacturer,
          batch_number: batch_number || `BATCH-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        products.set(product.id, product);

        // Emit socket event
        this.io.emit("product:created", product);

        res.status(201).json({
          success: true,
          message: "Product created successfully",
          data: product,
        });
      } catch (err) {
        console.error("Create product error:", err);
        res.status(500).json({ success: false, message: "Failed to create product" });
      }
    });

    this.app.get("/api/v1/products/:id", (req, res) => {
      try {
        const product = products.get(req.params.id);
        if (!product) {
          return res.status(404).json({ success: false, message: "Product not found" });
        }
        res.json({ success: true, data: product });
      } catch (err) {
        console.error("Get product error:", err);
        res.status(500).json({ success: false, message: "Failed to fetch product" });
      }
    });

    this.app.put("/api/v1/products/:id", (req, res) => {
      try {
        const product = products.get(req.params.id);
        if (!product) {
          return res.status(404).json({ success: false, message: "Product not found" });
        }

        const updated: Product = {
          ...product,
          ...req.body,
          id: product.id, // Prevent ID override
          updated_at: new Date().toISOString(),
        };

        products.set(req.params.id, updated);

        res.json({
          success: true,
          message: "Product updated successfully",
          data: updated,
        });
      } catch (err) {
        console.error("Update product error:", err);
        res.status(500).json({ success: false, message: "Failed to update product" });
      }
    });

    // ==================== SHIPMENT ROUTES ====================
    this.app.get("/api/v1/shipments", (req, res) => {
      try {
        const shipmentList = Array.from(shipments.values());
        res.json({
          success: true,
          data: {
            shipments: shipmentList,
            pagination: {
              page: 1,
              limit: 20,
              total: shipmentList.length,
              pages: Math.ceil(shipmentList.length / 20),
            },
          },
        });
      } catch (err) {
        console.error("Get shipments error:", err);
        res.status(500).json({ success: false, message: "Failed to fetch shipments" });
      }
    });

    this.app.post("/api/v1/shipments", (req, res) => {
      try {
        const { product_id, origin, destination } = req.body;

        if (!product_id || !origin || !destination) {
          return res.status(400).json({
            success: false,
            message: "product_id, origin, and destination are required",
          });
        }

        const shipment: Shipment = {
          id: crypto.randomUUID(),
          product_id,
          origin,
          destination,
          status: "pending",
          current_location: origin,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        shipments.set(shipment.id, shipment);
        this.io.emit("shipment:created", shipment);

        res.status(201).json({
          success: true,
          message: "Shipment created successfully",
          data: shipment,
        });
      } catch (err) {
        console.error("Create shipment error:", err);
        res.status(500).json({ success: false, message: "Failed to create shipment" });
      }
    });

    this.app.get("/api/v1/shipments/:id", (req, res) => {
      try {
        const shipment = shipments.get(req.params.id);
        if (!shipment) {
          return res.status(404).json({ success: false, message: "Shipment not found" });
        }
        res.json({ success: true, data: shipment });
      } catch (err) {
        console.error("Get shipment error:", err);
        res.status(500).json({ success: false, message: "Failed to fetch shipment" });
      }
    });

    this.app.patch("/api/v1/shipments/:id/status", (req, res) => {
      try {
        const shipment = shipments.get(req.params.id);
        if (!shipment) {
          return res.status(404).json({ success: false, message: "Shipment not found" });
        }

        const { status, location } = req.body;
        if (!status) {
          return res.status(400).json({ success: false, message: "Status is required" });
        }

        const validStatuses = ["pending", "in_transit", "delivered"];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({ success: false, message: "Invalid status" });
        }

        const updated: Shipment = {
          ...shipment,
          status: status as any,
          current_location: location || shipment.current_location,
          updated_at: new Date().toISOString(),
        };

        shipments.set(req.params.id, updated);
        this.io.emit("shipment:updated", updated);

        res.json({
          success: true,
          message: "Shipment status updated",
          data: updated,
        });
      } catch (err) {
        console.error("Update shipment error:", err);
        res.status(500).json({ success: false, message: "Failed to update shipment" });
      }
    });

    // ==================== BLOCKCHAIN ROUTES ====================
    this.app.get("/api/v1/blockchain/status", (req, res) => {
      try {
        res.json({
          success: true,
          data: {
            status: "connected",
            network: "Local Hardhat",
            chainId: 31337,
            rpcUrl: process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545",
            gasPrice: "20000000000",
            accounts: ["0x..."],
          },
        });
      } catch (err) {
        console.error("Blockchain status error:", err);
        res.status(500).json({ success: false, message: "Failed to fetch blockchain status" });
      }
    });

    this.app.post("/api/v1/blockchain/mint-nft", (req, res) => {
      try {
        const { product_id, metadata } = req.body;

        if (!product_id) {
          return res.status(400).json({
            success: false,
            message: "product_id is required",
          });
        }

        // Mock NFT creation
        const mockTx = {
          hash: `0x${crypto.randomBytes(32).toString("hex")}`,
          gasUsed: "150000",
          blockNumber: Math.floor(Math.random() * 100000),
          status: 1,
        };

        res.status(201).json({
          success: true,
          message: "NFT minting initiated",
          data: {
            transactionHash: mockTx.hash,
            tokenId: crypto.randomUUID(),
            productId: product_id,
            status: "pending",
            blockNumber: mockTx.blockNumber,
          },
        });
      } catch (err) {
        console.error("Mint NFT error:", err);
        res.status(500).json({ success: false, message: "Failed to mint NFT" });
      }
    });

    this.app.post("/api/v1/blockchain/update-status", (req, res) => {
      try {
        const { product_id, status, metadata } = req.body;

        if (!product_id || !status) {
          return res.status(400).json({
            success: false,
            message: "product_id and status are required",
          });
        }

        const mockTx = {
          hash: `0x${crypto.randomBytes(32).toString("hex")}`,
          status: 1,
        };

        res.json({
          success: true,
          message: "Status update recorded on blockchain",
          data: {
            transactionHash: mockTx.hash,
            productId: product_id,
            status,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (err) {
        console.error("Update status error:", err);
        res.status(500).json({ success: false, message: "Failed to update status on blockchain" });
      }
    });

    // ==================== IoT ROUTES ====================
    this.app.get("/api/v1/iot/devices", (req, res) => {
      try {
        res.json({
          success: true,
          data: {
            devices: [
              { id: "sensor-1", type: "temperature", location: "warehouse-a", status: "active" },
              { id: "sensor-2", type: "humidity", location: "warehouse-a", status: "active" },
              { id: "sensor-3", type: "gps", location: "truck-1", status: "active" },
            ],
          },
        });
      } catch (err) {
        console.error("Get IoT devices error:", err);
        res.status(500).json({ success: false, message: "Failed to fetch IoT devices" });
      }
    });

    this.app.get("/api/v1/iot/readings/:deviceId", (req, res) => {
      try {
        const deviceId = req.params.deviceId;
        res.json({
          success: true,
          data: {
            deviceId,
            readings: [
              { timestamp: new Date().toISOString(), value: 22.5, unit: "°C" },
              { timestamp: new Date(Date.now() - 60000).toISOString(), value: 22.3, unit: "°C" },
              { timestamp: new Date(Date.now() - 120000).toISOString(), value: 22.1, unit: "°C" },
            ],
          },
        });
      } catch (err) {
        console.error("Get IoT readings error:", err);
        res.status(500).json({ success: false, message: "Failed to fetch IoT readings" });
      }
    });

    // ==================== ANALYTICS ROUTES ====================
    this.app.get("/api/v1/analytics/metrics", (req, res) => {
      try {
        res.json({
          success: true,
          data: {
            productsTracked: products.size,
            activeShipments: Array.from(shipments.values()).filter((s) => s.status !== "delivered").length,
            verifiedItems: Math.floor(Math.random() * 1000),
            qualityTests: Math.floor(Math.random() * 100),
            complianceRate: (95 + Math.random() * 5).toFixed(2),
            alerts: Math.floor(Math.random() * 10),
          },
        });
      } catch (err) {
        console.error("Get analytics error:", err);
        res.status(500).json({ success: false, message: "Failed to fetch analytics" });
      }
    });

    // ==================== IPFS ROUTES ====================
    this.app.get("/api/v1/ipfs/status", (req, res) => {
      try {
        res.json({
          success: true,
          data: {
            status: "connected",
            gateway: "https://gateway.pinata.cloud/ipfs/",
            peersConnected: Math.floor(Math.random() * 100),
          },
        });
      } catch (err) {
        console.error("Get IPFS status error:", err);
        res.status(500).json({ success: false, message: "Failed to fetch IPFS status" });
      }
    });

    // ==================== 404 Handler ====================
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.path} not found`,
        available_endpoints: [
          "GET /health",
          "GET /api/v1/status",
          "POST /api/v1/auth/wallet-login",
          "GET /api/v1/products",
          "POST /api/v1/products",
          "GET /api/v1/products/:id",
          "PUT /api/v1/products/:id",
          "GET /api/v1/shipments",
          "POST /api/v1/shipments",
          "GET /api/v1/shipments/:id",
          "PATCH /api/v1/shipments/:id/status",
          "GET /api/v1/blockchain/status",
          "POST /api/v1/blockchain/mint-nft",
          "POST /api/v1/blockchain/update-status",
          "GET /api/v1/iot/devices",
          "GET /api/v1/iot/readings/:deviceId",
          "GET /api/v1/analytics/metrics",
          "GET /api/v1/ipfs/status",
        ],
      });
    });
  }

  private initializeSocketIO(): void {
    this.io.on("connection", (socket) => {
      console.log(`Client connected: ${socket.id}`);

      socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);
      });

      socket.on("shipment:track", (data) => {
        console.log("Tracking shipment:", data);
        socket.emit("shipment:location", {
          shipmentId: data.shipmentId,
          location: { lat: 28.7041, lng: 77.1025 },
          timestamp: new Date().toISOString(),
        });
      });
    });
  }

  public start(): void {
    this.server.listen(this.port, () => {
      console.log(`\n🚀 ProTrack Backend Server running on port ${this.port}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
      console.log(`📡 Socket.IO enabled for real-time features\n`);

      console.log("📋 Available endpoints:");
      console.log("   GET  /health - Health check");
      console.log("   GET  /api/v1/status - API status");
      console.log("   POST /api/v1/auth/wallet-login - Wallet login");
      console.log("   GET  /api/v1/products - List products");
      console.log("   POST /api/v1/products - Create product");
      console.log("   GET  /api/v1/products/:id - Get product");
      console.log("   PUT  /api/v1/products/:id - Update product");
      console.log("   GET  /api/v1/shipments - List shipments");
      console.log("   POST /api/v1/shipments - Create shipment");
      console.log("   GET  /api/v1/blockchain/status - Blockchain status");
      console.log("   POST /api/v1/blockchain/mint-nft - Mint NFT");
      console.log("   POST /api/v1/blockchain/update-status - Update status on blockchain");
      console.log("   GET  /api/v1/iot/devices - List IoT devices");
      console.log("   GET  /api/v1/analytics/metrics - Analytics metrics");
      console.log("   GET  /api/v1/ipfs/status - IPFS status\n");

      console.log("⚠️  Note: This is a demo with in-memory storage. Data will be lost on restart.\n");
    });
  }
}

const server = new ProTrackServer();
server.start();
