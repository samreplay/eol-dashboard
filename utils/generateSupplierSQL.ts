/**
 * Generate SQL script for supplier import
 *
 * Usage:
 * 1. Paste your supplier data in the SUPPLIER_DATA array below
 * 2. Run: npx tsx utils/generateSupplierSQL.ts > supplier_import.sql
 * 3. Execute the generated SQL in Supabase SQL Editor
 */

// Paste your supplier data here in format: [product_code, supplier_name]
const SUPPLIER_DATA: [string, string][] = [
  // Example:
  // ['10000', 'Supplier A'],
  // ['10001', 'Supplier B'],
  // ... add all ~1500 lines here
];

function generateSQL() {
  console.log('-- Supplier Import SQL');
  console.log('-- Generated:', new Date().toISOString());
  console.log('-- Total records:', SUPPLIER_DATA.length);
  console.log('');
  console.log('BEGIN;');
  console.log('');

  for (const [productCode, supplierName] of SUPPLIER_DATA) {
    // Escape single quotes in supplier name
    const escapedSupplier = supplierName.replace(/'/g, "''");

    console.log(
      `UPDATE products SET supplier = '${escapedSupplier}' WHERE product_code = '${productCode}';`
    );
  }

  console.log('');
  console.log('COMMIT;');
  console.log('');
  console.log(`-- Updated ${SUPPLIER_DATA.length} products with supplier data`);
}

generateSQL();
