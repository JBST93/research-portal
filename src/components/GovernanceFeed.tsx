import { Proposal } from "@/types";

interface GovernanceFeedProps {
  proposals: Proposal[];
  showProtocol?: boolean;
  title?: string;
}

const stateColor: Record<string, string> = {
  active: "text-bb-green",
  closed: "text-bb-muted",
  pending: "text-bb-amber",
};

function timeAgo(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
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

function VoteBar({
  choices,
  scores,
  scoresTotal,
}: {
  choices: string[];
  scores: number[];
  scoresTotal: number;
}) {
  if (scoresTotal === 0) return null;

  const forIdx = choices.findIndex((c) => /^(for|yes|yae)$/i.test(c));
  const againstIdx = choices.findIndex((c) => /^(against|no|nay)$/i.test(c));

  const forPct =
    forIdx >= 0
      ? (scores[forIdx] / scoresTotal) * 100
      : (scores[0] / scoresTotal) * 100;
  const againstPct =
    againstIdx >= 0
      ? (scores[againstIdx] / scoresTotal) * 100
      : scores.length > 1
        ? (scores[1] / scoresTotal) * 100
        : 0;

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1 bg-bb-dim overflow-hidden flex">
        <div className="h-full bg-bb-green" style={{ width: `${forPct}%` }} />
        <div className="h-full bg-bb-red" style={{ width: `${againstPct}%` }} />
      </div>
      <span className="text-xxs text-bb-muted">
        {forPct.toFixed(0)}/{againstPct.toFixed(0)}
      </span>
    </div>
  );
}

export default function GovernanceFeed({
  proposals,
  showProtocol = true,
  title = "Governance",
}: GovernanceFeedProps) {
  return (
    <div className="bg-bb-panel border border-bb-border">
      <div className="bb-header flex items-center justify-between">
        <span>{title}</span>
        <span className="text-bb-muted normal-case tracking-normal font-normal">
          {proposals.length}
        </span>
      </div>
      {proposals.length === 0 ? (
        <div className="px-3 py-2 text-xxs text-bb-dim">
          No recent proposals
        </div>
      ) : (
        <div className="divide-y divide-bb-border">
          {proposals.map((p) => (
            <a
              key={p.id}
              href={p.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-1.5 hover:bg-bb-surface transition text-xs"
            >
              <span
                className={`text-xxs font-bold uppercase w-10 shrink-0 ${stateColor[p.state]}`}
              >
                {p.state === "active" ? "LIVE" : p.state === "pending" ? "PEND" : "DONE"}
              </span>
              {showProtocol && (
                <span className="text-xxs text-bb-orange-dim w-14 shrink-0 truncate">
                  {p.spaceName}
                </span>
              )}
              <span className="text-bb-text truncate flex-1">{p.title}</span>
              <VoteBar
                choices={p.choices}
                scores={p.scores}
                scoresTotal={p.scoresTotal}
              />
              <span className="text-xxs text-bb-dim w-8 text-right shrink-0">
                {p.votes}v
              </span>
              <span className="text-xxs text-bb-dim w-12 text-right shrink-0">
                {p.state === "active"
                  ? timeRemaining(p.end)
                  : timeAgo(p.created)}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
