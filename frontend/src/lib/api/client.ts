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
    // При ошибке соединения (backend недоступен)
    if (res.type === 'opaque' || !res.status) {
      backendAvailable = false;
      if (!connectionErrorShown) {
        console.warn(`Backend unavailable for ${endpoint}. Using cached/default data.`);
        connectionErrorShown = true;
      }
      throw new Error('Backend unavailable');
    }
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

export async function fetchSummary(): Promise<Summary> {
  try {
    const res = await fetch(`${API_BASE}/incidents/summary`);
    return handleResponse<Summary>(res, 'summary');
  } catch (err) {
    return { total: 0, high: 0, medium: 0, low: 0 };
  }
}

export async function fetchTimeline(days: number = 7): Promise<TimelineItem[]> {
  try {
    const res = await fetch(`${API_BASE}/incidents/timeline?days=${days}`);
    return handleResponse<TimelineItem[]>(res, 'timeline');
  } catch (err) {
    return [];
  }
}

export async function fetchTopTypes(limit: number = 5): Promise<TopTypeItem[]> {
  try {
    const res = await fetch(`${API_BASE}/incidents/top-types?limit=${limit}`);
    return handleResponse<TopTypeItem[]>(res, 'top-types');
  } catch (err) {
    return [];
  }
}

export async function fetchIncidents(page: number = 1, limit: number = 20): Promise<IncidentListItem[]> {
  try {
    const res = await fetch(`${API_BASE}/incidents/list?page=${page}&limit=${limit}`);
    return handleResponse<IncidentListItem[]>(res, 'incidents');
  } catch (err) {
    return [];
  }
}

export async function fetchLiveStats(): Promise<LiveStatsData> {
  try {
    const res = await fetch(`${API_BASE}/incidents/live-stats`);
    return handleResponse<LiveStatsData>(res, 'live-stats');
  } catch (err) {
    return {
      last_second_count: 0,
      last_minute_count: 0,
      top_types: {},
      severity_counts: { high: 0, medium: 0, low: 0 }
    };
  }
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