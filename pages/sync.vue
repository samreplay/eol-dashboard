<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">AFAS Data Sync</h1>
        <p class="mt-2 text-sm text-gray-600">
          Synchronize product data from AFAS to the dashboard database.
        </p>
      </div>

      <!-- Connector Selection Card -->
      <div class="bg-white shadow rounded-lg p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900">Select Connectors</h2>
          <div class="space-x-2">
            <button
              @click="selectAll"
              class="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Select All
            </button>
            <button
              @click="deselectAll"
              class="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Deselect All
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <label
            v-for="connector in availableConnectors"
            :key="connector.id"
            class="flex items-center gap-2 p-3 border border-gray-200 rounded cursor-pointer hover:bg-gray-50"
            :class="{ 'bg-blue-50 border-blue-300': selectedConnectors.includes(connector.id) }"
          >
            <input
              type="checkbox"
              v-model="selectedConnectors"
              :value="connector.id"
              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div>
              <div class="text-sm font-medium text-gray-900">{{ connector.label }}</div>
              <div class="text-xs text-gray-600">{{ connector.name }}</div>
            </div>
          </label>
        </div>

        <p class="mt-3 text-xs text-gray-500">
          {{ selectedConnectors.length }} of {{ availableConnectors.length }} connectors selected
        </p>
      </div>

      <!-- Sync Control Card -->
      <div class="bg-white shadow rounded-lg p-6 mb-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between">
          <div class="mb-4 md:mb-0 flex-1">
            <h2 class="text-xl font-semibold text-gray-900">Manual Sync</h2>
            <p class="text-sm text-gray-600 mt-1">
              Pull latest data from AFAS and update all products
            </p>
            <div v-if="lastSyncResult" class="mt-2 text-xs text-gray-500">
              Last sync: {{ formatDate(lastSyncResult.timestamp) }}
              <span v-if="lastSyncResult.success" class="text-green-600">
                ({{ lastSyncResult.summary.updated }} products updated)
              </span>
              <span v-else class="text-red-600">(Failed)</span>
              <span v-if="lastSyncResult.test_mode" class="text-orange-600 ml-2">[Test Mode]</span>
            </div>

            <!-- Test Mode Checkbox -->
            <div class="mt-4">
              <label class="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  v-model="testMode"
                  class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span class="text-sm font-medium text-gray-700">
                  Test Mode (10 records only)
                </span>
              </label>
              <p class="text-xs text-gray-500 mt-1 ml-6">
                Enable to sync only 10 products for testing before doing a full sync
              </p>
            </div>
          </div>

          <div class="flex flex-col items-end space-y-2">
            <button
              @click="startSync"
              :disabled="syncing"
              :class="[
                'px-8 py-3 text-white text-lg font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors',
                testMode ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'
              ]"
            >
              {{ syncing ? 'Syncing...' : (testMode ? 'Test Sync (10)' : 'Full Sync') }}
            </button>
            <div v-if="testMode" class="text-xs text-orange-600 font-medium">
              ⚠️ Test mode enabled
            </div>
          </div>
        </div>
      </div>

      <!-- Test Mode Warning -->
      <div v-if="testMode && !syncing" class="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
        <div class="flex items-start">
          <svg class="w-5 h-5 text-orange-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div class="flex-1">
            <h4 class="text-sm font-semibold text-orange-900">Test Mode Enabled</h4>
            <p class="text-sm text-orange-700 mt-1">
              Only the first 10 products will be synced. Uncheck "Test Mode" above to sync all ~1400 products.
            </p>
          </div>
        </div>
      </div>

      <!-- Supplier Import Card -->
      <div class="bg-white shadow rounded-lg p-6 mb-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between">
          <div class="mb-4 md:mb-0 flex-1">
            <h2 class="text-xl font-semibold text-gray-900">Supplier Import</h2>
            <p class="text-sm text-gray-600 mt-1">
              Import supplier data from mappings into product records
            </p>
            <div v-if="lastSupplierResult" class="mt-2 text-xs text-gray-500">
              Last import: {{ formatDate(lastSupplierResult.timestamp) }}
              <span v-if="lastSupplierResult.success" class="text-green-600">
                ({{ lastSupplierResult.updated }} products updated)
              </span>
              <span v-else class="text-red-600">(Failed)</span>
            </div>
          </div>

          <button
            @click="startSupplierImport"
            :disabled="importingSuppliers"
            class="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white text-lg font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {{ importingSuppliers ? 'Importing...' : 'Import Suppliers' }}
          </button>
        </div>
      </div>

      <!-- Supplier Import Progress -->
      <div v-if="importingSuppliers" class="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
        <div class="flex items-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mr-4"></div>
          <div>
            <h3 class="text-lg font-semibold text-purple-900">Supplier import in progress...</h3>
            <p class="text-sm text-purple-700 mt-1">Updating product records with supplier data</p>
          </div>
        </div>
      </div>

      <!-- Supplier Import Results -->
      <div v-if="lastSupplierResult && !importingSuppliers" class="mb-6">
        <div
          :class="[
            'rounded-lg p-6',
            lastSupplierResult.success
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          ]"
        >
          <div class="flex items-start">
            <div
              :class="[
                'w-6 h-6 rounded-full mr-4 flex items-center justify-center',
                lastSupplierResult.success ? 'bg-green-500' : 'bg-red-500'
              ]"
            >
              <svg
                v-if="lastSupplierResult.success"
                class="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <svg
                v-else
                class="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div class="flex-1">
              <h3
                :class="[
                  'text-xl font-semibold',
                  lastSupplierResult.success ? 'text-green-900' : 'text-red-900'
                ]"
              >
                {{ lastSupplierResult.success ? 'Import Successful' : 'Import Failed' }}
              </h3>
              <p
                :class="[
                  'text-sm mt-1',
                  lastSupplierResult.success ? 'text-green-700' : 'text-red-700'
                ]"
              >
                {{ lastSupplierResult.message }}
              </p>
              <div v-if="lastSupplierResult.success" class="mt-3 grid grid-cols-3 gap-4">
                <div>
                  <div class="text-2xl font-bold text-green-900">{{ lastSupplierResult.updated }}</div>
                  <div class="text-xs text-green-700">Updated</div>
                </div>
                <div>
                  <div class="text-2xl font-bold text-blue-900">{{ lastSupplierResult.matched }}</div>
                  <div class="text-xs text-blue-700">Matched</div>
                </div>
                <div>
                  <div class="text-2xl font-bold text-gray-900">{{ lastSupplierResult.unmatched }}</div>
                  <div class="text-xs text-gray-700">No Supplier</div>
                </div>
              </div>
              <p v-if="!lastSupplierResult.success && lastSupplierResult.error" class="text-sm text-red-800 mt-2">
                <strong>Error:</strong> {{ lastSupplierResult.error }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Progress Indicator -->
      <div v-if="syncing" class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <div class="flex items-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-4"></div>
          <div>
            <h3 class="text-lg font-semibold text-blue-900">
              {{ testMode ? 'Test sync in progress...' : 'Full sync in progress...' }}
            </h3>
            <p class="text-sm text-blue-700 mt-1">
              Fetching data from AFAS connectors and updating database
              {{ testMode ? '(10 products)' : '(~1400 products)' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Last Sync Results -->
      <div v-if="lastSyncResult && !syncing" class="space-y-6">
        <!-- Status Banner -->
        <div
          :class="[
            'rounded-lg p-6',
            lastSyncResult.success
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          ]"
        >
          <div class="flex items-start">
            <div
              :class="[
                'w-6 h-6 rounded-full mr-4 flex items-center justify-center',
                lastSyncResult.success ? 'bg-green-500' : 'bg-red-500'
              ]"
            >
              <svg
                v-if="lastSyncResult.success"
                class="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <svg
                v-else
                class="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div class="flex-1">
              <h3
                :class="[
                  'text-xl font-semibold',
                  lastSyncResult.success ? 'text-green-900' : 'text-red-900'
                ]"
              >
                {{ lastSyncResult.success ? 'Sync Successful' : 'Sync Failed' }}
              </h3>
              <p
                :class="[
                  'text-sm mt-1',
                  lastSyncResult.success ? 'text-green-700' : 'text-red-700'
                ]"
              >
                {{ formatDate(lastSyncResult.timestamp) }} • Completed in {{ lastSyncResult.duration_ms }}ms
              </p>
              <p v-if="!lastSyncResult.success" class="text-sm text-red-800 mt-2">
                <strong>Error:</strong> {{ lastSyncResult.error }}
              </p>
            </div>
          </div>
        </div>

        <!-- Summary Stats -->
        <div v-if="lastSyncResult.success" class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-blue-50 p-4 rounded-lg">
              <div class="text-3xl font-bold text-blue-900">
                {{ lastSyncResult.summary.total_products }}
              </div>
              <div class="text-sm text-blue-700">Total Products</div>
            </div>
            <div class="bg-green-50 p-4 rounded-lg">
              <div class="text-3xl font-bold text-green-900">
                {{ lastSyncResult.summary.updated }}
              </div>
              <div class="text-sm text-green-700">Updated</div>
            </div>
            <div class="bg-red-50 p-4 rounded-lg">
              <div class="text-3xl font-bold text-red-900">
                {{ lastSyncResult.summary.errors }}
              </div>
              <div class="text-sm text-red-700">Errors</div>
            </div>
          </div>
        </div>

        <!-- Source Counts -->
        <div v-if="lastSyncResult.success && lastSyncResult.details" class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Data Sources</h3>
          <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-900">
                {{ lastSyncResult.details.source_counts.items }}
              </div>
              <div class="text-xs text-gray-600">Items</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-900">
                {{ lastSyncResult.details.source_counts.prices }}
              </div>
              <div class="text-xs text-gray-600">Prices</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-900">
                {{ lastSyncResult.details.source_counts.stock }}
              </div>
              <div class="text-xs text-gray-600">Stock</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-900">
                {{ lastSyncResult.details.source_counts.sales }}
              </div>
              <div class="text-xs text-gray-600">Sales</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-900">
                {{ lastSyncResult.details.source_counts.units }}
              </div>
              <div class="text-xs text-gray-600">Units</div>
            </div>
          </div>
        </div>

        <!-- Errors -->
        <div
          v-if="lastSyncResult.errors && lastSyncResult.errors.length > 0"
          class="bg-white shadow rounded-lg p-6"
        >
          <h3 class="text-lg font-semibold text-red-900 mb-4">
            Errors ({{ lastSyncResult.errors.length }})
          </h3>
          <div class="space-y-2">
            <div
              v-for="(err, index) in lastSyncResult.errors"
              :key="index"
              class="p-3 bg-red-50 border border-red-200 rounded text-sm"
            >
              <span class="font-mono font-semibold text-red-900">{{ err.product_code }}</span>
              <span class="text-red-700">: {{ err.error }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Info Box -->
      <div class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 class="text-lg font-semibold text-blue-900 mb-3">About AFAS Sync</h3>
        <div class="text-sm text-blue-800 space-y-2">
          <p>
            The sync process fetches data from 5 AFAS GetConnectors:
          </p>
          <ul class="list-disc list-inside ml-4 space-y-1">
            <li><strong>Dashboard Items</strong> - Product information, names, groups, blocking status</li>
            <li><strong>General Sales Price</strong> - Multi-currency pricing (EUR, GBP, USD)</li>
            <li><strong>Stock</strong> - Warehouse stock levels, on order, reserved</li>
            <li><strong>Cumulative Sales</strong> - Rolling 12-month sales history</li>
            <li><strong>Unit Per Item</strong> - Packaging units (dozen, pallet, etc.)</li>
          </ul>
          <p class="mt-3">
            All product data is upserted: existing products are updated, new products are inserted.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Page metadata
definePageMeta({
  layout: 'default'
});

// Available connectors
const availableConnectors = [
  { id: 'cumulative_sales', name: 'EOL_dashboard_Cumulative_Sales', label: 'Cumulative Sales' },
  { id: 'sales_price', name: 'EOL_dashboard_General_SalesPrice', label: 'General Sales Price' },
  { id: 'items', name: 'EOL_dashboard_Items', label: 'Dashboard Items' },
  { id: 'stock', name: 'EOL_dashboard_Items_Stock', label: 'Stock' },
  { id: 'units', name: 'EOL_dashboard_Unit_Per_Item', label: 'Unit Per Item' }
];

// State
const syncing = ref(false);
const testMode = ref(true); // Default to test mode for safety
const lastSyncResult = ref<any>(null);
const selectedConnectors = ref<string[]>(availableConnectors.map(c => c.id));

// Supplier import state
const importingSuppliers = ref(false);
const lastSupplierResult = ref<any>(null);

// Select/Deselect all
function selectAll() {
  selectedConnectors.value = availableConnectors.map(c => c.id);
}

function deselectAll() {
  selectedConnectors.value = [];
}

// Start sync
async function startSync() {
  if (selectedConnectors.value.length === 0) {
    alert('Please select at least one connector');
    return;
  }

  syncing.value = true;
  lastSyncResult.value = null;

  try {
    let url = '/api/afas-sync';
    const params = new URLSearchParams();

    if (testMode.value) {
      params.append('limit', '10');
    }

    params.append('connectors', selectedConnectors.value.join(','));

    const response = await $fetch(`${url}?${params.toString()}`, {
      method: 'POST'
    }) as any;

    lastSyncResult.value = response;

    if (response.success) {
      // Optionally reload products list
      console.log('Sync successful:', response);
    } else {
      console.error('Sync failed:', response.error || 'Unknown error');
    }
  } catch (error: any) {
    console.error('Sync request failed:', error);
    lastSyncResult.value = {
      success: false,
      error: error.message || 'Failed to connect to sync endpoint',
      timestamp: new Date().toISOString(),
      duration_ms: 0
    };
  } finally {
    syncing.value = false;
  }
}

// Start supplier import
async function startSupplierImport() {
  importingSuppliers.value = true;
  lastSupplierResult.value = null;

  try {
    const response = await $fetch('/api/suppliers-import', {
      method: 'POST'
    }) as any;

    lastSupplierResult.value = {
      ...response,
      timestamp: new Date().toISOString()
    };

    if (response.success) {
      console.log('Supplier import successful:', response);
    } else {
      console.error('Supplier import failed:', response.error || 'Unknown error');
    }
  } catch (error: any) {
    console.error('Supplier import request failed:', error);
    lastSupplierResult.value = {
      success: false,
      error: error.message || 'Failed to connect to import endpoint',
      timestamp: new Date().toISOString()
    };
  } finally {
    importingSuppliers.value = false;
  }
}

// Format date
function formatDate(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return isoDate;
  }
}
</script>
