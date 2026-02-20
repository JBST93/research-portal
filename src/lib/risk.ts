import { ProtocolData, RiskLevel, Alert } from "@/types";

export function calculateRisk(protocol: ProtocolData): RiskLevel {
  let score = 0;

  // TVL size — larger TVL = lower risk
  if (protocol.tvl > 5_000_000_000) score += 0;
  else if (protocol.tvl > 1_000_000_000) score += 1;
  else if (protocol.tvl > 200_000_000) score += 2;
  else score += 3;

  // TVL 24h change — big drops are risky
  const change1d = protocol.change_1d ?? 0;
  if (change1d < -10) score += 3;
  else if (change1d < -5) score += 2;
  else if (change1d < -2) score += 1;

  // TVL 7d change
  const change7d = protocol.change_7d ?? 0;
  if (change7d < -15) score += 2;
  else if (change7d < -5) score += 1;

  // Chain diversification — single chain = more risk
  if (protocol.chains.length === 1) score += 1;

  // Map to 1-4 scale
  if (score <= 2) return 1;
  if (score <= 4) return 2;
  if (score <= 6) return 3;
  return 4;
}

export function getRiskLabel(level: RiskLevel): string {
  switch (level) {
    case 1:
      return "Low";
    case 2:
      return "Medium";
    case 3:
      return "High";
    case 4:
      return "Critical";
  }
}

export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case 1:
      return "text-bb-green";
    case 2:
      return "text-bb-amber";
    case 3:
      return "text-bb-red";
    case 4:
      return "text-red-600";
  }
}

export function generateAlerts(protocols: ProtocolData[]): Alert[] {
  const alerts: Alert[] = [];

  for (const p of protocols) {
    const change1d = p.change_1d ?? 0;
    const change7d = p.change_7d ?? 0;

    if (change1d < -5) {
      alerts.push({
        protocol: p.name,
        slug: p.slug,
        type: "tvl_drop",
        severity: change1d < -10 ? "high" : "medium",
        message: `TVL dropped ${Math.abs(change1d).toFixed(1)}% in 24h`,
      });
    }

    if (change1d > 10) {
      alerts.push({
        protocol: p.name,
        slug: p.slug,
        type: "tvl_surge",
        severity: "low",
        message: `TVL surged ${change1d.toFixed(1)}% in 24h`,
      });
    }

    if (change7d < -10) {
      alerts.push({
        protocol: p.name,
        slug: p.slug,
        type: "tvl_drop",
        severity: change7d < -20 ? "high" : "medium",
        message: `TVL dropped ${Math.abs(change7d).toFixed(1)}% in 7d`,
      });
    }
  }

  // Sort by severity
  const severityOrder = { high: 0, medium: 1, low: 2 };
  alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return alerts;
}
