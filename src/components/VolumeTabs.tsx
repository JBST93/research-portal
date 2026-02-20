"use client";

import { useState } from "react";
import { DexVolume } from "@/types";
import DexTable from "./DexTable";

interface VolumeTabsProps {
  spotDexes: DexVolume[];
  perpDexes: DexVolume[];
}

export default function VolumeTabs({ spotDexes, perpDexes }: VolumeTabsProps) {
  const [tab, setTab] = useState<"perps" | "spot">("perps");

  return (
    <div>
      <div className="flex gap-0 border-b border-bb-border mb-0">
        <button
          onClick={() => setTab("perps")}
          className={`text-xs px-4 py-2 uppercase tracking-wider font-bold transition border-b-2 ${
            tab === "perps"
              ? "text-bb-orange border-bb-orange"
              : "text-bb-muted border-transparent hover:text-bb-text"
          }`}
        >
          Perps / Derivatives ({perpDexes.length})
        </button>
        <button
          onClick={() => setTab("spot")}
          className={`text-xs px-4 py-2 uppercase tracking-wider font-bold transition border-b-2 ${
            tab === "spot"
              ? "text-bb-orange border-bb-orange"
              : "text-bb-muted border-transparent hover:text-bb-text"
          }`}
        >
          Spot DEX ({spotDexes.length})
        </button>
      </div>
      <DexTable dexes={tab === "perps" ? perpDexes : spotDexes} />
    </div>
  );
}
