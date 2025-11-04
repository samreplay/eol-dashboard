<template>
  <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
    <!-- Phase Indicator -->
    <div :class="phaseInfo.bgClass" class="h-2"></div>

    <div class="p-6">
      <!-- Header -->
      <div class="flex justify-between items-start mb-4">
        <div class="flex-1">
          <h3 class="text-lg font-bold text-gray-900 mb-1">{{ product.product_name }}</h3>
          <p class="text-sm text-gray-500">{{ product.product_code }}</p>
        </div>
        <span
          :class="phaseInfo.bgClass"
          class="px-3 py-1 rounded-full text-white text-sm font-semibold"
        >
          Phase {{ product.current_phase }}
        </span>
      </div>

      <!-- Product Details -->
      <div class="space-y-2 mb-4">
        <div class="flex justify-between text-sm">
          <span class="text-gray-600">Stock:</span>
          <span class="font-medium">{{ product.stock_quantity }} units</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-600">Monthly Sales:</span>
          <span class="font-medium">{{ product.monthly_sales }} units</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-600">Months of Stock:</span>
          <span class="font-medium">
            {{ product.months_of_stock > 0 ? product.months_of_stock.toFixed(1) : 'N/A' }}
          </span>
        </div>
        <div v-if="product.eol_date" class="flex justify-between text-sm">
          <span class="text-gray-600">EOL Date:</span>
          <span class="font-medium">{{ formatDate(product.eol_date) }}</span>
        </div>
        <div v-if="product.days_since_eol !== null" class="flex justify-between text-sm">
          <span class="text-gray-600">Days Since EOL:</span>
          <span class="font-medium">{{ product.days_since_eol }} days</span>
        </div>
      </div>

      <!-- Pricing -->
      <div v-if="product.rrp || product.msp" class="border-t pt-3 mb-4">
        <div class="flex justify-between text-sm">
          <span class="text-gray-600">RRP / MSP:</span>
          <span class="font-medium">
            {{ formatCurrency(product.rrp) }} / {{ formatCurrency(product.msp) }}
          </span>
        </div>
      </div>

      <!-- Status Badges -->
      <div class="flex gap-2 mb-4">
        <span
          :class="product.website_status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
          class="px-2 py-1 rounded text-xs font-medium"
        >
          Website: {{ product.website_status }}
        </span>
        <span
          :class="product.reseller_portal_status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
          class="px-2 py-1 rounded text-xs font-medium"
        >
          Portal: {{ product.reseller_portal_status }}
        </span>
      </div>

      <!-- Actions -->
      <div class="flex gap-2">
        <NuxtLink
          :to="`/products/${product.id}`"
          class="flex-1 px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          View Details
        </NuxtLink>
        <NuxtLink
          :to="`/products/${product.id}/edit`"
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          Edit
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProductWithCalculations } from '~/types/database';

const props = defineProps<{
  product: ProductWithCalculations;
}>();

defineEmits<{
  refresh: [];
}>();

const phaseInfo = computed(() => getPhaseInfo(props.product.current_phase));
</script>
