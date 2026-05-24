<script lang="ts">
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';
  import { liveData, error, retryPolling } from '$lib/stores/liveDataStore';

  let canvas: HTMLCanvasElement;
  let chart: Chart;
  let history: number[] = [];
  let intervalId: ReturnType<typeof setInterval> | null = null;
  let isPollingActive = true;
  const MAX_POINTS = 60;

  async function fetchValue() {
    if (!isPollingActive) return;
    try {
      const newValue = $liveData.last_second_count;
      history = [...history, newValue].slice(-MAX_POINTS);
      updateChart();
    } catch (err) {
      if (isPollingActive) {
        isPollingActive = false;
        if (intervalId) clearInterval(intervalId);
        error.set('Failed to fetch data');
      }
    }
  }

  function updateChart() {
    if (!chart) return;
    const labels = history.map((_, i) => `${-MAX_POINTS + i + 1}s`);
    chart.data.labels = labels;
    chart.data.datasets[0].data = history;
    chart.update('none');
  }

  function initChart() {
    if (chart) chart.destroy();
    const labels = history.map((_, i) => `${-MAX_POINTS + i + 1}s`);
    chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Инциденты в секунду',
          data: history,
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

  function retry() {
    isPollingActive = true;
    error.set(null);
    if (intervalId) clearInterval(intervalId);
    fetchValue();
    intervalId = setInterval(fetchValue, 1000);
  }

  onMount(() => {
    history = Array(MAX_POINTS).fill(0);
    initChart();
    fetchValue();
    intervalId = setInterval(fetchValue, 1000);

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (chart) chart.destroy();
    };
  });
</script>

{#if $error}
  <div class="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded">
    <strong>Error:</strong> {$error}
    <button onclick={retry} class="ml-4 underline">Retry</button>
  </div>
{:else}
  <canvas bind:this={canvas}></canvas>
{/if}