<script lang="ts">
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';
  import { liveData, error, retryPolling } from '$lib/stores/liveDataStore';

  let canvas: HTMLCanvasElement;
  let chart: Chart;
  let intervalId: ReturnType<typeof setInterval> | null = null;
  let isPollingActive = true;

  async function fetchData() {
    if (!isPollingActive) return;
    try {
      const plainData = $liveData.top_types;
      const labels = Object.keys(plainData);
      const values = Object.values(plainData);
      if (!chart) {
        initChart();
      } else {
        chart.data.labels = labels;
        chart.data.datasets[0].data = values;
        chart.update('none');
      }
    } catch (err) {
      if (isPollingActive) {
        isPollingActive = false;
        if (intervalId) clearInterval(intervalId);
        error.set('Failed to fetch data');
      }
    }
  }

  function initChart() {
    if (chart) chart.destroy();
    const plainData = $liveData.top_types;
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

  function retry() {
    isPollingActive = true;
    error.set(null);
    if (intervalId) clearInterval(intervalId);
    fetchData();
    intervalId = setInterval(fetchData, 1000);
  }

  onMount(() => {
    fetchData();
    intervalId = setInterval(fetchData, 1000);
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