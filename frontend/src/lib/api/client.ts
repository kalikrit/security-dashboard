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
let lastHealthCheckFailed = false;

// Функция проверки здоровья бэкенда (использует GET вместо HEAD)
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const res = await fetch(`${API_BASE}/incidents/summary`, {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (res.ok) {
      if (!backendAvailable) {
        console.log('Backend connection restored');
      }
      backendAvailable = true;
      lastHealthCheckFailed = false;
      return true;
    } else {
      backendAvailable = false;
      return false;
    }
  } catch (err) {
    // Показываем предупреждение только при изменении статуса
    if (!lastHealthCheckFailed) {
      console.warn('Backend health check failed');
      lastHealthCheckFailed = true;
    }
    backendAvailable = false;
    return false;
  }
}

// Функция для получения текущего статуса подключения
export function isBackendAvailable(): boolean {
  return backendAvailable;
}

async function handleResponse<T>(res: Response, endpoint: string): Promise<T> {
  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Unknown error');
    throw new Error(`HTTP ${res.status}: ${errorText || res.statusText}`);
  }
  return res.json();
}

async function safeFetch<T>(url: string, endpoint: string, defaultData: T, silent: boolean = false): Promise<T> {
  try {
    const res = await fetch(url);
    return await handleResponse<T>(res, endpoint);
  } catch (err) {
    // Не логируем ошибки для периодических запросов (silent=true)
    if (!silent) {
      console.warn(`Failed to fetch ${endpoint}:`, err);
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

// export async function fetchLiveStats(): Promise<LiveStatsData> {
//   return safeFetch(`${API_BASE}/incidents/live-stats`, 'live-stats', {
//     last_second_count: 0,
//     last_minute_count: 0,
//     top_types: {},
//     severity_counts: { high: 0, medium: 0, low: 0 }
//   }); 
// }

export async function fetchLiveStats(): Promise<LiveStatsData> {
  const response = await fetch(`${API_BASE}/incidents/live-stats`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}