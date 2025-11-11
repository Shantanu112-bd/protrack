import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config();

// Types
interface ProTrackRequest extends Request {
  userId?: string;
  userRole?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

// Enhanced ProTrack Server
class ProTrackEnhancedServer {
  private app: express.Application;
  private server: any;
  private io: SocketIOServer;
  private port: number;
  private environment: string;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.port = parseInt(process.env.PORT || "3001", 10);
    this.environment = process.env.NODE_ENV || "development";

    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
      },
      transports: ["websocket", "polling"],
    });

    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeSocketIO();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "http://localhost:*", "ws://localhost:*"],
          },
        },
      })
    );

    // CORS configuration
    this.app.use(
      cors({
        origin: [
          process.env.FRONTEND_URL || "http://localhost:5173",
          "http://localhost:3000",
          "http://localhost:5173",
        ],
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: [
          "Content-Type",
          "Authorization",
          "X-Requested-With",
          "X-API-Key",
        ],
      })
    );

    // Compression and parsing
    this.app.use(compression());
    this.app.use(express.json({ limit: "50mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "50mb" }));

    // Logging
    this.app.use(morgan("combined"));

    // Request logging middleware
    this.app.use((req: ProTrackRequest, res: Response, next: NextFunction) => {
      const start = Date.now();
      res.on("finish", () => {
        const duration = Date.now() - start;
        console.log(
          `${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`
        );
      });
      next();
    });
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get("/health", (req: Request, res: Response) => {
      res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: this.environment,
        services: {
          api: "running",
          websocket: "running",
          database: "configured",
          blockchain: "ready",
        },
        version: "2.0.0",
      });
    });

    // Root endpoint
    this.app.get("/", (req: Request, res: Response) => {
      res.json({
        name: "ProTrack API",
        version: "2.0.0",
        description: "Web3 Supply Chain Management Platform",
        documentation: "/api/v1/docs",
        status: "running",
      });
    });

    // ==================== API V1 Routes ====================

    // Status endpoint
    this.app.get("/api/v1/status", (req: Request, res: Response) => {
      this.sendResponse(res, true, "ProTrack API is running", {
        version: "2.0.0",
        environment: this.environment,
        timestamp: new Date().toISOString(),
      });
    });

    // ==================== Authentication Routes ====================

    this.app.post("/api/v1/auth/login", (req: ProTrackRequest, res: Response) => {
      const { email, password } = req.body;

      if (!email || !password) {
        return this.sendResponse(
          res,
          false,
          "Email and password are required",
          null,
          400
        );
      }

      // Mock authentication
      this.sendResponse(res, true, "Login successful", {
        user: {
          id: "user-123",
          email: email,
          role: "admin",
          name: "Admin User",
        },
        token: "mock-jwt-token-" + Date.now(),
        expiresIn: 86400,
      });
    });

    this.app.post(
      "/api/v1/auth/register",
      (req: ProTrackRequest, res: Response) => {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
          return this.sendResponse(
            res,
            false,
            "Email, password, and name are required",
            null,
            400
          );
        }

        this.sendResponse(res, true, "Registration successful", {
          user: {
            id: "user-" + Date.now(),
            email: email,
            name: name,
            role: "user",
          },
          token: "mock-jwt-token-" + Date.now(),
        });
      }
    );

    this.app.post("/api/v1/auth/logout", (req: Request, res: Response) => {
      this.sendResponse(res, true, "Logout successful");
    });

    // ==================== Product Routes ====================

    this.app.get("/api/v1/products", (req: Request, res: Response) => {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const mockProducts = [
        {
          id: "prod-001",
          name: "Coffee Beans",
          sku: "COFFEE-001",
          origin: "Colombia",
          batch: "2024-A",
          status: "in-transit",
          createdAt: new Date().toISOString(),
        },
        {
          id: "prod-002",
          name: "Tea Leaves",
          sku: "TEA-001",
          origin: "India",
          batch: "2024-B",
          status: "delivered",
          createdAt: new Date().toISOString(),
        },
      ];

      this.sendResponse(res, true, "Products retrieved", {
        products: mockProducts,
        pagination: {
          page,
          limit,
          total: mockProducts.length,
          pages: Math.ceil(mockProducts.length / limit),
        },
      });
    });

    this.app.post("/api/v1/products", (req: Request, res: Response) => {
      const { name, sku, origin, batch } = req.body;

      if (!name || !sku) {
        return this.sendResponse(
          res,
          false,
          "Name and SKU are required",
          null,
          400
        );
      }

      this.sendResponse(res, true, "Product created successfully", {
        product: {
          id: "prod-" + Date.now(),
          name,
          sku,
          origin: origin || "Unknown",
          batch: batch || "N/A",
          status: "created",
          createdAt: new Date().toISOString(),
        },
      });
    });

    this.app.get("/api/v1/products/:id", (req: Request, res: Response) => {
      const { id } = req.params;

      this.sendResponse(res, true, "Product retrieved", {
        product: {
          id,
          name: "Sample Product",
          sku: "SKU-001",
          origin: "Unknown",
          batch: "2024-A",
          status: "active",
          createdAt: new Date().toISOString(),
        },
      });
    });

    // ==================== Web3/NFT Routes ====================

    this.app.get("/api/v1/web3/nfts", (req: Request, res: Response) => {
      this.sendResponse(res, true, "NFTs retrieved", {
        nfts: [
          {
            id: "nft-001",
            name: "Coffee Bean NFT",
            tokenId: 1,
            owner: "0x1234...5678",
            contractAddress: "0xabcd...efgh",
            metadata: {
              origin: "Colombia",
              batch: "2024-A",
              image: "ipfs://...",
            },
            createdAt: new Date().toISOString(),
          },
          {
            id: "nft-002",
            name: "Tea Leaf NFT",
            tokenId: 2,
            owner: "0x1234...5678",
            contractAddress: "0xabcd...efgh",
            metadata: {
              origin: "India",
              batch: "2024-B",
              image: "ipfs://...",
            },
            createdAt: new Date().toISOString(),
          },
        ],
        total: 2,
      });
    });

    this.app.post("/api/v1/web3/mint", (req: Request, res: Response) => {
      const { name, origin, batchId, metadata } = req.body;

      if (!name) {
        return this.sendResponse(
          res,
          false,
          "Product name is required",
          null,
          400
        );
      }

      const tokenId = Math.floor(Math.random() * 1000000);
      const txHash = "0x" + Math.random().toString(16).substr(2, 64);

      this.sendResponse(res, true, "NFT minted successfully", {
        tokenId,
        transactionHash: txHash,
        contractAddress: "0xabcd...efgh",
        metadata: {
          name,
          origin: origin || "Unknown",
          batch: batchId || "N/A",
          ...metadata,
        },
        gasUsed: "150000",
        blockNumber: Math.floor(Math.random() * 1000000),
      });
    });

    this.app.post("/api/v1/web3/transfer", (req: Request, res: Response) => {
      const { tokenId, toAddress } = req.body;

      if (!tokenId || !toAddress) {
        return this.sendResponse(
          res,
          false,
          "Token ID and recipient address are required",
          null,
          400
        );
      }

      this.sendResponse(res, true, "NFT transferred successfully", {
        tokenId,
        toAddress,
        transactionHash: "0x" + Math.random().toString(16).substr(2, 64),
        blockNumber: Math.floor(Math.random() * 1000000),
        gasUsed: "100000",
      });
    });

    // ==================== Blockchain Routes ====================

    this.app.get("/api/v1/blockchain/status", (req: Request, res: Response) => {
      this.sendResponse(res, true, "Blockchain status retrieved", {
        connected: true,
        status: "online",
        network: "Ethereum Mainnet",
        chainId: 1,
        blockNumber: Math.floor(Math.random() * 1000000),
        gasPrice: "20 Gwei",
        contractAddress: "0x1234567890123456789012345678901234567890",
        lastUpdate: new Date().toISOString(),
      });
    });

    this.app.get(
      "/api/v1/blockchain/contracts",
      (req: Request, res: Response) => {
        this.sendResponse(res, true, "Contracts retrieved", {
          contracts: [
            {
              name: "ProTrackNFT",
              address: "0x1234...5678",
              type: "ERC721",
              status: "deployed",
            },
            {
              name: "SupplyChain",
              address: "0xabcd...efgh",
              type: "Custom",
              status: "deployed",
            },
          ],
        });
      }
    );

    // ==================== IoT Routes ====================

    this.app.get("/api/v1/iot/devices", (req: Request, res: Response) => {
      this.sendResponse(res, true, "IoT devices retrieved", {
        devices: [
          {
            id: "iot-001",
            name: "Temperature Sensor",
            type: "temperature",
            status: "active",
            lastReading: 22.5,
            unit: "°C",
          },
          {
            id: "iot-002",
            name: "Humidity Sensor",
            type: "humidity",
            status: "active",
            lastReading: 65,
            unit: "%",
          },
        ],
        count: 2,
      });
    });

    this.app.get("/api/v1/iot/data/:deviceId", (req: Request, res: Response) => {
      const { deviceId } = req.params;

      this.sendResponse(res, true, "IoT data retrieved", {
        deviceId,
        data: [
          { timestamp: new Date().toISOString(), value: 22.5 },
          { timestamp: new Date(Date.now() - 60000).toISOString(), value: 22.3 },
          { timestamp: new Date(Date.now() - 120000).toISOString(), value: 22.1 },
        ],
      });
    });

    // ==================== IPFS Routes ====================

    this.app.get("/api/v1/ipfs/status", (req: Request, res: Response) => {
      this.sendResponse(res, true, "IPFS status retrieved", {
        connected: false,
        status: "offline",
        message: "Configure IPFS to enable file uploads",
        gateway: "https://ipfs.io/ipfs/",
      });
    });

    this.app.post("/api/v1/ipfs/upload", (req: Request, res: Response) => {
      this.sendResponse(res, true, "File upload endpoint", {
        message: "Configure IPFS to enable file uploads",
        ipfsHash: "QmXxxx...",
      });
    });

    // ==================== Analytics Routes ====================

    this.app.get("/api/v1/analytics/metrics", (req: Request, res: Response) => {
      this.sendResponse(res, true, "Analytics metrics retrieved", {
        totalUsers: 150,
        totalProducts: 45,
        totalEvents: 1250,
        activeUsers: 32,
        nftsMinted: 89,
        transactionsCompleted: 234,
        averageGasUsed: "125000",
        productsByStatus: {
          created: 10,
          "in-transit": 15,
          delivered: 20,
        },
        eventsByType: {
          mint: 89,
          transfer: 45,
          burn: 5,
        },
      });
    });

    this.app.get("/api/v1/analytics/reports", (req: Request, res: Response) => {
      this.sendResponse(res, true, "Analytics reports retrieved", {
        reports: [
          {
            id: "report-001",
            name: "Monthly Summary",
            type: "summary",
            createdAt: new Date().toISOString(),
          },
          {
            id: "report-002",
            name: "NFT Activity",
            type: "nft",
            createdAt: new Date().toISOString(),
          },
        ],
      });
    });

    // ==================== Notifications Routes ====================

    this.app.get(
      "/api/v1/notifications",
      (req: Request, res: Response) => {
        this.sendResponse(res, true, "Notifications retrieved", {
          notifications: [
            {
              id: "notif-001",
              title: "Product Created",
              message: "New product added to system",
              type: "info",
              read: false,
              createdAt: new Date().toISOString(),
            },
          ],
          count: 1,
          unreadCount: 1,
        });
      }
    );

    this.app.post(
      "/api/v1/notifications/subscribe",
      (req: Request, res: Response) => {
        this.sendResponse(res, true, "Subscribed to notifications", {
          subscriptionId: "sub-" + Date.now(),
        });
      }
    );

    // ==================== Documentation Routes ====================

    this.app.get("/api/v1/docs", (req: Request, res: Response) => {
      this.sendResponse(res, true, "API Documentation", {
        version: "1.0.0",
        endpoints: {
          auth: [
            "POST /api/v1/auth/login",
            "POST /api/v1/auth/register",
            "POST /api/v1/auth/logout",
          ],
          products: [
            "GET /api/v1/products",
            "POST /api/v1/products",
            "GET /api/v1/products/:id",
          ],
          web3: [
            "GET /api/v1/web3/nfts",
            "POST /api/v1/web3/mint",
            "POST /api/v1/web3/transfer",
          ],
          blockchain: [
            "GET /api/v1/blockchain/status",
            "GET /api/v1/blockchain/contracts",
          ],
          iot: [
            "GET /api/v1/iot/devices",
            "GET /api/v1/iot/data/:deviceId",
          ],
          analytics: [
            "GET /api/v1/analytics/metrics",
            "GET /api/v1/analytics/reports",
          ],
        },
      });
    });

    // Catch-all route
    this.app.use("*", (req: Request, res: Response) => {
      this.sendResponse(
        res,
        false,
        "Route not found",
        { path: req.originalUrl },
        404
      );
    });
  }

  private initializeSocketIO(): void {
    this.io.on("connection", (socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);

      // Join user-specific room
      socket.on("join-user-room", (userId: string) => {
        socket.join(`user-${userId}`);
        console.log(`User ${userId} joined their room`);
      });

      // Join product-specific room
      socket.on("join-product-room", (productId: string) => {
        socket.join(`product-${productId}`);
        console.log(`Client joined product room: ${productId}`);
      });

      // Subscribe to IoT data
      socket.on("subscribe-iot", (deviceId: string) => {
        socket.join(`iot-${deviceId}`);
        console.log(`Client subscribed to IoT device: ${deviceId}`);

        // Simulate IoT data streaming
        const interval = setInterval(() => {
          this.io.to(`iot-${deviceId}`).emit("iot-data", {
            deviceId,
            value: Math.random() * 100,
            timestamp: new Date().toISOString(),
          });
        }, 5000);

        socket.on("disconnect", () => {
          clearInterval(interval);
        });
      });

      // Subscribe to blockchain events
      socket.on("subscribe-blockchain", () => {
        socket.join("blockchain-events");
        console.log(`Client subscribed to blockchain events`);
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
      });

      // Error handling
      socket.on("error", (error) => {
        console.error(`Socket error: ${error}`);
      });
    });
  }

  private initializeErrorHandling(): void {
    // Global error handler
    this.app.use(
      (
        err: any,
        req: Request,
        res: Response,
        next: NextFunction
      ) => {
        console.error("Error:", err);

        const status = err.status || 500;
        const message = err.message || "Internal Server Error";

        this.sendResponse(res, false, message, null, status);
      }
    );
  }

  private sendResponse(
    res: Response,
    success: boolean,
    message: string,
    data: any = null,
    status: number = 200
  ): void {
    const response: ApiResponse = {
      success,
      message,
      timestamp: new Date().toISOString(),
    };

    if (data) {
      response.data = data;
    }

    res.status(status).json(response);
  }

  public start(): void {
    this.server.listen(this.port, () => {
      console.log(`\n${"=".repeat(60)}`);
      console.log(`🚀 ProTrack Backend Server v2.0.0`);
      console.log(`${"=".repeat(60)}`);
      console.log(`📍 Server running on port ${this.port}`);
      console.log(`🌐 Environment: ${this.environment}`);
      console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
      console.log(`📡 WebSocket enabled for real-time features`);
      console.log(`${"=".repeat(60)}\n`);

      console.log("📋 Available Endpoints:\n");
      console.log("Authentication:");
      console.log("  POST   /api/v1/auth/login");
      console.log("  POST   /api/v1/auth/register");
      console.log("  POST   /api/v1/auth/logout\n");

      console.log("Products:");
      console.log("  GET    /api/v1/products");
      console.log("  POST   /api/v1/products");
      console.log("  GET    /api/v1/products/:id\n");

      console.log("Web3/NFT:");
      console.log("  GET    /api/v1/web3/nfts");
      console.log("  POST   /api/v1/web3/mint");
      console.log("  POST   /api/v1/web3/transfer\n");

      console.log("Blockchain:");
      console.log("  GET    /api/v1/blockchain/status");
      console.log("  GET    /api/v1/blockchain/contracts\n");

      console.log("IoT:");
      console.log("  GET    /api/v1/iot/devices");
      console.log("  GET    /api/v1/iot/data/:deviceId\n");

      console.log("Analytics:");
      console.log("  GET    /api/v1/analytics/metrics");
      console.log("  GET    /api/v1/analytics/reports\n");

      console.log("Notifications:");
      console.log("  GET    /api/v1/notifications");
      console.log("  POST   /api/v1/notifications/subscribe\n");

      console.log("Documentation:");
      console.log("  GET    /api/v1/docs");
      console.log("  GET    /health\n");

      console.log(`${"=".repeat(60)}\n`);
    });
  }
}

// Start the server
const server = new ProTrackEnhancedServer();
server.start();

export default ProTrackEnhancedServer;
