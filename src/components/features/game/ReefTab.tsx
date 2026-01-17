"use client";

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { useFish } from "@/hooks/useFish";
import { useFryReef } from "@/hooks/useFryReef";
import {
  Rarity,
  RARITY_CONFIG,
  getFishImage,
  EGG_LAYING,
  BURN,
  CONTRACT_RARITY_MAP,
} from "@/constants/gameConfig";
import { LayEggModal } from "./LayEggModal";

interface FishCardProps {
  tokenId: number;
  rarity: Rarity;
  pendingDust: number;
  timeUntilNextEgg: number;
  onLayEgg: (tokenId: number) => void;
  onSelect?: (tokenId: number) => void;
  isSelected?: boolean;
  isLoading: boolean;
  canLayEgg: boolean;
  isReleaseMode?: boolean;
}

function FishCard({
  tokenId,
  rarity,
  pendingDust,
  timeUntilNextEgg,
  onLayEgg,
  onSelect,
  isSelected,
  isLoading,
  canLayEgg,
  isReleaseMode,
}: FishCardProps) {
  const config = RARITY_CONFIG[rarity];
  const fishImage = getFishImage(rarity);
  const dustPerDay = config.spawnDustPerDay;

  // Calculate progress for egg laying (24 hours = 86400 seconds)
  const EGG_COOLDOWN_SECONDS = 24 * 60 * 60;
  const canLayEggByTime = timeUntilNextEgg === 0;
  const progress = canLayEggByTime
    ? 100
    : Math.max(
      0,
      Math.min(
        100,
        ((EGG_COOLDOWN_SECONDS - timeUntilNextEgg) / EGG_COOLDOWN_SECONDS) *
        100
      )
    );

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
      className={`group relative flex flex-col rounded-xl sm:rounded-2xl border-2 p-3 sm:p-4 backdrop-blur-sm transition ${isSelected
        ? "border-red-600/70 bg-red-600/10"
        : isReleaseMode && onSelect
          ? "border-white/10 bg-white/5 cursor-pointer hover:border-white/20"
          : "border-white/10 bg-white/5"
        }`}
      onClick={isReleaseMode && onSelect ? () => onSelect(tokenId) : undefined}
    >
      {/* Rarity glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl sm:rounded-2xl opacity-10 sm:opacity-20 blur-md sm:blur-xl"
        style={{ backgroundColor: config.color }}
      />

      {/* Token ID - top left */}
      <span className="absolute top-3 left-3 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] text-slate-400">
        #{tokenId}
      </span>

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
      <div className="relative flex-grow flex flex-col text-center">
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
          <div className="mt-auto pt-2 space-y-1.5">
            {/* Lay Egg button with progress */}
            <div className="relative">
              <button
                onClick={() => onLayEgg(tokenId)}
                disabled={isLoading || !canLayEgg || !canLayEggByTime}
                className={`relative flex w-full cursor-pointer items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-medium text-white transition overflow-hidden ${canLayEggByTime && canLayEgg
                  ? "bg-purple-500/80 hover:bg-purple-500"
                  : "bg-slate-600/60 hover:bg-slate-600/80"
                  } disabled:cursor-not-allowed`}
                title={
                  !canLayEgg
                    ? `Need ${EGG_LAYING.spawnDustCost} Spawn Dust`
                    : !canLayEggByTime
                      ? `Cooldown: ${formatTime(timeUntilNextEgg)}`
                      : "Create a new egg"
                }
              >
                {/* Progress bar background */}
                {canLayEggByTime && canLayEgg ? (
                  <div className="absolute inset-0 bg-purple-500/80" />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-slate-600/40" />
                    <div
                      className="absolute inset-0 bg-slate-500/60 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </>
                )}
                <span className="relative z-10">
                  {isLoading ? (
                    "..."
                  ) : (
                    <>
                      <span className="hidden sm:inline">Lay Egg</span>
                      <span className="rounded-full bg-white/20 px-1 py-0.5 text-[9px]">
                        {EGG_LAYING.spawnDustCost}✨
                      </span>
                    </>
                  )}
                </span>
              </button>
              {/* Time remaining indicator */}
              {!canLayEggByTime && (
                <div className="mt-1 text-center">
                  <span className="text-[9px] text-slate-400">
                    {formatTime(timeUntilNextEgg)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Skeleton component for fish cards
function FishCardSkeleton({ id }: { id: number | string }) {
  return (
    <div
      key={id}
      className="group relative rounded-xl sm:rounded-2xl border-2 border-white/10 bg-white/5 p-3 sm:p-4 backdrop-blur-sm animate-pulse"
    >
      <div className="absolute top-3 left-3 h-4 w-8 rounded-full bg-white/10" />
      <div className="mx-auto mb-2 sm:mb-3 h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-white/10" />
      <div className="relative text-center">
        <div className="mb-1 h-5 w-16 mx-auto rounded-full bg-white/5" />
        <div className="mt-1 sm:mt-2 h-3 w-12 mx-auto rounded bg-white/5" />
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
    refetchUserInfo,
    reefCapacity,
    expansionCost,
    expandReef,
    pearlShards,
    // Transaction states
    collectDustTx,
    layEggTx,
    burnTx,
    expandTx,
  } = useFryReef();

  // Modal state
  const [showLayEggModal, setShowLayEggModal] = useState(false);

  // Release mode state
  const [isReleaseMode, setIsReleaseMode] = useState(false);
  const [selectedFishForRelease, setSelectedFishForRelease] = useState<number[]>([]);
  const [showReleaseConfirmModal, setShowReleaseConfirmModal] = useState(false);
  const [releasingFishIds, setReleasingFishIds] = useState<Set<number>>(new Set());

  // Memoized calculations
  const hasEnoughDust = spawnDust >= EGG_LAYING.spawnDustCost;

  const totalDustPerDay = useMemo(() => {
    return fish.reduce((total, f) => {
      const rarity = CONTRACT_RARITY_MAP[f.info.rarity] || Rarity.Common;
      const config = RARITY_CONFIG[rarity];
      return total + config.spawnDustPerDay;
    }, 0);
  }, [fish]);

  const sortedFish = useMemo(() => {
    return [...fish].sort((a, b) => b.info.rarity - a.info.rarity);
  }, [fish]);

  const selectedFishPendingDust = useMemo(() => {
    if (!isReleaseMode || selectedFishForRelease.length === 0) return 0;
    return fish
      .filter((f) => selectedFishForRelease.includes(f.tokenId))
      .reduce((sum, f) => sum + f.pendingDust, 0);
  }, [fish, selectedFishForRelease, isReleaseMode]);

  const releaseReward = useMemo(() => {
    if (selectedFishForRelease.length === 0) return 0;
    return fish
      .filter((f) => selectedFishForRelease.includes(f.tokenId))
      .reduce((sum, f) => {
        const rarity = CONTRACT_RARITY_MAP[f.info.rarity] || Rarity.Common;
        return sum + (BURN[rarity]?.spawnDustReward || 0);
      }, 0);
  }, [fish, selectedFishForRelease]);

  // Handlers
  const handleCollectAll = useCallback(async () => {
    const success = await collectSpawnDust();
    if (success) {
      refetch();
    }
  }, [collectSpawnDust, refetch]);

  const handleLayEgg = useCallback(async (fishId: number) => {
    const success = await layEgg(fishId);
    if (success) {
      setShowLayEggModal(true);
      refetch();
      refetchUserInfo();
    }
  }, [layEgg, refetch, refetchUserInfo]);

  const toggleFishForRelease = useCallback((tokenId: number) => {
    setSelectedFishForRelease((prev) => {
      const isSelected = prev.includes(tokenId);
      if (isSelected) return prev.filter((id) => id !== tokenId);
      return [...prev, tokenId];
    });
  }, []);

  const handleRelease = useCallback(() => {
    if (selectedFishForRelease.length === 0) return;
    setShowReleaseConfirmModal(true);
  }, [selectedFishForRelease.length]);

  const confirmRelease = useCallback(async () => {
    if (selectedFishForRelease.length === 0) return;

    setShowReleaseConfirmModal(false);
    const fishToRelease = [...selectedFishForRelease];
    setReleasingFishIds(new Set(fishToRelease));
    setIsReleaseMode(false);
    setSelectedFishForRelease([]);

    const success = await burnFish(fishToRelease);
    if (success) {
      refetch();
      refetchUserInfo();
    }
    // Clear skeleton state after transaction completes (success or fail)
    setReleasingFishIds(new Set());
  }, [selectedFishForRelease, burnFish, refetch, refetchUserInfo]);

  const cancelReleaseMode = useCallback(() => {
    setIsReleaseMode(false);
    setSelectedFishForRelease([]);
  }, []);

  const handleExpandReef = useCallback(async () => {
    const success = await expandReef();
    if (success) {
      refetchUserInfo();
    }
  }, [expandReef, refetchUserInfo]);

  const handleCloseModal = useCallback(() => {
    setShowLayEggModal(false);
  }, []);

  const handleGoToNest = useCallback(() => {
    setShowLayEggModal(false);
    onGoToNest?.();
  }, [onGoToNest]);

  // Loading states
  const isCollecting = collectDustTx.isLoading;
  const isLayingEgg = layEggTx.isLoading;
  const isReleasing = burnTx.isLoading;
  const isExpanding = expandTx.isLoading;

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
            {fishCount > 0 && (
              <span className="text-xs sm:text-sm text-slate-400">
                ✨ {totalDustPerDay}/day
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Release button */}
            {!isReleaseMode ? (
              <button
                onClick={() => setIsReleaseMode(true)}
                disabled={fishCount === 0}
                className="flex items-center gap-1 rounded-full px-1.5 py-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium text-white transition cursor-pointer bg-red-700/60 hover:bg-red-700/80 disabled:cursor-not-allowed disabled:bg-slate-600/50 disabled:hover:bg-slate-600/50"
              >
                <svg
                  className="h-4 w-4 sm:h-3.5 sm:w-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                <span className="hidden sm:inline">Release</span>
              </button>
            ) : (
              <button
                onClick={cancelReleaseMode}
                className="flex items-center gap-1 rounded-full px-1.5 py-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium text-white transition cursor-pointer bg-slate-600/50 hover:bg-slate-600/80"
              >
                <span className="hidden sm:inline">Cancel</span>
                <span className="sm:hidden">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </span>
              </button>
            )}

            {/* Collect All button */}
            <button
              onClick={handleCollectAll}
              disabled={isCollecting || totalPendingDust === 0 || isReleaseMode}
              className="flex items-center gap-1 rounded-full px-1.5 py-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium text-white transition cursor-pointer bg-amber-500/50 hover:bg-amber-500/80 disabled:cursor-not-allowed disabled:bg-slate-600/50 disabled:hover:bg-slate-600/50"
            >
              {isCollecting ? (
                <span className="hidden sm:inline">...</span>
              ) : (
                <>
                  <span className="hidden sm:inline">Collect</span>
                  <span className="sm:hidden">+</span>
                  <span className="rounded-full sm:bg-white/20 sm:px-1.5 sm:py-0.5 text-[10px]">
                    <span className="hidden sm:inline">+</span>
                    {totalPendingDust} ✨
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Warning for pending dust */}
        {isReleaseMode && selectedFishPendingDust > 0 && (
          <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
            <p className="text-xs text-amber-400">
              ⚠️ Warning: Selected fish have {selectedFishPendingDust} unclaimed
              Spawn Dust. Claim it before releasing, or it will be lost when the
              fish are released.
            </p>
          </div>
        )}

        {/* Reef Capacity Display */}
        <div className="mb-4 rounded-lg border border-white/10 bg-white/5 p-3 sm:p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-semibold text-white">
                Capacity
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Expand Button */}
              {!isReleaseMode &&
                expansionCost !== null &&
                expansionCost !== Number.MAX_SAFE_INTEGER && (
                  <button
                    onClick={handleExpandReef}
                    disabled={isExpanding || pearlShards < expansionCost}
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500/40 hover:bg-emerald-500/60 px-2 py-1 text-xs font-medium text-white transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-600"
                    title={`Expand reef capacity (cost: ${expansionCost} Pearl Shards)`}
                  >
                    <span>{isExpanding ? "..." : "Expand"}</span>
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">
                      {expansionCost} 💎
                    </span>
                  </button>
                )}
              <span className="text-xs sm:text-sm font-bold text-white">
                {isReleaseMode && selectedFishForRelease.length > 0 ? (
                  <>
                    <span className="text-blue-400">
                      {fishCount - selectedFishForRelease.length}
                    </span>
                    <span className="text-slate-500">/</span>
                    <span className="text-blue-400">{reefCapacity}</span>
                    <span className="text-slate-500 ml-1">
                      (-{selectedFishForRelease.length})
                    </span>
                  </>
                ) : (
                  <>
                    <span
                      className={
                        fishCount >= reefCapacity
                          ? "text-amber-400"
                          : "text-blue-400"
                      }
                    >
                      {fishCount}
                    </span>
                    <span className="text-slate-500">/</span>
                    <span
                      className={
                        fishCount >= reefCapacity
                          ? "text-amber-400"
                          : "text-blue-400"
                      }
                    >
                      {reefCapacity}
                    </span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden relative mb-3">
            {reefCapacity > 0 && (
              <>
                {isReleaseMode && selectedFishForRelease.length > 0 ? (
                  <>
                    <div
                      className="h-full bg-linear-to-r from-blue-500 to-blue-400 transition-all duration-300 absolute left-0"
                      style={{
                        width: `${Math.min(
                          ((fishCount - selectedFishForRelease.length) /
                            reefCapacity) *
                          100,
                          100
                        )}%`,
                      }}
                    />
                    <div
                      className="h-full bg-linear-to-r from-emerald-500/50 to-emerald-400/50 transition-all duration-300 absolute left-0 border-r-2 border-emerald-300/30"
                      style={{
                        width: `${(selectedFishForRelease.length / reefCapacity) * 100
                          }%`,
                        left: `${((fishCount - selectedFishForRelease.length) /
                          reefCapacity) *
                          100
                          }%`,
                      }}
                    />
                  </>
                ) : (
                  <div
                    className={`h-full transition-all duration-300 absolute left-0 ${fishCount >= reefCapacity
                      ? "bg-linear-to-r from-amber-500 to-amber-400"
                      : "bg-linear-to-r from-blue-500 to-blue-400"
                      }`}
                    style={{
                      width: `${Math.min(
                        (fishCount / reefCapacity) * 100,
                        100
                      )}%`,
                    }}
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* Fish Grid */}
        {isFishLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 animate-pulse">
            {[1, 2].map((i) => (
              <FishCardSkeleton key={i} id={i} />
            ))}
          </div>
        ) : fishCount === 0 && releasingFishIds.size === 0 ? (
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
            <p className="text-sm text-slate-400">
              Hatch eggs in the Nest to get your first fish!
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {sortedFish.map((f) => {
                // Show skeleton for releasing fish
                if (releasingFishIds.has(f.tokenId)) {
                  return <FishCardSkeleton key={f.tokenId} id={f.tokenId} />;
                }

                const rarity =
                  CONTRACT_RARITY_MAP[f.info.rarity] || Rarity.Common;

                return (
                  <FishCard
                    key={f.tokenId}
                    tokenId={f.tokenId}
                    rarity={rarity}
                    pendingDust={f.pendingDust}
                    timeUntilNextEgg={f.timeUntilNextEgg}
                    onLayEgg={handleLayEgg}
                    onSelect={isReleaseMode ? toggleFishForRelease : undefined}
                    isSelected={
                      isReleaseMode &&
                      selectedFishForRelease.includes(f.tokenId)
                    }
                    isLoading={isLayingEgg}
                    canLayEgg={hasEnoughDust}
                    isReleaseMode={isReleaseMode}
                  />
                );
              })}

              {/* Skeleton cards for fish being released that are no longer in the list */}
              {Array.from(releasingFishIds)
                .filter((id) => !fish.some((f) => f.tokenId === id))
                .map((id) => (
                  <FishCardSkeleton key={id} id={id} />
                ))}
            </div>

            {/* Release Button */}
            {isReleaseMode && (
              <div className="mt-4">
                <button
                  onClick={handleRelease}
                  disabled={isReleasing || selectedFishForRelease.length === 0}
                  className="w-full cursor-pointer rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg transition bg-red-700/80 hover:bg-red-700/90 disabled:cursor-not-allowed disabled:bg-slate-600"
                >
                  {isReleasing ? (
                    "Releasing..."
                  ) : selectedFishForRelease.length > 0 ? (
                    <>
                      Release {selectedFishForRelease.length} fish
                      <span className="ml-2 text-xs opacity-90">
                        +{releaseReward} ✨
                      </span>
                    </>
                  ) : (
                    "Select fish to release"
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {/* Release Confirmation Modal */}
        {showReleaseConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowReleaseConfirmModal(false)}
            />
            <div className="relative z-10 mx-4 w-full max-w-md animate-[scaleIn_0.3s_ease-out] rounded-2xl border border-white/10 bg-linear-to-b from-slate-800/90 to-slate-900/90 p-4 sm:p-6 text-center shadow-2xl backdrop-blur-md">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-amber-500/20 p-4">
                  <svg
                    className="h-12 w-12 text-amber-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              </div>

              <h2 className="mb-2 text-xl sm:text-2xl font-bold text-white">
                Confirm Release
              </h2>
              <p className="mb-4 text-sm text-slate-400">
                Are you sure you want to release {selectedFishForRelease.length}{" "}
                fish?
              </p>

              <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-left">
                <p className="text-xs text-amber-300">
                  <strong className="font-semibold">
                    ⚠️ This action is permanent!
                  </strong>
                  <br />
                  Your NFTs will be burned (sent to a burn address) and cannot
                  be recovered. You will receive {releaseReward} Spawn Dust as a
                  reward.
                </p>
              </div>

              <div className="mb-6 rounded-lg bg-white/5 p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">You will receive:</span>
                  <span className="text-white font-semibold">
                    +{releaseReward} ✨ Spawn Dust
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowReleaseConfirmModal(false)}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition cursor-pointer hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRelease}
                  disabled={isReleasing}
                  className="flex-1 rounded-xl bg-red-700/80 px-4 py-3 text-sm font-medium text-white transition cursor-pointer hover:bg-red-700/90 disabled:cursor-not-allowed disabled:bg-slate-600"
                >
                  {isReleasing ? "Releasing..." : "Confirm Release"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
