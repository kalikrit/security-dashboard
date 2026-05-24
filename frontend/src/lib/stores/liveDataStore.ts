import { writable } from 'svelte/store';
import { fetchLiveStats, type LiveStatsData } from '$lib/api/client';

export const liveData = writable<LiveStatsData>({
  last_second_count: 0,
  last_minute_count: 0,
  top_types: {},
  severity_counts: { high: 0, medium: 0, low: 0 }
});
export const error = writable<string | null>(null);
export let pollingInterval: ReturnType<typeof setInterval> | null = null;

async function poll() {
  try {
    const data = await fetchLiveStats();
    liveData.set(data);
    error.set(null);
  } catch (err) {
    error.set(err instanceof Error ? err.message : 'Unknown error');
    stopPolling();
  }
}

export function startPolling() {
  if (pollingInterval) stopPolling();
  poll();
  pollingInterval = setInterval(poll, 1000);
}

export function stopPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
}

export function retryPolling() {
  stopPolling();
  startPolling();
}