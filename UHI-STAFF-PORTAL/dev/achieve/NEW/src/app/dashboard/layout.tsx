import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-transparent">
            <Sidebar />
            <Header />
            <main className="ml-64 pt-16 p-6 min-h-screen">
                <div className="glass-panel min-h-[calc(100vh-6rem)] p-6 animate-fade-in delay-100">
                    {children}
                </div>
            </main>
        </div>
    );
}
