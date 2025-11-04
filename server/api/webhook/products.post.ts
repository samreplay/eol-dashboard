/**
 * Webhook endpoint for receiving product updates from external systems
 * POST /api/webhook/products
 *
 * Expected payload:
 * {
 *   "product_code": "ABC123",
 *   "stock_quantity": 500,
 *   "monthly_sales": 50,
 *   "product_name": "Product Name" (optional),
 *   "rrp": 99.99 (optional),
 *   "msp": 69.99 (optional)
 * }
 */

import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    // Parse request body
    const body = await readBody(event);

    // Validate required fields
    if (!body.product_code) {
      throw createError({
        statusCode: 400,
        message: 'product_code is required'
      });
    }

    // Get Supabase client (server-side)
    const client = await serverSupabaseClient<any>(event);

    // Find the product by code
    const { data: product, error: findError } = await client
      .from('products')
      .select('*')
      .eq('product_code', body.product_code)
      .single();

    if (findError) {
      throw createError({
        statusCode: 404,
        message: `Product ${body.product_code} not found`
      });
    }

    // Prepare update data
    const updates: any = {};

    if (body.stock_quantity !== undefined) {
      updates.stock_quantity = body.stock_quantity;
    }

    if (body.monthly_sales !== undefined) {
      updates.monthly_sales = body.monthly_sales;
    }

    if (body.product_name) {
      updates.product_name = body.product_name;
    }

    if (body.rrp !== undefined) {
      updates.rrp = body.rrp;
    }

    if (body.msp !== undefined) {
      updates.msp = body.msp;
    }

    // Calculate new phase based on updated data
    const updatedProduct = { ...product, ...updates };
    const { calculateProductPhase } = await import('~/utils/phaseCalculator');
    updates.current_phase = calculateProductPhase(updatedProduct);

    // Update the product
    const { data: updatedData, error: updateError } = await client
      .from('products')
      .update(updates)
      .eq('id', product.id)
      .select()
      .single();

    if (updateError) {
      throw createError({
        statusCode: 500,
        message: 'Failed to update product'
      });
    }

    return {
      success: true,
      message: 'Product updated successfully',
      data: updatedData
    };

  } catch (error: any) {
    console.error('Webhook error:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      message: error.message || 'Internal server error'
    });
  }
});
