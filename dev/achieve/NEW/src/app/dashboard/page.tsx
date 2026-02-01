export default function Home() {
  return (
    <main className="container py-16">
      <div className="glass-panel animate-fade-in p-12 mb-8">
        <h1 className="text-3xl mb-4 text-brand-gradient">
          Welcome to UHI Portal
        </h1>
        <p className="text-xl text-muted max-w-lg">
          Secure coordination platform for humanitarian operations in challenging environments.
        </p>
        <div className="mt-8 flex gap-4">
          <button className="glass-button">Access Dashboard</button>
          <button className="glass-button bg-transparent border-primary text-foreground no-shadow">
            Documentation
          </button>
        </div>
      </div>

      <div className="grid-cols-3 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        {/* Widget 1 */}
        <div className="glass-panel p-6">
          <h3 className="mb-2">My Missions</h3>
          <div className="text-3xl font-bold text-foreground">2</div>
          <p className="text-muted">Active deployments</p>
        </div>

        {/* Widget 2 */}
        <div className="glass-panel p-6">
          <h3 className="mb-2">Security Status</h3>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-3 h-3 rounded-full bg-success block"></span>
            <span className="font-semibold text-success">Safe (Level 1)</span>
          </div>
          <p className="mt-2 text-sm text-muted">
            Updated 2 hours ago
          </p>
        </div>

        {/* Widget 3 */}
        <div className="glass-panel p-6">
          <h3 className="mb-2">Recent Alerts</h3>
          <p className="text-muted text-sm">
            No critical incidents reported in your region.
          </p>
          <a href="#" className="block mt-4 text-primary font-semibold text-sm">
            View Intelligence &rarr;
          </a>
        </div>
      </div>
    </main>
  );
}
