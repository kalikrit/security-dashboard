<script lang="ts">
  import { onMount } from 'svelte';
  import { liveData, error, startPolling, stopPolling, retryPolling } from '$lib/stores/liveDataStore';
  import LiveStatsDisplay from '$lib/components/LiveStatsDisplay.svelte';
  import LiveLineChartDisplay from '$lib/components/LiveLineChartDisplay.svelte';
  import LiveTopTypesChartDisplay from '$lib/components/LiveTopTypesChartDisplay.svelte';
  import BackendStatus from '$lib/components/BackendStatus.svelte';

  onMount(() => {
    startPolling();
    return () => stopPolling();
  });
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8 md:px-8 lg:px-12">
  <h1 class="text-4xl md:text-5xl font-extrabold text-center text-gray-900 dark:text-white mb-10 tracking-tight">
    Security Analytics Dashboard
  </h1>

  <BackendStatus />

  <LiveStatsDisplay data={$liveData} error={$error} onRetry={retryPolling} />

  <div class="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
      <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4">Динамика инцидентов (реальное время)</h2>
      <LiveLineChartDisplay data={$liveData} error={$error} onRetry={retryPolling} />
    </div>
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
      <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4">Топ типов угроз (реальное время)</h2>
      <LiveTopTypesChartDisplay data={$liveData} error={$error} onRetry={retryPolling} />
    </div>
  </div>
</div>