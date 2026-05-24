<script lang="ts">
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';
  import { fetchLiveStats } from '$lib/api/client';

  let canvas: HTMLCanvasElement;
  let chart: Chart;
  let topTypes = $state({} as Record<string, number>);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let intervalId: ReturnType<typeof setInterval> | null = null;

  async function fetchTopTypes() {
    try {
      error = null;
      const data = await fetchLiveStats();
      topTypes = data.top_types;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to fetch data';
      console.error('Failed to fetch top types for bar chart', err);
    } finally {
      loading = false;
    }
  }

  function initChart() {
    if (chart) chart.destroy();
    const plainData = $state.snapshot(topTypes);
    const labels = Object.keys(plainData);
    const values = Object.values(plainData);
    chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Количество инцидентов',
          data: values,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          y: { beginAtZero: true, title: { display: true, text: 'Количество' } },
          x: { title: { display: true, text: 'Тип угрозы' } }
        }
      }
    });
  }

  function updateChart() {
    if (!chart) return;
    const plainData = $state.snapshot(topTypes);
    const labels = Object.keys(plainData);
    const values = Object.values(plainData);
    chart.data.labels = labels;
    chart.data.datasets[0].data = values;
    chart.update('none');
  }

  onMount(() => {
    fetchTopTypes().then(() => initChart());
    intervalId = setInterval(async () => {
      await fetchTopTypes();
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