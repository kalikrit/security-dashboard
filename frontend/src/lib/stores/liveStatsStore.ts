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
let subscribersCount = 0;

export function startLiveStatsUpdates() {
  if (intervalId) return; // Уже запущено
  
  async function update() {
    try {
      liveStatsError.set(null);
      const data = await fetchLiveStats();
      liveStats.set(data);
      liveStatsLoading.set(false);
    } catch (err) {
      liveStatsError.set(err instanceof Error ? err.message : 'Failed to fetch live stats');
      liveStatsLoading.set(false);
      // Ошибки уже логируются в client.ts с флагом silent
    }
  }
  
  update(); // Первый запрос сразу
  intervalId = setInterval(update, 1000);
}

export function stopLiveStatsUpdates() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

// Автоматический запуск при первой подписке и остановка когда подписчиков нет
export const subscribe = ((fn) => {
  subscribersCount++;
  if (subscribersCount === 1) {
    startLiveStatsUpdates();
  }
  
  const unsubscribe = liveStats.subscribe(fn);
  
  return () => {
    unsubscribe();
    subscribersCount--;
    if (subscribersCount === 0) {
      stopLiveStatsUpdates();
    }
  };
}) as typeof liveStats.subscribe;
