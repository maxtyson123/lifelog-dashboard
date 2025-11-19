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
    | 'stat-single'   // Single big number (uses 1st stream)
    | 'stat-list'     // List of top items (e.g. Top Artists)
    | 'graph-bar'     // Bar chart comparing multiple streams
    | 'graph-pie'     // Pie chart comparing multiple streams
    | 'graph-line'    // Line chart showing trends over time
    | 'graph-area';   // Area chart (filled line)

export interface AnalyticsFilter {
    eventType?: string; // 'MUSIC_LISTEN', 'LOCATION', 'SEARCH'
    sourceDriverId?: string; // 'spotify', 'google-takeout'
    dateRange?: string; // 'all', '30d', '7d', '24h'
}

// A single series of data to fetch
export interface DataStream {
    id: string;
    label: string; // Display name (e.g. "Spotify Plays")
    color?: string; // Hex code for graphs
    filters: AnalyticsFilter;
    operation: 'count' | 'sum'; // How to aggregate
}

export interface WidgetConfig {
    id: string;
    title: string;
    description?: string;
    size: WidgetSize;
    type: WidgetType;
    streams: DataStream[]; // Array of data sources to visualize
}