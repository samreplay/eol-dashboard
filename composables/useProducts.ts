import type { Product, ProductWithCalculations } from '~/types/database';

export const useProducts = () => {
  const supabase = useSupabaseClient<any>();
  const products = ref<ProductWithCalculations[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Fetch all products from the database
   */
  const fetchProducts = async () => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Enhance products with calculated fields
      products.value = (data || []).map(product => enhanceProduct(product as Product));
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch products';
      console.error('Error fetching products:', e);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch a single product by ID
   */
  const fetchProductById = async (id: string): Promise<ProductWithCalculations | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      return data ? enhanceProduct(data as Product) : null;
    } catch (e: any) {
      console.error('Error fetching product:', e);
      return null;
    }
  };

  /**
   * Create a new product
   */
  const createProduct = async (productData: Partial<Product>) => {
    loading.value = true;
    error.value = null;

    try {
      // Ensure legacy fields are synced with new fields
      const syncedData = {
        ...productData,
        // Sync rrp with rrp_eur
        rrp: productData.rrp_eur || productData.rrp,
        rrp_eur: productData.rrp_eur || productData.rrp,
        // Sync stock_quantity with stock_regular
        stock_quantity: productData.stock_regular ?? productData.stock_quantity ?? 0,
        stock_regular: productData.stock_regular ?? productData.stock_quantity ?? 0,
      };

      // Calculate initial phase
      const calculatedPhase = calculateProductPhase(syncedData as Product);

      const { data, error: createError } = await supabase
        .from('products')
        .insert({
          ...syncedData,
          current_phase: calculatedPhase
        })
        .select()
        .single();

      if (createError) throw createError;

      // Refresh products list
      await fetchProducts();

      return data;
    } catch (e: any) {
      error.value = e.message || 'Failed to create product';
      console.error('Error creating product:', e);
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Update an existing product
   */
  const updateProduct = async (id: string, updates: Partial<Product>) => {
    loading.value = true;
    error.value = null;

    try {
      // Get current product data
      const currentProduct = await fetchProductById(id);
      if (!currentProduct) throw new Error('Product not found');

      // Ensure legacy fields are synced with new fields
      const syncedUpdates = {
        ...updates,
        // Sync rrp with rrp_eur
        ...(updates.rrp_eur !== undefined && { rrp: updates.rrp_eur, rrp_eur: updates.rrp_eur }),
        ...(updates.rrp !== undefined && !updates.rrp_eur && { rrp: updates.rrp, rrp_eur: updates.rrp }),
        // Sync stock_quantity with stock_regular
        ...(updates.stock_regular !== undefined && { stock_quantity: updates.stock_regular, stock_regular: updates.stock_regular }),
        ...(updates.stock_quantity !== undefined && updates.stock_regular === undefined && { stock_quantity: updates.stock_quantity, stock_regular: updates.stock_quantity }),
      };

      // Merge updates with current data and recalculate phase
      const updatedProduct = { ...currentProduct, ...syncedUpdates };
      const calculatedPhase = calculateProductPhase(updatedProduct as Product);

      const { data, error: updateError } = await supabase
        .from('products')
        .update({
          ...syncedUpdates,
          current_phase: calculatedPhase
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Refresh products list
      await fetchProducts();

      return data;
    } catch (e: any) {
      error.value = e.message || 'Failed to update product';
      console.error('Error updating product:', e);
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Delete a product
   */
  const deleteProduct = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Refresh products list
      await fetchProducts();

      return true;
    } catch (e: any) {
      error.value = e.message || 'Failed to delete product';
      console.error('Error deleting product:', e);
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Update phases for all products
   * (Useful for batch updates or scheduled tasks)
   */
  const updateAllPhases = async () => {
    loading.value = true;
    error.value = null;

    try {
      const { data: allProducts, error: fetchError } = await supabase
        .from('products')
        .select('*');

      if (fetchError) throw fetchError;

      // Update products that need phase changes
      const updates = (allProducts || [])
        .map(p => p as Product)
        .filter(shouldUpdatePhase)
        .map(product => ({
          id: product.id,
          current_phase: calculateProductPhase(product)
        }));

      if (updates.length > 0) {
        // Update each product individually (Supabase doesn't support batch updates easily)
        await Promise.all(
          updates.map(update =>
            supabase
              .from('products')
              .update({ current_phase: update.current_phase })
              .eq('id', update.id)
          )
        );
      }

      // Refresh products list
      await fetchProducts();

      return updates.length;
    } catch (e: any) {
      error.value = e.message || 'Failed to update phases';
      console.error('Error updating phases:', e);
      return 0;
    } finally {
      loading.value = false;
    }
  };

  return {
    products,
    loading,
    error,
    fetchProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    updateAllPhases
  };
};
