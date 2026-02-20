import { Proposal } from "@/types";
import { getProtocolBySnapshotSpace, getSnapshotSpaces } from "./protocols";

const SNAPSHOT_URL = "https://hub.snapshot.org/graphql";

async function querySnapshot(query: string, variables?: Record<string, unknown>) {
  const res = await fetch(SNAPSHOT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}

function mapProposal(raw: RawProposal): Proposal {
  const config = getProtocolBySnapshotSpace(raw.space.id);
  return {
    id: raw.id,
    title: raw.title,
    state: raw.state as Proposal["state"],
    space: raw.space.id,
    spaceName: raw.space.name,
    protocolSlug: config?.slug || raw.space.id,
    author: raw.author,
    created: raw.created,
    start: raw.start,
    end: raw.end,
    choices: raw.choices,
    scores: raw.scores,
    scoresTotal: raw.scores_total,
    votes: raw.votes,
    quorum: raw.quorum,
    link: `https://snapshot.org/#/${raw.space.id}/proposal/${raw.id}`,
  };
}

interface RawProposal {
  id: string;
  title: string;
  state: string;
  author: string;
  created: number;
  start: number;
  end: number;
  choices: string[];
  scores: number[];
  scores_total: number;
  votes: number;
  quorum: number;
  space: { id: string; name: string };
}

const PROPOSALS_QUERY = `
  query Proposals($spaces: [String!]!, $first: Int!, $state: String) {
    proposals(
      first: $first,
      where: { space_in: $spaces, state: $state },
      orderBy: "created",
      orderDirection: desc
    ) {
      id
      title
      state
      author
      created
      start
      end
      choices
      scores
      scores_total
      votes
      quorum
      space { id name }
    }
  }
`;

export async function getAllProposals(
  limit: number = 20,
  state?: "active" | "closed" | "pending"
): Promise<Proposal[]> {
  const spaces = getSnapshotSpaces().map((s) => s.space);
  if (spaces.length === 0) return [];

  const variables: Record<string, unknown> = {
    spaces,
    first: limit,
  };
  if (state) variables.state = state;

  const data = await querySnapshot(PROPOSALS_QUERY, variables);
  if (!data?.proposals) return [];

  return data.proposals.map(mapProposal);
}

export async function getProtocolProposals(
  snapshotSpace: string,
  limit: number = 10
): Promise<Proposal[]> {
  const variables = {
    spaces: [snapshotSpace],
    first: limit,
  };

  const data = await querySnapshot(PROPOSALS_QUERY, variables);
  if (!data?.proposals) return [];

  return data.proposals.map(mapProposal);
}
