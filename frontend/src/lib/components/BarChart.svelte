<script lang="ts">
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';

  // Svelte 5: получаем пропсы через $props()
  let { labels = [], dataPoints = [], label = 'Количество' } = $props();

  let canvas: HTMLCanvasElement;
  let chart: Chart;

  onMount(() => {
    chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: label,
          data: dataPoints,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Количество' }
          },
          x: {
            title: { display: true, text: 'Тип угрозы' }
          }
        }
      }
    });

    return () => chart.destroy();
  });
</script>

<canvas bind:this={canvas}></canvas>