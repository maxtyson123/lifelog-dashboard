import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/Card';
import { LucideIcon } from 'lucide-react';
import React from 'react';

interface StatCardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    change?: string;
    isLoading?: boolean;
}

export function StatCard({ title, value, icon: Icon, change, isLoading = false }: StatCardProps) {
    if (isLoading) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">{title}</CardTitle>
                    <Icon className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                    {/* Skeleton Loader */}
                    <div className="h-8 w-3/4 animate-pulse rounded-md bg-gray-700" />
                    <div className="mt-2 h-4 w-1/2 animate-pulse rounded-md bg-gray-700" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">{title}</CardTitle>
                <Icon className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-white">{value}</div>
                {change && (
                    <p className="text-xs text-gray-400">{change}</p>
                )}
            </CardContent>
        </Card>
    );
}