import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client for public operations (read-only for products)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for authenticated operations (using service role key)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Types for our database
export interface Product {
  id: string;
  name: string;
  description: string;
  price_usdc: number;
  size: string;
  measurements: string;
  category: string;
  images: string[];
  stock_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface AdminSession {
  id: string;
  wallet_address: string;
  session_token: string;
  expires_at: string;
  created_at: string;
} 