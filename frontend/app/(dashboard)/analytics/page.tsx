'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/UI/PageHeader';
import { StatCard } from '@/components/Analytics/StatsCard';
import { MusicChart } from '@/components/Analytics/MusicChart';
import { BarChart2, Hash, Music, MapPin } from 'lucide-react';
import { fetchAnalytics } from '@/lib/api';

interface StatSummary {
    totalEvents: number;
    tracksPlayed: number;
    placesVisited: number;
    activeDrivers: number;
    change: string;
}

export default function AnalyticsPage() {
    const [stats, setStats] = useState<StatSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadStats() {
            try {
                const query = { type: 'stat_card_summary' };
                const response = await fetchAnalytics(query);
                setStats(response.results);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load summary');
            } finally {
                setLoading(false);
            }
        }
        loadStats();
    }, []);

    return (
        <div className="p-8">
            <PageHeader title="Analytics" subtitle="Insights from your personal data." />

            {error && <p className="mt-4 text-red-500">{error}</p>}

            {/* Top-level stat cards */}
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Events"
                    value={stats?.totalEvents.toLocaleString() ?? '...'}
                    icon={Hash}
                    change={stats?.change}
                    isLoading={loading}
                />
                <StatCard
                    title="Tracks Played"
                    value={stats?.tracksPlayed.toLocaleString() ?? '...'}
                    icon={Music}
                    change="From all sources"
                    isLoading={loading}
                />
                <StatCard
                    title="Places Visited"
                    value={stats?.placesVisited.toLocaleString() ?? '...'}
                    icon={MapPin}
                    change="Unique locations"
                    isLoading={loading}
                />
                <StatCard
                    title="Active Drivers"
                    value={stats?.activeDrivers.toLocaleString() ?? '...'}
                    icon={BarChart2}
                    change="All systems OK"
                    isLoading={loading}
                />
            </div>

            {/* Main chart grid */}
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* This chart is fully functional and fetches its own data */}
                <MusicChart />

                {/* You would add more chart components here */}
                <div className="flex min-h-[300px] items-center justify-center rounded-lg border-2 border-dashed border-gray-700 bg-gray-900/50">
                    <p className="text-gray-500">More charts coming soon...</p>
                </div>
            </div>
        </div>
    );
}