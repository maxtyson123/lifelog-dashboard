import {SearchFilters} from "../core/queryEngine";
import {LogEvent} from "./schema";
import {DriverMetadata, DriverStatus} from "./driver.interface";

export type SearchPostReq = {
    query: string;
    filters?: SearchFilters;
    limit?: number;
}

export type SearchPostRes = {
    query?: string;
    filters?: SearchFilters;
    count?: number;
    results?: LogEvent[];
    error?: string;
}

export type HistoryGetReq = {
    startDate?: string;
    endDate?: string;
}

export type HistoryGetRes = {
    error?: string;
    range?: {
        startDate: string;
        endDate: string;
    };
    count?: number;
    results?: LogEvent[];
}

export type AnalyticsPostReq = {
    queryName: string;
    timeRange?: {
        startDate?: string;
        endDate?: string;
    };
    queryConfig: any; //TODO: Type this properly
}

export type AnalyticsPostRes = {
    error?: string;
    query?: any; //TODO: Type this properly
    results?: any; //TODO: Type this properly
}

export type SourcesGetReq = {
    // No parameters for GET /api/sources
}

export type SourcesGetRes = {
    metadata: DriverMetadata;
    status: DriverStatus;
}[] | { error: string };

export type SourcesPostParams = {
    id: string;
}

export type SourcesPostReq = {
    // No body parameters for POST /api/sources/:id/run
}

export type SourcesPostRes = {
    message?: string;
    jobId?: string;
    error?: string;
}