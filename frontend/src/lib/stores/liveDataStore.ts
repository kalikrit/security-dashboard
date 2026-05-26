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
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

const DEFAULT_DATA: LiveStatsData = {
  last_second_count: 0,
  last_minute_count: 0,
  top_types: {},
  severity_counts: { high: 0, medium: 0, low: 0 }
};

async function poll() {
  try {
    const data = await fetchLiveStats();
    liveData.set(data);
    error.set(null);
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (!pollingInterval) {
      startPolling();
    }
  } catch (err) {
    error.set(err instanceof Error ? err.message : 'Unknown error');
    stopPolling();
    // Обнуляем данные
    liveData.set(DEFAULT_DATA);
    if (!reconnectTimer) {
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        poll(); // попробуем восстановить
      }, 5000);
    }
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
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

export function retryPolling() {
  // Останавливаем всё
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  // Сбрасываем ошибку и обнуляем данные (опционально)
  error.set(null);
  // Немедленно вызываем poll (один раз)
  poll().catch(() => {});
  // Запускаем интервал заново
  pollingInterval = setInterval(poll, 1000);
}