<script lang="ts">
  import type { PageData } from './$types';
  import LineChart from '$lib/components/LineChart.svelte';
  import BarChart from '$lib/components/BarChart.svelte';

  let { data }: { data: PageData } = $props();

  let summary = data.summary;
  let timeline = data.timeline;
  let topTypes = data.topTypes;
</script>

<main>
  <h1>Security Analytics Dashboard</h1>

  <!-- Карточки метрик -->
  <div class="metrics">
    <div class="card"><h3>Всего</h3><p>{summary.total}</p></div>
    <div class="card high"><h3>High</h3><p>{summary.high}</p></div>
    <div class="card medium"><h3>Medium</h3><p>{summary.medium}</p></div>
    <div class="card low"><h3>Low</h3><p>{summary.low}</p></div>
  </div>

  <div class="charts">
    <div class="chart">
      <h2>Динамика инцидентов</h2>
      <LineChart labels={timeline.map(t => t.date)} dataPoints={timeline.map(t => t.count)} />
    </div>
    <div class="chart">
      <h2>Топ типов угроз</h2>
      <BarChart labels={topTypes.map(t => t.type)} dataPoints={topTypes.map(t => t.count)} />
    </div>
  </div>

  <style>
    .metrics { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 2rem; }
    .card { border:1px solid #ccc; padding:1rem; border-radius:8px; min-width:100px; text-align:center; }
    .high { background:#ffebee; }
    .medium { background:#fff3e0; }
    .low { background:#e8f5e9; }
    .charts { display: flex; flex-wrap: wrap; gap: 2rem; }
    .chart { flex: 1; min-width: 300px; }
  </style>
</main>