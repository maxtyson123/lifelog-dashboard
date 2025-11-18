'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/UI/PageHeader';
import { Button } from '@/components/UI/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/Card';
import { searchEvents } from '@/lib/api';
import { LogEvent } from '@/types/types';
import { Search, Music, MapPin } from 'lucide-react';

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<LogEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query) return;

        setLoading(true);
        setError(null);
        setHasSearched(true);
        try {
            // TODO: Add UI for filters
            const data = await searchEvents(query, {}, 50);
            setResults(data.results);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to search');
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

    const ResultItem = ({ event }: { event: LogEvent }) => (
        <li className="flex items-start space-x-4 py-4">
      <span className="mt-1">
        <EventIcon type={event.eventType} />
      </span>
            <div className="flex-1">
                <p className="text-sm font-medium text-white">
                    {/* Simple renderer for event data */}
                    {event.eventType === 'MUSIC_LISTEN' && `${event.data.artist} - ${event.data.track}`}
                    {event.eventType === 'SEARCH' && `${event.data.query}`}
                    {event.eventType === 'LOCATION' && `Moved to ${event.data.latitude}, ${event.data.longitude}`}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{event.sourceDriverId}</span>
                    <span className="text-xs text-gray-400">
            {new Date(event.timestamp).toLocaleString()}
          </span>
                </div>
            </div>
        </li>
    );

    return (
        <div className="p-8">
            <PageHeader title="Search" subtitle="Find anything across your entire lifelog." />

            <form onSubmit={handleSearch} className="mt-8 flex gap-4">
                <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for artists, places, queries..."
                    className="flex-1 rounded-md border-gray-600 bg-gray-800 px-4 py-2 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <Button type="submit" isLoading={loading}>
                    <Search className="-ml-1 mr-2 h-5 w-5" />
                    Search
                </Button>
            </form>

            <div className="mt-8">
                {error && <p className="text-red-500">{error}</p>}
                {loading && <p className="text-gray-400">Searching...</p>}

                {!loading && !error && hasSearched && results.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Results ({results.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="divide-y divide-gray-700">
                                {results.map((event) => (
                                    <ResultItem key={event.id} event={event} />
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}

                {!loading && !error && hasSearched && results.length === 0 && (
                    <p className="text-gray-400 text-center py-12">No results found for "{query}".</p>
                )}
            </div>
        </div>
    );
}