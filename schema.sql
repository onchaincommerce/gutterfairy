-- Gutter Fairy E-commerce Database Schema

-- Users table for customer data
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(42) UNIQUE NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User profiles from Base profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  physical_address JSONB, -- Store full address object
  phone VARCHAR(20),
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price_usdc INTEGER NOT NULL, -- Store in smallest unit (6 decimals for USDC)
  size VARCHAR(50),
  measurements TEXT,
  category VARCHAR(100),
  images JSONB, -- Array of image URLs
  stock_quantity INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, paid, shipped, delivered, cancelled
  
  -- Product info
  product_id INTEGER REFERENCES products(id),
  product_name VARCHAR(255),
  product_price INTEGER, -- Price at time of order
  
  -- Shipping info
  shipping_address JSONB,
  shipping_cost INTEGER, -- In cents
  shipping_method VARCHAR(255),
  tracking_number VARCHAR(255),
  
  -- Payment info  
  total_amount INTEGER, -- Total in cents (product + shipping)
  transaction_hash VARCHAR(66), -- Blockchain transaction hash
  
  -- EasyPost info
  easypost_shipment_id VARCHAR(255),
  easypost_rate_id VARCHAR(255),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order status history
CREATE TABLE IF NOT EXISTS order_status_history (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  status VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shipping rates cache (optional - for performance)
CREATE TABLE IF NOT EXISTS shipping_rates_cache (
  id SERIAL PRIMARY KEY,
  from_zip VARCHAR(20),
  to_zip VARCHAR(20),
  weight_oz INTEGER,
  rates JSONB,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample products
INSERT INTO products (name, description, price_usdc, size, measurements, category, images) VALUES
('VINTAGE JACKET', 'Classic brown and tan leather jacket with vintage styling', 45000000, 'Medium', 'Chest: 38", Length: 24", Sleeve: 23"', 'TOPS', '["/American Vintage Women''s Brown and Tan Jacket .jpg"]'),
('MULTI STRIPE SHIRT', 'Comfortable multi-colored stripe button-up shirt', 20000000, 'Large', 'Chest: 42", Length: 26", Sleeve: 24"', 'TOPS', '["/Eddie Bauer Women''s multi Shirt .jpg"]'),
('PLAID SKIRT', 'School girl style plaid skirt with matching belt', 69000000, 'Small', 'Waist: 28", Hip: 36", Length: 18"', 'BOTTOMS', '["/womens_multi_skirt.jpg"]'),
('RED FLORAL DRESS', 'Elegant red floral print midi dress', 35000000, 'Medium', 'Chest: 36", Waist: 30", Length: 42"', 'JUMPSUITS', '["/Secret Treasures Women''s Red Dress .jpg"]'),
('MULTI PATTERN JACKET', 'Sophisticated multi-pattern blazer style jacket', 55000000, 'Large', 'Chest: 40", Length: 26", Sleeve: 24"', 'TOPS', '["/Charter Club Women''s multi Jacket .jpg"]'),
('FLORAL BLOUSE', 'Beautiful vintage floral print button-up blouse', 30000000, 'Medium', 'Chest: 38", Length: 25", Sleeve: 22"', 'TOPS', '["/Women''s multi Blouse.jpg"]'),
('FUZZY BLACK 2-PIECE', 'Cozy fuzzy black crop top and mini skirt set', 85000000, 'Small', 'Top - Chest: 34", Length: 16" | Skirt - Waist: 26", Length: 14"', 'JUMPSUITS', '["/fuzzy_black_2_piece.png"]')
ON CONFLICT DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active); 