const BACKEND_URL = "http://localhost:54112";

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  token?: string;
  user?: any;
}

export interface Product {
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

export interface Shipment {
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

class API {
  private baseUrl: string;

  constructor() {
    this.baseUrl = BACKEND_URL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `API Error: ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async walletLogin(walletAddress: string, role: string): Promise<ApiResponse<any>> {
    return this.request("/api/v1/auth/wallet-login", {
      method: "POST",
      body: JSON.stringify({ wallet_address: walletAddress, role }),
    });
  }

  // Products
  async getProducts(): Promise<ApiResponse<{ products: Product[] }>> {
    return this.request("/api/v1/products");
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    return this.request(`/api/v1/products/${id}`);
  }

  async createProduct(product: Omit<Product, "id" | "created_at" | "updated_at">): Promise<ApiResponse<Product>> {
    return this.request("/api/v1/products", {
      method: "POST",
      body: JSON.stringify(product),
    });
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<ApiResponse<Product>> {
    return this.request(`/api/v1/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(product),
    });
  }

  // Shipments
  async getShipments(): Promise<ApiResponse<{ shipments: Shipment[] }>> {
    return this.request("/api/v1/shipments");
  }

  async getShipment(id: string): Promise<ApiResponse<Shipment>> {
    return this.request(`/api/v1/shipments/${id}`);
  }

  async createShipment(shipment: Omit<Shipment, "id" | "created_at" | "updated_at">): Promise<ApiResponse<Shipment>> {
    return this.request("/api/v1/shipments", {
      method: "POST",
      body: JSON.stringify(shipment),
    });
  }

  async updateShipmentStatus(
    id: string,
    status: string,
    location?: string
  ): Promise<ApiResponse<Shipment>> {
    return this.request(`/api/v1/shipments/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, location }),
    });
  }

  // Blockchain
  async getBlockchainStatus(): Promise<ApiResponse<any>> {
    return this.request("/api/v1/blockchain/status");
  }

  async mintNFT(productId: string, metadata?: any): Promise<ApiResponse<any>> {
    return this.request("/api/v1/blockchain/mint-nft", {
      method: "POST",
      body: JSON.stringify({ product_id: productId, metadata }),
    });
  }

  async updateBlockchainStatus(productId: string, status: string, metadata?: any): Promise<ApiResponse<any>> {
    return this.request("/api/v1/blockchain/update-status", {
      method: "POST",
      body: JSON.stringify({ product_id: productId, status, metadata }),
    });
  }

  // IoT
  async getIoTDevices(): Promise<ApiResponse<any>> {
    return this.request("/api/v1/iot/devices");
  }

  async getIoTReadings(deviceId: string): Promise<ApiResponse<any>> {
    return this.request(`/api/v1/iot/readings/${deviceId}`);
  }

  // Analytics
  async getAnalyticsMetrics(): Promise<ApiResponse<any>> {
    return this.request("/api/v1/analytics/metrics");
  }

  // IPFS
  async getIPFSStatus(): Promise<ApiResponse<any>> {
    return this.request("/api/v1/ipfs/status");
  }
}

export const api = new API();
