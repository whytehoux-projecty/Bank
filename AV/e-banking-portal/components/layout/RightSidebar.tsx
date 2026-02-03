"use client";

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import {
    ShieldCheck,
    PiggyBank,
    Banknote,
    BellRing,
    ChevronRight,
    ChevronLeft,
    Briefcase
} from 'lucide-react';
import { VintageIcon } from '@/components/ui/vintage-icon';

interface RightSidebarProps {
    isOpen: boolean;
    onToggle: () => void;
}

const extraServices = [
    { name: 'Vault Premium +', href: '#', icon: ShieldCheck, desc: 'Exclusive security features' },
    { name: 'Savings & Goals', href: '#', icon: PiggyBank, desc: 'High-yield savings' },
    { name: 'Personal Loans', href: '#', icon: Banknote, desc: 'Low interest rates' },
    { name: 'Business Suite', href: '#', icon: Briefcase, desc: 'For your enterprise' },
];

export function RightSidebar({ isOpen, onToggle }: RightSidebarProps) {
    return (
        <aside
            className={cn(
                "fixed top-[70px] right-0 z-40 h-[calc(100vh-70px)] border-l bg-background transition-all duration-300 ease-in-out",
                isOpen ? "w-[300px]" : "w-16"
            )}
        >
            {/* Toggle Button - positioned at the left edge of sidebar */}
            <button
                onClick={onToggle}
                className="absolute -left-3 top-6 z-50 flex h-6 w-6 items-center justify-center rounded-full bg-[#D4AF7A] text-[#3D3D3D] shadow-md hover:bg-[#B8941F] transition-colors"
                aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
                {isOpen ? (
                    <ChevronRight className="h-4 w-4" />
                ) : (
                    <ChevronLeft className="h-4 w-4" />
                )}
            </button>

            <ScrollArea className="h-full">
                <div className={cn("p-6", !isOpen && "px-2 py-6 flex flex-col items-center")}>

                    {/* Profile Section */}
                    <div className={cn("flex items-center gap-4 mb-8", !isOpen && "flex-col mb-4")}>
                        <Avatar className="h-12 w-12 border-2 border-secondary">
                            <AvatarImage src="/images/user-placeholder.jpg" />
                            <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        {isOpen && (
                            <div className="overflow-hidden">
                                <h3 className="font-playfair font-bold text-lg truncate">John Doe</h3>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-secondary border-secondary text-[10px] h-5 px-1.5">
                                        PREMIUM
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">Personal</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Alert Box (Replacing Notification Icon) */}
                    {isOpen ? (
                        <div className="mb-8 p-4 rounded-xl bg-accent border border-accent">
                            <div className="flex items-start gap-3">
                                <BellRing className="w-5 h-5 text-secondary mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-sm">Security Alert</h4>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        New login detected from Safari on iPhone near London, UK.
                                    </p>
                                    <div className="mt-3 flex gap-2">
                                        <Button variant="outline" size="small" className="h-7 text-xs px-2">Verify</Button>
                                        <Button variant="ghost" size="small" className="h-7 text-xs px-2">Dismiss</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-6 flex justify-center w-full">
                            <div className="relative">
                                <VintageIcon icon={BellRing} size="sm" variant="gold" />
                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF7A] opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#D4AF7A]"></span>
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Separator */}
                    <div className="h-px w-full bg-border mb-6"></div>

                    {/* Services Section */}
                    <div className="space-y-4">
                        {isOpen && <h4 className="text-sm font-semibold text-muted-foreground px-1">Discover Services</h4>}

                        <div className="space-y-2">
                            {extraServices.map((service) => (
                                <Link
                                    key={service.name}
                                    href={service.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-accent group",
                                        !isOpen && "justify-center p-2"
                                    )}
                                >
                                    <VintageIcon icon={service.icon} size="sm" variant="charcoal" />

                                    {isOpen && (
                                        <div className="flex-1">
                                            <h5 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                                                {service.name}
                                            </h5>
                                            <p className="text-[10px] text-muted-foreground">{service.desc}</p>
                                        </div>
                                    )}
                                    {isOpen && <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary" />}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Promo Box specific to Sidebar */}
                    {isOpen && (
                        <div className="mt-8 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
                            <h4 className="font-playfair font-bold text-primary mb-1">Upgrade to Metal</h4>
                            <p className="text-xs text-muted-foreground mb-3">Get 3% cashback and exclusive concierge service.</p>
                            <Button className="w-full h-8 text-xs bg-primary text-white hover:bg-primary/90">Learn More</Button>
                        </div>
                    )}

                </div>
            </ScrollArea>
        </aside>
    );
}
