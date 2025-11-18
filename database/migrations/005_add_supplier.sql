-- Migration: Add supplier column to products table
-- Created: 2025-11-17
-- Description: Adds supplier field to track product manufacturers/suppliers

-- Add supplier column
ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier VARCHAR(255);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier);

-- Add comment
COMMENT ON COLUMN products.supplier IS 'Product supplier/manufacturer name';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration 005_add_supplier completed successfully!';
  RAISE NOTICE 'Added supplier column to products table';
END $$;
