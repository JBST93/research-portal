import { Proposal } from "@/types";

interface GovernanceFeedProps {
  proposals: Proposal[];
  showProtocol?: boolean;
  title?: string;
}

const stateStyles: Record<string, string> = {
  active:
    "text-terminal-green border-terminal-green/40 bg-terminal-green/10",
  closed:
    "text-terminal-muted border-terminal-border bg-terminal-surface",
  pending:
    "text-terminal-amber border-terminal-amber/40 bg-terminal-amber/10",
};

function timeAgo(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function timeRemaining(endTimestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = endTimestamp - now;
  if (diff <= 0) return "Ended";
  if (diff < 3600) return `${Math.floor(diff / 60)}m left`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h left`;
  return `${Math.floor(diff / 86400)}d left`;
}

function VoteBar({ choices, scores, scoresTotal }: {
  choices: string[];
  scores: number[];
  scoresTotal: number;
}) {
  if (scoresTotal === 0) return null;

  // Find "For" and "Against" indices (or first two choices)
  const forIdx = choices.findIndex((c) =>
    /^(for|yes|yae)$/i.test(c)
  );
  const againstIdx = choices.findIndex((c) =>
    /^(against|no|nay)$/i.test(c)
  );

  const forPct =
    forIdx >= 0 ? (scores[forIdx] / scoresTotal) * 100 : (scores[0] / scoresTotal) * 100;
  const againstPct =
    againstIdx >= 0 ? (scores[againstIdx] / scoresTotal) * 100 : scores.length > 1 ? (scores[1] / scoresTotal) * 100 : 0;

  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="flex-1 h-1.5 bg-terminal-border overflow-hidden flex">
        <div
          className="h-full bg-terminal-green"
          style={{ width: `${forPct}%` }}
        />
        <div
          className="h-full bg-terminal-red"
          style={{ width: `${againstPct}%` }}
        />
      </div>
      <span className="text-xs text-terminal-muted whitespace-nowrap">
        {forPct.toFixed(0)}% / {againstPct.toFixed(0)}%
      </span>
    </div>
  );
}

export default function GovernanceFeed({
  proposals,
  showProtocol = true,
  title = "Governance",
}: GovernanceFeedProps) {
  if (proposals.length === 0) {
    return (
      <div className="border border-terminal-border p-4">
        <div className="text-xs text-terminal-muted uppercase tracking-wider mb-2">
          {title}
        </div>
        <div className="text-terminal-dim text-sm font-mono">
          No recent proposals
        </div>
      </div>
    );
  }

  return (
    <div className="border border-terminal-border p-4">
      <div className="text-xs text-terminal-muted uppercase tracking-wider mb-3">
        {title} ({proposals.length})
      </div>
      <div className="space-y-3">
        {proposals.map((p) => (
          <a
            key={p.id}
            href={p.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block border border-terminal-border p-3 hover:border-terminal-border-bright transition"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {showProtocol && (
                    <span className="text-xs text-terminal-blue">
                      {p.spaceName}
                    </span>
                  )}
                  <span
                    className={`text-xs px-1.5 py-0.5 border ${stateStyles[p.state]}`}
                  >
                    {p.state}
                  </span>
                </div>
                <div className="text-sm text-terminal-text truncate">
                  {p.title}
                </div>
                <VoteBar
                  choices={p.choices}
                  scores={p.scores}
                  scoresTotal={p.scoresTotal}
                />
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs text-terminal-muted">
                  {timeAgo(p.created)}
                </div>
                {p.state === "active" && (
                  <div className="text-xs text-terminal-amber mt-1">
                    {timeRemaining(p.end)}
                  </div>
                )}
                <div className="text-xs text-terminal-dim mt-1">
                  {p.votes} votes
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
