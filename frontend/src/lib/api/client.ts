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
    const errorText = await res.text().catch(() => 'Unknown error');
    throw new Error(`HTTP ${res.status}: ${errorText || res.statusText}`);
  }
  return res.json();
}

export async function fetchSummary(): Promise<Summary> {
  const res = await fetch(`${API_BASE}/incidents/summary`);
  return handleResponse<Summary>(res);
}

export async function fetchTimeline(days: number = 7): Promise<TimelineItem[]> {
  const res = await fetch(`${API_BASE}/incidents/timeline?days=${days}`);
  return handleResponse<TimelineItem[]>(res);
}

export async function fetchTopTypes(limit: number = 5): Promise<TopTypeItem[]> {
  const res = await fetch(`${API_BASE}/incidents/top-types?limit=${limit}`);
  return handleResponse<TopTypeItem[]>(res);
}

export async function fetchIncidents(page: number = 1, limit: number = 20): Promise<IncidentListItem[]> {
  const res = await fetch(`${API_BASE}/incidents/list?page=${page}&limit=${limit}`);
  return handleResponse<IncidentListItem[]>(res);
}

export async function fetchLiveStats(): Promise<LiveStatsData> {
  const res = await fetch(`${API_BASE}/incidents/live-stats`);
  return handleResponse<LiveStatsData>(res);
}