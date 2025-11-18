<template>
  <div class="bg-white rounded-lg border border-gray-300 shadow-sm">
    <!-- Header (always visible) -->
    <div
      class="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
      @click="isExpanded = !isExpanded"
    >
      <div class="flex items-center gap-3">
        <h3 class="text-sm font-semibold text-gray-900">Advanced Filters</h3>
        <span
          v-if="activeFilterCount > 0"
          class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
        >
          {{ activeFilterCount }} active
        </span>
      </div>
      <div class="flex items-center gap-2">
        <button
          v-if="activeFilterCount > 0"
          @click.stop="clearAll"
          class="text-xs text-gray-600 hover:text-gray-900 font-medium"
        >
          Clear all
        </button>
        <svg
          class="w-5 h-5 text-gray-500 transition-transform"
          :class="{ 'rotate-180': isExpanded }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>

    <!-- Expanded Content -->
    <div v-if="isExpanded" class="border-t border-gray-200 p-4 space-y-3">
      <!-- Filter Conditions -->
      <div v-for="(condition, index) in filterGroup.conditions" :key="condition.id" class="flex flex-wrap items-start gap-2">
        <!-- Field Selector -->
        <select
          v-model="condition.field"
          @change="handleFieldChange(condition)"
          class="appearance-none px-3 py-2 pr-10 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white bg-no-repeat bg-right"
          style="background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 20 20%27 fill=%27%236B7280%27%3e%3cpath fill-rule=%27evenodd%27 d=%27M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z%27 clip-rule=%27evenodd%27/%3e%3c/svg%3e'); background-position: right 0.5rem center; background-size: 1.25em 1.25em;"
        >
          <option value="">Select field...</option>
          <option v-for="field in FILTER_FIELDS" :key="field.key" :value="field.key">
            {{ field.label }}
          </option>
        </select>

        <!-- Operator Selector -->
        <select
          v-if="condition.field"
          v-model="condition.operator"
          class="appearance-none px-3 py-2 pr-10 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white bg-no-repeat bg-right"
          style="background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 20 20%27 fill=%27%236B7280%27%3e%3cpath fill-rule=%27evenodd%27 d=%27M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z%27 clip-rule=%27evenodd%27/%3e%3c/svg%3e'); background-position: right 0.5rem center; background-size: 1.25em 1.25em;"
        >
          <option v-for="op in getOperators(condition)" :key="op" :value="op">
            {{ OPERATOR_LABELS[op] }}
          </option>
        </select>

        <!-- Value Input -->
        <template v-if="condition.field && condition.operator">
          <!-- Text input -->
          <input
            v-if="condition.type === 'text'"
            v-model="condition.value"
            type="text"
            placeholder="Enter value..."
            class="px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />

          <!-- Number input -->
          <input
            v-else-if="condition.type === 'number' && condition.operator !== 'between'"
            v-model.number="condition.value"
            type="number"
            placeholder="Enter number..."
            class="px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-32"
          />

          <!-- Number range (between) -->
          <template v-else-if="condition.type === 'number' && condition.operator === 'between'">
            <input
              v-model.number="condition.value"
              type="number"
              placeholder="Min"
              class="px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-24"
            />
            <span class="text-gray-500">to</span>
            <input
              v-model.number="condition.value2"
              type="number"
              placeholder="Max"
              class="px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-24"
            />
          </template>

          <!-- Date input -->
          <input
            v-else-if="condition.type === 'date' && condition.operator !== 'between'"
            v-model="condition.value"
            type="date"
            class="px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />

          <!-- Date range (between) -->
          <template v-else-if="condition.type === 'date' && condition.operator === 'between'">
            <input
              v-model="condition.value"
              type="date"
              class="px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <span class="text-gray-500">to</span>
            <input
              v-model="condition.value2"
              type="date"
              class="px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </template>
        </template>

        <!-- Remove button -->
        <button
          @click="removeCondition(index)"
          class="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
          title="Remove condition"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Empty state -->
      <div v-if="filterGroup.conditions.length === 0" class="text-center py-6 text-gray-500 text-sm">
        No filters added yet. Click "Add Condition" to get started.
      </div>

      <!-- Control buttons -->
      <div class="flex items-center gap-3 pt-2 border-t border-gray-200">
        <!-- AND/OR Toggle -->
        <div v-if="filterGroup.conditions.length > 1" class="flex items-center gap-2">
          <span class="text-xs text-gray-600">Match:</span>
          <button
            @click="filterGroup.logic = filterGroup.logic === 'AND' ? 'OR' : 'AND'"
            class="px-3 py-1 text-xs rounded border font-medium transition-colors"
            :class="
              filterGroup.logic === 'AND'
                ? 'bg-blue-50 text-blue-700 border-blue-300'
                : 'bg-purple-50 text-purple-700 border-purple-300'
            "
          >
            {{ filterGroup.logic === 'AND' ? 'All conditions (AND)' : 'Any condition (OR)' }}
          </button>
        </div>

        <!-- Add Condition button -->
        <button
          @click="addCondition"
          class="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors font-medium"
        >
          + Add Condition
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FilterGroup, FilterCondition, FilterOperator } from '~/types/filters';
import { FILTER_FIELDS, OPERATOR_LABELS } from '~/types/filters';

// Define emits
const emit = defineEmits<{
  (e: 'update:filterGroup', value: FilterGroup): void;
}>();

// Props
const props = defineProps<{
  filterGroup: FilterGroup;
}>();

// State
const isExpanded = ref(false);

// Computed
const activeFilterCount = computed(() => {
  return props.filterGroup.conditions.filter(c => c.field && c.value).length;
});

// Methods
function addCondition() {
  const newCondition: FilterCondition = {
    id: `condition-${Date.now()}`,
    field: '' as any,
    operator: 'contains',
    value: '',
    type: 'text'
  };

  const updated = {
    ...props.filterGroup,
    conditions: [...props.filterGroup.conditions, newCondition]
  };

  emit('update:filterGroup', updated);
}

function removeCondition(index: number) {
  const updated = {
    ...props.filterGroup,
    conditions: props.filterGroup.conditions.filter((_, i) => i !== index)
  };

  emit('update:filterGroup', updated);
}

function handleFieldChange(condition: FilterCondition) {
  const fieldConfig = FILTER_FIELDS.find(f => f.key === condition.field);

  if (fieldConfig) {
    condition.type = fieldConfig.type;
    condition.operator = fieldConfig.operators[0];
    condition.value = '';
    condition.value2 = undefined;
  }
}

function getOperators(condition: FilterCondition): FilterOperator[] {
  const fieldConfig = FILTER_FIELDS.find(f => f.key === condition.field);
  return fieldConfig ? fieldConfig.operators : [];
}

function clearAll() {
  const updated = {
    ...props.filterGroup,
    conditions: []
  };

  emit('update:filterGroup', updated);
}
</script>
