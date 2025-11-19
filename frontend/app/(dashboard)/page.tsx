'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/UI/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/Card';
import { Activity, Database, HardDrive, Server, ShieldCheck, Terminal } from 'lucide-react';
import { fetchSystemLogs, fetchSystemStats} from '@/lib/api';
import {SystemLog, SystemStats} from '@/types/types';

export default function HomePage() {
    const [logs, setLogs] = useState<SystemLog[]>([]);
    const [stats, setStats] = useState<SystemStats | null>(null);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    
    const [latency, setLatency] = useState<number>(0);

    const fetchData = async () => {
        const start = performance.now();
        try {
            const [newLogs, newStats] = await Promise.all([
                fetchSystemLogs(),
                fetchSystemStats()
            ]);
            setLogs(newLogs);
            setStats(newStats);
            setLastUpdated(new Date());

            // Measure round-trip time
            setLatency(Math.round(performance.now() - start));
        } catch (e) {
            console.error('Failed to fetch dashboard data', e);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 2000);
        return () => clearInterval(interval);
    }, []);

    const formatUptime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
    };

    const getLogLevelColor = (level: string) => {
        switch (level) {
            case 'ERROR': return 'text-red-400';
            case 'WARN': return 'text-yellow-400';
            case 'SUCCESS': return 'text-green-400';
            default: return 'text-blue-400';
        }
    };

    return (
        <div className="p-8 space-y-8 pb-20">
            <PageHeader
                title="System Dashboard"
                subtitle={`Live Overview • Last updated: ${lastUpdated.toLocaleTimeString()}`}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gray-900/50 border-gray-800">
                    <CardContent className="p-6 flex items-center space-x-4 mt-4">
                        <div className="p-3 bg-blue-900/30 rounded-lg text-blue-400">
                            <Server className="h-8 w-8" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-400">System Uptime</p>
                            <h3 className="text-2xl font-bold text-white">
                                {stats ? formatUptime(stats.uptime) : '--'}
                            </h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-gray-800">
                    <CardContent className="p-6 flex items-center space-x-4 mt-4">
                        <div className="p-3 bg-purple-900/30 rounded-lg text-purple-400">
                            <HardDrive className="h-8 w-8" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-400">NAS Storage</p>
                            <h3 className="text-2xl font-bold text-white">
                                {stats?.storage.used || '--'} <span className="text-sm text-gray-500 font-normal">/ {stats?.storage.total}</span>
                            </h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-gray-800">
                    <CardContent className="p-6 flex items-center space-x-4 mt-4">
                        <div className="p-3 bg-green-900/30 rounded-lg text-green-400">
                            <ShieldCheck className="h-8 w-8" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-400">Active Drivers</p>
                            <h3 className="text-2xl font-bold text-white">
                                {stats?.driverStatus.active ?? '-'} <span className="text-sm text-gray-500 font-normal">/ {stats?.driverStatus.total}</span>
                            </h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-gray-800">
                    <CardContent className="p-6 flex items-center space-x-4 mt-4">
                        <div className="p-3 bg-pink-900/30 rounded-lg text-pink-400">
                            <Database className="h-8 w-8" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-400">Total Events</p>
                            <h3 className="text-lg font-bold text-white">
                                {stats?.ingestion.totalEvents.toLocaleString() ?? 0}
                            </h3>
                            <p className="text-xs text-green-500">Index Active</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[500px]">

                {/* --- 2. Live Terminal Log --- */}
                <Card className="lg:col-span-2 flex flex-col bg-black border-gray-800 shadow-2xl overflow-hidden">
                    <CardHeader className="border-b border-gray-800 bg-gray-900/50 py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Terminal className="h-5 w-5 text-gray-400" />
                                <CardTitle className="text-base font-mono text-gray-200">Live System Logs</CardTitle>
                            </div>
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-4 overflow-y-auto font-mono text-sm space-y-1 custom-scrollbar bg-black/50">
                        {logs.length === 0 ? (
                            <div className="text-gray-600 italic">Waiting for system activity...</div>
                        ) : (
                            logs.map((log) => (
                                <div key={log.id} className="flex gap-3 hover:bg-white/5 p-0.5 rounded transition-colors">
                  <span className="text-gray-600 shrink-0 w-20">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}
                  </span>
                                    <span className={`shrink-0 w-24 font-bold ${getLogLevelColor(log.level)}`}>
                    [{log.level}]
                  </span>
                                    <span className="text-purple-400 shrink-0 w-32 truncate">
                    {log.service}
                  </span>
                                    <span className="text-gray-300 break-all">
                    {log.message}
                  </span>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* --- 3. REAL Ingestion Status --- */}
                <Card className="flex flex-col bg-gray-900/30 border-gray-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-blue-400" />
                            Ingestion Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 relative">
                        {/* Visual Decor */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                            <Activity className="h-48 w-48" />
                        </div>

                        <div className="space-y-6 relative z-10">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-400">Index Health</span>
                                    <span className="text-green-400">Online</span>
                                </div>
                                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full w-[100%] bg-green-500 rounded-full" />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-400">API Latency</span>
                                    <span className={latency > 200 ? 'text-yellow-400' : 'text-blue-400'}>
                    {latency}ms
                  </span>
                                </div>
                                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                    {/* Clamp the width to max 100% based on roughly 500ms max scale */}
                                    <div
                                        className={`h-full rounded-full ${latency > 200 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                                        style={{ width: `${Math.min(100, (latency / 500) * 100)}%` }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-400">Job Queue</span>
                                    <span className={stats?.ingestion.activeJobs ? 'text-blue-400' : 'text-gray-200'}>
                    {stats?.ingestion.activeJobs ? `${stats.ingestion.activeJobs} Active` : 'Idle'}
                  </span>
                                </div>
                                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                    {stats?.ingestion.activeJobs ? (
                                        <div className="h-full w-full bg-blue-500 rounded-full animate-pulse" />
                                    ) : (
                                        <div className="h-full w-0 bg-gray-500 rounded-full" />
                                    )}
                                </div>
                            </div>

                            <div className="pt-8 border-t border-gray-800">
                                <h4 className="text-sm font-bold text-gray-300 mb-2">Next Scheduled Jobs</h4>
                                <ul className="space-y-2 text-sm">
                                    {!stats || stats.ingestion.nextJobs.length === 0 ? (
                                        <li className="text-gray-500 italic">No upcoming jobs scheduled.</li>
                                    ) : (
                                        stats.ingestion.nextJobs.map((job, i) => (
                                            <li key={i} className="flex justify-between text-gray-500">
                                                <span>{job.name}</span>
                                                <span>
                          {job.nextRun ? new Date(job.nextRun).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Manual Only'}
                        </span>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}