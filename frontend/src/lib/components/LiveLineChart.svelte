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
  let isFetching = $state(true);

  const MAX_POINTS = 60;

  async function fetchValue() {
    if (!isFetching) return;

    try {
      error = null;
      const data = await fetchLiveStats();
      const newValue = data.last_second_count;
      history = [...history, newValue].slice(-MAX_POINTS);
    } catch (err) {
      if (isFetching) {
        isFetching = false;
        error = err instanceof Error ? err.message : 'Failed to fetch data';
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      }
      // Добавляем 0, чтобы график не дёргался
      history = [...history, 0].slice(-MAX_POINTS);
    } finally {
      loading = false;
      updateChart();
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

  function retry() {
    if (intervalId) clearInterval(intervalId);
    isFetching = true;
    error = null;
    loading = true;
    history = Array(MAX_POINTS).fill(0);
    fetchValue().then(() => {
      if (!chart) initChart(); else updateChart();
      intervalId = setInterval(() => {
        fetchValue();
      }, 1000);
    });
  }

  onMount(() => {
    history = Array(MAX_POINTS).fill(0);
    fetchValue().then(() => initChart());
    intervalId = setInterval(() => {
      fetchValue();
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
    <button 
      onclick={retry}
      class="ml-4 underline hover:text-red-900 dark:hover:text-red-100"
    >
      Retry
    </button>
  </div>
{:else}
  <canvas bind:this={canvas}></canvas>
{/if}