"use client";

import { STARTER_PACK, RESOURCE_CONFIG, Resource } from "@/constants/gameConfig";
import { CardShell } from "@/components/ui/CardShell";
import { LiquidGlassButton } from "@/components/ui/LiquidGlassButton";

interface StarterPackCardProps {
  onClaim: () => void;
  isLoading: boolean;
  isSuccess: boolean;
  error: Error | null;
}

export function StarterPackCard({
  onClaim,
  isLoading,
  isSuccess,
  error,
}: StarterPackCardProps) {
  return (
    <CardShell>
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 text-6xl">🎁</div>
        <h2 className="mb-2 text-2xl font-bold text-white">Welcome to FryReef!</h2>
        <p className="mb-6 text-slate-400">
          Claim your starter pack to begin your journey
        </p>

        <div className="mb-6 w-full rounded-xl bg-white/5 p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-300">
            Starter Pack Contains:
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">🟠 Egg</span>
              <span className="font-semibold text-white">×{STARTER_PACK.eggs}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">
                {RESOURCE_CONFIG[Resource.PearlShard].icon} Pearl Shards
              </span>
              <span className="font-semibold text-white">×{STARTER_PACK.pearlShards}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">
                {RESOURCE_CONFIG[Resource.SpawnDust].icon} Spawn Dust
              </span>
              <span className="font-semibold text-white">×{STARTER_PACK.spawnDust}</span>
            </div>
          </div>
        </div>

        <LiquidGlassButton onClick={onClaim} disabled={isLoading}>
          {isLoading ? "Claiming..." : "Claim Starter Pack"}
        </LiquidGlassButton>

        {error && (
          <p className="mt-4 text-sm text-red-400">
            Failed to claim. Please try again.
          </p>
        )}

        {isSuccess && (
          <p className="mt-4 text-sm text-green-400">
            ✓ Starter pack claimed successfully!
          </p>
        )}
      </div>
    </CardShell>
  );
}

