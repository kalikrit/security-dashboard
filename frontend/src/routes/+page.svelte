<script lang="ts">
  import type { PageData } from './$types';
  import LiveStats from '$lib/components/LiveStats.svelte';
  import LiveLineChart from '$lib/components/LiveLineChart.svelte';
  import LiveTopTypesChart from '$lib/components/LiveTopTypesChart.svelte';
  
  let { data }: { data: PageData } = $props();
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8 md:px-8 lg:px-12">
  <!-- Заголовок по центру -->
  <h1 class="text-4xl md:text-5xl font-extrabold text-center text-gray-900 dark:text-white mb-10 tracking-tight">
    Security Analytics Dashboard
  </h1>

  <!-- Живые метрики -->
  <LiveStats />

  <!-- Графики в две колонки -->
  <div class="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
      <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4">Динамика инцидентов (реальное время)</h2>
      <LiveLineChart />
    </div>
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
      <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4">Топ типов угроз (реальное время)</h2>
      <LiveTopTypesChart />
    </div>
  </div>
</div>