"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useFish } from "@/hooks/useFish";
import { useFryReef } from "@/hooks/useFryReef";
import { Rarity, RARITY_CONFIG, getFishImage, MERGE } from "@/constants/gameConfig";
import { FishRarity } from "@/contracts/fishNft";

// Map contract rarity to our enum
const rarityMap: Record<number, Rarity> = {
  [FishRarity.Common]: Rarity.Common,
  [FishRarity.Rare]: Rarity.Rare,
  [FishRarity.Epic]: Rarity.Epic,
  [FishRarity.Legendary]: Rarity.Legendary,
  [FishRarity.Mythic]: Rarity.Mythic,
};

interface SelectedFish {
  tokenId: number;
  rarity: Rarity;
}

interface EvolutionTabProps {
  onGoToReef?: () => void;
}

export function EvolutionTab({ onGoToReef }: EvolutionTabProps) {
  const { fish, totalPendingDust, isLoading: isFishLoading, refetch } = useFish();
  const {
    spawnDust,
    mergeFish,
    isWriting,
    isSuccess,
    error,
    refetchUserInfo,
    resetWrite,
  } = useFryReef();

  const [selectedFish, setSelectedFish] = useState<SelectedFish[]>([]);
  const [prevIsWriting, setPrevIsWriting] = useState(false);

  // Refetch and clear selection after successful merge transaction
  useEffect(() => {
    if (prevIsWriting && !isWriting && isSuccess) {
      // Clear selected fish
      setSelectedFish([]);
      // Reset write state
      resetWrite?.();
      // Refetch data after merge to update spawnDust and fish list
      const timer = setTimeout(() => {
        refetch();
        refetchUserInfo();
      }, 1500);
      return () => clearTimeout(timer);
    }
    setPrevIsWriting(isWriting);
  }, [isWriting, prevIsWriting, isSuccess, refetch, refetchUserInfo, resetWrite]);

  // Prepare fish data with rarity
  const fishWithRarity = useMemo(() => {
    return fish.map((f) => ({
      tokenId: f.tokenId,
      rarity: rarityMap[f.info.rarity] || Rarity.Common,
      info: f.info,
      pendingDust: f.pendingDust,
    }));
  }, [fish]);

  // Filter out Mythic fish (cannot be merged)
  const mergeableFish = useMemo(() => {
    return fishWithRarity.filter((f) => f.rarity !== Rarity.Mythic);
  }, [fishWithRarity]);

  // Toggle fish selection
  const toggleFish = (tokenId: number, rarity: Rarity) => {
    setSelectedFish((prev) => {
      const isSelected = prev.some((f) => f.tokenId === tokenId);
      if (isSelected) {
        return prev.filter((f) => f.tokenId !== tokenId);
      } else {
        // Max 2 fish can be selected
        if (prev.length >= 2) {
          return prev;
        }
        return [...prev, { tokenId, rarity }];
      }
    });
  };

  // Check if merge is valid
  const mergeValidation = useMemo(() => {
    if (selectedFish.length !== 2) {
      return { isValid: false, reason: "Select 2 fish to merge" };
    }

    const [fish1, fish2] = selectedFish;
    if (fish1.rarity !== fish2.rarity) {
      return { isValid: false, reason: "Fish must be same rarity" };
    }

    const mergeConfig = MERGE[fish1.rarity as keyof typeof MERGE];
    if (!mergeConfig) {
      return { isValid: false, reason: "Cannot merge this rarity" };
    }

    // Check if user has enough Spawn Dust (only claimed dust can be used)
    if (spawnDust < mergeConfig.spawnDustCost) {
      return {
        isValid: false,
        reason: `Need ${mergeConfig.spawnDustCost} Spawn Dust`,
      };
    }

    return {
      isValid: true,
      mergeConfig,
      nextRarity: mergeConfig.nextRarity,
    };
  }, [selectedFish, spawnDust]);

  // Handle merge
  const handleMerge = async () => {
    if (!mergeValidation.isValid || selectedFish.length !== 2 || isWriting) return;

    const [fish1, fish2] = selectedFish;
    // Merge directly - user should claim dust before merging
    mergeFish(fish1.tokenId, fish2.tokenId);
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-white/5 p-4 sm:p-6 backdrop-blur-sm">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">
            Merge Fish
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Select 2 fish of the same rarity to merge them into a higher rarity
          </p>
        </div>

        {/* Selected Fish Info */}
        {selectedFish.length > 0 && (
          <div className="mb-4 rounded-lg bg-white/5 p-3">
            <p className="mb-2 text-xs sm:text-sm text-slate-400">
              Selected: {selectedFish.length}/2
            </p>
            {selectedFish.length === 2 && mergeValidation.isValid && mergeValidation.mergeConfig && (
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-slate-400">Cost:</span>
                  <span className="text-white">
                    ✨ {mergeValidation.mergeConfig.spawnDustCost}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-slate-400">Rewards:</span>
                  <div className="flex items-center gap-2">
                    {mergeValidation.mergeConfig.pearlShardsReward > 0 && (
                      <span className="text-white">
                        💎 +{mergeValidation.mergeConfig.pearlShardsReward}
                      </span>
                    )}
                    {mergeValidation.mergeConfig.eggsReward > 0 && (
                      <span className="text-white">
                        🟠 +{mergeValidation.mergeConfig.eggsReward}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-slate-400">Result:</span>
                  <span
                    className="font-semibold"
                    style={{
                      color: RARITY_CONFIG[mergeValidation.nextRarity!].color,
                    }}
                  >
                    {RARITY_CONFIG[mergeValidation.nextRarity!].name}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Fish Grid */}
        {isFishLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-white/10 bg-white/5 p-3"
              >
                <div className="mx-auto mb-2 h-16 w-16 rounded-full bg-white/10" />
                <div className="h-4 w-full rounded bg-white/5" />
              </div>
            ))}
          </div>
        ) : mergeableFish.length === 0 ? (
          <div className="py-8 text-center">
            <div className="mb-4 flex justify-center">
              <Image
                src="/images/common/coral.webp"
                alt="Coral"
                width={120}
                height={120}
                className="object-contain opacity-50"
              />
            </div>
            <h3 className="mb-2 text-base font-medium text-white">
              No Mergeable Fish
            </h3>
            <p className="text-sm text-slate-400">
              You need at least 2 fish of the same rarity (except Mythic) to
              merge
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
              {mergeableFish.map((f) => {
                const isSelected = selectedFish.some(
                  (s) => s.tokenId === f.tokenId
                );
                const config = RARITY_CONFIG[f.rarity];
                const fishImage = getFishImage(f.rarity);

                return (
                  <label
                    key={f.tokenId}
                    className={`group relative cursor-pointer rounded-xl border-2 transition ${
                      isSelected
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleFish(f.tokenId, f.rarity)}
                      disabled={
                        !isSelected &&
                        selectedFish.length >= 2 &&
                        !selectedFish.some((s) => s.rarity === f.rarity)
                      }
                      className="sr-only"
                    />
                    <div className="p-2 sm:p-3">
                      {/* Fish Image */}
                      <div className="relative mx-auto mb-1.5 sm:mb-2 h-12 w-12 sm:h-16 sm:w-16">
                        <Image
                          src={fishImage}
                          alt={config.name}
                          fill
                          className="object-contain"
                        />
                      </div>

                      {/* Token ID */}
                      <div className="text-center">
                        <span className="text-[10px] text-slate-400">
                          #{f.tokenId}
                        </span>
                      </div>

                      {/* Rarity Badge */}
                      <div
                        className="mt-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase text-center"
                        style={{
                          backgroundColor: `${config.color}20`,
                          color: config.color,
                        }}
                      >
                        {config.name}
                      </div>

                      {/* Pending Dust */}
                      {f.pendingDust > 0 && (
                        <div className="mt-1 text-center">
                          <span className="text-[9px] text-amber-400">
                            +{f.pendingDust} ✨
                          </span>
                        </div>
                      )}

                      {/* Checkbox Indicator */}
                      {isSelected && (
                        <div className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
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
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Merge Button */}
            <div className="mt-4">
              <button
                onClick={handleMerge}
                disabled={
                  !mergeValidation.isValid ||
                  isWriting ||
                  selectedFish.length !== 2
                }
                className={`w-full cursor-pointer rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg transition ${
                  mergeValidation.isValid && selectedFish.length === 2
                    ? "bg-baseBlue hover:bg-baseBlue/80"
                    : "cursor-not-allowed bg-slate-600"
                } disabled:cursor-not-allowed`}
              >
                {isWriting ? (
                  "Merging..."
                ) : selectedFish.length < 2 ? (
                  "Select 2 fish"
                ) : !mergeValidation.isValid ? (
                  mergeValidation.reason
                ) : (
                  <>
                    Merge for ✨ {mergeValidation.mergeConfig?.spawnDustCost}
                  </>
                )}
              </button>
            </div>

            {/* Warning about unclaimed dust from selected fish */}
            {selectedFish.length === 2 && (() => {
              const selectedPendingDust = selectedFish.reduce((sum, fish) => {
                const fishData = fishWithRarity.find(f => f.tokenId === fish.tokenId);
                return sum + (fishData?.pendingDust || 0);
              }, 0);
              
              return selectedPendingDust > 0 ? (
                <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                  <p className="text-xs text-amber-400">
                    ⚠️ Warning: Selected fish have {selectedPendingDust} unclaimed Spawn Dust. 
                    Claim it before merging, or it will be lost when the fish are merged.
                  </p>
                </div>
              ) : null;
            })()}

            {/* Error Message */}
            {error && (
              <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                <p className="text-xs text-red-400">
                  {error.message || "Transaction failed. Please try again."}
                </p>
              </div>
            )}
          </>
        )}
      </div>
  );
}

