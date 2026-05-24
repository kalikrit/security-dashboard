import { writable, type Writable } from 'svelte/store';
import { fetchLiveStats, type LiveStatsData } from '$lib/api/client';

const defaultData: LiveStatsData = {
  last_second_count: 0,
  last_minute_count: 0,
  top_types: {},
  severity_counts: { high: 0, medium: 0, low: 0 }
};

export const liveStats: Writable<LiveStatsData> = writable(defaultData);
export const liveStatsLoading: Writable<boolean> = writable(true);
export const liveStatsError: Writable<string | null> = writable(null);

let intervalId: ReturnType<typeof setInterval> | null = null;
let isRunning = false;

async function update() {
  try {
    liveStatsError.set(null);
    const data = await fetchLiveStats();
    liveStats.set(data);
    liveStatsLoading.set(false);
  } catch (err) {
    liveStatsError.set(err instanceof Error ? err.message : 'Failed to fetch live stats');
    liveStatsLoading.set(false);
  }
}

export function startLiveStatsUpdates() {
  if (isRunning) return;
  
  isRunning = true;
  update(); // Первый запрос сразу
  intervalId = setInterval(update, 1000);
}

export function stopLiveStatsUpdates() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  isRunning = false;
}

// Запускаем обновления сразу при импорте модуля
startLiveStatsUpdates();
