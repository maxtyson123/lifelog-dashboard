import React, { useState, useEffect } from 'react';
import { X, Plus, BarChart, PieChart, Hash, Activity, List, Trash2, Layers } from 'lucide-react';
import { Button } from '@/components/UI/Button';
import { WidgetConfig, WidgetType, WidgetSize, DataStream } from '@/types/types';
import { v4 as uuidv4 } from 'uuid';

interface Template extends Partial<WidgetConfig> { category: string; }

const TEMPLATES: Template[] = [
    // General
    { category: 'General', title: 'Total Events', description: 'All indexed activity', type: 'stat-single', size: 'half', streams: [{ id: 't1', label: 'Events', operation: 'count', filters: { dateRange: 'all' } }] },
    { category: 'General', title: 'Activity Trends', description: 'Events over the last 7 days', type: 'graph-line', size: 'full', streams: [{ id: 't2', label: 'Activity', color: '#3b82f6', operation: 'count', filters: { dateRange: '7d' } }] },

    // Music
    { category: 'Music', title: 'Music Sources', description: 'Spotify vs Apple vs Others', type: 'graph-pie', size: 'half', streams: [
            { id: 'm1', label: 'Spotify', color: '#1DB954', operation: 'count', filters: { sourceDriverId: 'spotify', eventType: 'MUSIC_LISTEN' } },
            { id: 'm2', label: 'Apple Music', color: '#FA2D48', operation: 'count', filters: { sourceDriverId: 'apple-music', eventType: 'MUSIC_LISTEN' } },
            { id: 'm3', label: 'Other', color: '#888888', operation: 'count', filters: { eventType: 'MUSIC_LISTEN' } }
        ]
    },
    { category: 'Music', title: 'Top Artists', description: 'Most played artists this month', type: 'stat-list', size: 'half', streams: [{ id: 'm4', label: 'Artists', operation: 'count', filters: { eventType: 'MUSIC_LISTEN', dateRange: '30d' } }] },

    // Location
    { category: 'Location', title: 'Movement History', description: 'Location pings over time', type: 'graph-area', size: 'full', streams: [{ id: 'l1', label: 'GPS Pings', color: '#10b981', operation: 'count', filters: { eventType: 'LOCATION' } }] },
];

const CATEGORIES = ['General', 'Music', 'Location'];

interface AddWidgetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (config: WidgetConfig) => void;
    widgetToEdit?: WidgetConfig | null; // New prop for editing
}

