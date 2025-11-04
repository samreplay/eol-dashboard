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
      <div class="mb-6">
        <NuxtLink
          :to="`/products/${product.id}`"
          class="text-sm text-blue-600 hover:underline mb-2 inline-block"
        >
          &larr; Back to Product Details
        </NuxtLink>
        <h1 class="text-2xl font-semibold text-gray-900">Edit Product</h1>
        <p class="text-gray-600 text-sm mt-1">{{ product.product_name }} ({{ product.product_code }})</p>
      </div>

      <ProductForm :product="product" :is-edit="true" @submit="handleUpdate" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product, ProductWithCalculations } from '~/types/database';

definePageMeta({
  layout: 'default'
});

const route = useRoute();
const router = useRouter();
const { fetchProductById, updateProduct } = useProducts();

const productId = route.params.id as string;
const product = ref<ProductWithCalculations | null>(null);
const loading = ref(true);

onMounted(async () => {
  product.value = await fetchProductById(productId);
  loading.value = false;
});

const handleUpdate = async (updates: Partial<Product>) => {
  const result = await updateProduct(productId, updates);

  if (result) {
    router.push(`/products/${productId}`);
  }
};
</script>
