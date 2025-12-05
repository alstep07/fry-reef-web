"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useFish } from "@/hooks/useFish";
import { useFryReef } from "@/hooks/useFryReef";
import { Rarity, RARITY_CONFIG, getFishImage, EGG_LAYING } from "@/constants/gameConfig";
import { FishRarity } from "@/contracts/fishNft";

// Map contract rarity to our enum
const rarityMap: Record<number, Rarity> = {
  [FishRarity.Common]: Rarity.Common,
  [FishRarity.Rare]: Rarity.Rare,
  [FishRarity.Epic]: Rarity.Epic,
  [FishRarity.Legendary]: Rarity.Legendary,
  [FishRarity.Mythic]: Rarity.Mythic,
};

interface FishCardProps {
  tokenId: number;
  rarity: Rarity;
  pendingDust: number;
  onLayEgg: (tokenId: number) => void;
  isLoading: boolean;
  canLayEgg: boolean;
}

function FishCard({ tokenId, rarity, pendingDust, onLayEgg, isLoading, canLayEgg }: FishCardProps) {
  const config = RARITY_CONFIG[rarity];
  const fishImage = getFishImage(rarity);
  const dustPerDay = config.spawnDustPerDay;

  return (
    <div className="group relative rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4 backdrop-blur-sm">
      {/* Rarity glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl sm:rounded-2xl opacity-20 blur-xl"
        style={{ backgroundColor: config.color }}
      />

      {/* Token ID - top left */}
      <span className="absolute top-3 left-3 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] text-slate-400">#{tokenId}</span>

      {/* Pending dust - top right with floating animation */}
      {pendingDust > 0 && (
        <span className="absolute top-3 right-3 animate-float rounded-full px-1.5 py-1 text-[10px] font-medium text-amber-400">
          +{pendingDust} ✨
        </span>
      )}

      {/* Fish Image */}
      <div className="relative mx-auto mb-2 sm:mb-3 h-16 w-16 sm:h-20 sm:w-20">
        <Image
          src={fishImage}
          alt={`${config.name} fish`}
          fill
          className="object-contain drop-shadow-lg"
        />
      </div>

      {/* Fish Info */}
      <div className="relative text-center">
        {/* Rarity badge */}
        <div
          className="mb-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
          style={{
            backgroundColor: `${config.color}20`,
            color: config.color,
          }}
        >
          {config.name}
        </div>

        {/* Dust stats */}
        <div className="mt-1 sm:mt-2 text-xs text-slate-400">
          <span>✨ {dustPerDay}/day</span>
        </div>

        {/* Lay Egg button */}
        <button
          onClick={() => onLayEgg(tokenId)}
          disabled={isLoading || !canLayEgg}
          className="mt-2 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-purple-500/80 px-3 py-2 text-xs font-medium text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:bg-slate-600"
          title={!canLayEgg ? `Need ${EGG_LAYING.spawnDustCost} Spawn Dust` : "Create a new egg"}
        >
          {isLoading ? "..." : (
            <>
              <span>Lay Egg</span>
              <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">{EGG_LAYING.spawnDustCost} ✨</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export function ReefTab() {
  const { fish, fishCount, totalPendingDust, isLoading: isFishLoading, refetch } = useFish();
  const { 
    spawnDust, 
    collectSpawnDust, 
    layEgg, 
    isWriting, 
    isSuccess,
    refetchUserInfo,
  } = useFryReef();

  // Refetch after successful transaction
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        refetch();
        refetchUserInfo();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, refetch, refetchUserInfo]);

  const handleCollectAll = async () => {
    await collectSpawnDust();
  };

  const handleLayEgg = async (fishId: number) => {
    await layEgg(fishId);
  };

  const canLayEgg = spawnDust >= EGG_LAYING.spawnDustCost;

  return (
    <div className="rounded-2xl border border-white/5 bg-white/5 p-4 sm:p-6 backdrop-blur-sm">
      {/* Header */}
      <div className="mb-3 sm:mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <h2 className="text-lg sm:text-xl font-semibold text-white">Reef</h2>
        </div>

        {/* Collect All button - hidden when no pending dust, but keeps layout stable */}
        <button
          onClick={handleCollectAll}
          disabled={isWriting || totalPendingDust === 0}
          className={`flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium text-white transition ${
            totalPendingDust > 0
              ? "cursor-pointer bg-amber-500/50 hover:bg-amber-500/80"
              : "pointer-events-none invisible"
          } disabled:cursor-not-allowed disabled:bg-slate-600`}
        >
          {isWriting ? (
            "..."
          ) : (
            <>
              <span>Collect</span>
              <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">
                +{totalPendingDust} ✨
              </span>
            </>
          )}
        </button>
      </div>

      {/* Fish Grid */}
      {isFishLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4">
              <div className="mx-auto mb-2 sm:mb-3 h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-white/10" />
              <div className="flex flex-col items-center gap-2">
                <div className="h-4 w-16 rounded-full bg-white/10" />
                <div className="h-3 w-12 rounded bg-white/5" />
                <div className="h-8 w-full rounded-lg bg-white/10 mt-1" />
              </div>
            </div>
          ))}
        </div>
      ) : fishCount === 0 ? (
        <div className="py-6 sm:py-8 text-center">
          <div className="mb-3 sm:mb-4 flex justify-center">
            <Image
              src="/images/common/coral.webp"
              alt="Coral"
              width={140}
              height={140}
              className="object-contain opacity-50"
            />
          </div>
          <h3 className="mb-1 sm:mb-2 text-base sm:text-lg font-medium text-white">No Fish Yet</h3>
          <p className="text-sm text-slate-400">
            Hatch eggs in the Nest to get your first fish!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {fish.map((f) => (
            <FishCard
              key={f.tokenId}
              tokenId={f.tokenId}
              rarity={rarityMap[f.info.rarity] || Rarity.Common}
              pendingDust={f.pendingDust}
              onLayEgg={handleLayEgg}
              isLoading={isWriting}
              canLayEgg={canLayEgg}
            />
          ))}
        </div>
      )}
    </div>
  );
}

