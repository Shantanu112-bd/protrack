/**
 * Supabase Client Configuration
 * Handles authentication and database operations
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase configuration missing. Please check your environment variables.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: 'manufacturer' | 'packager' | 'wholesaler' | 'seller' | 'inspector' | 'customer' | 'admin'
          company_name?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          role: 'manufacturer' | 'packager' | 'wholesaler' | 'seller' | 'inspector' | 'customer' | 'admin'
          company_name?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'manufacturer' | 'packager' | 'wholesaler' | 'seller' | 'inspector' | 'customer' | 'admin'
          company_name?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          sku: string
          batch_number: string
          category: string
          description?: string
          expiry_date: string
          manufacturer_id: string
          status: 'active' | 'recalled' | 'expired'
          blockchain_hash?: string
          qr_code?: string
          rfid_tag?: string
          created_at: string
          updated_at: string
        }
      }
    }
  }
}
