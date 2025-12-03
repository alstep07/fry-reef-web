"use client";

import { useEffect, useState } from "react";
import { useEggs, type EggWithInfo } from "@/hooks/useEggs";
import { useFryReef } from "@/hooks/useFryReef";
import { INCUBATION } from "@/constants/gameConfig";

interface EggCardProps {
  egg: EggWithInfo;
  onIncubate: (tokenId: number) => void;
  onHatch: (tokenId: number) => void;
  isLoading: boolean;
  pearlShards: number;
}

function EggCard({ egg, onIncubate, onHatch, isLoading, pearlShards }: EggCardProps) {
  const { tokenId, info, canHatch, timeUntilHatch } = egg;

  // Calculate progress based on incubation time
  const getProgress = () => {
    if (!info.isIncubating) return 0;
    const elapsed = Date.now() / 1000 - Number(info.incubationStartedAt);
    const total = INCUBATION.durationSeconds;
    return Math.min(100, (elapsed / total) * 100);
  };

  const [progress, setProgress] = useState(() => getProgress());

  // Update progress periodically
  useEffect(() => {
    if (!info.isIncubating) {
      setProgress(0);
      return;
    }

    // Recalculate on mount/change
    setProgress(getProgress());

    const interval = setInterval(() => {
      const elapsed = Date.now() / 1000 - Number(info.incubationStartedAt);
      const total = INCUBATION.durationSeconds;
      setProgress(Math.min(100, (elapsed / total) * 100));
    }, 60000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [info.isIncubating, info.incubationStartedAt]);

  // Format time remaining
  const formatTime = (seconds: number) => {
    if (seconds <= 0) return "Ready!";
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  // Status styling
  const getStatusStyle = () => {
    if (canHatch) return "border-green-500/30 bg-green-500/5";
    if (info.isIncubating) return "border-baseBlue/30 bg-baseBlue/5";
    return "border-white/10 bg-white/5";
  };

  return (
    <div className={`group relative rounded-2xl border p-4 backdrop-blur-sm transition-all hover:scale-[1.02] ${getStatusStyle()}`}>
      {/* Status badge */}
      {canHatch && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg">
          READY
        </div>
      )}
      {info.isIncubating && !canHatch && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-baseBlue px-2 py-0.5 text-[10px] font-bold text-white shadow-lg">
          INCUBATING
        </div>
      )}

      {/* Egg Visual */}
      <div className="relative mx-auto mb-3 h-20 w-20">
        {/* Glow effect */}
        {canHatch && (
          <div className="absolute inset-0 animate-pulse rounded-full bg-green-500/20 blur-xl" />
        )}
        {info.isIncubating && !canHatch && (
          <div className="absolute inset-0 rounded-full bg-baseBlue/10 blur-lg" />
        )}

        {/* Egg icon */}
        <div className="relative flex h-full w-full items-center justify-center text-5xl">
          🟠
        </div>

        {/* Progress ring for incubating eggs */}
        {info.isIncubating && !canHatch && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="4"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#0052FF"
                strokeWidth="4"
                strokeDasharray={`${progress * 2.64} 264`}
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Egg Info */}
      <div className="text-center">
        <p className="text-xs font-medium text-slate-400">#{tokenId}</p>

        {!info.isIncubating ? (
          <button
            onClick={() => onIncubate(tokenId)}
            disabled={isLoading || pearlShards < INCUBATION.pearlShardCost}
            className="mt-2 w-full cursor-pointer rounded-lg bg-baseBlue/80 px-3 py-2 text-xs font-medium text-white transition hover:bg-baseBlue disabled:cursor-not-allowed disabled:bg-slate-600"
          >
            {pearlShards < INCUBATION.pearlShardCost
              ? `Need ${INCUBATION.pearlShardCost} 🫧`
              : isLoading
                ? "..."
                : `Incubate (${INCUBATION.pearlShardCost} 🫧)`}
          </button>
        ) : canHatch ? (
          <button
            onClick={() => onHatch(tokenId)}
            disabled={isLoading}
            className="mt-2 w-full cursor-pointer rounded-lg bg-green-500 px-3 py-2 text-xs font-medium text-white transition hover:bg-green-400 disabled:cursor-not-allowed disabled:bg-slate-600"
          >
            {isLoading ? "..." : "🐣 Hatch"}
          </button>
        ) : (
          <div className="mt-2">
            <p className="text-xs tabular-nums text-slate-300">{formatTime(timeUntilHatch)}</p>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-baseBlue transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function NestTab() {
  const { eggs, eggCount, refetch } = useEggs();
  const { pearlShards, isWriting, isSuccess, startIncubation, hatchEgg } = useFryReef();

  // Refetch eggs after successful transaction
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        refetch();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, refetch]);

  const handleIncubate = async (tokenId: number) => {
    await startIncubation(tokenId);
  };

  const handleHatch = async (tokenId: number) => {
    await hatchEgg(tokenId);
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Nest</h2>
        {eggCount > 0 && (
          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-slate-300">
            {eggCount} {eggCount === 1 ? "egg" : "eggs"}
          </span>
        )}
      </div>

      {eggCount === 0 ? (
        <div className="py-8 text-center">
          <div className="mb-4 text-5xl">🟠</div>
          <h3 className="mb-2 text-base font-medium text-white">No Eggs Yet</h3>
          <p className="text-sm text-slate-400">
            Claim your starter pack or breed fish to get eggs!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {eggs.map((egg) => (
            <EggCard
              key={egg.tokenId}
              egg={egg}
              onIncubate={handleIncubate}
              onHatch={handleHatch}
              isLoading={isWriting}
              pearlShards={pearlShards}
            />
          ))}
        </div>
      )}
    </div>
  );
}

