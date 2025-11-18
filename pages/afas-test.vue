<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">AFAS API Test</h1>
        <p class="mt-2 text-sm text-gray-600">
          Test your AFAS token and explore available data from GetConnectors.
        </p>
      </div>

      <!-- Quick Access Connectors -->
      <div class="bg-white shadow rounded-lg p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Access - EOL Dashboard Connectors</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <button
            v-for="connector in quickConnectors"
            :key="connector.name"
            @click="loadConnector(connector)"
            class="px-4 py-3 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-left border border-blue-200 transition-colors"
          >
            <div class="font-medium">{{ connector.label }}</div>
            <div class="text-xs text-blue-600 mt-1">{{ connector.name }}</div>
          </button>
        </div>
      </div>

      <!-- Test Form -->
      <div class="bg-white shadow rounded-lg p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">API Configuration</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <!-- Connector Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Connector Name
            </label>
            <input
              v-model="testConfig.connector"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Profit_Article"
            />
            <p class="mt-1 text-xs text-gray-500">
              Name of the GetConnector in AFAS (e.g., Profit_Article)
            </p>
          </div>

          <!-- Skip -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Skip
            </label>
            <input
              v-model.number="testConfig.skip"
              type="number"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
            <p class="mt-1 text-xs text-gray-500">
              Number of records to skip (use -1 for no skip)
            </p>
          </div>

          <!-- Take -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Take
            </label>
            <input
              v-model.number="testConfig.take"
              type="number"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="10"
            />
            <p class="mt-1 text-xs text-gray-500">
              Number of records to return (use -1 for all records)
            </p>
          </div>

          <!-- Order By Field IDs -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Order By Field IDs
            </label>
            <input
              v-model="testConfig.orderbyfieldids"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type_item"
            />
            <p class="mt-1 text-xs text-gray-500">
              Field to sort by (prefix with - for descending)
            </p>
          </div>
        </div>

        <!-- Advanced Filters -->
        <details class="mb-4">
          <summary class="cursor-pointer text-sm font-medium text-gray-700 mb-2">
            Advanced Filters (Optional)
          </summary>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Filter Field IDs
              </label>
              <input
                v-model="testConfig.filterfieldids"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ItemCode"
              />
              <p class="mt-1 text-xs text-gray-500">
                Comma-separated field names
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Filter Values
              </label>
              <input
                v-model="testConfig.filtervalues"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1000"
              />
              <p class="mt-1 text-xs text-gray-500">
                Comma-separated values to filter
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Operator Types
              </label>
              <input
                v-model="testConfig.operatortypes"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1"
              />
              <p class="mt-1 text-xs text-gray-500">
                1=Equals, 2=GreaterOrEqual, 5=LessOrEqual
              </p>
            </div>
          </div>
        </details>

        <!-- Test Button -->
        <div class="flex justify-between items-center">
          <button
            @click="testConnection"
            :disabled="loading"
            class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Testing...' : 'Test Connection' }}
          </button>

          <button
            v-if="testResult"
            @click="clearResults"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Clear Results
          </button>
        </div>
      </div>

      <!-- Results -->
      <div v-if="testResult" class="space-y-6">
        <!-- Status Banner -->
        <div
          :class="[
            'rounded-lg p-4',
            testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          ]"
        >
          <div class="flex items-center">
            <div
              :class="[
                'w-3 h-3 rounded-full mr-3',
                testResult.success ? 'bg-green-500' : 'bg-red-500'
              ]"
            />
            <div>
              <h3 :class="['text-lg font-semibold', testResult.success ? 'text-green-900' : 'text-red-900']">
                {{ testResult.success ? 'Connection Successful' : 'Connection Failed' }}
              </h3>
              <p :class="['text-sm', testResult.success ? 'text-green-700' : 'text-red-700']">
                {{ testResult.statusText || testResult.error || 'Unknown status' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Request Details -->
        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Request Details</h3>
          <div class="space-y-2 text-sm">
            <div class="flex">
              <span class="font-medium text-gray-700 w-32">URL:</span>
              <span class="text-gray-600 break-all font-mono text-xs">{{ testResult.request?.url }}</span>
            </div>
            <div class="flex">
              <span class="font-medium text-gray-700 w-32">Connector:</span>
              <span class="text-gray-600">{{ testResult.request?.connector }}</span>
            </div>
            <div class="flex">
              <span class="font-medium text-gray-700 w-32">Status Code:</span>
              <span class="text-gray-600">{{ testResult.status }}</span>
            </div>
            <div class="flex">
              <span class="font-medium text-gray-700 w-32">Records Returned:</span>
              <span class="text-gray-600">{{ testResult.recordCount || 0 }}</span>
            </div>
          </div>
        </div>

        <!-- Response Data -->
        <div class="bg-white shadow rounded-lg p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Response Data</h3>
            <button
              @click="copyToClipboard"
              class="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              {{ copied ? 'Copied!' : 'Copy JSON' }}
            </button>
          </div>

          <!-- Pretty-printed JSON -->
          <pre class="bg-gray-50 p-4 rounded-md overflow-x-auto text-xs border border-gray-200">{{ formattedResponse }}</pre>
        </div>

        <!-- Sample Records (if available) -->
        <div v-if="testResult.success && testResult.data?.rows?.length > 0" class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            Sample Records ({{ testResult.data.rows.length }} total)
          </h3>

          <!-- Show first record fields -->
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Field</th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Value (First Record)</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="[key, value] in Object.entries(testResult.data.rows[0])" :key="key">
                  <td class="px-4 py-2 text-sm font-medium text-gray-900">{{ key }}</td>
                  <td class="px-4 py-2 text-sm text-gray-600">{{ value }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Documentation -->
      <div class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 class="text-lg font-semibold text-blue-900 mb-3">AFAS API Documentation</h3>
        <div class="text-sm text-blue-800 space-y-2">
          <p>
            <strong>Token Format:</strong> The token is automatically encoded to Base64 by the server.
          </p>
          <p>
            <strong>Common Connectors:</strong> Profit_Article, Profit_Order, Profit_Customer
          </p>
          <p>
            <strong>Filter Operators:</strong> 1=Equals, 2≥, 3>, 4≤, 5<, 6≠, 7=Contains
          </p>
          <p>
            <strong>Testing Tool:</strong>
            <a href="https://connect.afas.nl" target="_blank" class="text-blue-600 hover:underline">
              https://connect.afas.nl
            </a>
          </p>
          <p>
            <strong>Official Docs:</strong>
            <a href="https://docs.afas.help/profit/en/GetConnector" target="_blank" class="text-blue-600 hover:underline">
              AFAS GetConnector Documentation
            </a>
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

// Quick access connectors for EOL Dashboard
const quickConnectors = [
  {
    name: 'EOL_dashboard_Cumulative_Sales',
    label: 'Cumulative Sales',
    orderbyfieldids: 'Jaar'
  },
  {
    name: 'EOL_dashboard_General_SalesPrice',
    label: 'General Sales Price',
    orderbyfieldids: 'Type_item'
  },
  {
    name: 'EOL_dashboard_Items',
    label: 'Dashboard Items',
    orderbyfieldids: 'Type_item'
  },
  {
    name: 'EOL_dashboard_Items_Stock',
    label: 'Stock',
    orderbyfieldids: 'Type_item'
  },
  {
    name: 'EOL_dashboard_Unit_Per_Item',
    label: 'Unit Per Item',
    orderbyfieldids: 'ItemType'
  }
];

// Test configuration
const testConfig = ref({
  connector: 'Profit_Article',
  skip: 0,
  take: 10,
  filterfieldids: '',
  filtervalues: '',
  operatortypes: '',
  orderbyfieldids: ''
});

// Test results
const testResult = ref<any>(null);
const loading = ref(false);
const copied = ref(false);

// Formatted response for display
const formattedResponse = computed(() => {
  if (!testResult.value) return '';
  return JSON.stringify(testResult.value, null, 2);
});

// Load a quick connector
function loadConnector(connector: any) {
  testConfig.value.connector = connector.name;
  testConfig.value.orderbyfieldids = connector.orderbyfieldids;
  testConfig.value.skip = 0;
  testConfig.value.take = 20;
  // Clear filters
  testConfig.value.filterfieldids = '';
  testConfig.value.filtervalues = '';
  testConfig.value.operatortypes = '';
  // Clear previous results
  testResult.value = null;
}

// Test connection
async function testConnection() {
  loading.value = true;
  testResult.value = null;

  try {
    // Build query parameters
    const params: Record<string, any> = {
      connector: testConfig.value.connector,
      skip: testConfig.value.skip,
      take: testConfig.value.take
    };

    if (testConfig.value.filterfieldids) {
      params.filterfieldids = testConfig.value.filterfieldids;
    }
    if (testConfig.value.filtervalues) {
      params.filtervalues = testConfig.value.filtervalues;
    }
    if (testConfig.value.operatortypes) {
      params.operatortypes = testConfig.value.operatortypes;
    }
    if (testConfig.value.orderbyfieldids) {
      params.orderbyfieldids = testConfig.value.orderbyfieldids;
    }

    // Make request to our API endpoint
    const response = await $fetch('/api/afas-test', {
      method: 'GET',
      query: params
    });

    testResult.value = response;
  } catch (error: any) {
    testResult.value = {
      success: false,
      error: error.message || 'Failed to make request',
      data: error.data || null
    };
  } finally {
    loading.value = false;
  }
}

// Copy JSON to clipboard
async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(formattedResponse.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (error) {
    console.error('Failed to copy:', error);
  }
}

// Clear results
function clearResults() {
  testResult.value = null;
  copied.value = false;
}
</script>
