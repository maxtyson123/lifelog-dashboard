import React from 'react';
import {Sidebar} from '@/components/UI/Sidebar';

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-full">
            <Sidebar/>
            <main className="flex-1 overflow-y-auto bg-gray-800">
                {/* Main content area */}
                {children}
            </main>
        </div>
    );
}