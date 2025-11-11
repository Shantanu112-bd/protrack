/**
 * Products API Service
 * Handles all product-related API operations
 */

import { apiClient, ApiResponse } from './client'

export interface Product {
  id: string
  name: string
  sku: string
  batchNumber: string
  category: string
  description?: string
  expiryDate: Date
  manufacturerId: string
  status: 'active' | 'recalled' | 'expired'
  blockchainHash?: string
  qrCode?: string
  rfidTag?: string
  certificates: string[]
  createdAt: Date
  updatedAt: Date
}

export interface CreateProductRequest {
  name: string
  sku: string
  batchNumber: string
  category: string
  description?: string
  expiryDate: string
  certificates?: File[]
}

export interface ProductsFilter {
  category?: string
  status?: string
  manufacturerId?: string
  page?: number
  limit?: number
}

class ProductsService {
  async getProducts(filter?: ProductsFilter): Promise<ApiResponse<Product[]>> {
    const params = new URLSearchParams()
    
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString())
        }
      })
    }

    const endpoint = `/products${params.toString() ? `?${params.toString()}` : ''}`
    return apiClient.get<Product[]>(endpoint)
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    return apiClient.get<Product>(`/products/${id}`)
  }

  async createProduct(data: CreateProductRequest): Promise<ApiResponse<Product>> {
    return apiClient.post<Product>('/products', data)
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<ApiResponse<Product>> {
    return apiClient.put<Product>(`/products/${id}`, data)
  }

  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/products/${id}`)
  }

  async verifyProduct(identifier: string): Promise<ApiResponse<Product & { isAuthentic: boolean }>> {
    return apiClient.post<Product & { isAuthentic: boolean }>('/products/verify', { identifier })
  }

  async generateQRCode(productId: string): Promise<ApiResponse<{ qrCode: string }>> {
    return apiClient.post<{ qrCode: string }>(`/products/${productId}/qr-code`)
  }

  async mintBlockchainProof(productId: string): Promise<ApiResponse<{ transactionHash: string }>> {
    return apiClient.post<{ transactionHash: string }>(`/products/${productId}/mint`)
  }
}

export const productsService = new ProductsService()
