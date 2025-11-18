'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/UI/PageHeader';
import { Button } from '@/components/UI/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/UI/Card';
import { fetchDriverSources, triggerManualRun } from '@/lib/api';
import { DriverStatusResponse } from '@/types/types';
import { Database, Zap, Clock, HardDrive, AlertTriangle, CheckCircle } from 'lucide-react';

export default function DataSourcesPage() {
    const [sources, setSources] = useState<DriverStatusResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [running, setRunning] = useState<string | null>(null); // ID of the driver being run

    const loadSources = async () => {
        try {
            setError(null);
            setLoading(true);
            const data = await fetchDriverSources();
            setSources(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load sources');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSources();
    }, []);

    const handleRun = async (driverId: string) => {
        setRunning(driverId);
        try {
            await triggerManualRun(driverId);
            // Refresh data after run
            await loadSources();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Run failed');
        } finally {
            setRunning(null);
        }
    };

    const HealthIcon = ({ health }: { health: 'OK' | 'WARN' | 'ERROR' }) => {
        if (health === 'OK') {
            return <CheckCircle className="h-5 w-5 text-green-500" />;
        }
        if (health === 'WARN') {
            return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
        }
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
    };

    return (
        <div className="p-8">
            <PageHeader title="Data Sources" subtitle="Manage and monitor your data drivers." />

            {loading && <p className="mt-4 text-gray-400">Loading sources...</p>}
            {error && <p className="mt-4 text-red-500">{error}</p>}

            {!loading && !error && (
                <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {sources.map(({ metadata, status }) => (
                        <Card key={metadata.id}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <Database className="h-6 w-6 text-blue-400" />
                                        {metadata.name}
                                    </CardTitle>
                                    <HealthIcon health={status.health} />
                                </div>
                                <CardDescription>{metadata.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-400">
                    <Clock className="h-4 w-4" /> Last Pull
                  </span>
                                    <span className="font-medium">{status.lastPull ? new Date(status.lastPull).toLocaleString() : 'Never'}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-400">
                    <HardDrive className="h-4 w-4" /> Storage
                  </span>
                                    <span className="font-medium">{status.storageUsage}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-400">
                    <Zap className="h-4 w-4" /> Mode
                  </span>
                                    <span className="font-medium">{metadata.isAutomatic ? 'Automatic' : 'Manual'}</span>
                                </div>
                                <p className="text-sm text-gray-500 pt-2">{status.message}</p>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    onClick={() => handleRun(metadata.id)}
                                    isLoading={running === metadata.id}
                                    disabled={running !== null}
                                >
                                    <Zap className="-ml-1 mr-2 h-4 w-4" />
                                    Run Manual Fetch
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}