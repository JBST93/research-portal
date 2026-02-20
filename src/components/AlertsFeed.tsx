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
  high: "text-bb-red",
  medium: "text-bb-amber",
  low: "text-bb-green",
};

export default function AlertsFeed({ alerts }: AlertsFeedProps) {
  return (
    <div className="bg-bb-panel border border-bb-border">
      <div className="bb-header flex items-center justify-between">
        <span>Alerts</span>
        {alerts.length === 0 && (
          <span className="text-bb-green text-xxs normal-case tracking-normal font-normal">
            All clear
          </span>
        )}
      </div>
      {alerts.length > 0 && (
        <div className="divide-y divide-bb-border">
          {alerts.map((alert, i) => (
            <Link
              key={i}
              href={`/protocol/${alert.slug}`}
              className="flex items-center gap-3 px-3 py-1.5 hover:bg-bb-surface transition text-xs"
            >
              <span className={`font-bold ${severityColor[alert.severity]}`}>
                [{severityIcon[alert.severity]}]
              </span>
              <span className="text-bb-white font-semibold">
                {alert.protocol}
              </span>
              <span className="text-bb-muted">{alert.message}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
