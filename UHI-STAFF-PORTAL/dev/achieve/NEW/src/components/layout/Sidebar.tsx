'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Map, Users, MessageSquare, FileText } from 'lucide-react';

const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Operations', href: '/operations', icon: Map },
    { name: 'Directory', href: '/directory', icon: Users },
    { name: 'Messages', href: '/messages', icon: MessageSquare },
    { name: 'Documents', href: '/documents', icon: FileText },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/20 bg-white/10 backdrop-blur-xl transition-transform">
            <div className="flex h-16 items-center justify-center border-b border-white/20">
                <h1 className="text-2xl font-bold text-brand-gradient">UHI Portal</h1>
            </div>
            <div className="overflow-y-auto py-4">
                <ul className="space-y-2 font-medium">
                    {navItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        const Icon = item.icon;
                        return (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center p-3 mx-2 rounded-lg transition-colors group ${isActive
                                            ? 'bg-primary/10 text-primary border border-primary/20'
                                            : 'text-muted-foreground hover:bg-white/10 hover:text-foreground'
                                        }`}
                                >
                                    <Icon className="w-5 h-5 transition duration-75" />
                                    <span className="ms-3">{item.name}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
            <div className="absolute bottom-0 w-full p-4 border-t border-white/20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold">
                        JS
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-foreground">John Smith</p>
                        <p className="text-xs text-muted">Field Officer</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
