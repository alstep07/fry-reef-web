"use client";

import { RESOURCE_CONFIG, Resource } from "@/constants/gameConfig";

interface ResourceDisplayProps {
  pearlShards: number;
  spawnDust: number;
}

export function ResourceDisplay({ pearlShards, spawnDust }: ResourceDisplayProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 backdrop-blur-sm">
        <span className="text-lg">{RESOURCE_CONFIG[Resource.PearlShard].icon}</span>
        <span className="text-sm font-medium text-white">{pearlShards}</span>
      </div>
      <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 backdrop-blur-sm">
        <span className="text-lg">{RESOURCE_CONFIG[Resource.SpawnDust].icon}</span>
        <span className="text-sm font-medium text-white">{spawnDust}</span>
      </div>
    </div>
  );
}

