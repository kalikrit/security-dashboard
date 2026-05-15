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

export async function fetchSummary(): Promise<Summary> {
  const res = await fetch(`${API_BASE}/incidents/summary`);
  if (!res.ok) throw new Error('Failed to fetch summary');
  return res.json();
}

export async function fetchTimeline(days: number = 7): Promise<TimelineItem[]> {
  const res = await fetch(`${API_BASE}/incidents/timeline?days=${days}`);
  if (!res.ok) throw new Error('Failed to fetch timeline');
  return res.json();
}

export async function fetchTopTypes(limit: number = 5): Promise<TopTypeItem[]> {
  const res = await fetch(`${API_BASE}/incidents/top-types?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch top types');
  return res.json();
}

export async function fetchIncidents(page: number = 1, limit: number = 20): Promise<IncidentListItem[]> {
  const res = await fetch(`${API_BASE}/incidents/list?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch incidents');
  return res.json();
}