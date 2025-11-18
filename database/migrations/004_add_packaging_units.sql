-- Add packaging unit columns to products table
-- These columns store the number of units per package type from AFAS

ALTER TABLE products
ADD COLUMN IF NOT EXISTS unit_per_dozen INTEGER,
ADD COLUMN IF NOT EXISTS unit_per_pallet INTEGER,
ADD COLUMN IF NOT EXISTS unit_per_outer_dozen INTEGER;

-- Add comments for documentation
COMMENT ON COLUMN products.unit_per_dozen IS 'Number of units in a dozen package (AFAS UnitId: DOZ)';
COMMENT ON COLUMN products.unit_per_pallet IS 'Number of units on a pallet (AFAS UnitId: PAL)';
COMMENT ON COLUMN products.unit_per_outer_dozen IS 'Number of units in an outer dozen package (AFAS UnitId: ODZ)';
