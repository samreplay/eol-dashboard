<template>
  <div>
    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      <div
        v-for="phase in PHASES"
        :key="phase"
        class="bg-white rounded-lg border border-gray-300 p-4 shadow-sm hover:shadow-md transition-shadow"
      >
        <div class="flex items-center justify-between mb-2">
          <div>
            <p class="text-xs font-medium text-gray-600 uppercase">Phase {{ phase }}</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ getPhaseCount(phase) }}</p>
          </div>
          <div :class="getPhaseInfo(phase).bgClass" class="w-10 h-10 rounded flex items-center justify-center">
            <span class="text-white font-semibold">{{ phase }}</span>
          </div>
        </div>
        <p class="text-xs font-medium text-gray-600">{{ getPhaseInfo(phase).label }}</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg border border-gray-300 p-4 mb-6 shadow-sm">
      <div class="flex flex-wrap gap-3">
        <div class="flex-1 min-w-[200px]">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by product name or code..."
            class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <select
            v-model="selectedPhase"
            class="px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option :value="null">All Phases</option>
            <option v-for="phase in PHASES" :key="phase" :value="phase">
              Phase {{ phase }} - {{ getPhaseInfo(phase).label }}
            </option>
          </select>
        </div>
        <div>
          <select
            v-model="selectedGroup"
            class="px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option :value="null">All Groups</option>
            <option v-for="group in productGroups" :key="group || ''" :value="group">
              {{ group }}
            </option>
          </select>
        </div>
        <div>
          <select
            v-model="selectedBlockedStatus"
            class="px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option :value="null">All Status</option>
            <option :value="false">Active</option>
            <option :value="true">Blocked</option>
          </select>
        </div>
        <button
          @click="refreshProducts"
          :disabled="loading"
          class="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors disabled:opacity-50 font-medium border border-gray-300"
        >
          {{ loading ? 'Loading...' : 'Refresh' }}
        </button>
        <button
          @click="updatePhases"
          :disabled="loading"
          class="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
        >
          Update Phases
        </button>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
      {{ error }}
    </div>

    <!-- Products Table -->
    <div v-if="loading && products.length === 0" class="text-center py-12">
      <p class="text-gray-500">Loading products...</p>
    </div>

    <div v-else-if="filteredProducts.length === 0" class="text-center py-12 bg-white rounded-lg shadow">
      <p class="text-gray-500">No products found. Add your first product to get started!</p>
      <NuxtLink to="/products/new" class="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        Add Product
      </NuxtLink>
    </div>

    <div v-else class="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full table-fixed">
          <colgroup>
            <col class="w-20"><!-- Phase -->
            <col class="w-auto"><!-- Product (flex) -->
            <col class="w-32"><!-- Inventory -->
            <col class="w-32"><!-- Stock Health -->
            <col class="w-32"><!-- EOL Date -->
            <col class="w-24"><!-- Actions -->
          </colgroup>
          <thead>
            <tr class="border-b border-gray-200 bg-gray-50">
              <th scope="col" class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Phase
              </th>
              <th scope="col" class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Product
              </th>
              <th scope="col" class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Inventory
              </th>
              <th scope="col" class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Stock Health
              </th>
              <th scope="col" class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                EOL Date
              </th>
              <th scope="col" class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="(product, index) in filteredProducts"
              :key="product.id"
              class="hover:bg-gray-50 cursor-pointer group"
              @click="$router.push(`/products/${product.id}`)"
            >
              <!-- Phase Badge -->
              <td class="px-4 py-4">
                <span
                  :class="getPhaseInfo(product.current_phase).bgClass"
                  class="inline-flex items-center justify-center w-8 h-8 rounded text-sm font-semibold text-white"
                >
                  {{ product.current_phase }}
                </span>
              </td>

              <!-- Product Info -->
              <td class="px-4 py-4">
                <div class="flex flex-col">
                  <span class="text-sm font-semibold text-gray-900">{{ product.product_name }}</span>
                  <span class="text-xs text-gray-500 font-mono">{{ product.product_code }}</span>
                </div>
              </td>

              <!-- Inventory (Stock + Sales) -->
              <td class="px-4 py-4">
                <div class="flex flex-col text-sm">
                  <span class="text-gray-900 font-medium">{{ product.stock_regular }} units</span>
                  <span class="text-xs text-gray-600">{{ product.monthly_sales }}/month</span>
                </div>
              </td>

              <!-- Stock Health -->
              <td class="px-4 py-4">
                <div v-if="product.months_of_stock > 0" class="flex items-center gap-2">
                  <div
                    class="w-2 h-2 rounded-full"
                    :class="{
                      'bg-red-500': product.months_of_stock < 1,
                      'bg-orange-500': product.months_of_stock >= 1 && product.months_of_stock < 3,
                      'bg-green-500': product.months_of_stock >= 3
                    }"
                  ></div>
                  <span
                    class="text-sm font-medium"
                    :class="{
                      'text-red-600': product.months_of_stock < 1,
                      'text-orange-600': product.months_of_stock >= 1 && product.months_of_stock < 3,
                      'text-green-600': product.months_of_stock >= 3
                    }"
                  >
                    {{ product.months_of_stock.toFixed(1) }}mo
                  </span>
                </div>
                <span v-else class="text-sm text-gray-400">-</span>
              </td>

              <!-- EOL Date -->
              <td class="px-4 py-4">
                <div v-if="product.eol_date" class="flex flex-col">
                  <span class="text-sm text-gray-900 font-medium">{{ formatDate(product.eol_date) }}</span>
                  <span v-if="product.days_since_eol !== null" class="text-xs text-gray-600">
                    {{ product.days_since_eol }}d ago
                  </span>
                </div>
                <span v-else class="text-sm text-gray-400">-</span>
              </td>

              <!-- Actions -->
              <td class="px-4 py-4" @click.stop>
                <div class="flex justify-end gap-2">
                  <NuxtLink
                    :to="`/products/${product.id}`"
                    class="inline-flex items-center justify-center w-8 h-8 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="View"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  </NuxtLink>
                  <NuxtLink
                    :to="`/products/edit-${product.id}`"
                    class="inline-flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                    title="Edit"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </NuxtLink>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Table Footer -->
      <div class="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <p class="text-sm text-gray-700">
            Showing <span class="font-semibold text-gray-900">{{ filteredProducts.length }}</span>
            <span v-if="filteredProducts.length !== products.length"> of <span class="font-semibold text-gray-900">{{ products.length }}</span></span>
            {{ filteredProducts.length === 1 ? 'product' : 'products' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EOLPhase } from '~/types/database';

definePageMeta({
  layout: 'default'
});

const { products, loading, error, fetchProducts, updateAllPhases } = useProducts();

// Phase constants
const PHASES: EOLPhase[] = [0, 1, 2, 3, 4];

// Filters
const searchQuery = ref('');
const selectedPhase = ref<EOLPhase | null>(null);
const selectedGroup = ref<string | null>(null);
const selectedBlockedStatus = ref<boolean | null>(null);

// Fetch products on mount
onMounted(async () => {
  await fetchProducts();
});

// Get unique product groups for filter dropdown
const productGroups = computed(() => {
  const groups = products.value
    .map(p => p.artikelgroep)
    .filter(g => g !== null && g !== '');
  return [...new Set(groups)].sort();
});

// Filtered products based on all filters
const filteredProducts = computed(() => {
  let filtered = products.value;

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(p =>
      p.product_name.toLowerCase().includes(query) ||
      p.product_code.toLowerCase().includes(query)
    );
  }

  // Filter by phase
  if (selectedPhase.value !== null) {
    filtered = filtered.filter(p => p.current_phase === selectedPhase.value);
  }

  // Filter by product group
  if (selectedGroup.value !== null) {
    filtered = filtered.filter(p => p.artikelgroep === selectedGroup.value);
  }

  // Filter by blocked status
  if (selectedBlockedStatus.value !== null) {
    filtered = filtered.filter(p => p.product_blocked === selectedBlockedStatus.value);
  }

  return filtered;
});

// Get count of products in each phase
const getPhaseCount = (phase: EOLPhase) => {
  return products.value.filter(p => p.current_phase === phase).length;
};

// Refresh products
const refreshProducts = async () => {
  await fetchProducts();
};

// Update all phases
const updatePhases = async () => {
  const count = await updateAllPhases();
  if (count > 0) {
    alert(`Updated ${count} product(s) to new phases`);
  } else {
    alert('All products are already in the correct phase');
  }
};
</script>
