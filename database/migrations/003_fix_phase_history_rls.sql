-- Migration: Fix Row Level Security for phase_history table
-- Created: 2025-11-03
-- Description: Adds INSERT policy to allow phase change logging when products are updated

-- Add INSERT policy for phase_history table
-- This allows the database trigger to log phase changes when products are updated
CREATE POLICY IF NOT EXISTS "Enable insert access for authenticated users" ON phase_history
  FOR INSERT TO authenticated WITH CHECK (true);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration 003_fix_phase_history_rls completed successfully!';
  RAISE NOTICE 'Added INSERT policy for phase_history table - product updates will now work';
END $$;
