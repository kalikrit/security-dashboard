<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Chart from 'chart.js/auto';

  let canvas: HTMLCanvasElement;
  let chart: Chart;
  let history: number[] = $state([]);
  let interval: ReturnType<typeof setInterval>;

  const MAX_POINTS = 60; // показываем последнюю минуту

  async function fetchValue() {
    try {
      const res = await fetch('http://localhost:8000/api/incidents/live-stats');
      const data = await res.json();
      const newValue = data.last_second_count;
      history = [...history, newValue].slice(-MAX_POINTS);
    } catch (err) {
      console.error('Failed to fetch live stats for chart', err);
      history = [...history, 0].slice(-MAX_POINTS);
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

  onMount(async () => {
    history = Array(MAX_POINTS).fill(0);
    await fetchValue();
    initChart();

    interval = setInterval(async () => {
      await fetchValue();
      updateChart();
    }, 1000);

    return () => {
      if (interval) clearInterval(interval);
      if (chart) chart.destroy();
    };
  });

  // $effect будет автоматически вызываться при изменении history
  $effect(() => {
    updateChart();
  });
</script>

<canvas bind:this={canvas}></canvas>