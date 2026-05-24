<script lang="ts">
  import { onMount } from 'svelte';
  import { fetchLiveStats, type LiveStatsData } from '$lib/api/client';

  let lastSecondCount = $state(0);
  let lastMinuteCount = $state(0);
  let topTypes = $state({} as Record<string, number>);
  let severityCounts = $state({ high: 0, medium: 0, low: 0 });
  let loading = $state(true);
  let error = $state<string | null>(null);
  let intervalId: ReturnType<typeof setInterval> | null = null;
  let isFetching = $state(true);

  async function fetchData() {
    if (!isFetching) return;

    try {
      error = null;
      const data = await fetchLiveStats();
      lastSecondCount = data.last_second_count;
      lastMinuteCount = data.last_minute_count;
      topTypes = data.top_types;
      severityCounts = data.severity_counts;
    } catch (err) {
      if (isFetching) {
        isFetching = false;
        error = err instanceof Error ? err.message : 'Unknown error occurred';
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      }
    } finally {
      loading = false;
    }
  }

  function retry() {
    if (intervalId) clearInterval(intervalId);
    isFetching = true;
    error = null;
    loading = true;
    fetchData().then(() => {
      intervalId = setInterval(fetchData, 1000);
    });
  }

  onMount(() => {
    fetchData();
    intervalId = setInterval(fetchData, 1000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  });
</script>

<!-- Ваша исходная разметка (без изменений) -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4 border-t-4 border-red-500">
    <h4 class="text-sm text-gray-500 dark:text-gray-400">High</h4>
    <div class="text-2xl font-bold text-gray-900 dark:text-white">{severityCounts.high}</div>
  </div>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4 border-t-4 border-yellow-500">
    <h4 class="text-sm text-gray-500 dark:text-gray-400">Medium</h4>
    <div class="text-2xl font-bold text-gray-900 dark:text-white">{severityCounts.medium}</div>
  </div>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4 border-t-4 border-green-500">
    <h4 class="text-sm text-gray-500 dark:text-gray-400">Low</h4>
    <div class="text-2xl font-bold text-gray-900 dark:text-white">{severityCounts.low}</div>
  </div>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4 border-t-4 border-blue-500">
    <h4 class="text-sm text-gray-500 dark:text-gray-400">Total (последняя минута)</h4>
    <div class="text-2xl font-bold text-gray-900 dark:text-white">{lastMinuteCount}</div>
  </div>
</div>

<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
    <p class="text-gray-700 dark:text-gray-300">
      <span class="font-medium">Инцидентов за последнюю секунду:</span>
      <span class="text-2xl font-bold ml-2 text-indigo-600 dark:text-indigo-400">{lastSecondCount}</span>
    </p>
  </div>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
    <h4 class="text-md font-semibold text-gray-800 dark:text-white mb-2">Топ типов за минуту</h4>
    {#if Object.keys(topTypes).length === 0}
      <p class="text-gray-500 dark:text-gray-400 text-sm">Нет данных</p>
    {:else}
      <ul class="space-y-1">
        {#each Object.entries(topTypes) as [type, count]}
          <li class="flex justify-between border-b border-gray-100 dark:border-gray-700 py-1">
            <span class="text-gray-700 dark:text-gray-300">{type}</span>
            <span class="font-semibold text-gray-900 dark:text-white">{count}</span>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>