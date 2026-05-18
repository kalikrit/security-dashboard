<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Chart from 'chart.js/auto';

  let canvas: HTMLCanvasElement;
  let chart: Chart;
  let topTypes = $state({} as Record<string, number>);
  let interval: ReturnType<typeof setInterval>;

  async function fetchTopTypes() {
    try {
      const res = await fetch('http://localhost:8000/api/incidents/live-stats');
      const data = await res.json();
      topTypes = data.top_types;
    } catch (err) {
      console.error('Failed to fetch top types for bar chart', err);
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

  onMount(async () => {
    await fetchTopTypes();
    initChart();
    interval = setInterval(async () => {
      await fetchTopTypes();
      updateChart();
    }, 1000);
    return () => {
      if (interval) clearInterval(interval);
      if (chart) chart.destroy();
    };
  });

  $effect(() => {
    updateChart();
  });
</script>

<canvas bind:this={canvas}></canvas>