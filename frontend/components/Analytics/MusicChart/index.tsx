'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/Card';
import { fetchAnalytics } from '@/lib/api';

interface MusicCount {
    sourceDriverId: string;
    eventCount: number;
}

// A simple bar chart component using divs
const SimpleBarChart = ({ data }: { data: MusicCount[] }) => {
    const maxCount = Math.max(...data.map(d => d.eventCount), 0);

    return (
        <div className="space-y-4">
            {data.map((item) => (
                <div key={item.sourceDriverId} className="group">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-300">{item.sourceDriverId}</span>
                        <span className="text-sm font-bold text-white">{item.eventCount.toLocaleString()}</span>
                    </div>
                    <div className="mt-1 h-2 w-full rounded-full bg-gray-700">
                        <div
                            className="h-2 rounded-full bg-blue-500 transition-all duration-500 group-hover:bg-blue-400"
                            style={{ width: `${(item.eventCount / maxCount) * 100}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

export function MusicChart() {
    const [data, setData] = useState<MusicCount[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadData() {
            try {
                const query = { type: 'music_counts_by_source' };
                const response = await fetchAnalytics(query);
                setData(response.results);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load chart data');
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Music by Source</CardTitle>
                <CardDescription>Total tracks played from each platform.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading && <p className="text-gray-400">Loading chart...</p>}
                {error && <p className="text-red-500">{error}</p>}
                {data && (
                    <>
                        {/* This is where you would put your real chart component.
              e.g., <BarChart data={data}>...</BarChart>
              For now, we use a simple div-based bar chart.
            */}
                        <SimpleBarChart data={data} />
                    </>
                )}
            </CardContent>
        </Card>
    );
}