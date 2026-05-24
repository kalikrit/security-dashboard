<script lang="ts">
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';
  import { liveStats, liveStatsLoading, liveStatsError } from '$lib/stores/liveStatsStore';

  let canvas: HTMLCanvasElement;
  let chart: Chart;
  let history: number[] = $state([]);
  let isLoading = $state(true);
  let errorMsg = $state<string | null>(null);

  const MAX_POINTS = 60; // показываем последнюю минуту

  onMount(() => {
    const unsubscribe = liveStats.subscribe(data => {
      const newValue = data.last_second_count;
      history = [...history, newValue].slice(-MAX_POINTS);
      if (chart) updateChart();
    });

    const unsubscribeLoading = liveStatsLoading.subscribe(value => {
      isLoading = value;
    });

    const unsubscribeError = liveStatsError.subscribe(value => {
      errorMsg = value;
    });

    // Инициализация графика с пустыми данными
    history = Array(MAX_POINTS).fill(0);
    initChart();

    return () => {
      unsubscribe();
      unsubscribeLoading();
      unsubscribeError();
      if (chart) chart.destroy();
    };
  });

  function initChart() {
    if (chart) chart.destroy();
    const plainHistory = $state.snapshot(history);
    const labels = plainHistory.map((_, i) => `${-MAX_POINTS + i + 1}s`);
    chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Инциденты в секунду',
          data: plainHistory,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
          fill: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          y: { beginAtZero: true, title: { display: true, text: 'Кол-во инцидентов' } },
          x: { title: { display: true, text: 'секунд назад' } }
        }
      }
    });
  }

  function updateChart() {
    if (!chart) return;
    const plainHistory = $state.snapshot(history);
    const labels = plainHistory.map((_, i) => `${-MAX_POINTS + i + 1}s`);
    chart.data.labels = labels;
    chart.data.datasets[0].data = plainHistory;
    chart.update('none');
  }
</script>

{#if isLoading}
  <div class="flex items-center justify-center h-48">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
{:else if errorMsg}
  <div class="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded">
    <strong>Error:</strong> {errorMsg}
  </div>
{:else}
  <canvas bind:this={canvas}></canvas>
{/if}
