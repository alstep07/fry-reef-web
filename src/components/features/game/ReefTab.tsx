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
    <div
      className="group relative rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all hover:scale-[1.02] hover:border-white/20"
    >
      {/* Rarity glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-20 blur-xl transition-opacity group-hover:opacity-30"
        style={{ backgroundColor: config.color }}
      />

      {/* Fish Image */}
      <div className="relative mx-auto mb-3 h-20 w-20">
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

        <p className="text-xs text-slate-500">#{tokenId}</p>

        {/* Dust production */}
        <div className="mt-2 flex items-center justify-center gap-1 text-xs text-slate-400">
          <span>✨</span>
          <span>{dustPerDay}/day</span>
        </div>

        {/* Pending dust */}
        {pendingDust > 0 && (
          <div className="mt-1 text-sm font-medium text-amber-400">
            +{pendingDust} ✨ pending
          </div>
        )}

        {/* Lay Egg button */}
        <button
          onClick={() => onLayEgg(tokenId)}
          disabled={isLoading || !canLayEgg}
          className="mt-3 w-full cursor-pointer rounded-lg bg-purple-500/80 px-3 py-2 text-xs font-medium text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:bg-slate-600"
          title={!canLayEgg ? `Need ${EGG_LAYING.spawnDustCost} Spawn Dust` : "Create a new egg"}
        >
          {isLoading ? "..." : `Lay Egg (${EGG_LAYING.spawnDustCost} ✨)`}
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
    <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-white">Reef</h2>
          {fishCount > 0 && (
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-slate-300">
              {fishCount} {fishCount === 1 ? "fish" : "fish"}
            </span>
          )}
        </div>

        {/* Collect All button */}
        {totalPendingDust > 0 && (
          <button
            onClick={handleCollectAll}
            disabled={isWriting}
            className="flex cursor-pointer items-center gap-2 rounded-full bg-amber-500/80 px-4 py-2 text-sm font-medium text-white shadow-lg transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:bg-slate-600"
          >
            {isWriting ? (
              "Collecting..."
            ) : (
              <>
                <span>Collect All</span>
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">
                  +{totalPendingDust} ✨
                </span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Fish Grid */}
      {isFishLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-baseBlue" />
        </div>
      ) : fishCount === 0 ? (
        <div className="py-8 text-center">
          <div className="mb-4 flex justify-center">
            <Image
              src="/images/common/coral.webp"
              alt="Coral"
              width={180}
              height={180}
              className="object-contain opacity-50"
            />
          </div>
          <h3 className="mb-2 text-base font-medium text-white">No Fish Yet</h3>
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

      {/* Info footer */}
      {fishCount > 0 && (
        <div className="mt-4 rounded-lg bg-white/5 p-3 text-xs text-slate-400">
          <p>💡 Fish generate Spawn Dust daily based on their rarity. Collect dust and use {EGG_LAYING.spawnDustCost} ✨ to lay a new egg!</p>
        </div>
      )}
    </div>
  );
}

