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

      <!-- Smart Phase Warning -->
      <div v-if="phaseMismatch" class="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
          <div class="flex-1">
            <h4 class="text-sm font-semibold text-amber-900">Phase Update Suggested</h4>
            <p class="text-sm text-amber-700 mt-1">
              <strong>Current:</strong> Phase {{ product?.current_phase }} - {{ getPhaseInfo(product?.current_phase || 0).label }}<br>
              <strong>Should be:</strong> Phase {{ calculatedPhase }} - {{ getPhaseInfo(calculatedPhase || 0).label }}
            </p>
            <button
              @click="updateToCalculatedPhase"
              :disabled="saving"
              class="mt-3 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ saving ? 'Updating...' : `Update to Phase ${calculatedPhase}` }}
            </button>
          </div>
        </div>
      </div>

      <!-- Manual Phase Selector -->
      <div class="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Manual Phase Selection</h3>

        <!-- Phase Badge Selector -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-3">Select Phase</label>
          <div class="flex gap-3">
            <button
              v-for="phase in ([0, 1, 2, 3, 4] as const)"
              :key="phase"
              @click="selectedPhase = phase"
              :class="[
                'flex flex-col items-center justify-center w-20 h-20 rounded-lg border-2 transition-all',
                selectedPhase === phase
                  ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-2'
                  : 'border-gray-200 hover:border-gray-400',
                getPhaseInfo(phase).bgClass
              ]"
              :title="getPhaseInfo(phase).label"
            >
              <span class="text-white font-bold text-2xl">{{ phase }}</span>
              <span class="text-white text-xs mt-1 opacity-90">{{ getPhaseInfo(phase).label.split(' ')[0] }}</span>
            </button>
          </div>
        </div>

        <!-- Selected Phase Info -->
        <div v-if="selectedPhase !== product?.current_phase" class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p class="text-sm text-blue-900">
            <strong>Selected:</strong> Phase {{ selectedPhase }} - {{ getPhaseInfo(selectedPhase).label }}
          </p>
        </div>

        <!-- Optional Reason -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Reason for manual change (optional)
          </label>
          <input
            v-model="changeReason"
            type="text"
            placeholder="e.g., Customer hold, special agreement, manual override..."
            class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
          />
          <p class="mt-1 text-xs text-gray-500">This reason will be logged in phase history</p>
        </div>

        <!-- Save Button -->
        <button
          @click="savePhaseChange"
          :disabled="selectedPhase === product?.current_phase || saving"
          class="w-full px-4 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {{ saving ? 'Saving...' : 'Save Phase Change' }}
        </button>
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
              <dd class="mt-1 text-sm text-gray-900">{{ getArticleGroupDisplay(product.artikelgroep) }}</dd>
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
              <dt class="text-sm font-medium text-gray-500">Per Dozen (DOZ)</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ product.unit_per_dozen || 'Not set' }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Per Pallet (PAL)</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ product.unit_per_pallet || 'Not set' }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Per Outer Dozen (ODZ)</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ product.unit_per_outer_dozen || 'Not set' }}</dd>
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
import type { ProductWithCalculations, EOLPhase } from '~/types/database';
import { getArticleGroupDisplay } from '~/utils/articleGroups';
import { calculateProductPhase, getPhaseInfo, formatDate, formatCurrency } from '~/utils/phaseCalculator';

definePageMeta({
  layout: 'default'
});

const route = useRoute();
const router = useRouter();
const supabase = useSupabaseClient();
const { fetchProductById, deleteProduct } = useProducts();

const productId = route.params.id as string;
const product = ref<ProductWithCalculations | null>(null);
const loading = ref(true);

// Phase management state
const selectedPhase = ref<EOLPhase>(0);
const changeReason = ref('');
const saving = ref(false);

onMounted(async () => {
  product.value = await fetchProductById(productId);
  loading.value = false;

  if (product.value) {
    selectedPhase.value = product.value.current_phase;
  }
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

// Phase calculation
const calculatedPhase = computed(() => {
  if (!product.value) return null;
  return calculateProductPhase(product.value);
});

const phaseMismatch = computed(() => {
  return calculatedPhase.value !== null &&
         calculatedPhase.value !== product.value?.current_phase;
});

// Watch for product changes to update selectedPhase
watch(() => product.value?.current_phase, (newPhase) => {
  if (newPhase !== undefined) {
    selectedPhase.value = newPhase;
  }
});

// Functions
async function updateToCalculatedPhase() {
  if (calculatedPhase.value === null || !product.value) return;

  saving.value = true;
  try {
    const { error } = await (supabase
      .from('products') as any)
      .update({
        current_phase: calculatedPhase.value
      })
      .eq('id', product.value.id);

    if (error) throw error;

    // Refresh product data
    product.value = await fetchProductById(productId);
    if (product.value) {
      selectedPhase.value = product.value.current_phase;
    }
  } catch (error) {
    console.error('Failed to update phase:', error);
    alert('Failed to update phase');
  } finally {
    saving.value = false;
  }
}

async function savePhaseChange() {
  if (!product.value || selectedPhase.value === product.value.current_phase) return;

  saving.value = true;
  try {
    // Update phase
    const { error } = await (supabase
      .from('products') as any)
      .update({
        current_phase: selectedPhase.value
      })
      .eq('id', product.value.id);

    if (error) throw error;

    // If reason provided, add to phase_history
    if (changeReason.value.trim()) {
      await (supabase
        .from('phase_history') as any)
        .insert({
          product_id: product.value.id,
          from_phase: product.value.current_phase,
          to_phase: selectedPhase.value,
          reason: changeReason.value.trim()
        });
    }

    // Refresh product data
    product.value = await fetchProductById(productId);
    changeReason.value = '';
  } catch (error) {
    console.error('Failed to save phase change:', error);
    alert('Failed to save phase change');
  } finally {
    saving.value = false;
  }
}

const handleDelete = async () => {
  if (!confirm('Are you sure you want to delete this product?')) return;

  const success = await deleteProduct(productId);
  if (success) {
    router.push('/');
  }
};
</script>
