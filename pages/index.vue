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

    <!-- Filters - Minimal Ghost Style -->
    <div class="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div class="flex items-center gap-3 relative">
        <!-- Search Box -->
        <div class="flex-1">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by product name or code..."
            class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors"
          />
        </div>

        <!-- Filter Button -->
        <button
          ref="filterButtonRef"
          @click.stop="showFilters = !showFilters"
          class="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 text-sm font-medium"
        >
          <!-- Filter Icon -->
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <span>Filters</span>
          <span
            v-if="activeFilterCount > 0"
            class="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-gray-900 text-white text-xs font-semibold rounded-full"
          >
            {{ activeFilterCount }}
          </span>
        </button>

        <!-- Filter Popover -->
        <div
          v-if="showFilters"
          :style="popoverStyle"
          class="filter-popover w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
          @click.stop
        >
          <div class="p-4">
            <!-- Header -->
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-semibold text-gray-900">Filters</h3>
              <button
                @click="showFilters = false"
                class="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Filter Options -->
            <div class="space-y-4">
              <!-- Phase Filter -->
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1.5">Phase</label>
                <select
                  v-model="selectedPhase"
                  class="w-full appearance-none px-3 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 bg-white bg-no-repeat bg-right text-sm text-left truncate"
                  style="background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 20 20%27 fill=%27%236B7280%27%3e%3cpath fill-rule=%27evenodd%27 d=%27M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z%27 clip-rule=%27evenodd%27/%3e%3c/svg%3e'); background-position: right 0.5rem center; background-size: 1.25em 1.25em;"
                >
                  <option :value="null">All Phases</option>
                  <option v-for="phase in PHASES" :key="phase" :value="phase">
                    Phase {{ phase }} - {{ getPhaseInfo(phase).label }}
                  </option>
                </select>
              </div>

              <!-- Group Filter -->
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1.5">Group</label>
                <select
                  v-model="selectedGroup"
                  class="w-full appearance-none px-3 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 bg-white bg-no-repeat bg-right text-sm text-left truncate"
                  style="background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 20 20%27 fill=%27%236B7280%27%3e%3cpath fill-rule=%27evenodd%27 d=%27M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z%27 clip-rule=%27evenodd%27/%3e%3c/svg%3e'); background-position: right 0.5rem center; background-size: 1.25em 1.25em;"
                >
                  <option :value="null">All Groups</option>
                  <option v-for="group in productGroups" :key="group || ''" :value="group">
                    {{ getArticleGroupDisplay(group) }}
                  </option>
                </select>
              </div>

              <!-- Status Filter -->
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1.5">Status</label>
                <select
                  v-model="selectedBlockedStatus"
                  class="w-full appearance-none px-3 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 bg-white bg-no-repeat bg-right text-sm text-left truncate"
                  style="background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 20 20%27 fill=%27%236B7280%27%3e%3cpath fill-rule=%27evenodd%27 d=%27M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z%27 clip-rule=%27evenodd%27/%3e%3c/svg%3e'); background-position: right 0.5rem center; background-size: 1.25em 1.25em;"
                >
                  <option :value="null">All Status</option>
                  <option :value="false">Active</option>
                  <option :value="true">Blocked</option>
                </select>
              </div>

              <!-- Supplier Filter -->
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1.5">Supplier</label>
                <select
                  v-model="selectedSupplier"
                  class="w-full appearance-none px-3 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 bg-white bg-no-repeat bg-right text-sm text-left truncate"
                  style="background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 20 20%27 fill=%27%236B7280%27%3e%3cpath fill-rule=%27evenodd%27 d=%27M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z%27 clip-rule=%27evenodd%27/%3e%3c/svg%3e'); background-position: right 0.5rem center; background-size: 1.25em 1.25em;"
                >
                  <option :value="null">All Suppliers</option>
                  <option v-for="supplier in supplierList" :key="supplier" :value="supplier">
                    {{ supplier }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Clear All Button -->
            <div v-if="activeFilterCount > 0" class="mt-4 pt-4 border-t border-gray-200">
              <button
                @click="clearAllFilters"
                class="w-full px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Clear all filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Advanced Filters -->
    <AdvancedFilters v-model:filterGroup="advancedFilterGroup" class="mb-6" />

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
            <col class="w-28"><!-- Inventory -->
            <col class="w-28"><!-- Avg Sales -->
            <col class="w-32"><!-- Stock Health -->
            <col class="w-32"><!-- EOL Date -->
            <col class="w-24"><!-- Actions -->
          </colgroup>
          <thead>
            <tr class="border-b border-gray-200 bg-gray-50">
              <!-- Phase -->
              <th scope="col" class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                <button @click="toggleSort('current_phase')" class="flex items-center gap-1 hover:text-gray-900">
                  <span>Phase</span>
                  <svg v-if="sortColumn === 'current_phase'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path v-if="sortDirection === 'asc'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </th>

              <!-- Product -->
              <th scope="col" class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                <button @click="toggleSort('product_name')" class="flex items-center gap-1 hover:text-gray-900">
                  <span>Product</span>
                  <svg v-if="sortColumn === 'product_name'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path v-if="sortDirection === 'asc'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </th>

              <!-- Inventory -->
              <th scope="col" class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                <button @click="toggleSort('stock_regular')" class="flex items-center gap-1 hover:text-gray-900">
                  <span>Inventory</span>
                  <svg v-if="sortColumn === 'stock_regular'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path v-if="sortDirection === 'asc'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </th>

              <!-- Avg Sales -->
              <th scope="col" class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                <button @click="toggleSort('monthly_sales')" class="flex items-center gap-1 hover:text-gray-900">
                  <span>Avg Sales</span>
                  <svg v-if="sortColumn === 'monthly_sales'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path v-if="sortDirection === 'asc'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </th>

              <!-- Stock Health -->
              <th scope="col" class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                <button @click="toggleSort('months_of_stock')" class="flex items-center gap-1 hover:text-gray-900">
                  <span>Stock Health</span>
                  <svg v-if="sortColumn === 'months_of_stock'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path v-if="sortDirection === 'asc'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </th>

              <!-- EOL Date -->
              <th scope="col" class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                <button @click="toggleSort('eol_date')" class="flex items-center gap-1 hover:text-gray-900">
                  <span>EOL Date</span>
                  <svg v-if="sortColumn === 'eol_date'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path v-if="sortDirection === 'asc'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </th>

              <!-- Actions -->
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

              <!-- Inventory -->
              <td class="px-4 py-4">
                <span class="text-sm text-gray-900 font-medium">{{ product.stock_regular }} units</span>
              </td>

              <!-- Avg Sales -->
              <td class="px-4 py-4">
                <span class="text-sm text-gray-900 font-medium">{{ product.monthly_sales }}/month</span>
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
import type { FilterGroup } from '~/types/filters';
import { getArticleGroupDisplay } from '~/utils/articleGroups';
import { evaluateGroup } from '~/utils/filterEvaluation';

definePageMeta({
  layout: 'default'
});

const { products, loading, error, fetchProducts, updateAllPhases } = useProducts();

// Phase constants
const PHASES: EOLPhase[] = [0, 1, 2, 3, 4];

// Simple Filters
const searchQuery = ref('');
const selectedPhase = ref<EOLPhase | null>(null);
const selectedGroup = ref<string | null>(null);
const selectedBlockedStatus = ref<boolean | null>(null);
const selectedSupplier = ref<string | null>(null);

// Filter popover state
const showFilters = ref(false);
const filterButtonRef = ref<HTMLElement | null>(null);

// Advanced Filters
const advancedFilterGroup = ref<FilterGroup>({
  id: 'main-group',
  logic: 'AND',
  conditions: []
});

// Column Sorting
const sortColumn = ref<string | null>(null);
const sortDirection = ref<'asc' | 'desc' | null>(null);

// Fetch products on mount
onMounted(async () => {
  await fetchProducts();

  // Setup click outside handler for filter popover
  document.addEventListener('click', handleClickOutside);

  // Close popover on scroll/resize for better UX
  window.addEventListener('scroll', closeFiltersOnScroll, true);
  window.addEventListener('resize', closeFiltersOnScroll);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('scroll', closeFiltersOnScroll, true);
  window.removeEventListener('resize', closeFiltersOnScroll);
});

function handleClickOutside(event: Event) {
  if (!showFilters.value) return;

  const target = event.target as HTMLElement;
  const popover = document.querySelector('.filter-popover');
  const button = event.target as HTMLElement;

  // Don't close if clicking inside popover
  if (popover && popover.contains(target)) {
    return;
  }

  // Don't close if clicking the filter button (it has its own toggle)
  if (button.closest('button')?.textContent?.includes('Filters')) {
    return;
  }

  showFilters.value = false;
}

function closeFiltersOnScroll() {
  if (showFilters.value) {
    showFilters.value = false;
  }
}

// Get unique product groups for filter dropdown
const productGroups = computed(() => {
  const groups = products.value
    .map(p => p.artikelgroep)
    .filter(g => g !== null && g !== '');
  return [...new Set(groups)].sort();
});

// Get unique suppliers for filter dropdown
const supplierList = computed(() => {
  const suppliers = products.value
    .map(p => p.supplier)
    .filter((s): s is string => s !== null && s !== '');
  return [...new Set(suppliers)].sort();
});

// Filtered products based on all filters
const filteredProducts = computed(() => {
  let filtered = products.value;

  // Apply simple filters first
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

  // Filter by supplier
  if (selectedSupplier.value !== null) {
    filtered = filtered.filter(p => p.supplier === selectedSupplier.value);
  }

  // Apply advanced filters
  if (advancedFilterGroup.value.conditions.length > 0) {
    filtered = filtered.filter(p => evaluateGroup(p, advancedFilterGroup.value));
  }

  // Apply sorting
  if (sortColumn.value && sortDirection.value) {
    filtered = [...filtered].sort((a, b) => {
      const aVal = a[sortColumn.value as keyof typeof a];
      const bVal = b[sortColumn.value as keyof typeof b];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (aVal < bVal) return sortDirection.value === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection.value === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return filtered;
});

// Active filter count
const activeFilterCount = computed(() => {
  let count = 0;
  if (selectedPhase.value !== null) count++;
  if (selectedGroup.value !== null) count++;
  if (selectedBlockedStatus.value !== null) count++;
  if (selectedSupplier.value !== null) count++;
  return count;
});

// Popover positioning (viewport-aware)
const popoverStyle = computed(() => {
  if (!showFilters.value || !filterButtonRef.value) {
    return { display: 'none' };
  }

  const rect = filterButtonRef.value.getBoundingClientRect();
  const popoverWidth = 320; // w-80 = 320px
  const viewportWidth = window.innerWidth;
  const padding = 16;

  // Calculate right position to stay within viewport
  const rightEdge = rect.right;
  const spaceOnRight = viewportWidth - rightEdge;

  // Position popover
  let style: Record<string, string> = {
    position: 'fixed',
    top: `${rect.bottom + 8}px`,
    maxWidth: `${viewportWidth - padding * 2}px`
  };

  // If there's enough space on the right, align with button's right edge
  if (spaceOnRight >= padding) {
    style.right = `${viewportWidth - rightEdge}px`;
  } else {
    // Otherwise, position with padding from viewport right edge
    style.right = `${padding}px`;
  }

  return style;
});

// Filter functions
function clearAllFilters() {
  selectedPhase.value = null;
  selectedGroup.value = null;
  selectedBlockedStatus.value = null;
  selectedSupplier.value = null;
}

// Column sorting
function toggleSort(column: string) {
  if (sortColumn.value === column) {
    // Cycle through: asc -> desc -> null
    if (sortDirection.value === 'asc') {
      sortDirection.value = 'desc';
    } else if (sortDirection.value === 'desc') {
      sortColumn.value = null;
      sortDirection.value = null;
    }
  } else {
    sortColumn.value = column;
    sortDirection.value = 'asc';
  }
}

// Get count of products in each phase
const getPhaseCount = (phase: EOLPhase) => {
  return products.value.filter(p => p.current_phase === phase).length;
};
</script>
