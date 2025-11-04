-- EOL Dashboard Database Schema
-- Run these commands in your Supabase SQL Editor

-- ============================================================================
-- IMPORTANT: READ THIS FIRST
-- ============================================================================
--
-- IF YOU ALREADY HAVE A PRODUCTS TABLE (getting "table already exists" errors):
--   -> Run the migration files in database/migrations/ instead
--   -> Start with: database/migrations/001_add_afas_columns.sql
--   -> See: database/migrations/README.md for full instructions
--
-- IF THIS IS A FRESH DATABASE (no products table yet):
--   -> Run this entire file to create all tables from scratch
--
-- ============================================================================

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name VARCHAR(255) NOT NULL,
  product_code VARCHAR(100) NOT NULL UNIQUE,

  -- Product classification
  artikelgroep VARCHAR(100),
  product_blocked BOOLEAN DEFAULT false,

  -- EOL management (manual)
  eol_date DATE,
  eol_reason TEXT,
  replacement_product VARCHAR(255),

  -- Multi-currency pricing
  rrp_eur DECIMAL(10, 2),
  rrp_gbp DECIMAL(10, 2),
  rrp_usd DECIMAL(10, 2),
  msp DECIMAL(10, 2),
  rrp DECIMAL(10, 2), -- Legacy field, maps to rrp_eur

  -- Stock tracking
  stock_regular INTEGER NOT NULL DEFAULT 0,
  stock_on_order INTEGER NOT NULL DEFAULT 0,
  stock_reserved INTEGER NOT NULL DEFAULT 0,
  stock_economic INTEGER NOT NULL DEFAULT 0,
  stock_minimum INTEGER DEFAULT 0,
  stock_replenish_to INTEGER DEFAULT 0,
  stock_quantity INTEGER NOT NULL DEFAULT 0, -- Legacy field, maps to stock_regular

  -- Sales data
  monthly_sales INTEGER NOT NULL DEFAULT 0,
  sales_month_1 INTEGER DEFAULT 0,
  sales_month_2 INTEGER DEFAULT 0,
  sales_month_3 INTEGER DEFAULT 0,
  sales_month_4 INTEGER DEFAULT 0,
  sales_month_5 INTEGER DEFAULT 0,
  sales_month_6 INTEGER DEFAULT 0,
  sales_month_7 INTEGER DEFAULT 0,
  sales_month_8 INTEGER DEFAULT 0,
  sales_month_9 INTEGER DEFAULT 0,
  sales_month_10 INTEGER DEFAULT 0,
  sales_month_11 INTEGER DEFAULT 0,
  sales_month_12 INTEGER DEFAULT 0,
  months_of_data INTEGER NOT NULL DEFAULT 12,

  -- Packaging units
  unit_stk INTEGER,
  unit_doz INTEGER,
  unit_pal INTEGER,

  -- Portal status
  website_status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (website_status IN ('active', 'inactive', 'hidden')),
  reseller_portal_status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (reseller_portal_status IN ('active', 'inactive', 'hidden')),

  -- Phase tracking
  current_phase INTEGER NOT NULL DEFAULT 0 CHECK (current_phase BETWEEN 0 AND 4),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_products_phase ON products(current_phase);
CREATE INDEX IF NOT EXISTS idx_products_eol_date ON products(eol_date);
CREATE INDEX IF NOT EXISTS idx_products_code ON products(product_code);
CREATE INDEX IF NOT EXISTS idx_products_artikelgroep ON products(artikelgroep);
CREATE INDEX IF NOT EXISTS idx_products_blocked ON products(product_blocked);

-- Create phase_history table for tracking phase transitions
CREATE TABLE IF NOT EXISTS phase_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  from_phase INTEGER NOT NULL CHECK (from_phase BETWEEN 0 AND 4),
  to_phase INTEGER NOT NULL CHECK (to_phase BETWEEN 0 AND 4),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index for phase history
CREATE INDEX IF NOT EXISTS idx_phase_history_product ON phase_history(product_id);
CREATE INDEX IF NOT EXISTS idx_phase_history_date ON phase_history(changed_at);

-- Create notifications_queue table for future notification system
CREATE TABLE IF NOT EXISTS notifications_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('marketing', 'sales', 'customer')),
  recipient_email VARCHAR(255) NOT NULL,
  phase_trigger INTEGER NOT NULL CHECK (phase_trigger BETWEEN 0 AND 4),
  sent BOOLEAN NOT NULL DEFAULT FALSE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_sent ON notifications_queue(sent);
CREATE INDEX IF NOT EXISTS idx_notifications_product ON notifications_queue(product_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for products table
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to log phase changes
CREATE OR REPLACE FUNCTION log_phase_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.current_phase IS DISTINCT FROM NEW.current_phase THEN
    INSERT INTO phase_history (product_id, from_phase, to_phase, reason)
    VALUES (NEW.id, OLD.current_phase, NEW.current_phase, 'Automatic phase transition');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for phase changes
DROP TRIGGER IF EXISTS log_product_phase_change ON products;
CREATE TRIGGER log_product_phase_change
  AFTER UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION log_phase_change();

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE phase_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications_queue ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (adjust based on your needs)
CREATE POLICY "Enable read access for authenticated users" ON products
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON products
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON products
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable delete access for authenticated users" ON products
  FOR DELETE TO authenticated USING (true);

-- Policies for phase_history
CREATE POLICY "Enable read access for authenticated users" ON phase_history
  FOR SELECT TO authenticated USING (true);

-- Policies for notifications_queue
CREATE POLICY "Enable all access for authenticated users" ON notifications_queue
  FOR ALL TO authenticated USING (true);

-- Create view for products with calculated fields
CREATE OR REPLACE VIEW products_with_calculations AS
SELECT
  p.*,
  CASE
    WHEN p.monthly_sales > 0 THEN ROUND(p.stock_regular::NUMERIC / p.monthly_sales, 2)
    ELSE NULL
  END as months_of_stock,
  CASE
    WHEN p.eol_date IS NOT NULL THEN (CURRENT_DATE - p.eol_date)
    ELSE NULL
  END as days_since_eol
FROM products p;

-- Grant access to the view
GRANT SELECT ON products_with_calculations TO authenticated;
