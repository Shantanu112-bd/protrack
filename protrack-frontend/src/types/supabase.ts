export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      alerts: {
        Row: {
          id: string;
          product_id: string;
          alert_type: string;
          alert_value: number;
          threshold: number;
          timestamp: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          alert_type: string;
          alert_value: number;
          threshold: number;
          timestamp: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          alert_type?: string;
          alert_value?: number;
          threshold?: number;
          timestamp?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "alerts_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      iot_data: {
        Row: {
          id: string;
          product_id: string;
          data: Json;
          timestamp: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          data: Json;
          timestamp: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          data?: Json;
          timestamp?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "iot_data_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      mpc_key_shares: {
        Row: {
          id: string;
          token_id: string;
          user_id: string;
          encrypted_key_share: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          token_id: string;
          user_id: string;
          encrypted_key_share: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          token_id?: string;
          user_id?: string;
          encrypted_key_share?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "mpc_key_shares_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      product_history: {
        Row: {
          id: string;
          product_id: string;
          action: string;
          previous_status: string;
          new_status: string;
          actor_id: string;
          timestamp: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          action: string;
          previous_status: string;
          new_status: string;
          actor_id: string;
          timestamp: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          action?: string;
          previous_status?: string;
          new_status?: string;
          actor_id?: string;
          timestamp?: string;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_history_actor_id_fkey";
            columns: ["actor_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_history_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      product_locations: {
        Row: {
          id: string;
          product_id: string;
          latitude: number;
          longitude: number;
          accuracy: number | null;
          timestamp: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          latitude: number;
          longitude: number;
          accuracy?: number | null;
          timestamp: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          latitude?: number;
          longitude?: number;
          accuracy?: number | null;
          timestamp?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_locations_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      products: {
        Row: {
          id: string;
          rfid_tag: string;
          batch_id: string;
          token_id: string;
          manufacturer_id: string;
          current_custodian_id: string | null;
          product_name: string | null;
          expiry_date: string;
          status: string;
          max_temperature: number | null;
          min_temperature: number | null;
          max_humidity: number | null;
          min_humidity: number | null;
          max_shock: number | null;
          destination: string | null;
          expected_arrival: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          rfid_tag: string;
          batch_id: string;
          token_id: string;
          manufacturer_id: string;
          current_custodian_id?: string | null;
          product_name?: string | null;
          expiry_date: string;
          status: string;
          max_temperature?: number | null;
          min_temperature?: number | null;
          max_humidity?: number | null;
          min_humidity?: number | null;
          max_shock?: number | null;
          destination?: string | null;
          expected_arrival?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          rfid_tag?: string;
          batch_id?: string;
          token_id?: string;
          manufacturer_id?: string;
          current_custodian_id?: string | null;
          product_name?: string | null;
          expiry_date?: string;
          status?: string;
          max_temperature?: number | null;
          min_temperature?: number | null;
          max_humidity?: number | null;
          min_humidity?: number | null;
          max_shock?: number | null;
          destination?: string | null;
          expected_arrival?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_current_custodian_id_fkey";
            columns: ["current_custodian_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "products_manufacturer_id_fkey";
            columns: ["manufacturer_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      users: {
        Row: {
          id: string;
          wallet_address: string;
          role: string;
          name: string | null;
          email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wallet_address: string;
          role: string;
          name?: string | null;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          wallet_address?: string;
          role?: string;
          name?: string | null;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      shipments: {
        Row: {
          id: string;
          product_id: string;
          from_party: string;
          to_party: string;
          status: string;
          mpc_tx_id: string | null;
          temp_key_id: string | null;
          requested_at: string;
          approved_at: string | null;
          shipped_at: string | null;
          delivered_at: string | null;
          confirmed_at: string | null;
          tracking_info: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          from_party: string;
          to_party: string;
          status?: string;
          mpc_tx_id?: string | null;
          temp_key_id?: string | null;
          requested_at?: string;
          approved_at?: string | null;
          shipped_at?: string | null;
          delivered_at?: string | null;
          confirmed_at?: string | null;
          tracking_info?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          from_party?: string;
          to_party?: string;
          status?: string;
          mpc_tx_id?: string | null;
          temp_key_id?: string | null;
          requested_at?: string;
          approved_at?: string | null;
          shipped_at?: string | null;
          delivered_at?: string | null;
          confirmed_at?: string | null;
          tracking_info?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shipments_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shipments_from_party_fkey";
            columns: ["from_party"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shipments_to_party_fkey";
            columns: ["to_party"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
