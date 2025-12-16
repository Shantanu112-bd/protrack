// Database type overrides for ProTrack
// This file provides correct types that match our actual Supabase schema

export interface ProductInsert {
  id?: string;
  rfid_tag: string;
  barcode?: string;
  product_hash?: string;
  product_name?: string;
  batch_no?: string;
  mfg_date?: string;
  exp_date?: string;
  token_id?: string;
  owner_wallet?: string;
  manufacturer_id?: string;
  current_custodian_id?: string;
  status?: string;
  current_location?: string;
  max_temperature?: number;
  min_temperature?: number;
  max_humidity?: number;
  min_humidity?: number;
  max_shock?: number;
  destination?: string;
  expected_arrival?: string;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
}

export interface ShipmentInsert {
  id?: string;
  product_id: string;
  from_party: string;
  to_party: string;
  status?: string;
  mpc_tx_id?: string;
  temp_key_id?: string;
  requested_at?: string;
  approved_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  confirmed_at?: string;
  tracking_info?: any;
  created_at?: string;
  updated_at?: string;
  expected_arrival?: string;
}

export interface UserInsert {
  id?: string;
  email?: string;
  wallet_address: string;
  role_id?: string;
  name?: string;
  phone?: string;
  company?: string;
  created_at?: string;
  updated_at?: string;
}
