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

export interface TimelineResponse {
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