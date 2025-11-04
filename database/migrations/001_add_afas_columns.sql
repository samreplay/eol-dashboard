-- Migration: Add AFAS Integration Columns to Products Table
-- Created: 2025-01-03
-- Description: Adds ~30 new columns for AFAS ERP integration including product classification,
--              multi-currency pricing, extended stock tracking, 12-month sales history, and packaging units

-- ============================================================================
-- PRODUCT CLASSIFICATION
-- ============================================================================

-- Add product group/category field
ALTER TABLE products ADD COLUMN IF NOT EXISTS artikelgroep VARCHAR(100);

-- Add product blocked status
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_blocked BOOLEAN DEFAULT false;

-- ============================================================================
-- MULTI-CURRENCY PRICING
-- ============================================================================

-- Add EUR pricing (primary currency)
ALTER TABLE products ADD COLUMN IF NOT EXISTS rrp_eur DECIMAL(10, 2);

-- Add GBP pricing
ALTER TABLE products ADD COLUMN IF NOT EXISTS rrp_gbp DECIMAL(10, 2);

-- Add USD pricing
ALTER TABLE products ADD COLUMN IF NOT EXISTS rrp_usd DECIMAL(10, 2);

-- Add Manufacturer Suggested Price
ALTER TABLE products ADD COLUMN IF NOT EXISTS msp DECIMAL(10, 2);

-- ============================================================================
-- EXTENDED STOCK TRACKING
-- ============================================================================

-- Add stock on order
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_on_order INTEGER NOT NULL DEFAULT 0;

-- Add reserved stock
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_reserved INTEGER NOT NULL DEFAULT 0;

-- Add economic stock
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_economic INTEGER NOT NULL DEFAULT 0;

-- Add minimum stock level
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_minimum INTEGER DEFAULT 0;

-- Add replenish to level
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_replenish_to INTEGER DEFAULT 0;

-- ============================================================================
-- 12-MONTH SALES HISTORY
-- ============================================================================

-- Add cumulative sales for each of the past 12 months
ALTER TABLE products ADD COLUMN IF NOT EXISTS sales_month_1 INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sales_month_2 INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sales_month_3 INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sales_month_4 INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sales_month_5 INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sales_month_6 INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sales_month_7 INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sales_month_8 INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sales_month_9 INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sales_month_10 INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sales_month_11 INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sales_month_12 INTEGER DEFAULT 0;

-- ============================================================================
-- PACKAGING UNITS
-- ============================================================================

-- Add per piece (STK) unit
ALTER TABLE products ADD COLUMN IF NOT EXISTS unit_stk INTEGER;

-- Add per dozen (DOZ) unit
ALTER TABLE products ADD COLUMN IF NOT EXISTS unit_doz INTEGER;

-- Add per pallet (PAL) unit
ALTER TABLE products ADD COLUMN IF NOT EXISTS unit_pal INTEGER;

-- ============================================================================
-- PORTAL STATUS
-- ============================================================================

-- Add website status
ALTER TABLE products ADD COLUMN IF NOT EXISTS website_status VARCHAR(20) NOT NULL DEFAULT 'active';

-- Add reseller portal status
ALTER TABLE products ADD COLUMN IF NOT EXISTS reseller_portal_status VARCHAR(20) NOT NULL DEFAULT 'active';

-- ============================================================================
-- ADD CHECK CONSTRAINTS (if columns were newly created)
-- ============================================================================

-- Add check constraint for website_status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'products_website_status_check'
  ) THEN
    ALTER TABLE products ADD CONSTRAINT products_website_status_check
    CHECK (website_status IN ('active', 'inactive', 'hidden'));
  END IF;
END $$;

-- Add check constraint for reseller_portal_status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'products_reseller_portal_status_check'
  ) THEN
    ALTER TABLE products ADD CONSTRAINT products_reseller_portal_status_check
    CHECK (reseller_portal_status IN ('active', 'inactive', 'hidden'));
  END IF;
END $$;

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index on artikelgroep for filtering
CREATE INDEX IF NOT EXISTS idx_products_artikelgroep ON products(artikelgroep);

-- Index on product_blocked for filtering
CREATE INDEX IF NOT EXISTS idx_products_blocked ON products(product_blocked);

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

-- Run this query after migration to verify all columns exist:
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'products'
-- ORDER BY ordinal_position;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration 001_add_afas_columns completed successfully!';
  RAISE NOTICE 'Added ~30 new columns for AFAS integration';
  RAISE NOTICE 'Run verification query above to confirm all columns exist';
END $$;
