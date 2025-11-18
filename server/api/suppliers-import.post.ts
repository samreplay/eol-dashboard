/**
 * Import Suppliers API Endpoint
 * Imports supplier data from mappings into the database
 */

import { createClient } from '@supabase/supabase-js';
import { SUPPLIER_MAPPINGS } from '~/utils/supplierMappings';

export default defineEventHandler(async (event) => {
  console.log('🔄 Starting supplier import...\n');

  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all products
    console.log('📥 Fetching all products...');
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, product_code');

    if (fetchError) {
      throw new Error(`Failed to fetch products: ${fetchError.message}`);
    }

    if (!products || products.length === 0) {
      return {
        success: false,
        message: 'No products found in database',
        updated: 0,
        total: 0
      };
    }

    console.log(`✅ Found ${products.length} products\n`);

    // Build update batch
    const updates = [];
    let matchedCount = 0;
    let unmatchedCount = 0;

    for (const product of products) {
      const supplier = SUPPLIER_MAPPINGS[product.product_code];

      if (supplier) {
        updates.push({
          id: product.id,
          supplier: supplier
        });
        matchedCount++;
      } else {
        unmatchedCount++;
      }
    }

    console.log(`📊 Statistics:`);
    console.log(`   - Products with supplier match: ${matchedCount}`);
    console.log(`   - Products without supplier: ${unmatchedCount}`);
    console.log(`   - Total supplier mappings available: ${Object.keys(SUPPLIER_MAPPINGS).length}\n`);

    if (updates.length === 0) {
      return {
        success: true,
        message: 'No products matched supplier mappings',
        updated: 0,
        matched: matchedCount,
        unmatched: unmatchedCount,
        total: products.length
      };
    }

    // Update in batches of 100
    console.log('💾 Updating products in database...');
    const batchSize = 100;
    let totalUpdated = 0;

    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(updates.length / batchSize);

      const { error: updateError } = await supabase
        .from('products')
        .upsert(batch, { onConflict: 'id', ignoreDuplicates: false });

      if (updateError) {
        console.error(`❌ Batch ${batchNumber}/${totalBatches} failed:`, updateError.message);
      } else {
        totalUpdated += batch.length;
        console.log(`✅ Batch ${batchNumber}/${totalBatches} complete: ${batch.length} products`);
      }
    }

    console.log(`\n🎉 Supplier import complete!`);
    console.log(`   Updated: ${totalUpdated} products`);

    return {
      success: true,
      message: 'Supplier import completed successfully',
      updated: totalUpdated,
      matched: matchedCount,
      unmatched: unmatchedCount,
      total: products.length
    };

  } catch (error: any) {
    console.error('❌ Supplier import failed:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred'
    };
  }
});
