<script lang="ts">
  import type { PageData } from './$types';
  import LiveLineChart from '$lib/components/LiveLineChart.svelte';
  import BarChart from '$lib/components/BarChart.svelte';
  import LiveStats from '$lib/components/LiveStats.svelte';

  let { data }: { data: PageData } = $props();

  let summary = data.summary;
  let timeline = data.timeline;
  let topTypes = data.topTypes;
</script>

<main>
  <h1>Security Analytics Dashboard</h1>

  <LiveStats />

  <div class="charts">
    <div class="chart">
      <h2>Динамика инцидентов</h2>
      <LiveLineChart />
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