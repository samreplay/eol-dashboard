<template>
  <div class="bg-white rounded shadow border border-gray-200 p-6">
    <h3 class="text-lg font-semibold mb-4">12-Month Sales History</h3>
    <div class="relative" :style="{ height: `${height}px` }">
      <Chart type="bar" :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Chart } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions
} from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

interface Props {
  salesData: number[];
  height?: number;
}

const props = withDefaults(defineProps<Props>(), {
  height: 300
});

// Calculate average
const average = computed(() => {
  const validData = props.salesData.filter(val => val > 0);
  if (validData.length === 0) return 0;
  const sum = validData.reduce((acc, val) => acc + val, 0);
  return Math.round(sum / validData.length);
});

// Chart data configuration
const chartData = computed(() => ({
  labels: generateMonthLabels(12),
  datasets: [
    {
      type: 'bar' as const,
      label: 'Sales Units',
      data: props.salesData,
      backgroundColor: 'rgba(59, 130, 246, 0.5)', // Blue-500 with opacity
      borderColor: 'rgb(59, 130, 246)', // Blue-500
      borderWidth: 1,
      borderRadius: 4,
      hoverBackgroundColor: 'rgba(59, 130, 246, 0.7)',
      order: 2
    },
    {
      type: 'line' as const,
      label: 'Average',
      data: Array(12).fill(average.value),
      borderColor: 'rgb(239, 68, 68)', // Red-500
      borderWidth: 2,
      borderDash: [5, 5],
      pointRadius: 0,
      pointHoverRadius: 0,
      fill: false,
      order: 1
    }
  ]
}));

// Chart options configuration
const chartOptions: ChartOptions<'bar' | 'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        usePointStyle: true,
        padding: 15,
        font: {
          size: 12
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1,
      displayColors: false,
      callbacks: {
        label: (context) => `${context.parsed.y} units`
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        precision: 0, // No decimals for unit counts
        color: '#6b7280' // Gray-500
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.05)'
      }
    },
    x: {
      ticks: {
        color: '#6b7280' // Gray-500
      },
      grid: {
        display: false
      }
    }
  }
};
</script>
