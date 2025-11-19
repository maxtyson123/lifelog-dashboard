export interface LogEvent {
    id: string;
    timestamp: string;
    sourceDriverId: string;
    eventType: string;
    data: any;          // 'any' is fine here as components will check eventType
    tags: string[];
    rawFileRef?: string;
}

export interface DriverMetadata {
    id: string;
    name: string;
    description: string;
    isAutomatic: boolean;
}

export interface DriverStatus {
    lastPull: string | null;
    storageUsage: string;
    health: 'OK' | 'WARN' | 'ERROR';
    message: string;
}

export interface DriverStatusResponse {
    metadata: DriverMetadata;
    status: DriverStatus;
}

export interface HistoryResponse {
    range: { startDate: string; endDate: string };
    count: number;
    results: LogEvent[];
}

export interface SearchResponse {
    query: string;
    filters: any;
    count: number;
    results: LogEvent[];
}

export interface AnalyticsResponse {
    query: any;
    results: any;
}


export type WidgetSize = 'half' | 'full';
export type WidgetType =
    | 'stat-single'
    | 'stat-list'
    | 'graph-bar'
    | 'graph-pie'
    | 'graph-line'
    | 'graph-area';

export interface AnalyticsFilter {
    eventType?: string;
    sourceDriverId?: string;
    dateRange?: string;
}

// A single series of data to fetch
export interface DataStream {
    id: string;
    label: string;
    color?: string;
    filters: AnalyticsFilter;
    operation: 'count' | 'sum';
}

export interface WidgetConfig {
    id: string;
    title: string;
    description?: string;
    size: WidgetSize;
    type: WidgetType;
    streams: DataStream[];
}


export interface SystemLog {
    id: string;
    timestamp: string;
    level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
    service: string;
    message: string;
}

export interface SystemStats {
    uptime: number;
    driverStatus: {
        total: number;
        active: number
    };
    storage: {
        used: string;
        total: string;
        percent: number
    };
    ingestion: {
        totalEvents: number;
        activeJobs: number;
        nextJobs: { name: string; nextRun: string | null }[];
    };
}