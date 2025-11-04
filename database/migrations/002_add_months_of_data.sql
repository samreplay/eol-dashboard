-- Migration: Add months_of_data field to track complete sales months
-- Created: 2025-11-03
-- Description: Adds months_of_data column to products table for accurate average sales calculation

-- Add the months_of_data column
ALTER TABLE products ADD COLUMN IF NOT EXISTS months_of_data INTEGER NOT NULL DEFAULT 12;

-- Update existing products to have 12 months of data (Nov 2024 - Oct 2025)
UPDATE products SET months_of_data = 12 WHERE months_of_data IS NULL OR months_of_data = 0;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration 002_add_months_of_data completed successfully!';
  RAISE NOTICE 'Added months_of_data column with default value of 12';
END $$;
