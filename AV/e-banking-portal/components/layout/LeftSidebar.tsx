"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    LayoutDashboard,
    ArrowLeftRight,
    Receipt,
    Wallet,
    CreditCard,
    FileText,
    Users,
    Settings,
    HelpCircle,
    LogOut,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { VintageIcon } from '@/components/ui/vintage-icon';

interface LeftSidebarProps {
    isOpen: boolean;
    onToggle: () => void;
}

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Transfer', href: '/transfer', icon: ArrowLeftRight },
    { name: 'Transactions', href: '/transactions', icon: Receipt },
    { name: 'Accounts', href: '/accounts', icon: Wallet },
    { name: 'Cards', href: '/cards', icon: CreditCard },
    { name: 'Bills', href: '/bills', icon: FileText },
    { name: 'Beneficiaries', href: '/beneficiaries', icon: Users },
    { name: 'Statements', href: '/statements', icon: FileText },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Support', href: '/support', icon: HelpCircle },
];

export function LeftSidebar({ isOpen, onToggle }: LeftSidebarProps) {
    const pathname = usePathname();

    return (
        <aside
            className={cn(
                "fixed top-[70px] left-0 z-40 h-[calc(100vh-70px)] border-r bg-background transition-all duration-300 ease-in-out",
                isOpen ? "w-64" : "w-16"
            )}
        >
            {/* Toggle Button - positioned at the edge of sidebar */}
            <button
                onClick={onToggle}
                className="absolute -right-3 top-6 z-50 flex h-6 w-6 items-center justify-center rounded-full bg-[#D4AF7A] text-[#3D3D3D] shadow-md hover:bg-[#B8941F] transition-colors"
                aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
                {isOpen ? (
                    <ChevronLeft className="h-4 w-4" />
                ) : (
                    <ChevronRight className="h-4 w-4" />
                )}
            </button>

            <ScrollArea className="h-full py-6">
                <nav className="space-y-2 px-2">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                                    isActive
                                        ? "bg-accent text-accent-foreground"
                                        : "text-muted-foreground",
                                    !isOpen && "justify-center px-0"
                                )}
                            >
                                <VintageIcon
                                    icon={item.icon}
                                    size="sm"
                                    variant={isActive ? "green" : "charcoal"}
                                    className={cn(!isOpen && "mx-auto")}
                                />
                                {isOpen && <span>{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout Separate Section */}
                <div className="absolute bottom-4 left-0 w-full px-2">
                    <Link
                        href={process.env.NEXT_PUBLIC_CORPORATE_URL || 'http://localhost:3002'}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-destructive/10 hover:text-destructive",
                            "text-muted-foreground",
                            !isOpen && "justify-center px-0"
                        )}
                    >
                        <VintageIcon
                            icon={LogOut}
                            size="sm"
                            variant="charcoal"
                            className={cn(!isOpen && "mx-auto")}
                        />
                        {isOpen && <span>Logout</span>}
                    </Link>
                </div>
            </ScrollArea>
        </aside>
    );
}
