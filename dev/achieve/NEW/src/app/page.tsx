export default function LandingPage() {
    return (
        <main className="container flex items-center justify-center min-h-screen py-16">
            <div className="glass-panel animate-fade-in p-12 mb-8 max-w-2xl text-center">
                <h1 className="text-3xl mb-4 text-brand-gradient">
                    UHI Portal
                </h1>
                <p className="text-xl text-muted mb-8">
                    Secure coordination platform for humanitarian operations.
                </p>
                <div className="flex justify-center gap-4">
                    <a href="/auth/login" className="glass-button no-underline inline-block">Login</a>
                    <a href="/dashboard" className="glass-button bg-transparent border-primary text-foreground no-shadow no-underline inline-block">
                        Preview Dashboard
                    </a>
                </div>
            </div>
        </main>
    );
}
