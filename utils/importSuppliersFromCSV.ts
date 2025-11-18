/**
 * Import Suppliers from CSV
 *
 * Usage:
 * 1. Create a CSV file with format: product_code,supplier_name
 * 2. Run: npx tsx utils/importSuppliersFromCSV.ts path/to/suppliers.csv
 *
 * CSV Example:
 * product_code,supplier_name
 * 10000,Supplier A
 * 10001,Supplier B
 */

import * as fs from 'fs';
import * as path from 'path';

function parseCSV(filePath: string): Map<string, string> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const mappings = new Map<string, string>();

  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const [productCode, supplierName] = line.split(',').map(s => s.trim());
    if (productCode && supplierName) {
      mappings.set(productCode, supplierName);
    }
  }

  return mappings;
}

function generateTypeScriptCode(mappings: Map<string, string>): string {
  const entries: string[] = [];

  for (const [code, supplier] of mappings.entries()) {
    // Escape single quotes and backslashes
    const escapedSupplier = supplier.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    entries.push(`  '${code}': '${escapedSupplier}'`);
  }

  return `export const SUPPLIER_MAPPINGS: Record<string, string> = {\n${entries.join(',\n')}\n};\n`;
}

function generateSQL(mappings: Map<string, string>): string {
  const updates: string[] = [
    '-- Supplier Import SQL',
    `-- Generated: ${new Date().toISOString()}`,
    `-- Total records: ${mappings.size}`,
    '',
    'BEGIN;',
    ''
  ];

  for (const [productCode, supplierName] of mappings.entries()) {
    // Escape single quotes for SQL
    const escapedSupplier = supplierName.replace(/'/g, "''");
    updates.push(`UPDATE products SET supplier = '${escapedSupplier}' WHERE product_code = '${productCode}';`);
  }

  updates.push('');
  updates.push('COMMIT;');
  updates.push('');
  updates.push(`-- Updated ${mappings.size} products with supplier data`);

  return updates.join('\n');
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: npx tsx utils/importSuppliersFromCSV.ts <csv-file> [--sql]');
  console.error('');
  console.error('Options:');
  console.error('  --sql    Generate SQL output instead of TypeScript code');
  console.error('');
  console.error('Examples:');
  console.error('  npx tsx utils/importSuppliersFromCSV.ts suppliers.csv > utils/supplierMappings.ts');
  console.error('  npx tsx utils/importSuppliersFromCSV.ts suppliers.csv --sql > supplier_import.sql');
  process.exit(1);
}

const csvFile = args[0];
const generateSQLOutput = args.includes('--sql');

if (!fs.existsSync(csvFile)) {
  console.error(`Error: File not found: ${csvFile}`);
  process.exit(1);
}

try {
  const mappings = parseCSV(csvFile);
  console.error(`✅ Parsed ${mappings.size} supplier mappings from ${csvFile}`);

  if (generateSQLOutput) {
    console.log(generateSQL(mappings));
    console.error('\n✅ SQL generated. Execute this in Supabase SQL Editor.');
  } else {
    console.log(generateTypeScriptCode(mappings));
    console.error('\n✅ TypeScript code generated. Save this to utils/supplierMappings.ts');
    console.error('Then run the import via /sync page → Import Suppliers button');
  }
} catch (error: any) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
