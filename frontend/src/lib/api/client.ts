const API_BASE = import.meta.env.VITE_API_BASE_URL;

export interface Summary {
  total: number;
  high: number;
  medium: number;
  low: number;
}

export interface TimelineItem {
  date: string;
  count: number;
}

export interface TopTypeItem {
  type: string;
  count: number;
}

export interface IncidentListItem {
  id: number;
  timestamp: string;
  incident_type: string;
  severity: string;
  source_country: string;
  status: string;
  cve_id: string | null;
  description: string | null;
}

export interface LiveStatsData {
  last_second_count: number;
  last_minute_count: number;
  top_types: Record<string, number>;
  severity_counts: {
    high: number;
    medium: number;
    low: number;
  };
}

// Глобальное состояние для отслеживания статуса подключения
let backendAvailable = true;
let connectionErrorShown = false;

async function handleResponse<T>(res: Response, endpoint: string): Promise<T> {
  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Unknown error');
    throw new Error(`HTTP ${res.status}: ${errorText || res.statusText}`);
  }
  // Если запрос успешен, восстанавливаем статус
  if (!backendAvailable) {
    backendAvailable = true;
    connectionErrorShown = false;
    console.log(`Backend connection restored for ${endpoint}`);
  }
  return res.json();
}

async function safeFetch<T>(url: string, endpoint: string, defaultData: T): Promise<T> {
  try {
    const res = await fetch(url);
    return await handleResponse<T>(res, endpoint);
  } catch (err) {
    // Ошибка соединения (backend недоступен)
    if (!backendAvailable) {
      backendAvailable = false;
      if (!connectionErrorShown) {
        console.warn(`Backend unavailable for ${endpoint}. Using cached/default data.`);
        connectionErrorShown = true;
      }
    }
    return defaultData;
  }
}

export async function fetchSummary(): Promise<Summary> {
  return safeFetch(`${API_BASE}/incidents/summary`, 'summary', { total: 0, high: 0, medium: 0, low: 0 });
}

export async function fetchTimeline(days: number = 7): Promise<TimelineItem[]> {
  return safeFetch(`${API_BASE}/incidents/timeline?days=${days}`, 'timeline', []);
}

export async function fetchTopTypes(limit: number = 5): Promise<TopTypeItem[]> {
  return safeFetch(`${API_BASE}/incidents/top-types?limit=${limit}`, 'top-types', []);
}

export async function fetchIncidents(page: number = 1, limit: number = 20): Promise<IncidentListItem[]> {
  return safeFetch(`${API_BASE}/incidents/list?page=${page}&limit=${limit}`, 'incidents', []);
}

export async function fetchLiveStats(): Promise<LiveStatsData> {
  return safeFetch(`${API_BASE}/incidents/live-stats`, 'live-stats', {
    last_second_count: 0,
    last_minute_count: 0,
    top_types: {},
    severity_counts: { high: 0, medium: 0, low: 0 }
  });
}

// Функция для получения текущего статуса подключения
export function isBackendAvailable(): boolean {
  return backendAvailable;
}

// Функция для сброса состояния (например, при переподключении)
export function resetConnectionStatus(): void {
  backendAvailable = true;
  connectionErrorShown = false;
}