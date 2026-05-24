<script lang="ts">
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';
  import { liveStats, liveStatsLoading, liveStatsError } from '$lib/stores/liveStatsStore';

  let canvas: HTMLCanvasElement;
  let chart: Chart;
  let topTypes = $state({} as Record<string, number>);
  let isLoading = $state(true);
  let errorMsg = $state<string | null>(null);

  onMount(() => {
    const unsubscribe = liveStats.subscribe(data => {
      topTypes = data.top_types;
      if (chart) updateChart();
    });

    const unsubscribeLoading = liveStatsLoading.subscribe(value => {
      isLoading = value;
    });

    const unsubscribeError = liveStatsError.subscribe(value => {
      errorMsg = value;
    });

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
