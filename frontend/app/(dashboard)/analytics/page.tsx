'use client';
import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/UI/PageHeader';
import { Plus } from 'lucide-react';
import { AddWidgetModal} from "@/components/Analytics/AddWidget";
import { DynamicWidget} from "@/components/Analytics/Widget";
import { WidgetConfig } from '@/types/types';

const STORAGE_KEY = 'lifelog_dashboard_layout_v2';

const DEFAULT_WIDGETS: WidgetConfig[] = [
    {
        id: 'def-1',
        title: 'Total Events',
        type: 'stat-single',
        size: 'half',
        streams: [{ id: 's1', label: 'Events', operation: 'count', filters: { dateRange: 'all' } }]
    },
    {
        id: 'def-2',
        title: 'Platform Distribution',
        description: 'Events by source driver',
        type: 'graph-pie',
        size: 'half',
        streams: [
            { id: 's2', label: 'Spotify', color: '#1DB954', operation: 'count', filters: { sourceDriverId: 'spotify' } },
            { id: 's3', label: 'Google', color: '#4285F4', operation: 'count', filters: { sourceDriverId: 'google-takeout' } },
            { id: 's4', label: 'Apple', color: '#FA2D48', operation: 'count', filters: { sourceDriverId: 'apple-backup' } },
        ]
    },
    {
        id: 'def-3',
        title: 'Weekly Activity',
        description: 'Activity trends over the last 7 days',
        type: 'graph-area',
        size: 'full',
        streams: [
            { id: 's5', label: 'All Activity', color: '#8b5cf6', operation: 'count', filters: { dateRange: '7d' } }
        ]
    }
];

export default function AnalyticsPage() {
    const [widgets, setWidgets] = useState<WidgetConfig[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWidget, setEditingWidget] = useState<WidgetConfig | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setWidgets(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse saved layout', e);
                setWidgets(DEFAULT_WIDGETS);
            }
        } else {
            setWidgets(DEFAULT_WIDGETS);
        }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
        }
    }, [widgets, isLoaded]);

    const handleSaveWidget = (config: WidgetConfig) => {
        setWidgets(prev => {
            const exists = prev.find(w => w.id === config.id);
            if (exists) {
                // Update existing
                return prev.map(w => w.id === config.id ? config : w);
            } else {
                // Add new
                return [...prev, config];
            }
        });
        setEditingWidget(null);
    };

    const handleEditWidget = (config: WidgetConfig) => {
        setEditingWidget(config);
        setIsModalOpen(true);
    };

    const removeWidget = (id: string) => {
        if (confirm('Remove this widget?')) {
            setWidgets(prev => prev.filter(w => w.id !== id));
        }
    };

    const moveWidget = (index: number, direction: 'left' | 'right') => {
        const newWidgets = [...widgets];
        if (direction === 'left' && index > 0) {
            [newWidgets[index - 1], newWidgets[index]] = [newWidgets[index], newWidgets[index - 1]];
        } else if (direction === 'right' && index < newWidgets.length - 1) {
            [newWidgets[index + 1], newWidgets[index]] = [newWidgets[index], newWidgets[index + 1]];
        }
        setWidgets(newWidgets);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingWidget(null);
    };

    if (!isLoaded) return null;

    return (
        <div className="p-8 pb-32">
            <PageHeader title="Analytics Dashboard" subtitle="Customize your data views." />

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-min">
                {widgets.map((widget, index) => (
                    <div
                        key={widget.id}
                        className={`${widget.size === 'full' ? 'md:col-span-2 lg:col-span-4' : 'md:col-span-1 lg:col-span-2'}`}
                    >
                        <DynamicWidget
                            config={widget}
                            onRemove={() => removeWidget(widget.id)}
                            onEdit={() => handleEditWidget(widget)}
                            onMoveLeft={index > 0 ? () => moveWidget(index, 'left') : undefined}
                            onMoveRight={index < widgets.length - 1 ? () => moveWidget(index, 'right') : undefined}
                        />
                    </div>
                ))}

                <div className="md:col-span-1 lg:col-span-2 min-h-[200px]">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full h-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-700 bg-gray-900/30 text-gray-500 hover:bg-gray-800 hover:border-blue-500 hover:text-blue-400 transition-all group cursor-pointer"
                    >
                        <div className="bg-gray-800 p-3 rounded-full mb-3 group-hover:bg-blue-500/20 transition-colors">
                            <Plus className="h-6 w-6" />
                        </div>
                        <span className="font-medium">Add Widget</span>
                    </button>
                </div>
            </div>

            <AddWidgetModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSave={handleSaveWidget}
                widgetToEdit={editingWidget}
            />
        </div>
    );
}