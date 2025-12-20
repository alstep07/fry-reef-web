"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useFish } from "@/hooks/useFish";
import { useFryReef } from "@/hooks/useFryReef";
import { Rarity, RARITY_CONFIG, getFishImage, EGG_LAYING, BURN } from "@/constants/gameConfig";
import { FishRarity } from "@/contracts/fishNft";
import { LayEggModal } from "./LayEggModal";

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
  timeUntilNextEgg: number; // Time in seconds until next egg can be laid
  onLayEgg: (tokenId: number) => void;
  onSelect?: (tokenId: number) => void;
  isSelected?: boolean;
  isLoading: boolean;
  canLayEgg: boolean;
  isReleaseMode?: boolean;
}

function FishCard({ tokenId, rarity, pendingDust, timeUntilNextEgg, onLayEgg, onSelect, isSelected, isLoading, canLayEgg, isReleaseMode }: FishCardProps) {
  const config = RARITY_CONFIG[rarity];
  const fishImage = getFishImage(rarity);
  const dustPerDay = config.spawnDustPerDay;

  // Calculate progress for egg laying (24 hours = 86400 seconds)
  const EGG_COOLDOWN_SECONDS = 24 * 60 * 60; // 86400 seconds = 1 day
  const canLayEggByTime = timeUntilNextEgg === 0;
  const progress = canLayEggByTime ? 100 : Math.max(0, Math.min(100, ((EGG_COOLDOWN_SECONDS - timeUntilNextEgg) / EGG_COOLDOWN_SECONDS) * 100));

  // Format time remaining
  const formatTime = (seconds: number) => {
    if (seconds <= 0) return "Ready";
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  return (
    <div
      className={`group relative rounded-xl sm:rounded-2xl border-2 p-3 sm:p-4 backdrop-blur-sm transition ${isSelected
        ? "border-red-600/70 bg-red-600/10"
        : isReleaseMode && onSelect
          ? "border-white/10 bg-white/5 cursor-pointer hover:border-white/20"
          : "border-white/10 bg-white/5"
        }`}
      onClick={isReleaseMode && onSelect ? () => onSelect(tokenId) : undefined}
    >
      {/* Rarity glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl sm:rounded-2xl opacity-20 blur-xl"
        style={{ backgroundColor: config.color }}
      />

      {/* Token ID - top left */}
      <span className="absolute top-3 left-3 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] text-slate-400">#{tokenId}</span>

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500">
          <svg
            className="h-3 w-3 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )}

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

        {/* Action buttons */}
        {!isReleaseMode && (
          <div className="mt-2 space-y-1.5">
            {/* Lay Egg button with progress */}
            <div className="relative">
              <button
                onClick={() => onLayEgg(tokenId)}
                disabled={isLoading || !canLayEgg || !canLayEggByTime}
                className={`relative flex w-full cursor-pointer items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-medium text-white transition overflow-hidden ${canLayEggByTime && canLayEgg
                  ? "bg-purple-500/80 hover:bg-purple-500"
                  : "bg-slate-600/60 hover:bg-slate-600/80"
                  } disabled:cursor-not-allowed`}
                title={!canLayEgg ? `Need ${EGG_LAYING.spawnDustCost} Spawn Dust` : !canLayEggByTime ? `Cooldown: ${formatTime(timeUntilNextEgg)}` : "Create a new egg"}
              >
                {/* Progress bar background - gray when not ready, purple when ready */}
                {canLayEggByTime && canLayEgg ? (
                  // Full and ready - solid purple
                  <div className="absolute inset-0 bg-purple-500/80" />
                ) : (
                  // Not ready - gray progress bar (darker gray for filled portion)
                  <>
                    {/* Background (lighter gray) */}
                    <div className="absolute inset-0 bg-slate-600/40" />
                    {/* Progress (darker gray) */}
                    <div
                      className="absolute inset-0 bg-slate-500/60 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </>
                )}
                <span className="relative z-10">
                  {isLoading ? "..." : (
                    <>
                      <span className="hidden sm:inline">Lay Egg</span>
                      <span className="rounded-full bg-white/20 px-1 py-0.5 text-[9px]">{EGG_LAYING.spawnDustCost}✨</span>
                    </>
                  )}
                </span>
              </button>
              {/* Time remaining indicator */}
              {!canLayEggByTime && (
                <div className="mt-1 text-center">
                  <span className="text-[9px] text-slate-400">{formatTime(timeUntilNextEgg)}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface ReefTabProps {
  onGoToNest?: () => void;
}

export function ReefTab({ onGoToNest }: ReefTabProps) {
  const { fish, fishCount, totalPendingDust, isLoading: isFishLoading, refetch } = useFish();
  const {
    spawnDust,
    collectSpawnDust,
    layEgg,
    burnFish,
    isWriting,
    isSuccess,
    refetchUserInfo,
    reefCapacity,
    expansionCost,
    expandReef,
    pearlShards,
  } = useFryReef();

  // Modal state
  const [showLayEggModal, setShowLayEggModal] = useState(false);
  const [pendingLayEgg, setPendingLayEgg] = useState(false);
  const [prevIsWriting, setPrevIsWriting] = useState(false);

  // Release mode state
  const [isReleaseMode, setIsReleaseMode] = useState(false);
  const [selectedFishForRelease, setSelectedFishForRelease] = useState<number[]>([]);
  const [showReleaseConfirmModal, setShowReleaseConfirmModal] = useState(false);

  // Show modal when egg is successfully laid
  useEffect(() => {
    // Detect when transaction completes (isWriting goes from true to false)
    if (prevIsWriting && !isWriting && pendingLayEgg) {
      if (isSuccess) {
        setShowLayEggModal(true);
      }
      setPendingLayEgg(false);
    }
    setPrevIsWriting(isWriting);
  }, [isWriting, prevIsWriting, pendingLayEgg, isSuccess]);

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
    setPendingLayEgg(true);
    await layEgg(fishId);
  };

  const toggleFishForRelease = (tokenId: number) => {
    setSelectedFishForRelease(prev => {
      const isSelected = prev.includes(tokenId);
      if (isSelected) return prev.filter(id => id !== tokenId);
      return [...prev, tokenId];
    });
  };

  const handleRelease = async () => {
    if (selectedFishForRelease.length === 0) return;
    setShowReleaseConfirmModal(true);
  };

  const confirmRelease = async () => {
    if (selectedFishForRelease.length === 0) return;
    setShowReleaseConfirmModal(false);
    await burnFish(selectedFishForRelease);
    setSelectedFishForRelease([]);
    setIsReleaseMode(false);
  };

  const cancelReleaseMode = () => {
    setIsReleaseMode(false);
    setSelectedFishForRelease([]);
  };

  const handleCloseModal = () => {
    setShowLayEggModal(false);
  };

  const handleGoToNest = () => {
    handleCloseModal();
    onGoToNest?.();
  };

  const hasEnoughDust = spawnDust >= EGG_LAYING.spawnDustCost;

  return (
    <>
      <LayEggModal
        isOpen={showLayEggModal}
        onClose={handleCloseModal}
        onGoToNest={handleGoToNest}
      />
      <div className="rounded-2xl border border-white/5 bg-white/5 p-4 sm:p-6 backdrop-blur-sm">
        {/* Header */}
        <div className="mb-3 sm:mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <h2 className="text-lg sm:text-xl font-semibold text-white">Reef</h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Release button */}
            {!isReleaseMode ? (
              <button
                onClick={() => setIsReleaseMode(true)}
                disabled={fishCount === 0}
                className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium text-white transition cursor-pointer bg-red-700/60 hover:bg-red-700/80 disabled:cursor-not-allowed disabled:bg-slate-600/50 disabled:hover:bg-slate-600/50"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span>Release</span>
              </button>
            ) : (
              <button
                onClick={cancelReleaseMode}
                className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium text-white transition cursor-pointer bg-slate-600/50 hover:bg-slate-600/80"
              >
                <span>Cancel</span>
              </button>
            )}

            {/* Collect All button - always visible, disabled when no dust or in release mode */}
            <button
              onClick={handleCollectAll}
              disabled={isWriting || totalPendingDust === 0 || isReleaseMode}
              className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium text-white transition cursor-pointer bg-amber-500/50 hover:bg-amber-500/80 disabled:cursor-not-allowed disabled:bg-slate-600/50 disabled:hover:bg-slate-600/50"
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
        </div>

        {/* Warning for pending dust */}
        {isReleaseMode && selectedFishForRelease.length > 0 && (() => {
          const selectedFishData = fish.filter(f => selectedFishForRelease.includes(f.tokenId));
          const totalPendingDust = selectedFishData.reduce((sum, f) => sum + f.pendingDust, 0);

          return totalPendingDust > 0 ? (
            <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
              <p className="text-xs text-amber-400">
                ⚠️ Warning: Selected fish have {totalPendingDust} unclaimed Spawn Dust.
                Claim it before releasing, or it will be lost when the fish are released.
              </p>
            </div>
          ) : null;
        })()}

        {/* Reef Capacity Display */}
        <div className="mb-4 rounded-lg border border-white/10 bg-white/5 p-3 sm:p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-semibold text-white">Capacity</span>
            </div>
            <span className="text-xs sm:text-sm font-bold text-white">
              {isReleaseMode && selectedFishForRelease.length > 0 ? (
                <>
                  <span className="text-blue-400">{fishCount - selectedFishForRelease.length}</span>
                  <span className="text-slate-500">/</span>
                  <span className="text-blue-400">{reefCapacity}</span>
                  <span className="text-slate-500 ml-1">(-{selectedFishForRelease.length})</span>
                </>
              ) : (
                <>
                  <span className={fishCount >= reefCapacity ? "text-amber-400" : "text-blue-400"}>{fishCount}</span>
                  <span className="text-slate-500">/</span>
                  <span className={fishCount >= reefCapacity ? "text-amber-400" : "text-blue-400"}>{reefCapacity}</span>
                </>
              )}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden relative mb-3">
            {reefCapacity > 0 && (
              <>
                {isReleaseMode && selectedFishForRelease.length > 0 ? (
                  <>
                    {/* Will be occupied after release (blue) */}
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-300 absolute left-0"
                      style={{ width: `${Math.min(((fishCount - selectedFishForRelease.length) / reefCapacity) * 100, 100)}%` }}
                    />
                    {/* Will be freed (green - shows what will be freed) */}
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500/50 to-emerald-400/50 transition-all duration-300 absolute left-0 border-r-2 border-emerald-300/30"
                      style={{
                        width: `${(selectedFishForRelease.length / reefCapacity) * 100}%`,
                        left: `${((fishCount - selectedFishForRelease.length) / reefCapacity) * 100}%`
                      }}
                    />
                  </>
                ) : (
                  <>
                    {/* Occupied (blue when not full, yellow when full) */}
                    <div
                      className={`h-full transition-all duration-300 absolute left-0 ${fishCount >= reefCapacity
                        ? "bg-gradient-to-r from-amber-500 to-amber-400"
                        : "bg-gradient-to-r from-blue-500 to-blue-400"
                        }`}
                      style={{ width: `${Math.min((fishCount / reefCapacity) * 100, 100)}%` }}
                    />
                    {/* Available space is transparent (background shows through) */}
                  </>
                )}
              </>
            )}
          </div>

          {/* Expand Button */}
          {!isReleaseMode && (
            <>
              {expansionCost !== null && expansionCost !== Number.MAX_SAFE_INTEGER && (
                <button
                  onClick={() => expandReef()}
                  disabled={isWriting || pearlShards < expansionCost}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500/80 to-emerald-600/80 hover:from-emerald-500 hover:to-emerald-600 px-4 py-2 text-xs sm:text-sm font-medium text-white transition-all shadow-lg hover:shadow-emerald-500/30 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Expand Reef</span>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
                    {expansionCost} 💎
                  </span>
                </button>
              )}
              {expansionCost === Number.MAX_SAFE_INTEGER && (
                <div className="w-full flex items-center justify-center gap-2 rounded-lg bg-slate-600/50 px-4 py-2 text-xs sm:text-sm font-medium text-slate-400">
                  <span>Maximum capacity reached</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Fish Grid */}
        {isFishLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 animate-pulse">
            {[1, 2].map((i) => (
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
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[...fish]
                .sort((a, b) => {
                  // Sort by rarity (higher rarity first: Mythic -> Legendary -> Epic -> Rare -> Common)
                  // rarity is a number: 0=Common, 1=Rare, 2=Epic, 3=Legendary, 4=Mythic
                  return b.info.rarity - a.info.rarity;
                })
                .map((f) => {
                  const rarity = rarityMap[f.info.rarity] || Rarity.Common;

                  return (
                    <FishCard
                      key={f.tokenId}
                      tokenId={f.tokenId}
                      rarity={rarity}
                      pendingDust={f.pendingDust}
                      timeUntilNextEgg={f.timeUntilNextEgg}
                      onLayEgg={handleLayEgg}
                      onSelect={isReleaseMode ? toggleFishForRelease : undefined}
                      isSelected={isReleaseMode && selectedFishForRelease.includes(f.tokenId)}
                      isLoading={isWriting}
                      canLayEgg={hasEnoughDust}
                      isReleaseMode={isReleaseMode}
                    />
                  );
                })}
            </div>

            {/* Release Button */}
            {isReleaseMode && (() => {
              const selectedFishData = fish.filter(f => selectedFishForRelease.includes(f.tokenId));
              const totalReward = selectedFishData.reduce((sum, f) => {
                const rarity = rarityMap[f.info.rarity] || Rarity.Common;
                return sum + (BURN[rarity]?.spawnDustReward || 0);
              }, 0);
              const hasSelectedFish = selectedFishForRelease.length > 0;

              return (
                <div className="mt-4">
                  <button
                    onClick={handleRelease}
                    disabled={isWriting || !hasSelectedFish}
                    className="w-full cursor-pointer rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg transition bg-red-700/80 hover:bg-red-700/90 disabled:cursor-not-allowed disabled:bg-slate-600"
                  >
                    {isWriting ? (
                      "Releasing..."
                    ) : hasSelectedFish ? (
                      <>
                        Release {selectedFishForRelease.length} fish
                        <span className="ml-2 text-xs opacity-90">+{totalReward} ✨</span>
                      </>
                    ) : (
                      "Select fish to release"
                    )}
                  </button>
                </div>
              );
            })()}
          </>
        )}

        {/* Release Confirmation Modal */}
        {showReleaseConfirmModal && (() => {
          const selectedFishData = fish.filter(f => selectedFishForRelease.includes(f.tokenId));
          const totalReward = selectedFishData.reduce((sum, f) => {
            const rarity = rarityMap[f.info.rarity] || Rarity.Common;
            return sum + (BURN[rarity]?.spawnDustReward || 0);
          }, 0);

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={() => setShowReleaseConfirmModal(false)}
              />

              {/* Modal */}
              <div className="relative z-10 mx-4 w-full max-w-md animate-[scaleIn_0.3s_ease-out] rounded-2xl border border-white/10 bg-gradient-to-b from-slate-800/90 to-slate-900/90 p-4 sm:p-6 text-center shadow-2xl backdrop-blur-md">
                {/* Warning Icon */}
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-amber-500/20 p-4">
                    <svg className="h-12 w-12 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>

                {/* Title */}
                <h2 className="mb-2 text-xl sm:text-2xl font-bold text-white">
                  Confirm Release
                </h2>
                <p className="mb-4 text-sm text-slate-400">
                  Are you sure you want to release {selectedFishForRelease.length} fish?
                </p>

                {/* Warning */}
                <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-left">
                  <p className="text-xs text-amber-300">
                    <strong className="font-semibold">⚠️ This action is permanent!</strong>
                    <br />
                    Your NFTs will be burned (sent to a burn address) and cannot be recovered. You will receive {totalReward} Spawn Dust as a reward.
                  </p>
                </div>

                {/* Reward Info */}
                <div className="mb-6 rounded-lg bg-white/5 p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">You will receive:</span>
                    <span className="text-white font-semibold">
                      +{totalReward} ✨ Spawn Dust
                    </span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowReleaseConfirmModal(false)}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition cursor-pointer hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmRelease}
                    disabled={isWriting}
                    className="flex-1 rounded-xl bg-red-700/80 px-4 py-3 text-sm font-medium text-white transition cursor-pointer hover:bg-red-700/90 disabled:cursor-not-allowed disabled:bg-slate-600"
                  >
                    {isWriting ? "Releasing..." : "Confirm Release"}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </>
  );
}

