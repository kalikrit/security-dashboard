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

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    // При ошибке соединения (backend недоступен) не выбрасываем ошибку,
    // а возвращаем дефолтные значения для graceful degradation
    if (res.type === 'opaque' || !res.status) {
      throw new Error('Backend unavailable');
    }
    const errorText = await res.text().catch(() => 'Unknown error');
    throw new Error(`HTTP ${res.status}: ${errorText || res.statusText}`);
  }
  return res.json();
}

export async function fetchSummary(): Promise<Summary> {
  try {
    const res = await fetch(`${API_BASE}/incidents/summary`);
    return handleResponse<Summary>(res);
  } catch (err) {
    console.warn('fetchSummary failed, returning defaults:', err);
    return { total: 0, high: 0, medium: 0, low: 0 };
  }
}

export async function fetchTimeline(days: number = 7): Promise<TimelineItem[]> {
  try {
    const res = await fetch(`${API_BASE}/incidents/timeline?days=${days}`);
    return handleResponse<TimelineItem[]>(res);
  } catch (err) {
    console.warn('fetchTimeline failed, returning defaults:', err);
    return [];
  }
}

export async function fetchTopTypes(limit: number = 5): Promise<TopTypeItem[]> {
  try {
    const res = await fetch(`${API_BASE}/incidents/top-types?limit=${limit}`);
    return handleResponse<TopTypeItem[]>(res);
  } catch (err) {
    console.warn('fetchTopTypes failed, returning defaults:', err);
    return [];
  }
}

export async function fetchIncidents(page: number = 1, limit: number = 20): Promise<IncidentListItem[]> {
  try {
    const res = await fetch(`${API_BASE}/incidents/list?page=${page}&limit=${limit}`);
    return handleResponse<IncidentListItem[]>(res);
  } catch (err) {
    console.warn('fetchIncidents failed, returning defaults:', err);
    return [];
  }
}

export async function fetchLiveStats(): Promise<LiveStatsData> {
  try {
    const res = await fetch(`${API_BASE}/incidents/live-stats`);
    return handleResponse<LiveStatsData>(res);
  } catch (err) {
    console.warn('fetchLiveStats failed, returning defaults:', err);
    return {
      last_second_count: 0,
      last_minute_count: 0,
      top_types: {},
      severity_counts: { high: 0, medium: 0, low: 0 }
    };
  }
}