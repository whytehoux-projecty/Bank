'use client';

export default function Header() {
    return (
        <header className="fixed top-0 z-30 ml-64 flex w-[calc(100%-16rem)] h-16 items-center justify-between border-b border-white/20 bg-white/70 backdrop-blur-lg px-6">
            <div className="flex items-center">
                <span className="text-sm text-muted">Organization: </span>
                <span className="ml-2 font-semibold text-foreground flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Global Relief Corps
                </span>
            </div>

            <div className="flex items-center gap-4">
                <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
                    Notifications
                </button>
                <button className="glass-button py-1 px-3 text-sm">
                    Check-in
                </button>
            </div>
        </header>
    );
}
