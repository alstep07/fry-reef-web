"use client";

import { useEffect, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import Image from "next/image";
import { useEggs, type EggWithInfo } from "@/hooks/useEggs";
import { useFryReef } from "@/hooks/useFryReef";
import { INCUBATION, Rarity, EGG_IMAGE } from "@/constants/gameConfig";
import { HatchModal } from "./HatchModal";
import { fishNftAbi, FISH_NFT_ADDRESS, FishRarity } from "@/contracts/fishNft";
import { baseSepolia } from "wagmi/chains";

interface EggCardProps {
  egg: EggWithInfo;
  onIncubate: (tokenId: number) => void;
  onHatch: (tokenId: number) => void;
  isLoading: boolean;
  pearlShards: number;
}

function EggCard({ egg, onIncubate, onHatch, isLoading, pearlShards }: EggCardProps) {
  const { tokenId, info } = egg;

  // Calculate time remaining and progress
  const calculateTimeAndProgress = () => {
    if (!info.isIncubating) return { timeLeft: 0, progress: 0 };
    const elapsed = Date.now() / 1000 - Number(info.incubationStartedAt);
    const total = INCUBATION.durationSeconds;
    const timeLeft = Math.max(0, total - elapsed);
    const progress = Math.min(100, (elapsed / total) * 100);
    return { timeLeft, progress };
  };

  const [{ timeLeft, progress }, setTimeData] = useState(() => calculateTimeAndProgress());

  // Update every second when incubating
  useEffect(() => {
    if (!info.isIncubating) {
      setTimeData({ timeLeft: 0, progress: 0 });
      return;
    }

    // Initial calculation
    setTimeData(calculateTimeAndProgress());

    const interval = setInterval(() => {
      setTimeData(calculateTimeAndProgress());
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [info.isIncubating, info.incubationStartedAt]);

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return "00h 00m 00s";
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return `${String(hours).padStart(2, "0")}h ${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`;
  };

  // Check if ready to hatch (use local timeLeft for real-time updates)
  const isReadyToHatch = info.isIncubating && timeLeft <= 0;

  // Status styling
  const getStatusStyle = () => {
    if (isReadyToHatch) return "border-green-500/30 bg-green-500/5";
    if (info.isIncubating) return "border-baseBlue/30 bg-baseBlue/5";
    return "border-white/10 bg-white/5";
  };

  return (
    <div className={`group relative rounded-xl sm:rounded-2xl border p-3 sm:p-4 backdrop-blur-sm ${getStatusStyle()}`}>
      {/* Status badge */}
      {isReadyToHatch && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-green-500 px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[10px] font-bold text-white shadow-lg">
          Ready to hatch
        </div>
      )}
      {info.isIncubating && !isReadyToHatch && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-baseBlue px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[10px] font-bold text-white shadow-lg whitespace-nowrap">
          Incubating
        </div>
      )}

      {/* Egg Visual */}
      <div className="relative mx-auto mb-2 sm:mb-3 h-16 w-16 sm:h-20 sm:w-20">
        {/* Glow effect */}
        {isReadyToHatch && (
          <div className="absolute inset-0 animate-pulse rounded-full bg-green-500/20 blur-xl" />
        )}
        {info.isIncubating && !isReadyToHatch && (
          <div className="absolute inset-0 rounded-full bg-baseBlue/10 blur-lg" />
        )}

        {/* Egg image */}
        <div className={`relative flex h-full w-full items-center justify-center ${!info.isIncubating ? "animate-float" : ""}`}>
          <Image
            src={EGG_IMAGE}
            alt="Egg"
            width={48}
            height={48}
            className="object-contain sm:w-16 sm:h-16"
          />
        </div>

        {/* Progress ring for incubating eggs */}
        {info.isIncubating && !isReadyToHatch && (
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
        <p className="text-[10px] sm:text-xs font-medium text-slate-400">#{tokenId}</p>

        {!info.isIncubating ? (
          <button
            onClick={() => onIncubate(tokenId)}
            disabled={isLoading || pearlShards < INCUBATION.pearlShardCost}
            className="mt-1.5 sm:mt-2 w-full cursor-pointer rounded-lg bg-baseBlue/80 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium text-white transition hover:bg-baseBlue disabled:cursor-not-allowed disabled:bg-slate-600"
          >
            {pearlShards < INCUBATION.pearlShardCost
              ? `Need ${INCUBATION.pearlShardCost} 💎`
              : isLoading
                ? "..."
                : `Incubate (${INCUBATION.pearlShardCost} 💎)`}
          </button>
        ) : (
          <>
            {timeLeft > 0 && (
              <p className="mt-1 text-[9px] sm:text-[10px] tabular-nums text-slate-400">{formatTime(timeLeft)}</p>
            )}
            <button
              onClick={() => onHatch(tokenId)}
              disabled={isLoading || timeLeft > 0}
              className={`mt-1.5 sm:mt-2 w-full cursor-pointer rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium text-white transition disabled:cursor-not-allowed disabled:bg-slate-600 ${
                timeLeft <= 0 ? "bg-green-500 hover:bg-green-400" : "bg-slate-600"
              }`}
            >
              {isLoading ? "..." : "Hatch 🐣"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// Map contract rarity (number) to our Rarity enum (string)
const rarityMap: Record<number, Rarity> = {
  [FishRarity.Common]: Rarity.Common,
  [FishRarity.Rare]: Rarity.Rare,
  [FishRarity.Epic]: Rarity.Epic,
  [FishRarity.Legendary]: Rarity.Legendary,
  [FishRarity.Mythic]: Rarity.Mythic,
};

interface NestTabProps {
  onGoToReef?: () => void;
}

export function NestTab({ onGoToReef }: NestTabProps) {
  const { address } = useAccount();
  const { eggs, eggCount, refetch, isLoading: isEggsLoading } = useEggs();
  const { pearlShards, isWriting, isSuccess, startIncubation, hatchEgg } = useFryReef();

  // Modal state
  const [showHatchModal, setShowHatchModal] = useState(false);
  const [hatchedFishId, setHatchedFishId] = useState<number | null>(null);
  const [hatchedRarity, setHatchedRarity] = useState<Rarity | null>(null);
  const [pendingHatch, setPendingHatch] = useState(false);

  // Get user's fish to detect new ones
  const { data: fishIds, refetch: refetchFish } = useReadContract({
    address: FISH_NFT_ADDRESS as `0x${string}`,
    abi: fishNftAbi,
    functionName: "getFishByOwner",
    args: address ? [address] : undefined,
    chainId: baseSepolia.id,
    query: {
      enabled: !!address && !!FISH_NFT_ADDRESS,
    },
  });

  // Track fish count before hatch
  const [fishCountBefore, setFishCountBefore] = useState<number | null>(null);

  // After successful transaction, refetch all data
  useEffect(() => {
    if (!isSuccess) return;

    const timer = setTimeout(() => {
      // Always refetch both - safe to call even if not needed
      refetchFish();
      refetch();
    }, 2000);

    return () => clearTimeout(timer);
  }, [isSuccess, refetch, refetchFish]);

  // Detect new fish after hatch
  useEffect(() => {
    if (pendingHatch && fishIds && fishCountBefore !== null) {
      const currentCount = (fishIds as bigint[]).length;
      if (currentCount > fishCountBefore) {
        // New fish hatched!
        const newFishId = Number((fishIds as bigint[])[currentCount - 1]);
        setHatchedFishId(newFishId);
        setPendingHatch(false);
        setFishCountBefore(null);
        // Refetch immediately when fish detected
        refetch();
      }
    }
  }, [fishIds, pendingHatch, fishCountBefore, refetch]);

  // Get fish info when we have a new fish ID
  const { data: fishInfo } = useReadContract({
    address: FISH_NFT_ADDRESS as `0x${string}`,
    abi: fishNftAbi,
    functionName: "getFishInfo",
    args: hatchedFishId !== null ? [BigInt(hatchedFishId)] : undefined,
    chainId: baseSepolia.id,
    query: {
      enabled: hatchedFishId !== null,
    },
  });

  // Show modal when we have fish info
  useEffect(() => {
    if (fishInfo && hatchedFishId !== null) {
      const info = fishInfo as { rarity: number };
      setHatchedRarity(rarityMap[info.rarity] || Rarity.Common);
      setShowHatchModal(true);
    }
  }, [fishInfo, hatchedFishId]);

  const handleIncubate = async (tokenId: number) => {
    await startIncubation(tokenId);
  };

  const handleHatch = async (tokenId: number) => {
    // Store current fish count before hatch
    const currentCount = fishIds ? (fishIds as bigint[]).length : 0;
    setFishCountBefore(currentCount);
    setPendingHatch(true);
    await hatchEgg(tokenId);
  };

  const handleCloseModal = () => {
    setShowHatchModal(false);
    setHatchedFishId(null);
    setHatchedRarity(null);
  };

  const handleGoToReef = () => {
    handleCloseModal();
    onGoToReef?.();
  };

  return (
    <>
      <HatchModal
        isOpen={showHatchModal}
        rarity={hatchedRarity}
        fishId={hatchedFishId}
        onClose={handleCloseModal}
        onGoToReef={handleGoToReef}
      />
      <div className="rounded-2xl border border-white/5 bg-white/5 p-4 sm:p-6 backdrop-blur-sm">
        <div className="mb-3 sm:mb-4 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-semibold text-white">Nest</h2>
          {eggCount > 0 && (
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-slate-300">
              {eggCount} {eggCount === 1 ? "egg" : "eggs"}
            </span>
          )}
        </div>

        {isEggsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-baseBlue" />
          </div>
        ) : eggCount === 0 ? (
          <div className="py-6 sm:py-8 text-center">
            <div className="mb-3 sm:mb-4 flex justify-center">
              <Image
                src={EGG_IMAGE}
                alt="Egg"
                width={120}
                height={120}
                className="object-contain opacity-50 sm:w-[180px] sm:h-[180px]"
              />
            </div>
            <h3 className="mb-1 sm:mb-2 text-sm sm:text-base font-medium text-white">No Eggs Yet</h3>
            <p className="text-xs sm:text-sm text-slate-400">
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
    </>
  );
}

