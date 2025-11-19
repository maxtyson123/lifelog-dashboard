import {
    DriverStatusResponse,
    HistoryResponse,
    SearchResponse,
    AnalyticsResponse,
    SystemLog,
    SystemStats
} from '@/types/types';

// Centralise all API calls
const API_BASE = 'http://localhost:3001/api';

/**
 * Fetches all data sources and their status.
 */
export async function fetchDriverSources(): Promise<DriverStatusResponse[]> {
    const res = await fetch(`${API_BASE}/sources`);
    if (!res.ok) {
        throw new Error('Failed to fetch data sources');
    }
    return res.json();
}

/**
 * Triggers a manual run for a driver.
 */
export async function triggerManualRun(driverId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/sources/${driverId}/run`, {
        method: 'POST',
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || 'Failed to trigger run');
    }
    return data;
}

/**
 * Fetches history events for a date range.
 */
export async function fetchHistory(startDate: string, endDate: string): Promise<HistoryResponse> {
    const params = new URLSearchParams({ startDate, endDate });
    const res = await fetch(`${API_BASE}/history?${params}`);
    if (!res.ok) {
        throw new Error('Failed to fetch history');
    }
    return res.json();
}

/**
 * Performs a search query.
 */
export async function searchEvents(query: string, filters: any = {}, limit: number = 50): Promise<SearchResponse> {
    const res = await fetch(`${API_BASE}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, filters, limit }),
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || 'Failed to perform search');
    }
    return data;
}

/**
 * Runs an analytics query.
 */
export async function fetchAnalytics(queryConfig: any): Promise<AnalyticsResponse> {
    const res = await fetch(`${API_BASE}/analytics/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queryConfig }),
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || 'Failed to run analytics query');
    }
    return data;
}

export async function fetchSystemLogs(): Promise<SystemLog[]> {
    const res = await fetch(`${API_BASE}/system/logs`);
    if (!res.ok) throw new Error('Failed to fetch logs');
    return res.json();
}

export async function fetchSystemStats(): Promise<SystemStats> {
    const res = await fetch(`${API_BASE}/system/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
}