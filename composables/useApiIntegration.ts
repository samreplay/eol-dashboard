/**
 * API Integration composable for connecting to external inventory/ERP systems
 *
 * This is a placeholder structure for future API integration.
 * Customize based on your actual API requirements.
 */

export interface ExternalProductData {
  product_code: string;
  stock_quantity: number;
  monthly_sales: number;
  product_name?: string;
  rrp?: number;
  msp?: number;
}

export const useApiIntegration = () => {
  const config = useRuntimeConfig();
  const loading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Fetch product data from external API
   * @param productCode The product code to fetch
   * @returns External product data
   */
  const fetchExternalProduct = async (productCode: string): Promise<ExternalProductData | null> => {
    loading.value = true;
    error.value = null;

    try {
      // TODO: Replace with actual API endpoint
      const apiUrl = config.public.externalApiUrl || 'https://api.example.com';
      const apiKey = config.public.externalApiKey || '';

      const response = await $fetch<ExternalProductData>(`${apiUrl}/products/${productCode}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response;
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch external product data';
      console.error('Error fetching external product:', e);
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Sync product data from external API to local database
   * @param productCode The product code to sync
   */
  const syncProductFromExternal = async (productCode: string) => {
    const { updateProduct, fetchProducts, products } = useProducts();

    loading.value = true;
    error.value = null;

    try {
      // Fetch data from external API
      const externalData = await fetchExternalProduct(productCode);

      if (!externalData) {
        throw new Error('No data returned from external API');
      }

      // Find the product in our database
      await fetchProducts();
      const localProduct = products.value.find(p => p.product_code === productCode);

      if (!localProduct) {
        throw new Error(`Product ${productCode} not found in local database`);
      }

      // Update local product with external data
      await updateProduct(localProduct.id, {
        stock_quantity: externalData.stock_quantity,
        monthly_sales: externalData.monthly_sales,
        product_name: externalData.product_name || localProduct.product_name,
        rrp: externalData.rrp || localProduct.rrp,
        msp: externalData.msp || localProduct.msp
      });

      return true;
    } catch (e: any) {
      error.value = e.message || 'Failed to sync product';
      console.error('Error syncing product:', e);
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Bulk sync multiple products from external API
   * @param productCodes Array of product codes to sync
   */
  const bulkSyncProducts = async (productCodes: string[]) => {
    loading.value = true;
    error.value = null;

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    for (const code of productCodes) {
      const success = await syncProductFromExternal(code);
      if (success) {
        results.success++;
      } else {
        results.failed++;
        results.errors.push(`Failed to sync ${code}`);
      }
    }

    loading.value = false;
    return results;
  };

  /**
   * Setup webhook endpoint for receiving product updates
   * This would be implemented as an API route in your Nuxt app
   */
  const setupWebhook = () => {
    // TODO: Implement webhook receiver
    // See: server/api/webhook/products.post.ts
    console.log('Webhook setup instructions:');
    console.log('1. Create server/api/webhook/products.post.ts');
    console.log('2. Configure your ERP system to send POST requests to: /api/webhook/products');
    console.log('3. Expected payload format:', {
      product_code: 'string',
      stock_quantity: 'number',
      monthly_sales: 'number'
    });
  };

  return {
    loading,
    error,
    fetchExternalProduct,
    syncProductFromExternal,
    bulkSyncProducts,
    setupWebhook
  };
};
