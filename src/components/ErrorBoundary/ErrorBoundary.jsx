import { Component } from 'react';

/**
 * Catches render/lifecycle errors in any child page and shows a recoverable
 * fallback instead of a blank screen. React only supports error boundaries
 * as class components — there's no hook equivalent (as of React 18).
 *
 * Wrapped around <Outlet /> in MainLayout, so a crash in one page doesn't
 * take out the sidebar/nav shell along with it — the person can still
 * navigate elsewhere.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // In a real deployment this would also report to a logging service.
    console.error('SmartDesk UI crashed:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="hud-panel flex flex-col items-center gap-3 p-8 text-center">
          <p className="font-mono text-[11px] uppercase tracking-widest text-status-critical">
            Something went wrong
          </p>
          <h2 className="font-display text-lg font-semibold text-heading">
            This page hit an unexpected error
          </h2>
          <p className="max-w-sm text-sm text-muted">
            You can try again, or head back to the Dashboard. If this keeps happening,
            it's worth flagging to the team.
          </p>
          <div className="mt-2 flex gap-3">
            <button
              onClick={this.handleReset}
              className="rounded-md border border-border px-4 py-2 text-sm text-ghost/80 transition-colors hover:bg-white/5"
            >
              Try Again
            </button>
            <a
              href="/"
              className="rounded-md bg-signal px-4 py-2 text-sm font-medium text-onAccent shadow-glow-sm"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
