'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/UI/PageHeader';
import { Button } from '@/components/UI/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/Card';
import { fetchTimeline } from '@/lib/api';
import { LogEvent } from '@/types/types';
import { Music, Search, MapPin } from 'lucide-react';

// Helper to get a default ISO 8601 string for today
const getTodayISO = (endOfDay = false) => {
    const d = new Date();
    if (endOfDay) {
        d.setHours(23, 59, 59, 999);
    } else {
        d.setHours(0, 0, 0, 0);
    }
    return d.toISOString();
};

export default function TimelinePage() {
    const [startDate, setStartDate] = useState(getTodayISO());
    const [endDate, setEndDate] = useState(getTodayISO(true));
    const [events, setEvents] = useState<LogEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFetch = async () => {
        setLoading(true);
        setError(null);
        setEvents([]);
        try {
            const data = await fetchTimeline(startDate, endDate);
            setEvents(data.results);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch timeline');
        } finally {
            setLoading(false);
        }
    };

    const EventIcon = ({ type }: { type: string }) => {
        if (type === 'MUSIC_LISTEN') return <Music className="h-5 w-5 text-pink-400" />;
        if (type === 'LOCATION') return <MapPin className="h-5 w-5 text-green-400" />;
        if (type === 'SEARCH') return <Search className="h-5 w-5 text-blue-400" />;
        return <Search className="h-5 w-5 text-gray-400" />;
    };

    const EventItem = ({ event }: { event: LogEvent }) => (
        <li className="flex items-start space-x-4 py-4">
      <span className="mt-1">
        <EventIcon type={event.eventType} />
      </span>
            <div className="flex-1">
                <div className="flex items-center justify-between">
          <span className="font-medium text-white">
            {event.eventType.replace('_', ' ').toLowerCase()}
          </span>
                    <span className="text-xs text-gray-400">
            {new Date(event.timestamp).toLocaleTimeString()}
          </span>
                </div>
                <p className="text-sm text-gray-300">
                    {/* Simple renderer for event data */}
                    {event.eventType === 'MUSIC_LISTEN' && `${event.data.artist} - ${event.data.track}`}
                    {event.eventType === 'SEARCH' && `${event.data.query}`}
                    {event.eventType === 'LOCATION' && `Moved to ${event.data.latitude}, ${event.data.longitude}`}
                </p>
                <p className="text-xs text-gray-500">{event.sourceDriverId}</p>
            </div>
        </li>
    );

    return (
        <div className="p-8">
            <PageHeader title="Timeline" subtitle="A chronological view of your data." />

            <Card className="mt-8">
                <CardHeader>
                    <CardTitle>Select Date Range</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 md:flex-row md:items-end">
                    <div className="flex-1">
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-300">Start Date</label>
                        <input
                            type="datetime-local"
                            id="startDate"
                            value={startDate.substring(0, 16)} // Format for datetime-local
                            onChange={(e) => setStartDate(new Date(e.target.value).toISOString())}
                            className="mt-1 block w-full rounded-md border-gray-600 bg-gray-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex-1">
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-300">End Date</label>
                        <input
                            type="datetime-local"
                            id="endDate"
                            value={endDate.substring(0, 16)}
                            onChange={(e) => setEndDate(new Date(e.target.value).toISOString())}
                            className="mt-1 block w-full rounded-md border-gray-600 bg-gray-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <Button onClick={handleFetch} isLoading={loading}>Fetch Timeline</Button>
                </CardContent>
            </Card>

            <div className="mt-8">
                {error && <p className="text-red-500">{error}</p>}
                {loading && <p className="text-gray-400">Loading events...</p>}
                {!loading && !error && events.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Results ({events.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="divide-y divide-gray-700">
                                {events.map((event) => (
                                    <EventItem key={event.id} event={event} />
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}
                {!loading && !error && events.length === 0 && (
                    <p className="text-gray-400 text-center py-12">No events found for this time range.</p>
                )}
            </div>
        </div>
    );
}