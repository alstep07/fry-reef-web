"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Rarity, RARITY_CONFIG, getFishImage, MERGE } from "@/constants/gameConfig";

interface MergeModalProps {
  isOpen: boolean;
  selectedFishId: number;
  selectedRarity: Rarity;
  availableFish: Array<{ tokenId: number; rarity: Rarity }>;
  spawnDust: number;
  onClose: () => void;
  onMerge: (fishId1: number, fishId2: number) => void;
  isLoading: boolean;
}

export function MergeModal({
  isOpen,
  selectedFishId,
  selectedRarity,
  availableFish,
  spawnDust,
  onClose,
  onMerge,
  isLoading,
}: MergeModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const mergeConfig = MERGE[selectedRarity as keyof typeof MERGE];
  if (!mergeConfig) return null; // Mythic cannot be merged

  const canMerge = spawnDust >= mergeConfig.spawnDustCost;
  const sameRarityFish = availableFish.filter(
    (f) => f.rarity === selectedRarity && f.tokenId !== selectedFishId
  );

  const config = RARITY_CONFIG[selectedRarity];
  const nextConfig = RARITY_CONFIG[mergeConfig.nextRarity];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 mx-4 w-full max-w-md animate-[scaleIn_0.3s_ease-out] rounded-2xl border border-white/10 bg-gradient-to-b from-slate-800/90 to-slate-900/90 p-4 sm:p-6 text-center shadow-2xl backdrop-blur-md">
        {/* Title */}
        <h2 className="mb-4 text-xl sm:text-2xl font-bold text-white">
          Merge Fish
        </h2>

        {/* Selected Fish */}
        <div className="mb-4">
          <p className="mb-2 text-sm text-slate-400">Selected Fish:</p>
          <div className="flex items-center justify-center gap-2">
            <div className="relative h-12 w-12 sm:h-16 sm:w-16">
              <Image
                src={getFishImage(selectedRarity)}
                alt={config.name}
                fill
                className="object-contain"
              />
            </div>
            <span className="text-lg">+</span>
            <div className="relative h-12 w-12 sm:h-16 sm:w-16 opacity-50">
              <Image
                src={getFishImage(selectedRarity)}
                alt={config.name}
                fill
                className="object-contain"
              />
            </div>
            <span className="text-lg">→</span>
            <div className="relative h-12 w-12 sm:h-16 sm:w-16">
              <Image
                src={getFishImage(mergeConfig.nextRarity)}
                alt={nextConfig.name}
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>

        {/* Cost */}
        <div className="mb-4 rounded-lg bg-white/5 p-3">
          <p className="mb-2 text-sm text-slate-400">Cost:</p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <span>✨</span>
              <span className={canMerge ? "text-white" : "text-red-400"}>
                {mergeConfig.spawnDustCost}
              </span>
            </div>
          </div>
        </div>

        {/* Rewards */}
        <div className="mb-4 rounded-lg bg-white/5 p-3">
          <p className="mb-2 text-sm text-slate-400">Rewards:</p>
          <div className="flex items-center justify-center gap-4 text-sm">
            {mergeConfig.pearlShardsReward > 0 && (
              <div className="flex items-center gap-1">
                <span>💎</span>
                <span className="text-white">+{mergeConfig.pearlShardsReward}</span>
              </div>
            )}
            {mergeConfig.eggsReward > 0 && (
              <div className="flex items-center gap-1">
                <span>🟠</span>
                <span className="text-white">+{mergeConfig.eggsReward}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <span className="text-white">{nextConfig.name}</span>
            </div>
          </div>
        </div>

        {/* Available Fish */}
        {sameRarityFish.length === 0 ? (
          <div className="mb-4 rounded-lg bg-red-500/10 p-3">
            <p className="text-sm text-red-400">
              No other {config.name} fish available for merge
            </p>
          </div>
        ) : (
          <div className="mb-4">
            <p className="mb-2 text-sm text-slate-400">
              Select second fish to merge:
            </p>
            <div className="max-h-48 space-y-2 overflow-y-auto">
              {sameRarityFish.map((fish) => (
                <button
                  key={fish.tokenId}
                  onClick={() => {
                    onMerge(selectedFishId, fish.tokenId);
                  }}
                  disabled={isLoading || !canMerge}
                  className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/5 p-2 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div className="flex items-center gap-2">
                    <div className="relative h-8 w-8">
                      <Image
                        src={getFishImage(fish.rarity)}
                        alt={config.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="text-sm text-white">
                      #{fish.tokenId} - {config.name}
                    </span>
                  </div>
                  {isLoading && (
                    <span className="text-xs text-slate-400">...</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="flex-1 cursor-pointer rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-slate-300 transition hover:bg-white/10"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

