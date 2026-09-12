import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { NetworkStatus } from '../components/NetworkStatus/NetworkStatus';
import { ThemeToggle } from '../components/ThemeToggle/ThemeToggle';
import { ErrorBoundary } from '../components/ErrorBoundary/ErrorBoundary';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/categories', label: 'Categories' },
  { to: '/ai-assistant', label: 'AI Assistant' },
  { to: '/search', label: 'Search' },
  { to: '/history', label: 'History' },
];

export function MainLayout() {
  const location = useLocation();

  return (
    <div className="flex h-full min-h-screen bg-ink">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <TopBar />
        <main className="flex-1 p-6">
          <ErrorBoundary key={location.pathname}>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-panel/40 backdrop-blur-sm md:flex">
      <div className="border-b border-border px-5 py-6">
        <p className="font-display text-lg font-semibold tracking-tight text-heading">
          Smart<span className="text-signal text-glow">Desk</span>
        </p>
        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          IT Assistant
        </p>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `relative block rounded-md px-3 py-2 font-mono text-sm tracking-wide transition-colors ${
                isActive
                  ? 'bg-signal/10 text-signal shadow-glow-sm'
                  : 'text-ghost/70 hover:bg-white/5 hover:text-ghost'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 bg-signal shadow-glow-sm" />
                )}
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

function TopBar() {
  return (
    <header className="flex items-center justify-between border-b border-border bg-ink/80 px-6 py-4 backdrop-blur-sm">
      <h1 className="font-display text-base font-semibold text-heading">
        SmartDesk Assistant
      </h1>
      <div className="flex items-center gap-3">
        <NetworkStatus />
        <ThemeToggle />
      </div>
    </header>
  );
}
