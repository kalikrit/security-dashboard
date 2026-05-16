<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  let lastSecondCount = $state(0);
  let lastMinuteCount = $state(0);
  let topTypes = $state({} as Record<string, number>);
  let severityCounts = $state({ high: 0, medium: 0, low: 0 });
  let interval: ReturnType<typeof setInterval>;

  async function fetchLiveStats() {
    try {
      const res = await fetch('http://localhost:8000/api/incidents/live-stats');
      const data = await res.json();
      lastSecondCount = data.last_second_count;
      lastMinuteCount = data.last_minute_count;
      topTypes = data.top_types;
      severityCounts = data.severity_counts;
    } catch (err) {
      console.error('Failed to fetch live stats', err);
    }
  }

  onMount(() => {
    fetchLiveStats();
    interval = setInterval(fetchLiveStats, 1000);
  });

  onDestroy(() => {
    if (interval) clearInterval(interval);
  });
</script>

<!-- Карточки с распределением по критичности -->
<div class="metrics-grid">
  <div class="metric-card high">
    <h4>High</h4>
    <div class="metric-value">{severityCounts.high}</div>
  </div>
  <div class="metric-card medium">
    <h4>Medium</h4>
    <div class="metric-value">{severityCounts.medium}</div>
  </div>
  <div class="metric-card low">
    <h4>Low</h4>
    <div class="metric-value">{severityCounts.low}</div>
  </div>
  <div class="metric-card total">
    <h4>Total (последняя минута)</h4>
    <div class="metric-value">{lastMinuteCount}</div>
  </div>
</div>

<!-- Блок с инцидентами в секунду -->
<div class="live-stat">
  <span class="label">Инцидентов за последнюю секунду:</span>
  <span class="value">{lastSecondCount}</span>
</div>

<!-- Топ типов (можно оставить) -->
<div class="top-types">
  <h4>Топ типов за минуту</h4>
  <ul>
    {#each Object.entries(topTypes) as [type, count]}
      <li><strong>{type}</strong>: {count}</li>
    {/each}
  </ul>
</div>

<style>
  .metrics-grid {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
  }
  .metric-card {
    flex: 1;
    background: #f8f9fa;
    border-radius: 12px;
    padding: 0.75rem;
    text-align: center;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  .metric-card.high { border-top: 4px solid #dc3545; }
  .metric-card.medium { border-top: 4px solid #ffc107; }
  .metric-card.low { border-top: 4px solid #28a745; }
  .metric-card.total { border-top: 4px solid #17a2b8; }
  .metric-card h4 {
    margin: 0 0 0.5rem;
    font-size: 0.9rem;
    color: #555;
  }
  .metric-value {
    font-size: 1.8rem;
    font-weight: bold;
  }
  .live-stat {
    margin: 1rem 0;
    font-size: 1rem;
  }
  .live-stat .value {
    font-weight: bold;
    font-size: 1.2rem;
    margin-left: 0.5rem;
  }
  .top-types {
    margin-top: 1rem;
  }
</style>