export function AddWidgetModal({ isOpen, onClose, onSave, widgetToEdit }: AddWidgetModalProps) {
    const [mode, setMode] = useState<'predefined' | 'custom'>('predefined');
    const [activeCategory, setActiveCategory] = useState('General');

    // Custom Builder State
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [size, setSize] = useState<WidgetSize>('half');
    const [type, setType] = useState<WidgetType>('stat-single');
    const [streams, setStreams] = useState<DataStream[]>([]);

    // Reset or Populate on Open
    useEffect(() => {
        if (isOpen) {
            if (widgetToEdit) {
                // Edit Mode: Populate fields
                setMode('custom');
                setTitle(widgetToEdit.title);
                setDesc(widgetToEdit.description || '');
                setSize(widgetToEdit.size);
                setType(widgetToEdit.type);
                setStreams(JSON.parse(JSON.stringify(widgetToEdit.streams)));
            } else {
                // Create Mode: Reset defaults
                setMode('predefined');
                setTitle('');
                setDesc('');
                setSize('half');
                setType('stat-single');
                setStreams([{ id: uuidv4(), label: 'Series 1', operation: 'count', filters: { dateRange: 'all', eventType: 'ALL', sourceDriverId: 'ALL' } }]);
            }
        }
    }, [isOpen, widgetToEdit]);

    const handleSave = (template?: Partial<WidgetConfig>) => {
        const idToUse = widgetToEdit ? widgetToEdit.id : uuidv4();

        if (template) {
            onSave({
                id: idToUse,
                title: template.title!,
                description: template.description || '',
                size: template.size || 'half',
                type: template.type || 'stat-single',
                streams: template.streams || []
            });
        } else {
            if (!title) return;

            const cleanedStreams = streams.map(s => ({
                ...s,
                filters: {
                    ...s.filters,
                    eventType: s.filters.eventType === 'ALL' ? undefined : s.filters.eventType,
                    sourceDriverId: s.filters.sourceDriverId === 'ALL' ? undefined : s.filters.sourceDriverId,
                }
            }));

            onSave({
                id: idToUse,
                title,
                description: desc,
                size,
                type,
                streams: cleanedStreams
            });
        }
        onClose();
    };

    const updateStream = (id: string, field: keyof DataStream | 'filters', value: any, filterKey?: keyof any) => {
        setStreams(prev => prev.map(s => {
            if (s.id !== id) return s;
            if (field === 'filters' && filterKey) {
                return { ...s, filters: { ...s.filters, [filterKey]: value } };
            }
            return { ...s, [field]: value };
        }));
    };

    const addStream = () => {
        setStreams(prev => [
            ...prev,
            { id: uuidv4(), label: `Series ${prev.length + 1}`, operation: 'count', filters: { dateRange: 'all', eventType: 'ALL', sourceDriverId: 'ALL' } }
        ]);
    };

    const removeStream = (id: string) => {
        if (streams.length > 1) {
            setStreams(prev => prev.filter(s => s.id !== id));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-4xl rounded-xl bg-gray-900 p-6 shadow-2xl border border-gray-700 max-h-[90vh] overflow-hidden flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-4 shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-white">{widgetToEdit ? 'Edit Widget' : 'Add Analytics Widget'}</h2>
                        <p className="text-sm text-gray-400">{widgetToEdit ? 'Modify your data view.' : 'Create a new data view.'}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer"><X className="h-6 w-6" /></button>
                </div>

                {/* Mode Switcher (Only show in Create mode) */}
                {!widgetToEdit && (
                    <div className="flex space-x-1 mb-6 bg-gray-800 p-1 rounded-lg self-start shrink-0">
                        <button onClick={() => setMode('predefined')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${mode === 'predefined' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'}`}>
                            Templates
                        </button>
                        <button onClick={() => setMode('custom')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${mode === 'custom' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'}`}>
                            Custom Builder
                        </button>
                    </div>
                )}

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto pr-2">

                    {mode === 'predefined' && (
                        <div>
                            {/* Category Tabs */}
                            <div className="flex gap-4 border-b border-gray-800 mb-6 overflow-x-auto">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className={`pb-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${activeCategory === cat ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {TEMPLATES.filter(t => t.category === activeCategory).map((widget, idx) => (
                                    <div key={idx} className="group p-4 rounded-lg border border-gray-700 bg-gray-800/30 hover:bg-gray-800 hover:border-blue-500/50 cursor-pointer transition-all" onClick={() => handleSave(widget)}>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 rounded bg-gray-700 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                                                {widget.type === 'stat-single' && <Hash className="h-5 w-5"/>}
                                                {widget.type === 'graph-bar' && <BarChart className="h-5 w-5"/>}
                                                {widget.type === 'graph-pie' && <PieChart className="h-5 w-5"/>}
                                                {widget.type === 'graph-line' && <Activity className="h-5 w-5"/>}
                                                {widget.type === 'stat-list' && <List className="h-5 w-5"/>}
                                            </div>
                                            <h3 className="font-bold text-white">{widget.title}</h3>
                                        </div>
                                        <p className="text-sm text-gray-400">{widget.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {mode === 'custom' && (
                        <div className="space-y-8">

                            {/* Global Config */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Widget Title</label>
                                        <input value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:border-blue-500 focus:outline-none" placeholder="e.g., Social Media Trends" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Description</label>
                                        <input value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:border-blue-500 focus:outline-none" placeholder="Optional details" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Visualization</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { id: 'stat-single', icon: Hash, label: 'Number' },
                                                { id: 'stat-list', icon: List, label: 'List' },
                                                { id: 'graph-bar', icon: BarChart, label: 'Bar' },
                                                { id: 'graph-pie', icon: PieChart, label: 'Pie' },
                                                { id: 'graph-line', icon: Activity, label: 'Line' },
                                                { id: 'graph-area', icon: Layers, label: 'Area' },
                                            ].map((t) => (
                                                <div
                                                    key={t.id}
                                                    onClick={() => setType(t.id as WidgetType)}
                                                    className={`p-2 rounded border cursor-pointer flex flex-col items-center justify-center gap-1 transition-all ${type === t.id ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-gray-700 bg-gray-800 text-gray-500 hover:bg-gray-700'}`}
                                                >
                                                    <t.icon className="h-4 w-4"/>
                                                    <span className="text-[10px] font-medium">{t.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Size</label>
                                        <div className="flex rounded-md shadow-sm" role="group">
                                            <button
                                                onClick={() => setSize('half')}
                                                className={`px-4 py-2 text-sm font-medium rounded-l-lg border cursor-pointer ${size === 'half' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'}`}
                                            >
                                                Half Width
                                            </button>
                                            <button
                                                onClick={() => setSize('full')}
                                                className={`px-4 py-2 text-sm font-medium rounded-r-lg border cursor-pointer ${size === 'full' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'}`}
                                            >
                                                Full Width
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Data Streams */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Data Streams</h3>
                                    <button onClick={addStream} className="text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium cursor-pointer">
                                        <Plus className="h-3 w-3" /> Add Stream
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {streams.map((stream, idx) => (
                                        <div key={stream.id} className="p-4 rounded bg-gray-800/50 border border-gray-700 flex flex-col md:flex-row gap-4 items-start">
                                            <div className="flex items-center gap-2 min-w-[30px]">
                                                <span className="text-xs text-gray-500 font-mono">#{idx + 1}</span>
                                            </div>

                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
                                                <input
                                                    value={stream.label}
                                                    onChange={(e) => updateStream(stream.id, 'label', e.target.value)}
                                                    className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
                                                    placeholder="Label"
                                                />

                                                <select
                                                    value={stream.filters.sourceDriverId || 'ALL'}
                                                    onChange={(e) => updateStream(stream.id, 'filters', e.target.value, 'sourceDriverId')}
                                                    className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-gray-300 cursor-pointer"
                                                >
                                                    <option value="ALL">All Sources</option>
                                                    <option value="spotify">Spotify</option>
                                                    <option value="apple-music">Apple Music</option>
                                                    <option value="google-takeout">Google Takeout</option>
                                                </select>

                                                <select
                                                    value={stream.filters.eventType || 'ALL'}
                                                    onChange={(e) => updateStream(stream.id, 'filters', e.target.value, 'eventType')}
                                                    className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-gray-300 cursor-pointer"
                                                >
                                                    <option value="ALL">All Types</option>
                                                    <option value="MUSIC_LISTEN">Music</option>
                                                    <option value="SEARCH">Search</option>
                                                    <option value="LOCATION">Location</option>
                                                </select>

                                                <select
                                                    value={stream.filters.dateRange || 'all'}
                                                    onChange={(e) => updateStream(stream.id, 'filters', e.target.value, 'dateRange')}
                                                    className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-gray-300 cursor-pointer"
                                                >
                                                    <option value="all">All Time</option>
                                                    <option value="30d">Last 30 Days</option>
                                                    <option value="7d">Last 7 Days</option>
                                                    <option value="24h">Last 24 Hours</option>
                                                </select>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {(type.startsWith('graph-') && type !== 'graph-bar') && (
                                                    <input
                                                        type="color"
                                                        value={stream.color || '#3b82f6'}
                                                        onChange={(e) => updateStream(stream.id, 'color', e.target.value)}
                                                        className="h-8 w-8 rounded cursor-pointer bg-transparent border-none"
                                                    />
                                                )}
                                                <button onClick={() => removeStream(stream.id)} className="p-2 text-gray-500 hover:text-red-400 transition-colors cursor-pointer">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Action */}
                {mode === 'custom' && (
                    <div className="mt-6 pt-4 border-t border-gray-800 shrink-0">
                        <Button className="w-full cursor-pointer" onClick={() => handleSave()} disabled={!title}>
                            {widgetToEdit ? 'Save Changes' : 'Create Widget'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}