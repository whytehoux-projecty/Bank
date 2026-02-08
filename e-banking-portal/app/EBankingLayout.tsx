'use client';

import { ReactNode, useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Header } from '@/components/layout/Header';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { RightSidebar } from '@/components/layout/RightSidebar';

export default function EBankingLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

    // Don't show layout on auth pages
    if (pathname?.includes('/auth/')) {
        return <div className="min-h-screen bg-background">{children}</div>;
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <div className="flex pt-[70px] h-screen overflow-hidden">
                <LeftSidebar
                    isOpen={leftSidebarOpen}
                    onToggle={() => setLeftSidebarOpen(!leftSidebarOpen)}
                />

                <main className={cn(
                    "flex-1 overflow-y-auto transition-all duration-300 ease-in-out px-4 py-6 md:px-8",
                    // Dynamic padding based on sidebar states
                    leftSidebarOpen ? "md:ml-64" : "md:ml-16",
                    isRightSidebarOpen ? "md:mr-80" : "md:mr-16"
                )}>
                    {children}
                </main>

                <RightSidebar
                    isOpen={isRightSidebarOpen}
                    onToggle={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                />
            </div>
        </div>
    );
}
