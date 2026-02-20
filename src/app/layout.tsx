import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DeFi Risk Terminal",
  description: "Bloomberg-style DeFi protocol risk monitoring dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-bb-bg min-h-screen antialiased">
        {/* Top status bar */}
        <header className="bg-bb-header border-b border-bb-border px-4 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-2">
              <span className="text-bb-orange font-bold text-sm tracking-wide uppercase">
                DeFi Terminal
              </span>
            </a>
            <nav className="flex items-center gap-1">
              <a
                href="/"
                className="text-xxs text-bb-muted hover:text-bb-orange px-2 py-0.5 uppercase tracking-wider transition"
              >
                Watchlist
              </a>
              <span className="text-bb-dim">|</span>
              <a
                href="/protocols"
                className="text-xxs text-bb-muted hover:text-bb-orange px-2 py-0.5 uppercase tracking-wider transition"
              >
                Top 100
              </a>
              <span className="text-bb-dim">|</span>
              <a
                href="/dex"
                className="text-xxs text-bb-muted hover:text-bb-orange px-2 py-0.5 uppercase tracking-wider transition"
              >
                DEX Volumes
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="live-dot inline-block w-1.5 h-1.5 rounded-full bg-bb-green" />
            <span className="text-xxs text-bb-muted uppercase tracking-wider">
              Live
            </span>
            <span className="text-xxs text-bb-dim">|</span>
            <span className="text-xxs text-bb-dim">
              DeFiLlama + Snapshot + Hyperliquid
            </span>
          </div>
        </header>
        <main className="max-w-[1600px] mx-auto px-4 py-3">{children}</main>
        {/* Bottom status bar */}
        <footer className="fixed bottom-0 left-0 right-0 bg-bb-header border-t border-bb-border px-4 py-1 flex items-center justify-between">
          <span className="text-xxs text-bb-dim">
            DeFi Risk Terminal v1.0
          </span>
          <span className="text-xxs text-bb-dim">
            Auto-refresh: 5min | All data public
          </span>
        </footer>
      </body>
    </html>
  );
}
