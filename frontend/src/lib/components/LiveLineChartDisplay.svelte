<script lang="ts">
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';
  import { liveData, error, retryPolling } from '$lib/stores/liveDataStore';

  let canvas: HTMLCanvasElement;
  let chart: Chart;
  let history: number[] = [];
  const MAX_POINTS = 60;

  function updateChart() {
    if (!chart) return;
    const plainHistory = $state.snapshot(history);
    const labels = plainHistory.map((_, i) => `${-MAX_POINTS + i + 1}s`);
    chart.data.labels = labels;
    chart.data.datasets[0].data = plainHistory;
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

  $effect(() => {
    if ($liveData) {
      const newValue = $liveData.last_second_count;
      history = [...history, newValue].slice(-MAX_POINTS);
      if (!chart) {
        initChart();
      } else {
        updateChart();
      }
    }
  });

  onMount(() => {
    history = Array(MAX_POINTS).fill(0);
    initChart();
    return () => {
      if (chart) chart.destroy();
    };
  });
</script>

<canvas bind:this={canvas}></canvas>