"use client";

import { useMemo, useRef, useEffect } from "react";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { base } from "wagmi/chains";
import { keepPreviousData, useQueryClient } from "@tanstack/react-query";
import {
  fishNftAbi,
  FISH_NFT_ADDRESS,
  type FishInfo,
} from "@/contracts/fishNft";
import { fryReefAbi, FRYREEF_ADDRESS } from "@/contracts/fryReef";

export interface FishWithInfo {
  tokenId: number;
  info: FishInfo;
  pendingDust: number;
  timeUntilNextEgg: number;
  isInfoLoaded: boolean;
  isActive: boolean; // Whether fish is active (within reef capacity)
}

export function useFish() {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const previousTimeValuesRef = useRef<Map<number, number>>(new Map());
  const previousFishInfoRef = useRef<Map<number, FishInfo>>(new Map());
  const fishLoadingStartRef = useRef<Map<number, number>>(new Map());
  const LOADING_TIMEOUT = 8000;

  const contractAddress = FISH_NFT_ADDRESS
    ? (FISH_NFT_ADDRESS as `0x${string}`)
    : undefined;

  const fryReefAddress = FRYREEF_ADDRESS
    ? (FRYREEF_ADDRESS as `0x${string}`)
    : undefined;

  // Get fish IDs owned by user
  const { data: fishIds, isLoading: isLoadingIds } = useReadContract({
    address: contractAddress,
    abi: fishNftAbi,
    functionName: "getFishByOwner",
    args: address ? [address] : undefined,
    chainId: base.id,
    query: {
      enabled: !!address && !!contractAddress,
    },
  });

  // Get total pending spawn dust for user
  const { data: totalPendingDust } = useReadContract({
    address: fryReefAddress,
    abi: fryReefAbi,
    functionName: "getPendingSpawnDust",
    args: address ? [address] : undefined,
    chainId: base.id,
    query: {
      enabled: !!address && !!fryReefAddress,
    },
  });

  // Get active fish count (within reef capacity)
  const { data: activeFishCount } = useReadContract({
    address: fryReefAddress,
    abi: fryReefAbi,
    functionName: "getActiveFishCount",
    args: address ? [address] : undefined,
    chainId: base.id,
    query: {
      enabled: !!address && !!fryReefAddress,
      refetchInterval: 5000,
    },
  });

  const fishIdsArray = (fishIds as bigint[]) || [];

  // Get ALL fish data in ONE request with polling
  const fishDataContracts = fishIdsArray.flatMap((id) => [
    {
      address: contractAddress!,
      abi: fishNftAbi,
      functionName: "getFishInfo" as const,
      args: [id] as const,
      chainId: base.id,
    },
    {
      address: contractAddress!,
      abi: fishNftAbi,
      functionName: "getPendingDustForFish" as const,
      args: [id] as const,
      chainId: base.id,
    },
    {
      address: fryReefAddress!,
      abi: fryReefAbi,
      functionName: "getTimeUntilNextEgg" as const,
      args: [id] as const,
      chainId: base.id,
    },
  ]);

  const { data: fishDataResults, isLoading: isLoadingData } = useReadContracts({
    contracts: fishDataContracts,
    query: {
      enabled: fishIdsArray.length > 0 && !!contractAddress && !!fryReefAddress,
      refetchInterval: 5000, // Poll all data every 5 seconds
      staleTime: 4000,
      placeholderData: keepPreviousData,
    },
  });

  // Combine data
  const fish: FishWithInfo[] = useMemo(() => {
    // Default to all fish being active if activeFishCount is not loaded yet
    const activeCount = activeFishCount !== undefined && activeFishCount !== null
      ? Number(activeFishCount as bigint)
      : fishIdsArray.length;

    return fishIdsArray.map((id, index) => {
      const baseIdx = index * 3;
      const infoResult = fishDataResults?.[baseIdx];
      const dustResult = fishDataResults?.[baseIdx + 1];
      const timeResult = fishDataResults?.[baseIdx + 2];

      const tokenIdNum = Number(id);
      const now = Date.now();

      if (!fishLoadingStartRef.current.has(tokenIdNum)) {
        fishLoadingStartRef.current.set(tokenIdNum, now);
      }
      const loadingStartTime =
        fishLoadingStartRef.current.get(tokenIdNum) || now;
      const hasBeenLoadingTooLong = now - loadingStartTime > LOADING_TIMEOUT;

      const isInfoLoaded =
        (infoResult?.status === "success" &&
          infoResult?.result !== undefined) ||
        hasBeenLoadingTooLong;

      // Fish is active if its index is within active count (based on tokenOfOwnerByIndex order)
      const isActive = index < activeCount;

      let info: FishInfo;
      const hasInfoResult =
        infoResult?.status === "success" && infoResult?.result !== undefined;

      if (hasInfoResult) {
        const result = infoResult.result as
          | {
              rarity?: number;
              mintedAt?: bigint;
              lastDustCollectedAt?: bigint;
              lastEggLaidAt?: bigint;
            }
          | [number, bigint, bigint, bigint];

        if (Array.isArray(result)) {
          info = {
            rarity: Number(result[0] ?? 0),
            mintedAt: BigInt(result[1] ?? 0),
            lastDustCollectedAt: BigInt(result[2] ?? 0),
            lastEggLaidAt: BigInt(result[3] ?? 0),
          };
        } else {
          info = {
            rarity: Number(result.rarity ?? 0),
            mintedAt: BigInt(result.mintedAt ?? 0),
            lastDustCollectedAt: BigInt(result.lastDustCollectedAt ?? 0),
            lastEggLaidAt: BigInt(result.lastEggLaidAt ?? 0),
          };
        }

        // Cache the info for this fish
        previousFishInfoRef.current.set(tokenIdNum, info);
      } else {
        // Use cached info if available, otherwise use defaults
        const cachedInfo = previousFishInfoRef.current.get(tokenIdNum);
        if (cachedInfo) {
          info = cachedInfo;
        } else {
          info = {
            rarity: 0,
            mintedAt: BigInt(0),
            lastDustCollectedAt: BigInt(0),
            lastEggLaidAt: BigInt(0),
          };
        }
      }

      const pendingDust =
        dustResult?.status === "success" && dustResult.result
          ? Number(dustResult.result as bigint)
          : 0;

      const timeResultValue = timeResult?.result;
      const hasTimeResult =
        timeResultValue !== undefined && timeResultValue !== null;

      let timeUntilNextEgg: number;
      if (hasTimeResult) {
        timeUntilNextEgg = Number(timeResultValue as bigint);
        previousTimeValuesRef.current.set(tokenIdNum, timeUntilNextEgg);
      } else {
        timeUntilNextEgg = previousTimeValuesRef.current.get(tokenIdNum) ?? 0;
      }

      return {
        tokenId: tokenIdNum,
        info,
        pendingDust,
        timeUntilNextEgg,
        isInfoLoaded,
        isActive,
      };
    });
  }, [fishIdsArray, fishDataResults, activeFishCount]);

  const refetch = () => {
    // Handled by wagmi automatically
  };

  // Listen for transaction success events
  useEffect(() => {
    const handleTransactionSuccess = (event: Event) => {
      const customEvent = event as CustomEvent;
      const type = customEvent.detail?.type;

      if (
        [
          "lay_egg",
          "hatch_egg",
          "merge_fish",
          "burn_fish",
          "collect_dust",
        ].includes(type)
      ) {
        queryClient.invalidateQueries({
          queryKey: ["readContract"],
          exact: false,
        });
        fishLoadingStartRef.current.clear();
        // Clear fish info cache on transactions that modify fish
        if (["hatch_egg", "merge_fish", "burn_fish"].includes(type)) {
          previousFishInfoRef.current.clear();
        }
      }
    };

    window.addEventListener("transaction:success", handleTransactionSuccess);
    return () =>
      window.removeEventListener(
        "transaction:success",
        handleTransactionSuccess,
      );
  }, [queryClient]);

  // Clean up old fish loading timers
  useEffect(() => {
    const currentFishIds = new Set(fishIdsArray.map((id) => Number(id)));
    const timerKeys = Array.from(fishLoadingStartRef.current.keys());

    timerKeys.forEach((key) => {
      if (!currentFishIds.has(key)) {
        fishLoadingStartRef.current.delete(key);
      }
    });
  }, [fishIdsArray]);

  // Reset loading timers and cache when wallet address changes
  useEffect(() => {
    fishLoadingStartRef.current.clear();
    previousTimeValuesRef.current.clear();
    previousFishInfoRef.current.clear();
  }, [address]);

  return {
    fish,
    fishCount: fishIdsArray.length,
    totalPendingDust: totalPendingDust ? Number(totalPendingDust as bigint) : 0,
    isLoading: isLoadingIds || isLoadingData,
    refetch,
    refetchInfo: refetch,
    refetchDust: refetch,
    refetchTime: refetch,
  };
}
