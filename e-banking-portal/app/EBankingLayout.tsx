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
    const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

    // Don't show layout on auth pages
    if (pathname?.includes('/auth/')) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-off-white/50 dark:bg-background">
            {/* Sticky Header */}
            <Header
                leftSidebarOpen={leftSidebarOpen}
                rightSidebarOpen={rightSidebarOpen}
                onLeftSidebarToggle={() => setLeftSidebarOpen(!leftSidebarOpen)}
                onRightSidebarToggle={() => setRightSidebarOpen(!rightSidebarOpen)}
            />

            {/* Left Sidebar */}
            <LeftSidebar isOpen={leftSidebarOpen} />

            {/* Right Sidebar */}
            <RightSidebar isOpen={rightSidebarOpen} />

            {/* Main Content Area */}
            <main
                className={cn(
                    "transition-all duration-300 ease-in-out pt-6 px-4 md:px-8 pb-10 min-h-[calc(100vh-4rem)]",
                    leftSidebarOpen ? "ml-64" : "ml-20",
                    rightSidebarOpen ? "mr-[300px]" : "mr-20"
                )}
            >
                <div className="max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
