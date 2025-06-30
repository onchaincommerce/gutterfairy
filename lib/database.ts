import { sql } from '@vercel/postgres';

// Database connection utility for Vercel Postgres

export interface Address {
  street1?: string;
  street2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  line1?: string;
  line2?: string;
  admin_area_1?: string;
  postal_code?: string;
}

export interface User {
  id: number;
  wallet_address: string;
  email?: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserProfile {
  id: number;
  user_id: number;
  physical_address?: Address;
  phone?: string;
  name?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price_usdc: number;
  size?: string;
  measurements?: string;
  category?: string;
  images?: string[];
  stock_quantity: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Order {
  id: number;
  user_id: number;
  order_number: string;
  status: string;
  product_id: number;
  product_name: string;
  product_price: number;
  shipping_address?: Address;
  shipping_cost?: number;
  shipping_method?: string;
  tracking_number?: string;
  total_amount: number;
  transaction_hash?: string;
  easypost_shipment_id?: string;
  easypost_rate_id?: string;
  created_at: Date;
  updated_at: Date;
}

// User operations
export async function createUser(walletAddress: string, email?: string): Promise<User> {
  const result = await sql`
    INSERT INTO users (wallet_address, email)
    VALUES (${walletAddress}, ${email})
    ON CONFLICT (wallet_address) 
    DO UPDATE SET 
      email = COALESCE(EXCLUDED.email, users.email),
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `;
  return result.rows[0] as User;
}

export async function getUserByWallet(walletAddress: string): Promise<User | null> {
  const result = await sql`
    SELECT * FROM users WHERE wallet_address = ${walletAddress}
  `;
  return result.rows[0] as User || null;
}

// Profile operations
export async function createOrUpdateProfile(userId: number, profileData: {
  physical_address?: Address;
  phone?: string;
  name?: string;
}): Promise<UserProfile> {
  const result = await sql`
    INSERT INTO user_profiles (user_id, physical_address, phone, name)
    VALUES (${userId}, ${JSON.stringify(profileData.physical_address)}, ${profileData.phone}, ${profileData.name})
    ON CONFLICT (user_id)
    DO UPDATE SET
      physical_address = COALESCE(EXCLUDED.physical_address, user_profiles.physical_address),
      phone = COALESCE(EXCLUDED.phone, user_profiles.phone),
      name = COALESCE(EXCLUDED.name, user_profiles.name),
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `;
  return result.rows[0] as UserProfile;
}

export async function getProfileByUserId(userId: number): Promise<UserProfile | null> {
  const result = await sql`
    SELECT * FROM user_profiles WHERE user_id = ${userId}
  `;
  return result.rows[0] as UserProfile || null;
}

// Product operations
export async function getAllProducts(): Promise<Product[]> {
  const result = await sql`
    SELECT * FROM products WHERE is_active = true ORDER BY created_at DESC
  `;
  return result.rows as Product[];
}

export async function getProductById(id: number): Promise<Product | null> {
  const result = await sql`
    SELECT * FROM products WHERE id = ${id} AND is_active = true
  `;
  return result.rows[0] as Product || null;
}

// Order operations
export async function createOrder(orderData: {
  user_id: number;
  product_id: number;
  product_name: string;
  product_price: number;
  shipping_address?: Address;
  shipping_cost?: number;
  shipping_method?: string;
  total_amount: number;
  transaction_hash?: string;
}): Promise<Order> {
  // Generate order number
  const orderNumber = `GF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  
  const result = await sql`
    INSERT INTO orders (
      user_id, order_number, product_id, product_name, product_price,
      shipping_address, shipping_cost, shipping_method, total_amount, transaction_hash
    )
    VALUES (
      ${orderData.user_id}, ${orderNumber}, ${orderData.product_id}, ${orderData.product_name}, 
      ${orderData.product_price}, ${JSON.stringify(orderData.shipping_address)}, 
      ${orderData.shipping_cost}, ${orderData.shipping_method}, ${orderData.total_amount},
      ${orderData.transaction_hash}
    )
    RETURNING *
  `;
  return result.rows[0] as Order;
}

export async function updateOrderStatus(orderId: number, status: string, notes?: string): Promise<void> {
  await sql`
    UPDATE orders SET status = ${status}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${orderId}
  `;
  
  // Add to status history
  await sql`
    INSERT INTO order_status_history (order_id, status, notes)
    VALUES (${orderId}, ${status}, ${notes})
  `;
}

export async function updateOrderShipping(orderId: number, shippingData: {
  easypost_shipment_id?: string;
  easypost_rate_id?: string;
  tracking_number?: string;
}): Promise<void> {
  await sql`
    UPDATE orders SET
      easypost_shipment_id = COALESCE(${shippingData.easypost_shipment_id}, easypost_shipment_id),
      easypost_rate_id = COALESCE(${shippingData.easypost_rate_id}, easypost_rate_id),
      tracking_number = COALESCE(${shippingData.tracking_number}, tracking_number),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${orderId}
  `;
}

export async function getOrdersByUserId(userId: number): Promise<Order[]> {
  const result = await sql`
    SELECT * FROM orders WHERE user_id = ${userId} ORDER BY created_at DESC
  `;
  return result.rows as Order[];
}

export async function getOrderById(id: number): Promise<Order | null> {
  const result = await sql`
    SELECT * FROM orders WHERE id = ${id}
  `;
  return result.rows[0] as Order || null;
}

// Initialize database (run schema)
export async function initializeDatabase(): Promise<void> {
  // This would typically be run once during deployment
  // The schema.sql file would be executed here
  console.log('Database initialization would run schema.sql here');
} 