"use client";

import { useMemo, useRef, useEffect } from "react";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { base } from "wagmi/chains";
import { keepPreviousData, useQueryClient } from "@tanstack/react-query";
import { fishNftAbi, FISH_NFT_ADDRESS, type FishInfo } from "@/contracts/fishNft";
import { fryReefAbi, FRYREEF_ADDRESS } from "@/contracts/fryReef";

export interface FishWithInfo {
  tokenId: number;
  info: FishInfo;
  pendingDust: number;
  timeUntilNextEgg: number;
  isInfoLoaded: boolean;
}

export function useFish() {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  // Store previous timeUntilNextEgg values to prevent flickering during refetch
  const previousTimeValuesRef = useRef<Map<number, number>>(new Map());
  // Track when each fish started loading - if it takes too long, show it anyway
  const fishLoadingStartRef = useRef<Map<number, number>>(new Map());
  const LOADING_TIMEOUT = 8000; // 8 seconds - if fish doesn't load, show it anyway

  const contractAddress = FISH_NFT_ADDRESS
    ? (FISH_NFT_ADDRESS as `0x${string}`)
    : undefined;

  const fryReefAddress = FRYREEF_ADDRESS
    ? (FRYREEF_ADDRESS as `0x${string}`)
    : undefined;

  // Get fish IDs owned by user (auto-refresh every 30s as fallback)
  const {
    data: fishIds,
    isLoading: isLoadingIds,
    refetch: refetchIds,
  } = useReadContract({
    address: contractAddress,
    abi: fishNftAbi,
    functionName: "getFishByOwner",
    args: address ? [address] : undefined,
    chainId: base.id,
    query: {
      enabled: !!address && !!contractAddress,
      refetchInterval: 30000, // Fallback - explicit refetch after transactions is primary
      placeholderData: keepPreviousData,
    },
  });

  // Get total pending spawn dust for user (auto-refresh every 60s)
  const {
    data: totalPendingDust,
    isLoading: isLoadingPendingDust,
    refetch: refetchPendingDust,
  } = useReadContract({
    address: fryReefAddress,
    abi: fryReefAbi,
    functionName: "getPendingSpawnDust",
    args: address ? [address] : undefined,
    chainId: base.id,
    query: {
      enabled: !!address && !!fryReefAddress,
      refetchInterval: 60000,
      placeholderData: keepPreviousData,
    },
  });

  // Get info for each fish
  const fishIdsArray = (fishIds as bigint[]) || [];

  const fishInfoContracts = fishIdsArray.map((id) => ({
    address: contractAddress!,
    abi: fishNftAbi,
    functionName: "getFishInfo" as const,
    args: [id] as const,
    chainId: base.id,
  }));

  const pendingDustContracts = fishIdsArray.map((id) => ({
    address: contractAddress!,
    abi: fishNftAbi,
    functionName: "getPendingDustForFish" as const,
    args: [id] as const,
    chainId: base.id,
  }));

  const timeUntilNextEggContracts = fishIdsArray.map((id) => ({
    address: fryReefAddress!,
    abi: fryReefAbi,
    functionName: "getTimeUntilNextEgg" as const,
    args: [id] as const,
    chainId: base.id,
  }));

  const {
    data: fishInfoResults,
    isLoading: isLoadingInfo,
    refetch: refetchInfo,
  } = useReadContracts({
    contracts: fishInfoContracts,
    query: {
      enabled: fishIdsArray.length > 0 && !!contractAddress,
      placeholderData: keepPreviousData,
    },
  });

  // Get pending dust per fish (only refetch after transactions)
  const {
    data: pendingDustResults,
    isLoading: isLoadingDust,
    refetch: refetchDust,
  } = useReadContracts({
    contracts: pendingDustContracts,
    query: {
      enabled: fishIdsArray.length > 0 && !!contractAddress,
      placeholderData: keepPreviousData,
    },
  });

  // Get time until next egg per fish (poll every 10s for timer)
  const {
    data: timeUntilNextEggResults,
    isLoading: isLoadingTime,
    refetch: refetchTime,
  } = useReadContracts({
    contracts: timeUntilNextEggContracts,
    query: {
      enabled: fishIdsArray.length > 0 && !!fryReefAddress,
      refetchInterval: 10000, // Only for timer - 10 seconds
      placeholderData: keepPreviousData,
    },
  });

  // Combine data
  const fish: FishWithInfo[] = fishIdsArray.map((id, index) => {
    const infoResult = fishInfoResults?.[index];
    const dustResult = pendingDustResults?.[index];
    const timeResult = timeUntilNextEggResults?.[index];

    const tokenIdNum = Number(id);
    const now = Date.now();
    
    // Track when this fish started loading
    if (!fishLoadingStartRef.current.has(tokenIdNum)) {
      fishLoadingStartRef.current.set(tokenIdNum, now);
    }
    const loadingStartTime = fishLoadingStartRef.current.get(tokenIdNum) || now;
    const hasBeenLoadingTooLong = now - loadingStartTime > LOADING_TIMEOUT;

    // Check if info was successfully loaded OR if loading has taken too long (then show anyway)
    const isInfoLoaded = (infoResult?.status === "success" && infoResult?.result !== undefined) || hasBeenLoadingTooLong;

    // Extract FishInfo from result
    let info: FishInfo;
    if (infoResult?.result) {
      const result = infoResult.result as {
        rarity?: number;
        mintedAt?: bigint;
        lastDustCollectedAt?: bigint;
        lastEggLaidAt?: bigint;
      } | [number, bigint, bigint, bigint];

      if (Array.isArray(result)) {
        // Tuple format: [rarity, mintedAt, lastDustCollectedAt, lastEggLaidAt]
        info = {
          rarity: Number(result[0] ?? 0),
          mintedAt: BigInt(result[1] ?? 0),
          lastDustCollectedAt: BigInt(result[2] ?? 0),
          lastEggLaidAt: BigInt(result[3] ?? 0),
        };
      } else {
        // Object format
        info = {
          rarity: Number(result.rarity ?? 0),
          mintedAt: BigInt(result.mintedAt ?? 0),
          lastDustCollectedAt: BigInt(result.lastDustCollectedAt ?? 0),
          lastEggLaidAt: BigInt(result.lastEggLaidAt ?? 0),
        };
      }
    } else {
      info = {
        rarity: 0,
        mintedAt: BigInt(0),
        lastDustCollectedAt: BigInt(0),
        lastEggLaidAt: BigInt(0),
      };
    }

    const pendingDust = dustResult?.status === "success" && dustResult.result
      ? Number(dustResult.result as bigint)
      : 0;

    // Get timeUntilNextEgg, using previous value if current data is still loading
    // This prevents flickering when data is refetching
    
    // Check if we have valid result data
    const timeResultValue = timeResult?.result;
    const hasTimeResult = timeResultValue !== undefined && timeResultValue !== null;
    
    let timeUntilNextEgg: number;
    if (hasTimeResult) {
      timeUntilNextEgg = Number(timeResultValue as bigint);
      previousTimeValuesRef.current.set(tokenIdNum, timeUntilNextEgg);
    } else {
      // No data available, use previous value if exists, otherwise 0
      timeUntilNextEgg = previousTimeValuesRef.current.get(tokenIdNum) ?? 0;
    }

    return {
      tokenId: tokenIdNum,
      info,
      pendingDust,
      timeUntilNextEgg,
      isInfoLoaded,
    };
  });

  const refetch = () => {
    refetchIds();
    refetchPendingDust();
    refetchInfo();
    refetchDust();
    refetchTime();
  };

  // Listen for invalidation signals from transactions
  useEffect(() => {
    const handleInvalidation = () => {
      // Invalidate only fish-related queries, not all queries
      queryClient.invalidateQueries({
        queryKey: ["readContract"],
        exact: false,
      });
      // Reset loading timers when data is invalidated
      fishLoadingStartRef.current.clear();
      // Force immediate refetch of critical data
      refetchInfo();
      refetchDust();
      refetchTime();
    };

    const handleTransactionSuccess = (event: Event) => {
      const customEvent = event as CustomEvent;
      const type = customEvent.detail?.type;
      
      // Re-fetch if transaction affected fish
      if (["lay_egg", "hatch_egg", "merge_fish", "burn_fish", "collect_dust"].includes(type)) {
        handleInvalidation();
      }
    };

    window.addEventListener("fish:invalidate", handleInvalidation);
    window.addEventListener("transaction:success", handleTransactionSuccess);
    
    return () => {
      window.removeEventListener("fish:invalidate", handleInvalidation);
      window.removeEventListener("transaction:success", handleTransactionSuccess);
    };
  }, [queryClient, refetchInfo, refetchDust, refetchTime]);

  // Clean up old fish loading timers (remove fish that no longer exist)
  useEffect(() => {
    const currentFishIds = new Set(fishIdsArray.map(id => Number(id)));
    const timerKeys = Array.from(fishLoadingStartRef.current.keys());
    
    timerKeys.forEach(key => {
      if (!currentFishIds.has(key)) {
        fishLoadingStartRef.current.delete(key);
      }
    });
  }, [fishIdsArray]);

  // Reset loading timers and cache when wallet address changes
  useEffect(() => {
    fishLoadingStartRef.current.clear();
    previousTimeValuesRef.current.clear();
  }, [address]);

  // Aggressively refetch on component mount and when address changes for instant data
  useEffect(() => {
    if (!address) return;
    
    const timer = setTimeout(() => {
      refetchIds();
      refetchInfo();
      refetchDust();
      refetchPendingDust();
      refetchTime();
    }, 50);  // Faster - 50ms instead of 100ms
    
    return () => clearTimeout(timer);
  }, [address, refetchIds, refetchInfo, refetchDust, refetchPendingDust, refetchTime]);

  return {
    fish,
    fishCount: fishIdsArray.length,
    totalPendingDust: totalPendingDust ? Number(totalPendingDust as bigint) : 0,
    isLoading: isLoadingIds || isLoadingInfo || isLoadingDust || isLoadingPendingDust || isLoadingTime,
    refetch,
    // Export individual refetch functions for transaction sync
    refetchInfo,
    refetchDust,
    refetchTime,
  };
}
