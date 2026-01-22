"use client";

import Link from 'next/link';
import { Menu, Bell } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface HeaderProps {
    onLeftSidebarToggle: () => void;
    onRightSidebarToggle: () => void;
    leftSidebarOpen: boolean;
    rightSidebarOpen: boolean;
}

export function Header({
    onLeftSidebarToggle,
    onRightSidebarToggle,
    leftSidebarOpen,
    rightSidebarOpen
}: HeaderProps) {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center px-4 justify-between">

                {/* Left Side: Toggle & Logo */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="small"
                        onClick={onLeftSidebarToggle}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>

                    <Link href="/dashboard" className="flex items-center gap-2 font-playfair font-bold text-xl text-primary">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-sm">
                            AV
                        </div>
                        <span className="hidden md:inline-block">AURUM VAULT</span>
                    </Link>
                </div>

                {/* Right Side: Toggle & Notifications */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="small"
                        className="text-muted-foreground hover:text-foreground relative"
                    >
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-3 w-2 h-2 bg-secondary rounded-full border-2 border-background"></span>
                    </Button>

                    <Button
                        variant="ghost"
                        size="small"
                        onClick={onRightSidebarToggle}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </header>
    );
}
