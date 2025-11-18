/**
 * Process Supplier CSV and generate output files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvPath = 'c:\\Users\\sam.schalkwijk\\Downloads\\suppliers-import.csv';
const sqlOutputPath = path.join(__dirname, '..', 'database', 'supplier_import.sql');
const tsOutputPath = path.join(__dirname, '..', 'utils', 'supplierMappings.ts');

console.log('📥 Reading CSV file...');
const content = fs.readFileSync(csvPath, 'utf-8');
const lines = content.split('\n');

console.log(`📊 Total lines: ${lines.length}`);

const mappings = new Map();
let skipped = 0;

// Parse CSV (skip header)
for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) {
    skipped++;
    continue;
  }

  // Split on first comma only (supplier name might contain commas)
  const commaIndex = line.indexOf(',');
  if (commaIndex === -1) {
    console.warn(`⚠️  Skipping invalid line ${i + 1}: ${line}`);
    skipped++;
    continue;
  }

  const productCode = line.substring(0, commaIndex).trim();
  const supplierName = line.substring(commaIndex + 1).trim();

  if (productCode && supplierName) {
    mappings.set(productCode, supplierName);
  } else {
    skipped++;
  }
}

console.log(`✅ Parsed ${mappings.size} supplier mappings`);
if (skipped > 0) {
  console.log(`⚠️  Skipped ${skipped} invalid lines`);
}

// Generate SQL
console.log('\n📝 Generating SQL...');
const sqlLines = [
  '-- Supplier Import SQL',
  `-- Generated: ${new Date().toISOString()}`,
  `-- Total records: ${mappings.size}`,
  '-- Source: suppliers-import.csv',
  '',
  '-- Step 1: Add supplier column (if not exists)',
  'ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier VARCHAR(255);',
  'CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier);',
  '',
  '-- Step 2: Update supplier data',
  'BEGIN;',
  ''
];

for (const [productCode, supplierName] of mappings.entries()) {
  // Escape single quotes for SQL
  const escapedSupplier = supplierName.replace(/'/g, "''");
  const escapedCode = productCode.replace(/'/g, "''");
  sqlLines.push(`UPDATE products SET supplier = '${escapedSupplier}' WHERE product_code = '${escapedCode}';`);
}

sqlLines.push('');
sqlLines.push('COMMIT;');
sqlLines.push('');
sqlLines.push(`-- ✅ Updated ${mappings.size} products with supplier data`);

fs.writeFileSync(sqlOutputPath, sqlLines.join('\n'), 'utf-8');
console.log(`✅ SQL saved to: ${sqlOutputPath}`);

// Generate TypeScript
console.log('\n📝 Generating TypeScript...');
const tsLines = [
  '/**',
  ' * Supplier Mappings',
  ' * Generated from suppliers-import.csv',
  ` * Date: ${new Date().toISOString()}`,
  ` * Total suppliers: ${mappings.size}`,
  ' */',
  '',
  'export const SUPPLIER_MAPPINGS: Record<string, string> = {'
];

const entries = Array.from(mappings.entries());
entries.forEach(([code, supplier], index) => {
  // Escape single quotes and backslashes for TypeScript
  const escapedSupplier = supplier.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const escapedCode = code.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const comma = index < entries.length - 1 ? ',' : '';
  tsLines.push(`  '${escapedCode}': '${escapedSupplier}'${comma}`);
});

tsLines.push('};');
tsLines.push('');
tsLines.push('/**');
tsLines.push(' * Get supplier for a product code');
tsLines.push(' */');
tsLines.push('export function getSupplier(productCode: string | null): string | null {');
tsLines.push('  if (!productCode) return null;');
tsLines.push('  return SUPPLIER_MAPPINGS[productCode] || null;');
tsLines.push('}');
tsLines.push('');

fs.writeFileSync(tsOutputPath, tsLines.join('\n'), 'utf-8');
console.log(`✅ TypeScript saved to: ${tsOutputPath}`);

console.log('\n🎉 Processing complete!');
console.log('\n📋 Next steps:');
console.log('');
console.log('Option A - Direct SQL import (Fastest):');
console.log('  1. Open Supabase Dashboard → SQL Editor');
console.log(`  2. Copy and execute: database/supplier_import.sql`);
console.log('  3. Done! Suppliers are in the database');
console.log('');
console.log('Option B - Via UI:');
console.log('  1. Navigate to /sync page');
console.log('  2. Click "Import Suppliers" button');
console.log('  3. Wait for import to complete');
console.log('');
console.log('✅ supplierMappings.ts is already updated and ready to use!');
