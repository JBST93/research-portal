import Link from "next/link";
import { Alert } from "@/types";

interface AlertsFeedProps {
  alerts: Alert[];
}

const severityIcon: Record<string, string> = {
  high: "!!",
  medium: "!",
  low: "~",
};

const severityColor: Record<string, string> = {
  high: "text-terminal-red border-terminal-red/30 bg-terminal-red/5",
  medium: "text-terminal-amber border-terminal-amber/30 bg-terminal-amber/5",
  low: "text-terminal-green border-terminal-green/30 bg-terminal-green/5",
};

export default function AlertsFeed({ alerts }: AlertsFeedProps) {
  if (alerts.length === 0) {
    return (
      <div className="border border-terminal-border p-4">
        <div className="text-xs text-terminal-muted uppercase tracking-wider mb-2">
          Alerts
        </div>
        <div className="text-terminal-green text-sm font-mono">
          All clear — no alerts
        </div>
      </div>
    );
  }

  return (
    <div className="border border-terminal-border p-4">
      <div className="text-xs text-terminal-muted uppercase tracking-wider mb-3">
        Alerts ({alerts.length})
      </div>
      <div className="space-y-2">
        {alerts.map((alert, i) => (
          <Link
            key={i}
            href={`/protocol/${alert.slug}`}
            className={`block border px-3 py-2 font-mono text-sm ${severityColor[alert.severity]} hover:brightness-125 transition`}
          >
            <span className="opacity-60">[{severityIcon[alert.severity]}]</span>{" "}
            <span className="font-semibold">{alert.protocol}</span> —{" "}
            {alert.message}
          </Link>
        ))}
      </div>
    </div>
  );
}
