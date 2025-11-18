<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">AFAS Data Structure Analysis</h1>
        <p class="mt-2 text-sm text-gray-600">
          Analyze the structure and sample data from AFAS connectors.
        </p>
      </div>

      <!-- Connector Selection -->
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

      <!-- Action Button -->
      <div class="mb-6">
        <button
          @click="runAnalysis"
          :disabled="loading || selectedConnectors.length === 0"
          class="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Analyzing...' : `Run Analysis (${selectedConnectors.length} connectors)` }}
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white shadow rounded-lg p-8 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Fetching data from AFAS connectors...</p>
      </div>

      <!-- Results -->
      <div v-if="analysis && !loading" class="space-y-6">
        <!-- Summary -->
        <div class="bg-white shadow rounded-lg p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Summary</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-blue-50 p-4 rounded-lg">
              <div class="text-2xl font-bold text-blue-900">{{ analysis.summary.total }}</div>
              <div class="text-sm text-blue-700">Total Connectors</div>
            </div>
            <div class="bg-green-50 p-4 rounded-lg">
              <div class="text-2xl font-bold text-green-900">{{ analysis.summary.successful }}</div>
              <div class="text-sm text-green-700">Successful</div>
            </div>
            <div class="bg-red-50 p-4 rounded-lg">
              <div class="text-2xl font-bold text-red-900">{{ analysis.summary.failed }}</div>
              <div class="text-sm text-red-700">Failed</div>
            </div>
          </div>
          <div class="mt-4 text-xs text-gray-500">
            Last analyzed: {{ new Date(analysis.timestamp).toLocaleString() }}
          </div>
        </div>

        <!-- Connectors -->
        <div class="space-y-4">
          <div
            v-for="(connector, index) in analysis.connectors"
            :key="connector.name"
            class="bg-white shadow rounded-lg overflow-hidden"
          >
            <!-- Header -->
            <button
              @click="toggleConnector(index)"
              class="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center space-x-4">
                <div
                  :class="[
                    'w-3 h-3 rounded-full',
                    connector.success ? 'bg-green-500' : 'bg-red-500'
                  ]"
                />
                <div class="text-left">
                  <h3 class="text-lg font-semibold text-gray-900">{{ connector.label }}</h3>
                  <p class="text-sm text-gray-600">{{ connector.name }}</p>
                </div>
              </div>
              <div class="flex items-center space-x-4">
                <div class="text-right">
                  <div class="text-sm font-medium text-gray-900">
                    {{ connector.recordCount }} records
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ connector.fields.length }} fields
                  </div>
                </div>
                <svg
                  :class="[
                    'w-5 h-5 text-gray-400 transition-transform',
                    expandedConnectors[index] ? 'transform rotate-180' : ''
                  ]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            <!-- Content (Expandable) -->
            <div v-if="expandedConnectors[index]" class="border-t border-gray-200">
              <!-- Error Message -->
              <div v-if="!connector.success" class="px-6 py-4 bg-red-50">
                <p class="text-sm text-red-800">
                  <strong>Error:</strong> {{ connector.error }}
                </p>
              </div>

              <!-- Field List -->
              <div v-if="connector.success && connector.fields.length > 0" class="px-6 py-4">
                <h4 class="text-sm font-semibold text-gray-900 mb-3">Fields ({{ connector.fields.length }})</h4>
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200 text-sm">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Field Name</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sample Value</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr v-for="field in connector.fields" :key="field">
                        <td class="px-4 py-2 font-mono text-xs text-gray-900">{{ field }}</td>
                        <td class="px-4 py-2 text-xs text-gray-600">
                          <span class="px-2 py-1 bg-gray-100 rounded">
                            {{ connector.fieldTypes[field] || 'unknown' }}
                          </span>
                        </td>
                        <td class="px-4 py-2 text-xs text-gray-600 max-w-xs truncate">
                          {{ formatValue(connector.sampleRecords[0]?.[field]) }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Sample Records -->
              <div v-if="connector.success && connector.sampleRecords.length > 0" class="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div class="flex justify-between items-center mb-3">
                  <h4 class="text-sm font-semibold text-gray-900">
                    Sample Records ({{ connector.sampleRecords.length }})
                  </h4>
                  <button
                    @click="copyConnectorData(connector)"
                    class="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    {{ copiedConnector === connector.name ? 'Copied!' : 'Copy JSON' }}
                  </button>
                </div>
                <pre class="bg-white p-4 rounded-md overflow-x-auto text-xs border border-gray-200 max-h-96">{{ JSON.stringify(connector.sampleRecords, null, 2) }}</pre>
              </div>
            </div>
          </div>
        </div>

        <!-- Export All Data -->
        <div class="bg-white shadow rounded-lg p-6">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Export Complete Analysis</h3>
              <p class="text-sm text-gray-600 mt-1">Download all data as JSON for further analysis</p>
            </div>
            <button
              @click="downloadAnalysis"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Download JSON
            </button>
          </div>
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
const analysis = ref<any>(null);
const loading = ref(false);
const expandedConnectors = ref<Record<number, boolean>>({});
const copiedConnector = ref<string | null>(null);
const selectedConnectors = ref<string[]>(availableConnectors.map(c => c.id));

// Select/Deselect all
function selectAll() {
  selectedConnectors.value = availableConnectors.map(c => c.id);
}

function deselectAll() {
  selectedConnectors.value = [];
}

// Run analysis
async function runAnalysis() {
  if (selectedConnectors.value.length === 0) {
    alert('Please select at least one connector');
    return;
  }

  loading.value = true;
  analysis.value = null;
  expandedConnectors.value = {};

  try {
    const response = await $fetch('/api/afas-analyze', {
      query: {
        connectors: selectedConnectors.value.join(',')
      }
    });
    analysis.value = response;

    // Auto-expand first connector
    if (response.success && 'connectors' in response && response.connectors.length > 0) {
      expandedConnectors.value[0] = true;
    }
  } catch (error: any) {
    console.error('Analysis failed:', error);
    alert(`Analysis failed: ${error.message || 'Unknown error'}`);
  } finally {
    loading.value = false;
  }
}

// Toggle connector expansion
function toggleConnector(index: number) {
  expandedConnectors.value[index] = !expandedConnectors.value[index];
}

// Format value for display
function formatValue(value: any): string {
  if (value === null || value === undefined) {
    return 'null';
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

// Copy connector data to clipboard
async function copyConnectorData(connector: any) {
  try {
    await navigator.clipboard.writeText(JSON.stringify(connector.sampleRecords, null, 2));
    copiedConnector.value = connector.name;
    setTimeout(() => {
      copiedConnector.value = null;
    }, 2000);
  } catch (error) {
    console.error('Failed to copy:', error);
  }
}

// Download full analysis as JSON
function downloadAnalysis() {
  if (!analysis.value) return;

  const dataStr = JSON.stringify(analysis.value, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `afas-analysis-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
</script>
