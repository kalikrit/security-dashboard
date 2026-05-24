<script lang="ts">
  import { onMount } from 'svelte';
  import { liveStats, liveStatsLoading, liveStatsError } from '$lib/stores/liveStatsStore';

  let stats = $state({
    last_second_count: 0,
    last_minute_count: 0,
    top_types: {},
    severity_counts: { high: 0, medium: 0, low: 0 }
  });
  let isLoading = $state(true);
  let errorMsg = $state<string | null>(null);

  onMount(() => {
    const unsubscribeStats = liveStats.subscribe(value => {
      stats = value;
    });
    const unsubscribeLoading = liveStatsLoading.subscribe(value => {
      isLoading = value;
    });
    const unsubscribeError = liveStatsError.subscribe(value => {
      errorMsg = value;
    });

    return () => {
      unsubscribeStats();
      unsubscribeLoading();
      unsubscribeError();
    };
  });
</script>

<!-- Карточки метрик -->
{#if isLoading}
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    {#each Array(4) as _}
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4 border-t-4 border-gray-300 animate-pulse">
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
        <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      </div>
    {/each}
  </div>
{:else if errorMsg}
  <div class="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-6">
    <strong>Error:</strong> {errorMsg}
  </div>
{:else}
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4 border-t-4 border-red-500">
      <h4 class="text-sm text-gray-500 dark:text-gray-400">High</h4>
      <div class="text-2xl font-bold text-gray-900 dark:text-white">{stats.severity_counts.high}</div>
    </div>
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4 border-t-4 border-yellow-500">
      <h4 class="text-sm text-gray-500 dark:text-gray-400">Medium</h4>
      <div class="text-2xl font-bold text-gray-900 dark:text-white">{stats.severity_counts.medium}</div>
    </div>
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4 border-t-4 border-green-500">
      <h4 class="text-sm text-gray-500 dark:text-gray-400">Low</h4>
      <div class="text-2xl font-bold text-gray-900 dark:text-white">{stats.severity_counts.low}</div>
    </div>
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4 border-t-4 border-blue-500">
      <h4 class="text-sm text-gray-500 dark:text-gray-400">Total (последняя минута)</h4>
      <div class="text-2xl font-bold text-gray-900 dark:text-white">{stats.last_minute_count}</div>
    </div>
  </div>

  <!-- Два блока рядом -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
      <p class="text-gray-700 dark:text-gray-300">
        <span class="font-medium">Инцидентов за последнюю секунду:</span>
        <span class="text-2xl font-bold ml-2 text-indigo-600 dark:text-indigo-400">{stats.last_second_count}</span>
      </p>
    </div>
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
      <h4 class="text-md font-semibold text-gray-800 dark:text-white mb-2">Топ типов за минуту</h4>
      {#if Object.keys(stats.top_types).length === 0}
        <p class="text-gray-500 dark:text-gray-400 text-sm">Нет данных</p>
      {:else}
        <ul class="space-y-1">
          {#each Object.entries(stats.top_types) as [type, count]}
            <li class="flex justify-between border-b border-gray-100 dark:border-gray-700 py-1">
              <span class="text-gray-700 dark:text-gray-300">{type}</span>
              <span class="font-semibold text-gray-900 dark:text-white">{count}</span>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>
{/if}
