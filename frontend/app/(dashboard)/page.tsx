import { PageHeader } from '@/components/UI/PageHeader';
import { Rss } from 'lucide-react';

// TODO: Fetch real server activity logs
async function getServerActivity() {
    return [
        { id: 1, time: '10:45:02', service: 'JobScheduler', message: 'Triggered run for spotify' },
        { id: 2, time: '10:45:00', service: 'API', message: 'GET /api/sources' },
        { id: 3, time: '10:44:30', service: 'DriverRegistry', message: 'Loaded 3 drivers' },
    ];
}


export default async function HomePage() {
    const logs = await getServerActivity();

    return (
        <div className="p-8">
            <PageHeader title="Welcome" subtitle="Your lifelogging dashboard." />

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">

                {/* Left Column: Quick Actions */}
                <div className="rounded-lg bg-gray-900/50 shadow-lg">
                    <div className="p-6">
                        <h3 className="text-lg font-medium text-white">Quick Actions</h3>
                        <p className="mt-1 text-sm text-gray-400">Manage your system.</p>
                        {/* TODO: * Implement action buttons */}
                    </div>
                </div>

                {/* Right Column: Server Activity */}
                <div className="rounded-lg bg-gray-900/50 shadow-lg">
                    <div className="p-6">
                        <div className="flex items-center space-x-2">
                            <Rss className="h-5 w-5 text-gray-400" />
                            <h3 className="text-lg font-medium text-white">Recent Server Activity</h3>
                        </div>
                        <p className="mt-1 text-sm text-gray-400">Live feed of backend operations.</p>
                        <ul className="mt-4 space-y-3 font-mono text-sm">
                            {logs.map((log) => (
                                <li key={log.id} className="flex space-x-3">
                                    <span className="text-gray-500">{log.time}</span>
                                    <span className="text-blue-400">[{log.service}]</span>
                                    <span className="text-gray-300">{log.message}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}