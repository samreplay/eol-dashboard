<template>
  <div>
    <div class="mb-6">
      <NuxtLink to="/" class="text-sm text-blue-600 hover:underline mb-2 inline-block">
        &larr; Back to Dashboard
      </NuxtLink>
      <h1 class="text-2xl font-semibold text-gray-900">Add New Product</h1>
      <p class="text-gray-600 text-sm mt-1">Create a new product entry in the EOL dashboard</p>
    </div>

    <ProductForm @submit="handleCreate" />
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types/database';

definePageMeta({
  layout: 'default'
});

const router = useRouter();
const { createProduct } = useProducts();

const handleCreate = async (productData: Partial<Product>) => {
  const result = await createProduct(productData);

  if (result) {
    router.push('/');
  }
};
</script>
