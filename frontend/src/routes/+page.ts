import type { PageLoad } from './$types';
import { fetchSummary, fetchTimeline, fetchTopTypes } from '$lib/api/client';

export const load: PageLoad = async () => {
  try {
    const [summary, timeline, topTypes] = await Promise.all([
      fetchSummary(),
      fetchTimeline(7),
      fetchTopTypes(5)
    ]);
    return {
      summary,
      timeline,
      topTypes
    };
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
    return {
      summary: { total: 0, high: 0, medium: 0, low: 0 },
      timeline: [],
      topTypes: []
    };
  }
};