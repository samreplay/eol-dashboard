<template>
  <div>
    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-500">Loading product...</p>
    </div>

    <div v-else-if="!product" class="text-center py-12">
      <p class="text-red-500">Product not found</p>
      <NuxtLink to="/" class="text-blue-600 hover:underline mt-4 inline-block">
        Back to Dashboard
      </NuxtLink>
    </div>

    <div v-else>
      <!-- Header -->
      <div class="flex justify-between items-start mb-6">
        <div>
          <NuxtLink to="/" class="text-sm text-blue-600 hover:underline mb-2 inline-block">
            &larr; Back to Dashboard
          </NuxtLink>
          <h1 class="text-2xl font-semibold text-gray-900">{{ product.product_name }}</h1>
          <p class="text-gray-500 mt-1">{{ product.product_code }}</p>
        </div>
        <div class="flex gap-3">
          <NuxtLink
            :to="`/products/edit-${product.id}`"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
          >
            Edit Product
          </NuxtLink>
          <button
            @click="handleDelete"
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-medium"
          >
            Delete
          </button>
        </div>
      </div>

      <!-- Phase Status Card -->
      <div v-if="phaseInfo" class="bg-white rounded shadow border-l-4 border border-gray-200 p-6 mb-6" :class="phaseInfo.borderClass">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold mb-2">
              Phase {{ product?.current_phase }}: {{ phaseInfo.label }}
            </h2>
            <p class="text-gray-600 text-sm">{{ phaseInfo.description }}</p>
          </div>
          <div :class="phaseInfo.bgClass" class="w-12 h-12 rounded flex items-center justify-center">
            <span class="text-white font-semibold text-xl">{{ product?.current_phase }}</span>
          </div>
        </div>
      </div>

      <!-- Product Details Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Basic Information -->
        <div class="bg-white rounded shadow border border-gray-200 p-6">
          <h3 class="text-lg font-semibold mb-4">Basic Information</h3>
          <dl class="space-y-3">
            <div>
              <dt class="text-sm font-medium text-gray-500">Product Name</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ product.product_name }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Product Code</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ product.product_code }}</dd>
            </div>
            <div v-if="product.artikelgroep">
              <dt class="text-sm font-medium text-gray-500">Product Group</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ product.artikelgroep }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Status</dt>
              <dd class="mt-1">
                <span v-if="product.product_blocked" class="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                  Blocked
                </span>
                <span v-else class="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </dd>
            </div>
          </dl>
        </div>

        <!-- EOL Information -->
        <div class="bg-white rounded shadow border border-gray-200 p-6">
          <h3 class="text-lg font-semibold mb-4">EOL Management</h3>
          <dl class="space-y-3">
            <div>
              <dt class="text-sm font-medium text-gray-500">EOL Date</dt>
              <dd class="mt-1 text-sm text-gray-900">
                {{ product.eol_date ? formatDate(product.eol_date) : 'Not set' }}
              </dd>
            </div>
            <div v-if="product.days_since_eol !== null">
              <dt class="text-sm font-medium text-gray-500">Days Since EOL</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ product.days_since_eol }} days</dd>
            </div>
            <div v-if="product.eol_reason">
              <dt class="text-sm font-medium text-gray-500">EOL Reason</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ product.eol_reason }}</dd>
            </div>
            <div v-if="product.replacement_product">
              <dt class="text-sm font-medium text-gray-500">Replacement Product</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ product.replacement_product }}</dd>
            </div>
          </dl>
        </div>

        <!-- Stock Details -->
        <div class="bg-white rounded shadow border border-gray-200 p-6">
          <h3 class="text-lg font-semibold mb-4">Stock Details</h3>
          <dl class="space-y-3">
            <div>
              <dt class="text-sm font-medium text-gray-500">Regular Stock</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ product.stock_regular }} units</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Economic Stock</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ product.stock_economic }} units</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">On Order</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ product.stock_on_order }} units</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Reserved</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ product.stock_reserved }} units</dd>
            </div>
          </dl>
        </div>

        <!-- Sales & Stock Management -->
        <div class="bg-white rounded shadow border border-gray-200 p-6">
          <h3 class="text-lg font-semibold mb-4">Sales & Stock Management</h3>
          <dl class="space-y-3">
            <div>
              <dt class="text-sm font-medium text-gray-500">Monthly Sales</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ product.monthly_sales }} units/month</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Months of Stock Remaining</dt>
              <dd class="mt-1 text-sm text-gray-900">
                {{ product.months_of_stock > 0 ? product.months_of_stock.toFixed(2) : 'N/A' }} months
              </dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Minimum Stock Level</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ product.stock_minimum || 'Not set' }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Replenish To</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ product.stock_replenish_to || 'Not set' }}</dd>
            </div>
          </dl>
        </div>

        <!-- Pricing -->
        <div class="bg-white rounded shadow border border-gray-200 p-6">
          <h3 class="text-lg font-semibold mb-4">Pricing</h3>
          <dl class="space-y-3">
            <div>
              <dt class="text-sm font-medium text-gray-500">RRP EUR (Primary)</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ formatCurrency(product.rrp_eur) }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">RRP GBP</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ product.rrp_gbp ? `£${product.rrp_gbp.toFixed(2)}` : 'N/A' }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">RRP USD</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ product.rrp_usd ? `$${product.rrp_usd.toFixed(2)}` : 'N/A' }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">MSP (Min. Sales Price)</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ formatCurrency(product.msp) }}</dd>
            </div>
          </dl>
        </div>

        <!-- Packaging Units -->
        <div class="bg-white rounded shadow border border-gray-200 p-6">
          <h3 class="text-lg font-semibold mb-4">Packaging Units</h3>
          <dl class="space-y-3">
            <div>
              <dt class="text-sm font-medium text-gray-500">Per STK (Piece)</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ product.unit_stk || 'Not set' }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Per DOZ (Dozen)</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ product.unit_doz || 'Not set' }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Per PAL (Pallet)</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ product.unit_pal || 'Not set' }}</dd>
            </div>
          </dl>
        </div>

        <!-- Status -->
        <div class="bg-white rounded shadow border border-gray-200 p-6">
          <h3 class="text-lg font-semibold mb-4">Portal Status</h3>
          <dl class="space-y-3">
            <div>
              <dt class="text-sm font-medium text-gray-500">Website Status</dt>
              <dd class="mt-1">
                <span
                  :class="product.website_status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                  class="px-2 py-1 rounded text-xs font-medium"
                >
                  {{ product.website_status }}
                </span>
              </dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Reseller Portal Status</dt>
              <dd class="mt-1">
                <span
                  :class="product.reseller_portal_status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                  class="px-2 py-1 rounded text-xs font-medium"
                >
                  {{ product.reseller_portal_status }}
                </span>
              </dd>
            </div>
          </dl>
        </div>

        <!-- 12-Month Sales History Chart -->
        <div class="md:col-span-2">
          <SalesChart :salesData="salesHistoryData" />
        </div>

        <!-- Timestamps -->
        <div class="bg-white rounded shadow border border-gray-200 p-6">
          <h3 class="text-lg font-semibold mb-4">Timestamps</h3>
          <dl class="space-y-3">
            <div>
              <dt class="text-sm font-medium text-gray-500">Created At</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ formatDate(product.created_at) }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ formatDate(product.updated_at) }}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProductWithCalculations } from '~/types/database';

definePageMeta({
  layout: 'default'
});

const route = useRoute();
const router = useRouter();
const { fetchProductById, deleteProduct } = useProducts();

const productId = route.params.id as string;
const product = ref<ProductWithCalculations | null>(null);
const loading = ref(true);

onMounted(async () => {
  product.value = await fetchProductById(productId);
  loading.value = false;
});

const phaseInfo = computed(() => {
  if (!product.value) return null;
  return getPhaseInfo(product.value.current_phase);
});

const salesHistoryData = computed(() => {
  if (!product.value) return Array(12).fill(0);
  return Array.from({ length: 12 }, (_, i) =>
    (product.value as any)[`sales_month_${i + 1}`] || 0
  );
});

const handleDelete = async () => {
  if (!confirm('Are you sure you want to delete this product?')) return;

  const success = await deleteProduct(productId);
  if (success) {
    router.push('/');
  }
};
</script>
