<template>
  <div class="relative">
    <!-- Filter Icon Button -->
    <button
      @click="isOpen = !isOpen"
      class="p-1 hover:bg-gray-100 rounded transition-colors relative"
      :class="{ 'text-blue-600': isActive }"
      @click.stop
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
      </svg>
      <!-- Active indicator -->
      <span v-if="isActive" class="absolute top-0 right-0 w-2 h-2 bg-blue-600 rounded-full"></span>
    </button>

    <!-- Popover -->
    <div
      v-if="isOpen"
      class="absolute top-full right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4 min-w-[200px]"
      @click.stop
      v-click-outside="close"
    >
      <div class="space-y-3">
        <h4 class="text-sm font-semibold text-gray-900">{{ label }}</h4>

        <!-- Number Filter -->
        <template v-if="type === 'number'">
          <select
            v-model="localOperator"
            class="w-full appearance-none px-3 py-2 pr-10 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white bg-no-repeat bg-right text-sm"
            style="background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 20 20%27 fill=%27%236B7280%27%3e%3cpath fill-rule=%27evenodd%27 d=%27M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z%27 clip-rule=%27evenodd%27/%3e%3c/svg%3e'); background-position: right 0.5rem center; background-size: 1.25em 1.25em;"
          >
            <option value="greater_than">Greater than</option>
            <option value="less_than">Less than</option>
            <option value="equals">Equals</option>
          </select>

          <input
            v-model.number="localValue"
            type="number"
            placeholder="Enter value"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            @keyup.enter="apply"
          />
        </template>

        <!-- Date Filter -->
        <template v-if="type === 'date'">
          <select
            v-model="localOperator"
            class="w-full appearance-none px-3 py-2 pr-10 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white bg-no-repeat bg-right text-sm"
            style="background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 20 20%27 fill=%27%236B7280%27%3e%3cpath fill-rule=%27evenodd%27 d=%27M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z%27 clip-rule=%27evenodd%27/%3e%3c/svg%3e'); background-position: right 0.5rem center; background-size: 1.25em 1.25em;"
          >
            <option value="before">Before</option>
            <option value="after">After</option>
            <option value="between">Between</option>
          </select>

          <input
            v-model="localValue"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            @keyup.enter="apply"
          />

          <input
            v-if="localOperator === 'between'"
            v-model="localValue2"
            type="date"
            placeholder="End date"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            @keyup.enter="apply"
          />
        </template>

        <!-- Action Buttons -->
        <div class="flex gap-2 pt-2 border-t border-gray-200">
          <button
            @click="apply"
            class="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors font-medium"
          >
            Apply
          </button>
          <button
            @click="clear"
            class="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors font-medium"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Props
const props = defineProps<{
  type: 'number' | 'date';
  label: string;
  modelValue: {
    operator: string | null;
    value: number | string | null;
    value2?: string | null;
  };
}>();

// Emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: typeof props.modelValue): void;
}>();

// State
const isOpen = ref(false);
const localOperator = ref(props.modelValue.operator || (props.type === 'number' ? 'greater_than' : 'before'));
const localValue = ref(props.modelValue.value);
const localValue2 = ref(props.modelValue.value2 || null);

// Computed
const isActive = computed(() => {
  return props.modelValue.operator !== null && props.modelValue.value !== null;
});

// Methods
function apply() {
  emit('update:modelValue', {
    operator: localOperator.value,
    value: localValue.value,
    value2: localValue2.value
  });
  isOpen.value = false;
}

function clear() {
  localOperator.value = props.type === 'number' ? 'greater_than' : 'before';
  localValue.value = null;
  localValue2.value = null;

  emit('update:modelValue', {
    operator: null,
    value: null,
    value2: null
  });
  isOpen.value = false;
}

function close() {
  isOpen.value = false;
}

// Click outside directive
const vClickOutside = {
  mounted(el: HTMLElement & { clickOutsideEvent?: (event: Event) => void }, binding: any) {
    el.clickOutsideEvent = (event: Event) => {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value();
      }
    };
    document.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el: HTMLElement & { clickOutsideEvent?: (event: Event) => void }) {
    if (el.clickOutsideEvent) {
      document.removeEventListener('click', el.clickOutsideEvent);
    }
  }
};
</script>
