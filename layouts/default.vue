<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-sidebar border-r border-gray-800 flex-shrink-0 flex flex-col">
      <!-- Logo/Brand -->
      <div class="px-6 py-6 border-b border-gray-800">
        <NuxtLink to="/" class="flex items-center">
          <img src="/logo.svg" alt="BakkerElkhuizen" class="h-12 w-auto brightness-0 invert" />
        </NuxtLink>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-4 py-6 space-y-1">
        <NuxtLink
          to="/"
          class="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded transition-colors"
          :class="$route.path === '/' ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          Dashboard
        </NuxtLink>

        <NuxtLink
          to="/products/new"
          class="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded transition-colors text-slate-300 hover:bg-slate-700 hover:text-white"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Add Product
        </NuxtLink>
      </nav>

      <!-- Footer Info -->
      <div class="px-6 py-4 border-t border-gray-800">
        <p class="text-xs text-gray-400">
          &copy; {{ new Date().getFullYear() }} BakkerElkhuizen
        </p>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Top Bar -->
      <header class="bg-white border-b border-gray-200 px-8 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold text-gray-900">Products Overview</h2>
            <p class="text-sm text-gray-600 mt-0.5">Manage your end-of-life product inventory</p>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-auto px-8 py-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
// Layout setup
</script>

<style scoped>
.btn-primary {
  @apply px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium;
}
</style>
