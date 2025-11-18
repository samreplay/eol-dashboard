/**
 * AFAS Sync Endpoint
 *
 * Fetches data from all 5 AFAS connectors, transforms it, and syncs to Supabase
 */

import { serverSupabaseClient } from '#supabase/server'
import {
  type AfasItem,
  type AfasSalesPrice,
  type AfasStock,
  type AfasCumulativeSales,
  type AfasUnitPerItem,
  transformToSupabaseProduct
} from '../utils/afas-mapping';

/**
 * Fetch AFAS data with automatic paging (batches of 1000 records)
 */
async function fetchAfasPaged(
  baseUrl: string,
  authHeader: string,
  connectorName: string,
  orderBy: string,
  maxRecords: number = -1
): Promise<any[]> {
  let allRecords: any[] = [];
  let skip = 0;
  const take = 1000;
  let hasMore = true;
  let batchNumber = 1;

  while (hasMore) {
    // Stop if we've reached the limit in test mode
    if (maxRecords > 0 && allRecords.length >= maxRecords) {
      break;
    }

    const url = `${baseUrl}?skip=${skip}&take=${take}&orderbyfieldids=${orderBy}`;

    const response = await fetch(url, {
      headers: {
        Authorization: authHeader,
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`${connectorName} API failed: ${response.statusText}`);
    }

    const data = await response.json();
    const records = data.rows || [];

    allRecords = [...allRecords, ...records];
    console.log(`   ${connectorName}: Batch ${batchNumber} - ${records.length} records (total: ${allRecords.length})`);

    // Stop if fewer records than requested (last page)
    if (records.length < take) {
      hasMore = false;
    } else {
      skip += take;
      batchNumber++;
    }
  }

  // Trim to exact limit if in test mode
  if (maxRecords > 0 && allRecords.length > maxRecords) {
    allRecords = allRecords.slice(0, maxRecords);
    console.log(`   ${connectorName}: Trimmed to ${maxRecords} records for test mode`);
  }

  return allRecords;
}

export default defineEventHandler(async (event) => {
  const startTime = Date.now();

  try {
    const afasToken = process.env.AFAS_TOKEN;
    const afasEnvironmentId = process.env.AFAS_ENVIRONMENT_ID;

    // Validate environment variables
    if (!afasToken || afasToken.includes('YOUR_TOKEN_HERE')) {
      return {
        success: false,
        error: 'AFAS_TOKEN not configured'
      };
    }

    if (!afasEnvironmentId || afasEnvironmentId === 'YOUR_ENVIRONMENT_ID') {
      return {
        success: false,
        error: 'AFAS_ENVIRONMENT_ID not configured'
      };
    }

    // Encode token
    const base64Token = Buffer.from(afasToken, 'utf-8').toString('base64');
    const authHeader = `AfasToken ${base64Token}`;

    // Check for test mode (limit parameter) and connector selection
    const query = getQuery(event);
    const limit = query.limit ? parseInt(String(query.limit)) : -1;
    const testMode = limit > 0 && limit <= 50;

    // Get selected connectors
    const selectedConnectorIds = query.connectors
      ? String(query.connectors).split(',').map(id => id.trim())
      : ['cumulative_sales', 'sales_price', 'items', 'stock', 'units']; // Default: all

    // Define connector mapping
    const connectorMap = {
      cumulative_sales: { name: 'EOL_dashboard_Cumulative_Sales', label: 'Cumulative Sales', orderBy: 'Jaar' },
      sales_price: { name: 'EOL_dashboard_General_SalesPrice', label: 'General Sales Price', orderBy: 'Type_item' },
      items: { name: 'EOL_dashboard_Items', label: 'Dashboard Items', orderBy: 'Type_item' },
      stock: { name: 'EOL_dashboard_Items_Stock', label: 'Stock', orderBy: 'Type_item' },
      units: { name: 'EOL_dashboard_Unit_Per_Item', label: 'Unit Per Item', orderBy: 'ItemType' }
    };

    console.log(`🔄 Starting AFAS sync... ${testMode ? `(TEST MODE - ${limit} records)` : '(FULL SYNC)'}`);
    console.log(`   Selected connectors: ${selectedConnectorIds.map(id => connectorMap[id as keyof typeof connectorMap]?.label || id).join(', ')}`);

    // Validate that Items connector is always selected (required for sync)
    if (!selectedConnectorIds.includes('items')) {
      return {
        success: false,
        error: 'Items connector is required for sync'
      };
    }

    // Step 1: Fetch data from selected connectors SEQUENTIALLY
    console.log('\n📥 Fetching data from AFAS connectors (sequential)...\n');

    const baseUrl = `https://${afasEnvironmentId}.rest.afas.online/profitrestservices/connectors`;
    const maxRecords = testMode ? limit : -1;

    let items: any[] = [];
    let prices: any[] = [];
    let stock: any[] = [];
    let sales: any[] = [];
    let units: any[] = [];

    let connectorNumber = 0;
    const totalConnectors = selectedConnectorIds.length;

    // Fetch Items (always required)
    connectorNumber++;
    console.log(`[${connectorNumber}/${totalConnectors}] Fetching Items...`);
    const allItems = await fetchAfasPaged(
      `${baseUrl}/EOL_dashboard_Items`,
      authHeader,
      'Items',
      'Type_item',
      maxRecords
    );

    // Filter out blocked products
    items = allItems.filter((item: any) => !item.Geblokkeerd);
    const blockedCount = allItems.length - items.length;

    console.log(`✅ Items complete: ${allItems.length} records (${blockedCount} blocked, ${items.length} active)\n`);

    // Fetch other connectors if selected
    if (selectedConnectorIds.includes('sales_price')) {
      connectorNumber++;
      console.log(`[${connectorNumber}/${totalConnectors}] Fetching Prices...`);
      prices = await fetchAfasPaged(
        `${baseUrl}/EOL_dashboard_General_SalesPrice`,
        authHeader,
        'Prices',
        'Type_item',
        -1
      );
      console.log(`✅ Prices complete: ${prices.length} records\n`);
    }

    if (selectedConnectorIds.includes('stock')) {
      connectorNumber++;
      console.log(`[${connectorNumber}/${totalConnectors}] Fetching Stock...`);
      stock = await fetchAfasPaged(
        `${baseUrl}/EOL_dashboard_Items_Stock`,
        authHeader,
        'Stock',
        'Type_item',
        -1
      );
      console.log(`✅ Stock complete: ${stock.length} records\n`);
    }

    if (selectedConnectorIds.includes('cumulative_sales')) {
      connectorNumber++;
      console.log(`[${connectorNumber}/${totalConnectors}] Fetching Sales...`);
      sales = await fetchAfasPaged(
        `${baseUrl}/EOL_dashboard_Cumulative_Sales`,
        authHeader,
        'Sales',
        'Jaar',
        -1
      );
      console.log(`✅ Sales complete: ${sales.length} records\n`);
    }

    if (selectedConnectorIds.includes('units')) {
      connectorNumber++;
      console.log(`[${connectorNumber}/${totalConnectors}] Fetching Units...`);
      units = await fetchAfasPaged(
        `${baseUrl}/EOL_dashboard_Unit_Per_Item`,
        authHeader,
        'Units',
        'ItemType',
        -1
      );
      console.log(`✅ Units complete: ${units.length} records\n`);
    }

    console.log(`✅ All data fetched successfully`);
    console.log(`   Total: ${items.length} items, ${prices.length} prices, ${stock.length} stock, ${sales.length} sales, ${units.length} units`);

    // Step 2: Transform + Sync in batches (streaming approach)
    console.log('\n💾 Transforming and syncing to Supabase in batches...');

    const supabase = await serverSupabaseClient<any>(event);

    let updated = 0;
    const errors: Array<{ product_code: string; error: string }> = [];

    // Process in batches of 100 items
    const batchSize = 100;
    const totalBatches = Math.ceil(items.length / batchSize);

    for (let i = 0; i < items.length; i += batchSize) {
      const batchNumber = Math.floor(i / batchSize) + 1;
      const itemBatch = items.slice(i, i + batchSize);

      // Transform this batch (with additional safety filter for blocked products)
      console.log(`   [${batchNumber}/${totalBatches}] Transforming ${itemBatch.length} products...`);
      const transformedBatch = itemBatch
        .filter((item: any) => !item.Geblokkeerd)
        .map((item) => transformToSupabaseProduct(item, prices, stock, sales, units));

      // Sync to Supabase immediately
      const { error } = await supabase.from('products').upsert(transformedBatch, {
        onConflict: 'product_code',
        ignoreDuplicates: false
      });

      if (error) {
        console.error(`   ❌ Batch ${batchNumber} sync error:`, error.message);
        transformedBatch.forEach((p) =>
          errors.push({ product_code: p.product_code, error: error.message })
        );
      } else {
        updated += transformedBatch.length;
        console.log(`   ✅ Batch ${batchNumber} synced: ${transformedBatch.length} products`);
      }
    }

    const duration = Date.now() - startTime;

    console.log(`✅ Sync completed in ${duration}ms`);
    console.log(`   - Updated: ${updated}`);
    console.log(`   - Errors: ${errors.length}`);

    return {
      success: true,
      test_mode: testMode,
      timestamp: new Date().toISOString(),
      duration_ms: duration,
      summary: {
        total_products: items.length,
        updated: updated,
        errors: errors.length
      },
      details: {
        source_counts: {
          items: items.length,
          prices: prices.length,
          stock: stock.length,
          sales: sales.length,
          units: units.length
        }
      },
      errors: errors.length > 0 ? errors.slice(0, 10) : [] // Return first 10 errors
    };
  } catch (error: any) {
    console.error('❌ Sync failed:', error);

    return {
      success: false,
      error: error.message || 'Unknown error occurred',
      stack: error.stack,
      duration_ms: Date.now() - startTime
    };
  }
});
