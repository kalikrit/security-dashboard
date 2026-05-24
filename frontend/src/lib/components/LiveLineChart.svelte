<script lang="ts">
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';
  import { fetchLiveStats } from '$lib/api/client';

  let canvas: HTMLCanvasElement;
  let chart: Chart;
  let history: number[] = $state([]);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let intervalId: ReturnType<typeof setInterval> | null = null;

  const MAX_POINTS = 60; // показываем последнюю минуту

  async function fetchValue() {
    try {
      error = null;
      const data = await fetchLiveStats();
      const newValue = data.last_second_count;
      history = [...history, newValue].slice(-MAX_POINTS);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to fetch data';
      console.error('Failed to fetch live stats for chart', err);
      history = [...history, 0].slice(-MAX_POINTS);
    } finally {
      loading = false;
    }
  }

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

  onMount(() => {
    history = Array(MAX_POINTS).fill(0);
    fetchValue().then(() => initChart());

    intervalId = setInterval(async () => {
      await fetchValue();
      updateChart();
    }, 1000);

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (chart) chart.destroy();
    };
  });
</script>

{#if loading}
  <div class="flex items-center justify-center h-48">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
{:else if error}
  <div class="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded">
    <strong>Error:</strong> {error}
  </div>
{:else}
  <canvas bind:this={canvas}></canvas>
{/if}