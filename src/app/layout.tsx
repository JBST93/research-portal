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
      <body className="bg-terminal-bg min-h-screen antialiased">
        <header className="border-b border-terminal-border px-6 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <span className="text-terminal-green font-bold text-lg tracking-tight">
              DeFi Risk Terminal
            </span>
            <span className="text-xs text-terminal-dim border border-terminal-border px-2 py-0.5">
              v1.0
            </span>
          </a>
          <div className="text-xs text-terminal-dim font-mono">
            Data: DeFiLlama | Refresh: 5min
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-6 py-6">{children}</main>
      </body>
    </html>
  );
}
