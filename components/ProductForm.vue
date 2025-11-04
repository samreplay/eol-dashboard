<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Product Information -->
    <div class="bg-white rounded shadow border border-gray-200 p-6">
      <h3 class="text-lg font-semibold mb-4">Product Information</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Product Name <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.product_name"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter product name"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Product Code <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.product_code"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter product code"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Product Group (Artikelgroep)
          </label>
          <input
            v-model="formData.artikelgroep"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter product group"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Product Status
          </label>
          <div class="flex items-center h-10">
            <input
              v-model="formData.product_blocked"
              type="checkbox"
              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span class="ml-2 text-sm text-gray-700">Product Blocked</span>
          </div>
        </div>
      </div>
    </div>

    <!-- EOL Management -->
    <div class="bg-white rounded shadow border border-gray-200 p-6">
      <h3 class="text-lg font-semibold mb-4">EOL Management</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            EOL Date
          </label>
          <input
            v-model="formData.eol_date"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Replacement Product
          </label>
          <input
            v-model="formData.replacement_product"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter replacement product"
          />
        </div>

        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            EOL Reason
          </label>
          <textarea
            v-model="formData.eol_reason"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Reason for end of life..."
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Stock Details -->
    <div class="bg-white rounded shadow border border-gray-200 p-6">
      <h3 class="text-lg font-semibold mb-4">Stock Details</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Regular Stock <span class="text-red-500">*</span>
          </label>
          <input
            v-model.number="formData.stock_regular"
            type="number"
            required
            min="0"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Economic Stock <span class="text-red-500">*</span>
          </label>
          <input
            v-model.number="formData.stock_economic"
            type="number"
            required
            min="0"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            On Order <span class="text-red-500">*</span>
          </label>
          <input
            v-model.number="formData.stock_on_order"
            type="number"
            required
            min="0"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Reserved <span class="text-red-500">*</span>
          </label>
          <input
            v-model.number="formData.stock_reserved"
            type="number"
            required
            min="0"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Minimum Stock
          </label>
          <input
            v-model.number="formData.stock_minimum"
            type="number"
            min="0"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Replenish To
          </label>
          <input
            v-model.number="formData.stock_replenish_to"
            type="number"
            min="0"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0"
          />
        </div>
      </div>
    </div>

    <!-- Sales Data -->
    <div class="bg-white rounded shadow border border-gray-200 p-6">
      <h3 class="text-lg font-semibold mb-4">Sales Data</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Average Monthly Sales (Auto-calculated)
          </label>
          <div class="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded text-gray-700 font-semibold">
            {{ calculatedMonthlySales }} units/month
          </div>
          <p class="text-xs text-gray-500 mt-1">Average over active selling period</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Months of Complete Data <span class="text-red-500">*</span>
          </label>
          <input
            v-model.number="formData.months_of_data"
            type="number"
            required
            min="1"
            max="12"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="10"
          />
          <p class="text-xs text-gray-500 mt-1">How many months have complete sales data (1-12)</p>
        </div>
      </div>
      <div class="mt-4">
        <p class="text-sm font-medium text-gray-700 mb-2">12-Month Sales History</p>
        <div class="grid grid-cols-1 gap-3">
          <div v-for="i in 12" :key="i">
            <label class="block text-xs text-gray-600 mb-1">{{ monthLabels[i - 1] }}</label>
            <input
              v-model.number="(formData as any)[`sales_month_${i}`]"
              type="number"
              min="0"
              class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Pricing -->
    <div class="bg-white rounded shadow border border-gray-200 p-6">
      <h3 class="text-lg font-semibold mb-4">Pricing</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            RRP EUR (Primary)
          </label>
          <input
            v-model.number="formData.rrp_eur"
            type="number"
            step="0.01"
            min="0"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0.00"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            MSP (Min. Sales Price)
          </label>
          <input
            v-model.number="formData.msp"
            type="number"
            step="0.01"
            min="0"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0.00"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            RRP GBP
          </label>
          <input
            v-model.number="formData.rrp_gbp"
            type="number"
            step="0.01"
            min="0"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0.00"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            RRP USD
          </label>
          <input
            v-model.number="formData.rrp_usd"
            type="number"
            step="0.01"
            min="0"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0.00"
          />
        </div>
      </div>
    </div>

    <!-- Packaging Units -->
    <div class="bg-white rounded shadow border border-gray-200 p-6">
      <h3 class="text-lg font-semibold mb-4">Packaging Units</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Per STK (Piece)
          </label>
          <input
            v-model.number="formData.unit_stk"
            type="number"
            min="0"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Per DOZ (Dozen)
          </label>
          <input
            v-model.number="formData.unit_doz"
            type="number"
            min="0"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Per PAL (Pallet)
          </label>
          <input
            v-model.number="formData.unit_pal"
            type="number"
            min="0"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0"
          />
        </div>
      </div>
    </div>

    <!-- Portal Status -->
    <div class="bg-white rounded shadow border border-gray-200 p-6">
      <h3 class="text-lg font-semibold mb-4">Portal Status</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Website Status
          </label>
          <select
            v-model="formData.website_status"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Reseller Portal Status
          </label>
          <select
            v-model="formData.reseller_portal_status"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
      {{ error }}
    </div>

    <!-- Actions -->
    <div class="flex justify-end gap-3">
      <NuxtLink
        to="/"
        class="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors font-medium border border-gray-300"
      >
        Cancel
      </NuxtLink>
      <button
        type="submit"
        :disabled="loading"
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
      >
        {{ loading ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product') }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import type { Product } from '~/types/database';

const props = defineProps<{
  product?: Product;
  isEdit?: boolean;
}>();

const emit = defineEmits<{
  submit: [data: Partial<Product>];
}>();

const loading = ref(false);
const error = ref<string | null>(null);

// Initialize form data
const formData = reactive({
  // Basic info
  product_name: props.product?.product_name || '',
  product_code: props.product?.product_code || '',
  artikelgroep: props.product?.artikelgroep || null,
  product_blocked: props.product?.product_blocked || false,

  // EOL management
  eol_date: props.product?.eol_date || null,
  eol_reason: props.product?.eol_reason || '',
  replacement_product: props.product?.replacement_product || '',

  // Multi-currency pricing
  rrp_eur: props.product?.rrp_eur || null,
  rrp_gbp: props.product?.rrp_gbp || null,
  rrp_usd: props.product?.rrp_usd || null,
  msp: props.product?.msp || null,
  rrp: props.product?.rrp || null, // Legacy

  // Stock tracking
  stock_regular: props.product?.stock_regular || 0,
  stock_on_order: props.product?.stock_on_order || 0,
  stock_reserved: props.product?.stock_reserved || 0,
  stock_economic: props.product?.stock_economic || 0,
  stock_minimum: props.product?.stock_minimum || null,
  stock_replenish_to: props.product?.stock_replenish_to || null,
  stock_quantity: props.product?.stock_quantity || 0, // Legacy

  // Sales data
  monthly_sales: props.product?.monthly_sales || 0,
  sales_month_1: props.product?.sales_month_1 || 0,
  sales_month_2: props.product?.sales_month_2 || 0,
  sales_month_3: props.product?.sales_month_3 || 0,
  sales_month_4: props.product?.sales_month_4 || 0,
  sales_month_5: props.product?.sales_month_5 || 0,
  sales_month_6: props.product?.sales_month_6 || 0,
  sales_month_7: props.product?.sales_month_7 || 0,
  sales_month_8: props.product?.sales_month_8 || 0,
  sales_month_9: props.product?.sales_month_9 || 0,
  sales_month_10: props.product?.sales_month_10 || 0,
  sales_month_11: props.product?.sales_month_11 || 0,
  sales_month_12: props.product?.sales_month_12 || 0,
  months_of_data: props.product?.months_of_data || 12,

  // Packaging units
  unit_stk: props.product?.unit_stk || null,
  unit_doz: props.product?.unit_doz || null,
  unit_pal: props.product?.unit_pal || null,

  // Portal status
  website_status: props.product?.website_status || 'active',
  reseller_portal_status: props.product?.reseller_portal_status || 'active',
});

// Auto-calculate monthly_sales as average over active selling period
const calculatedMonthlySales = computed(() => {
  const monthsToConsider = formData.months_of_data || 12;

  // Get sales data for complete months only
  const salesData = Array.from({ length: monthsToConsider }, (_, i) =>
    (formData as any)[`sales_month_${i + 1}`] || 0
  );

  // Find first and last month with sales
  const firstNonZero = salesData.findIndex(val => val > 0);
  const lastNonZero = salesData.findLastIndex(val => val > 0);

  // If no sales data, return 0
  if (firstNonZero === -1) return 0;

  // Calculate active period (includes months with 0 sales in between)
  const activePeriodMonths = lastNonZero - firstNonZero + 1;

  // Sum sales only in the active period
  const total = salesData.slice(firstNonZero, lastNonZero + 1).reduce((sum, val) => sum + val, 0);

  // Average over active period
  return Math.round(total / activePeriodMonths);
});

// Generate month labels based on current date
const monthLabels = computed(() => {
  return generateMonthLabels(formData.months_of_data);
});

const handleSubmit = async () => {
  loading.value = true;
  error.value = null;

  try {
    // Include the calculated monthly_sales in the submission
    emit('submit', {
      ...formData,
      monthly_sales: calculatedMonthlySales.value
    });
  } catch (e: any) {
    error.value = e.message || 'An error occurred';
  } finally {
    loading.value = false;
  }
};
</script>
