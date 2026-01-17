"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAccount, useReadContract } from "wagmi";
import Image from "next/image";
import { useEggs, type EggWithInfo } from "@/hooks/useEggs";
import { useFryReef } from "@/hooks/useFryReef";
import {
  INCUBATION,
  Rarity,
  EGG_IMAGE,
  CONTRACT_RARITY_MAP,
} from "@/constants/gameConfig";
import { HatchModal } from "./HatchModal";
import { fishNftAbi, FISH_NFT_ADDRESS } from "@/contracts/fishNft";
import { base } from "wagmi/chains";

interface EggCardProps {
  egg: EggWithInfo;
  onIncubate: (tokenId: number) => void;
  onHatch: (tokenId: number) => void;
  isIncubating: boolean;
  isHatching: boolean;
  pearlShards: number;
  hasSpace: boolean;
}

function EggCard({
  egg,
  onIncubate,
  onHatch,
  isIncubating,
  isHatching,
  pearlShards,
  hasSpace,
}: EggCardProps) {
  const { tokenId, info } = egg;
  const isLoading = isIncubating || isHatching;

  // Initialize with safe values to avoid hydration mismatch
  const [{ timeLeft, progress }, setTimeData] = useState(() => {
    if (!info.isIncubating) return { timeLeft: 0, progress: 0 };
    return { timeLeft: INCUBATION.durationSeconds, progress: 0 };
  });

  // Update every second when incubating
  useEffect(() => {
    if (!info.isIncubating) {
      setTimeData({ timeLeft: 0, progress: 0 });
      return;
    }

    const calculateTimeAndProgress = () => {
      const startedAt = Number(info.incubationStartedAt);
      if (startedAt === 0) {
        return { timeLeft: INCUBATION.durationSeconds, progress: 0 };
      }
      const elapsed = Date.now() / 1000 - startedAt;
      const total = INCUBATION.durationSeconds;
      const timeLeft = Math.max(0, total - elapsed);
      const progress = Math.min(100, (elapsed / total) * 100);
      return { timeLeft, progress };
    };

    setTimeData(calculateTimeAndProgress());

    const interval = setInterval(() => {
      setTimeData(calculateTimeAndProgress());
    }, 1000);

    return () => clearInterval(interval);
  }, [info.isIncubating, info.incubationStartedAt]);

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return "00h 00m 00s";
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(hours).padStart(2, "0")}h ${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`;
  };

  const isReadyToHatch = info.isIncubating && timeLeft <= 0;

  const getStatusStyle = () => {
    if (isReadyToHatch) return "border-green-500/30 bg-green-500/5";
    if (info.isIncubating) return "border-baseBlue/30 bg-baseBlue/5";
    return "border-white/10 bg-white/5";
  };

  return (
    <div
      className={`group relative flex flex-col rounded-xl sm:rounded-2xl border p-3 sm:p-4 backdrop-blur-sm ${getStatusStyle()}`}
    >
      <span className="absolute top-3 left-3 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] text-slate-400">
        #{tokenId}
      </span>

      {isReadyToHatch && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg">
          READY
        </div>
      )}
      {info.isIncubating && !isReadyToHatch && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-baseBlue px-2 py-0.5 text-[10px] font-bold text-white shadow-lg whitespace-nowrap">
          INCUBATING
        </div>
      )}

      <div className="relative mx-auto mb-2 sm:mb-3 h-16 w-16 sm:h-20 sm:w-20">
        {isReadyToHatch && (
          <div className="absolute inset-0 animate-pulse rounded-full bg-green-500/20 blur-md sm:blur-xl" />
        )}
        {info.isIncubating && !isReadyToHatch && (
          <div className="absolute inset-0 rounded-full bg-baseBlue/10 blur-sm sm:blur-lg" />
        )}

        <div
          className={`relative flex h-full w-full items-center justify-center ${!info.isIncubating ? "animate-float" : ""}`}
        >
          <Image
            src={EGG_IMAGE}
            alt="Egg"
            width={48}
            height={48}
            className="object-contain sm:w-16 sm:h-16"
          />
        </div>

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

      <div className="flex-grow flex flex-col text-center">
        {!info.isIncubating ? (
          <button
            onClick={() => onIncubate(tokenId)}
            disabled={isLoading || pearlShards < INCUBATION.pearlShardCost}
            className="mt-auto flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-baseBlue/80 px-3 py-2 text-xs font-medium text-white transition hover:bg-baseBlue disabled:cursor-not-allowed disabled:bg-slate-600"
          >
            {pearlShards < INCUBATION.pearlShardCost ? (
              <>
                <span>Need</span>
                <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">
                  {INCUBATION.pearlShardCost} 💎
                </span>
              </>
            ) : isIncubating ? (
              "..."
            ) : (
              <>
                <span>Incubate</span>
                <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">
                  {INCUBATION.pearlShardCost} 💎
                </span>
              </>
            )}
          </button>
        ) : (
          <div className="mt-auto">
            {timeLeft > 0 && (
              <p className="mb-1 text-[10px] tabular-nums text-slate-400">
                {formatTime(timeLeft)}
              </p>
            )}
            <button
              onClick={() => onHatch(tokenId)}
              disabled={isLoading || timeLeft > 0 || !hasSpace}
              className={`w-full cursor-pointer rounded-lg px-3 py-2 text-xs font-medium text-white transition disabled:cursor-not-allowed disabled:bg-slate-600 ${timeLeft <= 0 && hasSpace
                ? "bg-green-500 hover:bg-green-400"
                : "bg-slate-600"
                }`}
              title={!hasSpace ? "Reef capacity full" : undefined}
            >
              {isHatching ? "..." : !hasSpace ? "No space" : "Hatch"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface NestTabProps {
  onGoToReef?: () => void;
}

export function NestTab({ onGoToReef }: NestTabProps) {
  const { address } = useAccount();
  const { eggs, eggCount, refetch, isLoading: isEggsLoading } = useEggs();
  const {
    pearlShards,
    startIncubation,
    hatchEgg,
    reefCapacity,
    incubationTx,
    hatchTx,
    refetchUserInfo,
  } = useFryReef();

  // Modal state
  const [showHatchModal, setShowHatchModal] = useState(false);
  const [hatchedFishId, setHatchedFishId] = useState<number | null>(null);
  const [hatchedRarity, setHatchedRarity] = useState<Rarity | null>(null);

  // Track fish IDs before hatch to detect new fish
  const fishIdsBeforeRef = useRef<Set<number> | null>(null);

  // Get user's fish to detect new ones
  const { data: fishIds, refetch: refetchFish } = useReadContract({
    address: FISH_NFT_ADDRESS as `0x${string}`,
    abi: fishNftAbi,
    functionName: "getFishByOwner",
    args: address ? [address] : undefined,
    chainId: base.id,
    query: {
      enabled: !!address && !!FISH_NFT_ADDRESS,
    },
  });

  const fishIdsArray = fishIds ? (fishIds as bigint[]).map(id => Number(id)) : [];
  const fishCount = fishIdsArray.length;
  const hasSpace = fishCount < reefCapacity;

  // Get fish info when we have a new fish ID
  const { data: fishInfo, refetch: refetchFishInfo } = useReadContract({
    address: FISH_NFT_ADDRESS as `0x${string}`,
    abi: fishNftAbi,
    functionName: "getFishInfo",
    args: hatchedFishId !== null ? [BigInt(hatchedFishId)] : undefined,
    chainId: base.id,
    query: {
      enabled: hatchedFishId !== null,
    },
  });

  // Show modal when we have fish info
  useEffect(() => {
    if (fishInfo && hatchedFishId !== null) {
      // Parse fishInfo - can be tuple [rarity, mintedAt, lastDustCollectedAt, lastEggLaidAt] or object
      const result = fishInfo as {
        rarity?: number;
        mintedAt?: bigint;
        lastDustCollectedAt?: bigint;
        lastEggLaidAt?: bigint;
      } | [number, bigint, bigint, bigint];

      let rarity: number;
      if (Array.isArray(result)) {
        // Tuple format: [rarity, mintedAt, lastDustCollectedAt, lastEggLaidAt]
        rarity = Number(result[0] ?? 0);
      } else {
        // Object format
        rarity = Number(result.rarity ?? 0);
      }

      setHatchedRarity(CONTRACT_RARITY_MAP[rarity] || Rarity.Common);
      setShowHatchModal(true);
    }
  }, [fishInfo, hatchedFishId]);

  const handleIncubate = useCallback(
    async (tokenId: number) => {
      const success = await startIncubation(tokenId);
      if (success) {
        refetch();
        refetchUserInfo();
      }
    },
    [startIncubation, refetch, refetchUserInfo]
  );

  const handleHatch = useCallback(
    async (tokenId: number) => {
      // Store current fish IDs before hatch
      fishIdsBeforeRef.current = new Set(fishIdsArray);

      const success = await hatchEgg(tokenId);
      if (success) {
        // Wait a bit for RPC to sync
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Refetch to get new fish - use result directly since state won't update immediately
        const result = await refetchFish();
        const updatedFishIds = result.data as bigint[] | undefined;
        // Detect new fish by finding the one that wasn't in the old set
        if (updatedFishIds && fishIdsBeforeRef.current) {
          const updatedFishIdsArray = updatedFishIds.map(id => Number(id));
          const newFishId = updatedFishIdsArray.find(id => !fishIdsBeforeRef.current!.has(id));

          if (newFishId !== undefined) {
            setHatchedFishId(newFishId);
            // Wait a bit more and refetch fish info to ensure we get the correct rarity
            setTimeout(() => {
              refetchFishInfo();
            }, 1000);
          }
        }

        refetch();
        refetchUserInfo();
        fishIdsBeforeRef.current = null;
      }
    },
    [hatchEgg, fishIdsArray, refetchFish, refetchFishInfo, refetch, refetchUserInfo]
  );

  const handleCloseModal = useCallback(() => {
    setShowHatchModal(false);
    setHatchedFishId(null);
    setHatchedRarity(null);
  }, []);

  const handleGoToReef = useCallback(() => {
    handleCloseModal();
    onGoToReef?.();
  }, [handleCloseModal, onGoToReef]);

  return (
    <>
      <HatchModal
        isOpen={showHatchModal}
        rarity={hatchedRarity}
        fishId={hatchedFishId}
        onClose={handleCloseModal}
        onGoToReef={handleGoToReef}
      />
      <div className="rounded-2xl border min-h-[200px] border-white/5 bg-white/5 p-4 sm:p-6 backdrop-blur-sm">
        <div className="mb-3 sm:mb-4 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-semibold text-white">Nest</h2>
          {eggCount > 0 && (
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-slate-300">
              {eggCount} {eggCount === 1 ? "egg" : "eggs"}
            </span>
          )}
        </div>

        {isEggsLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 animate-pulse">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4"
              >
                <div className="mx-auto mb-2 sm:mb-3 h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-white/10" />
                <div className="flex flex-col items-center gap-2">
                  <div className="h-8 w-full rounded-lg bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        ) : eggCount === 0 ? (
          <div className="py-6 sm:py-4 text-center">
            <div className="mb-2 sm:mb-4 flex justify-center">
              <Image
                src={EGG_IMAGE}
                alt="Egg"
                width={120}
                height={120}
                className="object-contain opacity-50"
              />
            </div>
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
                isIncubating={incubationTx.isLoading}
                isHatching={hatchTx.isLoading}
                pearlShards={pearlShards}
                hasSpace={hasSpace}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
