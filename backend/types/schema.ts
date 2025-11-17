/**
 * The unified internal data format for all events.
 * This is what gets stored in the fast query index (SQLite).
 */
export interface LogEvent {
    id: string;
    timestamp: string;
    sourceDriverId: string;
    eventType: LogEventType;

    data: LocationData | SearchData | MusicData | GenericData;

    // Metadata
    rawFileRef?: string;
    tags: string[];
}

export type LogEventType = 'LOCATION' | 'SEARCH' | 'MUSIC_LISTEN' | 'PHOTO' | 'GENERIC';

export interface LocationData {
    latitude: number;
    longitude: number;
    altitude?: number;
    accuracy?: number;
    activity?: string;
}

export interface SearchData {
    query: string;
    url?: string;
    engine?: string;
}

export interface MusicData {
    artist: string;
    track: string;
    album?: string;
    msPlayed: number;
}

export interface GenericData {
    title: string;
    content: string;
    [key: string]: any;
}