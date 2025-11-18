import React from 'react';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
    return (
        <div className="border-b border-gray-700 pb-4">
            <h1 className="text-3xl font-bold text-white">{title}</h1>
            {subtitle && (
                <p className="mt-1 text-lg text-gray-400">{subtitle}</p>
            )}
        </div>
    );
}