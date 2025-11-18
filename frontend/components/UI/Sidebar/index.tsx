'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Clock, Database, BarChart2, LucideIcon } from 'lucide-react';

interface NavItem {
    name: string;
    href: string;
    icon: LucideIcon;
}

const navItems: NavItem[] = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Analytics', href: '/analytics', icon: BarChart2 },
    { name: 'Search', href: '/search', icon: Search },
    { name: 'Timeline', href: '/timeline', icon: Clock },
    { name: 'Data Sources', href: '/sources', icon: Database },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <nav className="flex h-full w-64 flex-col bg-gray-900 p-4">
            <div className="mb-8">
                <h1 className="text-xl font-bold text-white">Lifelog Dashboard</h1>
            </div>
            <ul className="flex flex-col space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <li key={item.name}>
                            <Link
                                href={item.href}
                                className={`
                  flex items-center space-x-3 rounded-md px-3 py-2
                  font-medium transition-colors
                  ${
                                    isActive
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                                }
                `}
                            >
                                <item.icon className="h-5 w-5" />
                                <span>{item.name}</span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}