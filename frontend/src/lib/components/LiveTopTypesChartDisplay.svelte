<script lang="ts">
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';
  import { liveData } from '$lib/stores/liveDataStore';

  let canvas: HTMLCanvasElement;
  let chart: Chart;

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

  function updateChart() {
    if (!chart) return;
    const plainData = $liveData.top_types;
    const labels = Object.keys(plainData);
    const values = Object.values(plainData);
    chart.data.labels = labels;
    chart.data.datasets[0].data = values;
    chart.update('none');
  }

  $effect(() => {
    if ($liveData) {
      if (!chart) {
        initChart();
      } else {
        updateChart();
      }
    }
  });

  onMount(() => {
    if ($liveData) initChart();
    return () => {
      if (chart) chart.destroy();
    };
  });
</script>

<canvas bind:this={canvas}></canvas>