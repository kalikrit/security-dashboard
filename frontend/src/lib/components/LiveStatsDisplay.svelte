<script lang="ts">
  import { liveData } from '$lib/stores/liveDataStore';
</script>

<!-- разметка карточек (всегда отображается) -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4 border-t-4 border-red-500">
    <h4 class="text-sm text-gray-500 dark:text-gray-400">High</h4>
    <div class="text-2xl font-bold text-gray-900 dark:text-white">{$liveData.severity_counts.high}</div>
  </div>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4 border-t-4 border-yellow-500">
    <h4 class="text-sm text-gray-500 dark:text-gray-400">Medium</h4>
    <div class="text-2xl font-bold text-gray-900 dark:text-white">{$liveData.severity_counts.medium}</div>
  </div>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4 border-t-4 border-green-500">
    <h4 class="text-sm text-gray-500 dark:text-gray-400">Low</h4>
    <div class="text-2xl font-bold text-gray-900 dark:text-white">{$liveData.severity_counts.low}</div>
  </div>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4 border-t-4 border-blue-500">
    <h4 class="text-sm text-gray-500 dark:text-gray-400">Total (последняя минута)</h4>
    <div class="text-2xl font-bold text-gray-900 dark:text-white">{$liveData.last_minute_count}</div>
  </div>
</div>

<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
    <p class="text-gray-700 dark:text-gray-300">
      <span class="font-medium">Инцидентов за последнюю секунду:</span>
      <span class="text-2xl font-bold ml-2 text-indigo-600 dark:text-indigo-400">{$liveData.last_second_count}</span>
    </p>
  </div>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
    <h4 class="text-md font-semibold text-gray-800 dark:text-white mb-2">Топ типов за минуту</h4>
    {#if Object.keys($liveData.top_types).length === 0}
      <p class="text-gray-500 dark:text-gray-400 text-sm">Нет данных</p>
    {:else}
      <ul class="space-y-1">
        {#each Object.entries($liveData.top_types) as [type, count]}
          <li class="flex justify-between border-b border-gray-100 dark:border-gray-700 py-1">
            <span class="text-gray-700 dark:text-gray-300">{type}</span>
            <span class="font-semibold text-gray-900 dark:text-white">{count}</span>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>