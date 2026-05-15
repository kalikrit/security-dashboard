<script lang="ts">
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';

  let { labels = [], dataPoints = [], label = 'Количество' } = $props();

  let canvas: HTMLCanvasElement;
  let chart: Chart;

  function updateChart() {
    if (chart) {
      chart.data.labels = labels;
      chart.data.datasets[0].data = dataPoints;
      chart.update();
    } else if (canvas) {
      chart = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{ label, data: dataPoints, backgroundColor: 'rgba(54,162,235,0.5)', borderColor: 'rgb(54,162,235)', borderWidth: 1 }]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
      });
    }
  }

  onMount(() => {
    updateChart();
    return () => chart?.destroy();
  });

  $effect(() => {
    updateChart();
  });
</script>

<canvas bind:this={canvas}></canvas>