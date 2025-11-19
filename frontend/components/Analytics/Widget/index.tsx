import React, { useEffect, useState, useMemo } from 'react';
import { WidgetConfig } from '@/types/types';
import { fetchAnalytics } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/UI/Card';
import { Loader2, Trash2, ArrowLeft, ArrowRight, Pencil } from 'lucide-react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    AreaChart,
    Area,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

interface DynamicWidgetProps {
    config: WidgetConfig;
    onRemove: () => void;
    onEdit: () => void;
    onMoveLeft?: () => void;
    onMoveRight?: () => void;
}

export function DynamicWidget({ config, onRemove, onEdit, onMoveLeft, onMoveRight }: DynamicWidgetProps) {
    const [rawData, setRawData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        async function load() {
            setLoading(true);
            try {
                const payload = {
                    type: 'multi_stream',
                    widgetType: config.type,
                    streams: config.streams
                };
                const res = await fetchAnalytics(payload);
                if (isMounted) setRawData(res.results || []);
            } catch (e) {
                console.error(e);
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        load();
        return () => { isMounted = false; };
    }, [config]);

    const chartData = useMemo(() => {
        if (!rawData.length) return [];

        if (config.type === 'graph-line' || config.type === 'graph-area') {
            const pivotMap = new Map<string, any>();

            rawData.forEach(stream => {
                if (Array.isArray(stream.data)) {
                    stream.data.forEach((point: any) => {
                        if (!pivotMap.has(point.date)) {
                            pivotMap.set(point.date, { name: point.date });
                        }
                        pivotMap.get(point.date)[stream.label] = point.value;
                    });
                }
            });

            return Array.from(pivotMap.values()).sort((a, b) => a.name.localeCompare(b.name));
        }

        return rawData.map(stream => ({
            name: stream.label,
            value: stream.value,
            color: stream.color
        }));
    }, [rawData, config.type]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="rounded-lg border border-gray-700 bg-gray-900 p-3 shadow-xl">
                    <p className="mb-2 text-xs font-medium text-gray-400">{label}</p>
                    {payload.map((entry: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                            <span className="block h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-gray-300">{entry.name}:</span>
                            <span className="font-bold text-white">{entry.value.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    const renderStatSingle = () => {
        const item = rawData[0];
        if (!item) return null;
        return (
            <div className="flex items-center justify-center h-full py-4">
                <div className="text-4xl font-bold text-white">{item.value?.toLocaleString()}</div>
            </div>
        );
    };

    const renderStatList = () => (
        <div className="space-y-2 mt-2 h-full overflow-y-auto pr-2 custom-scrollbar">
            {rawData[0]?.data?.map((item: any, i: number) => (
                <div key={i} className="flex justify-between items-center text-sm border-b border-gray-800 pb-2 last:border-0">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-gray-500 w-4">{i+1}</span>
                        <span className="text-gray-300">{item.label}</span>
                    </div>
                    <span className="text-white font-medium">{item.value.toLocaleString()}</span>
                </div>
            ))}
        </div>
    );

    const renderBarChart = () => (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis
                    dataKey="name"
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                />
                <RechartsTooltip cursor={{ fill: '#1F2937' }} content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || `hsl(${210 + (index * 40)}, 70%, 50%)`} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );

    const renderPieChart = () => (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || `hsl(${210 + (index * 40)}, 70%, 50%)`} />
                    ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ fontSize: '12px', color: '#9CA3AF' }}
                />
            </PieChart>
        </ResponsiveContainer>
    );

    const renderLineChart = () => (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis
                    dataKey="name"
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                />
                <YAxis
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                {config.streams.map((stream, idx) => (
                    <Line
                        key={stream.id}
                        type="monotone"
                        dataKey={stream.label}
                        stroke={stream.color || `hsl(${210 + (idx * 40)}, 70%, 50%)`}
                        strokeWidth={3}
                        dot={{ fill: '#1F2937', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    );

    const renderAreaChart = () => (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
                <defs>
                    {config.streams.map((stream, idx) => (
                        <linearGradient key={stream.id} id={`color${stream.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={stream.color || `hsl(${210 + (idx * 40)}, 70%, 50%)`} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={stream.color || `hsl(${210 + (idx * 40)}, 70%, 50%)`} stopOpacity={0}/>
                        </linearGradient>
                    ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis
                    dataKey="name"
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                />
                <YAxis
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                {config.streams.map((stream, idx) => (
                    <Area
                        key={stream.id}
                        type="monotone"
                        dataKey={stream.label}
                        stroke={stream.color || `hsl(${210 + (idx * 40)}, 70%, 50%)`}
                        fillOpacity={1}
                        fill={`url(#color${stream.id})`}
                    />
                ))}
            </AreaChart>
        </ResponsiveContainer>
    );

    return (
        <Card className="relative group h-full flex flex-col overflow-hidden hover:border-gray-600 transition-colors">
            <CardHeader className="pb-2 shrink-0">
                <div className="flex items-start justify-between">
                    <div className="overflow-hidden pr-12">
                        <CardTitle className="text-base truncate">{config.title}</CardTitle>
                        {config.description && <CardDescription className="text-xs mt-1 truncate">{config.description}</CardDescription>}
                    </div>

                    {/* Actions */}
                    <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900/90 rounded-md backdrop-blur-sm border border-gray-700 p-1 z-10">
                        {onMoveLeft && <button onClick={onMoveLeft} className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white cursor-pointer"><ArrowLeft size={14}/></button>}
                        {onMoveRight && <button onClick={onMoveRight} className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white cursor-pointer"><ArrowRight size={14}/></button>}
                        <div className="w-px h-4 bg-gray-700 mx-1" />
                        <button onClick={onEdit} className="p-1.5 hover:bg-blue-900/50 hover:text-blue-400 rounded text-gray-400 cursor-pointer"><Pencil size={14}/></button>
                        <button onClick={onRemove} className="p-1.5 hover:bg-red-900/50 hover:text-red-400 rounded text-gray-400 cursor-pointer"><Trash2 size={14}/></button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 min-h-[300px] w-full overflow-hidden">
                {loading ? (
                    <div className="h-full flex items-center justify-center">
                        <Loader2 className="animate-spin text-gray-600" />
                    </div>
                ) : (
                    <div className="h-full w-full">
                        {config.type === 'stat-single' && renderStatSingle()}
                        {config.type === 'stat-list' && renderStatList()}
                        {config.type === 'graph-bar' && renderBarChart()}
                        {config.type === 'graph-pie' && renderPieChart()}
                        {config.type === 'graph-line' && renderLineChart()}
                        {config.type === 'graph-area' && renderAreaChart()}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}